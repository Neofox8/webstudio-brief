# Web Studio — _INDEX

## Estado general
Proyecto matriz activo. Pipeline operativo.

## Brief App
- URL: https://webstudio-brief.netlify.app/
- Repo: https://github.com/Neofox8/webstudio-brief
- Deploy: Netlify (estático, raíz plana)
- DB: Supabase — proyecto xsbjeswurcxbhawpfjav
- Email: EmailJS service_5c0ppfv / template_nxdpkj8
- Modo Investigador: ?mode=investigador&pin=<INVESTIGATOR_PIN>
- Estado: ✅ Production-ready (envío verificado en prod 2026-06-05)

## Pipeline de clientes
| Cliente | Estado | Proyecto Claude |
|---|---|---|
| Winaray — Christian Levano | Form arreglado, pedir reenvío de brief | Pendiente crear |

## Pendientes técnicos
- [x] RLS verificado: activo, policy insert_only (INSERT) para anon
- [x] Grants de anon reducidos a solo INSERT (REVOKE ALL + GRANT INSERT, verificado 2026-06-05)
- [ ] Formatear email template con saltos de línea
- [ ] Probar Modo Investigador en producción
- [ ] (seguridad) PIN investigador legible en env-config.js público — evaluar gating real en backend

## Incidente 2026-06-05 — el formulario no guardaba briefs
- Síntoma: el cliente veía "No pudimos guardar tu brief" al enviar.
- Causa raíz: saveBrief usaba insert(row).select(). Bajo RLS con policy
  solo-INSERT (sin policy SELECT para anon), el .select() dispara 42501
  "new row violates row-level security policy" y revierte el INSERT completo.
- Fix: quitar .select() de saveBrief (commit 9339aed). INSERT sin select → 201.
- Higiene: REVOKE ALL + GRANT INSERT a anon (antes tenía SELECT/UPDATE/DELETE de más).
- Verificado en prod vía REST: INSERT anon → 201; SELECT anon → 42501 bloqueado.

## Stack base Web Studio
- Deploy: Netlify · DB: Supabase · Notificación: EmailJS
- Builder: Claude Code · Repo: GitHub (Neofox8)

## Sesión 2025-05-31
- Diseñados formularios Modo Cliente y Modo Investigador
- Built y deployada Brief App completa
- Brief enviado a primer cliente: Winaray

## Sesión 2026-06-05
- Resuelto incidente de envío (ver arriba). Envío operativo end-to-end en prod.
