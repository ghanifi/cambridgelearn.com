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
