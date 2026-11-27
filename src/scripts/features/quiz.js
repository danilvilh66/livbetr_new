import { $, $$, session } from '../lib/dom.js';

const QUIZ_KEY = 'livbetr-eligibility';
const HARD_STOP = ['mtc', 'men2', 'pregnant'];
const NEEDS_REVIEW = ['pancreatitis', 'type-1-diabetes'];

export const bmiFrom = ({ units, ft, inch, lb, cm, kg }) => {
  if (units === 'metric') {
    if (!(cm > 0 && kg > 0)) return null;
    return kg / (cm / 100) ** 2;
  }
  const totalIn = Number(ft) * 12 + Number(inch || 0);
  if (!(totalIn > 0 && lb > 0)) return null;
  return (703 * lb) / totalIn ** 2;
};

export const assess = (answers) => {
  const safety = answers.safety ?? [];
  const conditions = (answers.conditions ?? []).filter((c) => c !== 'none');
  if (answers.age < 18) return { outcome: 'minor' };
  if (safety.some((s) => HARD_STOP.includes(s))) return { outcome: 'stop', flags: safety.filter((s) => HARD_STOP.includes(s)) };
  const bmi = answers.bmi;
  const meetsBmi = bmi >= 30 || (bmi >= 27 && conditions.length > 0);
  if (!meetsBmi) return { outcome: 'low-bmi', bmi };
  const review = safety.filter((s) => NEEDS_REVIEW.includes(s));
  const suggested = answers.goal === 'up-to-20' ? 'semaglutide' : 'tirzepatide';
  return { outcome: review.length ? 'review' : 'likely', bmi, suggested, review };
};

