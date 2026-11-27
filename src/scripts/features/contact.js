import { $, $$ } from '../lib/dom.js';

// "Open now" badge computed in Eastern Time from the hours in the markup.
export const initOpenStatus = () => {
  const el = $('[data-open-status]');
  if (!el) return;
  const { open, close, days, tz } = el.dataset;
  const text = $('[data-open-text]', el);
  const openDays = days.split(',').map(Number);
  const update = () => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date())
        .map((p) => [p.type, p.value]),
    );
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const hour = Number(parts.hour) + Number(parts.minute) / 60;
    const isOpen = openDays.includes(day) && hour >= Number(open) && hour < Number(close);
    el.classList.toggle('is-open', isOpen);
    el.classList.toggle('is-closed', !isOpen);
    if (isOpen) {
      text.textContent = `Phone support is open now, until ${Number(close) - 12} p.m. ET`;
      return;
    }
    let next = 'tomorrow';
    if (openDays.includes(day) && hour < Number(open)) next = 'today';
    else if (!openDays.includes((day + 1) % 7)) next = 'Monday';
    text.textContent = `Phone support is closed. Opens ${next} at ${open} a.m. ET`;
  };
  update();
  setInterval(update, 60_000);
};

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const phoneOk = (v) => !v || v.replace(/\D/g, '').length >= 10;

const rules = {
  'cf-name': (v) => (v.trim().length >= 2 ? '' : 'Enter your full name.'),
  'cf-email': (v) => (!v.trim() ? 'Enter your email address.' : emailOk(v.trim()) ? '' : 'Enter an email address like name@example.com.'),
  'cf-phone': (v) => (phoneOk(v) ? '' : 'Enter a 10-digit phone number, or leave this blank.'),
  'cf-topic': (v) => (v ? '' : 'Choose a topic.'),
  'cf-message': (v) => (v.trim().length >= 10 ? '' : 'Tell us a little more, at least 10 characters.'),
  'cf-consent': (_, el) => (el.checked ? '' : 'Confirm that this message is not about a medical question or emergency.'),
};

const showFieldError = (field, message) => {
  const err = document.getElementById(`${field.id}-err`);
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (err) {
    err.textContent = message || '';
    err.hidden = !message;
  }
};

// Contact form: inline validation, an error summary that takes focus, then a
// prefilled email (there is no backend yet) and a confirmation panel.
export const initContactForm = () => {
  const form = $('[data-contact-form]');
  if (!form) return;
  const success = $('[data-contact-success]');
  const summary = $('[data-error-summary]', form);
  const message = $('#cf-message', form);
  const counter = $('[data-count]', form);
  let lastMailto = '';
  let dirty = false;

  const validate = (el) => {
    const msg = rules[el.id]?.(el.value, el) ?? '';
    showFieldError(el, msg);
    return msg;
  };
  Object.keys(rules).forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => {
      if (el.value || el.type === 'checkbox') validate(el);
    });
    ['input', 'change'].forEach((type) =>
      el.addEventListener(type, () => {
        if (el.getAttribute('aria-invalid') === 'true') validate(el);
      }),
    );
  });
  message.addEventListener('input', () => {
    counter.textContent = message.value.length.toLocaleString('en-US');
  });
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
    const topic = $('#cf-topic option:checked', form).textContent;
    const body = [`Name: ${data.get('name')}`, `Email: ${data.get('email')}`, data.get('phone') ? `Phone: ${data.get('phone')}` : '', `Topic: ${topic}`, '', data.get('message')]
      .filter((l) => l !== '')
      .join('\n');
    dirty = false;
    lastMailto = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Website message: ${topic}`)}&body=${encodeURIComponent(body)}`;
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
