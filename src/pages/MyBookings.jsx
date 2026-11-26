import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { clearBookings, getBookings } from '../lib/bookings';
import { getExecutive } from '../data/executives';
import { GENERAL_ADVICE } from '../data/services';
import { formatSlotLong } from '../lib/slots';
import usePageTitle from '../lib/usePageTitle';
import DemoBadge from '../components/DemoBadge';
import EmptyState from '../components/EmptyState';
import { SpotlightCard } from '../components/ui/spotlight-card';
import { ArrowRightIcon, CalendarIcon } from '../components/icons';

function BookingRow({ booking }) {
  const exec = getExecutive(booking.execId);
  const start = DateTime.fromISO(booking.slot);
  const upcoming = start.plus({ minutes: 30 }) > DateTime.now();

  return (
    <SpotlightCard
      as={Link}
      to={`/confirmed/${booking.id}`}
      className={`card group flex flex-col gap-4 p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:flex-row sm:items-center ${
        upcoming ? 'border-l-2 border-l-coral-500' : ''
      }`}
    >
      <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-navy-800/60 px-2 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-cream/65">
          {start.toFormat('ccc')}
        </span>
        <span className="text-xl font-bold leading-tight">{start.toFormat('d')}</span>
        <span className="text-[10px] uppercase tracking-wide text-cream/65">
          {start.toFormat('LLL')}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold leading-tight">
            {exec ? exec.name : booking.execName}
          </p>
          {booking.demo ? <DemoBadge /> : null}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              upcoming ? 'bg-coral-500/15 text-cream' : 'bg-cream/[0.08] text-cream/65'
            }`}
          >
            {upcoming ? 'Upcoming' : 'Completed'}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-cream/65">
          {exec ? `${exec.title} · ${exec.company}` : 'WinMe operator'}
        </p>
        <p className="mt-1 text-xs font-medium text-cream">
          {booking.serviceName || GENERAL_ADVICE}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-cream/65">
          <CalendarIcon className="h-4 w-4 text-coral-400" />
          {formatSlotLong(booking.slot)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-3 sm:border-0 sm:pt-0">
        <span className="text-sm font-semibold">€{booking.price}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cream transition-colors group-hover:text-coral-400">
          Details
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </SpotlightCard>
  );
}

export default function MyBookings() {
  usePageTitle('My bookings');
  const [bookings, setBookings] = useState(() => getBookings());
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!confirming) return undefined;

    confirmRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') closeConfirm();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirming]);

  function closeConfirm() {
    setConfirming(false);
    triggerRef.current?.focus();
  }

  function handleClear() {
    clearBookings();
    setBookings([]);
    setConfirming(false);
  }

  const sorted = [...bookings].sort(
    (a, b) => DateTime.fromISO(a.slot).toMillis() - DateTime.fromISO(b.slot).toMillis(),
  );
  const upcoming = sorted.filter(
    (booking) => DateTime.fromISO(booking.slot).plus({ minutes: 30 }) > DateTime.now(),
  );
  const past = sorted
    .filter((booking) => DateTime.fromISO(booking.slot).plus({ minutes: 30 }) <= DateTime.now())
    .reverse();

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <div className="animate-fade-up">
        <p className="eyebrow">My bookings</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
          Your conversations
        </h1>
        <p className="mt-4 max-w-2xl text-cream/65">
          Everything you have booked from this browser. Bookings are stored locally, so clearing
          site data or switching devices will remove them from this list.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No bookings yet"
            description="Once you book a meeting, it will appear here with the meeting link, calendar file and preparation checklist."
            actionLabel="Book a meeting"
            actionTo="/executives"
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {upcoming.length > 0 ? (
            <section>
              <h2 className="border-b border-cream/15 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                Upcoming
              </h2>
              <div className="mt-4 space-y-3">
                {upcoming.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          ) : null}

          {past.length > 0 ? (
            <section>
              <h2 className="border-b border-cream/15 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                Past
              </h2>
              <div className="mt-4 space-y-3">
                {past.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      {confirming ? (
        <div
          role="alertdialog"
          aria-labelledby="clear-bookings-title"
          aria-describedby="clear-bookings-description"
          className="mt-10 rounded-2xl border border-coral-500/40 bg-coral-500/10 p-5"
        >
          <p id="clear-bookings-title" className="text-lg font-bold">
            Clear bookings from this browser?
          </p>
          <p id="clear-bookings-description" className="mt-1.5 text-sm leading-relaxed text-cream/65">
            This removes all {bookings.length} booking{bookings.length === 1 ? '' : 's'} saved
            here, including meeting links and calendar files. It cannot be undone.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button ref={confirmRef} type="button" onClick={handleClear} className="btn-primary">
              Yes, clear bookings
            </button>
            <button type="button" onClick={closeConfirm} className="btn-secondary">
              Keep them
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-3 border-y border-line py-5 text-sm text-cream/65 sm:flex-row sm:items-center sm:justify-between">
        <p>Bookings are stored in this browser only. No account required.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {bookings.length > 0 ? (
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setConfirming(true)}
              className="font-semibold text-cream underline decoration-coral-400 decoration-1 underline-offset-4 hover:decoration-2"
            >
              Clear bookings from this browser
            </button>
          ) : null}
          <Link
            to="/executives"
            className="font-semibold text-cream underline decoration-coral-400 decoration-1 underline-offset-4 hover:decoration-2"
          >
            Book a meeting
          </Link>
        </div>
      </div>
    </div>
  );
}
