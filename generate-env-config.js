// Build-time generator for env-config.js (runs on Netlify via netlify.toml `command`).
// Reads the configured environment variables and writes window.__env so the static
// frontend can read secrets without them being committed to the repo.
const fs = require("fs");

const keys = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "EMAILJS_SERVICE_ID",
  "EMAILJS_TEMPLATE_ID",
  "EMAILJS_PUBLIC_KEY",
  "INVESTIGATOR_PIN",
];

const env = {};
for (const k of keys) env[k] = process.env[k] || "";

const missing = keys.filter((k) => !env[k]);
if (missing.length) {
  console.warn("[generate-env-config] Missing env vars:", missing.join(", "));
}

const out =
  "// AUTO-GENERATED at build time. Do not edit by hand.\n" +
  "window.__env = " +
  JSON.stringify(env, null, 2) +
  ";\n";

fs.writeFileSync("env-config.js", out);
console.log("[generate-env-config] Wrote env-config.js");
