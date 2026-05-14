import React from 'react';
import './Sidebar.css';

const Sidebar = ({ about }) => {
  const getImageUrl = (image) => {
    if (!image?.data) return '/img/profile.png';
    const url = image.data.attributes.url;
    return url.startsWith('http') ? url : `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${url}`;
  };

  const fallbackData = {
    name: 'Aaabad Ahmed',
    title: 'Software Engineer',
    bio: 'A Software Engineer who has developed countless innovative solutions.',
  };

  const aboutData = about?.attributes || about || fallbackData;
  const socialLinks = aboutData.socialLinks || {};

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Curved dashed line decoration */}
        <svg className="dashed-curve" viewBox="0 0 200 300" fill="none" aria-hidden>
          <path
            d="M0 280 Q 20 150, 100 100 Q 160 60, 200 20"
            strokeWidth="2"
            strokeDasharray="12 10"
            strokeLinecap="round"
          />
        </svg>
        
        <div className="profile-card">
          <div className="profile-image-container">
            <img 
              src={getImageUrl(aboutData.image || about?.image)} 
              alt={aboutData.name}
              className="profile-image"
              onError={(e) => { e.target.src = '/img/profile.png'; }}
            />
          </div>
          
          <h1 className="profile-name">{aboutData.name || 'Aaabad Ahmed'}</h1>
          
          <div className="flame-section">
            <div className="flame-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="flame-icon-bg" cx="12" cy="12" r="12" />
                <path d="M12 5c-2 2.5-3 4.5-3 7 0 3 1.5 5 3 5s3-2 3-5c0-2.5-1-4.5-3-7z" fill="white" />
              </svg>
            </div>
            <svg className="flame-curve" viewBox="0 0 60 80" fill="none" aria-hidden>
              <path
                d="M30 0 Q 25 30, 10 55 Q 0 70, -15 80"
                strokeWidth="2"
                strokeDasharray="12 10"
                strokeLinecap="round"
              />
            </svg>
          </div>
          
          <p className="profile-bio">{aboutData.bio || 'A Software Engineer who has developed countless innovative solutions.'}</p>

          <div className="social-icons">
            <a href={socialLinks.dribbble || '#'} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/>
                <path d="M21.75 12.84C14.63 11.48 10.32 13.89 7.5 19.5"/>
                <path d="M8.56 2.75C12.93 8.78 14.34 15.67 13.12 20.72"/>
              </svg>
            </a>
            <a href={socialLinks.twitter || '#'} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </a>
            <a href={socialLinks.instagram || '#'} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href={socialLinks.youtube || '#'} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="4"/>
                <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
