export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = () => reducedMotionQuery.matches;
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Storage can throw (private mode, blocked cookies). Features keep working for the visit.
const wrapStorage = (getArea) => ({
  get(key) {
    try {
      return JSON.parse(getArea().getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      getArea().setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  },
  remove(key) {
    try {
      getArea().removeItem(key);
    } catch {
      /* storage unavailable */
    }
  },
});
export const local = wrapStorage(() => window.localStorage);
export const session = wrapStorage(() => window.sessionStorage);

export const setRangeFill = (input) => {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  input.style.setProperty('--pct', `${((Number(input.value) - min) / (max - min)) * 100}%`);
};

export const initRanges = () => {
  $$('.range').forEach((input) => {
    setRangeFill(input);
    input.addEventListener('input', () => setRangeFill(input));
  });
};

export const fmtMg = (mg) => (mg === null || mg === undefined ? 'None yet' : `${mg} mg`);
