# Cambridge Learn — Phase 1 English Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared CSS/JS/asset foundation and the fully working English (`en/`) homepage and schools-listing page for the Cambridge Learn static site, as the validated template the other 20 languages get replicated from in a follow-up plan.

**Architecture:** Pure static HTML/CSS + minimal vanilla JS, no build step, no Node, no i18n runtime lookups. Shared `css/`, `js/`, and `assets/` files are referenced identically from every future language folder via relative paths (`../css/main.css`, etc.); every page is self-contained, hand-authored HTML.

**Tech Stack:** HTML5, plain CSS3 (custom properties, no preprocessor), vanilla ES5-safe JS (no framework, no bundler). Google Fonts (Playfair Display, Inter) via `<link>`. JSON-LD for schema.org.

**Spec:** `docs/superpowers/specs/2026-09-24-cambridge-learn-static-site-design.md`

## Global Constraints

- No Node.js, no build tooling, no i18n JSON dictionaries — every HTML file is a real, hand-authored static file.
- No JS framework or external JS dependency — vanilla JS only.
- Palette/typography: CSS custom properties for navy/gold/cream palette; Playfair Display for headings, Inter for body (per spec "Design system").
- Every page includes: semantic HTML5 landmarks, ARIA labels on interactive controls, `hreflang` alternate block listing all 21 languages + `x-default`, and the four-location + email contact footer verbatim from the spec.
- Logo: inline-referenced SVG placeholder (shield outline, no lion artwork) at `assets/logo.svg`.
- School listing content is placeholder data, clearly labeled "Sample School — ...".

---

## File Structure

```
/static-site
  /css/main.css          — design tokens + all shared component styles
  /css/rtl.css            — RTL overrides (not wired into en/ pages; used when ar/he are built later)
  /js/app.js               — mobile nav toggle + language-switcher dropdown toggle
  /js/school-filter.js     — pure-function filter logic (matchesFilters) + DOM wiring
  /js/blog-feed.js         — WP REST API fetch + render + graceful failure
  /assets/logo.svg         — placeholder crest
  /en/index.html           — homepage
  /en/schools.html         — schools listing/filter page
  /test/school-filter.test.html — browser-based assertions for school-filter.js (no Node/framework)
```

**Interfaces between files:**
- `main.css` defines the custom properties and classes (`.site-header`, `.hero`, `.card-grid`, `.filter-bar`, `.school-card`, `.blog-feed__list`, `.footer-grid`, etc.) that both HTML pages and `rtl.css` depend on by exact class name.
- `app.js` depends on markup contract: `.site-header[data-nav-open]`, `.nav-toggle`, `.lang-switcher[data-open]`, `.lang-switcher__toggle`.
- `school-filter.js` depends on markup contract: `[data-school-filter-form]`, `[data-school-grid]`, `.school-card` elements carrying `data-location`, `data-type`, `data-features` (comma-separated), checkboxes carrying `data-filter-group="location|type|features"`, and `[data-filter-empty]`.
- `school-filter.js` exposes `window.CambridgeLearnFilter = { matchesFilters(card, active), readActiveFilters(form), applyFilters(form, cards, emptyMessageEl) }` — `matchesFilters` is pure (no DOM mutation) and is what `test/school-filter.test.html` calls directly.
- `blog-feed.js` depends on markup contract: `[data-blog-feed]` section containing `[data-blog-feed-list]`, and exposes `window.CambridgeLearnBlogFeed = { getThumbnail(post), stripHtml(html), renderPosts(posts, listEl) }`.

---

### Task 1: Shared design tokens and component CSS

**Files:**
- Create: `static-site/css/main.css`
- Create: `static-site/css/rtl.css`

**Interfaces:**
- Produces: CSS custom properties (`--color-navy`, `--color-navy-dark`, `--color-gold`, `--color-gold-light`, `--color-cream`, `--color-white`, `--color-text`, `--color-text-muted`, `--color-border`, `--font-heading`, `--font-body`, `--max-width`, `--radius`, `--logo-size`, `--space-1..5`) and component classes listed in File Structure above, consumed by Tasks 5 and 6.

- [ ] **Step 1: Write `static-site/css/main.css`**

Full content (design tokens, reset, header/nav, language switcher, hero, sections/cards, filter bar, school cards, blog feed grid, footer, responsive breakpoint):

