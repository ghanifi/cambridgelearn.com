"""Plan a batch of evergreen social posts from the site's pages.

Picks N (page, language) pairs: languages at random but every language at
least floor(N / 21) times, pages spread as evenly as possible, never the
same page on two consecutive days. One pair per day from --start, posted
at a mid-morning hour for that language's audience (HOUR_UTC), on every
channel in share_postiz.CHANNELS.

usage: plan_postiz.py --count 50 --start 2026-11-05 [--seed 7] [--dry-run]
"""
import argparse, datetime as dt, os, random, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import share_postiz as sp  # noqa: E402

LANGS = ["en", "tr", "it", "es", "fr", "pt", "de", "cs", "pl", "ro", "ru", "uk", "nl", "el",
         "ar", "he", "zh-hans", "zh-hant", "ja", "ko", "th"]
PAGES = [
    "school-bosworth-northampton", "school-bournemouth-collegiate", "school-brunel-uxbridge",
    "school-cats-cambridge", "school-guildhouse-london", "school-oakham", "school-oxford-royale",
    "school-red-star-football", "school-stafford-house-canterbury",
    "london", "cambridge", "oxford", "canterbury", "bournemouth", "oakham", "northampton",
    "general-english-summer-school", "intensive-english", "football-english", "academic-enrichment-courses",
    "accommodation", "blog-choosing-a-location", "blog-visa-guide", "blog-what-to-pack",
]


def pick(count, rng):
    langs = LANGS * (count // len(LANGS)) + rng.sample(LANGS, count % len(LANGS))
    pages = PAGES * (count // len(PAGES)) + rng.sample(PAGES, count % len(PAGES))
    for _ in range(10000):
        rng.shuffle(langs)
        rng.shuffle(pages)
        pairs = list(zip(pages, langs))
        if len(set(pairs)) == len(pairs) and all(pages[i] != pages[i + 1] for i in range(len(pages) - 1)):
            return pairs
    raise RuntimeError("could not satisfy the constraints")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=50)
    ap.add_argument("--start", required=True, help="first day, YYYY-MM-DD (UTC)")
    ap.add_argument("--seed", type=int)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--from", dest="first", type=int, default=0, help="skip the first N days of the plan (resume)")
    a = ap.parse_args()

    seed = a.seed if a.seed is not None else random.SystemRandom().randrange(10 ** 6)
    sp.log(f"seed {seed}")
    rng = random.Random(seed)
    day0 = dt.datetime.strptime(a.start, "%Y-%m-%d").replace(tzinfo=dt.timezone.utc)
    plan = []
    for i, (slug, lang) in enumerate(pick(a.count, rng)):
        path = f"{lang}/{slug}.html"
        if not os.path.exists(os.path.join(sp.ROOT, path)):
            raise SystemExit(f"missing page {path}")
        plan.append((day0 + dt.timedelta(days=i, hours=sp.HOUR_UTC[lang]), sp.meta(path)))
    plan = plan[a.first:]
    for when, m in plan:
        sp.log(f"{when:%Y-%m-%d %H:%M}Z  {m['lang']:<8} {m['slug']:<34} {m['title'][:60]}")
    if a.dry_run:
        return
    if not (os.environ.get("POSTIZ_URL") and os.environ.get("POSTIZ_API_KEY")):
        raise SystemExit("POSTIZ_URL / POSTIZ_API_KEY not set")
    sys.exit(1 if sp.send(plan) else 0)


if __name__ == "__main__":
    main()
