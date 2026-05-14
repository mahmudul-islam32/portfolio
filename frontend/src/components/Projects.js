import React from 'react';

const Projects = ({ resume }) => {
  const projects = resume.projects || [];

  return (
    <section id="projects" className="site-section">
      <div className="site-section__head">
        <p className="site-section__label">Projects</p>
        <h2 className="site-section__title">Selected build</h2>
      </div>
      <div className="site-projects">
        {projects.map((p) => (
          <article key={p.id} className="site-card site-project">
            <div className="site-project__year">{p.year}</div>
            <div className="site-project__body">
              <h3>{p.title}</h3>
              <p className="site-prose" style={{ fontSize: '0.9375rem' }}>
                {p.summary}
              </p>
              {p.description && (
                <p className="site-prose" style={{ fontSize: '0.9375rem', marginTop: '0.65rem' }}>
                  {p.description}
                </p>
              )}
              <div className="site-pills" style={{ marginTop: '1rem' }}>
                {p.technologies?.map((t, i) => (
                  <span key={`${p.id}-${i}-${t}`} className="site-pill">
                    {t}
                  </span>
                ))}
              </div>
              <div className="site-project__links">
                {p.githubUrl && (
                  <a className="site-link" href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                )}
                {p.liveUrl && (
                  <a className="site-link" href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                    Live
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Projects;