```css
/* Cambridge Learn — shared design system. Plain CSS, no preprocessor. */

:root {
  --color-navy: #0f2a4a;
  --color-navy-dark: #081a30;
  --color-gold: #b8933d;
  --color-gold-light: #d9b86a;
  --color-cream: #faf7f0;
  --color-white: #ffffff;
  --color-text: #1c2b3a;
  --color-text-muted: #4a5b6e;
  --color-border: #dcd4c3;

  --font-heading: "Playfair Display", Georgia, "Times New Roman", serif;
  --font-body: "Inter", -apple-system, "Segoe UI", Roboto, sans-serif;

  --max-width: 1180px;
  --radius: 6px;
  --logo-size: 56px;
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2.5rem;
  --space-5: 4rem;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-body); color: var(--color-text); background: var(--color-white); line-height: 1.6; }
img { max-width: 100%; display: block; }
a { color: var(--color-navy); }
a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--color-gold); outline-offset: 2px; }
h1, h2, h3, h4 { font-family: var(--font-heading); color: var(--color-navy); line-height: 1.2; margin: 0 0 var(--space-2); }
h1 { font-size: 2.6rem; }
h2 { font-size: 1.9rem; }
h3 { font-size: 1.3rem; }
p { margin: 0 0 var(--space-2); }
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--space-3); }

.site-header { background: var(--color-navy); color: var(--color-white); border-bottom: 3px solid var(--color-gold); }
.site-header .container { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding-top: var(--space-2); padding-bottom: var(--space-2); }
.brand { display: flex; align-items: center; gap: var(--space-2); color: var(--color-white); text-decoration: none; }
.brand__logo { width: var(--logo-size); height: var(--logo-size); flex-shrink: 0; }
.brand__name { font-family: var(--font-heading); font-size: 1.3rem; line-height: 1.1; }
.main-nav { display: flex; align-items: center; gap: var(--space-4); }
.main-nav__list { list-style: none; display: flex; gap: var(--space-3); margin: 0; padding: 0; }
.main-nav__list a { color: var(--color-white); text-decoration: none; font-weight: 500; padding: var(--space-1) 0; border-bottom: 2px solid transparent; }
.main-nav__list a:hover, .main-nav__list a[aria-current="page"] { border-bottom-color: var(--color-gold); }
.nav-toggle { display: none; background: none; border: 1px solid var(--color-white); color: var(--color-white); border-radius: var(--radius); padding: var(--space-1) var(--space-2); cursor: pointer; }

.lang-switcher { position: relative; }
.lang-switcher__toggle { background: transparent; border: 1px solid var(--color-gold); color: var(--color-white); border-radius: var(--radius); padding: 0.35rem var(--space-2); cursor: pointer; font-size: 0.9rem; }
.lang-switcher__list { list-style: none; margin: 0; padding: var(--space-1); position: absolute; right: 0; top: calc(100% + 6px); background: var(--color-white); color: var(--color-text); border-radius: var(--radius); box-shadow: 0 8px 24px rgba(8, 26, 48, 0.25); max-height: 320px; overflow-y: auto; min-width: 180px; display: none; z-index: 20; }
.lang-switcher[data-open="true"] .lang-switcher__list { display: block; }
.lang-switcher__list a { display: block; padding: var(--space-1) var(--space-2); text-decoration: none; color: var(--color-text); border-radius: var(--radius); }
.lang-switcher__list a:hover { background: var(--color-cream); }

.hero { background: linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-dark) 100%); color: var(--color-white); padding: var(--space-5) 0; text-align: center; }
.hero h1 { color: var(--color-white); }
.hero p { color: #cfd9e6; max-width: 640px; margin-left: auto; margin-right: auto; }
.button { display: inline-block; background: var(--color-gold); color: var(--color-navy-dark); font-weight: 700; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: var(--radius); margin-top: var(--space-2); }
.button:hover { background: var(--color-gold-light); }
.button--outline { background: transparent; border: 2px solid var(--color-white); color: var(--color-white); }

.section { padding: var(--space-5) 0; }
.section--cream { background: var(--color-cream); }
.section__intro { max-width: 720px; margin: 0 auto var(--space-4); text-align: center; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); }
.card { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius); padding: var(--space-3); }
.card h3 { margin-top: 0; }

.filter-bar { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4); padding: var(--space-3); background: var(--color-cream); border-radius: var(--radius); }
.filter-group legend { font-weight: 700; color: var(--color-navy); margin-bottom: var(--space-1); padding: 0; }
.filter-group { border: none; margin: 0; padding: 0; }
.filter-group__options { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.filter-group__options label { display: inline-flex; align-items: center; gap: 0.35rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: 999px; padding: 0.35rem 0.85rem; cursor: pointer; }
.school-card[hidden] { display: none; }
.school-card__meta { color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: var(--space-1); }
.filter-empty { text-align: center; color: var(--color-text-muted); padding: var(--space-4) 0; }
.filter-empty[hidden] { display: none; }

.blog-feed__list { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
.blog-feed__list img { border-radius: var(--radius) var(--radius) 0 0; aspect-ratio: 16 / 9; object-fit: cover; }
.blog-feed__card { border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden; background: var(--color-white); }
.blog-feed__card-body { padding: var(--space-2); }
.blog-feed__empty { color: var(--color-text-muted); text-align: center; }

.site-footer { background: var(--color-navy-dark); color: #cfd9e6; padding: var(--space-5) 0 var(--space-3); }
.footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4); }
.footer-grid h3 { color: var(--color-gold-light); font-size: 1.05rem; }
.footer-location address { font-style: normal; color: #cfd9e6; }
.footer-location a { color: var(--color-gold-light); }
.site-footer .footer-bottom { border-top: 1px solid rgba(255, 255, 255, 0.15); padding-top: var(--space-3); text-align: center; font-size: 0.85rem; color: #9fb0c2; }

@media (max-width: 820px) {
  .main-nav { position: absolute; top: 100%; left: 0; right: 0; background: var(--color-navy); flex-direction: column; align-items: stretch; padding: var(--space-2); display: none; }
  .site-header { position: relative; }
  .site-header[data-nav-open="true"] .main-nav { display: flex; }
  .main-nav__list { flex-direction: column; gap: 0; }
  .nav-toggle { display: inline-block; }
  h1 { font-size: 2rem; }
}
```

- [ ] **Step 2: Write `static-site/css/rtl.css`**

```css
/* Cambridge Learn — RTL overrides. Loaded only on ar/ and he/ pages, after main.css. */

[dir="rtl"] { text-align: right; }
[dir="rtl"] .site-header .container { flex-direction: row-reverse; }
[dir="rtl"] .brand { flex-direction: row-reverse; }
[dir="rtl"] .main-nav { flex-direction: row-reverse; }
[dir="rtl"] .main-nav__list { flex-direction: row-reverse; }
[dir="rtl"] .lang-switcher__list { right: auto; left: 0; }
[dir="rtl"] .lang-switcher__list a { text-align: right; }
[dir="rtl"] .filter-group__options { flex-direction: row-reverse; }
[dir="rtl"] .filter-group__options label { flex-direction: row-reverse; }
[dir="rtl"] .footer-grid { direction: rtl; }

@media (max-width: 820px) {
  [dir="rtl"] .main-nav { left: auto; right: 0; }
}
```

- [ ] **Step 3: Verify (no Node available — visual/manual check)**

Open `static-site/en/index.html` (created in Task 5) in a browser once it exists and confirm: navy header with gold border renders, Playfair Display font loads for headings, hero gradient background shows, card grid lays out responsively when the window is narrowed below ~820px (nav collapses behind the "Menu" toggle).

- [ ] **Step 4: Commit**

```bash
git add static-site/css/main.css static-site/css/rtl.css
git commit -m "Add shared design tokens and component CSS"
```

---

### Task 2: Shared JS — nav toggle and language switcher

**Files:**
- Create: `static-site/js/app.js`

**Interfaces:**
- Consumes: markup contract from Task 1's CSS classes (`.site-header[data-nav-open]`, `.nav-toggle`, `.lang-switcher[data-open]`, `.lang-switcher__toggle`) — produced by Task 5/6 HTML.
- Produces: click-to-toggle behavior; no exported API (this module has no pure logic worth unit testing — DOM toggling verified manually).

