import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-cream/10 bg-navy text-cream">
      <div className="container-page py-14">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
              Thirty minutes with the people who have done it. Advice calls with experienced
              operators, booked around your schedule.
            </p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-cream/50">
              WinMe is a pitch-event prototype. Every executive, company and review is fictional,
              and payments are simulated.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">
              Explore
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li>
                <Link to="/services" className="transition-colors hover:text-cream">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/executives" className="transition-colors hover:text-cream">
                  Book a meeting
                </Link>
              </li>
              <li>
                <Link to="/for-executives" className="transition-colors hover:text-cream">
                  Place an offer
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="transition-colors hover:text-cream">
                  My bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">
              Good to know
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li>30-minute calls</li>
              <li>Advice only, no guarantees</li>
              <li>Full refund if an exec no-shows</li>
              <li>Ten demo profiles</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">
              Access
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-cream/75">
              Built for students, job seekers and founders who need a straight answer from someone
              who has been there.
            </p>
            <Link
              to="/executives"
              className="mt-4 inline-flex text-sm font-semibold text-cream underline decoration-coral-400 decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
            >
              Book a meeting
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WinMe. A concept prototype.</p>
          <p>Sessions are advice only. No outcomes are guaranteed.</p>
        </div>
      </div>
    </footer>
  );
}
