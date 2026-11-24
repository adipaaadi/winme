import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import { getExecutive } from '../data/executives';
import { getService } from '../data/services';
import { formatSlotLong, zoneLabel } from '../lib/slots';
import { createBooking, isDemoMode } from '../lib/api';
import { saveBooking } from '../lib/bookings';
import usePageTitle from '../lib/usePageTitle';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import {
  AlertIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  GlobeIcon,
  LockIcon,
  ShieldIcon,
} from '../components/icons';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const roles = ['Student', 'Job seeker', 'Founder'];

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function FieldError({ id, children }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-navy"
    >
      <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
      {children}
    </p>
  );
}

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Please add your name.';
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.role) errors.role = 'Choose the option that fits best.';
  if (form.goal.trim().length < 10) {
    errors.goal = 'A sentence or two about your goal helps the operator prepare.';
  }
  if (!form.question1.trim()) errors.question1 = 'Add your first question.';
  if (!form.question2.trim()) errors.question2 = 'Add a second question.';
  if (!form.consent) errors.consent = 'Please confirm you understand how the call works.';
  return errors;
}

export default function Booking() {
  const { id } = useParams();
  const exec = getExecutive(id);
  const [searchParams] = useSearchParams();
  const slot = searchParams.get('slot');
  const requestedService = getService(searchParams.get('service'));
  const activeService =
    requestedService && exec && requestedService.offeredBy.includes(exec.id)
      ? requestedService
      : null;
  const price = activeService ? activeService.price : exec?.price;
  const profilePath = exec
    ? `/executives/${exec.id}${activeService ? `?service=${activeService.id}` : ''}`
    : '/executives';
  const navigate = useNavigate();

  usePageTitle(exec ? `Book ${exec.name}` : 'Booking');

  const [step, setStep] = useState('details');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    goal: '',
    question1: '',
    question2: '',
    question3: '',
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [payError, setPayError] = useState('');
  const paymentHeadingRef = useRef(null);

  useEffect(() => {
    if (step === 'payment') {
      paymentHeadingRef.current?.focus();
    }
  }, [step]);

  const slotIsValid = Boolean(
    slot && DateTime.fromISO(slot).isValid && DateTime.fromISO(slot) > DateTime.now(),
  );

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleContinue(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      const focusId = firstError === 'role' ? 'role-student' : firstError;
      document.getElementById(focusId)?.focus();
      return;
    }

    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handlePay() {
    if (processing) return;

    setProcessing(true);
    setPayError('');
    setProcessingLabel('Processing demo payment…');

    const details = {
      execId: exec.id,
      execName: exec.name,
      ...(activeService ? { serviceId: activeService.id, serviceName: activeService.title } : {}),
      price,
      slot,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      goal: form.goal.trim(),
      questions: [form.question1, form.question2, form.question3]
        .map((question) => question.trim())
        .filter(Boolean),
    };

    try {
      await wait(1500);
      setProcessingLabel('Reserving your slot…');
      const result = await createBooking(details);

      saveBooking({
        id: result.bookingId,
        createdAt: new Date().toISOString(),
        ...details,
        meetLink: result.meetLink || '',
        demo: isDemoMode,
      });

      navigate(`/confirmed/${result.bookingId}`);
    } catch (error) {
      setProcessing(false);
      if (error.code === 'SLOT_TAKEN') {
        navigate(`/executives/${exec.id}?slotTaken=1`);
        return;
      }
      setPayError(error.message || 'We could not complete the booking. Please try again.');
    }
  }

  if (!exec) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Operator not found"
          description="This profile may have moved, or the link is incomplete."
          actionLabel="Book a meeting"
          actionTo="/executives"
        />
      </div>
    );
  }

  if (!slotIsValid) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Choose a time first"
          description="This booking link does not include a valid upcoming slot. Pick a time on the operator’s profile and we will bring you back here."
          actionLabel={`See ${exec.name.split(' ')[0]}’s availability`}
          actionTo={`/executives/${exec.id}`}
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-5xl py-8 sm:py-12">
      <Link to={profilePath} className="btn-quiet -ml-3 mb-8">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to profile
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Book a meeting</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            {step === 'details' ? 'Tell us what you need' : 'Payment'}
          </h1>
        </div>

        <ol className="flex items-center gap-2 text-sm" aria-label="Booking progress">
          <li className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === 'payment' ? 'bg-navy text-cream' : 'bg-coral-500 text-navy'
              }`}
            >
              {step === 'payment' ? <CheckIcon className="h-3.5 w-3.5" /> : '1'}
            </span>
            <span className={step === 'details' ? 'font-semibold text-navy' : 'text-navy-500'}>
              Details
            </span>
          </li>
          <li aria-hidden="true" className="h-px w-6 bg-navy/15" />
          <li className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === 'payment'
                  ? 'bg-coral-500 text-navy'
                  : 'bg-navy/[0.06] text-navy-500'
              }`}
            >
              2
            </span>
            <span className={step === 'payment' ? 'font-semibold text-navy' : 'text-navy-500'}>
              Payment
            </span>
          </li>
        </ol>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
        <div>
          {step === 'details' ? (
            <form onSubmit={handleContinue} noValidate className="card animate-fade-up p-6 sm:p-8">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em]">
                  Your details
                </h2>
                <p className="mt-1.5 text-sm text-navy-500">
                  Used to send your booking and help the operator prepare. We never ask for a CV,
                  ID documents or other sensitive data.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    maxLength={80}
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    className={`field ${errors.name ? 'field-invalid' : ''}`}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name ? <FieldError id="name-error">{errors.name}</FieldError> : null}
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    className={`field ${errors.email ? 'field-invalid' : ''}`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email ? <FieldError id="email-error">{errors.email}</FieldError> : null}
                </div>
              </div>

              <fieldset className="mt-6">
                <legend className="label">Who are you?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {roles.map((role) => {
                    const inputId = `role-${role.toLowerCase().replace(/\s+/g, '-')}`;
                    return (
                      <label key={role} className="relative">
                        <input
                          id={inputId}
                          type="radio"
                          name="role"
                          value={role}
                          checked={form.role === role}
                          onChange={(event) => update('role', event.target.value)}
                          className="peer sr-only"
                        />
                        <span className="block cursor-pointer rounded-xl border border-line bg-cream-50 px-3 py-3 text-center text-sm font-medium text-navy-500 transition hover:border-navy/30 peer-checked:border-coral-500 peer-checked:bg-coral-50 peer-checked:text-navy peer-focus-visible:ring-2 peer-focus-visible:ring-navy-700 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cream">
                          {role}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.role ? <FieldError id="role-error">{errors.role}</FieldError> : null}
              </fieldset>

              <div className="mt-8 border-t border-line pt-6">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em]">
                  What you want to cover
                </h2>
                <p className="mt-1.5 text-sm text-navy-500">
                  Specific beats broad. A clear goal helps your operator spend the half hour well.
                </p>

                <div className="mt-6">
                  <label htmlFor="goal" className="label">
                    Your goal for the call
                  </label>
                  <textarea
                    id="goal"
                    rows={3}
                    maxLength={500}
                    value={form.goal}
                    onChange={(event) => update('goal', event.target.value)}
                    placeholder="For example: I want to move from backend engineering into a platform team and need help choosing what to learn next."
                    className={`field resize-y ${errors.goal ? 'field-invalid' : ''}`}
                    aria-invalid={Boolean(errors.goal)}
                    aria-describedby={errors.goal ? 'goal-error' : undefined}
                  />
                  {errors.goal ? <FieldError id="goal-error">{errors.goal}</FieldError> : null}
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="label mb-1">Specific questions</p>
                    <p className="-mt-0.5 mb-3 text-xs text-navy-500">
                      Two questions is the sweet spot. Add a third if it is important.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="question1" className="mb-1.5 block text-sm text-navy-500">
                      Question 1 <span className="text-navy/35">required</span>
                    </label>
                    <input
                      id="question1"
                      type="text"
                      maxLength={250}
                      value={form.question1}
                      onChange={(event) => update('question1', event.target.value)}
                      placeholder="What is the most useful thing I can do in the next month?"
                      className={`field ${errors.question1 ? 'field-invalid' : ''}`}
                      aria-invalid={Boolean(errors.question1)}
                      aria-describedby={errors.question1 ? 'question1-error' : undefined}
                    />
                    {errors.question1 ? (
                      <FieldError id="question1-error">{errors.question1}</FieldError>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="question2" className="mb-1.5 block text-sm text-navy-500">
                      Question 2 <span className="text-navy/35">required</span>
                    </label>
                    <input
                      id="question2"
                      type="text"
                      maxLength={250}
                      value={form.question2}
                      onChange={(event) => update('question2', event.target.value)}
                      placeholder="How would you approach this decision?"
                      className={`field ${errors.question2 ? 'field-invalid' : ''}`}
                      aria-invalid={Boolean(errors.question2)}
                      aria-describedby={errors.question2 ? 'question2-error' : undefined}
                    />
                    {errors.question2 ? (
                      <FieldError id="question2-error">{errors.question2}</FieldError>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="question3" className="mb-1.5 block text-sm text-navy-500">
                      Question 3 <span className="text-navy/35">optional</span>
                    </label>
                    <input
                      id="question3"
                      type="text"
                      maxLength={250}
                      value={form.question3}
                      onChange={(event) => update('question3', event.target.value)}
                      placeholder="Anything else you would like their view on?"
                      className="field"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-line bg-cream-100 p-4">
                <label className="flex items-start gap-3 text-sm leading-relaxed text-navy-500">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => update('consent', event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-coral-600"
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? 'consent-error' : undefined}
                  />
                  <span>
                    I understand this is a 30-minute advice call. No job, offer, funding, promotion
                    or other outcome is guaranteed.
                  </span>
                </label>
                {errors.consent ? (
                  <FieldError id="consent-error">{errors.consent}</FieldError>
                ) : null}
              </div>

              <button type="submit" className="btn-primary mt-6 w-full sm:w-auto">
                Continue to payment
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={processing}
                className="btn-quiet -ml-3"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to details
              </button>

              <div className="card animate-fade-up p-6 sm:p-8">
                <h2
                  ref={paymentHeadingRef}
                  tabIndex={-1}
                  className="font-display text-2xl font-semibold tracking-[-0.01em] outline-none"
                >
                  Demo checkout
                </h2>

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-coral-200 bg-coral-50 p-4 text-sm text-navy">
                  <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-coral-700" />
                  <div>
                    <p className="font-semibold">Demo payment, nothing is charged.</p>
                    <p className="mt-0.5 text-navy-500">
                      No card details are collected. This step exists to show the full booking flow.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-5 text-cream shadow-lift sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="h-7 w-10 rounded-md bg-gradient-to-br from-coral-400 to-coral-600" />
                    <CreditCardIcon className="h-6 w-6 text-cream/50" />
                  </div>
                  <p className="mt-8 font-mono text-lg tracking-[0.18em] text-cream/90">
                    •••• •••• •••• 4242
                  </p>
                  <div className="mt-5 flex items-end justify-between text-[11px] uppercase tracking-wider text-cream/50">
                    <span>WinMe demo card</span>
                    <span>12 / 30</span>
                  </div>
                </div>

                <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-navy-500">
                      {activeService ? activeService.title : '30-minute advice call'}
                    </dt>
                    <dd className="font-medium">€{price}</dd>
                  </div>
                  <div className="flex justify-between gap-4 text-base font-semibold">
                    <dt>Total</dt>
                    <dd>€{price}</dd>
                  </div>
                </dl>

                {payError ? (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2.5 rounded-xl border border-coral-300 bg-coral-50 p-3.5 text-sm text-navy"
                  >
                    <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-coral-700" />
                    <p>{payError}</p>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={processing}
                  className="btn-primary mt-6 w-full"
                >
                  {processing ? (
                    <>
                      <Spinner />
                      {processingLabel}
                    </>
                  ) : (
                    <>Pay €{price} (demo)</>
                  )}
                </button>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-navy-500">
                  <ShieldIcon className="h-3.5 w-3.5" />
                  Simulated checkout · no real payment · advice only
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="animate-fade-up [animation-delay:100ms]">
          <div className="card p-6 lg:sticky lg:top-28">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-400">
              Your session
            </p>

            <div className="mt-4 flex items-center gap-3 border-b border-line pb-5">
              <Avatar name={exec.name} gradient={exec.gradient} size="md" />
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold leading-tight">{exec.name}</p>
                <p className="mt-0.5 text-xs text-navy-500">
                  {exec.title} · {exec.company}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex gap-2.5">
                <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-700" />
                <div>
                  <p className="font-medium">{formatSlotLong(slot)}</p>
                  <p className="mt-0.5 text-xs text-navy-500">30 minutes on Google Meet</p>
                  <Link
                    to={profilePath}
                    className="mt-2 inline-block text-xs font-semibold text-navy underline decoration-coral-400 decoration-1 underline-offset-4 hover:decoration-2"
                  >
                    Change time
                  </Link>
                </div>
              </div>
              <div className="flex gap-2.5">
                <GlobeIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-700" />
                <p className="text-xs leading-relaxed text-navy-500">Times shown in {zoneLabel()}</p>
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <span className="text-sm text-navy-500">Session</span>
              <span className="text-sm font-medium">
                {activeService ? activeService.title : 'General advice call'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm text-navy-500">Total</span>
              <span className="font-display text-2xl font-semibold">€{price}</span>
            </div>

            <p className="mt-4 rounded-xl bg-cream-100 p-3 text-[11px] leading-relaxed text-navy-500">
              Advice only. You are booking the operator&apos;s time, not a guaranteed outcome.
              Full refund if they do not show up.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
