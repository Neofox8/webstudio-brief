// Client-mode form definition (5 steps).
// Field types: "text" | "textarea" | "radio" | "checkbox".
// Checkbox fields are stored in the `checks` jsonb column; everything else in `data`.
window.WS = window.WS || {};

window.WS.clientForm = {
  mode: "cliente",
  title: "Cuéntanos sobre tu proyecto",
  subtitle: "5 pasos cortos. Toma unos minutos.",
  steps: [
    {
      title: "Negocio",
      hint: "Lo básico sobre tu negocio.",
      fields: [
        { name: "biz_name", type: "text", label: "Nombre del negocio" },
        { name: "biz_desc", type: "textarea", label: "¿A qué se dedica?" },
        { name: "biz_location", type: "text", label: "¿Dónde opera?" },
        { name: "biz_web", type: "text", label: "Web o redes actuales (si tiene)" },
      ],
    },
    {
      title: "Audiencia",
      hint: "Quién te compra y cómo te encuentra.",
      fields: [
        { name: "audience_profile", type: "textarea", label: "¿Quién es tu cliente típico?" },
        { name: "audience_channel", type: "text", label: "¿Cómo te encuentran hoy?" },
      ],
    },
    {
      title: "Web",
      hint: "Qué necesitas que haga el sitio.",
      fields: [
        { name: "web_goal", type: "textarea", label: "¿Para qué necesitas la web?" },
        { name: "web_pages", type: "text", label: "¿Qué secciones se te ocurren?" },
        {
          name: "ecommerce",
          type: "radio",
          label: "¿Vendes con pago online?",
          options: ["Sí", "No", "Todavía no lo sé"],
        },
      ],
    },
    {
      title: "Diseño",
      hint: "El estilo y lo que ya tienes.",
      fields: [
        { name: "style_desc", type: "text", label: "¿Cómo describirías el estilo que quieres?" },
        { name: "refs", type: "textarea", label: "2 o 3 webs que te gusten" },
        {
          name: "assets",
          type: "checkbox",
          label: "¿Qué materiales ya tienes?",
          options: ["Tengo logo", "Tengo fotos", "Tengo videos", "No tengo nada"],
        },
      ],
    },
    {
      title: "Gestión y plazos",
      hint: "Cómo lo mantendrás y para cuándo.",
      fields: [
        {
          name: "self_manage",
          type: "radio",
          label: "¿Tú mismo actualizarás el contenido?",
          options: ["Sí", "No", "A veces"],
        },
        { name: "update_freq", type: "text", label: "¿Con qué frecuencia cambiarías cosas?" },
        { name: "deadline", type: "text", label: "¿Para cuándo necesitas la web lista?" },
        { name: "budget", type: "text", label: "Presupuesto acordado o estimado" },
        { name: "extra", type: "textarea", label: "Algo más que quieras agregar" },
      ],
    },
  ],
};
