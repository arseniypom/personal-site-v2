// Fake-door course pages for /links. Each button opens /links/<slug>;
// page views of that slug = clicks on its button (Vercel Analytics).

/** Tally waitlist form id (tally.so/r/<id>). Empty = placeholder box. */
export const TALLY_FORM_ID = 'Z9OxBy';

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
  forYou?: string;
  price: string;
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
      { lead: 'Create content faster', rest: 'posts, scripts and visuals in your voice' },
      { lead: 'Build without code', rest: 'a simple website or internal tool, made by describing it' },
      { lead: 'Your personal AI system', rest: 'everything combined into one setup that works for you every day' },
    ],
    extra: 'Plus ready-made Skills and prompts to start from.',
    forYou:
      'You’re short on time, tutorials went nowhere, you feel left behind or you don’t know where to start.',
    price: '$49',
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
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
