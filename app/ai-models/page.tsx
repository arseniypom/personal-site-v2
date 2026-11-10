import type { Metadata, Viewport } from 'next';
import ModelRanking from './ranking';
import styles from './models.module.css';

export const metadata: Metadata = {
  title: 'AI Model Tier List',
  description: 'OpenAI and Anthropic models by reasoning effort, intelligence index and cost per benchmark task. Checked on November 10, 2026.',
  alternates: { canonical: '/ai-models' },
  openGraph: { type: 'website', locale: 'en_US', title: 'AI Model Tier List', description: 'OpenAI and Anthropic models by intelligence and cost.', url: '/ai-models' },
};
export const viewport: Viewport = { themeColor: '#0f0b0d', colorScheme: 'dark' };

export default function ModelsPage() {
  return <div className={styles.page}>
    <main>
      <div className={styles.heading}><h1><span>AI model</span> <span>tier list</span></h1><time dateTime="2026-11-10">November 10, 2026</time></div>
      <p className={styles.lead}>OpenAI and Anthropic models come with several reasoning levels each, so there are dozens of options to choose from. I made this list to compare them in one place. Each option has an intelligence score and the cost of one benchmark task, and options are grouped into tiers by how hard a task they can handle. "Hide poor value" hides options that are both weaker and more expensive than another one.</p>
      <ModelRanking />
      <details className={styles.notes} id="methodology">
        <summary>Data and methodology</summary>
        <p><a href="https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index" target="_blank" rel="noreferrer">Artificial Analysis Intelligence Index v5.0.1 ↗</a>. Scores are rounded and are not percentages. Cost is the weighted average API price per benchmark task.</p>
        <div className={styles.sources}><a href="https://developers.openai.com/api/docs/guides/latest-model" target="_blank" rel="noreferrer">OpenAI ↗</a><a href="https://platform.claude.com/docs/en/models/overview" target="_blank" rel="noreferrer">Anthropic ↗</a><a href="https://artificialanalysis.ai/models" target="_blank" rel="noreferrer">Artificial Analysis ↗</a></div>
      </details>
    </main>
  </div>;
}
