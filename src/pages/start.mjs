import { site, usStates, treatments } from '../data.mjs';
import { icon } from '../icons.mjs';
import { aurora, checkList } from '../components.mjs';

export const meta = {
  path: 'start/',
  title: 'Start your intake',
  description: 'Complete your Livbetr intake: choose a medication, share your health history and shipping address, and send it for review by a licensed clinician.',
  active: '',
  noindex: true,
};

const preview = !site.integrations.intakeEndpoint;

const radioCard = (name, value, label, hint = '', checked = false) =>
  `<label class="option"><input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''}><span class="option__box"><span><span class="option__label">${label}</span>${hint ? `<span class="option__hint">${hint}</span>` : ''}</span></span></label>`;
const checkCard = (name, value, label, { exclusive = false } = {}) =>
  `<label class="option option--check"><input type="checkbox" name="${name}" value="${value}"${exclusive ? ' data-exclusive' : ''}><span class="option__box"><span class="option__tick" aria-hidden="true">${icon('check', { size: 14 })}</span><span class="option__label">${label}</span></span></label>`;
const field = ({ id, label, type = 'text', auto = '', extra = '', optional = false, cls = '' }) =>
  `<div class="field ${cls}"><label for="${id}">${label}${optional ? ' <span class="optional">(optional)</span>' : ''}</label><input id="${id}" name="${id.replace('in-', '')}" type="${type}"${auto ? ` autocomplete="${auto}"` : ''}${optional ? '' : ' required'} ${extra}></div>`;

const step = (id, n, legend, help, inner) => `<fieldset class="quiz__step" data-step="${id}"${n === 1 ? '' : ' hidden'}>
  <legend class="quiz__q" tabindex="-1">${legend}</legend>
  ${help ? `<p class="quiz__help">${help}</p>` : ''}
  <div class="step-errors" role="alert" hidden data-step-errors><p><strong>Please check:</strong></p><ul></ul></div>
  ${inner}
</fieldset>`;