- [ ] **Step 1: Write `static-site/js/app.js`**

```javascript
// Cambridge Learn — shared site behavior: mobile nav toggle + language switcher.
// Plain vanilla JS, no dependencies.
(function () {
  "use strict";

  function initNavToggle() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (!header || !toggle) return;

    toggle.addEventListener("click", function () {
      var isOpen = header.getAttribute("data-nav-open") === "true";
      header.setAttribute("data-nav-open", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  function initLangSwitcher() {
    var switcher = document.querySelector(".lang-switcher");
    if (!switcher) return;
    var toggle = switcher.querySelector(".lang-switcher__toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = switcher.getAttribute("data-open") === "true";
      switcher.setAttribute("data-open", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

    document.addEventListener("click", function (event) {
      if (!switcher.contains(event.target)) {
        switcher.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        switcher.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initLangSwitcher();
  });
})();
```

- [ ] **Step 2: Verify manually**

Once wired into `en/index.html` (Task 5): click "Menu" at narrow width, confirm nav shows/hides and `aria-expanded` toggles; click the language switcher button, confirm the dropdown list opens, closes on outside click, and closes on Escape.

- [ ] **Step 3: Commit**

```bash
git add static-site/js/app.js
git commit -m "Add shared nav toggle and language switcher behavior"
```

---

### Task 3: School filter logic (with browser-based unit tests)

**Files:**
- Create: `static-site/js/school-filter.js`
- Create: `static-site/test/school-filter.test.html`

**Interfaces:**
- Produces: `window.CambridgeLearnFilter = { matchesFilters(card, active), readActiveFilters(form), applyFilters(form, cards, emptyMessageEl) }`, where `active` is `{ location: Set<string>, type: Set<string>, features: Set<string> }`.
- Consumes (from Task 6 HTML): `[data-school-filter-form]`, `[data-school-grid]`, `.school-card[data-location][data-type][data-features]`, checkboxes with `data-filter-group="location|type|features"`, `[data-filter-empty]`.

No Node/npm is used for testing (per project constraint) — `test/school-filter.test.html` is a plain HTML page that loads the script via a `<script src="../js/school-filter.js">` tag and runs assertions against `window.CambridgeLearnFilter.matchesFilters` directly in-browser, printing PASS/FAIL to the page and console.

- [ ] **Step 1: Write the test harness first (fails because the script doesn't exist yet)**

`static-site/test/school-filter.test.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>school-filter.js test harness</title>
</head>
<body>
<h1>school-filter.js test harness</h1>
<p>Open this file directly in a browser. Results print below and to the console.</p>
<pre id="results"></pre>

<script src="../js/school-filter.js"></script>
<script>
(function () {
  "use strict";

  var results = [];
  function assert(name, condition) {
    results.push((condition ? "PASS" : "FAIL") + " — " + name);
  }

  function makeCard(location, type, features) {
    var el = document.createElement("div");
    el.className = "school-card";
    el.setAttribute("data-location", location);
    el.setAttribute("data-type", type);
    el.setAttribute("data-features", features);
    return el;
  }

  function emptySets() {
    return { location: new Set(), type: new Set(), features: new Set() };
  }

  var matchesFilters = window.CambridgeLearnFilter.matchesFilters;

  var card1 = makeCard("london", "summer-school", "Homestay, Excursions");
  assert("no active filters matches any card", matchesFilters(card1, emptySets()));

  var activeLondon = emptySets();
  activeLondon.location.add("london");
  assert("location filter matches same location", matchesFilters(card1, activeLondon));

  var activeOxford = emptySets();
  activeOxford.location.add("oxford");
  assert("location filter excludes different location", !matchesFilters(card1, activeOxford));

  var activeType = emptySets();
  activeType.type.add("summer-school");
  assert("type filter matches same type", matchesFilters(card1, activeType));

  var activeWrongType = emptySets();
  activeWrongType.type.add("language-course");
  assert("type filter excludes different type", !matchesFilters(card1, activeWrongType));

  var activeFeature = emptySets();
  activeFeature.features.add("Excursions");
  assert("features filter matches a card with that feature", matchesFilters(card1, activeFeature));

  var activeMissingFeature = emptySets();
  activeMissingFeature.features.add("Exam Prep");
  assert("features filter excludes a card without that feature", !matchesFilters(card1, activeMissingFeature));

  var combinedMatch = emptySets();
  combinedMatch.location.add("london");
  combinedMatch.type.add("summer-school");
  assert("combined matching filters match", matchesFilters(card1, combinedMatch));

  var combinedMismatch = emptySets();
  combinedMismatch.location.add("london");
  combinedMismatch.type.add("language-course");
  assert("combined filters require every facet to match", !matchesFilters(card1, combinedMismatch));

  var out = results.join("\n");
  document.getElementById("results").textContent = out;
  console.log(out);
  var failed = results.filter(function (r) { return r.indexOf("FAIL") === 0; });
  if (failed.length) {
    console.error(failed.length + " test(s) failed");
  } else {
    console.log("All " + results.length + " tests passed");
  }
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Confirm the harness fails**

Open `static-site/test/school-filter.test.html` in a browser (before `school-filter.js` exists). Expected: console error, page throws (`window.CambridgeLearnFilter` is undefined) — nothing prints PASS.

- [ ] **Step 3: Write `static-site/js/school-filter.js`**

```javascript
// Cambridge Learn — schools listing filter. Plain vanilla JS, no dependencies.
//
// Exposes window.CambridgeLearnFilter.matchesFilters as a pure function so it
// can be unit-tested directly from a browser test page without a bundler.
(function () {
  "use strict";

  // active: { location: Set<string>, type: Set<string>, features: Set<string> }
  // An empty Set on a facet means "no filter on this facet".
  function matchesFilters(card, active) {
    var location = card.getAttribute("data-location") || "";
    var type = card.getAttribute("data-type") || "";
    var features = (card.getAttribute("data-features") || "")
      .split(",")
      .map(function (f) { return f.trim(); })
      .filter(Boolean);

    var locationOk = active.location.size === 0 || active.location.has(location);
    var typeOk = active.type.size === 0 || active.type.has(type);
    var featuresOk =
      active.features.size === 0 ||
      features.some(function (f) { return active.features.has(f); });

    return locationOk && typeOk && featuresOk;
  }

  function readActiveFilters(form) {
    var active = { location: new Set(), type: new Set(), features: new Set() };
    var checked = form.querySelectorAll('input[type="checkbox"]:checked');
    checked.forEach(function (input) {
      var facet = input.getAttribute("data-filter-group");
      var value = input.value;
      if (facet && active[facet]) {
        active[facet].add(value);
      }
    });
    return active;
  }

  function applyFilters(form, cards, emptyMessageEl) {
    var active = readActiveFilters(form);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var visible = matchesFilters(card, active);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (emptyMessageEl) {
      emptyMessageEl.hidden = visibleCount !== 0;
    }
  }

  function init() {
    var form = document.querySelector("[data-school-filter-form]");
    var grid = document.querySelector("[data-school-grid]");
    var emptyMessageEl = document.querySelector("[data-filter-empty]");
    if (!form || !grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".school-card"));

    form.addEventListener("change", function () {
      applyFilters(form, cards, emptyMessageEl);
    });

    applyFilters(form, cards, emptyMessageEl);
  }

  document.addEventListener("DOMContentLoaded", init);

  // Exposed for the browser-based test harness (test/school-filter.test.html).
  window.CambridgeLearnFilter = {
    matchesFilters: matchesFilters,
    readActiveFilters: readActiveFilters,
    applyFilters: applyFilters
  };
})();
```

- [ ] **Step 4: Re-open the test harness and confirm all assertions pass**

Open `static-site/test/school-filter.test.html` again. Expected: page and console both show 9 `PASS` lines, no `FAIL`, console logs "All 9 tests passed".

- [ ] **Step 5: Commit**

```bash
git add static-site/js/school-filter.js static-site/test/school-filter.test.html
git commit -m "Add school filter logic with browser-based unit tests"
```

---

### Task 4: Blog feed fetch + placeholder logo asset

**Files:**
- Create: `static-site/js/blog-feed.js`
- Create: `static-site/assets/logo.svg`

**Interfaces:**
- Produces: `window.CambridgeLearnBlogFeed = { getThumbnail(post), stripHtml(html), renderPosts(posts, listEl) }`.
- Consumes (from Task 5 HTML): `[data-blog-feed]` section containing `[data-blog-feed-list]`.
- Fetches `https://blog.cambridgelearn.com/wp-json/wp/v2/posts?per_page=3&_embed` — this endpoint does not exist until the WordPress theme phase ships, so failure handling is exercised by default during this task (the real success path gets verified once that phase is live).

