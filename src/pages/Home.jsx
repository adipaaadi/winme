import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { executives } from '../data/executives';
import { services } from '../data/services';
import { getBookedSlots } from '../lib/api';
import { nextFreeSlot } from '../lib/slots';
import { scrollToId } from '../lib/scroll';
import ExecutiveCard from '../components/ExecutiveCard';
import FAQ from '../components/FAQ';
import Avatar from '../components/Avatar';
import Rating from '../components/Rating';
import usePageTitle from '../lib/usePageTitle';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CalendarIcon,
  ShieldIcon,
} from '../components/icons';

const steps = [
  {
    title: 'Find someone who has done it',
    description:
      'Choose from engineers, product leads, founders and recruiters. Every profile lists the topics they know and the questions they like to answer.',
  },
  {
    title: 'Pick a time that suits you',
    description:
      'Choose from the next 14 days of 30-minute slots. Availability is shown in your local time zone, so there is no mental arithmetic.',
  },
  {
    title: 'Bring your questions',
    description:
      'Meet for half an hour of specific, honest advice. Your confirmation includes the meeting link. You leave with a clearer next step, not a sales pitch.',
  },
];

const trustItems = [
  {
    icon: BadgeCheckIcon,
    title: 'Curated, specific profiles',
    description:
      'Every operator is chosen for real operating experience. Topics and sample questions help you find the right person before you pay.',
  },
  {
    icon: ShieldIcon,
    title: 'Advice, never a guarantee',
    description:
      'You are paying for someone’s time and perspective. No operator can promise a job, an offer, funding or any other outcome.',
  },
  {
    icon: CalendarIcon,
    title: 'Refunds if they no-show',
    description:
      'If your operator does not turn up, you get a full refund. No forms to fill in and no back-and-forth.',
  },
];

const faqs = [
  {
    question: 'Is this a job interview?',
    answer:
      'No. WinMe calls are 30 minutes of advice: career direction, interview preparation, a pitch review, or a decision you are working through. Operators share their experience and perspective, but cannot and do not promise jobs, offers, funding or any other outcome.',
  },
  {
    question: 'What happens if the executive does not show up?',
    answer:
      'You get a full refund. If anything goes wrong with a call, we will make it right rather than leave you chasing a credit.',
  },
  {
    question: 'How do the calls happen?',
    answer:
      'Every session is a 30-minute video call. Your booking confirmation includes a meeting link, a calendar file and a short preparation checklist.',
  },
  {
    question: 'Is my payment real?',
    answer:
      'No. WinMe is a pitch-event prototype. All ten operators are fictional, payment is simulated, and nothing is charged. The prototype is designed to show how the full booking experience would work.',
  },
];

const featured = executives.filter((exec) =>
  ['priya-raghavan', 'tomas-lehtinen', 'sofia-marchetti'].includes(exec.id),
);

