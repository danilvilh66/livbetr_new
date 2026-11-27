import { site, legalLinks, treatments } from './data.mjs';
import { icon } from './icons.mjs';

// Responsive image widths generated into public/assets/img.
const images = {
  'hero-person': { widths: [520, 900], ratio: [900, 1124] },
  'coach-smile': { widths: [600, 1100], ratio: [1, 1] },
  pair: { widths: [560, 1000], ratio: [1, 1] },
  'panel-semaglutide': { widths: [560, 1000], ratio: [1, 1] },
  'panel-tirzepatide': { widths: [560, 1000], ratio: [1, 1] },
  'step-1': { widths: [560, 1000], ratio: [4, 3] },
  'step-2': { widths: [560, 1000], ratio: [4, 3] },
  'step-3': { widths: [560, 1000], ratio: [4, 3] },
  'step-4': { widths: [560, 1000], ratio: [4, 3] },
};

export const picture = (root, name, { alt = '', sizes = '100vw', cls = '', eager = false, attrs = '' } = {}) => {
  const img = images[name];
  if (!img) throw new Error(`Unknown image: ${name}`);
  const largest = img.widths[img.widths.length - 1];
  const height = Math.round((largest * img.ratio[1]) / img.ratio[0]);
  const srcset = img.widths.map((w) => `${root}assets/img/${name}-${w}.webp ${w}w`).join(', ');
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<img class="${cls}" src="${root}assets/img/${name}-${img.widths[0]}.webp" srcset="${srcset}" sizes="${sizes}" width="${largest}" height="${height}" alt="${alt}" ${loading} decoding="async" ${attrs}>`;
};

export const ext = (href, label, cls = '') =>
  `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${label}<span class="visually-hidden"> (opens in a new tab)</span></a>`;

// Splits a heading into masked words at build time, so the entrance animation is pure CSS
// (no layout shift, no script on the critical path). Screen readers still read plain text.
export const splitWords = (text) =>
  text
    .split(' ')
    .map((word, i) => `<span class="sw"><span class="sw__i" style="--i:${i}">${word}</span></span>`)
    .join(' ');

const navItems = [
  { href: 'how-it-works/', label: 'How it works', key: 'how' },
  { href: 'pricing/', label: 'Pricing', key: 'pricing' },
  { href: 'faq/', label: 'FAQ', key: 'faq' },
  { href: 'contact/', label: 'Contact', key: 'contact' },
];

const promoBar = (root) =>
  site.promo.active
    ? `<div class="promo" data-promo="${site.promo.id}">
  <p><strong>${site.promo.name}:</strong> ${site.promo.discount}. <a href="${root}pricing/">See pricing</a></p>
  <button class="promo__close" type="button" data-promo-close aria-label="Dismiss offer banner">${icon('x', { size: 18 })}</button>
</div>`
    : '';

const header = (root, active) => `<header class="site-header" data-header>
  <div class="site-header__inner wrap">
    <a class="brand" href="${root}" aria-label="Livbetr home"><img src="${root}assets/img/logo-white.webp" width="124" height="29" alt="Livbetr"></a>
    <nav class="primary-nav" aria-label="Main">
      <ul>${navItems
        .map((n) => `<li><a href="${root}${n.href}"${active === n.key ? ' aria-current="page"' : ''}>${n.label}</a></li>`)
        .join('')}</ul>
    </nav>
    <div class="site-header__actions">
      <a class="link-quiet hide-md" href="${root}login/">Log in</a>
      <a class="btn btn--gold btn--sm" href="${root}eligibility/" data-magnetic>Check eligibility</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
        <span class="visually-hidden" data-menu-label>Open menu</span>
        <span class="menu-toggle__bars" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu" data-menu hidden>
  <nav aria-label="Mobile">
    <ul>
      <li><a href="${root}">Home</a></li>
      ${navItems.map((n) => `<li><a href="${root}${n.href}"${active === n.key ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('')}
      <li><a href="${root}eligibility/">Eligibility check</a></li>
    </ul>
  </nav>
  <div class="mobile-menu__foot">
    <a class="btn btn--gold btn--block" href="${root}eligibility/">Check my eligibility</a>
    <a class="btn btn--line btn--block" href="${root}login/">Log in to the patient portal</a>
    <p>Questions? Call <a href="${site.phoneHref}">${site.phone}</a></p>
  </div>
</div>`;

const footer = (root) => `<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__cta">
      <p class="site-footer__big" aria-hidden="true">Livbetr</p>
      <p class="site-footer__tag">${site.tagline}</p>
    </div>
    <div class="site-footer__cols">
      <nav aria-label="Company"><h2>Company</h2><ul>
        <li><a href="${root}how-it-works/">How it works</a></li>
        <li><a href="${root}pricing/">Pricing</a></li>
        <li><a href="${root}eligibility/">Eligibility check</a></li>
        <li><a href="${root}faq/">FAQ</a></li>
        <li><a href="${root}contact/">Contact</a></li>
        <li><a href="${root}login/">Patient portal</a></li>
      </ul></nav>
      <nav aria-label="Legal"><h2>Legal</h2><ul>${legalLinks.map((l) => `<li><a href="${root}${l.slug}/">${l.label}</a></li>`).join('')}</ul></nav>
      <div><h2>Get in touch</h2><ul class="site-footer__contact">
        <li><a href="${site.phoneHref}">${site.phone}</a></li>
        <li><a href="mailto:${site.email}">${site.email}</a></li>
        <li>${site.supportHours.days}<br>${site.supportHours.time}</li>
        <li>${site.legalName}<br>${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.zip}</li>
      </ul>
      ${ext(site.legitScriptUrl, `${icon('shieldCheck', { size: 18 })} Verify our LegitScript certification`, 'legitscript')}</div>
    </div>
    <div class="site-footer__legal">
      <p><strong>Medical emergency?</strong> Call 911 or go to the nearest emergency room. Livbetr is not for urgent or emergency care.</p>
      <p>${site.legalName} is a technology and administrative platform. It does not practice medicine or dispense medication. Medical services are provided by independent, licensed U.S. clinicians, who decide whether a prescription is appropriate. Prescriptions are filled by licensed U.S. pharmacies.</p>
      <p>Compounded semaglutide and tirzepatide are not FDA-approved. The FDA does not review compounded drugs for safety, effectiveness or quality. Prescription required. Individual results vary. Dose schedules shown are examples; your clinician sets your dose.</p>
      <p>&copy; ${new Date().getFullYear()} ${site.legalName}. All rights reserved.</p>
    </div>
  </div>
</footer>`;

// The price that never moves: a fixed pill shown while the six-month story plays.
const hud = () => `<div class="hud" data-hud aria-hidden="true">
  <span class="hud__month" data-hud-month>Day 1</span>
  <span class="hud__bar"><i data-hud-bar></i></span>
  <span class="hud__price"><b data-hud-price>$${treatments[0].price}</b>/mo, locked</span>
</div>`;

const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: `${site.url}/assets/img/logo.png`,
  email: site.email,
  telephone: '+1-888-664-9435',
  address: { '@type': 'PostalAddress', streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.region, postalCode: site.address.zip, addressCountry: 'US' },
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '22:00' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: site.trustpilot.rating, reviewCount: site.trustpilot.count, bestRating: 5 },
});

export const layout = ({ root, path, title, description, active, body, schema, bodyClass = '', noindex = false, withHud = false, assets }) => {
  const canonical = `${site.url}/${path}`;
  const fullTitle = path === '' ? title : `${title} | Livbetr`;
  const ld = [path === '' ? organization() : null, schema].filter(Boolean);
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<title>${fullTitle}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#0B1324">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Livbetr">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${root}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${root}apple-touch-icon.png">
<link rel="manifest" href="${root}site.webmanifest">
<link rel="preload" href="${root}assets/fonts/bebas-neue-latin-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/source-sans-3-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<script>(function(d){var h=d.documentElement;h.classList.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)h.classList.add('motion');if(localStorage.getItem('promo-dismissed:${site.promo.id}'))h.classList.add('promo-off')}catch(e){}})(document)</script>
<link rel="stylesheet" href="${root}${assets.css}">
<script type="module" src="${root}${assets.js}"></script>
${ld.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n')}
</head>
<body class="${bodyClass}" data-root="${root}">
<a class="skip-link" href="#main">Skip to content</a>
${promoBar(root)}
${header(root, active)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(root)}
${withHud ? hud() : ''}
</body>
</html>
`;
};
