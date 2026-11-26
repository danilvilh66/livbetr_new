import { site, treatments, included, reviews, faqs, steps, credentials, intakeHref } from './data.mjs';
import { icon } from './icons.mjs';
import { picture, ext } from './layout.mjs';

const fmtMg = (mg) => `${Number.isInteger(mg) ? mg : mg.toString()} mg`;
const fmtDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const stars = (rating, size = 18) => {
  const full = Math.round(rating);
  return `<span class="stars" role="img" aria-label="${rating} out of 5 stars">${Array.from({ length: 5 }, (_, i) =>
    icon('star', { size, cls: i < full ? 'star is-on' : 'star' }),
  ).join('')}</span>`;
};

export const checkList = (items, cls = '') =>
  `<ul class="checks ${cls}">${items.map((t) => `<li>${icon('check', { size: 18 })}<span>${t}</span></li>`).join('')}</ul>`;

export const credentialStrip = () => `<section class="creds" aria-label="Credentials">
  <ul class="container creds__list">
    ${credentials
      .map((c) => {
        const inner = `${icon(c.icon, { size: 20 })}<span>${c.label}</span>`;
        return `<li>${c.href ? ext(c.href, inner, 'creds__link') : inner}</li>`;
      })
      .join('')}
  </ul>
</section>`;

// ---------- Dose ladder: the signature element ----------
const CHART = { w: 600, h: 372, padX: 12, base: 236, maxBar: 196, barW: 60, priceY: 318 };

const ladderSvg = (t) => {
  const colW = (CHART.w - CHART.padX * 2) / t.doses.length;
  const max = Math.max(...t.doses.map((d) => d.mg));
  const cols = t.doses
    .map((d, i) => {
      const cx = CHART.padX + colW * i + colW / 2;
      const h = Math.max(16, Math.round((d.mg / max) * CHART.maxBar));
      const y = CHART.base - h;
      return `<g class="ladder__col" data-month="${d.month}" style="--i:${i}">
      <rect class="ladder__hit" x="${cx - colW / 2}" y="0" width="${colW}" height="${CHART.h}" />
      <rect class="ladder__bar" x="${cx - CHART.barW / 2}" y="${y}" width="${CHART.barW}" height="${h}" rx="10" />
      <text class="ladder__dose" x="${cx}" y="${y - 12}" text-anchor="middle">${fmtMg(d.mg)}</text>
      <text class="ladder__month" x="${cx}" y="${CHART.base + 26}" text-anchor="middle">Month ${d.month}</text>
      <rect class="ladder__pill" x="${cx - 38}" y="${CHART.priceY - 20}" width="76" height="40" rx="20" />
      <text class="ladder__price" x="${cx}" y="${CHART.priceY + 6}" text-anchor="middle">$${t.price}</text>
    </g>`;
    })
    .join('');
  return `<g class="ladder__set" data-set="${t.id}"${t.id === 'semaglutide' ? '' : ' hidden'}>
    <line class="ladder__flat" x1="${CHART.padX + 8}" x2="${CHART.w - CHART.padX - 8}" y1="${CHART.priceY}" y2="${CHART.priceY}" />
    ${cols}
  </g>`;
};

const ladderTable = (t) => `<div class="visually-hidden"><table data-table="${t.id}">
  <caption>${t.name}: example weekly dose and monthly price by month</caption>
  <thead><tr><th scope="col">Month</th><th scope="col">Weekly dose</th><th scope="col">Monthly price</th></tr></thead>
  <tbody>${t.doses.map((d) => `<tr><th scope="row">Month ${d.month}</th><td>${fmtMg(d.mg)}</td><td>$${t.price}</td></tr>`).join('')}</tbody>
</table></div>`;

