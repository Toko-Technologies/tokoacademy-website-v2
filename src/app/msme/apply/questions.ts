/**
 * The MSME application form: every section, question and option, in order.
 *
 * GENERATED from the original apply/index.html (tokopage.zip) so that every
 * Google Forms field ID and option value is copied exactly, not retyped.
 *
 * These IDs are the Google Form's own. If a question or option is added,
 * removed or reworded in Google Forms, this file must change to match,
 * otherwise that answer is silently dropped by Google.
 */

export const FORM_ID = "1FAIpQLSdmLg5bizkmr5XeWj8UGV8qrWO_yvePO4XUMjlpKLupREwcnA";
export const SUBMIT_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;
export const GOOGLE_FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/viewform`;

export type Option = {
  /** Sent to Google exactly as written. */
  value: string;
  /** Shown to the applicant, when it differs from the value. */
  label?: string;
  /** The Google Forms "Other" choice; its text goes in entry.<id>.other_option_response. */
  other?: boolean;
  /** Ticking this clears the other boxes, and ticking another clears it. */
  exclusive?: boolean;
  strong?: boolean;
};

export type TextField = {
  type: 'text' | 'tel' | 'email' | 'textarea';
  maxLength: number;
  rows?: number;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  placeholder?: string;
  /** Strip spaces, dashes, dots and brackets before validating and sending. */
  phone?: boolean;
  pattern?: string;
  patternMsg?: string;
};

type Base = {
  /** Google Forms entry ID, without the "entry." prefix. */
  id: string;
  num?: number;
  label: string;
  help?: string;
  /** Only asked when another question has one of these answers. */
  showWhen?: { field: string; values: string[] };
};

type Choice = {
  /** Lay the options out in columns rather than one per line. */
  grid: boolean;
  /** "Choose up to N". */
  max?: number;
  /** Text shown above the options (the declaration). */
  declaration?: string;
  options: Option[];
};

export type Question =
  | (Base & { kind: 'text'; field: TextField; noEmail?: { name: string; value: string } })
  | (Base & Choice & { kind: 'radio' })
  | (Base & Choice & { kind: 'checkbox' })
  | (Base & { kind: 'date' });

export type ChoiceQuestion = Extract<Question, { kind: 'radio' | 'checkbox' }>;

export type Section = {
  sec: string;
  short: string;
  eyebrow: string;
  title: string;
  desc?: string;
  questions: Question[];
};

export const SECTIONS: Section[] = [
  {
    eyebrow: 'Section A of F',
    title: 'About you',
    sec: 'Section A',
    short: 'About you',
    questions: [
      {
        id: '121249134',
        kind: 'text',
        label: 'Full name',
        num: 1,
        field: { type: 'text', maxLength: 120, autoComplete: 'name' },
      },
      {
        id: '942581385',
        kind: 'text',
        label: 'Phone number (WhatsApp preferred)',
        num: 2,
        help: 'Example: 08012345678 or +2348012345678',
        field: { type: 'tel', maxLength: 16, inputMode: 'tel', autoComplete: 'tel', placeholder: '08012345678', phone: true, pattern: '^(\\+234|234|0)[0-9]{10}$', patternMsg: 'Enter a valid Nigerian phone number, e.g. 08012345678 or +2348012345678' },
      },
      {
        id: '796740396',
        kind: 'text',
        label: 'Email address',
        num: 3,
        help: 'We will use this to contact you. No email address? Tick the box below instead.',
        field: { type: 'email', maxLength: 120, inputMode: 'email', autoComplete: 'email', patternMsg: 'Enter a valid email address' },
        noEmail: { name: 'entry.273927065', value: 'I do not have an email address' },
      },
      {
        id: '105501503',
        kind: 'radio',
        label: 'Sex',
        num: 4,
        grid: true,
        options: [
          { value: 'Male' },
          { value: 'Female' },
        ],
      },
      {
        id: '1086782292',
        kind: 'radio',
        label: 'Age',
        num: 5,
        grid: true,
        options: [
          { value: '18 to 24' },
          { value: '25 to 35' },
          { value: '36 to 45' },
          { value: '46 to 60' },
          { value: 'Above 60' },
        ],
      },
      {
        id: '980544936',
        kind: 'radio',
        label: 'Highest level of education',
        num: 6,
        grid: true,
        options: [
          { value: 'No formal education' },
          { value: 'Primary school' },
          { value: 'Secondary school (SSCE)' },
          { value: 'OND / NCE / Diploma' },
          { value: 'HND / Bachelor’s degree' },
          { value: 'Postgraduate' },
        ],
      },
      {
        id: '1523577768',
        kind: 'checkbox',
        label: 'Languages you are comfortable learning in',
        num: 7,
        help: 'Tick all that apply.',
        grid: true,
        options: [
          { value: 'English' },
          { value: 'Hausa' },
          { value: 'Fulfulde' },
          { value: '__other_option__', label: 'Other', other: true },
        ],
      },
      {
        id: '1420468381',
        kind: 'checkbox',
        label: 'Do any of these apply to you?',
        num: 8,
        help: 'Tick all that apply. Used only for programme reporting.',
        grid: false,
        options: [
          { value: 'Person living with a disability' },
          { value: 'Internally displaced person (IDP)' },
          { value: 'Returning migrant' },
          { value: 'None of these', exclusive: true },
          { value: 'Prefer not to say', exclusive: true },
        ],
      },
    ],
  },
  {
    eyebrow: 'Section B of F',
    title: 'Eligibility',
    desc: 'These questions confirm that you meet the conditions for this training.',
    sec: 'Section B',
    short: 'Eligibility',
    questions: [
      {
        id: '1687073687',
        kind: 'text',
        label: 'Business name',
        num: 9,
        field: { type: 'text', maxLength: 150, autoComplete: 'organization' },
      },
      {
        id: '970623196',
        kind: 'radio',
        label: 'In which Local Government Area is the business located?',
        num: 10,
        grid: true,
        options: [
          { value: 'Yola North' },
          { value: 'Yola South' },
          { value: '__other_option__', label: 'Other', other: true },
        ],
      },
      {
        id: '96892339',
        kind: 'text',
        label: 'Business address (street, area or ward)',
        num: 11,
        field: { type: 'textarea', maxLength: 1000, rows: 3, autoComplete: 'street-address' },
      },
      {
        id: '497124056',
        kind: 'radio',
        label: 'How long has the business been operating?',
        num: 12,
        grid: true,
        options: [
          { value: 'Less than 1 year' },
          { value: '1 to 2 years' },
          { value: '3 to 5 years' },
          { value: '6 to 10 years' },
          { value: 'More than 10 years' },
        ],
      },
      {
        id: '1303568501',
        kind: 'radio',
        label: 'What is your role in the business?',
        num: 13,
        grid: false,
        options: [
          { value: 'Sole owner' },
          { value: 'Co-owner or partner' },
          { value: 'Manager or staff (not an owner)' },
          { value: 'Family member helping out' },
        ],
      },
      {
        id: '1346572288',
        kind: 'radio',
        label: 'Which best describes the business right now?',
        num: 14,
        grid: false,
        options: [
          { value: 'Operating regularly' },
          { value: 'Operating, but seasonal or irregular' },
          { value: 'Temporarily closed or paused' },
          { value: 'Not started yet; I have a business idea' },
          { value: 'I do not have a business; I am still deciding between a job and a business' },
        ],
      },
      {
        id: '1366010874',
        kind: 'radio',
        label: 'Week 1 is physical training in Yola. Can you attend all the in-person days?',
        num: 15,
        grid: true,
        options: [
          { value: 'Yes, all days' },
          { value: 'Some days only' },
          { value: 'No' },
        ],
      },
      {
        id: '420721125',
        kind: 'checkbox',
        label: 'Week 2 is virtual. What can you use to join online sessions?',
        num: 16,
        help: 'Tick all that apply.',
        grid: true,
        options: [
          { value: 'Smartphone with internet data' },
          { value: 'Laptop or desktop computer' },
          { value: 'Neither', exclusive: true },
        ],
      },
    ],
  },
  {
    eyebrow: 'Section C of F',
    title: 'Business profile',
    sec: 'Section C',
    short: 'Business profile',
    questions: [
      {
        id: '694846804',
        kind: 'text',
        label: 'What does the business sell or do? Name the main products or services.',
        num: 17,
        field: { type: 'textarea', maxLength: 1000, rows: 3 },
      },
      {
        id: '153985599',
        kind: 'radio',
        label: 'Main sector',
        num: 18,
        help: 'Tick one.',
        grid: false,
        options: [
          { value: 'Crop farming' },
          { value: 'Livestock, poultry or fish' },
          { value: 'Agro-processing (e.g. rice milling, groundnut oil, grain)' },
          { value: 'Food, drinks or restaurant' },
          { value: 'Trading, retail or wholesale' },
          { value: 'Fashion, tailoring or textiles' },
          { value: 'Beauty and personal care' },
          { value: 'Crafts, manufacturing or fabrication' },
          { value: 'ICT or digital services' },
          { value: 'Repairs or technical services' },
          { value: 'Transport or logistics' },
          { value: '__other_option__', label: 'Other', other: true },
        ],
      },
      {
        id: '932979155',
        kind: 'radio',
        label: 'Is the business registered with the Corporate Affairs Commission (CAC)?',
        num: 19,
        grid: false,
        options: [
          { value: 'Not registered' },
          { value: 'Registration in progress' },
          { value: 'Yes, as a Business Name (enterprise)' },
          { value: 'Yes, as a Limited Liability Company (Ltd)' },
        ],
      },
      {
        id: '228549635',
        kind: 'text',
        label: 'If registered, in what year?',
        num: 20,
        help: 'Year of registration, e.g. 2019.',
        showWhen: { field: 'entry.932979155', values: ['Yes, as a Business Name (enterprise)', 'Yes, as a Limited Liability Company (Ltd)'] },
        field: { type: 'text', maxLength: 4, inputMode: 'numeric', placeholder: '2019', pattern: '^(19|20)[0-9]{2}$', patternMsg: 'Enter a 4-digit year, e.g. 2019' },
      },
      {
        id: '676509255',
        kind: 'text',
        label: 'RC / BN number',
        num: 21,
        showWhen: { field: 'entry.932979155', values: ['Yes, as a Business Name (enterprise)', 'Yes, as a Limited Liability Company (Ltd)'] },
        field: { type: 'text', maxLength: 30, autoComplete: 'off' },
      },
      {
        id: '229359235',
        kind: 'checkbox',
        label: 'Which other registrations or memberships does the business have?',
        num: 22,
        help: 'Tick all that apply.',
        grid: false,
        options: [
          { value: 'Tax Identification Number (TIN)' },
          { value: 'State or LGA business permit / levy' },
          { value: 'NAFDAC' },
          { value: 'SON' },
          { value: 'SMEDAN registration' },
          { value: 'Trade association or cooperative' },
          { value: 'None of these', exclusive: true },
        ],
      },
      {
        id: '323579046',
        kind: 'radio',
        label: 'How does the business handle its money in the bank?',
        num: 23,
        grid: false,
        options: [
          { value: 'The business has no bank account' },
          { value: 'I use my personal account for business transactions' },
          { value: 'The business has its own account, but it is rarely used' },
          { value: 'The business has its own account and uses it for most transactions' },
        ],
      },
      {
        id: '1443051856',
        kind: 'radio',
        label: 'Apart from you, how many people work in the business?',
        num: 24,
        grid: true,
        options: [
          { value: 'None' },
          { value: '1 to 2' },
          { value: '3 to 5' },
          { value: '6 to 9' },
          { value: '10 or more' },
        ],
      },
      {
        id: '1888113139',
        kind: 'text',
        label: 'Of these, how many are paid regularly?',
        num: 25,
        help: 'Enter a number. Enter 0 if none.',
        field: { type: 'text', maxLength: 4, inputMode: 'numeric', placeholder: '0', pattern: '^[0-9]{1,4}$', patternMsg: 'Enter a whole number, e.g. 0, 2, 5' },
      },
      {
        id: '1549535751',
        kind: 'radio',
        label: 'Average monthly sales (revenue) in the last 12 months',
        num: 26,
        grid: true,
        options: [
          { value: 'Below ₦100,000' },
          { value: '₦100,000 to ₦500,000' },
          { value: '₦500,001 to ₦1,000,000' },
          { value: '₦1,000,001 to ₦5,000,000' },
          { value: 'Above ₦5,000,000' },
          { value: 'I do not know' },
        ],
      },
      {
        id: '1630311906',
        kind: 'radio',
        label: 'Where does the business operate from?',
        num: 27,
        grid: true,
        options: [
          { value: 'From home' },
          { value: 'Market stall, kiosk or mobile' },
          { value: 'Rented shop, workshop or farm' },
          { value: 'Own shop, workshop or farm' },
        ],
      },
    ],
  },
  {
    eyebrow: 'Section D of F',
    title: 'How the business works',
    desc: 'Choose the ONE statement closest to what happens in your business today. There are no right or wrong answers.',
    sec: 'Section D',
    short: 'How the business works',
    questions: [
      {
        id: '2050644165',
        kind: 'radio',
        label: 'Business plan',
        num: 28,
        grid: false,
        options: [
          { value: 'I have never written down a plan for the business' },
          { value: 'I have plans in my head, but nothing written' },
          { value: 'I have a written plan or Business Model Canvas, but I rarely use it' },
          { value: 'I have a written plan that I review and update at least once a year' },
        ],
      },
      {
        id: '682760078',
        kind: 'radio',
        label: 'Customers and market',
        num: 29,
        grid: false,
        options: [
          { value: 'I sell to whoever comes; I have not studied my customers' },
          { value: 'I know who my main customers are' },
          { value: 'I ask customers for feedback and watch what competitors do' },
          { value: 'I regularly gather market information (prices, competitors, customer needs) and act on it' },
        ],
      },
      {
        id: '815376664',
        kind: 'radio',
        label: 'Sales over the last 12 months',
        num: 30,
        grid: false,
        options: [
          { value: 'Very irregular, with long periods of no sales' },
          { value: 'Some regular sales, but they go up and down a lot' },
          { value: 'Fairly steady sales most months' },
          { value: 'Steady sales that have grown compared to the year before' },
        ],
      },
      {
        id: '1114808354',
        kind: 'radio',
        label: 'Marketing',
        num: 31,
        grid: false,
        options: [
          { value: 'Mostly word of mouth' },
          { value: 'Word of mouth plus a signboard, flyers or my market location' },
          { value: 'I also promote the business actively on WhatsApp, Facebook, Instagram or similar' },
          { value: 'I plan my marketing, set money aside for it, and track what brings customers' },
        ],
      },
      {
        id: '969510715',
        kind: 'radio',
        label: 'Production or service delivery',
        num: 32,
        grid: false,
        options: [
          { value: 'No fixed way of working; I handle things as they come' },
          { value: 'I know the steps, but they are not written down and quality varies' },
          { value: 'I have regular suppliers and a consistent way of working' },
          { value: 'Processes are written down or trained, quality is checked, and I could handle much bigger orders' },
        ],
      },
      {
        id: '297031965',
        kind: 'radio',
        label: 'People and management',
        num: 33,
        grid: false,
        options: [
          { value: 'I do almost everything myself' },
          { value: 'Family members or helpers assist, without clear roles' },
          { value: 'Workers have clear roles and I supervise them' },
          { value: 'Workers have clear roles and terms, I train them, and the business can run when I am away' },
        ],
      },
      {
        id: '2116291454',
        kind: 'radio',
        label: 'Records and money management',
        num: 34,
        grid: false,
        options: [
          { value: 'I do not keep records' },
          { value: 'I write down some sales or expenses from time to time' },
          { value: 'I record sales and expenses every day (in a book or an app)' },
          { value: 'I keep full records, keep business money separate from personal money, and work out my profit every month' },
        ],
      },
      {
        id: '752253697',
        kind: 'radio',
        label: 'Costing and pricing',
        num: 35,
        grid: false,
        options: [
          { value: 'I charge what others in the market charge' },
          { value: 'I add something to what the goods or materials cost me' },
          { value: 'I know my full costs (materials, labour, rent, transport, power) and price above them' },
          { value: 'I know my profit margin on each product or service and review my prices regularly' },
        ],
      },
      {
        id: '1211502270',
        kind: 'radio',
        label: 'Financing the business',
        num: 36,
        grid: false,
        options: [
          { value: 'Only my own savings, family or friends' },
          { value: 'Also contributions such as ajo, adashe, esusu or a cooperative' },
          { value: 'I have applied for a loan or grant from a bank, microfinance bank or programme' },
          { value: 'I have received a loan or grant from a formal institution and repaid it, or am repaying on schedule' },
        ],
      },
      {
        id: '999133411',
        kind: 'radio',
        label: 'Use of phone and computer for business',
        num: 37,
        grid: false,
        options: [
          { value: 'I use my phone mainly for calls' },
          { value: 'I use WhatsApp for business (chats, status updates)' },
          { value: 'I use WhatsApp and social media for business, and email or mobile banking' },
          { value: 'I also use a computer or business apps (Word, Excel, accounting, inventory or online store)' },
        ],
      },
    ],
  },
  {
    eyebrow: 'Section E of F',
    title: 'Goals & needs',
    sec: 'Section E',
    short: 'Goals & needs',
    questions: [
      {
        id: '1219535656',
        kind: 'radio',
        label: 'What is your main goal for the business in the next 12 months?',
        num: 38,
        grid: false,
        options: [
          { value: 'Keep the business running through current challenges' },
          { value: 'Organise the business better and increase regular sales' },
          { value: 'Formalise the business and get finance (registration, business account, loan or grant)' },
          { value: 'Expand: new markets, more locations, more staff or bigger production' },
        ],
      },
      {
        id: '1358185409',
        kind: 'checkbox',
        label: 'What are the biggest challenges facing the business?',
        num: 39,
        help: 'Choose up to three.',
        grid: false,
        max: 3,
        options: [
          { value: 'Access to finance or capital' },
          { value: 'Record keeping and money management' },
          { value: 'Finding customers or marketing' },
          { value: 'Costing and pricing' },
          { value: 'Registration, permits or taxes' },
          { value: 'Finding or managing workers' },
          { value: 'Raw materials or suppliers' },
          { value: 'Power or energy costs' },
          { value: 'Transport or logistics' },
          { value: 'Using digital tools' },
          { value: 'Insecurity' },
          { value: '__other_option__', label: 'Other', other: true },
        ],
      },
      {
        id: '1327826071',
        kind: 'radio',
        label: 'Do you plan to apply for a loan or grant in the next 12 months?',
        num: 40,
        grid: true,
        options: [
          { value: 'Yes' },
          { value: 'No' },
          { value: 'Not sure' },
        ],
      },
      {
        id: '1348157379',
        kind: 'text',
        label: 'If yes, roughly how much and for what?',
        num: 41,
        help: 'For example: ₦500,000 to buy a second sewing machine.',
        showWhen: { field: 'entry.1327826071', values: ['Yes'] },
        field: { type: 'text', maxLength: 300 },
      },
      {
        id: '1822847412',
        kind: 'checkbox',
        label: 'Have you attended any of these trainings before?',
        num: 42,
        help: 'Tick all that apply. Use "Other" to name any other business training.',
        grid: true,
        options: [
          { value: 'None', exclusive: true },
          { value: 'ICSS Inspire' },
          { value: 'ICSS Create' },
          { value: 'ICSS Start' },
          { value: 'ICSS Scale' },
          { value: '__other_option__', label: 'Other', other: true },
        ],
      },
      {
        id: '720576140',
        kind: 'checkbox',
        label: 'Does the business do any of the following?',
        num: 43,
        help: 'Tick all that apply.',
        grid: false,
        options: [
          { value: 'Reuse or recycle materials or packaging' },
          { value: 'Sell or use by-products (e.g. rice husk, groundnut shells)' },
          { value: 'Use solar or energy-saving equipment' },
          { value: 'Reduce waste of water or inputs' },
          { value: 'None of these yet', exclusive: true },
        ],
      },
    ],
  },
  {
    eyebrow: 'Section F of F',
    title: 'Commitment & declaration',
    desc: 'Participants are expected to produce the following by the end of the training.',
    sec: 'Section F',
    short: 'Commitment & declaration',
    questions: [
      {
        id: '1005611378',
        kind: 'checkbox',
        label: 'If selected, are you willing to do the following?',
        num: 44,
        help: 'Tick each one you agree to.',
        grid: false,
        options: [
          { value: 'Attend at least 80% of all sessions, physical and virtual' },
          { value: 'Work with a coach to write a business plan for my business' },
          { value: 'Start or complete CAC registration, if the business is not yet registered' },
          { value: 'Open and use a business bank account, if the business does not have one' },
          { value: 'Prepare a loan or grant application' },
          { value: 'Present (pitch) my business plan to a panel of bankers or investors' },
          { value: 'Allow a coach to visit my business premises' },
        ],
      },
      {
        id: '1788922300',
        kind: 'checkbox',
        label: 'Declaration',
        num: 45,
        declaration: 'I confirm that the information in this form is true. I understand that the training is free and carries no stipend, that I may be contacted for a short interview before selection, and that Toko Academy and GIZ may use this information for participant selection and for follow-up at 3, 6 and 12 months after the training.',
        grid: false,
        options: [
          { value: 'I agree and confirm the declaration above', strong: true },
        ],
      },
      {
        id: '1577108027',
        kind: 'text',
        label: 'Signature (type your full name)',
        help: 'Type your full name as your signature.',
        field: { type: 'text', maxLength: 120, autoComplete: 'off' },
      },
      {
        id: '431039088',
        kind: 'date',
        label: 'Date',
      },
    ],
  },
];
