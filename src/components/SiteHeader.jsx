import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogoLink } from './Logo';
import { CloseIcon, MenuIcon } from './icons';

const links = [
  { to: '/executives', label: 'The network' },
  { to: '/services', label: 'Services' },
  { to: '/for-executives', label: 'Place an offer' },
  { to: '/my-bookings', label: 'My bookings' },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-cream/10 bg-navy text-cream">
        <p className="container-page py-1.5 text-center text-[10px] leading-relaxed tracking-[0.08em] text-cream/75 sm:text-[11px]">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-coral-500 align-middle" />
          Prototype with demo profiles. No real executives, no real payments.
        </p>
      </div>

      <div className="border-b border-line bg-navy-950">
        <nav className="container-page flex h-16 items-center justify-between gap-6" aria-label="Main">
          <LogoLink />

          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className="nav-link">
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/executives" className="btn-primary hidden px-4 py-2.5 sm:inline-flex">
              Book a meeting
            </Link>

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-navy-900 text-cream transition-colors hover:border-coral-400 hover:bg-cream/10 md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {menuOpen ? (
          <div id="mobile-menu" className="animate-fade-in border-t border-line bg-navy-950 md:hidden">
            <div className="container-page flex flex-col py-3">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex min-h-[48px] items-center border-b border-line px-1 text-base font-medium transition-colors ${
                      isActive ? 'text-cream' : 'text-cream/65 hover:text-cream'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/executives" className="btn-primary mt-4 w-full">
                Book a meeting
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
