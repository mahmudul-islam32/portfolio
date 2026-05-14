import React from 'react';

const Footer = ({ resume }) => {
  const year = new Date().getFullYear();
  const { profile } = resume;
  const links = profile.links || {};

  return (
    <footer id="contact" className="site-footer">
      <div className="site-footer__links">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        {links.github && (
          <a href={links.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        )}
        {links.linkedin && (
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        )}
        {links.website && (
          <a href={links.website} target="_blank" rel="noopener noreferrer">
            Website
          </a>
        )}
      </div>
      <p className="site-footer__copy">
        © {year} {profile.name}. Built with React.
      </p>
    </footer>
  );
};

export default Footer;
