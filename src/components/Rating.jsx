import { StarIcon } from './icons';

export default function Rating({ rating, sessions, className = '' }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-sm ${className}`}
      aria-label={`Rated ${rating.toFixed(1)} out of 5${sessions ? ` from ${sessions} sessions` : ''}`}
    >
      <StarIcon className="h-4 w-4 text-coral-400" aria-hidden="true" />
      <span className="font-semibold tabular-nums text-cream">{rating.toFixed(1)}</span>
      {sessions ? <span className="tabular-nums text-cream/65">({sessions})</span> : null}
    </div>
  );
}