- [ ] **Step 1: Write `static-site/js/blog-feed.js`**

```javascript
// Cambridge Learn — homepage blog feed. Fetches latest posts from the
// WordPress REST API and renders them. Fails quietly: if the blog isn't
// reachable yet, the section is hidden rather than showing a broken layout.
(function () {
  "use strict";

  var FEED_URL = "https://blog.cambridgelearn.com/wp-json/wp/v2/posts?per_page=3&_embed";

  function getThumbnail(post) {
    try {
      var media = post._embedded["wp:featuredmedia"][0];
      return media.source_url;
    } catch (err) {
      return null;
    }
  }

  function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function renderPosts(posts, listEl) {
    listEl.innerHTML = "";

    posts.forEach(function (post) {
      var item = document.createElement("li");
      item.className = "blog-feed__card";

      var thumbnail = getThumbnail(post);
      if (thumbnail) {
        var img = document.createElement("img");
        img.src = thumbnail;
        img.alt = stripHtml(post.title.rendered);
        item.appendChild(img);
      }

      var body = document.createElement("div");
      body.className = "blog-feed__card-body";

      var heading = document.createElement("h3");
      var link = document.createElement("a");
      link.href = post.link;
      link.textContent = stripHtml(post.title.rendered);
      heading.appendChild(link);
      body.appendChild(heading);

      var excerpt = document.createElement("p");
      excerpt.textContent = stripHtml(post.excerpt.rendered);
      body.appendChild(excerpt);

      item.appendChild(body);
      listEl.appendChild(item);
    });
  }

  function showEmptyState(container) {
    container.hidden = true;
  }

  function init() {
    var section = document.querySelector("[data-blog-feed]");
    if (!section) return;
    var listEl = section.querySelector("[data-blog-feed-list]");
    if (!listEl) return;

    fetch(FEED_URL)
      .then(function (response) {
        if (!response.ok) throw new Error("Blog feed request failed: " + response.status);
        return response.json();
      })
      .then(function (posts) {
        if (!Array.isArray(posts) || posts.length === 0) {
          showEmptyState(section);
          return;
        }
        renderPosts(posts, listEl);
      })
      .catch(function () {
        showEmptyState(section);
      });
  }

  document.addEventListener("DOMContentLoaded", init);

  window.CambridgeLearnBlogFeed = {
    getThumbnail: getThumbnail,
    stripHtml: stripHtml,
    renderPosts: renderPosts
  };
})();
```

- [ ] **Step 2: Write `static-site/assets/logo.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="clLogoTitle">
  <title id="clLogoTitle">Cambridge Learn crest placeholder</title>
  <!-- Placeholder shield emblem. Swap this file for final coat-of-arms artwork. -->
  <path
    d="M32 4 L56 12 V30 C56 44 46 54 32 60 C18 54 8 44 8 30 V12 Z"
    fill="#0f2a4a"
    stroke="#b8933d"
    stroke-width="2.5"
  />
  <path
    d="M32 10 L50 16.5 V30 C50 41 42.5 49 32 53.5 C21.5 49 14 41 14 30 V16.5 Z"
    fill="none"
    stroke="#faf7f0"
    stroke-width="1.5"
  />
  <line x1="32" y1="16" x2="32" y2="48" stroke="#b8933d" stroke-width="1.5" />
  <line x1="18" y1="30" x2="46" y2="30" stroke="#b8933d" stroke-width="1.5" />
</svg>
```

- [ ] **Step 3: Verify manually**

Once wired into `en/index.html` (Task 5): confirm the shield SVG renders at header size in the nav bar; confirm the blog feed section is hidden (not broken/empty-looking) when the fetch to the not-yet-existing WP endpoint fails — check via DevTools Network tab that the request 404s/fails and via Elements tab that `[data-blog-feed]` has `hidden` set.

