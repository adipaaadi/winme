import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <span
      translate="no"
      className={`inline-flex items-baseline font-display text-[1.65rem] font-semibold leading-none tracking-[-0.035em] ${className}`}
    >
      WinMe<span className="text-coral-500">.</span>
    </span>
  );
}

export function LogoLink() {
  return (
    <Link to="/" className="inline-flex rounded-lg py-1" aria-label="WinMe home">
      <Logo />
    </Link>
  );
}
