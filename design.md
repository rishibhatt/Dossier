---
name: Dossier
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
typography:
  h1:
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-md:
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  code:
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-page: 40px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is rooted in the "Editorial Minimalism" movement. It prioritizes content structure and typographic rigor over decorative flourishes. The goal is to feel like a high-end physical portfolio or a professional archival tool—precise, quiet, and reliable.

The aesthetic avoids "AI hype" tropes like glowing gradients or floating orbs. Instead, intelligence is communicated through a highly organized, systematic layout that suggests order and clarity. The visual language is lean and structured, using thin lines and a restricted palette to create a focused workspace for creative professionals.

## Colors

This design system utilizes a high-neutrality palette to ensure that the user's work—images, text, and projects—remains the focus. 

**Light Mode** utilizes a warm-tinted off-white (`#FAFAF9`) for the background to reduce eye strain, while pure white surfaces provide subtle contrast. **Dark Mode** employs a deep, charcoal-toned aesthetic, using layered surfaces to define hierarchy rather than heavy shadows. The **Accent** color is used surgically: specifically for active states, primary actions, and focus indicators, ensuring it never overwhelms the editorial layout.

## Typography

The typography system is built on **Inter**, chosen for its utilitarian clarity and excellent legibility in complex interfaces. The hierarchy is intentionally tight; there are no oversized headings, maintaining a sophisticated, archival feel.

- **Headings:** Use tight leading and negative letter-spacing for a "set" look.
- **Labels:** Small caps or slightly tracked-out uppercase are used for metadata to distinguish it from body copy.
- **Scale:** The jump between sizes is modest, reinforcing the tool's professional, non-marketing-first nature.

## Layout & Spacing

This design system uses a **fixed grid** model for the main content area to ensure editorial precision, while the interface panels (sidebar, inspectors) use a fluid model.

The spacing rhythm is based on a **4px baseline**, but defaults to broader units (16px, 24px) to create a sense of "breathable structure." Content should be organized in clear vertical stacks or horizontal rows with consistent gutters. Alignment is the primary tool for creating visual groups—avoid using background colors to separate content when a simple alignment or thin border will suffice.

## Elevation & Depth

In line with the minimal aesthetic, depth is conveyed primarily through **low-contrast outlines** and **tonal layers**.

- **Light Mode:** Elevation is represented by a 1px border (`#E5E7EB`). If a shadow is necessary for a floating element (like a dropdown), it must be a "soft-sharp" shadow: very low opacity (2-4%), large blur, and 0 offset, mimicking a subtle lift off a page.
- **Dark Mode:** Depth is created by "Elevated Surfaces" (`#1F2937`) sitting on top of "Surfaces" (`#111827`). No shadows are used in dark mode; hierarchy is strictly defined by color luminosity and thin borders.

## Shapes

The shape language is "Soft-System." Corners are not sharp (which can feel aggressive), but they are not overtly rounded (which can feel consumer-grade). 

A standard radius of **4px (0.25rem)** is applied to buttons, inputs, and small containers. Larger cards or sections use **8px (0.5rem)**. This provides enough softness to feel modern while maintaining the rigid, grid-based appearance required for an editorial tool.

## Components

- **Buttons:** Medium-height (36-40px). Primary buttons use a solid fill with white text. Secondary buttons use a thin border with no fill. No gradients or inner glows.
- **Inputs:** Flat background with a 1px border. On focus, the border transitions to the Accent color with a 2px outer glow/ring of the same color at 20% opacity.
- **Cards:** Defined by a 1px border. No background color change on hover; instead, use a subtle border color shift or a small icon reveal.
- **Icons:** Use 20px or 24px outline-style icons with a consistent stroke weight (1.5px). 
- **AI Indicators:** Since this is AI-powered but not AI-first in style, AI features are signaled by a small, subtle "sparkle" icon in the Accent color next to text labels, rather than complex animations or colorful gradients.
- **Data Tables/Lists:** Use "Ghost" headers (Text Secondary, Label-SM style) with thin horizontal dividers and high-density rows.