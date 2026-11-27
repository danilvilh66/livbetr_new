import { faqs } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero, stepsSection, sectionHead, includedList, credentialRow, faqSection, faqSchema, finalCta } from '../components.mjs';

export const meta = {
  path: 'how-it-works/',
  title: 'How it works',
  description: 'How Livbetr GLP-1 care works: a 3-minute eligibility check, review by a licensed U.S. clinician, free discreet delivery from a licensed pharmacy, and refills that arrive on time.',
  active: 'how',
};

const roles = [
  { icon: 'user', who: 'Livbetr', does: 'Runs the platform you use: the eligibility check, your patient portal, billing, delivery coordination and your 1:1 care coach.' },
  { icon: 'stethoscope', who: 'Licensed U.S. clinicians', does: 'Independent clinicians in our partner network review your health history and decide whether a prescription is right for you, and at what dose.' },
  { icon: 'pharmacy', who: 'Licensed U.S. pharmacies', does: 'Accredited pharmacies prepare your compounded medication and ship it to you. The pharmacy is named on your medication label.' },
];

export const render = (root) => {
  const start = faqs.filter((f) => f.cat === 'start' || f.id === 'dosing');
  const body = `
${pageHero({
  title: 'From first question to your door',
  lead: 'Four steps, no waiting rooms. Here is exactly what happens after you start, and who does what.',
  extra: `<div class="btn-row"><a class="btn btn--gold btn--lg" href="${root}eligibility/">Check my eligibility</a><a class="btn btn--line btn--lg" href="${root}pricing/">See pricing</a></div>`,
})}

${stepsSection({ id: 'steps-title', title: 'The four steps', lead: 'Each step, and how long it takes.', withLink: false, root })}

<div class="wrap creds-wrap">${credentialRow()}</div>

<section class="section" aria-labelledby="roles-title">
  <div class="wrap">
    ${sectionHead({ id: 'roles-title', title: 'Who does what', lead: 'Telehealth works best when you know who is responsible for each part of your care.' })}
    <ul class="roles">${roles.map((r) => `<li class="role glass" data-reveal="up" data-spotlight><span class="role__icon">${icon(r.icon, { size: 22 })}</span><h3>${r.who}</h3><p>${r.does}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="section section--raised" aria-labelledby="ongoing-title">
  <div class="wrap">
    ${sectionHead({ id: 'ongoing-title', title: 'Care that keeps going', lead: 'Your plan adapts as you do. Here is what stays with you every month.' })}
    ${includedList()}
  </div>
</section>

${faqSection(root, start, { id: 'start-faq-title', title: 'Before you start', lead: `Questions about safety or side effects? Message your care team in the <a href="${root}login/">patient portal</a>.` })}

${finalCta(root)}
`;
  return { body, schema: faqSchema(start) };
};
