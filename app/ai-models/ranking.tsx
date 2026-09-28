'use client';

import { useState } from 'react';
import Image from 'next/image';
import snapshot from '@/data/ai-models.json';

type Provider = 'all' | 'openai' | 'anthropic';
type Model = (typeof snapshot.models)[number];
const efforts: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High', xhigh: 'Extra high', max: 'Max', thinking: 'Thinking' };
const tiers = [
  { letter: 'S', min: 50, max: Infinity, title: 'Hardest tasks' },
  { letter: 'A', min: 45, max: 50, title: 'Demanding work' },
  { letter: 'B', min: 40, max: 45, title: 'Everyday work' },
  { letter: 'C', min: 30, max: 40, title: 'On a budget' },
  { letter: 'D', min: 0, max: 30, title: 'Simple tasks' },
];
const money = (value: number) => `$${value.toFixed(value < 0.01 ? 4 : 2)}`;
const label = (model: Model) => `${model.name} · ${efforts[model.effort]}`;
const byQuality = (a: Model, b: Model) => b.score - a.score || a.cost - b.cost;
const dominates = (a: Model, b: Model) => a.score >= b.score && a.cost <= b.cost && (a.score > b.score || a.cost < b.cost);
export default function ModelRanking() {
  const [provider, setProvider] = useState<Provider>('all');
  const pool = snapshot.models.filter(m => provider === 'all' || m.provider === provider);
  const visible = pool.filter(m => !pool.some(other => dominates(other, m))).sort(byQuality);
  const excluded = pool.filter(m => !visible.includes(m)).sort(byQuality);

  return <>
    <div className="models-toolbar">
      <div className="models-switch" role="group" aria-label="Model provider">
        {([['all', 'All'], ['openai', 'OpenAI'], ['anthropic', 'Anthropic']] as const).map(([value, title]) => <button key={value} type="button" aria-pressed={provider === value} onClick={() => setProvider(value)}>{title}</button>)}
      </div>
      <span className="models-sr-only" aria-live="polite">{visible.length} configurations</span>
    </div>
    <div className="models-tiers">
      {tiers.map(tier => {
        const rows = visible.filter(m => m.score >= tier.min && m.score < tier.max);
        if (!rows.length) return null;
        return <section className={`models-tier tier-${tier.letter.toLowerCase()}`} key={tier.letter} aria-labelledby={`tier-${tier.letter}`}>
          <div className="models-tier-intro"><span className="models-tier-letter">{tier.letter}<small>TIER</small></span><div><h2 id={`tier-${tier.letter}`}>{tier.title}</h2><span className="models-tier-range">{tier.max === Infinity ? '50+' : `${tier.min}–${tier.max - 1}`} intelligence pts</span></div></div>
          <table className="models-table"><caption className="models-sr-only">Tier {tier.letter}: {tier.title}</caption><thead><tr><th scope="col">Model / reasoning</th><th scope="col"><span title="Artificial Analysis Intelligence Index v4.3.2">Intelligence index</span></th><th scope="col"><span title="Weighted average API cost per task in the Artificial Analysis benchmark, USD. Not the cost of your own request.">$/benchmark task</span></th></tr></thead><tbody>{rows.map(model => <tr id={model.id} key={model.id}>
            <th scope="row"><a href={model.source} target="_blank" rel="noreferrer" className="models-name"><Image className={`models-provider-icon ${model.provider}`} src={`/model-icons/${model.provider === 'anthropic' ? 'claude' : 'gpt-seeklogo'}.png`} alt="" width={20} height={20} /><span>{model.name}<span className="models-effort">{efforts[model.effort]}</span></span></a></th>
            <td><span className="models-score"><span className="models-score-bar" aria-hidden="true"><i style={{ width: `${model.score / 60 * 100}%` }} /></span>{model.score}</span></td>
            <td className="models-cost">{money(model.cost)}</td>
          </tr>)}</tbody></table>
        </section>;
      })}
    </div>
    <details className="models-excluded" key={provider}>
      <summary><span>Not shortlisted <small>{excluded.length}</small></span><span className="models-expand" aria-hidden="true">+</span></summary>
      <p>Alternatives with an equal or higher score at a lower cost.</p>
      <ul>{excluded.map(model => {const alternative = visible.filter(m => dominates(m, model)).sort((a, b) => a.cost - b.cost)[0];return <li key={model.id}><div><a href={model.source} target="_blank" rel="noreferrer">{label(model)}</a><span>{model.score} pts · {money(model.cost)}</span></div><div><small>Alternative</small><a href={`#${alternative.id}`}>{label(alternative)} ↑</a><span>{alternative.score} pts · {money(alternative.cost)}</span></div></li>;})}</ul>
    </details>
  </>;
}
