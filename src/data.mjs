// Single source of truth for prices, links and copy that repeats across pages.
// Change a value here and every page picks it up on the next build.

export const site = {
  name: 'Livbetr',
  legalName: 'Livbetr LLC',
  tagline: 'GLP-1 weight-loss care, priced honestly.',
  url: 'https://www.livbetr.com',
  intakeUrl: 'https://intake.livbetr.com',
  portalUrl: 'https://livbetr.eonpro.io',
  phone: '1-888-664-9435',
  phoneHref: 'tel:+18886649435',
  email: 'support@livbetr.com',
  address: { street: '66 W Flagler St', city: 'Miami', region: 'FL', zip: '33130' },
  supportHours: { days: 'Monday to Saturday', time: '9 a.m. to 10 p.m. ET', openDays: [1, 2, 3, 4, 5, 6], open: 9, close: 22, tz: 'America/New_York' },
  poisonControl: '1-800-222-1222',
  fdaMedWatch: '1-800-FDA-1088',
  trustpilot: {
    rating: 4.7,
    count: 1569,
    fiveStarShare: 89,
    url: 'https://www.trustpilot.com/review/startlivbetrhealth.com',
  },
  legitScriptUrl: 'https://www.legitscript.com/websites/?checker_keywords=livbetr.com',
  promo: {
    active: true,
    id: 'pre-black-friday-2026',
    name: 'Pre-Black Friday',
    discount: '$200 off for life',
  },
};

// Legal documents stay on the current site until legal signs off on new copy.
export const legalLinks = [
  { label: 'GLP-1 medication safety information', href: `${site.url}/glp-1-safety-information` },
  { label: 'Terms and conditions', href: `${site.url}/terms` },
  { label: 'Privacy policy', href: `${site.url}/privacy-policy` },
  { label: 'California privacy notice', href: `${site.url}/california-privacy-notice` },
  { label: 'Telehealth consent', href: `${site.url}/telehealth-consent` },
  { label: 'Refund and cancellation policy', href: `${site.url}/refund-policy` },
  { label: 'Consumer bill of rights', href: `${site.url}/consumer-bill-of-rights` },
];

// Example titration schedules (weekly injection). The clinician sets the real dose.
export const treatments = [
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    kind: 'Compounded GLP-1',
    price: 65,
    pitch: 'The easiest place to start.',
    bestFor: 'Best if you are new to GLP-1 medication',
    summary: 'Steady appetite control with consistent, gradual weight loss.',
    mechanism: 'Acts on one hormone pathway (GLP-1) that helps regulate appetite and blood sugar.',
    image: 'panel-semaglutide',
    doses: [
      { month: 1, mg: 0.25 },
      { month: 2, mg: 0.5 },
      { month: 3, mg: 1.0 },
      { month: 4, mg: 1.7 },
      { month: 5, mg: 2.4 },
      { month: 6, mg: 2.4 },
    ],
    points: [
      'A licensed clinician reviews your intake',
      'Dose adjusted as your body responds',
      'Same price at every dose',
      'Ships every 4 weeks, free',
    ],
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    kind: 'Compounded GLP-1/GIP',
    price: 110,
    pitch: 'Works two ways, not one.',
    bestFor: 'Best choice for most patients',
    summary: 'Stronger appetite control for faster, more significant weight loss.',
    mechanism: 'Acts on two hormone pathways (GLP-1 and GIP), so it works on appetite in two ways.',
    image: 'panel-tirzepatide',
    doses: [
      { month: 1, mg: 2.5 },
      { month: 2, mg: 5 },
      { month: 3, mg: 7.5 },
      { month: 4, mg: 10 },
      { month: 5, mg: 12.5 },
      { month: 6, mg: 15 },
    ],
    points: [
      'A licensed clinician reviews your intake',
      'Dose adjusted as your body responds',
      'Same price at every dose',
      'Ships every 4 weeks, free',
    ],
  },
];

export const included = [
  { icon: 'stethoscope', title: 'Clinician review and oversight', text: 'A board-certified U.S. clinician reviews your intake and adjusts your plan as you go.' },
  { icon: 'message', title: 'A 1:1 care coach', text: 'One person who knows your plan, for as long as you are on it.' },
  { icon: 'truck', title: 'Free, discreet delivery', text: 'Plain packaging to your door every 4 weeks. Refills arrive before you run out.' },
  { icon: 'refresh', title: 'Check-ins that adapt', text: 'Short check-ins track side effects and progress so your clinician can fine-tune your dose.' },
];

export const credentials = [
  { icon: 'shieldCheck', label: 'LegitScript certified', href: site.legitScriptUrl },
  { icon: 'stethoscope', label: 'Board-certified U.S. clinicians' },
  { icon: 'pharmacy', label: 'Licensed U.S. pharmacies' },
  { icon: 'lock', label: 'HIPAA-compliant' },
];

