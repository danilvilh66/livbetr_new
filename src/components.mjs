import { site, treatments, included, reviews, faqs, steps, credentials, journey, doseFor, intakeHref } from './data.mjs';
import { icon } from './icons.mjs';
import { picture, ext, splitWords } from './layout.mjs';

const fmtMg = (mg) => (mg === null ? 'None yet' : `${mg} mg`);
const fmtDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const pad = (n) => String(n).padStart(2, '0');

export const stars = (rating, size = 18) => {
  const full = Math.round(rating);
  return `<span class="stars" role="img" aria-label="${rating} out of 5 stars">${Array.from({ length: 5 }, (_, i) => icon('star', { size, cls: i < full ? 'star is-on' : 'star' })).join('')}</span>`;
};

export const checkList = (items, cls = '') => `<ul class="checks ${cls}">${items.map((t) => `<li>${icon('check', { size: 18 })}<span>${t}</span></li>`).join('')}</ul>`;

export const aurora = (cls = '') => `<div class="aurora ${cls}" aria-hidden="true" data-aurora><i></i><i></i><i></i></div>`;

export const sectionHead = ({ id, title, lead = '', level = 2, cls = '' }) =>
  `<div class="section-head ${cls}"><h${level} id="${id}" class="display-2" data-reveal="lines">${title}</h${level}>${lead ? `<p class="lead" data-reveal="up">${lead}</p>` : ''}</div>`;

export const medToggle = (label = 'Medication') => `<div class="seg" role="group" aria-label="${label}" data-med-toggle>
  ${treatments.map((t, i) => `<button type="button" class="seg__btn seg__btn--${t.id}" aria-pressed="${i === 0}" data-med="${t.id}">${t.name}</button>`).join('')}
</div>`;

// ---------- Journey: the pinned six-month story ----------
export const journeySection = () => {
  const data = Object.fromEntries(treatments.map((t) => [t.id, { name: t.name, price: t.price, doses: journey.map((_, i) => doseFor(t, i)) }]));
  const first = treatments[0];
  return `<section class="journey" id="journey" aria-labelledby="journey-title" data-journey>
  <div class="journey__head wrap">
    <h2 id="journey-title" class="display-2" data-reveal="lines">Your first six months</h2>
    <div class="journey__control"><span class="journey__control-label" id="journey-med">Follow the plan for</span>${medToggle('Medication for the six-month story')}</div>
  </div>
  <ol class="journey__list wrap" data-journey-list>
    ${journey
      .map(
        (s, i) => `<li class="journey__item">
      <span class="journey__label">${s.label}</span>
      <div><h3>${s.title}</h3><p>${s.text}</p></div>
      <dl><div><dt>Weekly dose</dt><dd data-step-dose="${i}">${fmtMg(doseFor(first, i))}</dd></div><div><dt>Price</dt><dd data-step-price>$${first.price}/mo</dd></div></dl>
    </li>`,
      )
      .join('')}
  </ol>
  <div class="journey__stage" aria-hidden="true" data-journey-stage>
    ${aurora('aurora--stage')}
    <div class="journey__grid wrap">
      <div class="odometer">
        <span class="odometer__label">Month</span>
        <span class="odometer__window"><span class="odometer__strip" data-odometer>${journey.map((_, i) => `<span>${pad(i)}</span>`).join('')}</span></span>
      </div>
      <div class="journey__panel">
        <div class="ring">
          <svg viewBox="0 0 280 280"><defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2cc5b5"/><stop offset="1" stop-color="#8b7bff"/></linearGradient></defs><circle class="ring__track" cx="140" cy="140" r="120"/><circle class="ring__fill" cx="140" cy="140" r="120" pathLength="100" data-ring/></svg>
          <span class="ring__label"><b data-stage-dose>${fmtMg(null)}</b><span>weekly dose</span></span>
        </div>
        <div class="captions">${journey
          .map((s, i) => `<div class="caption" data-caption="${i}"><p class="caption__label">${s.label}</p><p class="caption__title">${s.title}</p><p class="caption__text">${s.text}</p></div>`)
          .join('')}</div>
      </div>
    </div>
    <div class="ticks wrap">${journey.map((s, i) => `<span class="tick" data-tick="${i}">${s.label}</span>`).join('')}</div>
  </div>
  <script type="application/json" data-journey-data>${JSON.stringify(data)}</script>
</section>`;
};

