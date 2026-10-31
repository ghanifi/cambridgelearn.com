// Cambridge Learn — enquiry forms post to an n8n workflow webhook, which
// handles routing the enquiry on to Slack (and anywhere else it's
// configured to go). The endpoint responds normally over CORS, so real
// success/failure is detected here rather than assumed.
//
// The success message comes from the page's own (translated) markup. The
// "sending" and error strings live in MESSAGES below, keyed by <html lang>.
// Enquiry links pass ?school=<slug>; it is used to prefill the school field
// and sent with the enquiry together with language, referrer and UTM tags.
(function () {
  "use strict";

  var WEBHOOK_URL = "https://n8n.londonos.uk/webhook/3c354327-6275-4e23-8067-01210d88de81";
  var EMAIL = "info@cambridgelearn.com";

  var MESSAGES = {
    en: ["Sending…", "Sorry, we couldn't send that just now. Please try again, or email us at " + EMAIL + "."],
    tr: ["Gönderiliyor…", "Üzgünüz, mesajınız şu anda gönderilemedi. Lütfen tekrar deneyin veya " + EMAIL + " adresine e-posta gönderin."],
    it: ["Invio in corso…", "Spiacenti, al momento non è stato possibile inviare il messaggio. Riprova o scrivici a " + EMAIL + "."],
    es: ["Enviando…", "Lo sentimos, no hemos podido enviarlo ahora. Inténtalo de nuevo o escríbenos a " + EMAIL + "."],
    fr: ["Envoi en cours…", "Désolé, l'envoi a échoué. Veuillez réessayer ou nous écrire à " + EMAIL + "."],
    pt: ["A enviar…", "Lamentamos, não foi possível enviar agora. Tente novamente ou escreva-nos para " + EMAIL + "."],
    de: ["Wird gesendet…", "Leider konnte Ihre Nachricht gerade nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an " + EMAIL + "."],
    cs: ["Odesílání…", "Omlouváme se, zprávu se nyní nepodařilo odeslat. Zkuste to prosím znovu nebo napište na " + EMAIL + "."],
    pl: ["Wysyłanie…", "Przepraszamy, nie udało się teraz wysłać wiadomości. Spróbuj ponownie lub napisz na " + EMAIL + "."],
    ro: ["Se trimite…", "Ne pare rău, mesajul nu a putut fi trimis acum. Încercați din nou sau scrieți-ne la " + EMAIL + "."],
    ru: ["Отправка…", "К сожалению, сейчас не удалось отправить сообщение. Попробуйте ещё раз или напишите на " + EMAIL + "."],
    uk: ["Надсилання…", "На жаль, зараз не вдалося надіслати повідомлення. Спробуйте ще раз або напишіть на " + EMAIL + "."],
    nl: ["Verzenden…", "Sorry, het verzenden is nu niet gelukt. Probeer het opnieuw of mail ons op " + EMAIL + "."],
    el: ["Αποστολή…", "Λυπούμαστε, δεν ήταν δυνατή η αποστολή αυτή τη στιγμή. Δοκιμάστε ξανά ή στείλτε email στο " + EMAIL + "."],
    ar: ["جارٍ الإرسال…", "عذرًا، تعذّر إرسال رسالتك الآن. يُرجى المحاولة مرة أخرى أو مراسلتنا على " + EMAIL + "."],
    he: ["שולח…", "מצטערים, לא הצלחנו לשלוח כרגע. נסו שוב או כתבו לנו ל-" + EMAIL + "."],
    "zh-hans": ["正在发送…", "抱歉，暂时无法发送。请重试，或发送邮件至 " + EMAIL + "。"],
    "zh-hant": ["正在傳送…", "抱歉，暫時無法傳送。請重試，或寄電子郵件至 " + EMAIL + "。"],
    ja: ["送信中…", "申し訳ありません。現在送信できませんでした。もう一度お試しいただくか、" + EMAIL + " までメールでご連絡ください。"],
    ko: ["전송 중…", "죄송합니다. 지금은 전송할 수 없습니다. 다시 시도하시거나 " + EMAIL + "로 이메일을 보내 주세요."],
    th: ["กำลังส่ง…", "ขออภัย ไม่สามารถส่งได้ในขณะนี้ โปรดลองอีกครั้งหรืออีเมลถึง " + EMAIL]
  };

  // School names are proper nouns and stay the same in every language.
  var SCHOOLS = {
    "bosworth-northampton": "Bosworth Independent School (Northampton)",
    "bournemouth-collegiate": "Bournemouth Collegiate School",
    "brunel-uxbridge": "Brunel University (Uxbridge)",
    "cats-cambridge": "CATS Cambridge",
    "guildhouse-london": "Guildhouse School London",
    "oakham": "Oakham School",
    "oxford-royale": "Oxford Royale",
    "red-star-football": "Red Star Football School (Oakham)",
    "stafford-house-canterbury": "Stafford House Canterbury"
  };

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  var STORE_KEY = "cl_attribution";

  function lang() {
    var l = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    return MESSAGES[l] ? l : (MESSAGES[l.split("-")[0]] ? l.split("-")[0] : "en");
  }

  function params() {
    var out = {};
    window.location.search.replace(/^\?/, "").split("&").forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf("=");
      var k = decodeURIComponent(i < 0 ? pair : pair.slice(0, i));
      var v = i < 0 ? "" : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, " "));
      out[k] = v;
    });
    return out;
  }

  // First-touch attribution for the visit: UTM tags and the external
  // referrer are captured on whatever page the visitor lands on, then kept
  // for the session so they reach the enquiry sent from a later page.
  function attribution() {
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}"); } catch (e) { stored = {}; }
    var p = params();
    var changed = false;
    UTM_KEYS.forEach(function (k) {
      if (p[k] && !stored[k]) { stored[k] = p[k]; changed = true; }
    });
    if (!stored.landing) {
      stored.landing = window.location.pathname;
      var ref = document.referrer;
      if (ref && ref.indexOf(window.location.host) === -1) stored.referrer = ref;
      changed = true;
    }
    if (changed) {
      try { sessionStorage.setItem(STORE_KEY, JSON.stringify(stored)); } catch (e) { /* storage blocked */ }
    }
    return stored;
  }

  function collectFields(form) {
    var data = {};
    form.querySelectorAll("[data-field]").forEach(function (field) {
      var value = (field.value || "").trim();
      if (value) data[field.getAttribute("data-field")] = value;
    });
    return data;
  }

  function showStatus(statusEl, message, isError) {
    if (!statusEl) return;
    if (message) statusEl.textContent = message;
    statusEl.hidden = false;
    statusEl.classList.toggle("form-status--error", !!isError);
    statusEl.setAttribute("tabindex", "-1");
    statusEl.focus();
  }

  function prefillSchool(form) {
    var slug = params().school;
    if (!slug) return;
    var input = form.querySelector('[name="school"]');
    if (!input) return;
    // An inline script on contact.html may already have put the raw slug
    // ("cats cambridge") here; replace that with the school's real name.
    var raw = slug.replace(/[-_]/g, " ");
    if (!input.value || input.value === raw) input.value = SCHOOLS[slug] || raw;
  }

  function initForm(form, attrib) {
    var statusEl = form.querySelector("[data-form-status]");
    var successText = statusEl ? statusEl.textContent.trim() : "";
    var submitBtn = form.querySelector('button[type="submit"]');
    var honeypot = form.querySelector("[data-form-honeypot]");
    var defaultBtnLabel = submitBtn ? submitBtn.textContent : "";
    var msg = MESSAGES[lang()];

    prefillSchool(form);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (honeypot && honeypot.value) return;
      if (!form.reportValidity()) return;

      var payload = collectFields(form);
      payload.context = form.getAttribute("data-form-context") || "General enquiry";
      payload.page = window.location.pathname;
      payload.lang = document.documentElement.getAttribute("lang") || "";
      var school = params().school;
      if (school) payload.source_school = school;
      Object.keys(attrib).forEach(function (k) { payload[k] = attrib[k]; });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = msg[0];
      }
      if (statusEl) statusEl.hidden = true;

      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Webhook responded with " + response.status);
          // The status message sits inside the form, so hide the form's
          // other children rather than the form itself.
          Array.prototype.forEach.call(form.children, function (child) {
            if (child !== statusEl) child.hidden = true;
          });
          showStatus(statusEl, successText, false);
          if (typeof window.gtag === "function") {
            window.gtag("event", "generate_lead", { form: payload.context, school: school || "" });
          }
          if (window.dataLayer && typeof window.dataLayer.push === "function") {
            window.dataLayer.push({ event: "enquiry_submitted", form: payload.context, school: school || "" });
          }
        })
        .catch(function () {
          showStatus(statusEl, msg[1], true);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = defaultBtnLabel;
          }
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var attrib = attribution();
    document.querySelectorAll("[data-slack-form]").forEach(function (form) {
      initForm(form, attrib);
    });
  });
})();
