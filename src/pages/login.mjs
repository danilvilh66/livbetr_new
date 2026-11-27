import { site } from '../data.mjs';
import { icon } from '../icons.mjs';
import { aurora, checkList } from '../components.mjs';

export const meta = {
  path: 'login/',
  title: 'Log in to the patient portal',
  description: 'Log in to your Livbetr patient portal to message your care team, track refills and manage your plan.',
  active: '',
  noindex: true,
};

export const render = (root) => {
  const endpoint = site.integrations.portalLoginUrl;
  const body = `
<section class="auth-page" aria-labelledby="login-title">
  ${aurora('aurora--soft')}
  <div class="wrap auth__grid">
    <div class="auth__intro">
      <h1 id="login-title" class="display-1">Welcome back</h1>
      <p class="lead">Your patient portal is where your care happens between deliveries.</p>
      ${checkList(['Message your clinical care team', 'Track shipments and refills', 'Change or cancel your plan', 'Download receipts'])}
    </div>
    <div class="auth card" data-auth data-endpoint="${endpoint ?? ''}">
      <form class="form" novalidate data-login-form${endpoint ? ` action="${endpoint}" method="post"` : ''}>
        <h2 class="auth__title">Log in</h2>
        <div class="form__error-summary" role="alert" tabindex="-1" hidden data-auth-errors><ul></ul></div>
        <div class="field"><label for="lg-email">Email</label><input id="lg-email" name="email" type="email" autocomplete="username" inputmode="email" spellcheck="false" required></div>
        <div class="field">
          <label for="lg-password">Password</label>
          <div class="password">
            <input id="lg-password" name="password" type="password" autocomplete="current-password" required>
            <button type="button" class="password__toggle" aria-controls="lg-password" aria-pressed="false" data-show-password>Show</button>
          </div>
        </div>
        <button class="btn btn--gold btn--lg btn--block" type="submit">Log in</button>
        <button class="link-quiet auth__link" type="button" data-show-reset>Forgot your password?</button>
      </form>

      <form class="form" novalidate data-reset-form hidden>
        <h2 class="auth__title" tabindex="-1">Reset your password</h2>
        <p class="lead">Enter the email you signed up with and we’ll send you a link to set a new password.</p>
        <div class="form__error-summary" role="alert" tabindex="-1" hidden data-auth-errors><ul></ul></div>
        <div class="field"><label for="rs-email">Email</label><input id="rs-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" required></div>
        <button class="btn btn--gold btn--lg btn--block" type="submit">Email me a reset link</button>
        <button class="link-quiet auth__link" type="button" data-show-login>Back to log in</button>
      </form>

      <div class="auth__done" data-reset-done hidden tabindex="-1">
        <span class="form-success__icon">${icon('mail', { size: 24 })}</span>
        <h2 class="auth__title">Check your email</h2>
        <p>If there’s an account for <strong data-reset-email></strong>, a reset link is on its way. It expires in 1 hour.</p>
        <button class="btn btn--line" type="button" data-show-login>Back to log in</button>
      </div>

      ${endpoint ? '' : `<p class="preview-note">${icon('info', { size: 18 })}<span><strong>Preview mode.</strong> The portal isn’t connected yet. Logging in opens a preview with sample data; your password isn’t stored or sent anywhere.</span></p>`}
      <p class="auth__foot">New to Livbetr? <a href="${root}eligibility/">Check your eligibility</a>. Trouble logging in? Call <a href="${site.phoneHref}">${site.phone}</a>.</p>
    </div>
  </div>
</section>`;
  return { body, bodyClass: 'page-auth' };
};
