import { site, usStates, treatments, intakeHref } from '../data.mjs';
import { icon } from '../icons.mjs';

export const meta = {
  path: 'eligibility/',
  title: 'Check your eligibility for GLP-1 medication',
  description: 'Answer six short questions to see if GLP-1 weight-loss medication may be right for you. Takes about 3 minutes. Your answers stay on your device.',
  active: 'eligibility',
};

const radioCard = (name, value, label, hint = '') =>
  `<label class="option"><input type="radio" name="${name}" value="${value}" required><span class="option__box"><span class="option__label">${label}</span>${hint ? `<span class="option__hint">${hint}</span>` : ''}</span></label>`;

const checkCard = (name, value, label, { exclusive = false } = {}) =>
  `<label class="option option--check"><input type="checkbox" name="${name}" value="${value}"${exclusive ? ' data-exclusive' : ''}><span class="option__box"><span class="option__tick" aria-hidden="true">${icon('check', { size: 14 })}</span><span class="option__label">${label}</span></span></label>`;

const stepShell = (id, n, question, help, inner) => `<fieldset class="quiz__step" data-step="${id}" aria-describedby="q-${id}-help"${n === 1 ? '' : ' hidden'}>
  <legend class="quiz__q" tabindex="-1">${question}</legend>
  <p class="quiz__help" id="q-${id}-help">${help}</p>
  ${inner}
  <p class="field__error" id="q-${id}-err" role="alert" hidden></p>
</fieldset>`;

