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

  // Two supported deep-link hash formats:
  //   #london                       — plain location (destination reel links)
  //   #loc=cambridge&type=football-english — the hero finder's format
  // Both pre-check the matching filters and scroll the grid into view so
  // the link actually lands somewhere meaningful.
  function parseHashParams(hash) {
    var raw = hash.replace("#", "");
    if (!raw) return {};

    if (raw.indexOf("=") === -1) {
      return { loc: raw.toLowerCase() };
    }

    var params = {};
    raw.split("&").forEach(function (pair) {
      var parts = pair.split("=");
      if (!parts[0]) return;
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || "").toLowerCase();
    });
    return params;
  }

  function applyFiltersFromHash(form, cards, emptyMessageEl) {
    var params = parseHashParams(window.location.hash);
    var matchedAnything = false;

    if (params.loc) {
      var locationCheckbox = form.querySelector(
        '[data-filter-group="location"][value="' + params.loc + '"]'
      );
      if (locationCheckbox) {
        locationCheckbox.checked = true;
        matchedAnything = true;
      }
    }

    if (params.type) {
      var typeCheckbox = form.querySelector(
        '[data-filter-group="type"][value="' + params.type + '"]'
      );
      if (typeCheckbox) {
        typeCheckbox.checked = true;
        matchedAnything = true;
      }
    }

    if (!matchedAnything) return;

    applyFilters(form, cards, emptyMessageEl);

    var grid = document.querySelector("[data-school-grid]");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
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
    applyFiltersFromHash(form, cards, emptyMessageEl);
  }

  document.addEventListener("DOMContentLoaded", init);

  // Exposed for the browser-based test harness (test/school-filter.test.html).
  window.CambridgeLearnFilter = {
    matchesFilters: matchesFilters,
    readActiveFilters: readActiveFilters,
    applyFilters: applyFilters
  };
})();
