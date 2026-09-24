# Cambridge Learn — Phase 1: Static Site Design

Date: 2026-09-24
Status: Approved (Phase 1 scope only; WordPress theme is a separate later phase)

## Purpose

Cambridge Learn is an international language/summer school agency operating
schools in London, Oxford, Cambridge and elsewhere in the UK. This phase
builds the public static marketing site: fully static HTML/CSS with minimal
vanilla JS, no build tooling, no frameworks, hand-authored per language.

A separate later phase builds a matching WordPress blog theme
(`/wordpress-theme`) that the homepage fetches posts from via the WP REST
API. That phase is out of scope here and will get its own short spec once
Phase 1 is done.

## Scope (Phase 1)

Pages, fully authored per language:
- Homepage (`index.html`) — hero, school highlights, blog feed section,
  contact/footer
- Schools listing/filter page (`schools.html`)

Not in scope yet: About page, individual course/school detail pages,
booking/enquiry forms. These come once Phase 1 content is validated.

## Languages

21 language folders, each with fully translated, hand-authored HTML
(machine-translated by the assistant, not professionally reviewed — flagged
in a header comment on each non-English file):

`en, it, ar, tr, es, zh-hans, fr, pt, ja, de, ko, ru, th, zh-hant, he, pl,
nl, cs, uk, ro, el`

Notes:
- "Mandarin Chinese" → `zh-hans` (Simplified), "Chinese" → `zh-hant`
  (Traditional) — resolves an ambiguous duplicate in the original language
  list.
- `ar` and `he` render with `dir="rtl"` and load `css/rtl.css` in addition
  to `css/main.css`.
- Proper nouns, addresses, and phone numbers are never translated; only
  surrounding labels are.

## Architecture

No Node, no build script, no i18n JSON/runtime dictionary lookups. Every
page is a plain, self-contained `.html` file with hardcoded content in its
own language. CSS and JS are shared (not language-specific) and referenced
identically from every language folder via relative paths.

```
/static-site
  /en/index.html
  /en/schools.html
  /it/index.html
  /it/schools.html
  ... (one folder per language code above, same two files each)
  /css/main.css
  /css/rtl.css
  /js/app.js
  /js/school-filter.js
  /js/blog-feed.js
  /assets/logo.svg
```

Each page's `<head>` includes a full `hreflang` alternate block linking all
21 language versions of that page plus `x-default` → `/en/`.

## Design system

- CSS custom properties on `:root` for palette: deep academic blue, gold
  accent, cream/white base.
- Headings: Playfair Display (serif, via Google Fonts link). Body: a clean
  sans-serif (e.g. Inter).
- Logo: inline SVG placeholder — a geometric shield outline evoking a
  royal coat-of-arms, no actual lion artwork (none was supplied) — sized via
  a CSS custom property so it's a drop-in swap later.

## Schools listing/filter (`schools.html`)

- Static HTML cards, each carrying `data-location`, `data-type`, and
  `data-features` attributes.
- `school-filter.js`: vanilla JS, no dependencies, filters/sorts cards
  client-side by those attributes.
- Content is placeholder data, clearly labeled (e.g. "Sample School —
  London"), covering London, Oxford, Cambridge, and one more UK city, and
  spanning both "Summer School" and "Language Course" types so the filter
  logic is exercised across every dimension. Real data replaces these
  later.

## Blog feed (homepage section)

- `blog-feed.js` calls `https://blog.cambridgelearn.com/wp-json/wp/v2/posts`
  via `fetch()`, renders title/excerpt/thumbnail/link for the latest posts.
- Handles the empty/error case gracefully (endpoint won't resolve until the
  WordPress theme phase ships) — shows nothing or a quiet fallback, never a
  broken layout or console-only failure.

## SEO

- Semantic HTML5 landmarks (`header`, `nav`, `main`, `article`, `section`,
  `aside`, `footer`) throughout.
- JSON-LD: `EducationalOrganization` plus one `LocalBusiness` block per
  physical location (London — Paul Street, London — Wimbledon, Kemer
  Antalya, Muratpaşa Antalya), each with the address/phone given in the
  brief.
- `hreflang` alternate tags on every page (see Architecture).
- ARIA labels on the language switcher and school filter controls; alt
  text on all images/icons.

## Contact information (footer, every page)

- Email: info@cambridgelearn.com
- London: 86-90 Paul Street, London, EC2A 4NE — +44 20 3411 2421
- London (Wimbledon): Highland House, 165 The Broadway, Wimbledon, London,
  SW19 1NE — +44 20 3411 2421
- Kemer, Antalya: Merkez Mah. 128 Sok. No:7, Kemer / Antalya, Türkiye —
  +90 242 212 0430
- Muratpaşa, Antalya: Balbey Mahallesi, İsmetpaşa Caddesi No:6/C,
  Muratpaşa / Antalya, Türkiye — +90 242 212 0430

## Testing / verification

- Manual check of filter logic across all data-attribute combinations.
- Visual RTL check for `ar` and `he`.
- Validate every page's `hreflang` block resolves to a real file for all
  21 languages.
- Confirm shared CSS/JS paths resolve correctly from every language
  folder depth.

## Out of scope for this spec

- WordPress theme implementation (separate phase/spec).
- Real school data, real logo artwork, additional pages beyond
  homepage + schools listing.
- Professional translation review of machine-translated content.
