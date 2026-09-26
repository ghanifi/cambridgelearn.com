// Cambridge Learn — enquiry forms post to an n8n workflow webhook, which
// handles routing the enquiry on to Slack (and anywhere else it's
// configured to go). Unlike a raw Slack incoming webhook, this endpoint
// can respond normally over CORS, so — unlike an earlier version of this
// file — real success/failure is detected here rather than assumed.
(function () {
  "use strict";

  var WEBHOOK_URL = "https://n8n.londonos.uk/webhook/3c354327-6275-4e23-8067-01210d88de81";

  function collectFields(form) {
    var data = {};
    form.querySelectorAll("[data-field]").forEach(function (field) {
      var value = (field.value || "").trim();
      if (value) {
        data[field.getAttribute("data-field")] = value;
      }
    });
    return data;
  }

  function setStatus(statusEl, message, isError) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.classList.toggle("form-status--error", !!isError);
    statusEl.setAttribute("tabindex", "-1");
    statusEl.focus();
  }

  function initForm(form) {
    var statusEl = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector('button[type="submit"]');
    var honeypot = form.querySelector("[data-form-honeypot]");
    var defaultBtnLabel = submitBtn ? submitBtn.textContent : "";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Basic bot trap: a hidden field real visitors never fill in.
      if (honeypot && honeypot.value) return;

      if (!form.reportValidity()) return;

      var payload = collectFields(form);
      payload.context = form.getAttribute("data-form-context") || "General enquiry";
      payload.page = window.location.pathname;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Webhook responded with " + response.status);
          }
          form.hidden = true;
          setStatus(statusEl, "Thank you — your message has been sent. We'll be in touch within one working day.", false);
        })
        .catch(function () {
          setStatus(statusEl, "Sorry — we couldn't send that just now. Please try again, or email us directly at info@cambridgelearn.com.", true);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = defaultBtnLabel;
          }
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-slack-form]").forEach(initForm);
  });
})();
