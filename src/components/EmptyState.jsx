import { Link } from 'react-router-dom';
import { ArrowRightIcon } from './icons';

export default function EmptyState({ title, description, actionLabel, actionTo, children }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center sm:py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-100 text-navy">
        <span className="h-2.5 w-2.5 rounded-full bg-coral-500" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-navy-500">{description}</p>
      {children}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
