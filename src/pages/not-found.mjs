import { site } from '../data.mjs';
import { aurora } from '../components.mjs';
import { splitWords } from '../layout.mjs';

export const meta = {
  path: '404.html',
  title: 'Page not found',
  description: 'This page could not be found.',
  active: '',
  noindex: true,
};

export const render = (root) => ({
  bodyClass: 'page-404',
  body: `<section class="page-hero page-hero--404">
  ${aurora('aurora--hero')}
  <div class="wrap page-hero__inner">
    <p class="big-404" aria-hidden="true">404</p>
    <h1 class="display-1 hero-split">${splitWords('This page isn’t here')}</h1>
    <p class="lead page-hero__lead">The link may be old or mistyped. These pages can help you get where you were going.</p>
    <div class="btn-row">
      <a class="btn btn--gold btn--lg" href="${root}">Go to the home page</a>
      <a class="btn btn--line btn--lg" href="${root}eligibility/">Check my eligibility</a>
    </div>
    <ul class="links-404">
      <li><a href="${root}pricing/">Pricing</a></li>
      <li><a href="${root}how-it-works/">How it works</a></li>
      <li><a href="${root}faq/">FAQ</a></li>
      <li><a href="${root}contact/">Contact</a></li>
      <li><a href="${site.portalUrl}" rel="noopener">Patient portal</a></li>
    </ul>
  </div>
</section>`,
});