export const doseLadder = ({ headingLevel = 2 } = {}) => {
  const h = `h${headingLevel}`;
  const data = Object.fromEntries(treatments.map((t) => [t.id, { name: t.name, price: t.price, doses: t.doses }]));
  return `<section class="ladder" id="same-price" aria-labelledby="ladder-title" data-ladder>
  <div class="container ladder__grid">
    <div class="ladder__copy">
      <${h} id="ladder-title" class="display-2">Your dose will change. Your price won&rsquo;t.</${h}>
      <p class="lead">GLP-1 treatment usually starts on a low dose that steps up as your body adjusts. With Livbetr, every step costs the same, for as long as you stay on your plan.</p>
      <div class="seg" role="tablist" aria-label="Medication">
        ${treatments
          .map(
            (t, i) =>
              `<button class="seg__btn seg__btn--${t.id}" type="button" role="tab" id="ladder-tab-${t.id}" aria-controls="ladder-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-treatment="${t.id}">${t.name}</button>`,
          )
          .join('')}
      </div>
      <div class="ladder__readout" aria-live="polite" data-readout>
        <div><span class="ladder__label">Month</span><span class="ladder__value" data-out="month">1</span></div>
        <div><span class="ladder__label">Weekly dose</span><span class="ladder__value" data-out="dose">${fmtMg(treatments[0].doses[0].mg)}</span></div>
        <div><span class="ladder__label">Your price</span><span class="ladder__value ladder__value--price" data-out="price">$${treatments[0].price}<small>/mo</small></span></div>
      </div>
      <label class="ladder__range-label" for="ladder-month">Step through the months</label>
      <input class="range range--dark" id="ladder-month" type="range" min="1" max="6" step="1" value="1" aria-valuetext="Month 1" data-month-range>
      <p class="fine fine--dark">Example schedule. Your clinician sets your actual dose based on how you respond.</p>
    </div>
    <figure class="ladder__chart" id="ladder-panel" role="tabpanel" aria-labelledby="ladder-tab-semaglutide" data-treatment="semaglutide">
      <svg viewBox="0 0 ${CHART.w} ${CHART.h}" role="img" aria-labelledby="ladder-svg-title">
        <title id="ladder-svg-title">Bar chart: the weekly dose rises month by month while the monthly price stays flat.</title>
        ${treatments.map(ladderSvg).join('')}
      </svg>
      <figcaption class="ladder__legend">
        <span><i class="key key--dose"></i>Weekly dose</span>
        <span><i class="key key--price"></i>Monthly price</span>
      </figcaption>
      ${treatments.map(ladderTable).join('')}
    </figure>
  </div>
  <script type="application/json" data-ladder-data>${JSON.stringify(data)}</script>
</section>`;
};

// ---------- Plans ----------
export const planCard = (root, t, { headingLevel = 3 } = {}) => {
  const h = `h${headingLevel}`;
  return `<article class="plan plan--${t.id}" id="plan-${t.id}">
  <div class="plan__media">${picture(root, t.image, { alt: `${t.name} vial, compounded, prescription only`, sizes: '(min-width: 960px) 280px, 90vw' })}</div>
  <div class="plan__body">
    <p class="plan__badge">${t.bestFor}</p>
    <${h} class="plan__name">${t.name}</${h}>
    <p class="plan__kind">${t.kind}</p>
    <p class="plan__pitch"><strong>${t.pitch}</strong> ${t.summary}</p>
    <p class="plan__price"><span class="plan__amount">$${t.price}</span><span class="plan__per">per month<br>at every dose</span></p>
    ${checkList(t.points)}
    <a class="btn btn--primary btn--block" href="${intakeHref(t.id)}" data-cta="plan-${t.id}">Start with ${t.name.toLowerCase()}</a>
  </div>
