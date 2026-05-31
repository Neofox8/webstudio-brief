// EmailJS notification. Loaded after the EmailJS browser SDK (window.emailjs) and env-config.js.
// A failed email does NOT fail the brief — the row is already in Supabase. We just log it.
window.WS = window.WS || {};

(function () {
  var env = window.__env || {};

  document.addEventListener("DOMContentLoaded", function () {
    if (window.emailjs && env.EMAILJS_PUBLIC_KEY) {
      try {
        window.emailjs.init({ publicKey: env.EMAILJS_PUBLIC_KEY });
      } catch (e) {
        console.error("[emailjs-notify] init failed:", e);
      }
    } else {
      console.warn("[emailjs-notify] EmailJS SDK or public key missing — notifications disabled.");
    }
  });

  // Sends the notification email. Resolves to true on success, false on failure (never throws).
  window.WS.notify = async function (params) {
    if (!window.emailjs || !env.EMAILJS_SERVICE_ID || !env.EMAILJS_TEMPLATE_ID) {
      console.warn("[emailjs-notify] Skipping email — EmailJS not configured.");
      return false;
    }
    try {
      await window.emailjs.send(env.EMAILJS_SERVICE_ID, env.EMAILJS_TEMPLATE_ID, params);
      return true;
    } catch (e) {
      console.error("[emailjs-notify] send failed (brief already saved):", e);
      return false;
    }
  };
})();
