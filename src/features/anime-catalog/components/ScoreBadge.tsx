import { getScoreTone, type ScoreTone } from '@/features/anime-catalog/model/scoreTone';

const BADGE_CLASS_NAME = 'rounded-sm px-sm text-md font-bold';

const toneClassName: Record<ScoreTone, string> = {
  danger: 'bg-danger text-white',
  warning: 'bg-warning text-ink',
  success: 'bg-success text-ink',
};

export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <p className={`${BADGE_CLASS_NAME} bg-neutral-100 text-ink`}>Sem nota</p>;
  }

  return (
    <p className={`${BADGE_CLASS_NAME} ${toneClassName[getScoreTone(score)]}`}>
      <span className="sr-only">Nota </span>
      {score}%
    </p>
  );
}
