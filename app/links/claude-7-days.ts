// Long landing copy for /links/claude-7-days. Rendered by CourseLanding.tsx.
// Text in [square brackets] is a placeholder to fill in before going live.
// ==word== gets the yellow marker (rendered by Marked in CourseLanding.tsx).

export type Tier = {
  id: string;
  /** Stripe Payment Link for the full price of this plan. */
  checkoutUrl: string;
  name: string;
  price: string;
  tag?: string;
  note?: string;
  features: string[];
  /** Shown as a highlighted box under the features. */
  bonus?: { label: string; title: string; text: string };
  featured?: boolean;
};

export type Landing = {
  eyebrow: string;
  /** Headline split so `mark` gets the yellow marker. */
  headline: string;
  sub: string;
  newYear: string;
  facts: string[];
  /** Label of every button that scrolls to the plans. */
  cta: string;
  painsTitle: string;
  pains: { lead: string; rest: string }[];
  outcomesTitle: string;
  outcomes: { title: string; text: string }[];
  outcomesExtra: string;
  levelsTitle: string;
  levelsSub: string;
  levels: { title: string; text: string }[];
  personal: { title: string; text: string };
  author: {
    hello: string;
    photo: string;
    text: string[];
    badges: { value: string; label: string; flag?: boolean }[];
  };
  pricingTitle: string;
  pricingSub: string;
  /** A tier shown as already gone (scarcity anchor), without a button. */
  soldOut?: { name: string; perk: string };
  tiers: Tier[];
  terms: string[];
  extraCost: string;
  faq: { q: string; a: string }[];
  close: { title: string; text: string };
};

export const START_DATE = 'December 7';

// Full-price Stripe Payment Links, account "Pomazkov": live on production, test_ twin elsewhere
// (test links redirect to localhost:3199, live ones to www.pomazkov.com). Products/links carry
// metadata course=claude-7-days, plan=<tier id>. The $250 link stops after 4 completed payments
// (restrictions.completed_sessions.limit = 4), matching the "4 spots left" tag.
const STRIPE_LIVE = process.env.VERCEL_ENV === 'production';
const stripeLink = (path: string) => `https://buy.stripe.com/${STRIPE_LIVE ? '' : 'test_'}${path}`;

