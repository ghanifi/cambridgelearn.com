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

  function initHeaderScrollShadow() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // The hero "finder": lets a visitor pick a city and a programme type
  // right in the hero and jump straight to the matching schools, instead
  // of the hero being purely decorative. Core functionality, so it lives
  // here (not motion.js) and runs regardless of motion preferences.
  function initHeroFinder() {
    var form = document.querySelector("[data-hero-finder]");
    if (!form) return;

    var cityChips = form.querySelectorAll(".hero__city-chip");
    var typeSelect = form.querySelector("[data-hero-type]");
    var selectedCity = "";

    cityChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        selectedCity = chip.getAttribute("data-city") || "";
        cityChips.forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var params = [];
      if (selectedCity) params.push("loc=" + encodeURIComponent(selectedCity));
      if (typeSelect && typeSelect.value) params.push("type=" + encodeURIComponent(typeSelect.value));
      var hash = params.length ? "#" + params.join("&") : "";
      window.location.href = "schools.html" + hash;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initLangSwitcher();
    initHeaderScrollShadow();
    initHeroFinder();
  });
})();
