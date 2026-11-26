import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import Avatar from './Avatar';
import { SpotlightCard } from './ui/spotlight-card';

export default function GlobeProfileCard({ exec, nextSlot, className = '' }) {
  const next = nextSlot ? DateTime.fromISO(nextSlot).toLocal() : null;

  return (
    <SpotlightCard
      as={Link}
      to={`/executives/${exec.id}`}
      className={`pointer-events-auto block w-56 rounded-2xl border border-cream/15 bg-navy-800 p-3 shadow-soft transition-colors hover:border-cream/30 hover:bg-navy-700 sm:w-60 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={exec.name} gradient={exec.gradient} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-bold leading-tight text-cream">{exec.name}</p>
            <span className="shrink-0 rounded-full bg-coral-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-navy">
              €{exec.price}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-cream/55">
            {exec.title} · {exec.company}
          </p>
        </div>
      </div>

      <p className="mt-2 hidden truncate border-t border-cream/10 pt-2 text-[10px] text-cream/45 sm:block">
        {nextSlot === undefined
          ? 'Checking next times'
          : next
            ? `Next free ${next.toFormat('ccc d LLL')} · ${next.toFormat('HH:mm')}`
            : 'No times in the next 14 days'}
      </p>
    </SpotlightCard>
  );
}
