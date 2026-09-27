// Cambridge Learn — language switcher. Pure static site, no i18n runtime:
// each language lives in its own top-level folder (e.g. /en/, /tr/) with the
// same filenames, so switching language is just swapping the first path
// segment. LANGS is extended here, one entry at a time, as each language
// phase ships — nothing else needs to change per phase.
(function () {
  "use strict";

  var LANGS = [
    { code: "en", native: "English" },
    { code: "tr", native: "Türkçe" },
    { code: "it", native: "Italiano" },
    { code: "es", native: "Español" },
    { code: "fr", native: "Français" },
    { code: "pt", native: "Português" },
    { code: "de", native: "Deutsch" }
  ];

  var RTL_CODES = ["ar", "he"];

  function currentLangAndFile() {
    var parts = window.location.pathname.split("/").filter(Boolean);
    var lang = "en";
    var file = "index.html";
    if (parts.length >= 2) {
      lang = parts[parts.length - 2];
      file = parts[parts.length - 1];
    } else if (parts.length === 1 && parts[0].indexOf(".") === -1) {
      lang = parts[0];
    }
    if (!file || file.indexOf(".") === -1) {
      file = "index.html";
    }
    return { lang: lang, file: file };
  }

  function initSwitcher(root) {
    var toggle = root.querySelector("[data-lang-toggle]");
    var list = root.querySelector("[data-lang-list]");
    if (!toggle || !list) return;

    var current = currentLangAndFile();
    var currentEntry = null;
    for (var i = 0; i < LANGS.length; i++) {
      if (LANGS[i].code === current.lang) currentEntry = LANGS[i];
    }
    if (!currentEntry) currentEntry = LANGS[0];
    toggle.textContent = currentEntry.code.toUpperCase();

    LANGS.forEach(function (entry) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "/" + entry.code + "/" + current.file;
      a.lang = entry.code;
      a.dir = RTL_CODES.indexOf(entry.code) !== -1 ? "rtl" : "ltr";
      a.textContent = entry.native;
      if (entry.code === current.lang) {
        a.setAttribute("aria-current", "true");
      }
      li.setAttribute("role", "none");
      a.setAttribute("role", "menuitem");
      li.appendChild(a);
      list.appendChild(li);
    });

    function close() {
      root.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = root.getAttribute("data-open") === "true";
      root.setAttribute("data-open", isOpen ? "false" : "true");
      toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-lang-switcher]").forEach(initSwitcher);
  });
})();
