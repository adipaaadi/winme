import { Link } from 'react-router-dom';
import usePageTitle from '../lib/usePageTitle';
import { ArrowLeftIcon } from '../components/icons';

export default function NotFound() {
  usePageTitle('Page not found');

  return (
    <div className="container-page flex flex-col items-start py-24 sm:py-32">
      <p className="text-sm font-semibold tracking-[0.2em] text-coral-400">404</p>
      <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-[-0.03em] sm:text-6xl">
        This page took a wrong turn<span className="text-coral-500">.</span>
      </h1>
      <p className="mt-4 max-w-md text-cream/65">
        The link may be incomplete, or the page no longer exists. The good news is that the network
        is still here.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
