import React from 'react';

const DEFAULT_PARAGRAPHS = [
  'I build end-to-end products: typed APIs, resilient services, and interfaces people can trust. Recent work spans GovTech, sustainable commerce, and regulated healthcare platforms—with automation, payments, and observability baked in.',
  'I also design LLM features where retrieval and evaluation matter, not just prompts—so answers stay tied to real data and operations stay maintainable.',
];

const About = ({ resume }) => {
  const { profile } = resume;
  const paragraphs =
    Array.isArray(profile.aboutParagraphs) && profile.aboutParagraphs.length > 0
      ? profile.aboutParagraphs
      : DEFAULT_PARAGRAPHS;

  return (
    <section id="about" className="site-section">
      <div className="site-section__head">
        <p className="site-section__label">About</p>
        <h2 className="site-section__title">How I work</h2>
      </div>
      <div className="site-prose">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="site-pills" aria-label="Core stack">
        {(profile.coreStack || []).map((tech) => (
          <span key={tech} className="site-pill">
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
};

export default About;
