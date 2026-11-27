import { site, treatments } from '../data.mjs';
import { icon } from '../icons.mjs';

export const meta = {
  path: 'portal/',
  title: 'Patient portal preview',
  description: 'A preview of the Livbetr patient portal with sample data.',
  active: '',
  noindex: true,
};

// A preview of the portal with clearly labelled sample data, so the whole journey can be
// clicked through on this site. The real portal replaces it once it is connected.
export const render = () => {
  const sema = treatments[0];
  const body = `
<section class="portal" data-portal>
  <div class="wrap">
    <p class="preview-note portal__banner">${icon('info', { size: 18 })}<span><strong>Portal preview with sample data.</strong> In the live portal you’ll see your own plan, orders and messages.</span></p>
    <div class="portal__head">
      <div><p class="portal__hello">Hi, <span data-portal-name>there</span></p><h1 class="display-2">Your plan at a glance</h1></div>
      <button class="btn btn--line" type="button" data-logout>${icon('login', { size: 18 })} Log out</button>
    </div>

    <div class="portal__grid">
      <article class="tile tile--plan" aria-labelledby="t-plan">
        <h2 id="t-plan" class="tile__title">Your plan</h2>
        <p class="tile__big" data-portal-med>${sema.name}</p>
        <dl class="tile__dl">
          <div><dt>Price</dt><dd data-portal-price>$${sema.price}/mo, every dose</dd></div>
          <div><dt>Current dose</dt><dd data-portal-dose>${sema.doses[1].mg} mg weekly</dd></div>
          <div><dt>Status</dt><dd><span class="dot dot--ok"></span>Active</dd></div>
        </dl>
        <div class="btn-row"><button class="btn btn--line btn--sm" type="button" data-open="dlg-change">Change medication</button><button class="btn btn--line btn--sm" type="button" data-open="dlg-cancel">Cancel plan</button></div>
      </article>

      <article class="tile tile--refill" aria-labelledby="t-refill">
        <h2 id="t-refill" class="tile__title">Next refill</h2>
        <p class="tile__big" data-refill-date>Ships soon</p>
        <p class="tile__muted">Arrives before your current supply runs out. Free, plain packaging.</p>
        <button class="btn btn--gold btn--sm" type="button" aria-expanded="false" aria-controls="track" data-track-toggle>Track last delivery</button>
        <ol class="vig__track track" id="track" hidden><li class="is-done">Prepared by the pharmacy</li><li class="is-done">Shipped</li><li class="is-done">Delivered</li></ol>
      </article>

      <article class="tile tile--messages" aria-labelledby="t-msg">
        <h2 id="t-msg" class="tile__title">Care team</h2>
        <ol class="thread" data-thread aria-live="polite">
          <li class="msg"><span class="msg__who">Your care coach</span>How did your first week on the new dose go? Any nausea?</li>
          <li class="msg msg--me"><span class="msg__who">You</span>A little on day one, much better since.</li>
          <li class="msg"><span class="msg__who">Your care coach</span>That’s common and usually settles. Small meals help. I’ll check in again next week.</li>
        </ol>
        <form class="composer" data-composer novalidate>
          <label for="msg-text" class="visually-hidden">Message your care team</label>
          <textarea id="msg-text" rows="2" maxlength="600" placeholder="Write a message…" required></textarea>
          <button class="btn btn--gold btn--sm" type="submit">Send</button>
        </form>
        <p class="tile__muted">For emergencies call 911. Messages aren’t monitored around the clock.</p>
      </article>

      <article class="tile tile--orders" aria-labelledby="t-orders">
        <h2 id="t-orders" class="tile__title">Orders and receipts</h2>
        <div class="table-wrap"><table class="orders"><thead><tr><th scope="col">Date</th><th scope="col">Item</th><th scope="col">Total</th><th scope="col">Status</th><th scope="col">Receipt</th></tr></thead><tbody data-orders></tbody></table></div>
      </article>
    </div>
    <p class="fine">Need help with your account? Call <a href="${site.phoneHref}">${site.phone}</a> or email <a href="mailto:${site.email}">${site.email}</a>.</p>
  </div>

  <dialog class="dialog" id="dlg-change" aria-labelledby="dlg-change-title">
    <form method="dialog" class="dialog__body" data-change-form>
      <h2 id="dlg-change-title" class="auth__title">Change medication</h2>
      <p>Your clinician reviews every change. Your new price starts with your next refill.</p>
      <div class="options">${treatments.map((t) => `<label class="option"><input type="radio" name="med" value="${t.id}"${t.id === sema.id ? ' checked' : ''}><span class="option__box"><span><span class="option__label">${t.name}, $${t.price}/mo</span><span class="option__hint">${t.kind}</span></span></span></label>`).join('')}</div>
      <div class="btn-row"><button class="btn btn--gold" value="confirm">Request change</button><button class="btn btn--line" value="cancel" formnovalidate>Keep my plan</button></div>
    </form>
  </dialog>
  <dialog class="dialog" id="dlg-cancel" aria-labelledby="dlg-cancel-title">
    <form method="dialog" class="dialog__body">
      <h2 id="dlg-cancel-title" class="auth__title">Cancel your plan?</h2>
      <p>You won’t be charged again and no more refills will ship. You can restart anytime. Nobody will call to talk you out of it.</p>
      <div class="btn-row"><button class="btn btn--danger" value="confirm">Cancel my plan</button><button class="btn btn--line" value="cancel">Keep my plan</button></div>
    </form>
  </dialog>
  <p class="toast" role="status" data-toast hidden></p>
  <script type="application/json" data-portal-plans>${JSON.stringify(Object.fromEntries(treatments.map((t) => [t.id, { name: t.name, price: t.price, dose: t.doses[1].mg }])))}</script>
</section>`;
  return { body, bodyClass: 'page-portal' };
};
