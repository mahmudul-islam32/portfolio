import React from 'react';

const formatRange = (startDate, endDate, current) => {
  const fmt = (d) => {
    if (!d) return '';
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return '';
    return x.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };
  const start = fmt(startDate);
  const end = fmt(endDate);
  if (current && start) return `${start} — Present`;
  if (start && end) return `${start} — ${end}`;
  if (end) return end;
  if (start) return start;
  return '';
};

const Experience = ({ resume }) => {
  const work = resume.experience || [];
  const edu = resume.education || [];

  return (
    <section id="experience" className="site-section">
      <div className="site-section__head">
        <p className="site-section__label">Experience</p>
        <h2 className="site-section__title">Where I have built</h2>
      </div>
      <div className="site-timeline">
        {work.map((job) => (
          <article key={job.id} className="site-card">
            <div className="site-card__top">
              <h3 className="site-card__role">{job.role}</h3>
              <span className="site-card__dates">
                {formatRange(job.startDate, job.endDate, job.current)}
              </span>
            </div>
            <p className="site-card__company">{job.company}</p>
            <p className="site-card__loc">{job.location}</p>
            {job.stack?.length > 0 && (
              <p className="site-card__stack">{job.stack.join(' · ')}</p>
            )}
            {job.highlights?.length > 0 && (
              <ul>
                {job.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </article>
        ))}

        {edu.map((e) => (
          <article key={e.id} className="site-card">
            <div className="site-card__top">
              <h3 className="site-card__role">{e.degree}</h3>
              <span className="site-card__dates">{formatRange(e.startDate, e.endDate, e.current)}</span>
            </div>
            <p className="site-card__company">{e.school}</p>
            <p className="site-card__loc">{e.location}</p>
            {e.thesis && <p className="site-prose" style={{ marginTop: '0.75rem' }}>{e.thesis}</p>}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Experience;