</article>`;
};

export const plans = (root, opts) =>
  `<div class="plans">${treatments.map((t) => planCard(root, t, opts)).join('')}</div>`;

export const includedList = ({ headingLevel = 3 } = {}) =>
  `<ul class="included">${included
    .map(
      (i) =>
        `<li class="included__item"><span class="included__icon">${icon(i.icon, { size: 22 })}</span><h${headingLevel} class="included__title">${i.title}</h${headingLevel}><p>${i.text}</p></li>`,
    )
    .join('')}</ul>`;

// ---------- Step vignettes: small, honest UI previews of each step ----------
const vignettes = [
  () => `<div class="vig vig--quiz" aria-hidden="true">
    <div class="vig__bar"><span style="width:57%"></span></div>
    <p class="vig__meta">Question 4 of 7</p>
    <p class="vig__q">Do any of these apply to you?</p>
    <span class="vig__opt is-on">${icon('check', { size: 14 })} High blood pressure</span>
    <span class="vig__opt">Type 2 diabetes</span>
    <span class="vig__opt">None of these</span>
  </div>`,
  () => `<div class="vig vig--plan" aria-hidden="true">
    <p class="vig__status">${icon('clipboard', { size: 16 })} Plan approved</p>
    <p class="vig__q">Semaglutide, weekly</p>
    <dl class="vig__dl"><div><dt>Starting dose</dt><dd>0.25 mg</dd></div><div><dt>Price</dt><dd>$65/mo</dd></div></dl>
    <p class="vig__note">Reviewed by your licensed clinician</p>
  </div>`,
  () => `<div class="vig vig--ship" aria-hidden="true">
    <p class="vig__status">${icon('truck', { size: 16 })} On its way</p>
    <ol class="vig__track"><li class="is-done">Prepared</li><li class="is-done">Shipped</li><li>Delivered</li></ol>
    <p class="vig__note">Plain packaging, free shipping</p>
  </div>`,
  () => `<div class="vig vig--refill" aria-hidden="true">
    <p class="vig__status">${icon('refresh', { size: 16 })} Next refill ships in 6 days</p>
    <div class="vig__chat"><span class="vig__bubble">How are you feeling this week?</span><span class="vig__bubble vig__bubble--me">Less hungry, sleeping better.</span></div>
  </div>`,
];

export const stepList = ({ headingLevel = 3, withVignettes = true } = {}) =>
  `<ol class="steps">${steps
    .map(
      (s, i) => `<li class="step">
      ${withVignettes ? `<div class="step__visual">${vignettes[i]()}</div>` : ''}
      <span class="step__num" aria-hidden="true">${i + 1}</span>
      <h${headingLevel} class="step__title"><span class="visually-hidden">Step ${i + 1}: </span>${s.title}</h${headingLevel}>
      <p>${s.text}</p>
    </li>`,
    )
    .join('')}</ol>`;

// ---------- Estimate + illustration compare ----------
export const estimate = (root, { headingLevel = 2 } = {}) => {
  const h = `h${headingLevel}`;
  return `<section class="estimate section" id="estimate" aria-labelledby="estimate-title" data-estimate>
  <div class="container estimate__grid">
    <div class="estimate__panel">
      <${h} id="estimate-title" class="display-2">What could 15% look like for you?</${h}>
      <p class="lead">Livbetr plans are built around a goal of losing about 15% of your body weight. Enter your weight to see what that means for you.</p>
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
        <p class="estimate__big"><span class="visually-hidden">Estimated loss: </span>about <output data-out="loss">33</output> <span data-unit-label>lb</span></p>
        <p class="estimate__sub">Goal weight: <output data-out="goal">187</output> <span data-unit-label>lb</span></p>
      </div>
      <a class="btn btn--primary" href="${root}eligibility/">Check my eligibility</a>
      <p class="fine">An estimate, not a prediction or guarantee. Individual results vary and depend on your health, dose, diet and activity.</p>
    </div>
    <figure class="compare" data-compare>
      <div class="compare__frame">
        ${picture(root, 'illustration-before', { alt: 'Illustration: a woman before weight loss', sizes: '(min-width: 960px) 520px, 92vw', cls: 'compare__img' })}
        <div class="compare__after" data-compare-after>
          ${picture(root, 'illustration-after', { alt: 'Illustration: the same woman after about 15% weight loss', sizes: '(min-width: 960px) 520px, 92vw', cls: 'compare__img' })}
        </div>
        <span class="compare__tag compare__tag--before" aria-hidden="true">Before</span>
        <span class="compare__tag compare__tag--after" aria-hidden="true">After</span>
        <div class="compare__handle" aria-hidden="true" data-compare-handle><span>${icon('chevronLeft', { size: 16 })}${icon('chevronRight', { size: 16 })}</span></div>
        <input class="compare__range" type="range" min="0" max="100" value="50" aria-label="Reveal the after illustration" data-compare-range>
      </div>
      <figcaption class="fine">Illustration, not an actual patient. Drag to compare.</figcaption>
    </figure>
  </div>
