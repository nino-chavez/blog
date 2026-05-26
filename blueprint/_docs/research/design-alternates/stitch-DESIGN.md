---
name: Signal Dispatch v2
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#4e6073'
  on-secondary: '#ffffff'
  secondary-container: '#cfe2f9'
  on-secondary-container: '#526478'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#d1e4fb'
  secondary-fixed-dim: '#b5c8df'
  on-secondary-fixed: '#091d2e'
  on-secondary-fixed-variant: '#36485b'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  metadata:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  technical-callout:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
spacing:
  unit: 4px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 20px
  max-width-content: 720px
---

## Brand & Style
The design system is engineered for rigorous intellectual consumption. It targets senior software architects and technical leaders who value signal-to-noise ratio above all else. The aesthetic is rooted in **Modern Minimalism** with an **Editorial** backbone, drawing inspiration from high-end technical whitepapers and classic broadsheet journalism.

The emotional response should be one of quiet authority, stability, and focus. By stripping away decorative artifice—gradients, shadows, and unnecessary animations—the design system positions the content as the sole protagonist. It prioritizes clarity, structural integrity, and the "weight" of the written word.

## Colors
This design system utilizes a restricted, high-contrast palette to ensure legibility and a physical "ink-on-paper" feel.

- **Deep Ink (#1A1A1A):** Used for primary typography, borders, and structural lines. It provides the "weight" necessary for an authoritative voice.
- **Paper (#F9F8F6):** A warm, off-white base that reduces the harsh flicker of pure white screens, facilitating long-form reading sessions.
- **Slate Blue (#2C3E50):** The singular accent color. It is used exclusively for functional signaling: links, active states, and "Series" taxonomy indicators.
- **Subtle Neutral (#707070):** Reserved for metadata, captions, and secondary information that must not compete with the main narrative.

## Typography
Typography is the primary vehicle for the brand. We employ a high-quality serif for the core reading experience to mirror the cadence of professional publishing.

- **Serif (Source Serif 4):** Used for all headlines and body prose. The vertical rhythm is generous (1.6x line-height) to prevent eye fatigue.
- **Sans-Serif (Inter):** Used for navigation, UI labels, and data-heavy metadata. It provides a functional contrast to the serif prose.
- **Monospace (JetBrains Mono):** Used for "Dispatch #" serialization, code snippets, and technical indices. It signifies a "work-in-progress" or "technical specification" layer.

## Layout & Spacing
The layout follows a **Fixed-Width Editorial Grid**. While the background fills the viewport, the reading container is strictly capped at 720px to maintain optimal line lengths for comprehension.

- **Grid:** A 12-column grid is used for the homepage/index, but article pages collapse into a single-column centered layout.
- **Vertical Rhythm:** Spacing between sections should be multiples of 16px (4 units).
- **Desktop:** Wide margins (80px+) to isolate the content and create a sense of premium "breathing room."
- **Mobile:** Margins shrink to 20px, with typography scaling down to maintain hierarchy without breaking words excessively.

## Elevation & Depth
This design system rejects the concept of "z-axis" depth through shadows. Instead, hierarchy is created through **Tonal Layering** and **Structural Rule Lines**.

- **Surfaces:** All elements sit on the same plane. Differentiation is achieved through the use of 1px horizontal rules (`#1A1A1A` at 10% opacity) to separate sections.
- **In-set Contrast:** Occasional "asides" or callouts may use a slightly darker background shade (`#F0EEEB`) to indicate a shift in context without lifting the element off the page.
- **No Shadows:** Shadows are strictly prohibited. Depth is an illusion we do not require; clarity is found in the flat, organized arrangement of information.

## Shapes
The shape language is strictly **Sharp**. In keeping with the architectural and technical theme, 0px border-radii are used for all components including buttons, input fields, and author cards. This reinforces the "rigorous" and "unrefined" professional aesthetic.

## Components
Components are designed to be utilitarian and invisible, facilitating the act of reading rather than demanding attention.

- **Buttons:** Rectangular, 1px border of Deep Ink or solid Deep Ink fill. No rounded corners. Typography is always Label-Caps.
- **Counterpoints (Tables):** High-density tables with 1px horizontal dividers. Header rows use Paper-Dark (`#F0EEEB`) background with bold technical labels.
- **Serialization:** Content items are prefixed with a monospaced "Dispatch #XXX" label. This should be treated as a primary navigational anchor.
- **Author Identity Card:** A simple, non-decorated block at the end of essays. Features a small, square greyscale headshot of Nino Chavez, followed by a brief bio in `metadata` styling.
- **Navigation:** A flat, text-only top bar. No dropdowns. Active states are indicated by a 2px underline in Slate Blue.
- **Input Fields:** Bottom-border only or simple 1px outline. No glow or shadow on focus—only a color shift of the border to Slate Blue.