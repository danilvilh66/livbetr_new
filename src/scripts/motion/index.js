// Motion layer (GSAP + ScrollTrigger + SplitText). Loaded lazily by main.js.
// Rules this module follows:
// - Every effect lives inside gsap.matchMedia, so switching on "reduce motion"
//   reverts tweens, pins, splits and the classes we add, and the static layouts return.
// - Only transform and opacity animate. Scrubbed tweens use ease "none".
// - Nothing is hidden before this module runs, so content never depends on it.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, finePointer, fmtMg } from '../lib/dom.js';
import { currentMedication } from '../features/medication.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE_OUT = 'power4.out';
const DESKTOP = '(min-width: 961px)';

// Section headings: lines rise out of a mask as they enter.
const revealHeadings = () => {
  const splits = $$('[data-reveal="lines"]').map((el) =>
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1,
          ease: EASE_OUT,
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 40%', once: true },
        }),
    }),
  );
  return () => splits.forEach((s) => s.revert());
};

// Blocks fade up in batches. Opacity only (never visibility), so keyboard users can
// still tab into anything that hasn't animated yet; focusing it reveals it at once.
const revealBlocks = () => {
  const items = $$('[data-reveal="up"]');
  if (!items.length) return () => {};
  gsap.set(items, { opacity: 0, y: 36 });
  const triggers = ScrollTrigger.batch(items, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });
  const onFocus = (e) => {
    const el = e.target.closest('[data-reveal="up"]');
    if (el) gsap.to(el, { opacity: 1, y: 0, duration: 0.2, overwrite: true });
  };
  document.addEventListener('focusin', onFocus);
  return () => {
    document.removeEventListener('focusin', onFocus);
    triggers.forEach((t) => t.kill());
    gsap.set(items, { clearProps: 'opacity,transform' });
  };
};

// Hero: the portrait drifts slower than the type as the page scrolls away.
const heroParallax = () => {
  const hero = $('[data-hero]');
  if (!hero) return;
  gsap.to('[data-hero-person]', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } });
  gsap.to('.hero__title', { yPercent: -18, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } });
};

