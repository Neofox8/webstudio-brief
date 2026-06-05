// Supabase client + brief persistence.
// Loaded after the Supabase UMD bundle (window.supabase) and env-config.js (window.__env).
window.WS = window.WS || {};

(function () {
  var env = window.__env || {};
  var client = null;

  if (window.supabase && env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    client = window.supabase.createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  } else {
    console.error("[supabase-client] Supabase SDK or env vars missing — cannot persist briefs.");
  }

  window.WS.supabaseClient = client;

  // Inserts a brief. Returns { data, error }; en éxito data es null y error es null,
  // que es lo único que main.js evalúa. Callers must NOT notify by email when error is truthy.
  window.WS.saveBrief = async function (payload) {
    if (!client) {
      return { data: null, error: { message: "Supabase no está configurado." } };
    }

    var row = {
      mode: payload.mode,
      data: payload.data || {},
      checks: payload.checks || {},
      client_name: payload.client_name || null,
      project_type: payload.project_type || null,
    };

    var res = await client.from("briefs").insert(row);

    if (res.error) {
      console.error("[supabase-client] insert failed:", res.error);
    }
    return { data: res.data, error: res.error };
  };
})();
