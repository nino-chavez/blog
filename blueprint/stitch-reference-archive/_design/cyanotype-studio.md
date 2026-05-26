---
name: Cyanotype Studio
colors:
  surface: '#fbfaee'
  surface-dim: '#dbdbcf'
  surface-bright: '#fbfaee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4e8'
  surface-container: '#efeee3'
  surface-container-high: '#e9e9dd'
  surface-container-highest: '#e4e3d7'
  on-surface: '#1b1c15'
  on-surface-variant: '#42474c'
  inverse-surface: '#303129'
  inverse-on-surface: '#f2f1e5'
  outline: '#72787d'
  outline-variant: '#c2c7cd'
  surface-tint: '#3c637c'
  primary: '#001c2b'
  on-primary: '#ffffff'
  primary-container: '#003249'
  on-primary-container: '#749bb6'
  inverse-primary: '#a4cbe8'
  secondary: '#006972'
  on-secondary: '#ffffff'
  secondary-container: '#73eefd'
  on-secondary-container: '#006b75'
  tertiary: '#131b1d'
  on-tertiary: '#ffffff'
  tertiary-container: '#273032'
  on-tertiary-container: '#8f989a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7e7ff'
  primary-fixed-dim: '#a4cbe8'
  on-primary-fixed: '#001e2e'
  on-primary-fixed-variant: '#224b63'
  secondary-fixed: '#8cf2ff'
  secondary-fixed-dim: '#5ad7e6'
  on-secondary-fixed: '#001f23'
  on-secondary-fixed-variant: '#004f56'
  tertiary-fixed: '#dbe4e6'
  tertiary-fixed-dim: '#bfc8ca'
  on-tertiary-fixed: '#141d1f'
  on-tertiary-fixed-variant: '#3f484a'
  background: '#fbfaee'
  on-background: '#1b1c15'
  surface-variant: '#e4e3d7'
  architectural-ink: '#001B29'
  blueprint-cyan: '#008B94'
  aged-paper: '#FDFCF0'
  carbon-trace: '#111827'
typography:
  display-lg:
    fontFamily: Bree Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Bree Serif
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.2'
  body-prose:
    fontFamily: Crimson Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-dense:
    fontFamily: Crimson Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.4'
  label-ui:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: -0.01em
  data-receipt:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
  status-code:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
spacing:
  unit: 4px
  gutter: 16px
  margin: 32px
  rail-width: 320px
  dense-gap: 8px
---

## Brand & Style

This design system establishes a high-density practitioner environment for software architects. The aesthetic rejects the airy, "low-friction" tropes of modern SaaS in favor of a **Saturated Editorial** posture. It draws inspiration from cyanotype drafting, technical blueprints, and the information density of 20th-century architectural journals.

The atmosphere is one of deliberate precision and confidence. It prioritizes "information over decoration," utilizing high-contrast color pairings and an uncompromisingly serif-led typographic hierarchy. The visual language is structured, ink-heavy, and dense, designed for users who treat their interface as a high-fidelity workshop rather than a casual dashboard.

## Colors

The palette is anchored in a **Cyanotype** logic: deep architectural inks and saturated cyans against a high-contrast ivory base.

- **Primary (Architectural Ink):** A deep, saturated blue used for primary typography and structural borders.
- **Secondary (Blueprint Cyan):** A vibrant, saturated cyan used for interactive elements, status highlights, and technical accents.
- **Neutral (Aged Paper):** A warm ivory that provides an "editorial" feel, reducing eye strain compared to pure white while maintaining high contrast.

The color application should be "flooded" rather than "accented." Large blocks of saturated ink surfaces should be used to define major workspace regions.

## Typography

The typographic strategy is "Serif-First" to evoke an editorial authority.

- **Headlines:** Bree Serif provides a slab-serif sturdiness that feels drafted and permanent.
- **Prose:** Crimson Pro is used for long-form architect-to-AI communication, ensuring deep legibility and a literary tone.
- **UI Labels:** Inter is strictly for functional utility. Avoid wide letter-spacing; keep labels tight and compact.
- **Data:** JetBrains Mono is used for "Receipt" blocks—immutable logs, agent status updates, and architectural coordinates.

Maintain vertical rhythm by aligning all text to a strict baseline, ensuring density does not sacrifice clarity.

## Layout & Spacing

This design system employs a **Structural Drafting** layout. It prioritizes vertical stacks and persistent sidebars over centered containers.

- **Dense Lists:** Information is organized in tight, stacked rows rather than cards.
- **Right Rail Anchor:** A persistent 320px right-hand rail serves as a structural anchor for metadata, agent state, and architectural parameters.
- **Receipt Blocks:** Fixed-width monospaced blocks that appear as "tapes" within the prose flow, documenting AI actions.
- **Grid:** Use a 12-column grid for the main canvas, but allow content to "bleed" into margins for an editorial feel.
- **Mobile:** On small screens, the right rail collapses into a bottom-anchored "Technical Sheet," preserving the high-density list structure.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Architectural Outlines** rather than shadows.

- **Stacking:** Use surface-on-surface layering. A deep blue sidebar sitting on an ivory canvas creates hierarchy without the need for blurs.
- **Outlines:** Use crisp 1px or 2px borders in `architectural-ink` or `blueprint-cyan` to define regions. 
- **The "Blueprint" Effect:** Active states are indicated by flooding a container with `blueprint-cyan` and knocking the text out to `aged-paper`.
- **Anti-Slop:** Zero use of backdrop blurs (glassmorphism) or soft ambient shadows. If depth is required, use a sharp 2px "hard shadow" offset in a solid color to mimic physical paper stacking.

## Shapes

The shape language is **Sharp (0)**. 

Architectural drafting relies on precise corners. All buttons, input fields, containers, and "receipt" blocks must have 0px corner radii. This reinforces the "studio" feel and allows elements to be packed together with zero wasted space between curves.

## Components

- **Primary Buttons:** Solid `architectural-ink` rectangles with white `label-ui` text. Hover state floods the background with `blueprint-cyan`.
- **Receipt Blocks:** Components with a light-blue tinted background (`tertiary_color_hex`), using `data-receipt` mono text. They should have a dashed top and bottom border to suggest a "tear-off" slip.
- **Dense Lists:** Rows with 1px solid bottom borders. Use Crimson Pro for the primary list item and JetBrains Mono for secondary metadata.
- **Input Fields:** Unfilled, 1px bottom border only, using Inter for labels and Crimson Pro for user input.
- **Right Rail Anchors:** High-contrast blocks (White text on Deep Blue) used to pin global agent variables.
- **Chips/Status:** Small, square-cornered boxes using `status-code` typography. No background; 1px border only.