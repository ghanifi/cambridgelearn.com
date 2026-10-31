// Cambridge Learn: cookie consent for Google Analytics (Consent Mode v2).
//
// The gtag snippet in each page's <head> sets every consent type to
// "denied" by default and re-applies a stored "granted" choice before the
// tag configures. This script shows the banner when no choice is stored,
// saves the visitor's choice, and updates consent. Advertising storage is
// never granted: the site runs no ads.
//
// A "Cookie settings" button is added to the footer's legal links so the
// choice can be changed later. Strings are keyed by <html lang>.
(function () {
  "use strict";

  var KEY = "cl_consent";

  // [banner text, accept, reject, privacy link, cookie settings]
  var T = {
    en: ["We use Google Analytics cookies to understand how visitors use this site, so we can improve it. They are only set if you accept.", "Accept", "Reject", "Privacy Policy", "Cookie settings"],
    tr: ["Ziyaretçilerin siteyi nasıl kullandığını anlayıp siteyi geliştirmek için Google Analytics çerezleri kullanıyoruz. Bu çerezler yalnızca kabul ederseniz kullanılır.", "Kabul et", "Reddet", "Gizlilik Politikası", "Çerez ayarları"],
    it: ["Utilizziamo i cookie di Google Analytics per capire come i visitatori usano il sito e migliorarlo. Vengono impostati solo se li accetti.", "Accetta", "Rifiuta", "Informativa sulla privacy", "Impostazioni cookie"],
    es: ["Usamos cookies de Google Analytics para entender cómo se utiliza este sitio y mejorarlo. Solo se activan si las aceptas.", "Aceptar", "Rechazar", "Política de privacidad", "Configuración de cookies"],
    fr: ["Nous utilisons des cookies Google Analytics pour comprendre l'utilisation de ce site et l'améliorer. Ils ne sont déposés que si vous les acceptez.", "Accepter", "Refuser", "Politique de confidentialité", "Paramètres des cookies"],
    pt: ["Utilizamos cookies do Google Analytics para perceber como os visitantes usam este site e melhorá-lo. Só são ativados se aceitar.", "Aceitar", "Recusar", "Política de privacidade", "Definições de cookies"],
    de: ["Wir verwenden Google-Analytics-Cookies, um zu verstehen, wie Besucher diese Website nutzen, und sie zu verbessern. Sie werden nur gesetzt, wenn Sie zustimmen.", "Akzeptieren", "Ablehnen", "Datenschutzerklärung", "Cookie-Einstellungen"],
    cs: ["Používáme soubory cookie Google Analytics, abychom pochopili, jak návštěvníci web používají, a mohli jej zlepšovat. Ukládají se pouze s vaším souhlasem.", "Přijmout", "Odmítnout", "Zásady ochrany osobních údajů", "Nastavení cookies"],
    pl: ["Używamy plików cookie Google Analytics, aby zrozumieć, jak odwiedzający korzystają z witryny, i ją ulepszać. Są zapisywane tylko po wyrażeniu zgody.", "Akceptuj", "Odrzuć", "Polityka prywatności", "Ustawienia cookies"],
    ro: ["Folosim cookie-uri Google Analytics pentru a înțelege cum este folosit site-ul și a-l îmbunătăți. Sunt setate doar dacă le acceptați.", "Accept", "Refuz", "Politica de confidențialitate", "Setări cookie"],
    ru: ["Мы используем файлы cookie Google Analytics, чтобы понимать, как посетители пользуются сайтом, и улучшать его. Они сохраняются только с вашего согласия.", "Принять", "Отклонить", "Политика конфиденциальности", "Настройки cookie"],
    uk: ["Ми використовуємо файли cookie Google Analytics, щоб розуміти, як відвідувачі користуються сайтом, і покращувати його. Вони зберігаються лише за вашою згодою.", "Прийняти", "Відхилити", "Політика конфіденційності", "Налаштування cookie"],
    nl: ["We gebruiken Google Analytics-cookies om te begrijpen hoe bezoekers deze site gebruiken en hem te verbeteren. Ze worden alleen geplaatst als u akkoord gaat.", "Accepteren", "Weigeren", "Privacybeleid", "Cookie-instellingen"],
    el: ["Χρησιμοποιούμε cookies του Google Analytics για να κατανοούμε πώς χρησιμοποιείται ο ιστότοπος και να τον βελτιώνουμε. Ενεργοποιούνται μόνο αν τα αποδεχτείτε.", "Αποδοχή", "Απόρριψη", "Πολιτική απορρήτου", "Ρυθμίσεις cookies"],
    ar: ["نستخدم ملفات تعريف الارتباط من Google Analytics لفهم كيفية استخدام الزوار لهذا الموقع وتحسينه. لا يتم تفعيلها إلا إذا وافقت عليها.", "موافق", "رفض", "سياسة الخصوصية", "إعدادات ملفات تعريف الارتباط"],
    he: ["אנו משתמשים בקובצי Cookie של Google Analytics כדי להבין כיצד מבקרים משתמשים באתר ולשפר אותו. הם נשמרים רק אם תאשרו.", "אישור", "דחייה", "מדיניות פרטיות", "הגדרות קובצי Cookie"],
    "zh-hans": ["我们使用 Google Analytics Cookie 来了解访客如何使用本网站，以便改进网站。只有在您同意后才会启用。", "接受", "拒绝", "隐私政策", "Cookie 设置"],
    "zh-hant": ["我們使用 Google Analytics Cookie 來了解訪客如何使用本網站，以便改善網站。只有在您同意後才會啟用。", "接受", "拒絕", "隱私權政策", "Cookie 設定"],
    ja: ["サイト改善のため、Google AnalyticsのCookieで訪問者のサイト利用状況を把握しています。Cookieは同意いただいた場合にのみ使用されます。", "同意する", "拒否する", "プライバシーポリシー", "Cookie設定"],
    ko: ["방문자의 사이트 이용 방식을 파악하고 사이트를 개선하기 위해 Google Analytics 쿠키를 사용합니다. 동의하신 경우에만 사용됩니다.", "동의", "거부", "개인정보 처리방침", "쿠키 설정"],
    th: ["เราใช้คุกกี้ของ Google Analytics เพื่อทำความเข้าใจการใช้งานเว็บไซต์และปรับปรุงให้ดีขึ้น คุกกี้จะถูกใช้เมื่อคุณยอมรับเท่านั้น", "ยอมรับ", "ปฏิเสธ", "นโยบายความเป็นส่วนตัว", "การตั้งค่าคุกกี้"]
  };

  function strings() {
    var l = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    return T[l] || T[l.split("-")[0]] || T.en;
  }

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* storage blocked */ }
  }

  function apply(value) {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: value === "granted" ? "granted" : "denied"
    });
  }

  // Rejecting after an earlier accept: the _ga cookies set under the
  // earlier consent are removed as well.
  function clearGaCookies() {
    var host = window.location.hostname;
    var domains = ["", host, "." + host.replace(/^www\./, "")];
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name !== "_ga" && name.indexOf("_ga_") !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  var banner = null;
  var lastFocus = null;

  function close() {
    if (!banner) return;
    banner.remove();
    banner = null;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function choose(value) {
    var previous = stored();
    save(value);
    apply(value);
    if (value === "denied" && previous === "granted") clearGaCookies();
    close();
  }

  function open() {
    if (banner) return;
    var s = strings();
    lastFocus = document.activeElement;

    banner = document.createElement("section");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", s[4]);

    var text = document.createElement("p");
    text.className = "cookie-banner__text";
    text.appendChild(document.createTextNode(s[0] + " "));
    var link = document.createElement("a");
    link.href = "privacy.html";
    link.textContent = s[3];
    text.appendChild(link);

    var actions = document.createElement("div");
    actions.className = "cookie-banner__actions";
    [["denied", s[2]], ["granted", s[1]]].forEach(function (pair) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cookie-banner__btn";
      btn.textContent = pair[1];
      btn.addEventListener("click", function () { choose(pair[0]); });
      actions.appendChild(btn);
    });

    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  }

  function addSettingsButton() {
    var legal = document.querySelector(".footer-legal");
    if (!legal || legal.querySelector("[data-cookie-settings]")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "footer-legal__button";
    btn.setAttribute("data-cookie-settings", "");
    btn.textContent = strings()[4];
    btn.addEventListener("click", function () {
      open();
      var first = banner && banner.querySelector("button");
      if (first) first.focus();
    });
    legal.appendChild(btn);
  }

  function init() {
    addSettingsButton();
    if (!stored()) open();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
