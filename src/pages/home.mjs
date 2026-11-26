import { site, treatments } from '../data.mjs';
import { icon } from '../icons.mjs';
import { picture } from '../layout.mjs';
import {
  stars, checkList, credentialStrip, doseLadder, plans, includedList, stepList, estimate, reviewsBlock, faqList, homeFaqs, faqSchema, offerBand,
} from '../components.mjs';

export const meta = {
  path: '',
  title: 'Livbetr | GLP-1 weight-loss care from $65/month',
  description:
    'See if you qualify for GLP-1 weight-loss medication in about 3 minutes. Semaglutide $65/mo, tirzepatide $110/mo, the same price at every dose. Clinician review, 1:1 coach and free delivery included.',
  active: 'home',
};

export const render = (root) => {
  const [sema, tirz] = treatments;
  const tp = site.trustpilot;
  const body = `
<section class="hero">
  <div class="container hero__grid">
    <div class="hero__copy">
      <a class="hero__rating" href="#reviews-title">${stars(tp.rating, 16)}<span><strong>${tp.rating}</strong> on Trustpilot from ${tp.count.toLocaleString('en-US')} reviews</span></a>
      <h1 class="display-hero">Weight-loss care, priced honestly.</h1>
      <p class="lead hero__lead">See if you qualify for GLP-1 medication in about 3 minutes. Every plan includes a licensed clinician, a 1:1 care coach and free delivery, at one price for every dose.</p>
      <div class="btn-row">
        <a class="btn btn--primary btn--lg" href="${root}eligibility/" data-cta="hero">Check my eligibility</a>
        <a class="btn btn--ghost btn--lg" href="${root}pricing/">See pricing</a>
      </div>
      <ul class="hero__facts">
        <li>${icon('shieldCheck', { size: 18 })}No insurance needed</li>
        <li>${icon('truck', { size: 18 })}Free, discreet delivery</li>
        <li>${icon('check', { size: 18 })}Cancel anytime</li>
      </ul>
    </div>
    <div class="hero__visual">
      <div class="hero__arch">
        ${picture(root, 'hero-person', { alt: 'A smiling woman in activewear', sizes: '(min-width: 960px) 420px, 70vw', eager: true, cls: 'hero__person' })}
      </div>
      <a class="price-tag" href="#same-price" aria-label="Semaglutide $${sema.price} a month, tirzepatide $${tirz.price} a month, the same price at every dose. See how pricing works.">
        <span class="price-tag__hole" aria-hidden="true"></span>
        <span class="price-tag__row"><span class="price-tag__name price-tag__name--sema">${sema.name}</span><span class="price-tag__amt">$${sema.price}<small>/mo</small></span></span>
        <span class="price-tag__row"><span class="price-tag__name price-tag__name--tirz">${tirz.name}</span><span class="price-tag__amt">$${tirz.price}<small>/mo</small></span></span>
        <span class="price-tag__foot">Same price at every dose</span>
      </a>
      <p class="hero__chip">${icon('message', { size: 16 })}Your coach, one message away</p>
    </div>
  </div>
</section>

${credentialStrip()}

${doseLadder()}

<section class="section how" aria-labelledby="how-title">
  <div class="container">
    <div class="section-head">
      <h2 id="how-title" class="display-2">From first question to your front door</h2>
      <p class="lead">No waiting rooms and no pharmacy lines. Most people finish the eligibility check in about 3 minutes.</p>
    </div>
    ${stepList()}
    <div class="section-foot">
      <a class="btn btn--primary" href="${root}eligibility/">Start my eligibility check</a>
      <a class="link-strong" href="${root}how-it-works/">More about how it works</a>
    </div>
  </div>
</section>

<section class="section pricing-home" id="pricing" aria-labelledby="plans-title">
  <div class="container">
    <div class="section-head">
      <h2 id="plans-title" class="display-2">Two medications. Two honest prices.</h2>
      <p class="lead">Both are compounded, prescribed only after a licensed clinician reviews your health history, and shipped every 4 weeks.</p>
    </div>
    ${plans(root)}
    <p class="fine center">Compounded medications are not FDA-approved. <a href="${site.url}/glp-1-safety-information" target="_blank" rel="noopener">Read the safety information<span class="visually-hidden"> (opens in a new tab)</span></a>.</p>
  </div>
</section>

${estimate(root)}

<section class="section care" aria-labelledby="care-title">
  <div class="container care__grid">
    <div class="care__media">
      ${picture(root, 'coach-smile', { alt: 'A woman laughing with her eyes closed', sizes: '(min-width: 960px) 460px, 92vw', cls: 'care__img' })}
      <div class="care__note" aria-hidden="true">
        <span class="care__avatar">${icon('user', { size: 18 })}</span>
        <span><strong>Your care coach</strong>Checking in: how did this week go?</span>
      </div>
    </div>
    <div class="care__copy">
      <h2 id="care-title" class="display-2">Care that keeps showing up after the first delivery</h2>
      <p class="lead">A prescription is the start, not the plan. Every membership includes the people and check-ins that help you stick with it.</p>
      ${includedList()}
    </div>
  </div>
</section>

<div id="reviews">${reviewsBlock()}</div>

<section class="section faq-home" aria-labelledby="faq-title">
  <div class="container faq-home__grid">
    <div>
      <h2 id="faq-title" class="display-2">Questions, answered plainly</h2>
      <p class="lead">Still unsure? Call us at <a href="${site.phoneHref}">${site.phone}</a>, ${site.supportHours.days}, ${site.supportHours.time}.</p>
      <a class="link-strong" href="${root}faq/">Browse all questions</a>
    </div>
    ${faqList(root, homeFaqs())}
  </div>
</section>

${offerBand(root)}
`;
  return { body, schema: faqSchema(homeFaqs()) };
};
