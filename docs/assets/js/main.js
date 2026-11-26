// Livbetr site behaviour. No dependencies; every feature is progressive enhancement
// over working HTML, and each initialiser exits early when its markup is absent.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const storage = (area) => ({
  get(key) {
    try { return JSON.parse(area.getItem(key)); } catch { return null; }
  },
  set(key, value) {
    try { area.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: feature still works for this visit */ }
  },
  remove(key) {
    try { area.removeItem(key); } catch { /* ignore */ }
  },
});
const local = storage(window.localStorage);
const session = storage(window.sessionStorage);

const setRangeFill = (input) => {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const pct = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--pct', `${pct}%`);
};

const initRanges = () => {
  $$('.range').forEach((input) => {
    setRangeFill(input);
    input.addEventListener('input', () => setRangeFill(input));
  });
};

// ---------- Promo bar ----------
const initPromo = () => {
  const bar = $('[data-promo]');
  if (!bar) return;
  const key = `promo-dismissed:${bar.dataset.promo}`;
  $('[data-promo-close]', bar)?.addEventListener('click', () => {
    local.set(key, true);
    bar.hidden = true;
    document.documentElement.classList.add('promo-off');
    $('#main')?.focus({ preventScroll: true });
  });
};

// ---------- Header & mobile menu ----------
const initHeader = () => {
  const header = $('[data-header]');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('[data-menu-toggle]', header);
  // The menu sits outside the header: the header's backdrop-filter would trap a fixed child.
  const menu = $('[data-menu]');
  if (!toggle || !menu) return;
  const label = $('.visually-hidden', toggle);

  const focusables = () => $$('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close menu' : 'Open menu';
    toggle.innerHTML = toggle.innerHTML.replace(/<svg[\s\S]*<\/svg>/, open ? iconX : iconMenu);
    if (open) menu.style.top = `${Math.max(0, header.getBoundingClientRect().bottom)}px`;
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    if (open) focusables()[0]?.focus();
  };
  const iconMenu = toggle.querySelector('svg').outerHTML;
  const iconX = '<svg class="icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [toggle, ...focusables()];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) setOpen(false);
  });
};

// ---------- Dose ladder ----------
const initLadder = () => {
  const section = $('[data-ladder]');
  if (!section) return;
  const data = JSON.parse($('[data-ladder-data]', section).textContent);
  const tabs = $$('[role="tab"]', section);
  const panel = $('#ladder-panel', section);
  const range = $('[data-month-range]', section);
  const out = {
    month: $('[data-out="month"]', section),
    dose: $('[data-out="dose"]', section),
    price: $('[data-out="price"]', section),
  };
  let treatment = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.treatment ?? 'semaglutide';

  const fmtMg = (mg) => `${mg} mg`;
  const render = () => {
    const t = data[treatment];
    const month = Number(range.value);
    const step = t.doses[month - 1];
    out.month.textContent = String(month);
    out.dose.textContent = fmtMg(step.mg);
    out.price.innerHTML = `$${t.price}<small>/mo</small>`;
    range.setAttribute('aria-valuetext', `Month ${month}: ${fmtMg(step.mg)} weekly, $${t.price} a month`);
    setRangeFill(range);
    $$('.ladder__set', section).forEach((set) => {
      // SVG elements have no .hidden property, so toggle the attribute itself.
      set.toggleAttribute('hidden', set.dataset.set !== treatment);
      $$('.ladder__col', set).forEach((col) => {
        const m = Number(col.dataset.month);
        col.classList.toggle('is-active', m === month);
        col.classList.toggle('is-past', m < month);
      });
    });
  };

  const select = (tab, focus = false) => {
    treatment = tab.dataset.treatment;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.dataset.treatment = treatment;
    panel.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
    render();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 };
      if (e.key in keys) {
        e.preventDefault();
        select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        select(tabs[e.key === 'Home' ? 0 : tabs.length - 1], true);
      }
    });
  });
  range.addEventListener('input', render);
  $$('.ladder__col', section).forEach((col) => {
    col.addEventListener('click', () => {
      range.value = col.dataset.month;
      render();
    });
  });
  render();

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    section.classList.add('is-drawn');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        section.classList.add('is-drawn');
        io.disconnect();
      }
    },
    { threshold: 0.35 },
  );
  io.observe(panel);
};

