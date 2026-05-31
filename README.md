# WebStudio — Brief Builder

App web estática para capturar briefs de clientes de una micro-agencia web. Formulario
multi-paso que guarda en **Supabase** y notifica por email vía **EmailJS** (sin backend).

- **Modo Cliente** (URL raíz): 5 pasos, lenguaje sencillo.
- **Modo Investigador** (`?mode=investigador&pin=...`): 5 pasos, levantamiento técnico interno.
  Si el PIN no coincide, cae silenciosamente a Modo Cliente.

Stack: HTML/CSS/JS vanilla · Supabase JS v2 (CDN) · EmailJS (CDN) · deploy en Netlify (raíz plana).

---

## 1. Estructura de archivos

```
/
├── index.html              # markup + orden de scripts
├── style.css               # estilos (mobile-first)
├── main.js                 # motor: render multi-paso, resumen, submit, confirmación
├── supabase-client.js      # cliente Supabase + saveBrief() con .select() post-INSERT
├── emailjs-notify.js       # init EmailJS + notify() best-effort
├── form-client.js          # definición de los 5 pasos del Modo Cliente
├── form-investigator.js    # definición de los 5 pasos del Modo Investigador
├── env-config.js           # window.__env (GITIGNORED — secretos reales locales)
├── env-config.example.js   # plantilla con keys vacías
├── generate-env-config.js  # genera env-config.js desde env vars en el build de Netlify
├── netlify.toml            # config de deploy
├── .env / .env.example     # referencia de variables
└── README.md
```

---

## 2. Supabase — crear la tabla

Ejecuta este SQL en el **SQL Editor** del proyecto Supabase (`xsbjeswurcxbhawpfjav`):

```sql
CREATE TABLE briefs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mode text NOT NULL,
  data jsonb NOT NULL,
  checks jsonb,
  submitted_at timestamptz DEFAULT now(),
  client_name text,
  project_type text
);

ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_only" ON briefs
  FOR INSERT TO anon
  WITH CHECK (true);
```

> La policy permite solo INSERT al rol `anon`. El cliente hace `.select()` después de cada
> INSERT para detectar fallos de RLS silenciosos: si el INSERT falla, se muestra error al
> usuario y **no** se envía el email.

---

## 3. Variables de entorno

El frontend lee los secretos desde `window.__env`, definido en `env-config.js` (gitignored).

| Variable             | Descripción                          |
| -------------------- | ------------------------------------ |
| `SUPABASE_URL`       | URL del proyecto Supabase            |
| `SUPABASE_ANON_KEY`  | Anon/public key                      |
| `EMAILJS_SERVICE_ID` | Service ID de EmailJS                |
| `EMAILJS_TEMPLATE_ID`| Template ID de EmailJS               |
| `EMAILJS_PUBLIC_KEY` | Public key de EmailJS                |
| `INVESTIGATOR_PIN`   | PIN para acceder al Modo Investigador|

### Local

1. Copia la plantilla:
   ```bash
   cp env-config.example.js env-config.js
   ```
2. Rellena `env-config.js` con los valores reales.
3. Sirve la carpeta con cualquier servidor estático:
   ```bash
   python3 -m http.server 8000
   # abre http://localhost:8000
   ```

> `env-config.js` y `.env` están en `.gitignore` — nunca se commitean.

### EmailJS — template params

El email se envía en cada submit exitoso con estos parámetros (configúralos en tu template):

```
biz_name, mode, client_contact, project_type, web_goal, deadline, budget, extra
```

---

## 4. Deploy en Netlify

> Regla del proyecto: archivos en la **raíz** del repo, nunca dentro de una carpeta contenedora.

1. Crea el sitio en Netlify conectado al repo `webstudio-brief`.
2. En **Site settings → Environment variables** define las 6 variables de la tabla de arriba.
3. El `netlify.toml` ya está configurado:
   - `publish = "."`
   - `command = "node generate-env-config.js"` → genera `env-config.js` desde las env vars
     en cada build, así los secretos **nunca** se commitean al repo.
   - `NODE_VERSION = "20"`.
4. Deploy. Netlify ejecutará el comando, generará `env-config.js` y publicará la raíz.

### Acceso

- **Cliente:** `https://<tu-sitio>.netlify.app/`
- **Investigador:** `https://<tu-sitio>.netlify.app/?mode=investigador&pin=<INVESTIGATOR_PIN>`

---

## 5. Notas de comportamiento

- **RLS primero:** si el INSERT falla, se muestra error y se permite reintentar; no se llama a EmailJS.
- **Email best-effort:** si EmailJS falla, el brief ya está en Supabase → se muestra la
  pantalla de confirmación igual y el error solo se loguea en consola.
- **Resumen editable:** antes de enviar, el usuario revisa todo y puede saltar a cualquier paso.
- Código en inglés; UI y labels en español neutro latinoamericano.
- Secretos siempre vía `window.__env`, nunca hardcodeados en el código de la app.
