import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBooking } from '../lib/bookings';
import { getExecutive } from '../data/executives';
import { GENERAL_ADVICE } from '../data/services';
import { formatSlotLong, zoneLabel } from '../lib/slots';
import { downloadIcs } from '../lib/ics';
import usePageTitle from '../lib/usePageTitle';
import Avatar from '../components/Avatar';
import DemoBadge from '../components/DemoBadge';
import EmptyState from '../components/EmptyState';
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  GlobeIcon,
  ShieldIcon,
  VideoIcon,
} from '../components/icons';

export default function Confirmed() {
  const { bookingId } = useParams();
  const booking = useMemo(() => getBooking(bookingId), [bookingId]);
  const exec = booking ? getExecutive(booking.execId) : null;
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState({});

  usePageTitle(booking ? 'Booking confirmed' : 'Booking not found');

  if (!booking) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="We can’t find that booking"
          description="Bookings are stored in the browser that made them. If you cleared your site data or opened this link on another device, the booking will not be here."
          actionLabel="Book a meeting"
          actionTo="/executives"
        />
      </div>
    );
  }

  const questions = booking.questions || [];
  const prepItems = [
    ...questions.map((question, index) => ({
      id: `question-${index}`,
      label: `Have an answer ready for: “${question}”`,
    })),
    { id: 'quiet', label: 'Set aside uninterrupted time in a quiet spot with a stable connection.' },
    { id: 'tech', label: 'Test your camera and microphone before the call.' },
    { id: 'early', label: 'Open the meeting link two minutes early so you start on time.' },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(booking.meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function toggleItem(itemId) {
    setChecked((current) => ({ ...current, [itemId]: !current[itemId] }));
  }

  return (
    <div className="container-page max-w-5xl py-10 sm:py-14">
      <div className="flex animate-fade-up flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-navy">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
          You’re booked
        </h1>
        <p className="mt-4 max-w-xl text-cream/65">
          {booking.demo
            ? 'This demo booking is saved in your browser. Nothing was charged and no real invite was sent.'
            : `We’ve sent the details to ${booking.email}. Your operator has been notified too.`}
        </p>
        {booking.demo ? <DemoBadge className="mt-4">Demo booking</DemoBadge> : null}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
        <div className="space-y-6">
          <section className="card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
              <h2 className="text-2xl font-bold tracking-[-0.01em]">Your call</h2>
              <span className="rounded-full bg-coral-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream">
                Confirmed
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <Avatar
                name={booking.execName}
                gradient={exec ? exec.gradient : 'from-navy-700 to-navy-900'}
                size="lg"
              />
              <div>
                <p className="text-xl font-bold">{booking.execName}</p>
                <p className="text-sm text-cream/65">
                  {exec ? `${exec.title} · ${exec.company}` : 'WinMe operator'}
                </p>
                <div className="mt-3">
                  <span className="chip">{booking.serviceName || GENERAL_ADVICE}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-y border-line py-5 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream/55">
                  <CalendarIcon className="h-4 w-4" />
                  When
                </div>
                <p className="mt-2 text-sm font-semibold">{formatSlotLong(booking.slot)}</p>
                <p className="mt-0.5 text-xs text-cream/65">Live video session</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream/55">
                  <GlobeIcon className="h-4 w-4" />
                  Time zone
                </div>
                <p className="mt-2 text-sm font-semibold">Your local time</p>
                <p className="mt-0.5 break-words text-xs text-cream/65">{zoneLabel()}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link to="/my-bookings" className="btn-primary flex-1">
                View my bookings
              </Link>
              <button
                type="button"
                onClick={() => downloadIcs(booking)}
                className="btn-secondary flex-1"
              >
                <DownloadIcon className="h-4 w-4" />
                Add to calendar
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-cream/65">
              Add to calendar downloads an .ics file that works with Google Calendar, Apple Calendar
              and Outlook.
            </p>
          </section>

          <section className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <VideoIcon className="h-5 w-5 text-coral-400" />
              <h2 className="text-2xl font-bold tracking-[-0.01em]">
                Your meeting link
              </h2>
              {booking.demo ? <DemoBadge>Demo link</DemoBadge> : null}
            </div>

            {booking.meetLink ? (
              <>
                <p className="mt-2 text-sm text-cream/65">
                  The room is ready. Open it when it is time to start.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <a
                    href={booking.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary flex-1"
                  >
                    <VideoIcon className="h-4 w-4" />
                    Get a meeting link
                  </a>
                  <button type="button" onClick={copyLink} className="btn-secondary flex-1">
                    <CopyIcon className="h-4 w-4" />
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                </div>
                <p className="mt-3 break-all rounded-lg bg-navy-800/60 px-3 py-2 font-mono text-xs text-cream/65">
                  {booking.meetLink}
                </p>
                {booking.demo ? (
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-coral-500/30 bg-coral-500/10 p-3.5 text-sm text-cream">
                    <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-400" />
                    <p>Demo link — this meeting does not exist. Nothing has been scheduled.</p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-cream/65">
                Your meeting link will arrive with your calendar invitation.
              </p>
            )}
          </section>

          <section>
            <div className="flex items-start gap-3 border-l-2 border-coral-500 pl-5">
              <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-coral-400" />
              <div>
                <h2 className="text-lg font-bold">Advice only, remember</h2>
                <p className="mt-1 text-sm leading-relaxed text-cream/65">
                  Your operator will share experience and perspective. They are not promising a job,
                  an offer, funding, a promotion or any other outcome. If they do not show up, you
                  get a full refund.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-xl font-bold tracking-[-0.01em]">
              What to prepare
            </h2>
            <p className="mt-1 text-sm text-cream/65">
              A little thought now makes the session count.
            </p>
            <ul className="mt-4 space-y-3">
              {prepItems.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-cream/65">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[item.id])}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-coral-600"
                    />
                    <span className={checked[item.id] ? 'text-cream/55 line-through' : ''}>
                      {item.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-bold tracking-[-0.01em]">
              Booking details
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-cream/65">Booked for</dt>
                <dd className="mt-0.5 font-medium">{booking.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-cream/65">Email</dt>
                <dd className="mt-0.5 break-all font-medium">{booking.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-cream/65">Role</dt>
                <dd className="mt-0.5 font-medium">{booking.role}</dd>
              </div>
              <div>
                <dt className="text-xs text-cream/65">Session</dt>
                <dd className="mt-0.5 font-medium">{booking.serviceName || GENERAL_ADVICE}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="text-xs text-cream/65">Reference</dt>
                <dd className="font-mono text-xs font-semibold">{booking.id}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-cream/65">Paid</dt>
                <dd className="font-semibold">€{booking.price}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
