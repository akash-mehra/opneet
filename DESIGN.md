---
name: opneet study desk
description: Original quiet paper and green interface for personal NEET UG practice.
colors:
  forest: "#214d3b"
  forest-hover: "#183e2e"
  on-forest: "#f7f8ee"
  forest-soft: "#e7eee3"
  clay: "#9c5435"
  blue: "#345d81"
  paper: "#f7f8f2"
  surface: "#ffffff"
  ink: "#202d28"
  muted: "#647168"
  line: "#e0e6dd"
  focus: "#7b9142"
typography:
  body:
    fontFamily: '"DM Sans Variable", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  heading:
    fontFamily: '"DM Sans Variable", sans-serif'
    fontSize: "34px"
    fontWeight: 650
    lineHeight: 1.22
    letterSpacing: "-0.025em"
rounded:
  input: "8px"
  button: "9px"
  card: "12px"
  panel: "14px"
spacing:
  small: "8px"
  medium: "16px"
  desktop-gutter: "42px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.forest-hover}"
---

## Overview

An original, calm study desk with familiar QBank learning patterns. Mode: Operate. The main action is choosing and completing a manageable learning task. Continuity, explicit feedback and focused revision inform the experience. The app is named opneet; see PRODUCT.md for product decisions.

## Colors

Paper and white surfaces carry ink text and muted supporting details. Forest identifies primary actions, selected navigation and Biology; blue identifies Physics and exam panels; clay identifies Chemistry and incorrect-answer feedback. Subject labels and answer verdicts accompany color.

The frontmatter records the light theme. Sepia and dark override semantic colors in src/theme.css; the exact palettes are also captured in .impeccable/design.json. The navigation rail and start panel retain their fixed dark green treatment across themes.

## Typography

Self-hosted DM Sans Variable serves both interface text and reading content. Headings use tight spacing; small supporting labels are subordinate to questions and actions. Desktop page headings use the heading token; mobile page headings reduce to 28px. Time and score displays use tabular figures. Larger reading mode changes question, option, explanation and takeaway sizes rather than scaling the whole interface.

## Layout

Desktop uses a fixed navigation rail (228px, reducing to 200px at 1180px), a top search bar and a centered content canvas capped at 1320px. The home overview combines task panels with three subject cards. Study sessions use a separate reading layout and question palette.

Tablet (701–950px) uses a compact icon rail (76px). Navigation keeps accessible names; hover and keyboard focus reveal text tooltips. Phone layouts (700px and below) use a compact header, search below it and fixed bottom navigation. Task panels stack and subject cards become divided rows. Study sessions have sticky question actions and an expandable question navigator. Narrow-phone adjustments apply at 370px.

## Elevation & Depth

Flat surfaces and quiet borders organize study content. Panels use filled backgrounds rather than decorative imagery or graphs. Native modal dialogs provide the blocking interaction layer. Feedback uses a small vertical entrance transition; reduced-motion preference removes animations and transitions.

## Shapes

Inputs and icon controls use gently curved corners; primary buttons, cards and task panels use the distinct radii in frontmatter. Phone subject rows remove card borders and rounded grouping in favor of horizontal dividers. Answer options remain generous selectable rows.

## Components

Primary, secondary and cream action buttons have explicit hover/pressed/disabled treatments. Main buttons, inputs and icon controls generally provide 44px targets; compact buttons, text actions and some study controls are smaller. Do not interpret this system as a universal 44px guarantee. Keyboard focus uses an offset 3px ring.

Question options distinguish selected, correct and incorrect states. Practice feedback follows an explicit check; exam explanations appear after submission. Correctness has verdict text and icons alongside color. Bookmarks, guesses, flags and question-palette states remain distinct controls and indicators.

Empty states explain the next available action; reviewed-bank emptiness stays explicit. Sample content is labeled. Storage failures expose recovery actions. Dialog headings supply accessible names; native modal behavior supports Escape and the invoking control regains focus after closing.

## Do's and Don'ts

**The Study Evidence Rule.** Display activity and results from actual local records. Keep sample and reviewed content distinguishable.

**The Reading Rule.** Preserve question legibility, clear answer states and reachable session actions across themes and widths.

**The Originality Rule.** Use general learning patterns without copying another product's branding, assets or screens. Avoid invented progress, decorative charts and unnecessary imagery.
