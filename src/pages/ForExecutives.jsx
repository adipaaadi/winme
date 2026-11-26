import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isDemoMode, submitExecInterest } from '../lib/api';
import { scrollToId } from '../lib/scroll';
import usePageTitle from '../lib/usePageTitle';
import {
  AlertIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  UsersIcon,
} from '../components/icons';
import Spinner from '../components/Spinner';
import { SpotlightCard } from '../components/ui/spotlight-card';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const benefits = [
  {
    icon: ClockIcon,
    title: 'Low effort, real signal',
    description:
      'Take two or three calls a week. No prep decks, no sales calls and no long-term commitment.',
  },
  {
    icon: CalendarIcon,
    title: 'Scheduling and payments, handled',
    description:
      'You publish availability once. We take care of bookings, reminders, payments and refunds.',
  },
  {
    icon: UsersIcon,
    title: 'Meet motivated people',
    description:
      'Students, career changers and founders arrive with specific questions. The conversations are focused by design.',
  },
];

const lookingFor = [
  'Eight or more years of hands-on operating experience',
  'A clear point of view and the willingness to be honest',
  'One session at a time, with no promises of outcomes',
  'Specific topics you genuinely enjoy talking about',
];

function FieldError({ children }) {
  return (
    <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-cream">
      <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
      {children}
    </p>
  );
}

function linkedInUrl(value) {
  const trimmed = value.trim();
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(candidate);

  if (url.protocol !== 'https:') throw new Error('not https');
  if (url.hostname !== 'linkedin.com' && !url.hostname.endsWith('.linkedin.com')) {
    throw new Error('not linkedin');
  }

  return url.toString();
}

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Please add your name.';
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.role.trim()) errors.role = 'Add your current role.';
  if (!form.company.trim()) errors.company = 'Add your company or practice.';

  try {
    linkedInUrl(form.linkedin);
  } catch {
    errors.linkedin = 'Enter your LinkedIn profile URL.';
  }

  return errors;
}

