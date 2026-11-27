import { site, faqs, faqCategories } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero, faqItem, faqSchema } from '../components.mjs';

export const meta = {
  path: 'faq/',
  title: 'Frequently asked questions',
  description: 'Answers about GLP-1 eligibility, semaglutide and tirzepatide, dosing, side effects, pricing, billing, refunds, delivery and your Livbetr account.',
  active: 'faq',
};

export const render = (root) => {
  const search = `<form class="faq-search" role="search" data-faq-search>
    <label for="faq-q" class="visually-hidden">Search questions</label>
    ${icon('search', { size: 20 })}
    <input id="faq-q" type="search" placeholder="Try &ldquo;refund&rdquo; or &ldquo;dose&rdquo;&hellip;" autocomplete="off" data-faq-input>
    <button type="button" class="faq-search__clear" data-faq-clear hidden aria-label="Clear search">${icon('x', { size: 18 })}</button>
  </form>`;

  const body = `
${pageHero({
  title: 'Questions, answered plainly',
  lead: 'Everything about eligibility, medication, billing and delivery in one place. Can&rsquo;t find it? We answer every message.',
  extra: search,
})}

<section class="section section--tight faq-page" aria-label="All questions">
  <div class="container faq-page__grid">
    <nav class="faq-cats" aria-label="Question categories">
      <ul>
        <li><button type="button" class="chip is-active" aria-pressed="true" data-faq-cat="all">All questions</button></li>
        ${faqCategories.map((c) => `<li><button type="button" class="chip" aria-pressed="false" data-faq-cat="${c.id}">${c.label}</button></li>`).join('')}
      </ul>
    </nav>
    <div class="faq-page__list">
      <p class="faq-count" role="status" data-faq-count>${faqs.length} questions</p>
      ${faqCategories
        .map(
          (c) => `<section class="faq-group" data-faq-group="${c.id}" aria-labelledby="cat-${c.id}">
        <h2 id="cat-${c.id}" class="faq-group__title">${c.label}</h2>
        <div class="faqs">${faqs.filter((f) => f.cat === c.id).map((f) => faqItem(root, f)).join('')}</div>
      </section>`,
        )
        .join('')}
      <div class="empty" data-faq-empty hidden>
        <h2 class="display-3">No questions match &ldquo;<span data-faq-term></span>&rdquo;</h2>
        <p>Try a shorter word, or ask us directly. We reply to every message.</p>
        <div class="btn-row"><a class="btn btn--primary" href="${root}contact/">Contact support</a><button type="button" class="btn btn--ghost" data-faq-clear>Clear search</button></div>
      </div>
    </div>
  </div>
</section>

<section class="section section--mist" aria-labelledby="still-title">
  <div class="container help-cards">
    <h2 id="still-title" class="display-2">Still have a question?</h2>
    <ul class="help-cards__list">
      <li><span>${icon('phone', { size: 20 })}</span><div><h3>Call us</h3><p><a href="${site.phoneHref}">${site.phone}</a><br>${site.supportHours.days}, ${site.supportHours.time}</p></div></li>
      <li><span>${icon('mail', { size: 20 })}</span><div><h3>Email us</h3><p><a href="mailto:${site.email}">${site.email}</a><br>For billing, orders and your account</p></div></li>
      <li><span>${icon('message', { size: 20 })}</span><div><h3>Message your care team</h3><p><a href="${root}login/">Patient portal</a><br>For questions about your medication</p></div></li>
    </ul>
  </div>
</section>
`;
  return { body, schema: faqSchema(faqs) };
};
