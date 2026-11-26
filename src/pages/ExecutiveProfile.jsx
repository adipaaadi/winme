import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import { getExecutive } from '../data/executives';
import { GENERAL_ADVICE, getServicesForExecutive } from '../data/services';
import { generateSlots, groupSlotsByDay, formatSlotLong, zoneLabel } from '../lib/slots';
import { getBookedSlots } from '../lib/api';
import usePageTitle from '../lib/usePageTitle';
import Avatar from '../components/Avatar';
import Rating from '../components/Rating';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { SpotlightCard } from '../components/ui/spotlight-card';
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  GlobeIcon,
  ShieldIcon,
  VideoIcon,
} from '../components/icons';

export default function ExecutiveProfile() {
  const { id } = useParams();
  const exec = getExecutive(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slotTaken = searchParams.get('slotTaken') === '1';

  usePageTitle(exec ? exec.name : 'Operator not found');

  const slots = useMemo(() => (exec ? generateSlots(exec) : []), [exec]);
  const days = useMemo(() => groupSlotsByDay(slots), [slots]);
  const services = useMemo(() => (exec ? getServicesForExecutive(exec.id) : []), [exec]);
  const requestedService = searchParams.get('service');

  const [selectedDayKey, setSelectedDayKey] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(() => {
    const requested = services.find((service) => service.id === requestedService);
    return requested ? requested.id : 'general';
  });
  const [booked, setBooked] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!exec) return undefined;

    let active = true;
    setLoadingAvailability(true);
    setAvailabilityError('');

    getBookedSlots(exec.id)
      .then((list) => {
        if (active) setBooked(list);
      })
      .catch((error) => {
        if (active) setAvailabilityError(error.message);
      })
      .finally(() => {
        if (active) setLoadingAvailability(false);
      });

    return () => {
      active = false;
    };
  }, [exec, retryCount]);

  useEffect(() => {
    const requested = services.find((service) => service.id === requestedService);
    setSelectedServiceId(requested ? requested.id : 'general');
  }, [services, requestedService]);

  const bookedTimes = useMemo(
    () => new Set(booked.map((iso) => DateTime.fromISO(iso).toMillis())),
    [booked],
  );

  function isBooked(iso) {
    return bookedTimes.has(DateTime.fromISO(iso).toMillis());
  }

  const totalSlots = slots.length;
  const fullyBooked =
    totalSlots > 0 && days.every((day) => day.slots.every((iso) => isBooked(iso)));

  const activeDay = days.find((day) => day.key === selectedDayKey) || days[0];
  const activeSlots = activeDay?.slots || [];
  const selectedService = services.find((service) => service.id === selectedServiceId) || null;
  const price = selectedService ? selectedService.price : exec?.price;

  function chooseDay(day) {
    setSelectedDayKey(day.key);
    setSelectedSlot(null);
  }

  function continueToBooking() {
    const params = new URLSearchParams({ slot: selectedSlot });
    if (selectedService) params.set('service', selectedService.id);
    navigate(`/book/${exec.id}?${params.toString()}`);
  }

  function dayHasSpace(day) {
    return day.slots.some((iso) => !isBooked(iso));
  }

  if (!exec) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Operator not found"
          description="This profile may have moved, or the link is incomplete. Book a meeting to find someone else."
          actionLabel="Book a meeting"
          actionTo="/executives"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to="/executives" className="btn-quiet -ml-3 mb-8">
        <ArrowLeftIcon className="h-4 w-4" />
        The network
      </Link>

      {slotTaken ? (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-2xl border border-coral-500/40 bg-coral-500/10 px-4 py-3.5 text-sm text-cream"
        >
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-coral-400" />
          <p>
            That time was just booked by someone else. Pick another slot below and we will hold it
            for you while you finish checkout.
          </p>
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-14">
        <div className="animate-fade-up">
          <section className="border-b border-cream/15 pb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar name={exec.name} gradient={exec.gradient} size="xl" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                  Operator profile
                </p>
                <h1 className="mt-1 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
                  {exec.name}
                </h1>
                <p className="mt-2 text-cream/65">
                  {exec.title} at <span className="font-medium text-cream">{exec.company}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Rating rating={exec.rating} sessions={exec.sessions} />
                  <span className="inline-flex items-center gap-1.5 text-sm text-cream/65">
                    <VideoIcon className="h-4 w-4" />
                    Live video session
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {exec.topics.map((topic) => (
                <span key={topic} className="chip">
                  {topic}
                </span>
              ))}
            </div>
          </section>

          <section className="border-b border-line py-8">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
              About
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream/65">{exec.bio}</p>
          </section>

          {services.length > 0 ? (
            <section className="border-b border-line py-8">
              <h2 className="text-2xl font-bold tracking-[-0.01em]">
                Services {exec.name.split(' ')[0]} offers
              </h2>
              <p className="mt-2 text-sm text-cream/65">
                Fixed-price working sessions built around one job. Choose one in the booking panel,
                or start with a general advice call.
              </p>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {services.map((service) => (
                  <li key={service.id}>
                    <Link
                      to={`/executives/${exec.id}?service=${service.id}`}
                      className="group flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                    >
                      <div>
                        <p className="text-lg font-bold">{service.title}</p>
                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-cream/65">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                        <span className="text-lg font-bold">€{service.price}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-cream transition-colors group-hover:text-coral-400">
                          Select
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="border-b border-line py-8">
            <h2 className="text-2xl font-bold tracking-[-0.01em]">
              Good questions to bring
            </h2>
            <p className="mt-2 text-sm text-cream/65">
              Not a script. A starting point, so you arrive with something specific to work on.
            </p>
            <ol className="mt-6 divide-y divide-line border-y border-line">
              {exec.goodQuestions.map((question, index) => (
                <li key={question} className="flex gap-4 py-4">
                  <span className="text-sm font-semibold tabular-nums text-coral-400">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-cream/65">{question}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="py-8">
            <div className="flex items-start gap-3 border-l-2 border-coral-500 pl-5">
              <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-coral-400" />
              <div>
                <h2 className="text-lg font-bold">Advice only, not a guarantee</h2>
                <p className="mt-1 text-sm leading-relaxed text-cream/65">
                  You are paying for an operator&apos;s time, attention and perspective. They
                  cannot promise a job, an offer, funding, a promotion or any other outcome. If your
                  operator does not show up, you get a full refund.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="animate-fade-up lg:sticky lg:top-28 [animation-delay:100ms]">
          <SpotlightCard variant="border" className="card p-6">
            <div className="border-b border-line pb-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-3xl font-bold tracking-[-0.02em]">
                  €{price}
                </p>
                <p className="text-sm text-cream/65">Per session · video call</p>
              </div>
              <p className="mt-1 text-xs text-cream/65">
                {selectedService ? selectedService.title : GENERAL_ADVICE}
              </p>
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-cream/65">
              <GlobeIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Times shown in {zoneLabel()}. Slots are released for the next 14 days.
            </p>

            <fieldset className="mt-6">
              <legend className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                Session type
              </legend>
              <div className="mt-2 space-y-2">
                <label className="relative block">
                  <input
                    type="radio"
                    name="session-type"
                    value="general"
                    checked={selectedServiceId === 'general'}
                    onChange={() => setSelectedServiceId('general')}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-navy-900 px-3.5 py-3 text-sm transition hover:border-cream/30 peer-checked:border-coral-500 peer-checked:bg-coral-500/15 peer-focus-visible:ring-2 peer-focus-visible:ring-coral-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-navy-950">
                    <span className="font-medium text-cream">{GENERAL_ADVICE}</span>
                    <span className="shrink-0 font-semibold text-cream">€{exec.price}</span>
                  </span>
                </label>

                {services.map((service) => (
                  <label key={service.id} className="relative block">
                    <input
                      type="radio"
                      name="session-type"
                      value={service.id}
                      checked={selectedServiceId === service.id}
                      onChange={() => setSelectedServiceId(service.id)}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-navy-900 px-3.5 py-3 text-sm transition hover:border-cream/30 peer-checked:border-coral-500 peer-checked:bg-coral-500/15 peer-focus-visible:ring-2 peer-focus-visible:ring-coral-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-navy-950">
                      <span className="font-medium text-cream">{service.title}</span>
                      <span className="shrink-0 font-semibold text-cream">€{service.price}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {days.length === 0 || fullyBooked ? (
              <div className="mt-6 rounded-2xl border border-line bg-navy-800/60 p-4">
                <p className="text-sm font-semibold text-cream">
                  {days.length === 0 ? 'No availability in the next 14 days' : 'Fully booked'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-cream/65">
                  {days.length === 0
                    ? 'This operator has not published any times for the next two weeks. Browse the network to find someone else.'
                    : 'Every published time in the next 14 days is taken. New times appear as the window moves.'}
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                    Pick a day
                  </p>
                  <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                    {days.map((day) => {
                      const hasSpace = dayHasSpace(day);
                      const active = activeDay?.key === day.key;
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => chooseDay(day)}
                          disabled={!hasSpace}
                          aria-pressed={active}
                          className={`flex min-w-[64px] flex-col items-center rounded-xl border px-2.5 py-2 transition ${
                            active
                              ? 'border-coral-500 bg-coral-500 text-navy'
                              : hasSpace
                                ? 'border-line bg-navy-900 text-cream hover:border-coral-400'
                                : 'cursor-not-allowed border-line bg-cream/[0.04] text-cream/25'
                          }`}
                        >
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wide ${
                              active ? 'opacity-90' : 'opacity-70'
                            }`}
                          >
                            {day.date.toFormat('ccc')}
                          </span>
                          <span className="text-lg font-bold leading-tight">
                            {day.date.toFormat('d')}
                          </span>
                          <span className={`text-[10px] ${active ? 'opacity-90' : 'opacity-70'}`}>
                            {hasSpace ? day.date.toFormat('LLL') : 'Full'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                      Pick a time
                    </p>
                    {loadingAvailability ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-cream/65">
                        <Spinner className="h-3.5 w-3.5" />
                        Checking
                      </span>
                    ) : null}
                  </div>

                  {loadingAvailability ? (
                    <div className="mt-2 grid grid-cols-3 gap-2" aria-hidden="true">
                      {[0, 1, 2, 3, 4, 5].map((key) => (
                        <div key={key} className="h-10 animate-pulse rounded-xl bg-cream/[0.08]" />
                      ))}
                    </div>
                  ) : availabilityError ? (
                    <div className="mt-2 rounded-xl border border-line bg-navy-800/60 p-3 text-xs text-cream/65">
                      <p>{availabilityError}</p>
                      <button
                        type="button"
                        onClick={() => setRetryCount((count) => count + 1)}
                        className="mt-2 font-semibold text-cream underline decoration-coral-400 decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        Try again
                      </button>
                    </div>
                  ) : activeSlots.length === 0 ? (
                    <p className="mt-2 rounded-xl bg-navy-800/60 px-3 py-4 text-center text-sm text-cream/65">
                      No slots left in the next 14 days.
                    </p>
                  ) : (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {activeSlots.map((iso) => {
                        const bookedSlot = isBooked(iso);
                        const selected = selectedSlot === iso;
                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={bookedSlot}
                            onClick={() => setSelectedSlot(iso)}
                            aria-pressed={selected}
                            aria-label={`${formatSlotLong(iso)}${bookedSlot ? ', already booked' : ''}`}
                            className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition ${
                              selected
                                ? 'border-coral-500 bg-coral-500 text-navy'
                                : bookedSlot
                                  ? 'cursor-not-allowed border-line bg-cream/[0.04] text-cream/25 line-through'
                                  : 'border-line bg-navy-900 text-cream hover:border-coral-400'
                            }`}
                          >
                            {DateTime.fromISO(iso).toLocal().toFormat('HH:mm')}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mt-6 border-t border-line pt-5">
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={continueToBooking}
                className="btn-primary w-full"
              >
                Continue to booking
              </button>
              <p className="mt-3 min-h-[16px] text-center text-xs text-cream/65">
                {selectedSlot
                  ? formatSlotLong(selectedSlot)
                  : days.length === 0 || fullyBooked
                    ? 'No times to select right now'
                    : 'Select a time to continue'}
              </p>
            </div>

            <p className="mt-2 text-center text-[11px] leading-relaxed text-cream/65">
              Advice only. Full refund if the operator does not show up.
            </p>
          </SpotlightCard>
        </aside>
      </div>
    </div>
  );
}
