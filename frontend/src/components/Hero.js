import React from 'react';
import './Hero.css';

const Hero = ({ about }) => {
  const getImageUrl = (image) => {
    if (!image?.data) return null;
    const url = image.data.attributes.url;
    return url.startsWith('http') ? url : `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${url}`;
  };

  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-greeting">Hi, my name is</p>
          <h1 className="hero-name">
            {about?.name || 'Your Name'}
          </h1>
          <h2 className="hero-title">
            {about?.title || 'Full Stack Developer'}
          </h2>
          <p className="hero-description">
            {about?.bio || 'I build exceptional digital experiences that make a difference.'}
          </p>
          <div className="hero-buttons">
            <a href="#projects" className="btn btn-primary">
              View My Work
            </a>
            <a href="#contact" className="btn btn-secondary">
              Get In Touch
            </a>
          </div>
        </div>
        {about?.image && (
          <div className="hero-image">
            <img src={getImageUrl(about.image)} alt={about.name} />
          </div>
        )}
      </div>
      <div className="scroll-indicator">
        <span>Scroll Down</span>
        <div className="arrow"></div>
      </div>
    </section>
  );
};

export default Hero;