export const priceScene = () => {
  const t = treatments[0];
  return `<section class="price-scene" aria-labelledby="price-title" data-price-scene>
  ${aurora('aurora--soft')}
  <div class="wrap price-scene__inner">
    <h2 id="price-title" class="price-scene__kicker" data-reveal="up">What stayed the same the whole time</h2>
    <p class="price-scene__giant" data-price-giant><span class="visually-hidden">Monthly price: </span><span data-price-value>$${t.price}</span></p>
    <ul class="price-scene__months" data-price-months>${Array.from({ length: 6 }, (_, i) => `<li><span>Month ${i + 1}</span><b data-price-chip>$${t.price}</b></li>`).join('')}</ul>
    <p class="price-scene__sum" data-price-sum>Six months: $${(t.price * 6).toLocaleString('en-US')} in total. No dose surcharges, no shipping fees.</p>
  </div>
</section>`;
};

// ---------- How it works: horizontal on desktop ----------
const vignettes = [
  () => `<div class="vig"><div class="vig__bar"><i style="width:57%"></i></div><p class="vig__meta">Question 4 of 6</p><p class="vig__q">Do any of these apply to you?</p><span class="vig__opt is-on">${icon('check', { size: 14 })} High blood pressure</span><span class="vig__opt">Type 2 diabetes</span><span class="vig__opt">None of these</span></div>`,
  () => `<div class="vig"><p class="vig__status">${icon('clipboard', { size: 16 })} Plan approved</p><p class="vig__q">Semaglutide, weekly</p><dl class="vig__dl"><div><dt>Starting dose</dt><dd>0.25 mg</dd></div><div><dt>Price</dt><dd>$65/mo</dd></div></dl><p class="vig__meta">Reviewed by your licensed clinician</p></div>`,
  () => `<div class="vig"><p class="vig__status">${icon('truck', { size: 16 })} On its way</p><ol class="vig__track"><li class="is-done">Prepared</li><li class="is-done">Shipped</li><li>Delivered</li></ol><p class="vig__meta">Plain packaging, free shipping</p></div>`,
  () => `<div class="vig"><p class="vig__status">${icon('refresh', { size: 16 })} Next refill ships in 6 days</p><div class="vig__chat"><span>How are you feeling this week?</span><span class="me">Less hungry, sleeping better.</span></div></div>`,
];

export const stepsSection = ({ id = 'how-title', title = 'Four steps. No waiting rooms.', lead = 'Most people finish the eligibility check in about 3 minutes.', withLink = true, root = './' } = {}) => `<section class="steps-section" aria-labelledby="${id}" data-steps>
  <div class="steps-section__pin">
    <div class="wrap steps-section__head">
      ${sectionHead({ id, title, lead })}
      <div class="steps-progress" aria-hidden="true"><i data-steps-progress></i></div>
    </div>
    <ol class="steps-track" data-steps-track>
      ${steps
        .map(
          (s, i) => `<li class="step-card">
        <div class="step-card__visual" aria-hidden="true">${vignettes[i]()}</div>
        <div class="step-card__body">
          <span class="step-card__num" aria-hidden="true">${pad(i + 1)}</span>
          <h3><span class="visually-hidden">Step ${i + 1}: </span>${s.title}</h3>
          <p>${s.text}</p>
          ${checkList(s.detail, 'checks--sm')}
        </div>
      </li>`,
        )
        .join('')}
    </ol>
    ${withLink ? `<div class="wrap steps-section__foot"><a class="btn btn--gold" href="${root}eligibility/">Start my eligibility check</a><a class="link-arrow" href="${root}how-it-works/">More about how it works</a></div>` : ''}
  </div>
</section>`;

