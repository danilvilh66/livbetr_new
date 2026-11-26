import { site, legalLinks } from './data.mjs';
import { icon } from './icons.mjs';

// Responsive image widths generated into public/assets/img (see README).
const imageWidths = {
  'hero-person': [520, 900],
  'coach-smile': [600, 1100],
  pair: [560, 1000],
  'panel-semaglutide': [560, 1000],
  'panel-tirzepatide': [560, 1000],
  'step-1': [560, 1000],
  'step-2': [560, 1000],
  'step-3': [560, 1000],
  'step-4': [560, 1000],
  'illustration-before': [560, 900],
  'illustration-after': [560, 900],
};

const imageRatios = {
  'hero-person': [900, 1124],
  'coach-smile': [1, 1],
  'step-1': [4, 3], 'step-2': [4, 3], 'step-3': [4, 3], 'step-4': [4, 3],
};

export const picture = (root, name, { alt = '', sizes = '100vw', cls = '', eager = false } = {}) => {
  const widths = imageWidths[name];
  if (!widths) throw new Error(`Unknown image: ${name}`);
  const [rw, rh] = imageRatios[name] ?? [1, 1];
  const largest = widths[widths.length - 1];
  const height = Math.round((largest * rh) / rw);
  const srcset = widths.map((w) => `${root}assets/img/${name}-${w}.webp ${w}w`).join(', ');
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<img class="${cls}" src="${root}assets/img/${name}-${widths[0]}.webp" srcset="${srcset}" sizes="${sizes}" width="${largest}" height="${height}" alt="${alt}" ${loading} decoding="async">`;
};

export const ext = (href, label, cls = '') =>
  `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${label}<span class="visually-hidden"> (opens in a new tab)</span></a>`;

const navItems = [
  { href: 'how-it-works/', label: 'How it works', key: 'how' },
  { href: 'pricing/', label: 'Pricing', key: 'pricing' },
  { href: 'faq/', label: 'FAQ', key: 'faq' },
  { href: 'contact/', label: 'Contact', key: 'contact' },
];

const promoBar = (root) =>
  site.promo.active
    ? `<div class="promo" data-promo="${site.promo.id}">
  <p class="promo__text"><strong>${site.promo.name}:</strong> ${site.promo.discount}. Semaglutide $65/mo, tirzepatide $110/mo.
  <a class="promo__link" href="${root}pricing/">See pricing</a></p>
  <button class="promo__close" type="button" data-promo-close aria-label="Dismiss offer banner">${icon('x', { size: 18 })}</button>
</div>`
    : '';

const header = (root, active) => `<header class="site-header" data-header>
  <div class="site-header__inner container">
    <a class="brand" href="${root}" aria-label="Livbetr home">
      <img src="${root}assets/img/logo.webp" width="120" height="28" alt="Livbetr">
    </a>
    <nav class="primary-nav" aria-label="Main">
      <ul>
        ${navItems
          .map((n) => `<li><a href="${root}${n.href}"${active === n.key ? ' aria-current="page"' : ''}>${n.label}</a></li>`)
          .join('')}
      </ul>
    </nav>
    <div class="site-header__actions">
      <a class="btn btn--ghost btn--sm hide-sm" href="${site.portalUrl}" rel="noopener">Log in</a>
      <a class="btn btn--primary btn--sm" href="${root}eligibility/">Check eligibility</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
        <span class="visually-hidden">Open menu</span>${icon('menu', { size: 22 })}
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu" data-menu hidden>
    <nav aria-label="Mobile">
      <ul>
        <li><a href="${root}">Home</a></li>
        ${navItems.map((n) => `<li><a href="${root}${n.href}"${active === n.key ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('')}
        <li><a href="${root}eligibility/">Eligibility check</a></li>
      </ul>
    </nav>
    <div class="mobile-menu__foot">
      <a class="btn btn--primary btn--block" href="${root}eligibility/">Check my eligibility</a>
      <a class="btn btn--ghost btn--block" href="${site.portalUrl}" rel="noopener">${icon('login', { size: 18 })} Log in to the patient portal</a>
      <p class="mobile-menu__help">Questions? Call <a href="${site.phoneHref}">${site.phone}</a></p>
    </div>
  </div>
</header>`;

const footer = (root) => `<footer class="site-footer">
  <div class="container">
    <div class="site-footer__top">
      <div class="site-footer__brand">
        <img src="${root}assets/img/logo-white.webp" width="132" height="31" alt="Livbetr" loading="lazy">
        <p>${site.tagline}</p>
        <a class="legitscript" href="${site.legitScriptUrl}" target="_blank" rel="noopener">${icon('shieldCheck', { size: 18 })} Verify our LegitScript certification<span class="visually-hidden"> (opens in a new tab)</span></a>
      </div>
      <nav class="site-footer__col" aria-label="Company">
        <h2>Company</h2>
        <ul>
          <li><a href="${root}how-it-works/">How it works</a></li>
          <li><a href="${root}pricing/">Pricing</a></li>
          <li><a href="${root}eligibility/">Eligibility check</a></li>
          <li><a href="${root}faq/">FAQ</a></li>
          <li><a href="${root}contact/">Contact</a></li>
          <li><a href="${site.portalUrl}" rel="noopener">Patient portal</a></li>
        </ul>
      </nav>
      <nav class="site-footer__col" aria-label="Legal">
        <h2>Legal</h2>
        <ul>${legalLinks.map((l) => `<li><a href="${l.href}" rel="noopener">${l.label}</a></li>`).join('')}</ul>
      </nav>
      <div class="site-footer__col">
        <h2>Get in touch</h2>
        <ul class="site-footer__contact">
          <li>${icon('phone', { size: 16 })}<a href="${site.phoneHref}">${site.phone}</a></li>
          <li>${icon('mail', { size: 16 })}<a href="mailto:${site.email}">${site.email}</a></li>
          <li>${icon('clock', { size: 16 })}<span>${site.supportHours.days}<br>${site.supportHours.time}</span></li>
          <li>${icon('mapPin', { size: 16 })}<span>${site.legalName}<br>${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.zip}</span></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__legal">
      <p><strong>Medical emergency?</strong> Call 911 or go to the nearest emergency room. Livbetr is not for urgent or emergency care.</p>
      <p>${site.legalName} is a technology and administrative platform. It does not practice medicine or dispense medication. Medical services are provided by independent, licensed U.S. clinicians, who decide whether a prescription is appropriate. Prescriptions are filled by licensed U.S. pharmacies.</p>
      <p>Compounded semaglutide and tirzepatide are not FDA-approved. The FDA does not review compounded drugs for safety, effectiveness or quality. Prescription required. Individual results vary. Illustrations on this site are not actual patients.</p>
      <p class="site-footer__copy">&copy; ${new Date().getFullYear()} ${site.legalName}. All rights reserved.</p>
    </div>
  </div>
</footer>`;

const jsonLd = (path, extra) => {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/assets/img/logo.png`,
    email: site.email,
    telephone: '+1-888-664-9435',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.zip,
      addressCountry: 'US',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '22:00',
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: site.trustpilot.rating, reviewCount: site.trustpilot.count, bestRating: 5 },
  };
  const blocks = path === '' ? [org] : [];
  if (extra) blocks.push(extra);
  return blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n');
};

export const layout = ({ root, path, title, description, active, body, schema, bodyClass = '' }) => {
  const canonical = `${site.url}/${path}`;
  const fullTitle = path === '' ? title : `${title} | Livbetr`;
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#0B2E3E">
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
<link rel="preload" href="${root}assets/fonts/figtree-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js');try{if(localStorage.getItem('promo-dismissed:${site.promo.id}'))document.documentElement.classList.add('promo-off')}catch(e){}</script>
<link rel="stylesheet" href="${root}assets/css/main.css">
<script type="module" src="${root}assets/js/main.js"></script>
${jsonLd(path, schema)}
</head>
<body class="${bodyClass}" data-root="${root}">
<a class="skip-link" href="#main">Skip to content</a>
${promoBar(root)}
${header(root, active)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(root)}
</body>
</html>
`;
};
