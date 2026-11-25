import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import { executives } from '../data/executives';
import { services } from '../data/services';
import { getBookedSlots } from '../lib/api';
import { nextFreeSlot } from '../lib/slots';
import { prefersReducedMotion, scrollToId, setSmoothScroller } from '../lib/scroll';
import ExecutiveCard from '../components/ExecutiveCard';
import FAQ from '../components/FAQ';
import Reveal from '../components/Reveal';
import ZoomText from '../components/ZoomText';
import GlobeStage from '../components/GlobeStage';
import usePageTitle from '../lib/usePageTitle';
import { ArrowRightIcon, BadgeCheckIcon, CalendarIcon, ShieldIcon } from '../components/icons';

const HERO_HEADLINE = "You don't need your own network, you can access ours";

const steps = [
  {
    title: 'Find someone who has done it',
    description:
      'Choose from engineers, product leads, founders and recruiters. Every profile lists the topics they know and the questions they like to answer.',
  },
  {
    title: 'Pick a time that suits you',
    description:
      'Choose from the next 14 days of open slots. Availability is shown in your local time zone, so there is no mental arithmetic.',
  },
  {
    title: 'Bring your questions',
    description:
      'Meet for a focused session of specific, honest advice. Your confirmation includes the meeting link. You leave with a clearer next step, not a sales pitch.',
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
      'No. WinMe calls are focused advice sessions: career direction, interview preparation, a pitch review, or a decision you are working through. Operators share their experience and perspective, but cannot and do not promise jobs, offers, funding or any other outcome.',
  },
  {
    question: 'What happens if the executive does not show up?',
    answer:
      'You get a full refund. If anything goes wrong with a call, we will make it right rather than leave you chasing a credit.',
  },
  {
    question: 'How do the calls happen?',
    answer:
      'Every session happens live over video. Your booking confirmation includes a meeting link, a calendar file and a short preparation checklist.',
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

  const spinRef = useRef({ extra: 0 });
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

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, autoRaf: true });
    setSmoothScroller(lenis);

    return () => {
      setSmoothScroller(null);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative isolate">
      <GlobeStage executives={featured} nextSlots={nextSlots} spinRef={spinRef} />

      <section className="pointer-events-none relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_-10%,rgba(38,58,88,0.65),transparent_72%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[78%] bg-[linear-gradient(to_bottom,rgba(11,21,40,0.98)_0%,rgba(11,21,40,0.95)_32%,rgba(11,21,40,0.82)_46%,rgba(11,21,40,0.55)_60%,rgba(11,21,40,0.2)_74%,transparent_100%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent sm:h-56"
        />

        <div className="container-page pointer-events-none relative z-10 flex min-h-[calc(100svh-6.5rem)] flex-col items-center justify-center pb-28 pt-16 text-center sm:pb-36 sm:pt-20">
          <h1
            aria-label={HERO_HEADLINE}
            className="pointer-events-auto max-w-4xl text-[2.7rem] font-extrabold leading-[0.97] tracking-[-0.045em] text-cream sm:text-6xl lg:text-[4.6rem]"
          >
            <ZoomText
              text={HERO_HEADLINE}
              highlight="ours"
              highlightClassName="text-coral-500"
            />
          </h1>

          <p className="pointer-events-auto mt-7 max-w-xl text-base leading-relaxed text-cream/65 sm:text-lg">
            Reserve a private working session with an engineering director, product lead or founder.
            Bring the question you keep putting off. Leave with a next step.
          </p>

          <div className="pointer-events-auto mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link to="/executives" className="btn-primary w-full sm:w-auto">
              Book a meeting
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              onClick={(event) => {
                event.preventDefault();
                scrollToId('how-it-works');
              }}
              className="btn-secondary w-full sm:w-auto"
            >
              How it works
            </a>
          </div>

          <div aria-hidden="true" className="h-24 sm:h-36" />
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-page py-20 sm:py-28">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">The network</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-cream sm:text-4xl">
                People worth your time
              </h2>
            </div>
            <Link
              to="/executives"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cream underline decoration-coral-400 decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
            >
              View all 10
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((exec, index) => (
              <Reveal key={exec.id} className="h-full" delay={index * 90}>
                <ExecutiveCard exec={exec} index={index + 1} nextSlot={nextSlots[exec.id]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-page py-20 sm:py-28">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Services</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-cream sm:text-4xl">
                One job, one working session, a fixed price
              </h2>
              <p className="mt-4 max-w-xl text-cream/65">
                Pick the task you want help with, then choose who talks you through it. No uploads,
                no preparation decks, no promises.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cream underline decoration-coral-400 decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
            >
              See all seven services
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
            {services.slice(0, 3).map((service, index) => (
              <Reveal key={service.id} className="h-full" delay={index * 90}>
                <Link
                  to="/services"
                  className="card group flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cream/30 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                    <h3 className="text-xl font-bold leading-tight text-cream">{service.title}</h3>
                    <span className="shrink-0 text-lg font-bold text-cream">€{service.price}</span>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-cream/65">
                    {service.description}
                  </p>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-cream transition-colors group-hover:text-coral-400">
                    See who offers it
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-32 bg-cream text-navy">
        <div className="container-page py-20 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal>
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-500">
                <span className="h-px w-5 bg-coral-500" aria-hidden="true" />
                How it works
              </p>
              <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight tracking-[-0.03em] text-navy sm:text-4xl">
                Three steps, one honest conversation
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-500">
                No applications, no waiting for someone to reply to your email.
              </p>
              <Link
                to="/executives"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-navy underline decoration-coral-500 decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2 focus-visible:ring-navy focus-visible:ring-offset-cream"
              >
                Book a meeting
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Reveal>

            <ol className="divide-y divide-navy/15 border-y border-navy/15">
              {steps.map((step, index) => (
                <Reveal
                  as="li"
                  key={step.title}
                  delay={index * 90}
                  className="grid grid-cols-[auto_1fr] gap-5 py-6 sm:gap-7"
                >
                  <span className="text-2xl font-bold tabular-nums text-coral-700">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-navy">{step.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-500">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-page py-20 sm:py-28">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Why WinMe</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-cream sm:text-4xl">
              A small, honest marketplace
            </h2>
            <p className="mt-4 text-cream/65">
              We optimise for useful conversations, not for selling you a dream. That means clear
              profiles, fair prices and no promises we cannot keep.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
            {trustItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={index * 90} className="border-t-2 border-cream/25 pt-5">
                  <Icon className="h-5 w-5 text-coral-400" />
                  <h3 className="mt-4 text-lg font-bold text-cream">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/65">{item.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-cream sm:text-4xl">
              The questions before the questions
            </h2>
            <p className="mt-4 max-w-md text-cream/65">
              If something is still unclear, the short version is: advice only, no guarantees, and
              a refund if your operator does not show up.
            </p>
          </Reveal>
          <Reveal delay={90}>
            <FAQ items={faqs} />
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="grid gap-8 border-y border-cream/15 py-12 sm:py-16 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-[-0.03em] text-cream sm:text-5xl">
              Your next conversation could change the next six months
              <span className="text-coral-500">.</span>
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:justify-self-end">
            <p className="text-sm text-cream/60">One focused session. One honest conversation.</p>
            <Link to="/executives" className="btn-primary mt-5">
              Book a meeting
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
