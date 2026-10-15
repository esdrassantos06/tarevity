---
name: Tarevity
description: A task manager where every task is a numbered requisition form that closes with a rubber stamp.
colors:
  print: '#2742a0'
  ink: '#1b2130'
  paper: '#f6f6f1'
  sheet: '#ffffff'
  rule: '#c5cce0'
  field-rule: '#aeb7d0'
  muted-ink: '#4a5576'
  tint: '#eceef5'
  hover-tint: '#e3e7f3'
  stamp-violet: '#5a3aa6'
  stamp-red: '#c2302a'
  stamp-green: '#2c6a46'
  via-white: '#ffffff'
  via-canary: '#fbf1b8'
  via-pink: '#f9dce2'
  carbon-paper: '#10141e'
  carbon-sheet: '#181e2c'
  carbon-ink: '#e5e8f1'
  carbon-print: '#93a9f2'
  carbon-rule: '#33405f'
typography:
  display:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 3.4vw, 3rem)'
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: '-0.02em'
    fontVariation: "'wdth' 80"
  headline-typed:
    fontFamily: 'Courier Prime, ui-monospace, monospace'
    fontSize: 'clamp(2.6rem, 6vw, 5.5rem)'
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: '-0.03em'
  title:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 700
    lineHeight: 1
    fontVariation: "'wdth' 85"
  typed-value:
    fontFamily: 'Courier Prime, ui-monospace, monospace'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
  typed-title:
    fontFamily: 'Courier Prime, ui-monospace, monospace'
    fontSize: '1.05rem'
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "'tnum' 1"
  label:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '0.6875rem'
    fontWeight: 600
    letterSpacing: '0.08em'
    fontVariation: "'wdth' 85"
  stamp:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 800
    lineHeight: 1
    letterSpacing: '0.06em'
    fontVariation: "'wdth' 70"
  button:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    letterSpacing: '0.02em'
  nav:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    letterSpacing: '0.06em'
rounded:
  fine: '2px'
  sheet: '3px'
spacing:
  field-x: '16px'
  sheet-x: '20px'
  sheet-x-wide: '32px'
  stack: '12px'
  tray-gap: '16px'
  gutter: '16px'
  gutter-sm: '24px'
  gutter-lg: '40px'
  section: '64px'
  section-lg: '96px'
  container: '1440px'
components:
  button-primary:
    backgroundColor: '{colors.print}'
    textColor: '{colors.sheet}'
    typography: '{typography.button}'
    rounded: '{rounded.sheet}'
    padding: '8px 16px'
    height: '36px'
  button-outline:
    backgroundColor: '{colors.sheet}'
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.sheet}'
    padding: '8px 16px'
    height: '36px'
  button-outline-hover:
    textColor: '{colors.print}'
  button-ghost:
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.sheet}'
    padding: '8px 16px'
    height: '36px'
  button-ghost-hover:
    backgroundColor: '{colors.hover-tint}'
    textColor: '{colors.print}'
  button-destructive:
    backgroundColor: '{colors.stamp-red}'
    textColor: '{colors.sheet}'
    typography: '{typography.button}'
    rounded: '{rounded.sheet}'
    height: '36px'
  input:
    backgroundColor: '{colors.sheet}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.sheet}'
    padding: '4px 12px'
    height: '40px'
  field-label:
    textColor: '{colors.print}'
    typography: '{typography.label}'
  stamp-active:
    textColor: '{colors.print}'
    typography: '{typography.stamp}'
    rounded: '{rounded.sheet}'
    padding: '0.2em 0.55em'
  stamp-review:
    textColor: '{colors.stamp-violet}'
    typography: '{typography.stamp}'
    rounded: '{rounded.sheet}'
    padding: '0.2em 0.55em'
  stamp-filed:
    textColor: '{colors.stamp-green}'
    typography: '{typography.stamp}'
    rounded: '{rounded.sheet}'
    padding: '0.2em 0.55em'
  stamp-urgent:
    textColor: '{colors.stamp-red}'
    typography: '{typography.stamp}'
    rounded: '{rounded.sheet}'
    padding: '0.2em 0.55em'
  task-form:
    backgroundColor: '{colors.sheet}'
    textColor: '{colors.ink}'
    padding: '12px 16px 16px'
  tray-active:
    backgroundColor: '{colors.via-white}'
  tray-review:
    backgroundColor: '{colors.via-canary}'
  tray-filed:
    backgroundColor: '{colors.via-pink}'
  checkbox:
    textColor: '{colors.sheet}'
    rounded: '{rounded.fine}'
    size: '16px'
---

# Design System: Tarevity

## Overview

**Creative North Star: "The Repartição"**