- [ ] **Step 4: Commit**

```bash
git add static-site/js/blog-feed.js static-site/assets/logo.svg
git commit -m "Add blog feed fetch logic and placeholder crest logo"
```

---

### Task 5: English homepage (`en/index.html`)

**Files:**
- Create: `static-site/en/index.html`

**Interfaces:**
- Consumes: `css/main.css`, `js/app.js`, `js/blog-feed.js`, `assets/logo.svg` (all from Tasks 1, 2, 4) via relative paths `../css/main.css`, `../js/app.js`, `../js/blog-feed.js`, `../assets/logo.svg`.
- Markup contract required by `app.js`: `.site-header[data-nav-open]`, `.nav-toggle[aria-expanded]`, `.lang-switcher[data-open]`, `.lang-switcher__toggle[aria-expanded]`.
- Markup contract required by `blog-feed.js`: `section[data-blog-feed]` containing `ul[data-blog-feed-list]`.

- [ ] **Step 1: Write `static-site/en/index.html`**

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cambridge Learn | International Language &amp; Summer Schools in the UK</title>
<meta name="description" content="Cambridge Learn is an international language and summer school agency placing students in London, Oxford, Cambridge and across the UK.">
<link rel="canonical" href="https://www.cambridgelearn.com/en/">

<!-- hreflang alternates: one entry per language version of this page -->
<link rel="alternate" hreflang="x-default" href="https://www.cambridgelearn.com/en/">
<link rel="alternate" hreflang="en" href="https://www.cambridgelearn.com/en/">
<link rel="alternate" hreflang="it" href="https://www.cambridgelearn.com/it/">
<link rel="alternate" hreflang="ar" href="https://www.cambridgelearn.com/ar/">
<link rel="alternate" hreflang="tr" href="https://www.cambridgelearn.com/tr/">
<link rel="alternate" hreflang="es" href="https://www.cambridgelearn.com/es/">
<link rel="alternate" hreflang="zh-Hans" href="https://www.cambridgelearn.com/zh-hans/">
<link rel="alternate" hreflang="fr" href="https://www.cambridgelearn.com/fr/">
<link rel="alternate" hreflang="pt" href="https://www.cambridgelearn.com/pt/">
<link rel="alternate" hreflang="ja" href="https://www.cambridgelearn.com/ja/">
<link rel="alternate" hreflang="de" href="https://www.cambridgelearn.com/de/">
<link rel="alternate" hreflang="ko" href="https://www.cambridgelearn.com/ko/">
<link rel="alternate" hreflang="ru" href="https://www.cambridgelearn.com/ru/">
<link rel="alternate" hreflang="th" href="https://www.cambridgelearn.com/th/">
<link rel="alternate" hreflang="zh-Hant" href="https://www.cambridgelearn.com/zh-hant/">
<link rel="alternate" hreflang="he" href="https://www.cambridgelearn.com/he/">
<link rel="alternate" hreflang="pl" href="https://www.cambridgelearn.com/pl/">
<link rel="alternate" hreflang="nl" href="https://www.cambridgelearn.com/nl/">
<link rel="alternate" hreflang="cs" href="https://www.cambridgelearn.com/cs/">
<link rel="alternate" hreflang="uk" href="https://www.cambridgelearn.com/uk/">
<link rel="alternate" hreflang="ro" href="https://www.cambridgelearn.com/ro/">
<link rel="alternate" hreflang="el" href="https://www.cambridgelearn.com/el/">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&amp;family=Inter:wght@400;500;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/main.css">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Cambridge Learn",
  "url": "https://www.cambridgelearn.com/en/",
  "logo": "https://www.cambridgelearn.com/assets/logo.svg",
  "email": "info@cambridgelearn.com",
  "sameAs": [],
  "department": [
    {
      "@type": "LocalBusiness",
      "name": "Cambridge Learn — London",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "86-90 Paul Street",
        "addressLocality": "London",
        "postalCode": "EC2A 4NE",
        "addressCountry": "GB"
      },
      "telephone": "+44 20 3411 2421"
    },
    {
      "@type": "LocalBusiness",
      "name": "Cambridge Learn — London (Wimbledon)",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Highland House, 165 The Broadway, Wimbledon",
        "addressLocality": "London",
        "postalCode": "SW19 1NE",
        "addressCountry": "GB"
      },
      "telephone": "+44 20 3411 2421"
    },
    {
      "@type": "LocalBusiness",
      "name": "Cambridge Learn — Kemer, Antalya",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Merkez Mah. 128 Sok. No:7",
        "addressLocality": "Kemer / Antalya",
        "addressCountry": "TR"
      },
      "telephone": "+90 242 212 0430"
    },
    {
      "@type": "LocalBusiness",
      "name": "Cambridge Learn — Muratpaşa, Antalya",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Balbey Mahallesi, İsmetpaşa Caddesi No:6/C",
        "addressLocality": "Muratpaşa / Antalya",
        "addressCountry": "TR"
      },
      "telephone": "+90 242 212 0430"
    }
  ]
}
</script>
</head>
<body>

