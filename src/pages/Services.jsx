import { Link } from 'react-router-dom';
import { getExecutive } from '../data/executives';
import { services } from '../data/services';
import usePageTitle from '../lib/usePageTitle';
import Avatar from '../components/Avatar';
import { ArrowRightIcon } from '../components/icons';

export default function Services() {
  usePageTitle('Services');

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-3xl animate-fade-up">
        <p className="eyebrow">Services</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
          One job, one working session, a fixed price
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream/65">
          A service is a fixed-price working session built around one job. You talk it through live
          with an operator who has done it. Nothing is uploaded, and every session is advice only.
        </p>

        <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t border-cream/15 pt-6">
          {[
            ['Services', 'Seven'],
            ['Scope', 'One job per session'],
            ['Format', 'Talk it through live'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                {label}
              </dt>
              <dd className="mt-1 text-xl font-bold text-cream">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-11 grid grid-cols-1 gap-5 md:grid-cols-2">
        {services.map((service) => (
          <section
            key={service.id}
            id={service.id}
            className="card flex flex-col p-6 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold leading-tight tracking-[-0.01em]">
                {service.title}
              </h2>
              <p className="shrink-0 rounded-full bg-coral-500/15 px-3 py-1 text-lg font-bold text-cream">
                €{service.price}
              </p>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-cream/65">{service.description}</p>

            <div className="mt-6 border-t border-line pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                Offered by
              </p>
              <ul className="mt-2 divide-y divide-line">
                {service.offeredBy.map((execId) => {
                  const exec = getExecutive(execId);
                  if (!exec) return null;

                  return (
                    <li key={execId} className="flex items-center gap-3 py-2.5">
                      <Avatar name={exec.name} gradient={exec.gradient} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-cream">{exec.name}</p>
                        <p className="truncate text-xs text-cream/65">
                          {exec.title} · {exec.company}
                        </p>
                      </div>
                      <Link
                        to={`/executives/${exec.id}?service=${service.id}`}
                        className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-full px-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
                      >
                        Book
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ))}

        <section className="card flex flex-col justify-between gap-6 border-navy/10 bg-cream p-6 text-navy sm:p-7 md:col-span-2 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.01em]">
              Have a service of your own?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-500">
              If you have done the job and can talk someone through it, we would like to hear from
              you.
            </p>
          </div>
          <Link to="/for-executives" className="btn-primary shrink-0">
            Place your offer
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-cream/65">
        Every service is still a focused advice session. Your operator cannot promise a job, an offer,
        funding, a promotion or any other outcome, and you get a full refund if they do not show up.
      </p>
    </div>
  );
}
