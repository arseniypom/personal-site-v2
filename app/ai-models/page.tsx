import type { Metadata } from 'next';
import ModelRanking from './ranking';
import './models.css';

export const metadata: Metadata = {
  title: 'AI models — Arsenii Pomazkov',
  description: 'OpenAI and Anthropic models ranked by reasoning effort, intelligence, and benchmark task cost. Checked 28 September 2026.',
  alternates: { canonical: '/ai-models' },
  openGraph: { title: 'AI models', description: 'OpenAI and Anthropic models, ranked by intelligence and cost.', url: '/ai-models' },
};

export default function ModelsPage() {
  return <div className="page models-page" lang="en">
    <header className="site-header">
      <a className="brand" href="/">Arsenii</a>
    </header>
    <main>
      <div className="models-heading"><h1>AI models</h1><time dateTime="2026-09-28">28 Sep 2026</time></div>
      <ModelRanking />
      <details className="models-notes" id="methodology">
        <summary>Data & methodology</summary>
        <p><a href="https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index" target="_blank" rel="noreferrer">Artificial Analysis Intelligence Index v4.3.2 ↗</a>. Rounded scores, not percentages. Cost is the weighted average API cost per benchmark task, not your request or subscription cost.</p>
        <p>Configurations are hidden when another in the selected set has an equal or higher score at an equal or lower cost, with at least one strictly better. Tiers are editorial: S ≥ 50, A ≥ 45, B ≥ 40, C ≥ 30, D &lt; 30.</p>
        <p>OpenAI and Anthropic snapshot as of 28 Sep 2026, not a complete catalog. Speed, tools, and performance on your tasks may change the choice. Extra high = xhigh; Opus 5.5 and Fable 5.1 use adaptive reasoning with default fallback; Haiku uses thinking.</p>
        <div className="models-source-links"><a href="https://developers.openai.com/api/docs/guides/latest-model" target="_blank" rel="noreferrer">OpenAI ↗</a><a href="https://platform.claude.com/docs/en/models/overview" target="_blank" rel="noreferrer">Anthropic ↗</a><a href="https://artificialanalysis.ai/models" target="_blank" rel="noreferrer">Artificial Analysis ↗</a></div>
      </details>
    </main>
  </div>;
}
