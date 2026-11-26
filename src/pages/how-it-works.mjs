import { site, steps, faqs } from '../data.mjs';
import { icon } from '../icons.mjs';
import { picture } from '../layout.mjs';
import { pageHero, checkList, includedList, faqList, faqSchema, offerBand, credentialStrip } from '../components.mjs';

export const meta = {
  path: 'how-it-works/',
  title: 'How it works',
  description: 'How Livbetr GLP-1 care works: a 3-minute eligibility check, review by a licensed U.S. clinician, free discreet delivery from a licensed pharmacy, and refills that arrive on time.',
  active: 'how',
};

// Phone screens in the photos are blank, so we lay a small piece of real UI on top.
const quizScreen = `<div class="screen screen--s1" aria-hidden="true">
  <span class="screen__logo">Livbetr</span>
  <span class="screen__bar"><i style="width:17%"></i></span>
  <span class="screen__meta">Question 1 of 6</span>
  <span class="screen__q">How much weight would you like to lose?</span>
  <span class="screen__opt is-on">21 to 50 lb</span>
  <span class="screen__opt">1 to 20 lb</span>
  <span class="screen__opt">More than 50 lb</span>
  <span class="screen__btn">Continue</span>
</div>`;
const refillScreen = `<div class="screen screen--s4" aria-hidden="true">
  <span class="screen__logo">Livbetr</span>
  <span class="screen__q">Your refill has shipped</span>
  <span class="screen__meta">Semaglutide, 4-week supply</span>
  <span class="screen__track"><i class="is-done"></i><i class="is-done"></i><i></i></span>
  <span class="screen__meta">Arrives before your current supply runs out</span>
  <span class="screen__bubble">Coach: How are you feeling this week?</span>
</div>`;

const stepImages = [
  { img: 'step-1', alt: 'Hands holding a phone showing the eligibility check', screen: quizScreen },
  { img: 'step-2', alt: 'A woman in a green sweater smiling calmly' },
  { img: 'step-3', alt: 'A plain dark-blue shipping box' },
  { img: 'step-4', alt: 'An open box with a medication vial and a phone showing a refill update', screen: refillScreen },
];

const roles = [
  {
    icon: 'smartphone',
    who: 'Livbetr',
    does: 'Runs the platform you use: the eligibility check, your patient portal, billing, delivery coordination and your 1:1 care coach.',
  },
  {
    icon: 'stethoscope',
    who: 'Licensed U.S. clinicians',
    does: 'Independent clinicians in our partner network review your health history and decide whether a prescription is right for you, and at what dose.',
  },
  {
    icon: 'pharmacy',
    who: 'Licensed U.S. pharmacies',
    does: 'Accredited pharmacies prepare your compounded medication and ship it to you. The pharmacy is named on your medication label.',
  },
];

export const render = (root) => {
  const start = faqs.filter((f) => f.cat === 'start' || f.id === 'dosing');
  const body = `
${pageHero({
  title: 'From eligibility check to your front door',
  lead: 'Four steps, no waiting rooms. Here is exactly what happens after you start, and who does what.',
  extra: `<div class="btn-row"><a class="btn btn--primary btn--lg" href="${root}eligibility/">Check my eligibility</a><a class="btn btn--ghost btn--lg" href="${root}pricing/">See pricing</a></div>`,
})}

<section class="section section--tight" aria-labelledby="steps-title">
  <div class="container">
    <h2 id="steps-title" class="visually-hidden">The four steps</h2>
    <ol class="timeline">
      ${steps
        .map(
          (s, i) => `<li class="timeline__item">
        <div class="timeline__media">${picture(root, stepImages[i].img, { alt: stepImages[i].alt, sizes: '(min-width: 960px) 520px, 92vw' })}${stepImages[i].screen ?? ''}</div>
        <div class="timeline__copy">
          <span class="timeline__num" aria-hidden="true">${i + 1}</span>
          <h3 class="display-3"><span class="visually-hidden">Step ${i + 1}: </span>${s.title}</h3>
          <p>${s.text}</p>
          ${checkList(s.detail)}
        </div>
      </li>`,
        )
        .join('')}
    </ol>
  </div>
</section>

${credentialStrip()}

<section class="section" aria-labelledby="roles-title">
  <div class="container">
    <div class="section-head">
      <h2 id="roles-title" class="display-2">Who does what</h2>
      <p class="lead">Telehealth works best when you know who is responsible for each part of your care.</p>
    </div>
    <ul class="roles">
      ${roles
        .map(
          (r) => `<li class="role"><span class="role__icon">${icon(r.icon === 'smartphone' ? 'user' : r.icon, { size: 22 })}</span><h3>${r.who}</h3><p>${r.does}</p></li>`,
        )
        .join('')}
    </ul>
  </div>
</section>

<section class="section section--mist" aria-labelledby="ongoing-title">
  <div class="container">
    <div class="section-head">
      <h2 id="ongoing-title" class="display-2">Care that keeps going</h2>
      <p class="lead">Your plan adapts as you do. Here is what stays with you every month.</p>
    </div>
    ${includedList()}
  </div>
</section>

<section class="section" aria-labelledby="start-faq-title">
  <div class="container faq-home__grid">
    <div>
      <h2 id="start-faq-title" class="display-2">Before you start</h2>
      <p class="lead">Questions about safety or side effects? Message your care team in the <a href="${site.portalUrl}" rel="noopener">patient portal</a>.</p>
      <a class="link-strong" href="${root}faq/">See all questions</a>
    </div>
    ${faqList(root, start)}
  </div>
</section>

${offerBand(root)}
`;
  return { body, schema: faqSchema(start) };
};