export default function Home() {
  usePageTitle();

  const [nextSlots, setNextSlots] = useState({});

  useEffect(() => {
    let active = true;

    Promise.all(
      featured.map((exec) =>
        getBookedSlots(exec.id)
          .then((booked) => [exec.id, nextFreeSlot(exec, booked)])
          .catch(() => [exec.id, null]),
      ),
    ).then((entries) => {
      if (active) setNextSlots(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, []);

  const featuredExec = featured[0];
  const ticketSlot = nextSlots[featuredExec.id];

  const slotStart = ticketSlot ? DateTime.fromISO(ticketSlot).toLocal() : null;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-page grid gap-14 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <p className="eyebrow">The network, without the warm intro</p>

            <h1 className="mt-5 max-w-2xl font-display text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.035em] text-navy sm:text-6xl lg:text-[4.15rem]">
              You don&apos;t need your own network, you can access ours
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
              Book thirty minutes with an engineering director, product lead or founder. Bring the
              question you keep putting off. Leave with a next step.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/executives" className="btn-primary">
                Book a meeting
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToId('how-it-works');
                }}
                className="btn-secondary"
              >
                How it works
              </a>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-navy/15 pt-6">
              {[
                ['Operators', '10'],
                ['Call length', '30 min'],
                ['Promise', 'Advice only'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-400">
                    {label}
                  </dt>
                  <dd className="mt-1 font-display text-xl font-semibold text-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-sm animate-fade-up [animation-delay:120ms] lg:max-w-md lg:justify-self-end">
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-[24px] border border-navy/20 bg-cream-200"
            />

            <div className="relative overflow-hidden rounded-[24px] border border-navy/15 bg-cream-50 shadow-lift">
              <div className="flex items-center justify-between gap-3 bg-navy px-6 py-4 text-cream">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/55">
                  Booking 0417
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-coral-500" aria-hidden="true" />
                  Confirmed
                </span>
              </div>

              <div className="px-6 py-6 sm:px-7">
                <div className="flex items-center gap-3">
                  <Avatar name={featuredExec.name} gradient={featuredExec.gradient} size="md" />
                  <div>
                    <p className="font-display text-lg font-semibold leading-tight text-navy">
                      {featuredExec.name}
                    </p>
                    <p className="mt-0.5 text-xs text-navy-500">
                      {featuredExec.title} · {featuredExec.company}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
                      When
                    </p>
                    <p className="mt-1 text-sm font-semibold text-navy">
                      {slotStart
                        ? slotStart.toFormat('ccc d LLL')
                        : ticketSlot === undefined
                          ? 'Checking times'
                          : 'No open times'}
                    </p>
                    <p className="text-xs text-navy-500">
                      {slotStart
                        ? `${slotStart.toFormat('HH:mm')}–${slotStart.plus({ minutes: 30 }).toFormat('HH:mm')}`
                        : 'See availability'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
                      Where
                    </p>
                    <p className="mt-1 text-sm font-semibold text-navy">Video call</p>
                    <p className="text-xs text-navy-500">30 minutes</p>
                  </div>
                </div>

                <div className="relative my-6 border-t border-dashed border-navy/25">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[34px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-cream"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -right-[34px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-cream"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
                    Question to bring
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-500">
                    {featuredExec.goodQuestions[0]}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <Rating rating={featuredExec.rating} sessions={featuredExec.sessions} />
                  <span className="font-display text-xl font-semibold text-navy">
                    €{featuredExec.price}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 right-2 hidden rotate-[-3deg] rounded-full bg-coral-500 px-4 py-2 text-xs font-semibold text-navy shadow-soft sm:block">
              Advice, not a promise
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-32 bg-navy text-cream">
        <div className="container-page py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/55">
                <span className="h-px w-5 bg-coral-500" aria-hidden="true" />
                How it works
              </p>
              <h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                Three steps, one honest conversation
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
                No applications, no waiting for someone to reply to your email.
              </p>
              <Link
                to="/executives"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-cream underline decoration-coral-400 decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
              >
                Book a meeting
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <ol className="divide-y divide-cream/15 border-y border-cream/15">
              {steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[auto_1fr] gap-5 py-6 sm:gap-7">
                  <span className="font-display text-2xl font-semibold tabular-nums text-coral-400">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-cream">{step.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/60">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">The network</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              People worth half an hour
            </h2>
          </div>
          <Link
            to="/executives"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy underline decoration-coral-400 decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
          >
            View all 10
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((exec, index) => (
            <ExecutiveCard
              key={exec.id}
              exec={exec}
              index={index + 1}
              nextSlot={nextSlots[exec.id]}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-page py-16 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Services</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                One job, thirty minutes, a fixed price
              </h2>
              <p className="mt-4 max-w-xl text-navy-500">
                Pick the task you want help with, then choose who talks you through it. No uploads,
                no preparation decks, no promises.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy underline decoration-coral-400 decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
            >
              See all seven services
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <Link
                key={service.id}
                to="/services"
                className="card group flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                  <h3 className="font-display text-xl font-semibold leading-tight">
                    {service.title}
                  </h3>
                  <span className="shrink-0 font-display text-lg font-semibold">€{service.price}</span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-navy-500">
                  {service.description}
                </p>
                <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-navy transition-colors group-hover:text-coral-700">
                  See who offers it
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Why WinMe</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              A small, honest marketplace
            </h2>
            <p className="mt-4 text-navy-500">
              We optimise for useful conversations, not for selling you a dream. That means clear
              profiles, fair prices and no promises we cannot keep.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border-t-2 border-navy pt-5">
                  <Icon className="h-5 w-5 text-coral-700" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              The questions before the questions
            </h2>
            <p className="mt-4 max-w-md text-navy-500">
              If something is still unclear, the short version is: advice only, no guarantees, and
              a refund if your operator does not show up.
            </p>
          </div>
          <FAQ items={faqs} />
        </div>
      </section>

      <section className="container-page">
        <div className="grid gap-8 border-y-2 border-navy py-12 sm:py-16 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <h2 className="max-w-2xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
            Your next conversation could change the next six months
            <span className="text-coral-500">.</span>
          </h2>
          <div className="lg:justify-self-end">
            <p className="text-sm text-navy-500">Thirty minutes. One focused conversation.</p>
            <Link to="/executives" className="btn-primary mt-5">
              Book a meeting
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
