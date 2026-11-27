import { $, $$ } from '../lib/dom.js';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Wraps matches in <mark> inside text nodes only, so links in answers keep working.
const highlight = (html, term) => {
  if (!term) return html;
  const re = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return html.replace(/(^|>)([^<]+)(?=<|$)/g, (m, lead, text) => lead + text.replace(re, '<mark>$1</mark>'));
};

// FAQ page: live search, category filters, empty state, and URL sync (?q=, ?cat=).
export const initFaqSearch = () => {
  const form = $('[data-faq-search]');
  if (!form) return;
  const input = $('[data-faq-input]', form);
  const items = $$('[data-faq]');
  const groups = $$('[data-faq-group]');
  const chips = $$('[data-faq-cat]');
  const count = $('[data-faq-count]');
  const empty = $('[data-faq-empty]');
  const termOut = $('[data-faq-term]');
  const original = new Map(items.map((d) => [d, { q: $('.faq__q', d).innerHTML, a: $('.faq__a', d).innerHTML }]));
  let cat = 'all';
  let timer;

  const apply = () => {
    const term = input.value.trim();
    const needle = term.toLowerCase();
    let shown = 0;
    items.forEach((d) => {
      const { q, a } = original.get(d);
      const visible = (cat === 'all' || d.dataset.cat === cat) && (!needle || d.textContent.toLowerCase().includes(needle));
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
    if (term) url.searchParams.set('q', term);
    else url.searchParams.delete('q');
    if (cat !== 'all') url.searchParams.set('cat', cat);
    else url.searchParams.delete('cat');
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
  $$('[data-faq-clear]').forEach((b) =>
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
        c.classList.toggle('is-active', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      apply();
    }),
  );
  const params = new URLSearchParams(window.location.search);
  chips.find((c) => c.dataset.faqCat === params.get('cat'))?.click();
  if (params.get('q')) {
    input.value = params.get('q');
    apply();
  }
};
