// Fake-door course pages for /links. Each button opens /links/<slug>;
// page views of that slug = clicks on its button (Vercel Analytics).
// The page sells a $1 early-bird spot via a Stripe Payment Link (one link per course,
// so payments compare the two topics). Paid -> Stripe redirects to /links/<slug>/reserved.
// The rest of the price is NOT charged automatically: at launch, send buyers a payment link.

/**
 * Live Stripe links only on the production deploy. Locally (`next dev` / `next build`)
 * and on Vercel previews the test-mode twin is used: same path with a `test_` prefix.
 * Test links redirect back to http://localhost:3199, live ones to www.pomazkov.com.
 * Test card: 4242 4242 4242 4242, any future date, any CVC.
 */
const STRIPE_LIVE = process.env.VERCEL_ENV === 'production';
const stripeLink = (path: string) => `https://buy.stripe.com/${STRIPE_LIVE ? '' : 'test_'}${path}`;

/** Promised launch date. Shown on the page and in Stripe checkout text; $1 refunded if missed. */
export const LAUNCH_BY = 'December 31, 2026';

export type Course = {
  slug: string;
  title: string;
  /** Short line under the title on the /links button. */
  buttonSub: string;
  subtitle: string;
  tone: 'orange' | 'purple';
  listTitle: string;
  items: { lead: string; rest?: string }[];
  extra?: string;
  /** "This is for you if" — one pain per line; shown right under the hero. */
  forYou?: string[];
  price: string;
  /**
   * Stripe Payment Link for the $1 spot (account "Pomazkov"), see `stripeLink`.
   */
  checkoutUrl: string;
};

export const courses: Course[] = [
  {
    slug: 'claude-7-days',
    title: 'Master Claude in 7 Days',
    buttonSub: 'Get Claude doing real work for you, no code',
    subtitle: 'Go from AI-curious to AI-confident in one week. No coding required.',
    tone: 'orange',
    listTitle: 'What’s inside',
    items: [
      { lead: 'Set up Claude the right way', rest: 'context, your work and style' },
      { lead: 'Give Claude a memory', rest: 'keep projects, decisions and preferences between chats' },
      { lead: 'Hand off real work', rest: 'emails, research, documents and reports' },
      { lead: 'Build your own Skills', rest: 'turn the tasks you repeat every week into one-click workflows' },
      { lead: 'Automate the routine', rest: 'workflows that run on their own' },
      { lead: 'Build without code', rest: 'a simple website or internal tool, made by describing it' },
      { lead: 'Your personal AI system', rest: 'everything combined into one setup that works for you every day' },
    ],
    extra: 'Plus ready-made Skills and prompts to start from.',
    forYou: [
      'You’ve tried Claude or ChatGPT, but the results are hit or miss',
      'Skills, agents and automations sound like something for developers',
      'Tutorials went nowhere and you feel left behind',
      'You’re short on time and just want to know where to start',
    ],
    price: '$69',
    checkoutUrl: stripeLink('cNidR91BA1ef6n5fUWafS00'),
  },
  {
    slug: 'video-editing',
    title: 'Edit Videos with Claude',
    buttonSub: 'Finished Reels without editing by hand',
    subtitle: 'Polished, motion-driven Reels without spending hours in an editor.',
    tone: 'purple',
    listTitle: 'What you’ll learn',
    items: [
      { lead: 'Let Claude cut the pauses and retakes for you' },
      { lead: 'Add animated word-by-word captions in your colors and fonts' },
      { lead: 'Animate text and graphics for your Reels' },
      { lead: 'Copy any creator’s editing style' },
      { lead: 'Know what to film so editing goes fast' },
    ],
    extra: 'Bonus: my own editing Skills and references from my Reels.',
    price: '$29',
    checkoutUrl: stripeLink('00waEX5RQaOP4eX8suafS01'),
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
