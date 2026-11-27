// Entry point. Everything here works without animation; the GSAP motion layer
// is a separate chunk, loaded after the page is idle and only when the visitor
// hasn't asked for reduced motion.
import { initRanges, reducedMotionQuery } from './lib/dom.js';
import { initPromo, initHeader, initAuroraPause, initSpotlight, openFromHash } from './features/chrome.js';
import { initMedication } from './features/medication.js';
import { initEstimate } from './features/estimate.js';
import { initFaqSearch } from './features/faq.js';
import { initOpenStatus, initContactForm } from './features/contact.js';
import { initQuiz } from './features/quiz.js';

let motionLoaded = false;
const loadMotion = () => {
  if (motionLoaded || reducedMotionQuery.matches) return;
  motionLoaded = true;
  const start = () =>
    import('./motion/index.js')
      .then((m) => m.initMotion())
      .catch((err) => {
        // Content is complete without motion; just make sure nothing stays hidden.
        document.documentElement.classList.remove('motion');
        console.warn('Motion layer failed to load', err);
      });
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1200 });
  else window.setTimeout(start, 250);
};

const boot = () => {
  initRanges();
  initPromo();
  initHeader();
  initAuroraPause();
  initSpotlight();
  initMedication();
  initEstimate();
  initFaqSearch();
  initOpenStatus();
  initContactForm();
  initQuiz();
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
  loadMotion();
  reducedMotionQuery.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('motion', !e.matches);
    if (!e.matches) loadMotion();
  });
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
