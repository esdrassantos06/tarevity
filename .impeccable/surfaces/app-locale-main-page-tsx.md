---
version: 1
slug: 'app-locale-main-page-tsx'
primary_target: 'app/[locale]/(main)/page.tsx'
related_targets: ['app/globals.css', 'components/pages/dashboard-client.tsx']
---

# Tarevity: whole-app redesign (Repartição)

Scope: every surface (landing, auth, dashboard kanban, task detail/create/edit, calendar, profile, settings, admin, header/footer, legal). Landing is Persuade; everything behind auth is Operate. Audience: people organizing tasks plus recruiters judging craft. Dashboard becomes a kanban with one column per status.

## Direction contract

THESIS: Every task is a numbered requisition form that only closes with a stamp: VISTO when it enters Review, ARQUIVADO when completed. Refuses the centered SaaS hero, icon-feature grid, and neutral shadcn cards.

OWN-WORLD: Forms printed in one spot color (print blue) on white paper: ruled fields, small caps field labels, frame rules, perforations. Filled values in carbon black typewriter face. Rubber stamps in violet (VISTO), red (URGENTE, overdue), green-black (ARQUIVADO), double-ruled, rotated, multiplied ink. Kanban columns are desk trays printed on carbon copies: white, canary, pink. Dark theme is the carbon sheet itself: blue-black paper, pale impressions. Square corners (2px), hairline rules, no soft cards.

STORY: Visitor sees a real filled form demonstrating the mechanism, understands the Review gate, registers via the stub. User scans three trays, drags a form across, sees the stamp land.

FIRST VIEWPORT: Landing at 1440: a full-width form sheet "Requisição de Tarefa Nº 0001" with header band (Tarevity, number, date). Left two-thirds: the headline typed large into the Assunto field, description in the Observações field, primary CTA as perforated stub at the right edge ("Entregar / Criar conta"). Right third: three stacked mini forms showing Em curso, VISTO, ARQUIVADO stamps. Signature interaction: stamp lands with a press (scale 1.15 to 1, ink blur to sharp) when a task changes status, on landing load and on kanban drop.

FORM: Office requisition forms and rubber stamps, position 3 of the ordered list; seed key 84760290.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Raised from challengers

- Absence drawn: empty and loading states are blank ruled fields, never grey skeletons.
- One stamp per state, identical everywhere a task appears.
- Due date as a perforated stub on each form counting days left.
- Carbon copy shows the previous stamp faded under the current one.
- Registry band on each form: created, days in progress, due.
