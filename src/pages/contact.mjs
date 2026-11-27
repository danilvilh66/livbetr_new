import { site } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero } from '../components.mjs';

export const meta = {
  path: 'contact/',
  title: 'Contact us',
  description: `Get help with billing, orders, delivery or your Livbetr account. Call ${site.phone}, Monday to Saturday, 9 a.m. to 10 p.m. ET, or email ${site.email}.`,
  active: 'contact',
};

const topics = [
  ['billing', 'Payments and refunds'],
  ['plan', 'Plans and cancellations'],
  ['delivery', 'Orders and delivery'],
  ['account', 'Signing in and my account'],
  ['start', 'Getting started'],
  ['other', 'Something else'],
];

export const render = (root) => {
  const status = `<p class="open-status" data-open-status data-open="${site.supportHours.open}" data-close="${site.supportHours.close}" data-days="${site.supportHours.openDays.join(',')}" data-tz="${site.supportHours.tz}">
    <span class="open-status__dot" aria-hidden="true"></span><span data-open-text>Phone support: ${site.supportHours.days}, ${site.supportHours.time}</span>
  </p>`;

  const body = `
${pageHero({
  title: 'Let&rsquo;s get you the right help',
  lead: 'Billing, orders and account questions go to our support team. Questions about your medication go to your clinical care team.',
  extra: status,
})}

<section class="section section--tight" aria-labelledby="routes-title">
  <div class="container">
    <h2 id="routes-title" class="visually-hidden">Who to contact</h2>
    <ul class="routes">
      <li class="route">
        <span class="route__icon">${icon('phone', { size: 22 })}</span>
        <h3>Billing, orders and account</h3>
        <p>Payments, refunds, receipts, plan changes, cancellations, delivery and sign-in help.</p>
        <p class="route__actions">
          <a class="btn btn--primary btn--block" href="${site.phoneHref}">${icon('phone', { size: 18 })} Call ${site.phone}</a>
          <a class="btn btn--ghost btn--block" href="mailto:${site.email}">${icon('mail', { size: 18 })} Email ${site.email}</a>
        </p>
        <p class="fine">${site.supportHours.days}, ${site.supportHours.time}</p>
      </li>
      <li class="route">
        <span class="route__icon">${icon('stethoscope', { size: 22 })}</span>
        <h3>Medication and treatment</h3>
        <p>Doses and injection instructions, side effects, and prescription or refill follow-up. Your clinical care team answers in the patient portal.</p>
        <p class="route__actions"><a class="btn btn--primary btn--block" href="${root}login/">${icon('login', { size: 18 })} Message my care team</a></p>
        <p class="fine">Portal messages are not for emergencies.</p>
      </li>
      <li class="route route--urgent">
        <span class="route__icon">${icon('alert', { size: 22 })}</span>
        <h3>Medical emergency</h3>
        <p>Call 911 or go to the nearest emergency room. For a possible poisoning or overdose, call Poison Control.</p>
        <p class="route__actions">
          <a class="btn btn--danger btn--block" href="tel:911">Call 911</a>
          <a class="btn btn--ghost btn--block" href="tel:+18002221222">Poison Control ${site.poisonControl}</a>
        </p>
      </li>
    </ul>
  </div>
</section>

<section class="section section--mist" aria-labelledby="form-title">
  <div class="container contact__grid">
    <div class="contact__intro">
      <h2 id="form-title" class="display-2">Send us a message</h2>
      <p class="lead">Tell us what you need and we&rsquo;ll get back to you by email. Please don&rsquo;t include medical details here; use the patient portal for anything about your treatment.</p>
      <ul class="contact__quick">
        <li><a href="${root}faq/#cancel">How do I cancel?</a></li>
        <li><a href="${root}faq/#refunds">Can I get a refund?</a></li>
        <li><a href="${root}faq/#damaged">My delivery is late or damaged</a></li>
        <li><a href="${root}faq/#after-paying">I have paid. What happens next?</a></li>
      </ul>
    </div>
    <form class="form card" novalidate data-contact-form data-email="${site.email}" data-endpoint="${site.integrations.contactEndpoint ?? ''}">
      <div class="form__error-summary" role="alert" tabindex="-1" hidden data-error-summary>
        <p><strong>Please fix the following:</strong></p>
        <ul></ul>
      </div>
      <div class="form__row form__row--2">
        <div class="field">
          <label for="cf-name">Full name</label>
          <input id="cf-name" name="name" type="text" autocomplete="name" required aria-describedby="cf-name-err">
          <p class="field__error" id="cf-name-err" hidden></p>
        </div>
        <div class="field">
          <label for="cf-email">Email</label>
          <input id="cf-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" required aria-describedby="cf-email-err">
          <p class="field__error" id="cf-email-err" hidden></p>
        </div>
      </div>
      <div class="form__row form__row--2">
        <div class="field">
          <label for="cf-phone">Phone <span class="optional">(optional)</span></label>
          <input id="cf-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" aria-describedby="cf-phone-err">
          <p class="field__error" id="cf-phone-err" hidden></p>
        </div>
        <div class="field">
          <label for="cf-topic">Topic</label>
          <div class="select">
            <select id="cf-topic" name="topic" required aria-describedby="cf-topic-err">
              <option value="">Choose a topic</option>
              ${topics.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
            </select>
            ${icon('chevronDown', { size: 18 })}
          </div>
          <p class="field__error" id="cf-topic-err" hidden></p>
        </div>
      </div>
      <div class="field">
        <label for="cf-message">Message</label>
        <textarea id="cf-message" name="message" rows="5" maxlength="1500" required aria-describedby="cf-message-hint cf-message-err"></textarea>
        <p class="field__hint" id="cf-message-hint"><span data-count>0</span> of 1,500 characters</p>
        <p class="field__error" id="cf-message-err" hidden></p>
      </div>
      <div class="field field--check">
        <input id="cf-consent" name="consent" type="checkbox" required aria-describedby="cf-consent-err">
        <label for="cf-consent">I understand this form is not for medical questions or emergencies.</label>
        <p class="field__error" id="cf-consent-err" hidden></p>
      </div>
      <button class="btn btn--primary btn--lg" type="submit">Send message</button>
      <p class="fine">Sending opens your email app with your message ready to go to ${site.email}.</p>
    </form>
    <div class="form-success card" hidden tabindex="-1" data-contact-success>
      <span class="form-success__icon">${icon('check', { size: 26 })}</span>
      <div data-success-mailto>
        <h3 class="display-3">Your message is ready to send</h3>
        <p>Your email app should have opened with your message to ${site.email}. Press send there and we&rsquo;ll reply by email.</p>
        <p>Email app didn&rsquo;t open? <button type="button" class="link-inline" data-mailto-fallback>Open it again</button>, or call <a href="${site.phoneHref}">${site.phone}</a>.</p>
      </div>
      <div data-success-sent hidden>
        <h3 class="display-3">Message sent</h3>
        <p>Thanks. We&rsquo;ll reply by email.</p>
      </div>
      <button class="btn btn--ghost" type="button" data-contact-reset>Write another message</button>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="mail-title">
  <div class="container contact__address">
    <div>
      <h2 id="mail-title" class="display-3">Mailing address</h2>
      <address>${site.legalName}<br>${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.zip}</address>
    </div>
    <div>
      <h2 class="display-3">Privacy and records requests</h2>
      <p>Call customer service at <a href="${site.phoneHref}">${site.phone}</a>. Formal request methods are listed in our <a href="${root}privacy-policy/">privacy policy</a>.</p>
    </div>
    <div>
      <h2 class="display-3">Report a side effect</h2>
      <p>Tell your care team in the portal. You can also report to the FDA MedWatch program at ${site.fdaMedWatch}.</p>
    </div>
  </div>
</section>
`;
  return { body };
};