export const initQuiz = () => {
  const quiz = $('[data-quiz]');
  if (!quiz) return;
  const form = $('[data-quiz-form]', quiz);
  const steps = $$('[data-step]', form);
  const back = $('[data-quiz-back]', form);
  const next = $('[data-quiz-next]', form);
  const count = $('[data-step-count]', quiz);
  const progress = $('[data-progress]', quiz);
  const result = $('[data-quiz-result]', quiz);
  const plans = JSON.parse($('[data-plans]').textContent);
  const root = document.body.dataset.root || './';
  let current = 0;

  const field = (name) => form.elements.namedItem(name);
  const unitsValue = () => form.querySelector('input[name="units"]:checked').value;
  const num = (name) => {
    const v = field(name)?.value;
    return v === '' || v === undefined ? NaN : Number(v);
  };
  const checked = (name) => $$(`input[name="${name}"]:checked`, form).map((i) => i.value);

  const answers = () => ({
    goal: form.querySelector('input[name="goal"]:checked')?.value,
    state: field('state').value,
    age: num('age'),
    units: unitsValue(),
    ft: num('ft'), inch: num('in'), lb: num('lb'), cm: num('cm'), kg: num('kg'),
    conditions: checked('conditions'),
    safety: checked('safety'),
  });

  const save = () => session.set(QUIZ_KEY, { step: current, answers: answers() });

  const showError = (step, msg, focusEl) => {
    const err = $('.field__error', step);
    err.textContent = msg;
    err.hidden = !msg;
    const inputs = $$('input, select', step).filter((i) => i.type !== 'radio' || i.name !== 'units');
    inputs.forEach((i) => {
      if (msg && (!focusEl || i === focusEl)) i.setAttribute('aria-invalid', 'true');
      else i.removeAttribute('aria-invalid');
    });
    if (msg) {
      inputs.forEach((i) => i.setAttribute('aria-describedby', err.id));
      (focusEl || inputs[0])?.focus();
    }
  };

  const validators = {
    goal: () => (answers().goal ? '' : 'Choose one option to continue.'),
    state: () => (field('state').value ? '' : 'Choose the state you live in.'),
    age: () => {
      const a = num('age');
      if (Number.isNaN(a)) return 'Enter your age in years.';
      if (a < 1 || a > 120 || !Number.isInteger(a)) return 'Enter a whole number between 1 and 120.';
      return '';
    },
    body: () => {
      const a = answers();
      if (a.units === 'metric') {
        if (!(a.cm >= 120 && a.cm <= 230)) return ['Enter your height in centimeters, between 120 and 230.', field('cm')];
        if (!(a.kg >= 32 && a.kg <= 320)) return ['Enter your weight in kilograms, between 32 and 320.', field('kg')];
        return '';
      }
      if (!(a.ft >= 4 && a.ft <= 7)) return ['Enter your height in feet, between 4 and 7.', field('ft')];
      if (!Number.isNaN(a.inch) && !(a.inch >= 0 && a.inch <= 11)) return ['Inches should be between 0 and 11.', field('in')];
      if (!(a.lb >= 70 && a.lb <= 700)) return ['Enter your weight in pounds, between 70 and 700.', field('lb')];
      return '';
    },
    conditions: () => (checked('conditions').length ? '' : 'Select at least one option, or “None of these”.'),
    safety: () => (checked('safety').length ? '' : 'Select at least one option, or “None of these”.'),
  };

  const updateBmi = () => {
    const a = answers();
    const bmi = bmiFrom({ ...a, inch: Number.isNaN(a.inch) ? 0 : a.inch });
    const box = $('[data-bmi]', form);
    const valid = bmi && bmi > 10 && bmi < 90 && !validators.body();
    box.hidden = !valid;
    if (!valid) return null;
    $('[data-bmi-value]', box).textContent = bmi.toFixed(1);
    // Scale spans BMI 15 to 45.
    const pct = Math.min(100, Math.max(0, ((bmi - 15) / 30) * 100));
    $('[data-bmi-marker]', box).style.left = `${pct}%`;
    return bmi;
  };

  const show = (index, { focus = true, push = true, animate = true } = {}) => {
    current = index;
    steps.forEach((s, i) => {
      s.hidden = i !== index;
      s.classList.toggle('is-entering', animate && i === index);
    });
    result.hidden = true;
    form.hidden = false;
    back.hidden = index === 0;
    next.textContent = index === steps.length - 1 ? 'See my results' : 'Continue';
    count.textContent = `Question ${index + 1} of ${steps.length}`;
    progress.setAttribute('aria-valuenow', String(index + 1));
    $('span', progress).style.width = `${((index + 1) / steps.length) * 100}%`;
    if (focus) $('legend', steps[index]).focus();
    if (push) history.pushState({ quizStep: index }, '', `#q${index + 1}`);
    save();
  };

  const planCard = (id, suggested) => {
    const p = plans[id];
    return `<div class="result-plan result-plan--${id}${suggested ? ' is-suggested' : ''}">
      ${suggested ? '<span class="result-plan__flag">Suggested starting point</span>' : ''}
      <h3>${p.name}</h3>
      <p>${p.kind}. ${p.pitch}</p>
      <p class="price">$${p.price}<small> a month, every dose</small></p>
      <a class="btn ${suggested ? 'btn--primary' : 'btn--ghost'} btn--block" href="${p.href}" data-cta="quiz-${id}">Continue with ${p.name.toLowerCase()}</a>
    </div>`;
  };

  const restart = `<button class="btn btn--ghost" type="button" data-quiz-restart>Start over</button>`;

  const renderResult = (r, a) => {
    const bmiStat = r.bmi ? `<div class="result__stat"><span>Your BMI</span><strong>${r.bmi.toFixed(1)}</strong></div>` : '';
    const views = {
      likely: () => `
        <p class="result__badge">You may be a good fit</p>
        <h2 class="result__title" tabindex="-1">GLP-1 medication could be right for you</h2>
        <div class="result__stats">${bmiStat}<div class="result__stat"><span>State</span><strong>${field('state').selectedOptions[0].text}</strong></div></div>
        <p>Based on your answers, you meet the general guidelines clinicians use. Choose a medication to continue to your secure intake. Your clinician makes the final decision and may recommend the other option.</p>
        <div class="result__plans">${planCard('semaglutide', r.suggested === 'semaglutide')}${planCard('tirzepatide', r.suggested === 'tirzepatide')}</div>
        <p class="result__note">The full intake takes about 15 minutes. If a clinician doesn’t approve treatment, your payment is refunded in full.</p>
        <div class="result__actions">${restart}</div>`,
      review: () => `
        <p class="result__badge result__badge--warn">A clinician will take a closer look</p>
        <h2 class="result__title" tabindex="-1">You may qualify, with a careful review</h2>
        <div class="result__stats">${bmiStat}</div>
        <p>You meet the general BMI guidelines, but you mentioned ${r.review.map((x) => (x === 'pancreatitis' ? 'a history of pancreatitis' : 'type 1 diabetes')).join(' and ')}. GLP-1 medication can still be possible, but your clinician needs to review your history in detail before prescribing.</p>
        <div class="result__plans">${planCard('semaglutide', r.suggested === 'semaglutide')}${planCard('tirzepatide', r.suggested === 'tirzepatide')}</div>
        <p class="result__note">Have your medical history and current medications ready for the intake. If treatment isn’t approved, your payment is refunded in full.</p>
        <div class="result__actions">${restart}</div>`,
      'low-bmi': () => `
        <p class="result__badge result__badge--warn">Outside the usual guidelines</p>
        <h2 class="result__title" tabindex="-1">You may not meet the BMI guidelines</h2>
        <div class="result__stats">${bmiStat}</div>
        <p>Clinicians usually prescribe GLP-1 medication when BMI is 30 or higher, or 27 or higher with a weight-related condition. Your answers put you outside that range, so treatment is less likely to be approved.</p>
        <p>If you think your situation is different, our team can talk it through with you before you pay anything.</p>
        <div class="result__actions"><a class="btn btn--primary" href="${root}contact/">Talk to our team</a><a class="link-strong" href="${root}faq/#do-i-qualify">How eligibility works</a>${restart}</div>`,
      stop: () => `
        <p class="result__badge result__badge--stop">Not recommended right now</p>
        <h2 class="result__title" tabindex="-1">GLP-1 medication may not be safe for you</h2>
        <p>You mentioned ${r.flags.map((f) => ({ mtc: 'a personal or family history of medullary thyroid cancer', men2: 'MEN 2', pregnant: 'pregnancy, breastfeeding or trying to get pregnant' })[f]).join(', ')}. GLP-1 medications are generally not prescribed in ${r.flags.length > 1 ? 'these situations' : 'this situation'}, so we can’t offer treatment online.</p>
        <p>Please talk to your own doctor about weight-loss options that are safe for you.</p>
        <div class="result__actions"><a class="btn btn--primary" href="${root}contact/">Contact our team</a>${restart}</div>`,
      minor: () => `
        <p class="result__badge result__badge--stop">Adults only</p>
        <h2 class="result__title" tabindex="-1">Livbetr is for adults 18 and older</h2>
        <p>We can’t offer GLP-1 treatment to anyone under 18. A pediatrician or family doctor can help with safe options.</p>
        <div class="result__actions"><a class="btn btn--primary" href="${root}">Back to the home page</a>${restart}</div>`,
    };
    result.innerHTML = views[r.outcome]();
    form.hidden = true;
    result.hidden = false;
    count.textContent = 'Your results';
    progress.setAttribute('aria-valuenow', String(steps.length));
    $('span', progress).style.width = '100%';
    $('.result__title', result).focus();
    $('[data-quiz-restart]', result).addEventListener('click', () => {
      session.remove(QUIZ_KEY);
      form.reset();
      $('[data-units="us"]', form).hidden = false;
      $('[data-units="metric"]', form).hidden = true;
      $('[data-bmi]', form).hidden = true;
      show(0);
    });
    history.pushState({ quizStep: 'result' }, '', '#results');
    session.set(QUIZ_KEY, { step: 'result', answers: a });
  };

  const finish = () => {
    const a = answers();
    const bmi = bmiFrom({ ...a, inch: Number.isNaN(a.inch) ? 0 : a.inch });
    renderResult(assess({ ...a, bmi }), a);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const step = steps[current];
    const v = validators[step.dataset.step]();
    const [msg, el] = Array.isArray(v) ? v : [v, null];
    if (msg) {
      showError(step, msg, el);
      return;
    }
    showError(step, '');
    // Under 18: no need to ask health questions.
    if (step.dataset.step === 'age' && num('age') < 18) {
      renderResult({ outcome: 'minor' }, answers());
      return;
    }
    if (current < steps.length - 1) show(current + 1);
    else finish();
  });

  back.addEventListener('click', () => history.back());
  window.addEventListener('popstate', (e) => {
    const s = e.state?.quizStep;
    if (typeof s === 'number') show(s, { push: false });
    else if (s === 'result') finish();
    else show(0, { push: false });
  });

  // Auto-advance single-choice question for speed; keyboard users still confirm with Enter.
  $$('input[name="goal"]', form).forEach((r) =>
    r.addEventListener('click', (e) => {
      if (e.detail > 0) setTimeout(() => form.requestSubmit(), 180);
    }),
  );
  // "None of these" is exclusive with the other options.
  $$('[data-exclusive]', form).forEach((none) => {
    const group = $$(`input[name="${none.name}"]`, form).filter((i) => i !== none);
    none.addEventListener('change', () => {
      if (none.checked) group.forEach((i) => (i.checked = false));
    });
    group.forEach((i) => i.addEventListener('change', () => {
      if (i.checked) none.checked = false;
    }));
  });
  $$('input[name="units"]', form).forEach((r) =>
    r.addEventListener('change', () => {
      const metric = unitsValue() === 'metric';
      $('[data-units="us"]', form).hidden = metric;
      $('[data-units="metric"]', form).hidden = !metric;
      updateBmi();
    }),
  );
  form.addEventListener('input', () => {
    if (steps[current].dataset.step === 'body') updateBmi();
    const err = $('.field__error', steps[current]);
    if (!err.hidden && !validators[steps[current].dataset.step]()) showError(steps[current], '');
    save();
  });

  // Restore progress from this browser session.
  const saved = session.get(QUIZ_KEY);
  if (saved?.answers) {
    const a = saved.answers;
    if (a.goal) { const g = form.querySelector(`input[name="goal"][value="${a.goal}"]`); if (g) g.checked = true; }
    field('state').value = a.state || '';
    if (!Number.isNaN(a.age) && a.age !== null) field('age').value = a.age;
    const u = form.querySelector(`input[name="units"][value="${a.units || 'us'}"]`);
    if (u) {
      u.checked = true;
      $('[data-units="us"]', form).hidden = a.units === 'metric';
      $('[data-units="metric"]', form).hidden = a.units !== 'metric';
    }
    [['ft', a.ft], ['in', a.inch], ['lb', a.lb], ['cm', a.cm], ['kg', a.kg]].forEach(([n, v]) => {
      if (v !== null && !Number.isNaN(v)) field(n).value = v;
    });
    ['conditions', 'safety'].forEach((n) =>
      (a[n] || []).forEach((v) => {
        const box = form.querySelector(`input[name="${n}"][value="${v}"]`);
        if (box) box.checked = true;
      }),
    );
    updateBmi();
  }
  if (saved?.step === 'result') {
    history.replaceState({ quizStep: 'result' }, '', '#results');
    finish();
    return;
  }
  const startAt = typeof saved?.step === 'number' ? saved.step : 0;
  history.replaceState({ quizStep: startAt }, '', startAt ? `#q${startAt + 1}` : window.location.pathname);
  show(startAt, { focus: false, push: false, animate: false });
};

