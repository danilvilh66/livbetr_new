// Legal documents, rendered from the text published on livbetr.com (src/content/legal).
// Wording is unchanged; only links are pointed at this site.
import { readFileSync } from 'node:fs';
import { legalLinks, site } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero } from '../components.mjs';

const load = (slug) => JSON.parse(readFileSync(new URL(`../content/legal/${slug}.json`, import.meta.url), 'utf8'));
const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
const slugify = (text) => strip(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const internal = new Set(legalLinks.map((l) => l.slug));

const descriptions = {
  'glp-1-safety-information': 'Safety information for compounded semaglutide and tirzepatide: emergencies, who shouldn’t take GLP-1 medication, side effects, dosing and how to report a problem.',
  terms: 'The terms and conditions for using Livbetr’s website, telehealth services and communications.',
  'privacy-policy': 'How your medical information may be used and disclosed, and how you can access it.',
  'california-privacy-notice': 'Privacy notice for California residents: what personal information Livbetr collects and your rights under California law.',
  'telehealth-consent': 'Consent to telehealth, treatment, communication by text or email, and use of your medical information.',
  'refund-policy': 'How Livbetr billing, renewals, cancellations and refunds work.',
  'consumer-bill-of-rights': 'The weight-loss consumer bill of rights required by Florida law.',
};

// Point links at this site; keep government and partner sites external.
const rewriteLinks = (html, root) =>
  html.replace(/<a href="([^"]*)">/g, (_, href) => {
    const path = href.replace(/^https?:\/\/(www\.)?livbetr\.com/, '').replace(/\/$/, '');
    if (/^https?:\/\/livbetr\.eonpro\.io/.test(href)) return `<a href="${root}login/">`;
    if (path === '') return `<a href="${root}">`;
    const slug = path.replace(/^\//, '');
    if (internal.has(slug)) return `<a href="${root}${slug}/">`;
    if (/^(mailto|tel):/.test(href)) return `<a href="${href}">`;
    return `<a href="${href}" target="_blank" rel="noopener">`;
  });

const renderBlocks = (blocks, root) =>
  blocks
    .map((b) => {
      if (b.t === 'h2') return `<h2 id="${b.id}">${b.html}</h2>`;
      if (b.t === 'h3') return `<h3>${b.html}</h3>`;
      if (b.t === 'ul' || b.t === 'ol') return `<${b.t}>${b.items.map((i) => `<li>${rewriteLinks(i, root)}</li>`).join('')}</${b.t}>`;
      return `<p>${rewriteLinks(b.html, root)}</p>`;
    })
    .join('\n');

export const pages = legalLinks.map(({ slug, label }) => {
  const doc = load(slug);
  // The "Last updated" line moves into the page header.
  const blocks = doc.blocks.filter((b, i) => !(i < 2 && b.t === 'p' && /^(Last updated|Effective date)/i.test(strip(b.html))));
  // Unique anchor ids for the table of contents.
  const used = new Map();
  const headings = blocks
    .filter((b) => b.t === 'h2')
    .map((b) => {
      const base = slugify(b.html) || 'section';
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      return Object.assign(b, { id: n > 1 ? `${base}-${n}` : base });
    });
  return {
    meta: { path: `${slug}/`, title: strip(doc.title), description: descriptions[slug], active: '' },
    render: (root) => ({
      bodyClass: 'page-legal',
      body: `
${pageHero({
  title: doc.title,
  lead: doc.updated ? `Last updated ${doc.updated}.` : label,
  extra: `<div class="btn-row"><button class="btn btn--line btn--sm" type="button" data-print>${icon('clipboard', { size: 18 })} Print or save as PDF</button><a class="link-arrow" href="${root}contact/">Questions? Contact us</a></div>`,
  cls: 'page-hero--legal',
})}
<section class="section section--tight legal" aria-label="${strip(doc.title)}">
  <div class="wrap legal__grid">
    <nav class="legal__toc" aria-label="On this page">
      ${headings.length > 1 ? `<p class="legal__toc-title">On this page</p><ol>${headings.map((h) => `<li><a href="#${h.id}">${strip(h.html)}</a></li>`).join('')}</ol>` : ''}
      <p class="legal__toc-title">Other documents</p>
      <ul>${legalLinks
        .filter((l) => l.slug !== slug)
        .map((l) => `<li><a href="${root}${l.slug}/">${l.label}</a></li>`)
        .join('')}</ul>
    </nav>
    <article class="prose">
      ${renderBlocks(blocks, root)}
      <p class="prose__source">Published by ${site.legalName}. In an emergency, call 911.</p>
    </article>
  </div>
</section>`,
    }),
  };
});
