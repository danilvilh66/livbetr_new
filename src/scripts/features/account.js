import { $, $$, session } from '../lib/dom.js';

const PREVIEW_KEY = 'livbetr-portal-preview';
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const showErrors = (form, errors) => {
  const box = $('[data-auth-errors]', form);
  $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
  if (!errors.length) {
    box.hidden = true;
    return false;
  }
  $('ul', box).innerHTML = errors.map(([id, msg]) => `<li><a href="#${id}">${esc(msg)}</a></li>`).join('');
  errors.forEach(([id]) => document.getElementById(id)?.setAttribute('aria-invalid', 'true'));
  box.hidden = false;
  document.getElementById(errors[0][0])?.focus();
  return true;
};

// Log in page: validation, show/hide password, password reset. With a portal endpoint
// configured the form posts there; in preview mode it opens the portal preview.
export const initLogin = () => {
  const auth = $('[data-auth]');
  if (!auth) return;
  const login = $('[data-login-form]', auth);
  const reset = $('[data-reset-form]', auth);
  const done = $('[data-reset-done]', auth);
  const siteRoot = document.body.dataset.root || './';
  const view = (which) => {
    login.hidden = which !== 'login';
    reset.hidden = which !== 'reset';
    done.hidden = which !== 'done';
    const target = { login: '#lg-email', reset: '#rs-email', done: '.auth__title' }[which];
    $(target, auth)?.focus();
  };

  $('[data-show-password]', login).addEventListener('click', (e) => {
    const input = $('#lg-password', login);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    e.currentTarget.textContent = show ? 'Hide' : 'Show';
    e.currentTarget.setAttribute('aria-pressed', String(show));
  });
  $$('[data-show-reset]', auth).forEach((b) => b.addEventListener('click', () => view('reset')));
  $$('[data-show-login]', auth).forEach((b) => b.addEventListener('click', () => view('login')));
  auth.addEventListener('click', (e) => {
    const link = e.target.closest('[data-auth-errors] a');
    if (!link) return;
    e.preventDefault();
    document.getElementById(link.hash.slice(1))?.focus();
  });

  login.addEventListener('submit', (e) => {
    const email = $('#lg-email', login).value.trim();
    const errors = [];
    if (!emailOk(email)) errors.push(['lg-email', 'Enter the email you signed up with.']);
    if (!$('#lg-password', login).value) errors.push(['lg-password', 'Enter your password.']);
    if (showErrors(login, errors)) {
      e.preventDefault();
      return;
    }
    if (auth.dataset.endpoint) return; // real portal: let the browser post the form
    e.preventDefault();
    session.set(PREVIEW_KEY, { email });
    window.location.assign(`${siteRoot}portal/`);
  });
  reset.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#rs-email', reset).value.trim();
    if (showErrors(reset, emailOk(email) ? [] : [['rs-email', 'Enter an email address like name@example.com.']])) return;
    $('[data-reset-email]', done).textContent = email;
    view('done');
  });
};

// Portal preview: sample data, a working message composer, plan dialogs and log out.
export const initPortal = () => {
  const portal = $('[data-portal]');
  if (!portal) return;
  const siteRoot = document.body.dataset.root || './';
  const plans = JSON.parse($('[data-portal-plans]', portal).textContent);
  const state = session.get(PREVIEW_KEY);
  if (!state) {
    window.location.replace(`${siteRoot}login/`);
    return;
  }
  const toast = $('[data-toast]', portal);
  let toastTimer;
  const say = (text) => {
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.hidden = true), 4000);
  };
  const name = state.email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  $('[data-portal-name]', portal).textContent = name;

  // Dates are relative to today so the preview never looks stale.
  const day = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  $('[data-refill-date]', portal).textContent = `Ships ${day(9).replace(/, \d{4}$/, '')}`;
  const renderPlan = () => {
    const plan = plans[state.med || 'semaglutide'];
    $('[data-portal-med]', portal).textContent = plan.name;
    $('[data-portal-price]', portal).textContent = `$${plan.price}/mo, every dose`;
    $('[data-portal-dose]', portal).textContent = `${plan.dose} mg weekly`;
    $('[data-orders]', portal).innerHTML = [19, 47, 75]
      .map(
        (ago) =>
          `<tr><td>${day(-ago)}</td><td>${plan.name}, 4-week supply</td><td>$${plan.price}.00</td><td><span class="dot dot--ok"></span>Delivered</td><td><button type="button" class="link-inline" data-receipt="${ago}">Download<span class="visually-hidden"> receipt for ${day(-ago)}</span></button></td></tr>`,
      )
      .join('');
  };
  renderPlan();

  // Receipts download as plain text, generated in the browser from the order row.
  $('[data-orders]', portal).addEventListener('click', (e) => {
    const button = e.target.closest('[data-receipt]');
    if (!button) return;
    const plan = plans[state.med || 'semaglutide'];
    const date = day(-Number(button.dataset.receipt));
    const text = [
      'Livbetr LLC, 66 W Flagler St, Miami, FL 33130',
      'Receipt (portal preview, sample data)',
      '',
      `Date: ${date}`,
      `Billed to: ${state.email}`,
      `Item: Compounded ${plan.name.toLowerCase()}, 4-week supply, clinician review and care coach`,
      `Shipping: $0.00`,
      `Total: $${plan.price}.00`,
      '',
      'Questions: support@livbetr.com, 1-888-664-9435',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `livbetr-receipt-${date.replace(/[\s,]+/g, '-')}.txt` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  const thread = $('[data-thread]', portal);
  (state.messages || []).forEach((m) => thread.insertAdjacentHTML('beforeend', `<li class="msg msg--me"><span class="msg__who">You</span>${esc(m)}</li>`));
  $('[data-composer]', portal).addEventListener('submit', (e) => {
    e.preventDefault();
    const box = $('#msg-text', portal);
    const text = box.value.trim();
    if (!text) {
      box.focus();
      return;
    }
    thread.insertAdjacentHTML('beforeend', `<li class="msg msg--me"><span class="msg__who">You</span>${esc(text)}</li>`);
    state.messages = [...(state.messages || []), text];
    session.set(PREVIEW_KEY, state);
    box.value = '';
    say('Message sent. Your care team will reply here.');
  });

  $('[data-track-toggle]', portal).addEventListener('click', (e) => {
    const track = $('#track', portal);
    track.hidden = !track.hidden;
    e.currentTarget.setAttribute('aria-expanded', String(!track.hidden));
  });
  $$('[data-open]', portal).forEach((b) => b.addEventListener('click', () => document.getElementById(b.dataset.open).showModal()));
  $('#dlg-change').addEventListener('close', (e) => {
    if (e.target.returnValue !== 'confirm') return;
    const med = $('#dlg-change input[name="med"]:checked').value;
    if (med === (state.med || 'semaglutide')) return;
    state.med = med;
    session.set(PREVIEW_KEY, state);
    renderPlan();
    say(`Change requested. Your clinician will review the switch to ${plans[med].name}.`);
  });
  $('#dlg-cancel').addEventListener('close', (e) => {
    if (e.target.returnValue === 'confirm') say('Your plan is cancelled. You won’t be charged again.');
  });
  $('[data-logout]', portal).addEventListener('click', () => {
    session.remove(PREVIEW_KEY);
    window.location.assign(`${siteRoot}login/`);
  });
};
