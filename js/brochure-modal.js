// Cambridge Learn — school brochure popup. A single native <dialog> is
// reused for every "Download Brochure" trigger on the page; the dialog
// element gives free Escape-to-close and focus containment, so this stays
// plain vanilla JS with no dependencies.
(function () {
  "use strict";

  function init() {
    var dialog = document.querySelector("[data-brochure-modal]");
    if (!dialog || typeof dialog.showModal !== "function") return;

    var frame = dialog.querySelector("[data-brochure-frame]");
    var title = dialog.querySelector("[data-brochure-title]");
    var downloadLink = dialog.querySelector("[data-brochure-download]");
    var closeButtons = dialog.querySelectorAll("[data-brochure-close]");
    var lastTrigger = null;

    document.querySelectorAll("[data-brochure-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var url = trigger.getAttribute("data-brochure-url");
        if (!url) return;
        lastTrigger = trigger;
        title.textContent = trigger.getAttribute("data-brochure-name") || "School brochure";
        frame.src = url;
        downloadLink.href = url;
        dialog.showModal();
      });
    });

    closeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        dialog.close();
      });
    });

    // A click on the ::backdrop lands on the <dialog> element itself
    // (nothing inside it), so this closes on outside-click without
    // needing a separate overlay element.
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", function () {
      frame.src = "about:blank";
      if (lastTrigger) lastTrigger.focus();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
