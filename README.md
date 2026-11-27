# Livbetr website

The marketing site for Livbetr: GLP-1 weight-loss care, priced honestly. Design direction **“Six Months”**: a dark, cinematic site built around one story. As you scroll through your first six months, the dose changes and the price stays pinned on screen.

The built site is committed in `docs/`, so it opens straight away with VS Code Live Server or GitHub Pages. Every link is relative, so it also works from a sub-path.

## Open it

In VS Code, open the repository folder and click **Go Live**. `.vscode/settings.json` points Live Server at `docs/`.

## Develop

```bash
npm install
npm run dev      # builds, watches src/ and public/, serves docs/ at http://localhost:4173
npm run check    # ESLint + build + the Playwright suite
```

Edit `src/` and `public/`, never `docs/` directly. Run `npm run build` and commit `docs/` with your change: CI fails if `docs/` is out of date.

## Pages

| Path | What it does |
| --- | --- |
| `/` | Cinematic hero, the pinned six-month story, the price that never moves, how it works, plans, 15% estimate, care team, reviews, FAQ |
| `/how-it-works/` | Four steps (sideways on desktop), who does what, what stays with you |
| `/pricing/` | Plans, the six-month story, what’s included, semaglutide vs tirzepatide, billing FAQ |
| `/eligibility/` | Six-question eligibility check with BMI, safety screening and a plan suggestion that hands off to the intake |
| `/faq/` | 21 answers, live search with highlighting, category filters, links to any single answer |
| `/contact/` | Who to contact for what, live “open now” status in Eastern Time, validated form |
| `/start/` | Six-step intake: medication, about you, health history, shipping, consents, review. Prefilled from the eligibility check |
| `/login/` | Log in, show password, password reset |
| `/portal/` | Patient portal preview with sample data: plan, refills, care-team messages, orders and receipts, change or cancel |
| `/terms/`, `/privacy-policy/`, `/refund-policy/`, `/glp-1-safety-information/`, `/telehealth-consent/`, `/california-privacy-notice/`, `/consumer-bill-of-rights/` | Legal documents, wording ported unchanged from livbetr.com, with a contents list and print button. Same paths as the live site, so old links keep working |
| `/404.html` | Branded not-found page |
| `/concepts/` | The four design directions that were explored (review only) |

## Architecture

```
build.mjs                 esbuild bundle (minified, code-split, hashed) + page rendering + sitemap
src/data.mjs              prices, hours, FAQ, reviews, dose schedules, the six-month story
src/layout.mjs            <head>, header, footer, price pill, image helper, build-time word splitting
src/components.mjs        journey, price scene, steps, plans, estimate, reviews, FAQ, CTA
src/pages/*.mjs           one module per page
src/scripts/main.js       entry: features that work without animation
src/scripts/features/     header, promo, medication, estimate, FAQ, contact, eligibility check
src/scripts/motion/       GSAP layer (ScrollTrigger, SplitText), loaded lazily
src/styles/               tokens, base, chrome, home, pages, motion (bundled into one CSS file)
public/                   fonts, images, icons, manifest, concepts (copied as is)
tests/                    Playwright end-to-end, axe accessibility, motion and responsive tests
```

How the motion is built:

- **No animation on the critical path.** Hero and page headings are split into words at build time and animate with CSS, so the first paint needs no JavaScript.
- **GSAP loads lazily.** `main.js` imports the motion chunk after the page is idle, and never when the visitor prefers reduced motion. Main JS is about 8 KB gzipped; the motion chunk is about 50 KB.
- **Progressive enhancement.** The six-month story is a readable list in the HTML. The motion layer turns it into a pinned film and keeps the list for screen readers. Without JavaScript or with reduced motion, the list is what people see.
- **Reversible.** Every effect lives in `gsap.matchMedia`, so turning on “reduce motion” mid-visit reverts pins, splits and classes.
- **Transform and opacity only**, scrubbed tweens with `ease: none`, aurora animations paused off screen, cross-document view transitions as a progressive extra.

## Connecting the back end

Every journey stays on this site. The parts that need a server read their address from `site.integrations` in `src/data.mjs`:

| Setting | What it connects | While it is `null` (preview mode) |
| --- | --- | --- |
| `intakeEndpoint` | Receives the completed intake as JSON | The intake finishes on the site and says nothing was sent |
| `checkoutUrl` | Payment page the intake hands off to | No payment step is shown |
| `portalLoginUrl` | Patient portal sign-in (form POST) | Log in opens the portal preview with sample data |
| `contactEndpoint` | Receives contact form messages | The form opens the visitor's email app, prefilled |

Preview mode is labelled on each page. No card details are ever collected by this site.

## Changing content

- **Prices or promo:** `site.promo` and `treatments[].price` in `src/data.mjs`. Set `promo.active` to `false` to remove the banner.
- **The six-month story:** `journey` in `src/data.mjs`. Doses come from `treatments[].doses`.
- **FAQ:** add to `faqs` in `src/data.mjs`; `home: true` also shows it on the home page.
- **Legal documents:** `src/content/legal/*.json`. Update them when legal publishes new wording.

## Quality

- 188 Playwright tests on desktop Chrome and a Pixel 7 profile: every page and interaction, the pinned story with and without motion, the eligibility-to-intake journey, log in and portal, and a check that no link leads back to the old site, axe WCAG 2.2 AA on every page (0 violations), links, images, tap targets, no sideways scrolling.
- Lighthouse (mobile, local): Performance 92 to 98, Accessibility 100, Best Practices 100, SEO 100, CLS 0.
- ESLint on all source. No third-party requests: fonts and GSAP are self-hosted, no trackers.

## Before going live

1. Confirm the open content questions (patient counts, plan lineup, support hours).
2. Fill in `site.integrations` (intake, checkout, portal, contact) so the flows reach real systems.
3. Add analytics with a consent banner if marketing needs them.
4. Re-run Lighthouse on the staging URL.
