// Investigator-mode form definition (5 steps). Internal intake — more technical detail.
// Field types: "text" | "textarea" | "radio" | "checkbox".
// Checkbox fields are stored in the `checks` jsonb column; everything else in `data`.
window.WS = window.WS || {};

window.WS.investigatorForm = {
  mode: "investigador",
  title: "Brief técnico — Modo Investigador",
  subtitle: "Levantamiento completo del proyecto.",
  steps: [
    {
      title: "Identificación",
      hint: "Datos del negocio y contacto.",
      fields: [
        { name: "biz_name", type: "text", label: "Nombre del negocio" },
        { name: "biz_rubro", type: "text", label: "Rubro / industria" },
        { name: "client_contact", type: "text", label: "Dueño / contacto principal" },
        { name: "biz_location", type: "text", label: "Ciudad / país" },
        { name: "biz_web", type: "text", label: "Web actual" },
        { name: "biz_social", type: "text", label: "Redes activas" },
      ],
    },
    {
      title: "Proyecto y audiencia",
      hint: "Alcance y a quién apunta.",
      fields: [
        {
          name: "project_type",
          type: "radio",
          label: "Tipo de entregable",
          options: ["Sitio vitrina", "E-commerce"],
        },
        { name: "scope_line", type: "text", label: "Alcance en una línea" },
        { name: "audience_profile", type: "text", label: "Perfil del cliente ideal" },
        { name: "audience_channel", type: "text", label: "Cómo llegan hoy los clientes" },
        { name: "audience_geo", type: "text", label: "Zona geográfica" },
      ],
    },
    {
      title: "Contenido y funcionalidades",
      hint: "Qué tendrá el sitio.",
      fields: [
        { name: "pages_est", type: "text", label: "Páginas estimadas" },
        { name: "catalog", type: "text", label: "Catálogo (cantidad aprox.)" },
        { name: "lang", type: "text", label: "Idioma del sitio" },
        {
          name: "features",
          type: "checkbox",
          label: "Funcionalidades",
          options: [
            "Formulario de contacto",
            "WhatsApp flotante",
            "Reservas-agendamiento",
            "Carrito y pagos online",
            "Galería-portafolio",
            "Mapa-ubicación",
            "Blog o novedades",
            "Newsletter",
          ],
        },
      ],
    },
    {
      title: "Stack y diseño",
      hint: "Infraestructura y marca.",
      fields: [
        { name: "domain", type: "text", label: "Dominio (tiene / hay que comprar)" },
        { name: "hosting", type: "text", label: "Hosting / deploy" },
        { name: "cms", type: "text", label: "CMS necesario" },
        { name: "db", type: "text", label: "Base de datos" },
        {
          name: "content_manager",
          type: "radio",
          label: "¿Quién administra contenido?",
          options: ["El cliente solo", "Christian", "Mixto"],
        },
        { name: "brand_colors", type: "text", label: "Colores de marca" },
        { name: "brand_fonts", type: "text", label: "Fuentes actuales" },
        {
          name: "assets",
          type: "checkbox",
          label: "Materiales disponibles",
          options: ["Logo", "Fotos", "Videos", "Ninguno"],
        },
        { name: "refs", type: "textarea", label: "Sitios de referencia" },
      ],
    },
    {
      title: "Negocio",
      hint: "Comercial y cierre.",
      fields: [
        { name: "integrations", type: "textarea", label: "Integraciones (CRM, analytics, pixels)" },
        { name: "budget", type: "text", label: "Presupuesto acordado" },
        { name: "deadline", type: "text", label: "Fecha límite" },
        { name: "payment", type: "text", label: "Forma de pago" },
        {
          name: "retainer",
          type: "radio",
          label: "Retainer post-entrega",
          options: ["Sí", "No"],
        },
        { name: "notes", type: "textarea", label: "Notas y puntos abiertos" },
      ],
    },
  ],
};
