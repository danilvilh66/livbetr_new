# Livbetr design notes

## The brief, in one line

Help a cost-conscious, possibly skeptical adult decide in under a minute that Livbetr is legitimate, affordable and safe enough to start a 3-minute eligibility check.

## The idea: price is the protagonist

Livbetr's real difference is that the price does not change when the dose does. GLP-1 treatment steps up month by month, so the site shows exactly that: a **dose ladder** where bars climb and the price line stays flat. It's the one bold element. Everything around it stays quiet.

The hero repeats the idea with a literal price tag ("priced honestly") hanging off the photo.

## How the direction was chosen

1. **UI UX Pro Max** (`design-system/livbetr/MASTER.md`) for the telemedicine category returned: Trust & Authority + Conversion landing pattern, Minimalism/Swiss style, calm medical palette, 4.5:1 contrast, 44px targets, reduced motion. Its first, generic query suggested a black-and-gold luxury look, which was rejected as wrong for healthcare. That is why the query was narrowed to the product category.
2. The **brand** already owns a deep ink teal (`#0B2E3E`) and a teal (`#0F7D78`), and the product photos have teal (semaglutide) and gold (tirzepatide) vial caps. Those became the product colour code used everywhere: ladder, plan cards, tables, quiz results.
3. **Typography**: Figtree, from UI UX Pro Max's "Medical Clean" pairing. It is friendly and readable, and its numerals are strong for prices. Self-hosted variable font with a metric-matched fallback, so there is no layout shift and no third-party request.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| Ink | `#0B2E3E` | Text, primary buttons, dark sections |
| Lagoon | `#0F7D78` | Semaglutide, icons, progress |
| Marigold | `#E0A020` | Tirzepatide, the flat price line, offer button |
| Mist | `#E7F1EF` | Tinted sections and chips |
| Ink soft | `#3D5B68` | Secondary text (7.25:1 on white) |
| Danger | `#B42318` | Errors and emergency actions only |

Type scale: hero 44 to 88px, H1 36 to 60, H2 30 to 48, H3 20 to 24, body 17, small 13. Radius follows hierarchy: 32 media and big cards, 24 cards, 16 inner, pill for controls.

## Rules the build follows

- One orchestrated motion moment per page (hero entrance, ladder bars growing). Nothing else animates on its own. All motion is off under `prefers-reduced-motion`.
- Every interactive feature works with keyboard and screen readers: tabs with arrow keys, ranges with `aria-valuetext`, error summaries that take focus, a focus-trapped mobile menu.
- No claims the business can't back up. Reviews are verbatim from Trustpilot, illustrations are labelled as illustrations, compounded medications are labelled as not FDA-approved, and the eligibility check never promises approval.
- Health answers in the eligibility check stay in `sessionStorage` on the visitor's device and are never sent anywhere by this site.

## Skills used

- **ui-ux-pro-max**: design-system generation, product, colour, typography and landing-pattern searches, pre-delivery checklist.
- **frontend-design**: the distinct point of view (the ladder, the price tag) and avoiding templated choices.
- **make-interfaces-feel-better**: concentric radii, tabular numbers, `text-wrap: balance`, press scale, no `transition: all`.
- **a11y-enforcer**: static scan (0 issues), contrast checks on every colour pair, behaviour review.
- **web-design-guidelines / web-review**: final review pass.
