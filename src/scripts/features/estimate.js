import { $, $$, setRangeFill } from '../lib/dom.js';

const LB_PER_KG = 2.20462;
const LIMITS = { lb: [140, 400], kg: [64, 181] };

// "What could 15% mean for you": slider and number box stay in sync, in lb or kg.
export const initEstimate = () => {
  const root = $('[data-estimate]');
  if (!root) return;
  const range = $('[data-weight-range]', root);
  const number = $('[data-weight-number]', root);
  const lossOut = $('[data-out="loss"]', root);
  const goalOut = $('[data-out="goal"]', root);
  const rangeText = $('[data-range-text]', root);
  let unit = 'lb';

  const clamp = (v, [min, max]) => Math.min(max, Math.max(min, v));
  const update = (value, source) => {
    const v = clamp(Math.round(value), LIMITS[unit]);
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
    const [min, max] = LIMITS[unit];
    const ok = v >= min && v <= max;
    number.setAttribute('aria-invalid', String(!ok));
    if (ok) update(v, number);
  });
  number.addEventListener('change', () => {
    number.removeAttribute('aria-invalid');
    update(Number(number.value) || LIMITS[unit][0], null);
  });
  $$('[data-unit]', root).forEach((radio) =>
    radio.addEventListener('change', () => {
      if (radio.value === unit) return;
      const current = Number(range.value);
      const converted = radio.value === 'kg' ? current / LB_PER_KG : current * LB_PER_KG;
      unit = radio.value;
      const [min, max] = LIMITS[unit];
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