// ---------- Plans ----------
export const planCard = (root, t, { level = 3, eager = false } = {}) => `<article class="plan plan--${t.id}" data-spotlight data-reveal="up">
  <div class="plan__media">${picture(root, t.image, { alt: `${t.name} vial, compounded, prescription only`, sizes: '(min-width: 960px) 520px, 92vw', eager })}</div>
  <div class="plan__body">
    <p class="plan__badge">${t.bestFor}</p>
    <h${level} class="plan__name">${t.name}</h${level}>
    <p class="plan__kind">${t.kind}</p>
    <p class="plan__pitch"><strong>${t.pitch}</strong> ${t.summary}</p>
    <p class="plan__price"><span class="plan__amount">$${t.price}</span><span class="plan__per">per month<br>at every dose</span></p>
    ${checkList(t.points)}
    <a class="btn ${t.id === 'semaglutide' ? 'btn--gold' : 'btn--line'} btn--block" href="${intakeHref(t.id)}" data-cta="plan-${t.id}">Start with ${t.name.toLowerCase()}</a>
  </div>
</article>`;

export const plans = (root, opts) => `<div class="plans">${treatments.map((t) => planCard(root, t, opts)).join('')}</div>`;

export const includedList = ({ level = 3 } = {}) =>
  `<ul class="included">${included.map((i) => `<li class="included__item" data-reveal="up"><span class="included__icon">${icon(i.icon, { size: 22 })}</span><h${level}>${i.title}</h${level}><p>${i.text}</p></li>`).join('')}</ul>`;

export const credentialRow = () => `<ul class="creds" aria-label="Credentials">${credentials
  .map((c) => {
    const inner = `${icon(c.icon, { size: 18 })}<span>${c.label}</span>`;
    return `<li>${c.href ? ext(c.href, inner, 'creds__link') : inner}</li>`;
  })
  .join('')}</ul>`;

// ---------- 15% estimate ----------
export const estimate = (root) => `<section class="estimate section" id="estimate" aria-labelledby="estimate-title" data-estimate>
  <div class="wrap estimate__grid">
    <div>
      ${sectionHead({ id: 'estimate-title', title: 'What could 15% mean for you?', lead: 'Livbetr plans are built around a goal of losing about 15% of your body weight. Enter your weight to see the number.' })}
      <p class="fine" data-reveal="up">An estimate, not a prediction or guarantee. Individual results vary and depend on your health, dose, diet and activity.</p>
    </div>
    <div class="estimate__panel glass" data-reveal="up">
      <fieldset class="units">
        <legend class="visually-hidden">Units</legend>
        <label><input type="radio" name="est-unit" value="lb" checked data-unit> lb</label>
        <label><input type="radio" name="est-unit" value="kg" data-unit> kg</label>
      </fieldset>
      <div class="estimate__field">
        <label for="est-weight">Your current weight</label>
        <div class="estimate__inputs">
          <input class="range" id="est-weight" type="range" min="140" max="400" step="1" value="220" data-weight-range aria-describedby="est-help">
          <div class="number-field"><input id="est-weight-num" type="number" inputmode="numeric" min="140" max="400" step="1" value="220" aria-label="Current weight" data-weight-number><span data-unit-label>lb</span></div>
        </div>
        <p class="fine" id="est-help">Range <span data-range-text>140 to 400 lb</span></p>
      </div>
      <div class="estimate__result" aria-live="polite">
        <p class="estimate__big"><span class="visually-hidden">Estimated loss: </span><output data-out="loss">33</output><span class="estimate__unit" data-unit-label>lb</span></p>
        <p class="estimate__sub">Goal weight: <output data-out="goal">187</output> <span data-unit-label>lb</span></p>
      </div>
      <a class="btn btn--gold btn--block" href="${root}eligibility/">Check my eligibility</a>
    </div>
  </div>
</section>`;

// ---------- Care ----------
export const careSection = (root) => `<section class="care section" aria-labelledby="care-title">
  <div class="wrap care__grid">
    <div class="care__media" data-parallax>
      ${picture(root, 'coach-smile', { alt: 'A woman laughing with her eyes closed', sizes: '(min-width: 960px) 480px, 92vw', cls: 'care__img' })}
      <p class="care__note" aria-hidden="true"><span class="care__avatar">${icon('user', { size: 18 })}</span><span><strong>Your care coach</strong>How did this week go?</span></p>
    </div>
    <div>
      ${sectionHead({ id: 'care-title', title: 'People who keep showing up', lead: 'A prescription is the start, not the plan. Every membership includes the people and check-ins that help you stick with it.' })}
      ${includedList()}
    </div>
  </div>
</section>`;

