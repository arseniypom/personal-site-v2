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
      <ModelRanking />
      <details className={styles.notes} id="methodology">
        <summary>Data and methodology</summary>
        <p><a href="https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index" target="_blank" rel="noreferrer">Artificial Analysis Intelligence Index v5.0.1 ↗</a>. Scores are rounded and are not percentages. Cost is the weighted average API price per benchmark task.</p>
        <div className={styles.sources}><a href="https://developers.openai.com/api/docs/guides/latest-model" target="_blank" rel="noreferrer">OpenAI ↗</a><a href="https://platform.claude.com/docs/en/models/overview" target="_blank" rel="noreferrer">Anthropic ↗</a><a href="https://artificialanalysis.ai/models" target="_blank" rel="noreferrer">Artificial Analysis ↗</a></div>
      </details>
    </main>
  </div>;
}
