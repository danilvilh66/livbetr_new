import { $, $$, session } from '../lib/dom.js';

const KEY = 'livbetr-intake';
const ELIGIBILITY_KEY = 'livbetr-eligibility';
const HARD_STOP = { mtc: 'a history of medullary thyroid cancer', men2: 'MEN 2', pregnant: 'pregnancy, breastfeeding or trying to get pregnant' };
const LABELS = {
  safety: { mtc: 'Medullary thyroid cancer history', men2: 'MEN 2', pregnant: 'Pregnant or trying', pancreatitis: 'History of pancreatitis', 'type-1-diabetes': 'Type 1 diabetes', none: 'None of these' },
  glp1: { never: 'No', current: 'Yes, currently', past: 'Yes, in the past' },
  sex: { female: 'Female', male: 'Male' },
};

const ageFrom = (iso) => {
  const dob = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(dob.getTime())) return NaN;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) age -= 1;
  return age;
};
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// The intake: six steps, validated one at a time, saved in this tab only, prefilled
// from the eligibility check. Submits to `data-endpoint` when one is configured;
// otherwise it finishes in preview mode and says that nothing was sent.
export const initIntake = () => {
  const root = $('[data-intake]');
  if (!root) return;
  const form = $('[data-intake-form]', root);
  const steps = $$('[data-step]', form);
  const back = $('[data-back]', form);
  const next = $('[data-next]', form);
  const count = $('[data-step-count]', root);
  const progress = $('[data-progress]', root);
  const done = $('[data-intake-done]', root);
  const plans = JSON.parse($('[data-intake-plans]', root).textContent);
  const siteRoot = document.body.dataset.root || './';
  let current = 0;

  const els = () => form.elements;
  const value = (name) => {
    const el = els().namedItem(name);
    if (!el) return '';
    if (el instanceof RadioNodeList) return el.value;
    return el.type === 'checkbox' ? el.checked : el.value.trim();
  };
  const checked = (name) => $$(`input[name="${name}"]:checked`, form).map((i) => i.value);
  const collect = () => {
    const data = {};
    for (const el of els()) {
      if (!el.name || el.type === 'submit' || el.type === 'button') continue;
      if (el.type === 'checkbox' && $$(`input[name="${el.name}"]`, form).length > 1) data[el.name] = checked(el.name);
      else if (el.type === 'checkbox') data[el.name] = el.checked;
      else if (el.type === 'radio') {
        if (el.checked) data[el.name] = el.value;
      } else data[el.name] = el.value;
    }
    return data;
  };
  const restore = (data) => {
    Object.entries(data || {}).forEach(([name, v]) => {
      const nodes = $$(`[name="${name}"]`, form);
      nodes.forEach((el) => {
        if (el.type === 'radio') el.checked = el.value === v;
        else if (el.type === 'checkbox') el.checked = Array.isArray(v) ? v.includes(el.value) : Boolean(v);
        else if (v !== undefined && v !== null) el.value = v;
      });
    });
  };
  const save = () => session.set(KEY, { step: current, data: collect() });

  const updateSummary = () => {
    const plan = plans[value('medication')] || plans.semaglutide;
    $('[data-sum-med]', root).textContent = plan.name;
    $('[data-sum-price]', root).textContent = `$${plan.price}`;
    const due = $('[data-due]', root);
    if (due) due.textContent = `$${plan.price}`;
  };

  // ---------- Validation ----------
  const rules = {
    plan: () => (value('medication') ? [] : [['medication', 'Choose a medication.']]),
    about: () => {
      const e = [];
      if (value('first').length < 1) e.push(['in-first', 'Enter your first name.']);
      if (value('last').length < 1) e.push(['in-last', 'Enter your last name.']);
      const age = ageFrom(value('dob'));
      if (!value('dob') || Number.isNaN(age)) e.push(['in-dob', 'Enter your date of birth.']);
      else if (age < 18) e.push(['in-dob', 'Livbetr is for adults 18 and older.']);
      else if (age > 120) e.push(['in-dob', 'Check the year of your date of birth.']);
      if (!value('sex')) e.push(['sex', 'Choose your sex assigned at birth.']);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value('email'))) e.push(['in-email', 'Enter an email address like name@example.com.']);
      if (value('phone').replace(/\D/g, '').length < 10) e.push(['in-phone', 'Enter a 10-digit mobile number.']);
      return e;
    },
    health: () => {
      const e = [];
      const ft = Number(value('ft'));
      const inch = value('in') === '' ? 0 : Number(value('in'));
      const lb = Number(value('lb'));
      if (!(ft >= 4 && ft <= 7)) e.push(['in-ft', 'Enter your height in feet, between 4 and 7.']);
      if (!(inch >= 0 && inch <= 11)) e.push(['in-in', 'Inches should be between 0 and 11.']);
      if (!(lb >= 70 && lb <= 700)) e.push(['in-lb', 'Enter your weight in pounds, between 70 and 700.']);
      const safety = checked('safety');
      if (!safety.length) e.push(['safety', 'Select at least one option, or “None of these”.']);
      const stops = safety.filter((s) => HARD_STOP[s]);
      if (stops.length) e.push(['safety', `GLP-1 medication is generally not prescribed with ${stops.map((s) => HARD_STOP[s]).join(' or ')}. Please talk to your own doctor, or contact our team.`]);
      if (!value('glp1')) e.push(['glp1', 'Tell us whether you have taken GLP-1 medication before.']);
      return e;
    },
    shipping: () => {
      const e = [];
      if (value('address1').length < 3) e.push(['in-address1', 'Enter your street address.']);
      if (value('city').length < 2) e.push(['in-city', 'Enter your city.']);
      if (!value('state')) e.push(['in-state', 'Choose your state.']);
      if (!/^\d{5}(-\d{4})?$/.test(value('zip'))) e.push(['in-zip', 'Enter a 5-digit ZIP code.']);
      return e;
    },
    consent: () => {
      const e = [];
      if (!value('consentTelehealth')) e.push(['in-c-tele', 'Agree to the telehealth consent to continue.']);
      if (!value('consentTerms')) e.push(['in-c-terms', 'Agree to the terms and privacy policy to continue.']);
      if (!value('consentPayment')) e.push(['in-c-pay', 'Confirm you understand how payment and refunds work.']);
      return e;
    },
    review: () => [],
  };

  const targetFor = (key) => document.getElementById(key) || $(`[name="${key}"]`, form);
  const showErrors = (stepEl, errors) => {
    const box = $('[data-step-errors]', stepEl);
    $$('[aria-invalid]', stepEl).forEach((el) => el.removeAttribute('aria-invalid'));
    if (!errors.length) {
      box.hidden = true;
      return;
    }
    $('ul', box).innerHTML = errors.map(([key, msg]) => `<li><a href="#${esc(targetFor(key)?.id || '')}" data-key="${esc(key)}">${esc(msg)}</a></li>`).join('');
    box.hidden = false;
    errors.forEach(([key]) => $$(`#${key}, [name="${key}"]`, stepEl).forEach((el) => el.setAttribute('aria-invalid', 'true')));
    targetFor(errors[0][0])?.focus();
  };
  form.addEventListener('click', (e) => {
    const link = e.target.closest('[data-step-errors] a');
    if (!link) return;
    e.preventDefault();
    targetFor(link.dataset.key)?.focus();
  });

  // ---------- Review ----------
  const renderReview = () => {
    const d = collect();
    const plan = plans[d.medication] || plans.semaglutide;
    const stateName = $(`#in-state option[value="${d.state}"]`, form)?.textContent ?? '';
    const rows = [
      ['plan', 'Medication', `${plan.name}, $${plan.price}/mo at every dose`],
      ['about', 'Name', `${d.first} ${d.last}`],
      ['about', 'Date of birth', new Date(`${d.dob}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
      ['about', 'Contact', `${d.email}, ${d.phone}`],
      ['health', 'Height and weight', `${d.ft} ft ${d.in || 0} in, ${d.lb} lb`],
      ['health', 'Applies to you', (d.safety || []).map((s) => LABELS.safety[s]).join(', ')],
      ['health', 'GLP-1 before', LABELS.glp1[d.glp1] ?? ''],
      ['shipping', 'Ship to', `${d.address1}${d.address2 ? `, ${d.address2}` : ''}, ${d.city}, ${stateName} ${d.zip}`],
      ['consent', 'Text updates', d.consentSms ? 'Yes' : 'No'],
    ];
    $('[data-review]', form).innerHTML = rows
      .map(([stepId, label, val]) => `<div><dt>${esc(label)}</dt><dd>${esc(val)}</dd><button type="button" class="link-quiet" data-edit="${stepId}">Edit<span class="visually-hidden"> ${esc(label.toLowerCase())}</span></button></div>`)
      .join('');
  };
  form.addEventListener('click', (e) => {
    const edit = e.target.closest('[data-edit]');
    if (edit) show(steps.findIndex((s) => s.dataset.step === edit.dataset.edit));
  });

  // ---------- Navigation ----------
  const show = (index, { focus = true, push = true } = {}) => {
    current = index;
    steps.forEach((s, i) => {
      s.hidden = i !== index;
      s.classList.toggle('is-entering', focus && i === index);
    });
    back.hidden = index === 0;
    next.textContent = index === steps.length - 1 ? 'Submit intake' : 'Continue';
    count.textContent = `Step ${index + 1} of ${steps.length}`;
    progress.setAttribute('aria-valuenow', String(index + 1));
    $('span', progress).style.width = `${((index + 1) / steps.length) * 100}%`;
    if (steps[index].dataset.step === 'review') renderReview();
    if (focus) $('legend', steps[index]).focus();
    if (push) history.pushState({ intakeStep: index }, '', `#step-${index + 1}`);
    save();
  };

  const finish = async () => {
    const data = collect();
    const endpoint = root.dataset.endpoint;
    const checkout = root.dataset.checkout;
    const reference = `LB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    next.disabled = true;
    next.textContent = 'Submitting…';
    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, ...data }) });
        if (!res.ok) throw new Error(`Intake endpoint answered ${res.status}`);
        if (checkout) {
          session.remove(KEY);
          window.location.assign(`${checkout}${checkout.includes('?') ? '&' : '?'}ref=${encodeURIComponent(reference)}`);
          return;
        }
      }
    } catch (err) {
      next.disabled = false;
      next.textContent = 'Submit intake';
      showErrors(steps[current], [['review', 'We couldn’t send your intake. Check your connection and try again, or call us.']]);
      console.error(err);
      return;
    }
    session.remove(KEY);
    session.remove(ELIGIBILITY_KEY);
    const plan = plans[data.medication] || plans.semaglutide;
    done.innerHTML = `
      <p class="result__badge">${endpoint ? 'Intake received' : 'Intake complete'}</p>
      <h2 class="result__title" tabindex="-1">Thanks, ${esc(data.first)}. Your intake is complete.</h2>
      ${endpoint ? '' : '<p class="preview-note"><strong>Preview mode.</strong> This site isn’t connected to Livbetr’s systems yet, so nothing was sent and no payment was taken. Your answers have been cleared from this browser.</p>'}
      <div class="result__stats"><div class="result__stat"><span>Reference</span><strong>${reference}</strong></div><div class="result__stat"><span>Plan</span><strong>${esc(plan.name)}, $${plan.price}/mo</strong></div></div>
      <ol class="done-steps">
        <li><strong>Payment.</strong> You pay for your first month at checkout. If a clinician doesn’t approve treatment, it’s refunded in full.</li>
        <li><strong>Clinician review.</strong> A licensed clinician reviews your answers and may message you with questions.</li>
        <li><strong>Delivery.</strong> If approved, your medication ships free in plain packaging.</li>
      </ol>
      <div class="result__actions"><a class="btn btn--gold" href="${siteRoot}login/">Go to the patient portal</a><a class="btn btn--line" href="${siteRoot}">Back to the home page</a></div>`;
    form.hidden = true;
    done.hidden = false;
    count.textContent = 'Done';
    $('span', progress).style.width = '100%';
    history.replaceState({ intakeStep: 'done' }, '', '#done');
    $('.result__title', done).focus();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const stepEl = steps[current];
    const errors = rules[stepEl.dataset.step]();
    showErrors(stepEl, errors);
    if (errors.length) return;
    if (current < steps.length - 1) show(current + 1);
    else finish();
  });
  back.addEventListener('click', () => history.back());
  window.addEventListener('popstate', (e) => {
    const s = e.state?.intakeStep;
    if (typeof s === 'number' && !form.hidden) show(s, { push: false });
  });

  // "None of these" excludes the other options.
  $$('[data-exclusive]', form).forEach((none) => {
    const others = $$(`input[name="${none.name}"]`, form).filter((i) => i !== none);
    none.addEventListener('change', () => none.checked && others.forEach((i) => (i.checked = false)));
    others.forEach((i) => i.addEventListener('change', () => i.checked && (none.checked = false)));
  });
  form.addEventListener('input', () => {
    updateSummary();
    save();
  });
  form.addEventListener('change', updateSummary);

  // ---------- Prefill ----------
  const saved = session.get(KEY);
  if (saved?.data) restore(saved.data);
  else {
    const elig = session.get(ELIGIBILITY_KEY)?.answers;
    if (elig) {
      let { ft, inch, lb } = elig;
      if (elig.units === 'metric' && elig.cm && elig.kg) {
        const totalIn = Math.round(elig.cm / 2.54);
        ft = Math.floor(totalIn / 12);
        inch = totalIn % 12;
        lb = Math.round(elig.kg * 2.20462);
      }
      restore({ ft, in: inch, lb, state: elig.state, safety: elig.safety });
      if (elig.goal) {
        const suggested = elig.goal === 'up-to-20' ? 'semaglutide' : 'tirzepatide';
        restore({ medication: suggested });
      }
    }
  }
  const requested = new URLSearchParams(window.location.search).get('treatment');
  if (requested && plans[requested] && !saved?.data?.medication) restore({ medication: requested });
  updateSummary();
  const startAt = typeof saved?.step === 'number' ? saved.step : 0;
  history.replaceState({ intakeStep: startAt }, '', `${window.location.pathname}${window.location.search}${startAt ? `#step-${startAt + 1}` : ''}`);
  show(startAt, { focus: false, push: false });
};
