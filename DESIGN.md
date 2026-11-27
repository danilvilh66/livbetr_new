# Livbetr design: “Six Months”

## The idea

Livbetr’s real difference is that the price doesn’t change when the dose does. The site tells that as a short film: you scroll through your first six months, the month counter rolls, the dose ring fills, and one thing never moves, the gold price pinned at the bottom of the screen.

This direction was chosen from four prototypes (see `/concepts/`).

## Look

| Token | Value | Role |
| --- | --- | --- |
| Night | `#0B1324` | Page background |
| Night 2 / 3 | `#101B31` / `#17243F` | Raised sections, cards |
| Text | `#EEF2F8` | Body and headings |
| Muted | `#A9B4C7` | Secondary text (9:1 on night) |
| Gold | `#F4C35A` | The price, primary buttons, focus of attention |
| Teal | `#2CC5B5` | Semaglutide |
| Violet | `#8B7BFF` | Tirzepatide |
| Rose | `#F27493` | Aurora light only |

- **Type:** Bebas Neue for display (headlines, numbers), Source Sans 3 for text. Both self-hosted with metric-matched fallbacks, so nothing shifts while fonts load.
- **Light:** three blurred “aurora” lights drift slowly behind key sections. They pause off screen and stop for reduced motion.
- **Product color code:** teal for semaglutide, violet for tirzepatide, everywhere: switches, plan cards, the comparison table, eligibility results.

## Motion language

| Moment | What moves | How |
| --- | --- | --- |
| Page load | Headline words rise out of masks | CSS, split at build time |
| Section headings | Lines rise as they enter | GSAP SplitText, masked lines |
| Six-month story | Pinned stage: odometer, captions, dose ring, ticks; fixed price pill | ScrollTrigger pin + scrub, snaps one month at a time |
| Price scene | The giant price settles, six month chips line up | Scrub + stagger |
| How it works | Cards travel sideways (desktop) | Pinned horizontal scroll |
| Media | Portrait and coach photo drift slightly | Scrubbed parallax |
| Buttons | Primary buttons lean toward the pointer | `quickTo`, fine pointers only |
| Pages | Cross-fade between pages | View Transitions (progressive) |

Rules: transform and opacity only; nothing hidden until the motion layer runs; content readable without it; every effect reverts when reduced motion is turned on.

## Skills used

- **UI UX Pro Max**: style categories (Parallax Storytelling), the “Bold Statement” type pairing, GSAP scroll presets, pre-delivery checklist.
- **GSAP ScrollTrigger**: pinning, scrub, snapping, `matchMedia`, refresh and cleanup rules.
- **Frontend Design**: one signature moment (the pinned price) instead of effects everywhere.
- **Make Interfaces Feel Better**: tabular numbers, press feedback, no `transition: all`.
- **A11y Enforcer** and **Web Interface Guidelines**: contrast on every pair, focus not obscured by the sticky header or the price pill, tap targets, reduced motion.
