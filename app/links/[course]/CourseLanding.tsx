import type { Course } from '../courses';
import type { Landing } from '../claude-7-days';
import s from './landing.module.css';

function UkFlag() {
  return (
    <svg className={s.flag} viewBox="0 0 60 30" aria-hidden>
      <clipPath id="uk-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

/** Renders ==word== segments with the yellow marker. */
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split('==').map((part, i) =>
        i % 2 ? (
          <mark key={i} className={s.mark}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Level circles go yellow → orange → purple, so the 7 days read as a climb. */
const LEVEL_COLORS = [
  ['#ffd94d', '#1a1816'],
  ['#ffc23d', '#1a1816'],
  ['#fda04a', '#1a1816'],
  ['#f97316', '#fff'],
  ['#c084fc', '#fff'],
  ['#a78bfa', '#fff'],
  ['#7c4dff', '#fff'],
];

const Check = () => (
  <svg className={s.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export default function CourseLanding({ course, l }: { course: Course; l: Landing }) {
  return (
    <div className={s.page}>
      <header className={s.bar}>
        <a className={s.back} href="/links" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>
        <span className={s.barTitle}>{course.title}</span>
        <a className={s.barCta} href="#plans">
          {l.cta}
        </a>
      </header>

      <main className={s.main}>
        {/* Hero */}
        <section className={s.hero}>
          <p className={s.eyebrow}>{l.eyebrow}</p>
          <h1 className={s.h1}>
            <Marked text={l.headline} />
          </h1>
          <p className={s.sub}>{l.sub}</p>
          <p className={s.newYear}>{l.newYear}</p>
          <ul className={s.facts}>
            {l.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className={s.heroCtas}>
            <a className={s.cta} href="#plans">
              {l.cta}
            </a>
            <a className={s.ghost} href="#levels">
              See the 7 levels
            </a>
          </div>
        </section>

        {/* Pains + outcomes */}
        <div className={s.two}>
          <section className={`${s.card} ${s.pains}`}>
            <h2 className={s.h2}>{l.painsTitle}</h2>
            <ul className={s.painList}>
              {l.pains.map((p) => (
                <li key={p.lead}>
                  <b>{p.lead}</b> {p.rest}
                </li>
              ))}
            </ul>
          </section>

          <section className={`${s.card} ${s.gains}`}>
            <h2 className={s.h2}>
              <Marked text={l.outcomesTitle} />
            </h2>
            <ul className={s.outcomes}>
              {l.outcomes.map((o) => (
                <li key={o.title}>
                  <Check />
                  <div>
                    <b>{o.title}</b>
                    <span>{o.text}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className={s.extra}>{l.outcomesExtra}</p>
          </section>
        </div>

        {/* Levels */}
        <section id="levels" className={s.levelsWrap}>
          <div className={s.sectionHead}>
            <h2 className={s.h2big}>{l.levelsTitle}</h2>
            <p className={s.hint}>{l.levelsSub}</p>
          </div>
          <ol className={s.levels}>
            {l.levels.map((lv, i) => (
              <li key={lv.title} className={s.level}>
                <span
                  className={s.levelNum}
                  style={{ background: LEVEL_COLORS[i % 7][0], color: LEVEL_COLORS[i % 7][1] }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className={s.h3}>{lv.title}</h3>
                  <p>{lv.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={s.personal}>
            <h3 className={s.h3}>{l.personal.title}</h3>
            <p>{l.personal.text}</p>
          </div>
        </section>

        {/* Author */}
        <section className={`${s.card} ${s.author}`}>
          <h2 className={`${s.h2big} ${s.authorHello}`}>{l.author.hello}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.authorPhoto} src={l.author.photo} alt="Arsenii" />
          <div className={s.authorText}>
            {l.author.text.map((t) => (
              <p key={t} className={s.text}>
                <Marked text={t} />
              </p>
            ))}
          </div>
          <ul className={s.badges}>
            {l.author.badges.map((b) => (
              <li key={b.label}>
                <b>
                  {b.flag && <UkFlag />}
                  {b.value}
                </b>
                <span>{b.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Plans */}
        <section id="plans" className={s.plansWrap}>
          <div className={s.sectionHead}>
            <h2 className={s.h2big}>{l.pricingTitle}</h2>
            <p className={s.hint}>{l.pricingSub}</p>
          </div>
          {l.soldOut && (
            <div className={s.soldOut}>
              <span>
                <b>{l.soldOut.name}</b> · {l.soldOut.perk}
              </span>
              <span className={s.soldTag}>Sold out</span>
            </div>
          )}
          <div className={s.plans}>
            {l.tiers.map((t) => (
              <article key={t.id} className={`${s.plan} ${t.featured ? s.featured : ''}`}>
                <div className={s.planHead}>
                  <h3 className={s.h3}>{t.name}</h3>
                  {t.tag && <span className={s.tag}>{t.tag}</span>}
                </div>
                <div className={s.price}>{t.price}</div>
                {t.note && <p className={s.priceNote}>{t.note}</p>}
                <ul className={s.features}>
                  {t.features.map((f) => (
                    <li key={f}>
                      <Check />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {t.bonus && (
                  <div className={s.bonus}>
                    <span className={s.bonusLabel}>{t.bonus.label}</span>
                    <b>{t.bonus.title}</b>
                    <p>{t.bonus.text}</p>
                  </div>
                )}
                <a className={s.cta} href={t.checkoutUrl}>
                  Join for {t.price}
                </a>
              </article>
            ))}
          </div>
          <div className={s.terms}>
            <ul>
              {l.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className={s.extraCost}>{l.extraCost}</p>
            <p className={s.secure}>Secure checkout by Stripe</p>
          </div>
        </section>

        {/* FAQ */}
        <section className={s.faqWrap}>
          <h2 className={s.h2big}>Questions</h2>
          <div className={s.faq}>
            {l.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Close */}
        <section className={s.close}>
          <h2 className={s.closeTitle}>{l.close.title}</h2>
          <p>{l.close.text}</p>
          <a className={s.cta} href="#plans">
            {l.cta}
          </a>
        </section>
      </main>
    </div>
  );
}
