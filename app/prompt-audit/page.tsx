import type { CSSProperties, ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import CopyPrompt from '../claude-at-100/CopyPrompt';
import styles from '../claude-at-100/guide.module.css';
import own from './audit.module.css';

export const metadata: Metadata = {
  title: 'Prepare your setup for Opus 5.6',
  description:
    'Old instructions make new models slower and less accurate. How to find and remove them, in the Claude app and in Claude Code.',
  alternates: { canonical: '/prompt-audit' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Prepare your setup for Opus 5.6',
    description: 'Find and remove the old instructions that make new Claude models slower and less accurate.',
    url: '/prompt-audit',
  },
};
export const viewport: Viewport = { themeColor: '#0f0b0d', colorScheme: 'dark' };

const appPrompt = `Here are the instructions I give you:
[paste your project instructions, personal preferences or skill]

Audit them for a current model:
1. Outdated lines: asking you to double-check, ALL CAPS, step-by-step instructions you don't need.
2. Lines that contradict each other.
3. Vague lines ("be thorough"). Rewrite them to be specific.

List the problems first, with a proposed edit for each. Don't rewrite anything until I tell you which edits to apply.`;

const sections = [
  { id: 'app', name: 'In the Claude app' },
  { id: 'code', name: 'In Claude Code' },
  { id: 'result', name: 'Result' },
];

const tones = ['#ffd94d', '#a78bfa', '#5eead4'];

function Section({
  index,
  subtitle,
  children,
}: {
  index: number;
  subtitle: string;
  children: ReactNode;
}) {
  const s = sections[index];
  return (
    <section id={s.id} className={styles.feature} style={{ '--tone': tones[index] } as CSSProperties}>
      <header className={styles.featureHead}>
        <h2>
          <span className={styles.number}>{index + 1}.</span> {s.name}
        </h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      <div className={styles.featureBody}>{children}</div>
    </section>
  );
}

export default function PromptAuditPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          <span>Arsenii</span>, Software Engineer
        </a>
      </header>

      <main>
        <h1 className={styles.title}>
          Prepare your setup for <span className={own.nowrap}>Opus 5.6</span>
        </h1>
        <p className={own.kicker}>Or any other major release</p>
        <p className={styles.lead}>
          Old instructions like “double-check your work”, ALL CAPS rules and step-by-step walkthroughs make new
          models slower and less accurate. Here’s how to find and remove them.
        </p>

        <nav className={`${styles.toc} ${own.toc}`} aria-label="Contents">
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} style={{ '--tone': tones[i] } as CSSProperties}>
              <span>{i + 1}</span> {s.name}
            </a>
          ))}
        </nav>

        <div className={styles.features}>
          <Section index={0} subtitle="For project instructions, personal preferences and skills.">
            <p>Open a new chat and paste this:</p>
            <CopyPrompt text={appPrompt} />
            <p>Then reply with the numbers you want applied and paste the new version back where it came from.</p>
          </Section>

          <section className={`${styles.closing} ${own.banner}`}>
            <div className={styles.blob1}></div>
            <div className={styles.blob2}></div>
            <h2>Master Claude in 7 Days</h2>
            <p>
              3 years of daily Claude use, boiled down to the setup that works for me and the
              professionals and founders I work with. Step by step, no code.
            </p>
            <div className={styles.ctaRow}>
              <a className={styles.cta} href="/links/claude-7-days">See the course</a>
            </div>
          </section>

          <Section index={1} subtitle="A built-in command checks every instruction file in your project.">
            <p>
              Update first (you need <code className={own.code}>v2.1.283</code> or newer):
            </p>
            <CopyPrompt title="Terminal" text="claude update" />
            <p>Then, in your project folder, start Claude Code and run:</p>
            <CopyPrompt title="Claude Code" text="/doctor prompt-audit" />
            <p>
              It checks <code className={own.code}>CLAUDE.md</code>, <code className={own.code}>CLAUDE.local.md</code>,{' '}
              <code className={own.code}>AGENTS.md</code>, and the rules, skills, commands, subagents and output
              styles in <code className={own.code}>.claude/</code> and <code className={own.code}>~/.claude/</code>.
              To check a single file or folder, add its path:
            </p>
            <CopyPrompt title="Claude Code" text="/doctor prompt-audit .claude/skills/deploy" />
            <p>You get a list of problems with proposed edits:</p>
            <ul className={own.list}>
              <li>instructions written for older models</li>
              <li>references to files or commands that no longer exist</li>
              <li>files that contradict each other</li>
            </ul>
            <p>Nothing changes until you say so. Back up first:</p>
            <CopyPrompt title="Terminal" text="cp CLAUDE.md CLAUDE.md.bak" />
            <p>Then tell it which edits to apply:</p>
            <CopyPrompt text="Apply 1, 2 and 4. Skip 3." />
            <div className={styles.tip}>
              <p className={styles.tipTitle}>What to keep</p>
              <p>
                Keep your project conventions and the mistakes Claude keeps repeating. Cut anything Claude can read
                from the code itself, like folder structure or dependency lists.
              </p>
            </div>
          </Section>


          <Section index={2} subtitle="Fewer instructions, cheaper and better answers.">
            <div className={own.stats}>
              <div className={own.stat}>
                <span className={own.statValue}>~70</span>
                <span className={own.statLabel}>findings from one audit</span>
              </div>
              <div className={own.stat}>
                <span className={own.statValue}>−9%</span>
                <span className={own.statLabel}>lower costs after applying them</span>
              </div>
            </div>
            <p>
              One engineer ran the audit and got about 70 findings. After applying them, his costs dropped about 9%,
              and the answers got more accurate on the same model.
            </p>
          </Section>
        </div>

      </main>

      <footer className={styles.footer}>
        <div>Made by me &copy;2026</div>
        <a href="/">pomazkov.com</a>
      </footer>
    </div>
  );
}