// ---------- 15% estimate ----------
const LB_PER_KG = 2.20462;
const initEstimate = () => {
  const root = $('[data-estimate]');
  if (!root) return;
  const range = $('[data-weight-range]', root);
  const number = $('[data-weight-number]', root);
  const lossOut = $('[data-out="loss"]', root);
  const goalOut = $('[data-out="goal"]', root);
  const rangeText = $('[data-range-text]', root);
  const units = $$('[data-unit]', root);
  const limits = { lb: [140, 400], kg: [64, 181] };
  let unit = 'lb';

  const clamp = (v, [min, max]) => Math.min(max, Math.max(min, v));
  const update = (value, source) => {
    const v = clamp(Math.round(value), limits[unit]);
    if (source !== range) range.value = String(v);
    if (source !== number) number.value = String(v);
    setRangeFill(range);
    const loss = Math.round(v * 0.15);
    lossOut.textContent = String(loss);
    goalOut.textContent = String(v - loss);
  };

  range.addEventListener('input', () => update(Number(range.value), range));
  number.addEventListener('input', () => {
    const v = Number(number.value);
    const [min, max] = limits[unit];
    number.setAttribute('aria-invalid', String(!(v >= min && v <= max)));
    if (v >= min && v <= max) update(v, number);
  });
  number.addEventListener('change', () => {
    number.removeAttribute('aria-invalid');
    update(Number(number.value) || limits[unit][0], null);
  });
  units.forEach((radio) =>
    radio.addEventListener('change', () => {
      const current = Number(range.value);
      const next = radio.value;
      if (next === unit) return;
      const converted = next === 'kg' ? current / LB_PER_KG : current * LB_PER_KG;
      unit = next;
      const [min, max] = limits[unit];
      [range, number].forEach((el) => {
        el.min = String(min);
        el.max = String(max);
      });
      $$('[data-unit-label]', root).forEach((el) => (el.textContent = unit));
      rangeText.textContent = `${min} to ${max} ${unit}`;
      update(converted, null);
    }),
  );
  update(Number(range.value), null);
};

// ---------- Before/after compare ----------
const initCompare = () => {
  $$('[data-compare]').forEach((fig) => {
    const frame = $('.compare__frame', fig);
    const range = $('[data-compare-range]', fig);
    const set = () => {
      frame.style.setProperty('--pos', `${range.value}%`);
      range.setAttribute('aria-valuetext', `${range.value}% revealed`);
    };
    range.addEventListener('input', set);
    set();
  });
};

// ---------- FAQ: deep links + search ----------
const openFromHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (target?.matches('details')) {
    target.open = true;
    target.classList.add('is-hit');
    target.querySelector('summary')?.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const initFaqSearch = () => {
  const form = $('[data-faq-search]');
  if (!form) return;
  const input = $('[data-faq-input]', form);
  const items = $$('[data-faq]');
  const groups = $$('[data-faq-group]');
  const chips = $$('[data-faq-cat]');
  const count = $('[data-faq-count]');
  const empty = $('[data-faq-empty]');
  const termOut = $('[data-faq-term]');
  const clearBtns = $$('[data-faq-clear]');
  const original = new Map(items.map((d) => [d, { q: $('.faq__q', d).innerHTML, a: $('.faq__a', d).innerHTML }]));
  let cat = 'all';
  let timer;

  const highlight = (html, term) => {
    if (!term) return html;
    const re = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    // Only touch text between tags so links keep working.
    return html.replace(/(^|>)([^<]+)(?=<|$)/g, (m, lead, text) => lead + text.replace(re, '<mark>$1</mark>'));
  };

  const apply = () => {
    const term = input.value.trim();
    const needle = term.toLowerCase();
    let shown = 0;
    items.forEach((d) => {
      const { q, a } = original.get(d);
      const text = (d.textContent || '').toLowerCase();
      const inCat = cat === 'all' || d.dataset.cat === cat;
      const match = !needle || text.includes(needle);
      const visible = inCat && match;
      d.hidden = !visible;
      $('.faq__q', d).innerHTML = highlight(q, term);
      $('.faq__a', d).innerHTML = highlight(a, term);
      if (visible) shown += 1;
      if (needle && visible) d.open = true;
    });
    groups.forEach((g) => (g.hidden = !$$('[data-faq]', g).some((d) => !d.hidden)));
    empty.hidden = shown > 0;
    termOut.textContent = term;
    count.textContent = term
      ? `${shown} ${shown === 1 ? 'question matches' : 'questions match'} “${term}”`
      : `${shown} ${shown === 1 ? 'question' : 'questions'}`;
    $('.faq-search__clear', form).hidden = !term;
    const url = new URL(window.location.href);
    if (term) url.searchParams.set('q', term); else url.searchParams.delete('q');
    if (cat !== 'all') url.searchParams.set('cat', cat); else url.searchParams.delete('cat');
    history.replaceState(history.state, '', url);
  };

  form.addEventListener('submit', (e) => e.preventDefault());
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(apply, 120);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) {
      input.value = '';
      apply();
    }
  });
  clearBtns.forEach((b) =>
    b.addEventListener('click', () => {
      input.value = '';
      items.forEach((d) => (d.open = false));
      apply();
      input.focus();
    }),
  );
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      cat = chip.dataset.faqCat;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      apply();
    }),
  );
  const params = new URLSearchParams(window.location.search);
  const startCat = chips.find((c) => c.dataset.faqCat === params.get('cat'));
  if (startCat) startCat.click();
  if (params.get('q')) {
    input.value = params.get('q');
    apply();
  }
};

