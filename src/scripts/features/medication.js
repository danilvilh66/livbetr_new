import { $, $$, fmtMg } from '../lib/dom.js';

// One medication choice drives every price and dose on the page: the journey list,
// the animated stage, the price scene and the fixed price pill.
// Other modules listen for the "medication:change" event.
const state = { id: 'semaglutide', data: null };

export const currentMedication = () => ({ id: state.id, ...state.data?.[state.id] });

const render = () => {
  const med = state.data?.[state.id];
  if (!med) return;
  $$('[data-med]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.med === state.id)));
  med.doses.forEach((mg, i) => $$(`[data-step-dose="${i}"]`).forEach((el) => (el.textContent = fmtMg(mg))));
  $$('[data-step-price]').forEach((el) => (el.textContent = `$${med.price}/mo`));
  $$('[data-price-value], [data-hud-price]').forEach((el) => (el.textContent = `$${med.price}`));
  $$('[data-price-chip]').forEach((el) => (el.textContent = `$${med.price}`));
  const sum = $('[data-price-sum]');
  if (sum) sum.textContent = `Six months: $${(med.price * 6).toLocaleString('en-US')} in total. No dose surcharges, no shipping fees.`;
};

export const initMedication = () => {
  const source = $('[data-journey-data]');
  if (!source) return;
  state.data = JSON.parse(source.textContent);
  $$('[data-med]').forEach((button) =>
    button.addEventListener('click', () => {
      if (state.id === button.dataset.med) return;
      state.id = button.dataset.med;
      render();
      document.dispatchEvent(new CustomEvent('medication:change', { detail: currentMedication() }));
    }),
  );
  render();
};