export const render = (root) => {
  const steps = [
    stepShell('goal', 1, 'How much weight would you like to lose?', 'This helps your clinician understand your goals. There are no wrong answers.',
      `<div class="options options--2">
        ${radioCard('goal', 'up-to-20', '1 to 20 lb')}
        ${radioCard('goal', '21-50', '21 to 50 lb')}
        ${radioCard('goal', '51-plus', 'More than 50 lb')}
        ${radioCard('goal', 'unsure', 'I&rsquo;m not sure yet')}
      </div>`),
    stepShell('state', 2, 'Which state do you live in?', 'We confirm that treatment is available in your state before you pay.',
      `<div class="field">
        <label for="q-state" class="visually-hidden">State</label>
        <div class="select select--lg">
          <select id="q-state" name="state" required autocomplete="address-level1" aria-describedby="q-state-err">
            <option value="">Choose your state</option>
            ${usStates.map(([c, n]) => `<option value="${c}">${n}</option>`).join('')}
          </select>
          ${icon('chevronDown', { size: 18 })}
        </div>
      </div>`),
    stepShell('age', 3, 'How old are you?', 'GLP-1 treatment through Livbetr is for adults 18 and older.',
      `<div class="field field--narrow">
        <label for="q-age">Age in years</label>
        <input id="q-age" name="age" type="number" inputmode="numeric" min="1" max="120" required aria-describedby="q-age-err">
      </div>`),
    stepShell('body', 4, 'What is your height and weight?', 'We use these to calculate your body mass index (BMI), one of the criteria clinicians use.',
      `<fieldset class="units units--quiz">
        <legend class="visually-hidden">Units</legend>
        <label><input type="radio" name="units" value="us" checked> ft, in, lb</label>
        <label><input type="radio" name="units" value="metric"> cm, kg</label>
      </fieldset>
      <div class="form__row form__row--3" data-units="us">
        <div class="field"><label for="q-ft">Feet</label><input id="q-ft" name="ft" type="number" inputmode="numeric" min="4" max="7"></div>
        <div class="field"><label for="q-in">Inches</label><input id="q-in" name="in" type="number" inputmode="numeric" min="0" max="11"></div>
        <div class="field"><label for="q-lb">Weight (lb)</label><input id="q-lb" name="lb" type="number" inputmode="numeric" min="70" max="700"></div>
      </div>
      <div class="form__row form__row--2" data-units="metric" hidden>
        <div class="field"><label for="q-cm">Height (cm)</label><input id="q-cm" name="cm" type="number" inputmode="numeric" min="120" max="230"></div>
        <div class="field"><label for="q-kg">Weight (kg)</label><input id="q-kg" name="kg" type="number" inputmode="numeric" min="32" max="320"></div>
      </div>
      <div class="bmi" aria-live="polite" data-bmi hidden>
        <p class="bmi__value">Your BMI: <strong data-bmi-value>0</strong></p>
        <div class="bmi__scale" aria-hidden="true"><span class="bmi__marker" data-bmi-marker></span></div>
        <div class="bmi__ticks" aria-hidden="true"><span>18.5</span><span>25</span><span>30</span><span>40</span></div>
      </div>`),
    stepShell('conditions', 5, 'Do you have any of these conditions?', 'Weight-related conditions can make you eligible at a lower BMI. Select all that apply.',
      `<div class="options">
        ${checkCard('conditions', 'blood-pressure', 'High blood pressure')}
        ${checkCard('conditions', 'type-2-diabetes', 'Type 2 diabetes or prediabetes')}
        ${checkCard('conditions', 'cholesterol', 'High cholesterol')}
        ${checkCard('conditions', 'sleep-apnea', 'Sleep apnea')}
        ${checkCard('conditions', 'heart', 'Heart disease')}
        ${checkCard('conditions', 'none', 'None of these', { exclusive: true })}
      </div>`),
    stepShell('safety', 6, 'Do any of these apply to you?', 'These help us flag anything your clinician needs to know. Select all that apply.',
      `<div class="options">
        ${checkCard('safety', 'mtc', 'Personal or family history of medullary thyroid cancer')}
        ${checkCard('safety', 'men2', 'Multiple endocrine neoplasia type 2 (MEN 2)')}
        ${checkCard('safety', 'pregnant', 'Pregnant, breastfeeding or trying to get pregnant')}
        ${checkCard('safety', 'pancreatitis', 'History of pancreatitis')}
        ${checkCard('safety', 'type-1-diabetes', 'Type 1 diabetes')}
        ${checkCard('safety', 'none', 'None of these', { exclusive: true })}
      </div>`),
  ];

  const planData = JSON.stringify(
    Object.fromEntries(treatments.map((t) => [t.id, { name: t.name, price: t.price, kind: t.kind, pitch: t.pitch, href: intakeHref(t.id) }])),
  );

  const body = `
<section class="quiz-page">
  <div class="container quiz-page__grid">
    <div class="quiz-page__intro">
      <h1 class="display-2">See if GLP-1 medication could be right for you</h1>
      <p class="lead">Six short questions, about 3 minutes. A licensed clinician makes the final decision after your full intake.</p>
      <ul class="quiz-page__notes">
        <li>${icon('lock', { size: 18 })}<span><strong>Your answers stay on this device.</strong> Nothing is sent until you choose to start your secure intake.</span></li>
        <li>${icon('tag', { size: 18 })}<span>Semaglutide $${treatments[0].price}/mo or tirzepatide $${treatments[1].price}/mo, the same price at every dose.</span></li>
        <li>${icon('phone', { size: 18 })}<span>Prefer to talk? Call <a href="${site.phoneHref}">${site.phone}</a></span></li>
      </ul>
    </div>
    <div class="quiz card" data-quiz>
      <div class="quiz__top">
        <p class="quiz__count" data-step-count>Question 1 of ${steps.length}</p>
        <div class="progress" role="progressbar" aria-label="Eligibility check progress" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="1" data-progress><span style="width:${100 / steps.length}%"></span></div>
      </div>
      <form class="quiz__form" novalidate data-quiz-form>
        ${steps.join('\n')}
        <div class="quiz__nav">
          <button class="btn btn--ghost" type="button" data-quiz-back hidden>${icon('arrowLeft', { size: 18 })} Back</button>
          <button class="btn btn--primary btn--lg" type="submit" data-quiz-next>Continue</button>
        </div>
      </form>
      <div class="quiz__result" data-quiz-result hidden tabindex="-1"></div>
    </div>
  </div>
  <script type="application/json" data-plans>${planData}</script>
</section>
`;
  return { body, bodyClass: 'page-quiz' };
};