</section>`;
};

// ---------- Reviews ----------
export const reviewsBlock = ({ headingLevel = 2 } = {}) => {
  const h = `h${headingLevel}`;
  const tp = site.trustpilot;
  return `<section class="reviews section" aria-labelledby="reviews-title">
  <div class="container">
    <div class="reviews__head">
      <div>
        <${h} id="reviews-title" class="display-2">People notice how they&rsquo;re treated.</${h}>
        <p class="lead">${tp.fiveStarShare}% of our ${tp.count.toLocaleString('en-US')} Trustpilot reviews are five stars, and most of them are about one thing: a real person who helped.</p>
      </div>
      <div class="reviews__score">
        <p class="reviews__rating">${tp.rating}<span>/5</span></p>
        ${stars(tp.rating, 20)}
        <p class="fine">${tp.count.toLocaleString('en-US')} reviews on Trustpilot</p>
      </div>
    </div>
    <ul class="reviews__list">
      ${reviews
        .map(
          (r) => `<li class="review">
        <figure>
          ${stars(5, 16)}
          <blockquote><p class="review__title">${r.title}</p><p>${r.text}</p></blockquote>
          <figcaption><strong>${r.name}</strong><time datetime="${r.date}">${fmtDate(r.date)}</time></figcaption>
        </figure>
      </li>`,
        )
        .join('')}
    </ul>
    <p class="reviews__more">${ext(tp.url, `Read all ${tp.count.toLocaleString('en-US')} reviews on Trustpilot`, 'link-strong')}</p>
  </div>
</section>`;
};

// ---------- FAQ ----------
export const faqItem = (root, f, { open = false } = {}) => `<details class="faq" id="${f.id}" data-faq data-cat="${f.cat}"${open ? ' open' : ''}>
  <summary><span class="faq__q">${f.q}</span><span class="faq__icon" aria-hidden="true">${icon('plus', { size: 18 })}</span></summary>
  <div class="faq__a"><p>${f.a.replaceAll('{root}', root)}</p></div>
</details>`;

export const faqList = (root, items) => `<div class="faqs">${items.map((f) => faqItem(root, f)).join('')}</div>`;

export const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '').replaceAll('{root}', '') },
  })),
});

export const homeFaqs = () => faqs.filter((f) => f.home);

// ---------- Closing offer ----------
export const offerBand = (root, { headingLevel = 2 } = {}) => {
  const h = `h${headingLevel}`;
  return `<section class="offer" aria-labelledby="offer-title">
  <div class="container offer__inner">
    <div class="offer__copy">
      <${h} id="offer-title" class="display-2">Lock in $200 off, for as long as you stay.</${h}>
      <p class="lead">New members get ${site.promo.discount}. No long-term commitment, and you can cancel anytime.</p>
      <div class="btn-row">
        <a class="btn btn--accent btn--lg" href="${root}eligibility/">Check my eligibility</a>
        <a class="btn btn--on-dark btn--lg" href="${root}pricing/">Compare plans</a>
      </div>
      ${checkList(['Free shipping', 'No insurance required', 'Clinician review included', 'Cancel anytime'], 'checks--inline checks--dark')}
    </div>
    <div class="offer__media">${picture(root, 'pair', { alt: 'Semaglutide and tirzepatide vials side by side', sizes: '(min-width: 960px) 420px, 80vw' })}</div>
  </div>
</section>`;
};

export const pageHero = ({ title, lead, kicker = '', extra = '' }) => `<section class="page-hero">
  <div class="container page-hero__inner">
    ${kicker}
    <h1 class="display-1">${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
    ${extra}
  </div>
</section>`;
