import { site, treatments } from '../data.mjs';
import { icon } from '../icons.mjs';
import { picture, splitWords } from '../layout.mjs';
import {
  aurora, stars, credentialRow, journeySection, priceScene, stepsSection, sectionHead, plans, estimate, careSection, reviewsBlock, faqSection, homeFaqs, faqSchema, finalCta,
} from '../components.mjs';

export const meta = {
  path: '',
  title: 'Livbetr | GLP-1 weight-loss care from $65/month',
  description:
    'See if you qualify for GLP-1 weight-loss medication in about 3 minutes. Semaglutide $65/mo, tirzepatide $110/mo, the same price at every dose. Clinician review, 1:1 coach and free delivery included.',
  active: 'home',
  withHud: true,
};

export const render = (root) => {
  const tp = site.trustpilot;
  const body = `
<section class="hero" aria-labelledby="hero-title" data-hero>
  ${aurora('aurora--hero')}
  <div class="hero__person" data-hero-person>${picture(root, 'hero-person', { alt: '', sizes: '(min-width: 960px) 40vw, 70vw', eager: true, cls: 'hero__person-img' })}</div>
  <div class="wrap hero__inner">
    <a class="hero__rating" href="#reviews">${stars(tp.rating, 15)}<span><strong>${tp.rating}</strong> on Trustpilot, ${tp.count.toLocaleString('en-US')} reviews</span></a>
    <h1 id="hero-title" class="hero__title hero-split">${splitWords('Six months')} <br>${splitWords('from now.')}</h1>
    <div class="hero__bottom">
      <p class="lead hero__lead">GLP-1 weight-loss care with a licensed clinician, a 1:1 coach and free delivery. Your dose will change along the way. Your price won’t.</p>
      <div class="btn-row hero__ctas">
        <a class="btn btn--gold btn--lg" href="${root}eligibility/" data-magnetic data-cta="hero">Check my eligibility</a>
        <a class="btn btn--line btn--lg" href="#journey">See the six months</a>
      </div>
      <ul class="hero__prices">${treatments.map((t) => `<li class="hero__price hero__price--${t.id}"><span>${t.name}</span><b>$${t.price}</b><small>/mo, every dose</small></li>`).join('')}</ul>
    </div>
  </div>
  <a class="scroll-cue" href="#journey"><span>Scroll to month one</span>${icon('chevronDown', { size: 18 })}</a>
</section>

<div class="wrap creds-wrap">${credentialRow()}</div>

${journeySection()}

${priceScene()}

${stepsSection({ root })}

<section class="section" id="pricing" aria-labelledby="plans-title">
  <div class="wrap">
    ${sectionHead({ id: 'plans-title', title: 'Two medications. One price each.', lead: 'Both are compounded, prescribed only after a licensed clinician reviews your health history, and shipped every 4 weeks.' })}
    ${plans(root)}
    <p class="fine center">Compounded medications are not FDA-approved. <a href="${root}glp-1-safety-information/">Read the safety information</a>.</p>
  </div>
</section>

${estimate(root)}

${careSection(root)}

${reviewsBlock()}

${faqSection(root, homeFaqs())}

${finalCta(root)}
`;
  return { body, schema: faqSchema(homeFaqs()), bodyClass: 'page-home' };
};
