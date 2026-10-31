"""Share new blog guides on social media through Postiz.

Each language version of a guide becomes its own post on every channel in
CHANNELS. Guides are spread over days: the first guide goes out on the
next day, the second the day after, and so on; language versions of the
same guide are a couple of hours apart.

usage:
  share_postiz.py --since <git sha>         guides added since that commit (CI)
  share_postiz.py <lang>/<slug>.html ...    these pages (manual run)
  add --dry-run to print the posts without sending anything

Needs POSTIZ_URL and POSTIZ_API_KEY in the environment. Without them it
prints a notice and exits 0, so the workflow never fails on a fork.
Standard library only.
"""
import argparse, datetime as dt, html, json, os, re, subprocess, sys, urllib.request, uuid

sys.stdout.reconfigure(encoding="utf-8")

SITE = "https://cambridgelearn.com"
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Postiz channels (the account also holds other companies' channels).
CHANNELS = [
    {"id": "cmvkrv75n0003s38ta0l4pbzz", "type": "facebook"},
    {"id": "cmvjxieus0001ql17w9pl4xo3", "type": "linkedin-page"},
    {"id": "cmvkrs4h60001s38tovx108ps", "type": "instagram-standalone"},
    {"id": "cmvkso4ze0001rt8ov9z9t8oh", "type": "threads"},
]

FIRST_HOUR_UTC = 9      # first language version of a guide
HOURS_BETWEEN_LANGS = 2

# Instagram links are not clickable; the caption points to the site instead.
SEE = {
    "en": "Read the full guide at cambridgelearn.com",
    "es": "Lee la guía completa en cambridgelearn.com",
    "it": "Leggi la guida completa su cambridgelearn.com",
    "de": "Den ganzen Ratgeber lesen Sie auf cambridgelearn.com",
    "tr": "Rehberin tamamı cambridgelearn.com'da",
    "fr": "Lisez le guide complet sur cambridgelearn.com",
    "pt": "Leia o guia completo em cambridgelearn.com",
}
TAGS = {
    "en": "#summerschool #learnenglish #studyinuk #englishcourse",
    "es": "#cursosdeverano #aprenderingles #inglaterra #campamentodeverano",
    "it": "#vacanzastudio #scuolaestiva #inglese #inghilterra",
    "de": "#sprachreise #englischlernen #sommercamp #england",
    "tr": "#yazokulu #ingilizce #ingiltere #dilokulu",
    "fr": "#séjourlinguistique #anglais #angleterre #écoledété",
    "pt": "#cursodeverão #inglês #inglaterra #intercâmbio",
}


def log(*a):
    print(*a, flush=True)


def guide_files_since(sha):
    out = subprocess.run(["git", "diff", "--name-only", "--diff-filter=A", sha, "HEAD"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return [p for p in out.split() if re.fullmatch(r"[a-z-]+/blog-[a-z0-9-]+\.html", p)]


def meta(path):
    s = open(os.path.join(ROOT, path), encoding="utf-8").read()
    lang, file = path.split("/")
    slug = file[:-5]

    def grab(rx):
        m = re.search(rx, s, re.S)
        return html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip() if m else ""

    social = os.path.join(ROOT, "assets", "social", slug + ".jpg")
    og = grab(r'<meta property="og:image" content="[^"]*/assets/photos/([^"]+)"')
    image = social if os.path.exists(social) else (os.path.join(ROOT, "assets", "photos", og) if og else None)
    return {"lang": lang, "slug": slug, "url": f"{SITE}/{lang}/{file}",
            "title": grab(r'<h1[^>]*>(.*?)</h1>'),
            "summary": grab(r'<meta name="description" content="([^"]*)"'),
            "image": image, "square": os.path.exists(social)}


def fit(s, n):
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"


def caption(m, channel):
    tags = TAGS.get(m["lang"], TAGS["en"])
    if channel == "instagram-standalone":
        return f'{m["title"]}\n\n{m["summary"]}\n\n{SEE.get(m["lang"], SEE["en"])}\n\n{tags}'
    if channel == "threads":
        return fit(f'{m["title"]}\n\n{m["summary"]}', 500 - len(m["url"]) - 2) + "\n\n" + m["url"]
    return f'{m["title"]}\n\n{m["summary"]}\n\n{m["url"]}\n\n{tags}'


def settings(channel):
    if channel == "instagram-standalone":
        return {"__type": channel, "post_type": "post"}
    return {"__type": channel}


def api(method, path, body=None, raw=None, ctype="application/json"):
    req = urllib.request.Request(os.environ["POSTIZ_URL"].rstrip("/") + "/api/public/v1" + path, method=method,
                                 data=raw if raw is not None else (json.dumps(body).encode() if body is not None else None),
                                 headers={"Authorization": os.environ["POSTIZ_API_KEY"], "Content-Type": ctype})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read() or b"null")


def upload(file):
    boundary = uuid.uuid4().hex
    data = open(file, "rb").read()
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{os.path.basename(file)}"\r\n'
            f"Content-Type: image/jpeg\r\n\r\n").encode() + data + f"\r\n--{boundary}--\r\n".encode()
    r = api("POST", "/upload", raw=body, ctype=f"multipart/form-data; boundary={boundary}")
    if not r or not r.get("id") or not r.get("path"):
        raise RuntimeError(f"upload failed: {r}")
    return {"id": r["id"], "path": r["path"]}


def schedule(pages, start=None):
    """[(when, meta)]: guide k on day k+1, language versions HOURS_BETWEEN_LANGS apart."""
    start = start or dt.datetime.now(dt.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    order, by_slug = [], {}
    for m in pages:
        if m["slug"] not in by_slug:
            order.append(m["slug"])
        by_slug.setdefault(m["slug"], []).append(m)
    plan = []
    for day, slug in enumerate(order, start=1):
        langs = sorted(by_slug[slug], key=lambda m: (m["lang"] != "en", m["lang"]))
        for i, m in enumerate(langs):
            plan.append((start + dt.timedelta(days=day, hours=FIRST_HOUR_UTC + i * HOURS_BETWEEN_LANGS), m))
    return plan


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*")
    ap.add_argument("--since")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--check", action="store_true", help="only confirm the API key works and the channels exist")
    a = ap.parse_args()

    if a.check:
        if not (os.environ.get("POSTIZ_URL") and os.environ.get("POSTIZ_API_KEY")):
            log("FAIL: POSTIZ_URL / POSTIZ_API_KEY not set")
            sys.exit(1)
        found = {i["id"]: i for i in api("GET", "/integrations")}
        missing = [c["type"] for c in CHANNELS if c["id"] not in found or found[c["id"]].get("disabled")]
        for c in CHANNELS:
            log(("ok   " if c["type"] not in missing else "MISSING ") + c["type"])
        sys.exit(1 if missing else 0)

    files = a.files or (guide_files_since(a.since) if a.since else [])
    if not files:
        log("No new guides to share.")
        return
    if not a.dry_run and not (os.environ.get("POSTIZ_URL") and os.environ.get("POSTIZ_API_KEY")):
        log("POSTIZ_URL / POSTIZ_API_KEY not set; skipping:", ", ".join(files))
        return

    failures = 0
    for when, m in schedule([meta(f) for f in files]):
        date = when.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        media = None
        for ch in CHANNELS:
            if ch["type"] == "instagram-standalone" and not m["square"]:
                log(f"skip instagram for {m['lang']}/{m['slug']}: no assets/social/{m['slug']}.jpg")
                continue
            text = caption(m, ch["type"])
            if a.dry_run:
                log(f"--- {date} {ch['type']} {m['lang']}/{m['slug']}\n{text}\n[image: {m['image']}]")
                continue
            try:
                if media is None and m["image"]:
                    media = upload(m["image"])
                body = {"type": "schedule", "date": date, "shortLink": False, "tags": [],
                        "posts": [{"integration": {"id": ch["id"]},
                                   "value": [{"content": text, "image": [media] if media else []}],
                                   "settings": settings(ch["type"])}]}
                r = api("POST", "/posts", body)
                ok = isinstance(r, list) and r and r[0].get("postId")
                log(("ok   " if ok else "FAIL ") + f"{date} {ch['type']:<21} {m['lang']}/{m['slug']}" + ("" if ok else f" {r}"))
                failures += 0 if ok else 1
            except Exception as e:  # keep going with the other channels
                failures += 1
                log(f"FAIL {date} {ch['type']:<21} {m['lang']}/{m['slug']} {e}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