Tarevity is a public office's paperwork, run honestly. Every task is a numbered requisition form printed in one spot color on white stock: ruled fields, small condensed field labels, a heavy frame rule under the header band, perforated stubs. What the user writes is typed onto the form in a carbon typewriter face. State is never a pill or a colored dot. It is a rubber stamp, double-ruled, rotated, inked, and pressed onto the sheet when the task changes hands.

The board is a desk with three trays. Each tray is a carbon copy of a different color: the white copy for work in progress, the canary copy for work waiting on review, the pink copy for the archive. The dark theme is not an inverted light theme. It is the carbon sheet itself: blue-black paper with pale impressions of the same print blue, violet, red and green.

Density is that of a well-designed form: hairline rules divide fields, labels are tiny and exact, values are large enough to read across a desk. Decoration earns its place only when a real form would carry it (a form number, a date, a perforation, a stamp). The landing page and the app share the same paper; the landing simply shows one filled form at full size.

**Key Characteristics:**

- One spot color (print blue) carries every printed element: labels, frame rules, links, focus, primary actions.
- User content is typed (Courier Prime); system furniture is printed (Archivo, condensed via the `wdth` axis); running prose is Public Sans.
- Status is a stamp, one per state, identical in every place a task appears.
- Hairline rules and near-square corners (2px to 3px). Paper sits flat on the desk.
- Carbon copies (white, canary, pink) tint whole trays, never individual widgets.

## Colors

A single print-blue spot color on off-white paper, with three stamp inks and three carbon-copy tints. Every color maps to a physical material on the desk.

### Primary

- **Print Blue** (`print`): the ink the forms are printed in. Field labels, the 2px frame rule under every form header, the double 3px rule under the site header, form numbers, links, focus outlines, caret, selection tint (22% mix), the primary button, and the "in progress" stamp. In dark mode it lifts to **Carbon Print** (`carbon-print`).

### Secondary

- **Stamp Violet** (`stamp-violet`): the "For review / Para visto" stamp only. It marks the Review gate, the product's defining step.
- **Stamp Green** (`stamp-green`): the "Filed / Arquivado" stamp only. A green-black ink, closer to a ledger than a success toast.

### Tertiary

- **Stamp Red** (`stamp-red`): the "Urgent" stamp on high-priority forms, overdue day counts, destructive actions, and form errors. Red is reserved for urgency and loss.

### Neutral

- **Desk Paper** (`paper`): page background behind all sheets.
- **Form Stock** (`sheet`): the white of every form, sheet, input, popover, and the white tray.
- **Carbon Black Ink** (`ink`): typed values and body text.
- **Faded Ink** (`muted-ink`): descriptions, hints, inactive nav, placeholders.
- **Hairline Rule** (`rule`): every field divider and sheet border; also the scrollbar thumb.
- **Field Rule** (`field-rule`): input and outline-button strokes, and the rim of perforation holes. One step darker than the hairline so editable fields read as editable.
- **Tint** (`tint`) and **Hover Tint** (`hover-tint`): secondary fills, ghost-button hover, avatar fallback.
- **Carbon copies** (`via-white`, `via-canary`, `via-pink`): tray backgrounds for Active, Review, Completed, and the landing's three sample copies. The canary copy also backs the landing CTA stub.
- **Carbon sheet, dark** (`carbon-paper`, `carbon-sheet`, `carbon-ink`, `carbon-rule`): the dark theme's paper, form stock, ink and rule. Dark stamps lift to pale inks (violet #b8a2f7, red #ff8a7d, green #84cfa1) and the carbon copies become #1b2233, #262618 and #2b1e27.

### Named Rules

**The One Spot Color Rule.** Everything printed on the form is print blue. No second interface accent exists; violet, green and red are stamp inks and appear only as stamps, or red for urgency and loss.

