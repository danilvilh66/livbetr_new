import { site, treatments, faqs } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero, plans, doseLadder, includedList, faqList, faqSchema, offerBand } from '../components.mjs';

export const meta = {
  path: 'pricing/',
  title: 'Pricing: one monthly price at every dose',
  description: 'Compounded semaglutide $65/month and tirzepatide $110/month, the same price at every dose. Clinician review, 1:1 coach and free delivery included. Cancel anytime.',
  active: 'pricing',
};

const rows = [
  ['How it works', (t) => t.mechanism],
  ['Best for', (t) => t.bestFor],
  ['Monthly price', (t) => `<strong>$${t.price}</strong> at every dose`],
  ['Example starting dose', (t) => `${t.doses[0].mg} mg weekly`],
  ['Example top dose', (t) => `${t.doses[t.doses.length - 1].mg} mg weekly`],
  ['Shipping', () => 'Free, every 4 weeks'],
  ['Clinician review', () => 'Included'],
  ['1:1 care coach', () => 'Included'],
  ['Cancel or change', () => 'Anytime'],
];

export const render = (root) => {
  const billing = faqs.filter((f) => f.cat === 'billing');
  const body = `
${pageHero({
  title: 'One monthly price. Every dose.',
  lead: `Semaglutide is $${treatments[0].price} a month and tirzepatide is $${treatments[1].price} a month. Your dose can go up as your body adjusts. Your price stays put.`,
  extra: `<p class="page-hero__promo">${icon('tag', { size: 18 })}<span><strong>${site.promo.name}:</strong> new members lock in ${site.promo.discount}.</span></p>`,
})}

<section class="section section--tight" aria-labelledby="plans-title">
  <div class="container">
    <h2 id="plans-title" class="visually-hidden">Plans</h2>
    ${plans(root)}
  </div>
</section>

${doseLadder()}

<section class="section" aria-labelledby="included-title">
  <div class="container">
    <div class="section-head">
      <h2 id="included-title" class="display-2">Included in every plan</h2>
      <p class="lead">Medication, care and delivery in one monthly price, with no extra charge when your dose changes.</p>
    </div>
    ${includedList()}
  </div>
</section>

<section class="section section--mist" aria-labelledby="compare-title">
  <div class="container">
    <div class="section-head">
      <h2 id="compare-title" class="display-2">Semaglutide or tirzepatide?</h2>
      <p class="lead">You don&rsquo;t have to decide alone. Your clinician recommends the medication that fits your health history and goals.</p>
    </div>
    <div class="table-wrap" role="region" aria-labelledby="compare-title" tabindex="0">
      <table class="compare-table">
        <thead>
          <tr><td></td>${treatments.map((t) => `<th scope="col" class="compare-table__th compare-table__th--${t.id}">${t.name}<span>${t.kind}</span></th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(([label, fn]) => `<tr><th scope="row">${label}</th>${treatments.map((t) => `<td>${fn(t)}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="fine">Doses shown are an example schedule. Your clinician decides your actual dose. Compounded medications are not FDA-approved.</p>
  </div>
</section>

<section class="section" aria-labelledby="billing-title">
  <div class="container faq-home__grid">
    <div>
      <h2 id="billing-title" class="display-2">Billing, in plain terms</h2>
      <p class="lead">If a clinician doesn&rsquo;t approve treatment, your full initial payment is refunded within seven business days.</p>
      <a class="link-strong" href="${site.url}/refund-policy" target="_blank" rel="noopener">Read the refund and cancellation policy<span class="visually-hidden"> (opens in a new tab)</span></a>
    </div>
    ${faqList(root, billing)}
  </div>
</section>

${offerBand(root)}
`;
  return { body, schema: faqSchema(billing) };
};
