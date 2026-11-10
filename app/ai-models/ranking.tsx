'use client';

import { useState } from 'react';
import Image from 'next/image';
import snapshot from '@/content/ai-models.json';
import { rankModels, type Model, type Provider } from '@/lib/ai-models/ranking';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import styles from './models.module.css';

const efforts: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High', xhigh: 'Extra high', max: 'Max', thinking: 'Thinking' };
const tiers = [
  { letter: 'S', min: 50, max: Infinity, title: 'Hardest tasks', examples: 'Research and complex architecture', className: '' },
  { letter: 'A', min: 45, max: 50, title: 'Hard tasks', examples: 'Serious development work', className: styles.tierA },
  { letter: 'B', min: 40, max: 45, title: 'Everyday work', examples: 'Everyday development', className: styles.tierB },
  { letter: 'C', min: 30, max: 40, title: 'Routine tasks', examples: 'Boilerplate code and small edits', className: styles.tierC },
  { letter: 'D', min: 0, max: 30, title: 'Simplest tasks', examples: 'Short answers and classification', className: styles.tierD },
];
const money = (value: number) => `$${value.toFixed(value < 0.01 ? 4 : 2)}`;
const points = (value: number) => value === 1 ? 'pt' : 'pts';
const label = (model: Model) => `${model.name} · ${efforts[model.effort]}`;
export default function ModelRanking() {
  const [provider, setProvider] = useState<Provider>('all');
  const [hideCostly, setHideCostly] = useState(true);
  const showAll = !hideCostly;
  const { all, recommended, alternatives } = rankModels(snapshot.models, provider);
  const visible = showAll ? all : recommended;

  return <>
    <div className={styles.toolbar}>
      <div className={styles.switch} role="group" aria-label="Model developer">
        {([['all', 'All'], ['openai', 'OpenAI'], ['anthropic', 'Anthropic']] as const).map(([value, title]) => <button key={value} type="button" aria-pressed={provider === value} onClick={() => setProvider(value)}>{title}</button>)}
      </div>
      <button className={styles.viewToggle} type="button" role="switch" aria-checked={hideCostly} onClick={() => setHideCostly(value => !value)}>
        <span>Hide poor value</span>
        <span className={styles.toggleTrack} aria-hidden="true"><span /></span>
      </button>
      <span className={styles.srOnly} aria-live="polite">Configurations: {visible.length}</span>
    </div>
    <div className={styles.tiers}>
      {tiers.map(tier => {
        const rows = visible.filter(m => m.score >= tier.min && m.score < tier.max);
        if (!rows.length) return null;
        return <section className={`${styles.tier} ${tier.className}`} key={tier.letter} aria-labelledby={`tier-${tier.letter}`}>
          <div className={styles.tierIntro}><span className={styles.tierLetter}>{tier.letter}<small>TIER</small></span><div><div className={styles.tierTitle}><h2 id={`tier-${tier.letter}`}>{tier.title}</h2><Popover><PopoverTrigger className={styles.info} openOnHover delay={100} closeDelay={150} aria-label={`Example tasks: tier ${tier.letter}`}>i</PopoverTrigger><PopoverContent className={styles.infoContent}>{tier.examples}</PopoverContent></Popover></div><span className={styles.tierRange}>{tier.max === Infinity ? `${tier.min}+ ${points(tier.min)}` : `${tier.min}–${tier.max - 1} ${points(tier.max - 1)}`}</span></div></div>
          <table className={`${styles.table}${showAll ? ` ${styles.tableAll}` : ''}`}>
            <caption className={styles.srOnly}>Tier {tier.letter}: {tier.title}</caption>
            <thead><tr>
              <th scope="col">Model / reasoning</th>
              {showAll && <th scope="col" className={styles.alternativeHeading}>Better pick</th>}
              <th scope="col"><span title="Artificial Analysis Intelligence Index v5.0.1">Intelligence index</span></th>
              <th scope="col"><span title="Weighted average API cost per Artificial Analysis benchmark task, in US dollars.">$ per task</span></th>
            </tr></thead>
            <tbody>{rows.map(model => {
              const alternative = alternatives.get(model.id);
              const gain = alternative && alternative.score - model.score;
              const reason = alternative && gain !== undefined && (alternative.cost > model.cost
                ? `+${gain} ${points(gain)} · ${Math.round((alternative.cost / model.cost - 1) * 100)}% more expensive`
                : `${gain === 0 ? 'Same score' : `+${gain} ${points(gain)}`} · ${Math.round((1 - alternative.cost / model.cost) * 100)}% cheaper`);
              return <tr id={model.id} key={model.id} className={alternative ? styles.rowMuted : undefined}>
                <th scope="row"><a href={model.source} target="_blank" rel="noreferrer" className={styles.name}><Image className={`${styles.icon} ${model.provider === 'openai' ? styles.openai : ''}`} src={`/model-icons/${model.provider === 'anthropic' ? 'claude' : 'gpt-seeklogo'}.png`} alt="" width={20} height={20} /><span>{model.name}<span className={styles.effort}>{efforts[model.effort]}</span></span></a>{alternative && <span className={styles.srOnly}>Not recommended in this comparison.</span>}</th>
                {showAll && <td className={styles.alternative}>{alternative ? <a href={`#${alternative.id}`} aria-label={`Better pick: ${label(alternative)}. ${reason}`}><span className={styles.alternativeLabel}>Better pick</span><span>{alternative.name.replace('Claude ', '')} <span className={styles.alternativeEffort}>{efforts[alternative.effort]}</span></span><small>{reason}</small></a> : null}</td>}
                <td className={styles.scoreCell}><span className={styles.score}><span className={styles.scoreBar} aria-hidden="true"><i style={{ width: `${model.score / 60 * 100}%` }} /></span>{model.score}</span></td>
                <td className={styles.cost}>{money(model.cost)}</td>
              </tr>;
            })}</tbody>
          </table>
        </section>;
      })}
    </div>
  </>;
}
