// Cambridge Learn — enquiry forms post directly to a Slack channel via an
// incoming webhook. There is no server on this site, so this is a
// client-only, no-cors POST: the webhook URL is necessarily public in this
// file (anyone can view it, the same as any client-side API call), and a
// no-cors request returns an opaque response, so genuine delivery failures
// cannot be detected here — only network-level errors (offline, blocked)
// are caught below. The success message is shown optimistically.
(function () {
  "use strict";

  var SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";

  function buildMessage(form) {
    var context = form.getAttribute("data-form-context") || "General enquiry";
    var lines = [":email: *New website enquiry — " + context + "*"];

    form.querySelectorAll("[data-field]").forEach(function (field) {
      var value = (field.value || "").trim();
      if (value) {
        lines.push("*" + field.getAttribute("data-field") + ":* " + value);
      }
    });

    lines.push("_Submitted from " + window.location.pathname + "_");
    return lines.join("\n");
  }

  function initForm(form) {
    var statusEl = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector('button[type="submit"]');
    var honeypot = form.querySelector('[data-form-honeypot]');

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Basic bot trap: a hidden field real visitors never fill in.
      if (honeypot && honeypot.value) return;

      if (!form.reportValidity()) return;

      var text = buildMessage(form);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ text: text })
      })
        .catch(function () {
          // Network-level failure only (e.g. offline). Opaque no-cors
          // responses never reject the promise for HTTP-level errors.
        })
        .then(function () {
          form.hidden = true;
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.setAttribute("tabindex", "-1");
            statusEl.focus();
          }
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-slack-form]").forEach(initForm);
  });
})();
