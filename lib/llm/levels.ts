import type { CriterionId, Level } from "./types";

const RANK: Record<Level, number> = { Emerging: 1, Solid: 2, Strong: 3 };

// True if ANY criterion is a higher level in `next` than in `prev`.
export function improvedAny(prev: Record<CriterionId, Level>, next: Record<CriterionId, Level>): boolean {
  return (Object.keys(next) as CriterionId[]).some((k) => prev[k] !== undefined && RANK[next[k]] > RANK[prev[k]]);
}