<header class="site-header" data-nav-open="false">
  <div class="container">
    <a class="brand" href="index.html">
      <img class="brand__logo" src="../assets/logo.svg" alt="Cambridge Learn crest">
      <span class="brand__name">Cambridge Learn</span>
    </a>

    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">
      Menu
    </button>

    <nav class="main-nav" id="primary-navigation" aria-label="Primary">
      <ul class="main-nav__list">
        <li><a href="index.html" aria-current="page">Home</a></li>
        <li><a href="schools.html">Our Schools</a></li>
        <li><a href="index.html#contact">Contact</a></li>
      </ul>

      <div class="lang-switcher" data-open="false">
        <button class="lang-switcher__toggle" type="button" aria-haspopup="listbox" aria-expanded="false">
          English ▾
        </button>
        <ul class="lang-switcher__list" role="listbox" aria-label="Choose a language">
          <li><a href="../en/index.html" lang="en" hreflang="en">English</a></li>
          <li><a href="../it/index.html" lang="it" hreflang="it">Italiano</a></li>
          <li><a href="../ar/index.html" lang="ar" hreflang="ar">العربية</a></li>
          <li><a href="../tr/index.html" lang="tr" hreflang="tr">Türkçe</a></li>
          <li><a href="../es/index.html" lang="es" hreflang="es">Español</a></li>
          <li><a href="../zh-hans/index.html" lang="zh-Hans" hreflang="zh-Hans">简体中文</a></li>
          <li><a href="../fr/index.html" lang="fr" hreflang="fr">Français</a></li>
          <li><a href="../pt/index.html" lang="pt" hreflang="pt">Português</a></li>
          <li><a href="../ja/index.html" lang="ja" hreflang="ja">日本語</a></li>
          <li><a href="../de/index.html" lang="de" hreflang="de">Deutsch</a></li>
          <li><a href="../ko/index.html" lang="ko" hreflang="ko">한국어</a></li>
          <li><a href="../ru/index.html" lang="ru" hreflang="ru">Русский</a></li>
          <li><a href="../th/index.html" lang="th" hreflang="th">ไทย</a></li>
          <li><a href="../zh-hant/index.html" lang="zh-Hant" hreflang="zh-Hant">繁體中文</a></li>
          <li><a href="../he/index.html" lang="he" hreflang="he">עברית</a></li>
          <li><a href="../pl/index.html" lang="pl" hreflang="pl">Polski</a></li>
          <li><a href="../nl/index.html" lang="nl" hreflang="nl">Nederlands</a></li>
          <li><a href="../cs/index.html" lang="cs" hreflang="cs">Čeština</a></li>
          <li><a href="../uk/index.html" lang="uk" hreflang="uk">Українська</a></li>
          <li><a href="../ro/index.html" lang="ro" hreflang="ro">Română</a></li>
          <li><a href="../el/index.html" lang="el" hreflang="el">Ελληνικά</a></li>
        </ul>
      </div>
    </nav>
  </div>
</header>

<main>
  <section class="hero">
    <div class="container">
      <h1>Language &amp; Summer Schools Across the UK</h1>
      <p>Cambridge Learn places international students in accredited language and summer schools in London, Oxford, Cambridge and beyond — combining academic rigour with an unforgettable UK experience.</p>
      <a class="button" href="schools.html">Browse Our Schools</a>
    </div>
  </section>

  <section class="section" aria-labelledby="why-heading">
    <div class="container">
      <div class="section__intro">
        <h2 id="why-heading">Why Families Choose Cambridge Learn</h2>
        <p>For over a decade we have guided students and families through every step of studying in the UK, from choosing the right school to arriving safely and thriving once they get there.</p>
      </div>

      <div class="card-grid">
        <article class="card">
          <h3>Accredited Partner Schools</h3>
          <p>Every school we work with is vetted for academic quality, safeguarding standards and student welfare.</p>
        </article>
        <article class="card">
          <h3>Personal Guidance</h3>
          <p>Our advisors match each student to the right course, city and school type — summer school or long-term language study.</p>
        </article>
        <article class="card">
          <h3>Local Support Offices</h3>
          <p>With offices in the UK and Türkiye, our team is reachable in your time zone throughout the enrolment process.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--cream" aria-labelledby="blog-heading" data-blog-feed>
    <div class="container">
      <div class="section__intro">
        <h2 id="blog-heading">From Our Blog</h2>
        <p>Latest news and guidance from the Cambridge Learn team.</p>
      </div>
      <ul class="blog-feed__list" data-blog-feed-list aria-live="polite"></ul>
    </div>
  </section>

  <section class="section" id="contact" aria-labelledby="contact-heading">
    <div class="container">
      <div class="section__intro">
        <h2 id="contact-heading">Get in Touch</h2>
        <p>Email us at <a href="mailto:info@cambridgelearn.com">info@cambridgelearn.com</a> or reach one of our offices below.</p>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-location">
        <h3>London</h3>
        <address>
          86-90 Paul Street, London, EC2A 4NE, United Kingdom<br>
          <a href="tel:+442034112421">+44 20 3411 2421</a>
        </address>
      </div>
      <div class="footer-location">
        <h3>London (Wimbledon)</h3>
        <address>
          Highland House, 165 The Broadway, Wimbledon, London, SW19 1NE, United Kingdom<br>
          <a href="tel:+442034112421">+44 20 3411 2421</a>
        </address>
      </div>
      <div class="footer-location">
        <h3>Kemer, Antalya</h3>
        <address>
          Merkez Mah. 128 Sok. No:7, Kemer / Antalya, Türkiye<br>
          <a href="tel:+902422120430">+90 242 212 0430</a>
        </address>
      </div>
      <div class="footer-location">
        <h3>Muratpaşa, Antalya</h3>
        <address>
          Balbey Mahallesi, İsmetpaşa Caddesi No:6/C, Muratpaşa / Antalya, Türkiye<br>
          <a href="tel:+902422120430">+90 242 212 0430</a>
        </address>
      </div>
      <div class="footer-location">
        <h3>Email</h3>
        <address><a href="mailto:info@cambridgelearn.com">info@cambridgelearn.com</a></address>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; 2026 Cambridge Learn. All rights reserved.
    </div>
  </div>
</footer>

<script src="../js/app.js"></script>
<script src="../js/blog-feed.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Open `static-site/en/index.html` directly in a browser (file://). Confirm: header/hero/cards/footer render per Task 1's CSS, nav toggle and language switcher work per Task 2, blog feed section ends up `hidden` (endpoint doesn't exist yet) without breaking layout, and `view-source:` shows valid JSON in the two `<script type="application/ld+json">`-equivalent block (single combined block above) — paste it into a JSON validator to confirm it parses.

- [ ] **Step 3: Commit**

```bash
git add static-site/en/index.html
git commit -m "Add English homepage"
```

---

### Task 6: English schools listing/filter page (`en/schools.html`)

**Files:**
- Create: `static-site/en/schools.html`

**Interfaces:**
- Consumes: `css/main.css`, `js/app.js`, `js/school-filter.js`, `assets/logo.svg` (Tasks 1, 2, 3) via `../css/main.css`, `../js/app.js`, `../js/school-filter.js`, `../assets/logo.svg`.
- Provides the markup contract `school-filter.js` requires (see Task 3 Interfaces).

