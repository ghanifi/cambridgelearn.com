// Cambridge Learn — motion layer: hero kinetic title, scroll reveals, and the
// destination cursor-follow preview (the signature interaction). Plain vanilla
// JS, no dependencies. Every effect here is gated so the page is fully usable
// and fully visible with this script absent, blocked, or slow to load.
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    // Content is already visible by default CSS (see main.css) when
    // [data-motion-ready] is never set — nothing further to do.
    return;
  }

  document.documentElement.setAttribute("data-motion-ready", "true");

  function initKineticHeroTitle() {
    var title = document.querySelector("[data-kinetic-title]");
    if (!title) return;

    var words = title.querySelectorAll("span");
    words.forEach(function (word, index) {
      word.style.setProperty("--kinetic-delay", index * 0.07 + "s");
    });

    // rAF so the initial (opacity:0) state defined in CSS paints first,
    // then the class toggle transitions from it — avoids a jump-cut.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        title.classList.add("is-revealed");
      });
    });
  }

  function initScrollReveals() {
    var revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      // A low threshold (rather than e.g. 0.16) keeps this reliable for very
      // tall sections (long card grids) that can never fill a large share
      // of the viewport at once — it should reveal as soon as it starts
      // entering, not wait for a big fraction of it to be on screen.
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initDestinationPreview() {
    var section = document.querySelector(".destinations");
    var preview = document.getElementById("destination-preview");
    var previewImage = document.getElementById("destination-preview-image");
    if (!section || !preview || !previewImage) return;

    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    var links = section.querySelectorAll(".destination-item__link");
    var previewWidth = preview.offsetWidth;
    var previewHeight = preview.offsetHeight;

    function position(event) {
      var x = event.clientX + 28;
      var y = event.clientY - previewHeight / 2;

      var maxX = window.innerWidth - previewWidth - 16;
      if (x > maxX) {
        x = event.clientX - previewWidth - 28;
      }
      y = Math.max(16, Math.min(y, window.innerHeight - previewHeight - 16));

      preview.style.transform = "translate(" + x + "px, " + y + "px)";
    }

    links.forEach(function (link) {
      link.addEventListener("mouseenter", function () {
        var src = link.getAttribute("data-preview");
        if (src) previewImage.src = src;
        preview.setAttribute("data-active", "true");
      });

      link.addEventListener("mouseleave", function () {
        preview.setAttribute("data-active", "false");
      });
    });

    section.addEventListener("mousemove", position);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initKineticHeroTitle();
    initScrollReveals();
    initDestinationPreview();
  });
})();