export const steps = [
  {
    title: 'Check your eligibility',
    text: 'Answer a few questions about your health and goals. It takes about 3 minutes, and same-day review slots are open.',
    detail: ['About 3 minutes', 'No insurance needed', 'No commitment'],
  },
  {
    title: 'A clinician builds your plan',
    text: 'A licensed U.S. clinician reviews your intake and decides whether medication is right for you, and which one.',
    detail: ['Reviewed by a licensed clinician', 'Personalized dose', 'Refund if not approved'],
  },
  {
    title: 'Medication arrives at your door',
    text: 'Your prescription is filled by a licensed U.S. pharmacy and shipped free, in plain packaging. No pharmacy lines or waiting rooms.',
    detail: ['Free shipping', 'Plain packaging', 'No pharmacy visits'],
  },
  {
    title: 'Refills arrive on time',
    text: 'Refills ship on schedule and arrive before your current supply runs out. Your coach checks in along the way.',
    detail: ['Ships every 4 weeks', 'Coach check-ins', 'Cancel anytime'],
  },
];

// Verbatim Trustpilot reviews, as published on the current site.
export const reviews = [
  {
    name: 'Lori Lappin-Keeley',
    date: '2026-09-03',
    title: 'She only released the call when I was satisfied',
    text: 'After several days of not being able to get into my account I was very frustrated. I finally contacted Marley by phone. She patiently walked me through resetting my account, only releasing the call when I was completely satisfied.',
  },
  {
    name: 'Justin Schiegg',
    date: '2026-09-03',
    title: 'Very helpful',
    text: 'I was assisted by Billy Green and he was very quick to assist with what I was messaging about. Answered all of my questions and made me feel prepared.',
  },
  {
    name: 'Marybeth Zimmerman',
    date: '2026-09-03',
    title: 'She was very patient with me',
    text: 'Hannah realized my problem right away and helped this old woman learn how to send pictures to you. She was very patient with me and I sure appreciated that.',
  },
];

export const faqCategories = [
  { id: 'start', label: 'Getting started' },
  { id: 'medication', label: 'Medication and safety' },
  { id: 'billing', label: 'Pricing and billing' },
  { id: 'delivery', label: 'Delivery and refills' },
  { id: 'account', label: 'Account and support' },
];

