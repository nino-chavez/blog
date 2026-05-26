# Signal Dispatch Design System

## Brand Identity
- **Tagline**: "Working notes from an architect who directs agents to ship commerce."
- **Mission**: Make agent-assisted production work — chassis, contracts, validators, and the hiring-evaluator-safe artifacts that prove the work is real — legible to peer architects and the directors who hire them.
- **Positioning**: A working architect's notes on directing agents in high-stakes production work — practice, not personal brand
- **Audience**: peer architects (P1) — looking for working patterns + peer reads on industry arguments + reference architectures to cite, hiring evaluators (P2) — directors and principals testing whether the architect-who-directs-agents positioning is backed by receipts, AI-curious staff ICs (P3) — search-arriving practitioners trying to figure out how AI fits their own work
- **Personality**: self-interrogating, technically-deep, provocative, conversational, provisional

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Signal Coral | `#e86c5d` | Primary accent, links, emphasis |
| Signal Cyan | `#00ced1` | Secondary accent, highlights, data viz |
| Signal Coral | `#e86c5d` | Same as primary — single-accent brand |

### Neutral Scale
| Step | Hex |
|------|-----|
| 50 | `#f9fafb` |
| 100 | `#f3f4f6` |
| 200 | `#e5e7eb` |
| 300 | `#d1d5db` |
| 400 | `#9ca3af` |
| 500 | `#6b7280` |
| 600 | `#4b5563` |
| 700 | `#374151` |
| 800 | `#1f2937` |
| 900 | `#121214` |
| 950 | `#0a0a0b` |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Green | `#22c55e` | Positive signals |
| Amber | `#f59e0b` | Caution signals |
| Red | `#ef4444` | Critical signals |
| Cyan | `#00ced1` | Informational — matches secondary |

### Surfaces
| Name | Hex |
|------|-----|
| background | `#0a0a0b` |
| foreground | `#ffffff` |
| card | `#1a1a1d` |
| cardForeground | `#ffffff` |
| muted | `#121214` |
| mutedForeground | `#9ca3af` |
| border | `#374151` |

---

## Typography

### Font Stack
```css
--font-display: 'Rival Sans', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', Menlo, monospace;
```

### Type Scale
| Name | Size (Desktop) | Size (Mobile) | Weight | Line Height | Font |
|------|---------------|---------------|--------|-------------|------|
| hero | 3.5rem | 2.5rem | 700 | 1.1 | display |
| h2 | 2.25rem | 1.75rem | 700 | 1.2 | display |
| h3 | 1.5rem | 1.25rem | 500 | 1.3 | display |
| body-lg | 1.125rem | — | 400 | 1.7 | body |
| body | 1rem | — | 400 | 1.6 | body |
| caption | 0.875rem | — | 400 | 1.5 | body |
| code | 0.875rem | — | 400 | 1.6 | mono |

---

## Spacing Scale

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;  /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;  /* 16px */
--space-6: 1.5rem;  /* 24px */
--space-8: 2rem;  /* 32px */
--space-12: 3rem;  /* 48px */
--space-16: 4rem;  /* 64px */
--space-24: 6rem;  /* 96px */
```

---

## Layout

- **Max content width**: 48rem (768px)
- **Section padding**: space-16
- **Container padding**: space-6

### Breakpoints
| Name | Min Width |
|------|-----------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

---

## Voice & Tone

### Attributes
- **self-interrogating**: Questions its own assumptions mid-argument
  > "But wait — is that actually true, or is it just what we've been told?"
- **technically-deep**: Goes beyond surface-level analysis
  > "The cache invalidation problem isn't technical — it's organizational."
- **provocative**: Opens with uncomfortable truths or counterintuitive claims
  > "Most platform teams exist to justify headcount, not serve developers."
- **conversational**: Reads like talking to a smart colleague at a bar
  > "Look, I've built three of these. The third one was worse than the first."
- **provisional**: Holds ideas tentatively, signals epistemic humility
  > "This might be wrong, but the pattern I keep seeing is..."

### Avoid
- **corporate-jargon** (error): leverage, synergy, holistic approach, paradigm shift, circle back...
  > Instead: Say the actual thing. 'Use' not 'leverage'. 'Examine' not 'deep dive'.
- **academic-distance** (error): In this essay, This paper examines, The author contends, It can be observed that, Research indicates
  > Instead: Write in first person. 'I think' not 'It can be observed'.
- **humble-bragging** (warning): I was fortunate to, I had the privilege of, humble opinion
  > Instead: Just state the experience directly.
- **prescriptive-authority** (warning): you must, you should always, the right way, best practice is
  > Instead: Offer perspective, not prescriptions. 'What's worked for me' not 'you must'.

### Examples
**Introduce a technical topic**
- Good: "I keep seeing teams build internal developer platforms that nobody uses. The pattern is always the same: someone reads a Gartner report, gets budget, hires 12 people, and ships a portal that developers route around."
- Bad: "In this comprehensive analysis, we will examine the emerging paradigm of internal developer platforms and their transformative impact on engineering velocity."

**Share a recommendation**
- Good: "Start with a Makefile. Seriously. Before you build a platform, put your common commands in a Makefile and see if that's enough. It usually is."
- Bad: "Organizations should holistically evaluate their developer experience maturity before leveraging platform engineering as a strategic capability."

---

*Generated by brand-forge v2.0.0-candidate on 2026-05-25T21:00:00.000Z*