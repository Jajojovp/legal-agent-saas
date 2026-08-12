# UI Review Checklist — Phase 0 (audit documental)

- **Versión de revisión:** 2026-08-11
- **Espec vinculante:** `specs/14-review/ui-review.spec.md` R1–R12.
- **Puerta maestra:** `specs/14-review/final-review.spec.md` (R6 exige esta revisión firmada).
- **Documento maestro:** `docs/release/2026-08-11-phase0-final-review.md` (sección 6).
- **Reviewer autoidentificado:** `Executive Orchestrator — Phase 0 audit coordinator` (rol técnico, no aprobación humana).
- **Alcance:** Phase 0 = **auditoría estática documental del checkout**. **No se renderizó UI** en staging ni browser. Sin Figma entregado. La evidencia es inferida por lectura de `app/[locale]/**`, `components/**` y `CURRENT_STATE §3.5`.
- **Cambios en Phase 0:** exclusivamente Markdown (sin cambios en componentes, layouts, páginas ni CSS).
- **Estado global:** `CONDITIONAL` — la mayoría de reglas R1–R12 son `N/A` o `❓` por falta de render. La spec exige firma humana externa del `ux-ui-designer` + Quality Reviewer → `EXTERNAL_SIGN-OFF_REQUIRED`.

---

## 1. Reglas aplicables y no aplicables en este Phase 0

| R | Regla (spec) | Aplica | Justificación |
|---|---|---|---|
| R1 | Fidelidad visual a Figma (±2px) | ❌ No aplica | Sin Figma entregado; auditoría de repo. |
| R2 | Responsividad en breakpoints 375/768/1024/1440 | ❌ No aplica | No se renderizó la app. |
| R3 | Estados interactivos (hover/focus/active/...) | ❌ No aplica | No se renderizó. |
| R4 | WCAG 2.1 AA — contraste, teclado, ARIA, focus visible | ✅ Aplica (lectura) | Hallazgo: `CURRENT_STATE §3.5` declara “NO VERIFICADO”; sin tests a11y. |
| R5 | Copy sin placeholders | ✅ Aplica (lectura) | No inspeccionado en profundidad — `❓`. |
| R6 | Estados vacíos (sin datos/primera visita/error/éxito) | ❌ No aplica | No se renderizó. |
| R7 | Estados de carga (skeleton/spinner) | ❌ No aplica | No se renderizó. |
| R8 | Estados de error con CTA accionable | ❌ No aplica | No se renderizó. |
| R9 | Preferencias usuario (dark/light/reduced motion/locale) | ✅ Aplica (lectura) | i18n en/es implementado; sin dark/light ni reduced-motion verificado. |
| R10 | Imágenes responsive (srcset) y lazy loading | ❌ No aplica | No se inspeccionaron assets. |
| R11 | Tap target mínimo 44px en mobile | ❌ No aplica | No se renderizó. |
| R12 | Desviaciones aceptadas con justificación + ticket deuda | N/A | No se emitió decisión de desviación (no se renderizó). |

---

## 2. Evidencia por regla

| R | Estado | Evidencia |
|---|---|---|
| R1 | ❓ | Sin Figma. Layout existe en `app/[locale]/{page,pricing,sales,blog,tools}` y `app/[locale]/(dashboard)/dashboard/{...}`. No verificado. |
| R2 | ❓ | `app/[locale]` usa Tailwind; responsive classes presumido; no verificado en 4 breakpoints. |
| R3 | ❓ | Componentes Radix (`components/ui/*`) implementan estados estándar; no verificado en rutas reales. |
| R4 | ❌ | `CURRENT_STATE §3.5`: “Accessibility / a11y auditada → NO VERIFICADO”. Sin `axe`/`pa11y`/tests a11y. |
| R5 | ❓ | Copy bilingüe vía `next-intl` (`messages/en.json`, `messages/es.json`); ausencia de placeholders literales no inspeccionada. |
| R6 | ❓ | `app/[locale]/(dashboard)/...` incluye rutas que consultan APIs; estados vacíos no verificados sin DB. |
| R7 | ❓ | Sin inspección visual. |
| R8 | ❓ | Errores de API en `app/api/**` se loguean a `console.error` (S-9); UX de error al usuario no auditado. |
| R9 | ◐ | i18n en/es ✓ (`cap-i18n` en `docs/CAPABILITY_MATRIX.md §H`); dark mode y reduced-motion: no verificados. |
| R10 | ❓ | Sin inspección de `<Image srcset>`/`next/image`. |
| R11 | ❓ | Sin inspección. |
| R12 | N/A | No se emitieron desviaciones aceptadas en Phase 0. |

---

## 3. Criterios de aceptación de la spec

| Criterio | Estado | Notas |
|---|---|---|
| Checklist firmado por diseñador y Quality Reviewer | `CONDITIONAL` / `EXTERNAL_SIGN-OFF_REQUIRED` | Firma técnica abajo. Diseñador humano externo pendente. |
| 0 defectos de accesibilidad AA en flujo crítico | ❌ | No se ejecutó auditoría a11y. |
| Estados vacíos y de error cubiertos | ❓ | No verificado sin render. |

---

## 4. Riesgos abiertos (blockers para cualquier release futuro con UI)

| Riesgo | spec ref | Severidad | Owner rol | Criterio de cierre |
|---|---|---|---|---|
| Sin a11y audit (WCAG 2.1 AA) | R4 | P1 | ux-ui-designer | Auditoría `axe`/`pa11y` en 4 breakpoints; 0 defectos en flujo crítico. |
| Sin verificación de copy/estados vacíos/estados de error | R5/R6/R7/R8 | P2 | ux-ui-designer | Recorrido visual en staging con datos reales y vacíos; capturas archivadas. |
| Sin dark mode / reduced motion | R9 | P3 | ux-ui-designer | Implementar y testar; user preference persisted. |
| Sin Figma / design system formal | R1/R12 | P3 | ux-ui-designer | Design tokens + Figma entregado; 0 desviaciones aceptadas con ticket. |

**Criterio de cierre del checklist:** UI renderizada en staging (4 breakpoints); auditoría a11y con 0 defectos en flujo crítico; estados vacíos/carga/error/éxito cubiertos con capturas; desviaciones documentadas con ticket de deuda; firma humana externa del `ux-ui-designer` + Quality Reviewer registrada.

---

## 5. Firma

- **Reviewer:** `Executive Orchestrator — Phase 0 audit coordinator`
- **Resultado:** `CONDITIONAL`
- **Declaración:** Esta firma **no** constituye aprobación de producción. Es evidencia documental mínima por lectura del checkout. La spec exige revisión en staging con UI renderizada; al no estar en el alcance Phase 0, las reglas R1/R2/R3/R6/R7/R8/R10/R11 quedan `N/A` o `❓`. La spec exige firma humana externa → `EXTERNAL_SIGN-OFF_REQUIRED`.
- **Externos pendentes:** `ux-ui-designer` (firma humana externa), `quality-reviewer` (firma humana externa).
- **Fecha:** 2026-08-11