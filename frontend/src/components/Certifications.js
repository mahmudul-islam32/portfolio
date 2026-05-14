import React from 'react';

const normalizeCert = (item) => {
  if (typeof item === 'string') {
    return { label: item, url: null };
  }
  return { label: item.label, url: item.url || null };
};

const Certifications = ({ resume }) => {
  const items = resume.certifications || [];
  const langs = resume.languages || [];

  return (
    <section id="certifications" className="site-section">
      <div className="site-section__head">
        <p className="site-section__label">Credentials</p>
        <h2 className="site-section__title">Certifications & languages</h2>
      </div>
      <div className="site-list" style={{ marginBottom: langs.length ? '2.5rem' : 0 }}>
        {items.map((raw) => {
          const { label, url } = normalizeCert(raw);
          return (
            <div key={label} className="site-list-item">
              {url ? (
                <a
                  href={url}
                  className="site-cert-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                  <span className="site-cert-link__icon" aria-hidden>
                    ↗
                  </span>
                </a>
              ) : (
                label
              )}
            </div>
          );
        })}
      </div>
      {langs.length > 0 && (
        <div className="site-lang">
          {langs.map((l) => (
            <span key={l.name}>
              <strong>{l.name}</strong> — {l.level}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

export default Certifications;