**The Copy Tints the Tray Rule.** Canary and pink belong to whole trays (and the landing's copies and stub). They never fill a button, badge, or individual field.

## Typography

**Display / Printed Font:** Archivo (variable, with the `wdth` axis), fallback system-ui
**Typed Font:** Courier Prime 400 and 700, fallback ui-monospace
**Body Font:** Public Sans, fallback system-ui

**Character:** Archivo is the press that printed the blank form; its width axis condenses labels (85%) and stamps (70%) and widens the wordmark (125%). Courier Prime is whoever filled the form in. Public Sans is the plain government sans for instructions and prose. Tabular figures are on globally (`tnum`).

### Hierarchy

- **Display** (Archivo 800, `clamp(2rem, 3.4vw, 3rem)`, 1.02, width 80%): page titles such as the board heading and landing section headings.
- **Headline, typed** (Courier Prime 700, `clamp(2.6rem, 6vw, 5.5rem)`, 0.98, -0.03em): the task subject typed into the Subject field on the landing and task detail. Max 16ch on the landing.
- **Title** (Archivo 700, 1.25rem, 1, width 85%): tray names, dialog titles, definition-list terms.
- **Typed title** (Courier Prime 700, 1.05rem, 1.375): task titles on board forms.
- **Typed value** (Courier Prime 400, 0.875rem): every filled field value: dates, form numbers, counts, assignee.
- **Body** (Public Sans 400, 1rem, 1.625): descriptions and prose, held to 46ch to 62ch.
- **Label** (Archivo 600, 0.6875rem, 0.08em, uppercase, width 85%, print blue): field labels. The `.field-label` class.
- **Stamp** (Archivo 800, width 70%, 0.06em, uppercase, line-height 1): stamp text; size is set per placement (0.65rem on a priority stamp, 0.875rem on a form footer, 1.125rem to 1.875rem on the landing).

### Named Rules

**The Typed Versus Printed Rule.** If the user wrote it, it is Courier Prime. If the form printed it, it is Archivo. Never set a user's task title in Archivo or a field label in Courier.

**The Field Label Rule.** A field label names the value directly beneath or beside it, the way a printed form does. It never floats alone above a section headline as an eyebrow.

## Layout

The page is a desk, centered at a 1440px container with side gutters of 16px, 24px (from 640px) and 40px (from 1024px). Forms are built as grids of ruled cells: a header band, then full-width or split fields separated by 1px hairlines, with a 2px print-blue rule under the header band. Sheet insets are 20px on mobile and 32px from 640px; board forms use 16px.

The landing hero is one form sheet that splits at 1024px into a main column and a 15rem perforated stub on the right (canary copy, perforation on its left edge; on mobile the stub drops below with a horizontal perforation on top). Beside it, a 17rem column stacks three sample carbon copies, each rotated slightly (-0.4deg and 0.6deg). Sections below are separated by full-bleed hairlines with 64px vertical padding (96px at 1024px for the closing section).

The board is three trays. From 1024px they sit in an equal three-column grid with a 16px gap. Below 1024px the trays become a horizontal scroll-snap row, each tray 85vw wide (max 28rem), so one tray reads at a time. Forms stack inside a tray with a 12px gap.

## Elevation & Depth

Paper sits flat. Depth comes from rules, tints and stacking order, not from lifted surfaces. Forms on a tray carry only a contact shadow, the shadow a sheet makes resting on another sheet. Shadows grow only in response to handling (a dragged form) or for things that truly float over the page (menus, popovers, dialogs).

### Shadow Vocabulary

- **Contact** (`box-shadow: 0 1px 2px rgb(27 33 48 / 0.08)`): board forms and the landing's sample copies at rest.
- **Handled** (`box-shadow: 0 8px 20px -10px rgb(27 33 48 / 0.35)`, with a 1px lift): a draggable form on hover.
- **Floating** (`box-shadow: 0 10px 30px -12px rgb(27 33 48 / 0.35)`): popover, select, dropdown menu, dialog, alert dialog.
- **Key press** (`box-shadow: inset 0 -2px 0 rgb(0 0 0 / 0.18)`): bottom lip on the primary button; the button drops 1px on press.

### Named Rules

**The Flat Desk Rule.** A sheet at rest never carries more than the contact shadow. Bigger shadows are for handling and floating layers only.

## Shapes

Corners are nearly square: 3px on sheets, buttons, inputs, avatars, stamps and the wordmark frame; 2px on checkboxes and small icon targets. Nothing is pill-shaped or fully round, including avatars. Borders are 1px hairlines; the heavy marks are the 2px print-blue frame rule under form and tray headers, the 3px double rule under the site header, and dashed rules for the tear line above a form's footer and for empty tray slots.

Two printed devices recur:

- **Perforation**: a row or column of punched holes (`.perforation-x`, `.perforation-y`), 10px track, holes 2.5px radius filled with desk paper and rimmed in field rule, spaced 12px. It marks a detachable stub: the landing CTA stub, the auth sheet footer, the task form footer.
- **Double rule**: a 2px stroke with a 1px outline offset 2px. Used by stamps and the wordmark's "T" frame and the app mark.

## Components

### Buttons

Printed, firm, and quiet. Archivo 600 at 0.875rem.

- **Shape:** 3px corners, 36px high (32px small, 44px large), 16px horizontal padding.
- **Primary:** print-blue fill, white text, inset bottom lip; hover drops to 90% fill; press translates down 1px.
- **Outline:** form-stock fill with a field-rule stroke; hover turns stroke and text print blue.
- **Ghost:** no fill; hover gets the hover tint and print-blue text.
- **Destructive:** stamp-red fill.
- **Link:** print-blue text, rule-colored underline offset 4px, underline turns print blue on hover.
- **Focus:** 2px print-blue outline offset 2px, on every interactive element.

### Inputs / Fields

- **Style:** form-stock fill, 1px field-rule stroke, 3px corners, 40px high, 12px horizontal padding, Public Sans at 1rem (0.875rem from 768px).
- **Focus:** stroke turns print blue plus the 2px print-blue outline offset 2px.
- **Error:** stroke turns stamp red.
- **Checkbox:** 16px square, 2px print-blue border, 2px corners, fills print blue with a white check when checked; its label is typed.
- **Labels:** always a field label (print blue, Archivo condensed caps) above the control.

### Navigation

- **Header:** sticky, desk paper at 85% to 95% with a small backdrop blur, closed by a 3px double print-blue rule. 64px tall.
- **Links:** Archivo 600, 0.875rem, 0.06em, uppercase, faded ink; hover turns ink. The active link turns print blue with a 3px print-blue bar sitting on the header rule.
- **Wordmark:** a 32px "T" in a double-ruled print-blue frame (Archivo 800, width 70%) beside "TAREVITY" (Archivo 700, 0.14em, width 125%). Mobile shows the frame alone.

### Stamp (signature)

The one state vocabulary of the product.

- **Form:** inline Archivo 800 caps at width 70%, 2px border plus 1px outline offset 2px in the same ink, 3px corners, rotated (default -6deg; -7deg on form footers, +3deg to +4deg for priority), 92% opacity, `multiply` blend on light paper so it reads as ink over print.
- **Tones:** print blue for In progress / Em curso, violet for For review / Para visto, green-black for Filed / Arquivado, red for Urgent.
- **Previous state:** the prior stamp is printed faded (20% to 25% opacity) behind and above the current one, as a carbon copy would show it.
- **Press:** when a task changes status (kanban drop, move buttons) and on landing load, the stamp lands with `stamp-press`: from scale 1.15, 2px blur and 35% opacity to sharp in 360ms on `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced motion collapses it to 1ms.

### Task Form (board card)

- **Header band:** typed print-blue form number ("Nº 0000T2") left; priority as a field label, or the Urgent stamp for high priority, right. Move, edit and delete icon buttons appear on hover or focus (always visible below 768px).
- **Body:** typed title, then up to two lines of Public Sans description.
- **Footer:** behind a dashed tear line: the Due field label, typed date with days left (red and bold when overdue), and the status stamp with its faded predecessor.
- **Shape:** form stock, 1px hairline border, square corners, contact shadow; the whole form is the link target.

### Tray (board column)

- **Fill:** the column's carbon copy (white, canary, pink), 1px hairline border, minimum height 448px.
- **Header:** Archivo title at width 85% with a one-line hint, typed count in print blue at 1.5rem, closed by the 2px print-blue frame rule.
- **Drop target:** 2px dashed print-blue outline offset 2px while a form hovers over it.
- **Empty and loading:** blank dashed-rule slots, never grey skeleton blocks. The skeleton primitive itself is a dashed hairline outline on a transparent fill.

### Form Sheet (task detail, create, edit, auth)

A `.sheet` (form stock, 1px hairline) with a header band holding the form name as a field label and the typed form number, then a grid of ruled field cells, each a field label over a typed value. Actions sit in a footer stub under a perforation. Dialogs reuse the same header band with the 2px frame rule.

## Do's and Don'ts

### Do:

- **Do** print every label, frame rule, link and focus ring in print blue, and nothing else in a second accent.
- **Do** type user content in Courier Prime and print form furniture in condensed Archivo.
- **Do** show status only as a stamp from the four tones, and show the same stamp wherever the task appears.
- **Do** press the stamp (`stamp-press`, 360ms) when status changes, and keep the faded previous stamp under it.
- **Do** draw empty and loading states as blank ruled or dashed fields.
- **Do** separate fields with 1px hairlines and close each header band with the 2px print-blue rule.
- **Do** mark detachable parts (CTA stub, form footer) with a perforation.
- **Do** keep corners at 3px (2px for checkboxes and small targets).

### Don't:

- **Don't** use colored pills, dots or toggles for task status.
- **Don't** fill buttons, badges or fields with canary or pink; those tints belong to trays.
- **Don't** use stamp violet or stamp green outside their stamps.
- **Don't** give a sheet at rest more than the contact shadow, and don't use rounded-card SaaS surfaces.
- **Don't** use grey skeleton blocks for loading.
- **Don't** put a field label above a section headline as an eyebrow.
- **Don't** round avatars or buttons into circles or pills.
- **Don't** set the dark theme by inverting light values; it is the carbon sheet with its own paper, rule and lifted inks.