export default function ForExecutives() {
  usePageTitle('Place an offer');

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    linkedin: '',
    service: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setApiError('');

    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.keys(nextErrors)[0];
      document.getElementById(`interest-${firstError}`)?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const linkedin = linkedInUrl(form.linkedin);
      await submitExecInterest({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim(),
        company: form.company.trim(),
        linkedin,
        service: form.service.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      setApiError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
        <div className="animate-fade-up">
          <p className="eyebrow">Place an offer</p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Place your offer
            <span className="text-coral-500">.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/65">
            WinMe connects experienced operators with students, job seekers and founders who have
            specific questions. You bring the perspective. We handle everything around it.
          </p>

          <a
            href="#offer-form"
            onClick={(event) => {
              event.preventDefault();
              scrollToId('offer-form');
            }}
            className="btn-primary mt-7"
          >
            Place your offer
            <ArrowRightIcon className="h-4 w-4" />
          </a>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex gap-4 py-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-coral-400" />
                  <div>
                    <h2 className="text-lg font-bold">{benefit.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-cream/65">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
              What we look for
            </h2>
            <ul className="mt-3 space-y-2.5">
              {lookingFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-cream/65">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <SpotlightCard
            as="figure"
            className="mt-10 border border-cream/10 bg-navy p-6 text-cream sm:p-8"
          >
            <blockquote className="text-xl font-medium leading-relaxed">
              “The best calls are the ones where someone arrives with three real questions.”
            </blockquote>
            <figcaption className="mt-3 text-sm text-cream/60">
              Tomas Lehtinen · Founder, Kide
            </figcaption>
          </SpotlightCard>
        </div>

        <aside
          id="offer-form"
          className="animate-fade-up scroll-mt-28 lg:sticky lg:top-28 [animation-delay:100ms]"
        >
          {submitted ? (
            <SpotlightCard className="card p-7 text-center sm:p-9">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-navy">
                <CheckIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-[-0.01em]">
                Offer received, {form.name.trim().split(' ')[0]}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cream/65">
                We will review your offer and reply to {form.email.trim()}.
              </p>
              <p className="mt-4 rounded-xl bg-navy-800/60 px-4 py-3 text-xs leading-relaxed text-cream/65">
                {isDemoMode
                  ? 'Demo mode: this form is simulated and nothing was sent.'
                  : 'Your details are only used to review your offer on WinMe.'}
              </p>
              <Link to="/" className="btn-secondary mt-6">
                Back to home
              </Link>
            </SpotlightCard>
          ) : (
            <div className="space-y-4">
              <SpotlightCard
                as="form"
                variant="border"
                onSubmit={handleSubmit}
                noValidate
                className="card p-6 sm:p-8"
              >
                <h2 className="text-2xl font-bold tracking-[-0.02em]">
                  Place your offer
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-cream/65">
                  Tell us about your work. If there is a fit, we will set up a short intro call.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="interest-name" className="label">
                      Full name
                    </label>
                    <input
                      id="interest-name"
                      type="text"
                      autoComplete="name"
                      maxLength={80}
                      value={form.name}
                      onChange={(event) => update('name', event.target.value)}
                      className={`field ${errors.name ? 'field-invalid' : ''}`}
                      aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name ? <FieldError>{errors.name}</FieldError> : null}
                  </div>

                  <div>
                    <label htmlFor="interest-email" className="label">
                      Work email
                    </label>
                    <input
                      id="interest-email"
                      type="email"
                      autoComplete="email"
                      maxLength={120}
                      value={form.email}
                      onChange={(event) => update('email', event.target.value)}
                      className={`field ${errors.email ? 'field-invalid' : ''}`}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email ? <FieldError>{errors.email}</FieldError> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="interest-role" className="label">
                        Current role
                      </label>
                      <input
                        id="interest-role"
                        type="text"
                        maxLength={80}
                        value={form.role}
                        onChange={(event) => update('role', event.target.value)}
                        placeholder="VP of Engineering"
                        className={`field ${errors.role ? 'field-invalid' : ''}`}
                        aria-invalid={Boolean(errors.role)}
                      />
                      {errors.role ? <FieldError>{errors.role}</FieldError> : null}
                    </div>

                    <div>
                      <label htmlFor="interest-company" className="label">
                        Company
                      </label>
                      <input
                        id="interest-company"
                        type="text"
                        maxLength={80}
                        value={form.company}
                        onChange={(event) => update('company', event.target.value)}
                        className={`field ${errors.company ? 'field-invalid' : ''}`}
                        aria-invalid={Boolean(errors.company)}
                      />
                      {errors.company ? <FieldError>{errors.company}</FieldError> : null}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interest-linkedin" className="label">
                      LinkedIn URL
                    </label>
                    <input
                      id="interest-linkedin"
                      type="url"
                      inputMode="url"
                      maxLength={200}
                      value={form.linkedin}
                      onChange={(event) => update('linkedin', event.target.value)}
                      placeholder="linkedin.com/in/your-name"
                      className={`field ${errors.linkedin ? 'field-invalid' : ''}`}
                      aria-invalid={Boolean(errors.linkedin)}
                    />
                    {errors.linkedin ? <FieldError>{errors.linkedin}</FieldError> : null}
                  </div>

                  <div>
                    <label htmlFor="interest-service" className="label">
                      A service you&apos;d like to offer
                    </label>
                    <textarea
                      id="interest-service"
                      rows={3}
                      maxLength={400}
                      value={form.service}
                      onChange={(event) => update('service', event.target.value)}
                      placeholder="For example: a mock interview for product roles, or a pitch review for first-time founders."
                      className="field resize-y"
                    />
                    <p className="mt-1.5 text-xs leading-relaxed text-cream/65">
                      Optional. One job you can talk someone through in a single session.
                    </p>
                  </div>
                </div>

                {apiError ? (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2.5 rounded-xl border border-coral-500/40 bg-coral-500/10 p-3.5 text-sm text-cream"
                  >
                    <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-400" />
                    <p>{apiError}</p>
                  </div>
                ) : null}

                <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
                  {submitting ? (
                    <>
                      <Spinner />
                      Sending…
                    </>
                  ) : (
                    <>
                      Place your offer
                      <ArrowRightIcon className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/65">
                  {isDemoMode
                    ? 'Demo mode: submissions are simulated and not sent anywhere.'
                    : 'We only use these details to review your offer. No mailing list.'}
                </p>
              </SpotlightCard>

              <SpotlightCard className="card p-6">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                  What happens next
                </h2>
                <ol className="mt-4 space-y-3">
                  {[
                    [
                      'We review your profile',
                      'A short check that your experience fits the topics people ask about.',
                    ],
                    [
                      'A 20-minute intro call',
                      'We walk through the format, expectations and the time commitment.',
                    ],
                    [
                      'You set your topics and hours',
                      'Choose what you want to talk about and when you are free.',
                    ],
                  ].map(([title, text], index) => (
                    <li key={title} className="flex gap-3">
                      <span className="text-sm font-semibold tabular-nums text-coral-400">
                        0{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-cream/65">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </SpotlightCard>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