// ---------- Contact: live support status ----------
const initOpenStatus = () => {
  const el = $('[data-open-status]');
  if (!el) return;
  const { open, close, days, tz } = el.dataset;
  const text = $('[data-open-text]', el);
  const update = () => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date())
        .map((p) => [p.type, p.value]),
    );
    const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const hour = Number(parts.hour) + Number(parts.minute) / 60;
    const openDays = days.split(',').map(Number);
    const isOpen = openDays.includes(dayIndex) && hour >= Number(open) && hour < Number(close);
    el.classList.toggle('is-open', isOpen);
    el.classList.toggle('is-closed', !isOpen);
    if (isOpen) {
      text.textContent = `Phone support is open now, until ${Number(close) - 12} p.m. ET`;
    } else {
      const opensToday = openDays.includes(dayIndex) && hour < Number(open);
      let next = 'tomorrow';
      if (opensToday) next = 'today';
      else if (!openDays.includes((dayIndex + 1) % 7)) next = 'Monday';
      text.textContent = `Phone support is closed. Opens ${next} at ${open} a.m. ET`;
    }
  };
  update();
  setInterval(update, 60_000);
};

// ---------- Contact form ----------
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const phoneOk = (v) => !v || v.replace(/\D/g, '').length >= 10;

const fieldError = (field, message) => {
  const err = document.getElementById(`${field.id}-err`);
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (err) {
    err.textContent = message || '';
    err.hidden = !message;
  }
};

const initContactForm = () => {
  const form = $('[data-contact-form]');
  if (!form) return;
  const success = $('[data-contact-success]');
  const summary = $('[data-error-summary]', form);
  const message = $('#cf-message', form);
  const counter = $('[data-count]', form);
  let lastMailto = '';

  const rules = {
    'cf-name': (v) => (v.trim().length >= 2 ? '' : 'Enter your full name.'),
    'cf-email': (v) => (!v.trim() ? 'Enter your email address.' : emailOk(v.trim()) ? '' : 'Enter an email address like name@example.com.'),
    'cf-phone': (v) => (phoneOk(v) ? '' : 'Enter a 10-digit phone number, or leave this blank.'),
    'cf-topic': (v) => (v ? '' : 'Choose a topic.'),
    'cf-message': (v) => (v.trim().length >= 10 ? '' : 'Tell us a little more, at least 10 characters.'),
    'cf-consent': (_, el) => (el.checked ? '' : 'Confirm that this message is not about a medical question or emergency.'),
  };
  const validate = (el) => {
    const msg = rules[el.id]?.(el.value, el) ?? '';
    fieldError(el, msg);
    return msg;
  };

  Object.keys(rules).forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => {
      if (el.value || el.type === 'checkbox') validate(el);
    });
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') validate(el);
    });
    el.addEventListener('change', () => {
      if (el.getAttribute('aria-invalid') === 'true') validate(el);
    });
  });
  message.addEventListener('input', () => {
    counter.textContent = message.value.length.toLocaleString('en-US');
  });
  let dirty = false;
  form.addEventListener('input', () => (dirty = message.value.trim().length > 0));
  window.addEventListener('beforeunload', (e) => {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = Object.keys(rules)
      .map((id) => ({ id, msg: validate(document.getElementById(id)) }))
      .filter((x) => x.msg);
    if (errors.length) {
      $('ul', summary).innerHTML = errors.map((x) => `<li><a href="#${x.id}">${x.msg}</a></li>`).join('');
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;
    const data = new FormData(form);
    const topicLabel = $('#cf-topic option:checked', form).textContent;
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      data.get('phone') ? `Phone: ${data.get('phone')}` : '',
      `Topic: ${topicLabel}`,
      '',
      data.get('message'),
    ]
      .filter((l) => l !== '')
      .join('\n');
    dirty = false;
    lastMailto = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Website message: ${topicLabel}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = lastMailto;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  summary.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    document.getElementById(link.hash.slice(1))?.focus();
  });
  $('[data-mailto-fallback]', success)?.addEventListener('click', (e) => {
    e.preventDefault();
    if (lastMailto) window.location.href = lastMailto;
  });
  $('[data-contact-reset]', success)?.addEventListener('click', () => {
    form.reset();
    counter.textContent = '0';
    $$('[aria-invalid]', form).forEach((el) => el.setAttribute('aria-invalid', 'false'));
    success.hidden = true;
    form.hidden = false;
    $('#cf-name', form).focus();
  });
};

// ---------- Eligibility quiz ----------
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

const initQuiz = () => {
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

// ---------- Boot ----------
const boot = () => {
  initRanges();
  initPromo();
  initHeader();
  initLadder();
  initEstimate();
  initCompare();
  initFaqSearch();
  initOpenStatus();
  initContactForm();
  initQuiz();
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
