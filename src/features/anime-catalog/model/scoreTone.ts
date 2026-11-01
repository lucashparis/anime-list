export type ScoreTone = 'danger' | 'warning' | 'success';

export function getScoreTone(score: number): ScoreTone {
  if (score < 50) return 'danger';
  if (score <= 80) return 'warning';
  return 'success';
}