- [ ] **Step 1: Write `static-site/en/schools.html`**

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Our Schools | Cambridge Learn</title>
<meta name="description" content="Browse Cambridge Learn's partner language and summer schools in London, Oxford, Cambridge and beyond, and filter by location, type and features.">
<link rel="canonical" href="https://www.cambridgelearn.com/en/schools.html">

<link rel="alternate" hreflang="x-default" href="https://www.cambridgelearn.com/en/schools.html">
<link rel="alternate" hreflang="en" href="https://www.cambridgelearn.com/en/schools.html">
<link rel="alternate" hreflang="it" href="https://www.cambridgelearn.com/it/schools.html">
<link rel="alternate" hreflang="ar" href="https://www.cambridgelearn.com/ar/schools.html">
<link rel="alternate" hreflang="tr" href="https://www.cambridgelearn.com/tr/schools.html">
<link rel="alternate" hreflang="es" href="https://www.cambridgelearn.com/es/schools.html">
<link rel="alternate" hreflang="zh-Hans" href="https://www.cambridgelearn.com/zh-hans/schools.html">
<link rel="alternate" hreflang="fr" href="https://www.cambridgelearn.com/fr/schools.html">
<link rel="alternate" hreflang="pt" href="https://www.cambridgelearn.com/pt/schools.html">
<link rel="alternate" hreflang="ja" href="https://www.cambridgelearn.com/ja/schools.html">
<link rel="alternate" hreflang="de" href="https://www.cambridgelearn.com/de/schools.html">
<link rel="alternate" hreflang="ko" href="https://www.cambridgelearn.com/ko/schools.html">
<link rel="alternate" hreflang="ru" href="https://www.cambridgelearn.com/ru/schools.html">
<link rel="alternate" hreflang="th" href="https://www.cambridgelearn.com/th/schools.html">
<link rel="alternate" hreflang="zh-Hant" href="https://www.cambridgelearn.com/zh-hant/schools.html">
<link rel="alternate" hreflang="he" href="https://www.cambridgelearn.com/he/schools.html">
<link rel="alternate" hreflang="pl" href="https://www.cambridgelearn.com/pl/schools.html">
<link rel="alternate" hreflang="nl" href="https://www.cambridgelearn.com/nl/schools.html">
<link rel="alternate" hreflang="cs" href="https://www.cambridgelearn.com/cs/schools.html">
<link rel="alternate" hreflang="uk" href="https://www.cambridgelearn.com/uk/schools.html">
<link rel="alternate" hreflang="ro" href="https://www.cambridgelearn.com/ro/schools.html">
<link rel="alternate" hreflang="el" href="https://www.cambridgelearn.com/el/schools.html">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&amp;family=Inter:wght@400;500;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/main.css">
</head>
<body>

<header class="site-header" data-nav-open="false">
  <div class="container">
    <a class="brand" href="index.html">
      <img class="brand__logo" src="../assets/logo.svg" alt="Cambridge Learn crest">
      <span class="brand__name">Cambridge Learn</span>
    </a>

    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">
      Menu
    </button>

    <nav class="main-nav" id="primary-navigation" aria-label="Primary">
      <ul class="main-nav__list">
        <li><a href="index.html">Home</a></li>
        <li><a href="schools.html" aria-current="page">Our Schools</a></li>
        <li><a href="index.html#contact">Contact</a></li>
      </ul>

      <div class="lang-switcher" data-open="false">
        <button class="lang-switcher__toggle" type="button" aria-haspopup="listbox" aria-expanded="false">
          English ▾
        </button>
        <ul class="lang-switcher__list" role="listbox" aria-label="Choose a language">
          <li><a href="../en/schools.html" lang="en" hreflang="en">English</a></li>
          <li><a href="../it/schools.html" lang="it" hreflang="it">Italiano</a></li>
          <li><a href="../ar/schools.html" lang="ar" hreflang="ar">العربية</a></li>
          <li><a href="../tr/schools.html" lang="tr" hreflang="tr">Türkçe</a></li>
          <li><a href="../es/schools.html" lang="es" hreflang="es">Español</a></li>
          <li><a href="../zh-hans/schools.html" lang="zh-Hans" hreflang="zh-Hans">简体中文</a></li>
          <li><a href="../fr/schools.html" lang="fr" hreflang="fr">Français</a></li>
          <li><a href="../pt/schools.html" lang="pt" hreflang="pt">Português</a></li>
          <li><a href="../ja/schools.html" lang="ja" hreflang="ja">日本語</a></li>
          <li><a href="../de/schools.html" lang="de" hreflang="de">Deutsch</a></li>
          <li><a href="../ko/schools.html" lang="ko" hreflang="ko">한국어</a></li>
          <li><a href="../ru/schools.html" lang="ru" hreflang="ru">Русский</a></li>
          <li><a href="../th/schools.html" lang="th" hreflang="th">ไทย</a></li>
          <li><a href="../zh-hant/schools.html" lang="zh-Hant" hreflang="zh-Hant">繁體中文</a></li>
          <li><a href="../he/schools.html" lang="he" hreflang="he">עברית</a></li>
          <li><a href="../pl/schools.html" lang="pl" hreflang="pl">Polski</a></li>
          <li><a href="../nl/schools.html" lang="nl" hreflang="nl">Nederlands</a></li>
          <li><a href="../cs/schools.html" lang="cs" hreflang="cs">Čeština</a></li>
          <li><a href="../uk/schools.html" lang="uk" hreflang="uk">Українська</a></li>
          <li><a href="../ro/schools.html" lang="ro" hreflang="ro">Română</a></li>
          <li><a href="../el/schools.html" lang="el" hreflang="el">Ελληνικά</a></li>
        </ul>
      </div>
    </nav>
  </div>
</header>

