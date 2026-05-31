// Web Studio — Brief App engine.
// Renders a multi-step form from a config (client or investigator), shows an editable
// summary, persists to Supabase, then notifies via EmailJS and shows confirmation.
window.WS = window.WS || {};

(function () {
  "use strict";

  // ---------- Mode resolution ----------
  // Root URL => client. ?mode=investigador&pin=<INVESTIGATOR_PIN> => investigator.
  // A wrong/absent PIN silently falls back to client mode (no visible error).
  function resolveConfig() {
    var params = new URLSearchParams(window.location.search);
    var env = window.__env || {};
    if (
      params.get("mode") === "investigador" &&
      params.get("pin") &&
      params.get("pin") === env.INVESTIGATOR_PIN
    ) {
      return window.WS.investigatorForm;
    }
    return window.WS.clientForm;
  }

  // ---------- State ----------
  var config = resolveConfig();
  var stepIndex = 0;
  var formData = {}; // name -> string, or array for checkbox fields

  // ---------- DOM helpers ----------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function $(sel) {
    return document.querySelector(sel);
  }

  function getCheckboxValues(name) {
    return Array.isArray(formData[name]) ? formData[name] : [];
  }

  // ---------- Progress bar ----------
  function renderProgress(activeIndex) {
    var total = config.steps.length;
    var bar = el("div", { class: "ws-progress" });
    var track = el("div", { class: "ws-progress-track" });
    var pct = ((activeIndex + 1) / total) * 100;
    track.appendChild(el("div", { class: "ws-progress-fill", style: "width:" + pct + "%" }));
    bar.appendChild(track);

    var steps = el("div", { class: "ws-progress-steps" });
    config.steps.forEach(function (s, i) {
      var cls = "ws-step-dot";
      if (i < activeIndex) cls += " is-done";
      if (i === activeIndex) cls += " is-active";
      steps.appendChild(el("div", { class: cls, text: String(i + 1) }));
    });
    bar.appendChild(steps);
    bar.appendChild(
      el("div", {
        class: "ws-progress-label",
        text: "Paso " + (activeIndex + 1) + " de " + total + " · " + config.steps[activeIndex].title,
      })
    );
    return bar;
  }

  // ---------- Field rendering ----------
  function renderField(field) {
    var wrap = el("div", { class: "ws-field" });
    wrap.appendChild(el("label", { class: "ws-label", text: field.label, for: "f_" + field.name }));

    if (field.type === "text") {
      var input = el("input", {
        class: "ws-input",
        type: "text",
        id: "f_" + field.name,
        value: formData[field.name] || "",
      });
      input.addEventListener("input", function () {
        formData[field.name] = input.value;
      });
      wrap.appendChild(input);
    } else if (field.type === "textarea") {
      var ta = el("textarea", { class: "ws-input ws-textarea", id: "f_" + field.name, rows: "3" });
      ta.value = formData[field.name] || "";
      ta.addEventListener("input", function () {
        formData[field.name] = ta.value;
      });
      wrap.appendChild(ta);
    } else if (field.type === "radio") {
      var rgroup = el("div", { class: "ws-cards" });
      field.options.forEach(function (opt) {
        var selected = formData[field.name] === opt;
        var card = el("button", {
          type: "button",
          class: "ws-card-option" + (selected ? " is-selected" : ""),
        });
        card.appendChild(el("span", { class: "ws-card-tick" }));
        card.appendChild(el("span", { class: "ws-card-text", text: opt }));
        card.addEventListener("click", function () {
          formData[field.name] = opt;
          renderStep(); // re-render to reflect selection
        });
        rgroup.appendChild(card);
      });
      wrap.appendChild(rgroup);
    } else if (field.type === "checkbox") {
      var cgroup = el("div", { class: "ws-cards" });
      field.options.forEach(function (opt) {
        var current = getCheckboxValues(field.name);
        var selected = current.indexOf(opt) !== -1;
        var card = el("button", {
          type: "button",
          class: "ws-card-option" + (selected ? " is-selected" : ""),
        });
        card.appendChild(el("span", { class: "ws-card-check" }));
        card.appendChild(el("span", { class: "ws-card-text", text: opt }));
        card.addEventListener("click", function () {
          var vals = getCheckboxValues(field.name).slice();
          var idx = vals.indexOf(opt);
          if (idx === -1) vals.push(opt);
          else vals.splice(idx, 1);
          formData[field.name] = vals;
          renderStep();
        });
        cgroup.appendChild(card);
      });
      wrap.appendChild(cgroup);
    }
    return wrap;
  }

  // ---------- Step screen ----------
  function renderStep() {
    var step = config.steps[stepIndex];
    var root = $("#ws-root");
    root.innerHTML = "";

    var card = el("section", { class: "ws-panel" });
    card.appendChild(renderProgress(stepIndex));

    var head = el("div", { class: "ws-panel-head" });
    head.appendChild(el("h2", { class: "ws-panel-title", text: step.title }));
    if (step.hint) head.appendChild(el("p", { class: "ws-panel-hint", text: step.hint }));
    card.appendChild(head);

    var fields = el("div", { class: "ws-fields" });
    step.fields.forEach(function (f) {
      fields.appendChild(renderField(f));
    });
    card.appendChild(fields);

    // Nav
    var nav = el("div", { class: "ws-nav" });
    if (stepIndex > 0) {
      var back = el("button", { type: "button", class: "ws-btn ws-btn-ghost", text: "Atrás" });
      back.addEventListener("click", function () {
        stepIndex--;
        scrollTop();
        renderStep();
      });
      nav.appendChild(back);
    } else {
      nav.appendChild(el("span", {}));
    }

    var isLast = stepIndex === config.steps.length - 1;
    var next = el("button", {
      type: "button",
      class: "ws-btn ws-btn-primary",
      text: isLast ? "Revisar brief" : "Siguiente",
    });
    next.addEventListener("click", function () {
      if (isLast) {
        renderSummary();
      } else {
        stepIndex++;
        scrollTop();
        renderStep();
      }
    });
    nav.appendChild(next);

    card.appendChild(nav);
    root.appendChild(card);
  }

  // ---------- Summary (editable) ----------
  function formatValue(field) {
    var v = formData[field.name];
    if (field.type === "checkbox") {
      var arr = getCheckboxValues(field.name);
      return arr.length ? arr.join(", ") : "—";
    }
    return v && String(v).trim() ? v : "—";
  }

  function renderSummary() {
    scrollTop();
    var root = $("#ws-root");
    root.innerHTML = "";

    var card = el("section", { class: "ws-panel" });
    var head = el("div", { class: "ws-panel-head" });
    head.appendChild(el("h2", { class: "ws-panel-title", text: "Revisa tu brief" }));
    head.appendChild(
      el("p", { class: "ws-panel-hint", text: "Edita cualquier paso antes de enviar." })
    );
    card.appendChild(head);

    config.steps.forEach(function (step, i) {
      var block = el("div", { class: "ws-summary-block" });
      var blockHead = el("div", { class: "ws-summary-head" });
      blockHead.appendChild(el("h3", { class: "ws-summary-title", text: step.title }));
      var editBtn = el("button", { type: "button", class: "ws-btn-link", text: "Editar" });
      editBtn.addEventListener("click", function () {
        stepIndex = i;
        scrollTop();
        renderStep();
      });
      blockHead.appendChild(editBtn);
      block.appendChild(blockHead);

      step.fields.forEach(function (f) {
        var row = el("div", { class: "ws-summary-row" });
        row.appendChild(el("span", { class: "ws-summary-key", text: f.label }));
        row.appendChild(el("span", { class: "ws-summary-val", text: formatValue(f) }));
        block.appendChild(row);
      });
      card.appendChild(block);
    });

    var status = el("div", { class: "ws-status", id: "ws-status" });
    card.appendChild(status);

    var nav = el("div", { class: "ws-nav" });
    var back = el("button", { type: "button", class: "ws-btn ws-btn-ghost", text: "Atrás" });
    back.addEventListener("click", function () {
      stepIndex = config.steps.length - 1;
      renderStep();
    });
    nav.appendChild(back);

    var submit = el("button", {
      type: "button",
      class: "ws-btn ws-btn-primary",
      id: "ws-submit",
      text: "Enviar brief",
    });
    submit.addEventListener("click", function () {
      handleSubmit(submit);
    });
    nav.appendChild(submit);
    card.appendChild(nav);

    root.appendChild(card);
  }

  // ---------- Payload assembly ----------
  function buildPayload() {
    var data = {};
    var checks = {};
    config.steps.forEach(function (step) {
      step.fields.forEach(function (f) {
        if (f.type === "checkbox") {
          checks[f.name] = getCheckboxValues(f.name);
        } else {
          var v = formData[f.name];
          data[f.name] = v === undefined ? "" : v;
        }
      });
    });

    var projectType = data.project_type || data.ecommerce || null;
    return {
      mode: config.mode,
      data: data,
      checks: checks,
      client_name: data.biz_name || null,
      project_type: projectType,
    };
  }

  function buildEmailParams(payload) {
    var d = payload.data;
    return {
      biz_name: d.biz_name || "",
      mode: payload.mode,
      client_contact: d.client_contact || "",
      project_type: payload.project_type || "",
      web_goal: d.web_goal || d.scope_line || "",
      deadline: d.deadline || "",
      budget: d.budget || "",
      extra: d.extra || d.notes || "",
    };
  }

  // ---------- Submit flow ----------
  async function handleSubmit(submitBtn) {
    var status = $("#ws-status");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";
    status.className = "ws-status";
    status.textContent = "";

    var payload = buildPayload();
    var res = await window.WS.saveBrief(payload);

    if (res.error) {
      // RLS or network error — do NOT notify, let the user retry.
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar brief";
      status.className = "ws-status is-error";
      status.textContent =
        "No pudimos guardar tu brief. Revisa tu conexión e inténtalo de nuevo.";
      return;
    }

    // Saved. Email is best-effort — never blocks confirmation.
    await window.WS.notify(buildEmailParams(payload));
    renderConfirmation();
  }

  // ---------- Confirmation ----------
  function renderConfirmation() {
    scrollTop();
    var root = $("#ws-root");
    root.innerHTML = "";
    var card = el("section", { class: "ws-panel ws-confirm" });
    card.appendChild(el("div", { class: "ws-confirm-mark", text: "✓" }));
    card.appendChild(el("h2", { class: "ws-panel-title", text: "¡Brief recibido!" }));
    card.appendChild(
      el("p", {
        class: "ws-confirm-lead",
        text: "Gracias. Ya tenemos toda la información para empezar a trabajar en tu proyecto.",
      })
    );

    var steps = el("ul", { class: "ws-next-steps" });
    [
      "Revisaremos tu brief con detalle.",
      "Te contactaremos para afinar lo necesario y pasarte una propuesta.",
      "Acordamos alcance, plazos y arrancamos.",
    ].forEach(function (t) {
      steps.appendChild(el("li", { text: t }));
    });
    card.appendChild(el("p", { class: "ws-confirm-sub", text: "Próximos pasos:" }));
    card.appendChild(steps);

    root.appendChild(card);
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", function () {
    var sub = $("#ws-subtitle");
    if (sub) sub.textContent = config.subtitle || "";
    renderStep();
  });
})();
