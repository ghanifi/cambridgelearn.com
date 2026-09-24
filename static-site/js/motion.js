// Cambridge Learn — motion layer: hero kinetic title, scroll reveals, and a
// scroll-driven parallax on the cinematic image sections (hero, story-break).
// Plain vanilla JS, no dependencies. Every effect here is gated so the page
// is fully usable and fully visible with this script absent, blocked, or
// slow to load.
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

  // Scroll-driven parallax: the cinematic hero/story-break background images
  // lag slightly behind the page scroll, giving a sense of depth. Cheap
  // (one transform write per frame, rAF-throttled) and reversible — the
  // CSS already sizes these layers with vertical bleed so the lag never
  // exposes an edge.
  function initParallax() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(".hero__media, .story-break__media")
    );
    if (!targets.length) return;

    var ticking = false;
    var MAX_OFFSET = 40;
    var FACTOR = 0.15;

    function update() {
      targets.forEach(function (el) {
        var sectionRect = el.parentElement.getBoundingClientRect();
        var offset = sectionRect.top * -FACTOR;
        offset = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offset));
        el.style.transform = "translateY(" + offset.toFixed(1) + "px)";
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  // Lets desktop mouse-wheel users scroll the horizontal destination reel
  // without needing a trackpad or touchscreen. Only intercepts the wheel
  // event when the reel actually has horizontal overflow to scroll.
  function initDestinationReel() {
    var reel = document.querySelector(".destinations__reel");
    if (!reel) return;

    reel.addEventListener(
      "wheel",
      function (event) {
        if (reel.scrollWidth <= reel.clientWidth) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        reel.scrollLeft += event.deltaY;
        event.preventDefault();
      },
      { passive: false }
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    initKineticHeroTitle();
    initScrollReveals();
    initParallax();
    initDestinationReel();
  });
})();
