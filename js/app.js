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

  // Contact-click tracking: WhatsApp, phone and email links report an event
  // to Google Analytics (gtag) or GTM (dataLayer) when either is installed.
  // Without analytics on the page this does nothing.
  function initContactTracking() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href") || "";
      var channel = href.indexOf("wa.me/") !== -1 ? "whatsapp"
        : href.indexOf("tel:") === 0 ? "phone"
        : href.indexOf("mailto:") === 0 ? "email" : "";
      if (!channel) return;
      var detail = { method: channel, page: window.location.pathname };
      if (typeof window.gtag === "function") window.gtag("event", "contact_click", detail);
      if (window.dataLayer && typeof window.dataLayer.push === "function") {
        window.dataLayer.push({ event: "contact_click", method: channel, page: detail.page });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initHeaderScrollShadow();
    initHeroFinder();
    initContactTracking();
  });
})();
