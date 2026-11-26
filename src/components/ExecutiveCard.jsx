import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import Avatar from './Avatar';
import Rating from './Rating';
import { SpotlightCard } from './ui/spotlight-card';
import { ArrowRightIcon } from './icons';

export default function ExecutiveCard({ exec, index, nextSlot }) {
  const number = index ? String(index).padStart(2, '0') : null;
  const next = nextSlot ? DateTime.fromISO(nextSlot).toLocal() : null;

  return (
    <SpotlightCard
      as={Link}
      to={`/executives/${exec.id}`}
      className="group flex h-full flex-col rounded-[20px] border border-line bg-navy-900 p-6 transition duration-200 hover:-translate-y-1 hover:border-cream/30 hover:shadow-lift"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
          {number ? `Operator ${number}` : 'Operator'}
        </span>
        <Rating rating={exec.rating} sessions={exec.sessions} />
      </div>

      <div className="mt-5 flex items-start gap-3">
        <Avatar name={exec.name} gradient={exec.gradient} size="md" />
        <div className="min-w-0">
          <h3 className="text-xl font-bold leading-tight tracking-[-0.01em] text-cream">
            {exec.name}
          </h3>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-cream/65">
            {exec.title}
          </p>
          <p className="mt-0.5 text-sm text-cream/65">{exec.company}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-cream/65">{exec.bio}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {exec.topics.slice(0, 2).map((topic) => (
          <span key={topic} className="chip">
            {topic}
          </span>
        ))}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-cream/65">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
        {nextSlot === undefined
          ? 'Checking next times'
          : next
            ? `Next free ${next.toFormat('ccc d LLL')} · ${next.toFormat('HH:mm')}`
            : 'No times in the next 14 days'}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-cream">€{exec.price}</span>
          <span className="text-xs text-cream/65">per session</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cream transition-colors group-hover:text-coral-400">
          View profile
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </SpotlightCard>
  );
}