// `home: true` marks the questions repeated on the home page.
export const faqs = [
  {
    id: 'do-i-qualify', cat: 'start', home: true,
    q: 'Do I qualify?',
    a: 'You may qualify if your BMI is 30 or higher, or 27 or higher with a weight-related condition such as high blood pressure, type 2 diabetes or high cholesterol. You must be 18 or older. A licensed clinician makes the final decision after reviewing your intake. <a href="{root}eligibility/">Check your eligibility</a> in about 3 minutes.',
  },
  {
    id: 'how-long', cat: 'start',
    q: 'How long does it take to get started?',
    a: 'The eligibility check takes about 3 minutes and the full intake about 15. Same-day review slots are available, and a clinician reviews your answers before anything is prescribed.',
  },
  {
    id: 'states', cat: 'start', home: true,
    q: 'Which states do you serve?',
    a: 'We are expanding quickly. Your state is checked during sign-up, before you pay.',
  },
  {
    id: 'legit', cat: 'start', home: true,
    q: 'Is Livbetr legitimate?',
    a: 'Yes. Livbetr is <a href="' + site.legitScriptUrl + '" rel="noopener" target="_blank">LegitScript certified</a> and works only with licensed U.S. clinicians and accredited U.S. pharmacies. Livbetr is a technology and administrative platform: it does not practice medicine or dispense medication itself. Clinicians in our partner network make every prescribing decision.',
  },
  {
    id: 'insurance', cat: 'start',
    q: 'Do I need insurance?',
    a: 'No. Your monthly price covers your medication and clinician review, with or without insurance.',
  },
  {
    id: 'difference', cat: 'medication', home: true,
    q: 'What is the difference between semaglutide and tirzepatide?',
    a: 'Semaglutide acts on one hormone pathway (GLP-1) that helps regulate appetite and blood sugar. Tirzepatide acts on two (GLP-1 and GIP), so it works on appetite in two ways. Your clinician will recommend the one that fits your health history and goals.',
  },
  {
    id: 'fda', cat: 'medication',
    q: 'Are compounded medications FDA-approved?',
    a: 'No. Compounded semaglutide and tirzepatide are prepared by licensed pharmacies for individual patients and are not FDA-approved. The FDA does not review compounded drugs for safety, effectiveness or quality. Read our <a href="' + site.url + '/glp-1-safety-information" rel="noopener" target="_blank">GLP-1 safety information</a> before you start.',
  },
  {
    id: 'dosing', cat: 'medication', home: true,
    q: 'How does dosing work?',
    a: 'Most people start on a low dose that increases gradually as the body adjusts. Your clinician sets and adjusts your dose based on your progress and how you feel. Your monthly price stays the same at every dose.',
  },
  {
    id: 'side-effects', cat: 'medication',
    q: 'What side effects should I expect?',
    a: 'The most common side effects are nausea, diarrhea, constipation and reduced appetite, which often ease as your body adjusts. Serious side effects are rare but possible. Message your care team in the patient portal about any symptoms. In an emergency, call 911. For possible poisoning, call Poison Control at ' + site.poisonControl + '.',
  },
  {
    id: 'results', cat: 'medication', home: true,
    q: 'How fast will I see results?',
    a: 'Most members see results within the first few weeks. Weight loss is gradual and individual results vary. If progress stalls, your clinician reviews your plan and can adjust your treatment.',
  },
  {
    id: 'included', cat: 'billing', home: true,
    q: 'What is included in the monthly price?',
    a: 'Your medication, clinician review and ongoing oversight, a 1:1 care coach, check-ins, progress tracking and free delivery. There are no extra fees for dose increases.',
  },
  {
    id: 'price-change', cat: 'billing',
    q: 'Does my price go up when my dose goes up?',
    a: 'No. Semaglutide is $65 a month and tirzepatide is $110 a month at every dose, for as long as you stay on your plan.',
  },
  {
    id: 'when-charged', cat: 'billing',
    q: 'When am I charged?',
    a: 'Payment is collected at checkout, before your clinician review. Paying does not guarantee approval. If your clinician does not approve treatment, your full initial payment is refunded within seven business days.',
  },
  {
    id: 'cancel', cat: 'billing',
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel by email at <a href="mailto:' + site.email + '?subject=Cancel%20my%20plan">' + site.email + '</a>, in the patient portal or by phone at ' + site.phone + '. Cancellation takes effect when we receive it, and nobody will try to talk you out of it.',
  },
  {
    id: 'refunds', cat: 'billing',
    q: 'Can I get a refund?',
    a: 'Refunds are generally available until the pharmacy starts preparing your medication. Approved refunds are submitted within seven business days. See the full <a href="' + site.url + '/refund-policy" rel="noopener" target="_blank">refund and cancellation policy</a>.',
  },
  {
    id: 'shipping', cat: 'delivery',
    q: 'How is my medication shipped?',
    a: 'Free and discreet, in plain packaging, directly to your door. A new supply ships every 4 weeks.',
  },
  {
    id: 'damaged', cat: 'delivery',
    q: 'What if my delivery is late, missing or damaged?',
    a: 'Tell us within seven calendar days of the expected delivery date and we will make it right. Call ' + site.phone + ' or email ' + site.email + '. Prescription medication cannot be returned for resale.',
  },
  {
    id: 'refills', cat: 'delivery',
    q: 'How do refills work?',
    a: 'Refills ship automatically on schedule and are timed to arrive before your current supply runs out. You can change or cancel your plan at any time.',
  },
  {
    id: 'sign-in', cat: 'account',
    q: 'How do I sign in?',
    a: 'Sign in to the <a href="' + site.portalUrl + '" rel="noopener" target="_blank">patient portal</a> with the email you used at sign-up. If you are locked out, call us and we will walk you through it.',
  },
  {
    id: 'contact', cat: 'account',
    q: 'How do I contact Livbetr?',
    a: 'For billing, orders and account help, call ' + site.phone + ' (' + 'Monday to Saturday, 9 a.m. to 10 p.m. ET' + ') or email ' + site.email + '. For questions about your medication, message your clinical care team in the patient portal.',
  },
  {
    id: 'after-paying', cat: 'account',
    q: 'I have paid. What happens next?',
    a: 'A licensed clinician reviews your intake. If treatment is approved, the pharmacy prepares your medication and ships it to you. If it is not approved, your payment is refunded in full.',
  },
];

export const usStates = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'],
  ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'],
  ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'],
  ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'],
  ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
  ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
  ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

// The six-month story on the home page. Index 0 is day one; index n is month n.
// It describes the process only, never an outcome.
export const journey = [
  { label: 'Day 1', title: 'Check and review', text: 'A 3-minute eligibility check, then a licensed clinician reviews your answers. Same-day slots.' },
  { label: 'Month 1', title: 'Starting dose', text: 'Your first box arrives in plain packaging. Your coach checks in during week one.' },
  { label: 'Month 2', title: 'First step up', text: 'Check-ins show how you feel. Your clinician raises the dose when you’re ready.' },
  { label: 'Month 3', title: 'Settling in', text: 'Your refill ships before you run out. Questions go to your care team, one message away.' },
  { label: 'Month 4', title: 'Adjusting', text: 'The dose changes again if your clinician says so. The price doesn’t.' },
  { label: 'Month 5', title: 'Habits', text: 'Your coach helps with the routines that make the change stick.' },
  { label: 'Month 6', title: 'Six months in', text: 'Same plan, same team, and the same price you started with.' },
];

// Weekly dose for a journey step: none on day one, then the example schedule.
export const doseFor = (treatment, step) => (step === 0 ? null : treatment.doses[step - 1].mg);

export const intakeHref = (treatment) => {
  const params = new URLSearchParams({ utm_source: 'website' });
  if (treatment) params.set('treatment', treatment);
  return `${site.intakeUrl}/?${params}`;
};