<main>
  <section class="section" aria-labelledby="schools-heading">
    <div class="container">
      <div class="section__intro">
        <h1 id="schools-heading">Our Schools</h1>
        <p>Filter by location, course type and features to find the right fit. School details below are sample placeholders and will be replaced with our confirmed partner schools.</p>
      </div>

      <form data-school-filter-form aria-label="Filter schools">
        <div class="filter-bar">
          <fieldset class="filter-group">
            <legend>Location</legend>
            <div class="filter-group__options">
              <label><input type="checkbox" data-filter-group="location" value="london"> London</label>
              <label><input type="checkbox" data-filter-group="location" value="oxford"> Oxford</label>
              <label><input type="checkbox" data-filter-group="location" value="cambridge"> Cambridge</label>
              <label><input type="checkbox" data-filter-group="location" value="brighton"> Brighton</label>
            </div>
          </fieldset>

          <fieldset class="filter-group">
            <legend>Type</legend>
            <div class="filter-group__options">
              <label><input type="checkbox" data-filter-group="type" value="summer-school"> Summer School</label>
              <label><input type="checkbox" data-filter-group="type" value="language-course"> Language Course</label>
            </div>
          </fieldset>

          <fieldset class="filter-group">
            <legend>Features</legend>
            <div class="filter-group__options">
              <label><input type="checkbox" data-filter-group="features" value="Homestay"> Homestay</label>
              <label><input type="checkbox" data-filter-group="features" value="Excursions"> Excursions</label>
              <label><input type="checkbox" data-filter-group="features" value="Exam Prep"> Exam Prep</label>
              <label><input type="checkbox" data-filter-group="features" value="Small Classes"> Small Classes</label>
              <label><input type="checkbox" data-filter-group="features" value="Sports"> Sports</label>
            </div>
          </fieldset>
        </div>
      </form>

      <div class="card-grid" data-school-grid>
        <article class="school-card card" data-location="london" data-type="summer-school" data-features="Homestay, Excursions">
          <h3>Sample School — London Summer</h3>
          <p class="school-card__meta">London · Summer School</p>
          <p>Homestay, Excursions</p>
        </article>

        <article class="school-card card" data-location="oxford" data-type="language-course" data-features="Exam Prep, Small Classes">
          <h3>Sample School — Oxford Academy</h3>
          <p class="school-card__meta">Oxford · Language Course</p>
          <p>Exam Prep, Small Classes</p>
        </article>

        <article class="school-card card" data-location="cambridge" data-type="summer-school" data-features="Sports, Homestay">
          <h3>Sample School — Cambridge Summer</h3>
          <p class="school-card__meta">Cambridge · Summer School</p>
          <p>Sports, Homestay</p>
        </article>

        <article class="school-card card" data-location="cambridge" data-type="language-course" data-features="Exam Prep">
          <h3>Sample School — Cambridge Language Centre</h3>
          <p class="school-card__meta">Cambridge · Language Course</p>
          <p>Exam Prep</p>
        </article>

        <article class="school-card card" data-location="brighton" data-type="summer-school" data-features="Excursions, Sports">
          <h3>Sample School — Brighton Coastal Summer</h3>
          <p class="school-card__meta">Brighton · Summer School</p>
          <p>Excursions, Sports</p>
        </article>

        <article class="school-card card" data-location="london" data-type="language-course" data-features="Small Classes, Homestay">
          <h3>Sample School — London Language Institute</h3>
          <p class="school-card__meta">London · Language Course</p>
          <p>Small Classes, Homestay</p>
        </article>
      </div>

      <p class="filter-empty" data-filter-empty hidden>No schools match the selected filters. Try clearing one or more options.</p>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-location">
        <h3>London</h3>
        <address>
          86-90 Paul Street, London, EC2A 4NE, United Kingdom<br>
          <a href="tel:+442034112421">+44 20 3411 2421</a>
        </address>
      </div>
      <div class="footer-location">
        <h3>London (Wimbledon)</h3>
        <address>
          Highland House, 165 The Broadway, Wimbledon, London, SW19 1NE, United Kingdom<br>
          <a href="tel:+442034112421">+44 20 3411 2421</a>
        </address>
      </div>
      <div class="footer-location">
        <h3>Kemer, Antalya</h3>
        <address>
          Merkez Mah. 128 Sok. No:7, Kemer / Antalya, Türkiye<br>
          <a href="tel:+902422120430">+90 242 212 0430</a>
        </address>
      </div>
      <div class="footer-location">
        <h3>Muratpaşa, Antalya</h3>
        <address>
          Balbey Mahallesi, İsmetpaşa Caddesi No:6/C, Muratpaşa / Antalya, Türkiye<br>
          <a href="tel:+902422120430">+90 242 212 0430</a>
        </address>
      </div>
      <div class="footer-location">
        <h3>Email</h3>
        <address><a href="mailto:info@cambridgelearn.com">info@cambridgelearn.com</a></address>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; 2026 Cambridge Learn. All rights reserved.
    </div>
  </div>
</footer>

<script src="../js/app.js"></script>
<script src="../js/school-filter.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify manually**

Open `static-site/en/schools.html` in a browser. Confirm: 6 sample school cards render; checking "London" under Location hides all non-London cards; checking both "London" and "Oxford" shows both; checking a Type and a Location together narrows to the intersection; checking every Location + a non-matching Type combination shows the "No schools match" message; unchecking everything restores all 6 cards.

- [ ] **Step 3: Commit**

```bash
git add static-site/en/schools.html
git commit -m "Add English schools listing/filter page"
```

---

## Self-Review Notes

- Spec coverage: semantic HTML5 landmarks (all pages), JSON-LD EducationalOrganization + 4 LocalBusiness blocks (Task 5), hreflang across 21 languages + x-default (Tasks 5, 6), RTL CSS ready for ar/he (Task 1, not yet wired into an actual ar/he page — that happens in the follow-up replication plan), school filter by location/type/features (Task 3, 6), blog feed fetch with graceful failure (Task 4, 5), placeholder logo (Task 4), full contact footer (Tasks 5, 6), placeholder school data clearly labeled (Task 6). All covered.
- No Node/build step/i18n JSON anywhere in this plan — confirmed.
- Type/interface consistency checked: `data-filter-group` values (`location`, `type`, `features`) match between `school-filter.js` and `schools.html` checkboxes; `data-blog-feed` / `data-blog-feed-list` match between `blog-feed.js` and `index.html`; CSS class names referenced in JS (`.site-header`, `.nav-toggle`, `.lang-switcher`, `.school-card`) match `main.css`.

## Out of Scope (follow-up plans)

- Replicating this validated English template into the other 20 languages (machine-translated), including wiring `rtl.css` into `ar/` and `he/`.
- WordPress theme (`/wordpress-theme`).