export const claude7Days: Landing = {
  eyebrow: `7-day course · Starts ${START_DATE}`,
  headline: 'Learn to use Claude ==properly== in 7 days',
  sub: 'Instead of digging through hundreds of guides, follow one clear plan from a Big Tech engineer and entrepreneur who uses Claude at work every day.',
  newYear: 'Start 2027 knowing what you’re doing, with an AI setup built around your work.',
  facts: ['Video + text', 'Watch any time', 'From 30 min a day', 'No coding'],
    cta: 'Join for $93',

  painsTitle: 'Where most people get stuck',
  // Each pain is named by 4+ of 9 competitor pages (Ben, Remy, gconf, 6 Maven courses).
  pains: [
    { lead: 'You use Claude like a search box', rest: 'and know it can do much more' },
    { lead: 'Answers look fine but miss the point,', rest: 'so you rewrite them yourself' },
    { lead: 'Emails, documents and reports', rest: 'still take up most of your week' },
    { lead: 'Skills and agents sound useful,', rest: 'but you don’t know where to start' },
    { lead: 'You’ve tried it a few times,', rest: 'and it never became a habit' },
  ],

  outcomesTitle: 'By ==December 13== you’ll have',
  outcomes: [
    { title: 'Claude that knows your work', text: 'Your role, your style, your usual tasks' },
    { title: 'Tasks handed off to Claude', text: 'Emails, research, documents, reports' },
    { title: 'Your own Skills', text: 'Weekly tasks in one click' },
    { title: 'Workflows on a schedule', text: 'Like a morning summary of your inbox' },
    { title: 'A tool built without code', text: 'A simple website or internal tool' },
  ],
  outcomesExtra: 'Plus my ready-made Skills and prompts to start from.',

  levelsTitle: '7 levels, one a day',
  levelsSub: 'A new lesson opens every morning.',
  levels: [
    { title: 'Set up', text: 'Tell Claude about yourself, your work and how you write, so its answers fit you.' },
    { title: 'Memory', text: 'Set up Projects that keep your files, decisions and preferences between chats.' },
    { title: 'Handing off tasks', text: 'Emails, research, documents and reports. How to brief Claude and check what it gives back.' },
    { title: 'Skills', text: 'Teach Claude a task once, then run it again with one click.' },
    { title: 'Automation', text: 'Workflows that run on a schedule without you starting them.' },
    { title: 'Build without code', text: 'Describe a simple website or internal tool and get a working version.' },
    { title: 'Your AI system', text: 'Put it together into one setup you’ll use every day.' },
  ],

  personal: {
    title: 'Bring your own tasks',
    text: 'After you join, send me a task you’d like Claude to handle. I’ll pick a few and record extra walkthroughs on them for everyone.',
  },

  author: {
    hello: 'Hi, I’m Arsenii',
    photo: '/arsenii-course.jpg',
    text: [
      'I’ve been building software for 8 years, in Big Tech and in startups, and I work with AI tools every day. I know how they work inside, so I can show you ==what matters== and leave out the rest.',
      'I explain it in plain language. You don’t need a tech background to follow the course.',
    ],
    badges: [
      { value: '8 years', label: 'Big Tech, AI startups, entrepreneurship' },
      { value: 'UK Global Talent', label: 'Recognised by the UK for exceptional work in tech', flag: true },
      { value: '20+', label: 'people I’ve coached to senior roles and product launches' },
    ],
  },

  pricingTitle: 'Pick your plan',
  pricingSub: `One payment. The first level opens on ${START_DATE}.`,
  soldOut: { name: 'Early bird', perk: 'Standard + 30-minute 1:1 call with me' },
  tiers: [
    {
      id: 'early-bird',
      checkoutUrl: stripeLink('14AdR93JIcWXeTBcIKafS02'),
      name: 'Standard',
      price: '$93',
      features: [
        'All 7 levels, video + text',
        'Watch any time, at your own pace',
        'Ready-made Skills and prompts',
      ],
    },
    {
      id: 'personal-support',
      checkoutUrl: stripeLink('8x26oHeom9KLeTBeQSafS03'),
      name: 'With personal support',
      price: '$250',
      tag: '4 spots left',
      featured: true,
      features: [
        'Everything in Standard',
        'Chat with me during the course',
        'Two calls on your own cases: we build your workflow together',
      ],
      bonus: {
        label: 'Bonus course',
        title: 'Edit Videos with Claude',
        text: 'Hand it to your editor, or save yourself hours of editing every week.',
      },
    },
  ],
  terms: [
    'One payment, no subscription',
    `Access arrives by email on ${START_DATE}`,
  ],
  extraCost: 'You’ll also need Claude Pro, about $20 a month, paid to Anthropic. Not included.',

  faq: [
    {
      q: 'Do I need to know how to code?',
      a: 'No. Everything happens in the regular Claude app. Even the tool on Level 6 is made by describing it.',
    },
    {
      q: 'Which Claude plan do I need?',
      a: 'Claude Pro, about $20 a month. Some of what we set up needs a paid plan.',
    },
    {
      q: 'How much time does it take?',
      a: 'From 30 minutes a day. Each level is a short video and a text guide you follow step by step.',
    },
    {
      q: 'What if I fall behind?',
      a: 'Once a level opens, it stays open. You can catch up any time. Access: [until …].',
    },
    {
      q: 'Why Claude and not ChatGPT?',
      a: 'Claude is what I use at work every day, so that’s what I teach. Most of it carries over to other tools.',
    },
    {
      q: 'Can I do it on my phone?',
      a: 'You can watch the lessons on your phone. For setting things up, use a laptop.',
    },
  ],

  close: {
    title: 'Have your AI setup ready before the new year.',
    text: `7 levels, one a day, from ${START_DATE}.`,
  },
};
