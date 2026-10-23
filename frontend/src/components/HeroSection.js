import React from 'react';

const STATS = [
  { value: '5+', label: 'Years building' },
  { value: '30+', label: 'International clients' },
  { value: '100%', label: 'Upwork job success' },
];

const HeroSection = ({ resume }) => {
  const { profile } = resume;
  const links = profile.links || {};
  const [first, ...rest] = (profile.name || '').split(' ');

  return (
    <section id="home" className="site-hero">
      <p className="site-hero__badge">
        <span className="site-hero__dot" aria-hidden />
        {profile.location}
      </p>
      <h1 className="site-hero__name">
        {first} <span className="text-gradient">{rest.join(' ')}</span>
      </h1>
      <p className="site-hero__title">{profile.title}</p>
      <p className="site-hero__tagline">{profile.tagline}</p>
      <div className="site-hero__actions">
        <a className="site-btn site-btn--primary" href={`mailto:${profile.email}`}>
          Email me
        </a>
        {links.github && (
          <a className="site-btn site-btn--ghost" href={links.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        )}
        {links.linkedin && (
          <a className="site-btn site-btn--ghost" href={links.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        )}
        {links.website && (
          <a className="site-btn site-btn--ghost" href={links.website} target="_blank" rel="noopener noreferrer">
            Website
          </a>
        )}
      </div>
      <dl className="site-hero__stats">
        {STATS.map((s) => (
          <div key={s.label} className="site-hero__stat">
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default HeroSection;
