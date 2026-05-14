import React from 'react';

const HeroSection = ({ resume }) => {
  const { profile } = resume;
  const links = profile.links || {};

  return (
    <section id="home" className="site-hero">
      <p className="site-hero__eyebrow">Portfolio · {profile.location}</p>
      <h1 className="site-hero__name">{profile.name}</h1>
      <p className="site-hero__title">{profile.title}</p>
      <p className="site-hero__tagline">{profile.tagline}</p>
      <div className="site-hero__meta">
        <span>{profile.email}</span>
        <span>{profile.phone}</span>
      </div>
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
    </section>
  );
};

export default HeroSection;
