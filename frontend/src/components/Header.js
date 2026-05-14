import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = ({ profile }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleTheme, isLight } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const initials = profile?.name
    ? profile.name
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'MI';

  const items = [
    ['about', 'About'],
    ['experience', 'Work'],
    ['skills', 'Skills'],
    ['projects', 'Projects'],
    ['certifications', 'Certs'],
    ['contact', 'Contact'],
  ];

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header__inner">
        {isHome ? (
          <a href="#home" className="site-logo" onClick={(e) => { e.preventDefault(); go('home'); }}>
            {initials}<span>.</span>
          </a>
        ) : (
          <Link to="/" className="site-logo">
            {initials}<span>.</span>
          </Link>
        )}
        <div className="site-header__right">
          <nav className="site-nav" aria-label="Primary">
            {isHome &&
              items.map(([id, label]) => (
                <button key={id} type="button" onClick={() => go(id)}>
                  {label}
                </button>
              ))}
            {!isHome && (
              <NavLink
                to="/"
                end
                className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
              >
                Portfolio
              </NavLink>
            )}
            <NavLink
              to="/learn"
              className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
            >
              Learn with me
            </NavLink>
          </nav>
          <button
            type="button"
            className="site-theme-toggle"
            onClick={toggleTheme}
            aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
            title={isLight ? 'Dark mode' : 'Light mode'}
          >
            {isLight ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