// The six-month story: pinned stage, an odometer for the month, crossfading captions,
// a dose ring, and the fixed price pill that never changes.
const journey = ({ desktop }) => {
  const section = $('[data-journey]');
  if (!section) return () => {};
  const stage = $('[data-journey-stage]', section);
  const strip = $('[data-odometer]', stage);
  const captions = $$('[data-caption]', stage);
  const ticks = $$('[data-tick]', stage);
  const ring = $('[data-ring]', stage);
  const doseOut = $('[data-stage-dose]', stage);
  const hud = $('[data-hud]');
  const hudMonth = $('[data-hud-month]');
  const hudBar = $('[data-hud-bar]');
  const last = captions.length - 1;
  let step = -1;

  section.classList.add('is-live');
  gsap.set(captions, { autoAlpha: 0, y: 28 });
  gsap.set(captions[0], { autoAlpha: 1, y: 0 });

  const showDose = () => {
    const med = currentMedication();
    const mg = med.doses[step];
    const max = Math.max(...med.doses.filter((d) => d !== null));
    doseOut.textContent = fmtMg(mg);
    gsap.to(ring, { strokeDashoffset: 100 - ((mg ?? 0) / max) * 100, duration: 0.6, ease: 'power2.out', overwrite: true });
  };
  const setStep = (i) => {
    if (i === step) return;
    step = i;
    ticks.forEach((t, n) => {
      t.classList.toggle('is-active', n === i);
      t.classList.toggle('is-past', n < i);
    });
    if (hudMonth) hudMonth.textContent = i === 0 ? 'Day 1' : `Month ${i}`;
    showDose();
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: () => `+=${window.innerHeight * (desktop ? 4.4 : 3.6)}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Settle on the next month in the direction of travel, one step at a time.
      snap: { snapTo: 'labelsDirectional', duration: { min: 0.25, max: 0.7 }, delay: 0.1, ease: 'power2.inOut' },
      onUpdate: (self) => {
        setStep(Math.round(self.progress * last));
        if (hudBar) hudBar.style.transform = `scaleX(${self.progress})`;
      },
    },
  });
  tl.addLabel('s0');
  for (let i = 1; i <= last; i++) {
    const at = `s${i - 1}`;
    tl.to(strip, { yPercent: -(100 / captions.length) * i, duration: 1 }, at)
      .to(captions[i - 1], { autoAlpha: 0, y: -28, duration: 0.35 }, `${at}+=0.1`)
      .fromTo(captions[i], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.35 }, `${at}+=0.55`)
      .addLabel(`s${i}`);
  }
  setStep(0);

  // Price pill: on while the story plays; the price scene that follows takes over.
  const storyToggle = ScrollTrigger.create({
    trigger: stage,
    start: 'top 60%',
    end: () => `+=${window.innerHeight * (desktop ? 4.4 : 3.6) + window.innerHeight * 0.1}`,
    invalidateOnRefresh: true,
    onToggle: (s) => hud?.classList.toggle('is-on', s.isActive),
  });

  const onMed = () => showDose();
  document.addEventListener('medication:change', onMed);
  return () => {
    document.removeEventListener('medication:change', onMed);
    storyToggle.kill();
    hud?.classList.remove('is-on');
    section.classList.remove('is-live');
  };
};

// "What stayed the same": the giant price settles in, the six months line up.
const priceScene = () => {
  const scene = $('[data-price-scene]');
  if (!scene) return;
  gsap.fromTo($('[data-price-giant]', scene), { scale: 0.72 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: scene, start: 'top 85%', end: 'center 55%', scrub: 0.6 } });
  gsap.from($$('[data-price-months] li', scene), { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: scene, start: 'center 75%', once: true } });
};

// How it works: on desktop the four cards travel sideways while the section is pinned.
const horizontalSteps = () => {
  const cleanups = $$('[data-steps]').map((section) => {
    const pin = $('.steps-section__pin', section);
    const track = $('[data-steps-track]', section);
    const bar = $('[data-steps-progress]', section);
    section.classList.add('is-horizontal');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (s) => bar && (bar.style.transform = `scaleX(${s.progress})`),
      },
    });
    return () => section.classList.remove('is-horizontal');
  });
  return () => cleanups.forEach((c) => c());
};

const parallaxMedia = () => {
  $$('[data-parallax]').forEach((el) => {
    gsap.fromTo($('img', el), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });
};

// Numbers count up once, keeping their final width (tabular numerals).
const counters = () => {
  $$('[data-count-to]').forEach((el) => {
    const to = Number(el.dataset.countTo);
    const decimals = Number(el.dataset.countDecimals || 0);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: to,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = obj.v.toFixed(decimals)),
      onComplete: () => (el.textContent = to.toFixed(decimals)),
    });
  });
};

// Primary buttons lean toward a fine pointer. Subtle, and off for touch.
const magnetic = () => {
  if (!finePointer()) return () => {};
  const handlers = $$('[data-magnetic]').map((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
    const move = (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    btn.addEventListener('pointermove', move);
    btn.addEventListener('pointerleave', leave);
    return () => {
      btn.removeEventListener('pointermove', move);
      btn.removeEventListener('pointerleave', leave);
      gsap.set(btn, { clearProps: 'transform' });
    };
  });
  return () => handlers.forEach((h) => h());
};

export const initMotion = async () => {
  ScrollTrigger.config({ ignoreMobileResize: true });
  // SplitText measures lines, so wait for the web fonts.
  await document.fonts?.ready;
  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: DESKTOP }, (ctx) => {
    const { motion, desktop } = ctx.conditions;
    if (!motion) return undefined;
    const cleanups = [revealHeadings(), revealBlocks(), journey({ desktop }), magnetic()];
    heroParallax();
    priceScene();
    parallaxMedia();
    counters();
    if (desktop) cleanups.push(horizontalSteps());
    document.documentElement.classList.add('motion-ready');
    return () => {
      cleanups.forEach((c) => c?.());
      document.documentElement.classList.remove('motion-ready');
    };
  });
  // Late layout changes (images, fonts) move pin positions.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
};
