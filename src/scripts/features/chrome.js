import { $, $$, local } from '../lib/dom.js';

// Promo bar: dismissal is remembered per promo id. A pre-paint script in <head>
// hides it on later visits so it never flashes.
export const initPromo = () => {
  const bar = $('[data-promo]');
  if (!bar) return;
  $('[data-promo-close]', bar)?.addEventListener('click', () => {
    local.set(`promo-dismissed:${bar.dataset.promo}`, true);
    bar.hidden = true;
    document.documentElement.classList.add('promo-off');
    $('#main')?.focus({ preventScroll: true });
  });
};

// Header: solid once scrolled, hides on the way down and returns on the way up.
// It never hides while it holds focus or while the menu is open.
export const initHeader = () => {
  const header = $('[data-header]');
  if (!header) return;
  const toggle = $('[data-menu-toggle]', header);
  const menu = $('[data-menu]');
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    header.classList.toggle('is-scrolled', y > 24);
    const busy = header.contains(document.activeElement) || (menu && !menu.hidden);
    if (goingDown && y > 480 && !busy) header.classList.add('is-hidden');
    else if (goingUp || y < 480) header.classList.remove('is-hidden');
    if (goingDown || goingUp) lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();

  if (!toggle || !menu) return;
  const label = $('[data-menu-label]', toggle);
  const focusables = () => $$('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close menu' : 'Open menu';
    if (open) menu.style.top = `${Math.max(0, header.getBoundingClientRect().bottom)}px`;
    menu.hidden = !open;
    document.body.classList.toggle('is-locked', open);
    header.classList.toggle('is-menu-open', open);
    if (open) focusables()[0]?.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [toggle, ...focusables()];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) setOpen(false);
  });
};

// Aurora backgrounds drift with CSS; pause them when off screen to save battery.
export const initAuroraPause = () => {
  const auroras = $$('[data-aurora]');
  if (!auroras.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting));
  });
  auroras.forEach((a) => io.observe(a));
};

// Pointer-follow highlight on cards (desktop pointers only).
export const initSpotlight = () => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('[data-spotlight]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
};

// "Print or save as PDF" on legal pages.
export const initPrint = () => {
  $$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));
};

// Opens a <details> answer when the URL points at it.
export const openFromHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (target?.matches('details')) {
    target.open = true;
    target.classList.add('is-hit');
    target.querySelector('summary')?.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  }
};