export const render = (root) => {
  const steps = [
    step('plan', 1, 'Choose your medication', 'Your clinician reviews this choice and may recommend the other option.',
      `<div class="options">${treatments
        .map((t, i) => radioCard('medication', t.id, `${t.name}, $${t.price}/mo at every dose`, `${t.kind}. ${t.bestFor}.`, i === 0))
        .join('')}</div>`),
    step('about', 2, 'About you', 'Use your legal name. Your clinician and pharmacy need it to match your prescription.',
      `<div class="form__row form__row--2">${field({ id: 'in-first', label: 'First name', auto: 'given-name' })}${field({ id: 'in-last', label: 'Last name', auto: 'family-name' })}</div>
      <div class="form__row form__row--2">${field({ id: 'in-dob', label: 'Date of birth', type: 'date', auto: 'bday' })}
        <fieldset class="field"><legend class="field__legend">Sex assigned at birth</legend><div class="units units--quiz"><label><input type="radio" name="sex" value="female" required> Female</label><label><input type="radio" name="sex" value="male"> Male</label></div></fieldset></div>
      <div class="form__row form__row--2">${field({ id: 'in-email', label: 'Email', type: 'email', auto: 'email', extra: 'inputmode="email" spellcheck="false"' })}${field({ id: 'in-phone', label: 'Mobile phone', type: 'tel', auto: 'tel', extra: 'inputmode="tel"' })}</div>`),
    step('health', 3, 'Your health', 'We filled in what you told us in the eligibility check. Please confirm or update it.',
      `<div class="form__row form__row--3">${field({ id: 'in-ft', label: 'Height (ft)', type: 'number', extra: 'inputmode="numeric" min="4" max="7"' })}${field({ id: 'in-in', label: 'Inches', type: 'number', extra: 'inputmode="numeric" min="0" max="11"' })}${field({ id: 'in-lb', label: 'Weight (lb)', type: 'number', extra: 'inputmode="numeric" min="70" max="700"' })}</div>
      <fieldset class="field"><legend class="field__legend">Do any of these apply to you?</legend><div class="options">
        ${checkCard('safety', 'mtc', 'Personal or family history of medullary thyroid cancer')}
        ${checkCard('safety', 'men2', 'Multiple endocrine neoplasia type 2 (MEN 2)')}
        ${checkCard('safety', 'pregnant', 'Pregnant, breastfeeding or trying to get pregnant')}
        ${checkCard('safety', 'pancreatitis', 'History of pancreatitis')}
        ${checkCard('safety', 'type-1-diabetes', 'Type 1 diabetes')}
        ${checkCard('safety', 'none', 'None of these', { exclusive: true })}
      </div></fieldset>
      <fieldset class="field"><legend class="field__legend">Have you taken GLP-1 medication before?</legend><div class="options options--3">
        ${radioCard('glp1', 'never', 'No')}${radioCard('glp1', 'current', 'Yes, I take it now')}${radioCard('glp1', 'past', 'Yes, in the past')}
      </div></fieldset>
      <div class="field"><label for="in-meds">Current medications and supplements <span class="optional">(optional)</span></label><textarea id="in-meds" name="meds" rows="3" maxlength="1000"></textarea></div>
      <div class="field"><label for="in-allergies">Allergies <span class="optional">(optional)</span></label><textarea id="in-allergies" name="allergies" rows="2" maxlength="500"></textarea></div>`),
    step('shipping', 4, 'Where should we ship?', 'Medication arrives in plain packaging. Someone 18 or older may need to receive it.',
      `${field({ id: 'in-address1', label: 'Street address', auto: 'address-line1' })}
      ${field({ id: 'in-address2', label: 'Apartment, suite or unit', auto: 'address-line2', optional: true })}
      <div class="form__row form__row--3">${field({ id: 'in-city', label: 'City', auto: 'address-level2' })}
        <div class="field"><label for="in-state">State</label><div class="select"><select id="in-state" name="state" required autocomplete="address-level1"><option value="">Choose</option>${usStates.map(([c, n]) => `<option value="${c}">${n}</option>`).join('')}</select>${icon('chevronDown', { size: 18 })}</div></div>
        ${field({ id: 'in-zip', label: 'ZIP code', auto: 'postal-code', extra: 'inputmode="numeric" maxlength="10"' })}</div>`),
    step('consent', 5, 'Consents', 'Please read and agree to each document. They open in a new tab, so you won’t lose your answers.',
      `<div class="consents">
        <div class="field field--check"><input id="in-c-tele" name="consentTelehealth" type="checkbox" required><label for="in-c-tele">I agree to the <a href="${root}telehealth-consent/" target="_blank">telehealth consent<span class="visually-hidden"> (opens in a new tab)</span></a>.</label></div>
        <div class="field field--check"><input id="in-c-terms" name="consentTerms" type="checkbox" required><label for="in-c-terms">I agree to the <a href="${root}terms/" target="_blank">terms and conditions<span class="visually-hidden"> (opens in a new tab)</span></a> and the <a href="${root}privacy-policy/" target="_blank">privacy policy<span class="visually-hidden"> (opens in a new tab)</span></a>.</label></div>
        <div class="field field--check"><input id="in-c-pay" name="consentPayment" type="checkbox" required><label for="in-c-pay">I understand payment is collected before my clinician review, and I get a full refund if treatment isn’t approved (<a href="${root}refund-policy/" target="_blank">refund policy<span class="visually-hidden"> (opens in a new tab)</span></a>).</label></div>
        <div class="field field--check"><input id="in-c-sms" name="consentSms" type="checkbox"><label for="in-c-sms">Text me order and care updates. Optional; reply STOP to opt out.</label></div>
      </div>`),
    step('review', 6, 'Review and submit', 'Check your answers. You can change anything before you submit.',
      `<dl class="review-list" data-review></dl>
      <div class="due"><span>Due at checkout</span><b data-due>$${treatments[0].price}</b><small>first month. Same price at every dose after that.</small></div>`),
  ];

  const plans = JSON.stringify(Object.fromEntries(treatments.map((t) => [t.id, { name: t.name, price: t.price, kind: t.kind }])));
  const body = `
<section class="flow-page" data-intake data-endpoint="${site.integrations.intakeEndpoint ?? ''}" data-checkout="${site.integrations.checkoutUrl ?? ''}">
  ${aurora('aurora--soft')}
  <div class="wrap flow-page__grid">
    <aside class="flow-summary glass" aria-label="Your plan">
      <h1 class="flow-summary__title">Start your intake</h1>
      <p class="flow-summary__med"><span data-sum-med>${treatments[0].name}</span></p>
      <p class="flow-summary__price"><b data-sum-price>$${treatments[0].price}</b>/mo at every dose</p>
      ${checkList(['Licensed clinician review', '1:1 care coach', 'Free, discreet shipping', 'Cancel anytime'])}
      <p class="promo-pill">${icon('tag', { size: 18 })}<span><strong>${site.promo.name}:</strong> ${site.promo.discount}.</span></p>
      <div class="flow-next"><p class="flow-next__title">What happens next</p><ol>
        <li>A licensed clinician reviews your intake. Same-day slots are available.</li>
        <li>If treatment is approved, a licensed pharmacy ships your medication.</li>
        <li>If it isn’t approved, your payment is refunded in full.</li>
      </ol></div>
      ${preview ? `<p class="preview-note">${icon('info', { size: 18 })}<span><strong>Preview mode.</strong> This intake isn’t connected to Livbetr’s systems yet, so nothing you enter is sent. Your answers stay in this browser tab.</span></p>` : ''}
    </aside>
    <div class="quiz card flow" data-flow>
      <div class="quiz__top">
        <p class="quiz__count" data-step-count>Step 1 of ${steps.length}</p>
        <div class="progress" role="progressbar" aria-label="Intake progress" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="1" data-progress><span style="width:${100 / steps.length}%"></span></div>
      </div>
      <form class="quiz__form" novalidate data-intake-form>
        ${steps.join('\n')}
        <div class="quiz__nav">
          <button class="btn btn--line" type="button" data-back hidden>${icon('arrowLeft', { size: 18 })} Back</button>
          <button class="btn btn--gold btn--lg" type="submit" data-next>Continue</button>
        </div>
      </form>
      <div class="intake-done" data-intake-done hidden tabindex="-1"></div>
    </div>
  </div>
  <script type="application/json" data-intake-plans>${plans}</script>
</section>`;
  return { body, bodyClass: 'page-flow' };
};