// ---------- Reviews ----------
export const reviewsBlock = () => {
  const tp = site.trustpilot;
  return `<section class="reviews section" id="reviews" aria-labelledby="reviews-title">
  <div class="wrap">
    <div class="reviews__head">
      ${sectionHead({ id: 'reviews-title', title: 'People notice how they’re treated', lead: `${tp.fiveStarShare}% of our ${tp.count.toLocaleString('en-US')} Trustpilot reviews are five stars, and most are about one thing: a real person who helped.` })}
      <div class="reviews__score" data-reveal="up"><p class="reviews__rating"><span data-count-to="${tp.rating}" data-count-decimals="1">${tp.rating}</span><small>/5</small></p>${stars(tp.rating, 20)}<p class="fine">${tp.count.toLocaleString('en-US')} reviews on Trustpilot</p></div>
    </div>
    <ul class="reviews__list">${reviews
      .map(
        (r) => `<li class="review" data-reveal="up"><figure>${stars(5, 16)}<blockquote><p class="review__title">${r.title}</p><p>${r.text}</p></blockquote><figcaption><strong>${r.name}</strong><time datetime="${r.date}">${fmtDate(r.date)}</time></figcaption></figure></li>`,
      )
      .join('')}</ul>
    <p class="reviews__more">${ext(tp.url, `Read all ${tp.count.toLocaleString('en-US')} reviews on Trustpilot`, 'link-arrow')}</p>
  </div>
</section>`;
};

// ---------- FAQ ----------
export const faqItem = (root, f) => `<details class="faq" id="${f.id}" data-faq data-cat="${f.cat}">
  <summary><span class="faq__q">${f.q}</span><span class="faq__icon" aria-hidden="true">${icon('plus', { size: 18 })}</span></summary>
  <div class="faq__a"><p>${f.a.replaceAll('{root}', root)}</p></div>
</details>`;

export const faqList = (root, items) => `<div class="faqs" data-reveal="up">${items.map((f) => faqItem(root, f)).join('')}</div>`;

export const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '').replaceAll('{root}', '') } })),
});

export const homeFaqs = () => faqs.filter((f) => f.home);

export const faqSection = (root, items, { id = 'faq-title', title = 'Questions, answered plainly', lead } = {}) => `<section class="section faq-block" aria-labelledby="${id}">
  <div class="wrap faq-block__grid">
    <div class="faq-block__intro">
      ${sectionHead({ id, title, lead: lead ?? `Still unsure? Call <a href="${site.phoneHref}">${site.phone}</a>, ${site.supportHours.days}, ${site.supportHours.time}.` })}
      <a class="link-arrow" href="${root}faq/" data-reveal="up">Browse all questions</a>
    </div>
    ${faqList(root, items)}
  </div>
</section>`;

// ---------- Closing CTA ----------
export const finalCta = (root) => `<section class="final" aria-labelledby="final-title">
  ${aurora()}
  <div class="wrap final__inner">
    <h2 id="final-title" class="final__title" data-reveal="lines">Start month one.</h2>
    <p class="lead" data-reveal="up">New members lock in ${site.promo.discount}. No long-term commitment, and you can cancel anytime.</p>
    <div class="btn-row" data-reveal="up"><a class="btn btn--gold btn--lg" href="${root}eligibility/" data-magnetic>Check my eligibility</a><a class="btn btn--line btn--lg" href="${root}pricing/">Compare plans</a></div>
    ${checkList(['Free shipping', 'No insurance required', 'Clinician review included', 'Cancel anytime'], 'checks--inline')}
  </div>
</section>`;

export const pageHero = ({ title, lead = '', extra = '', cls = '' }) => `<section class="page-hero ${cls}">
  ${aurora('aurora--soft')}
  <div class="wrap page-hero__inner">
    <h1 class="display-1 hero-split">${splitWords(title)}</h1>
    ${lead ? `<p class="lead page-hero__lead">${lead}</p>` : ''}
    ${extra}
  </div>
</section>`;
