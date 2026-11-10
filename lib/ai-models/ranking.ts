import snapshot from '@/content/ai-models.json';

export type Model = (typeof snapshot.models)[number];
export type Provider = 'all' | 'openai' | 'anthropic';

export const byQuality = (a: Model, b: Model) => b.score - a.score || a.cost - b.cost;
const dominates = (a: Model, b: Model) =>
  a.score >= b.score && a.cost <= b.cost && (a.score > b.score || a.cost < b.cost);

export function rankModels(models: Model[], provider: Provider) {
  const pool = models.filter(model => provider === 'all' || model.provider === provider);
  const recommended = pool.filter(model => !pool.some(other => dominates(other, model))).sort(byQuality);
  const alternatives = new Map<string, Model>();
  for (const model of pool) {
    if (recommended.includes(model)) continue;
    const alternative = recommended.filter(other => dominates(other, model))
      .sort((a, b) => a.cost - b.cost || b.score - a.score)[0];
    if (alternative) alternatives.set(model.id, alternative);
  }
  return { all: [...pool].sort(byQuality), recommended, alternatives };
}
