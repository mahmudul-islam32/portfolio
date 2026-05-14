import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import About from './About';
import Experience from './Experience';
import Skills from './Skills';
import Projects from './Projects';
import Certifications from './Certifications';
import Footer from './Footer';

const MainContent = ({ resume }) => {
  return (
    <main className="site-main">
      <Header profile={resume.profile} />
      <div className="site-inner">
        <HeroSection resume={resume} />
        <About resume={resume} />
        <Experience resume={resume} />
        <Skills resume={resume} />
        <Projects resume={resume} />
        <Certifications resume={resume} />
        <Footer resume={resume} />
      </div>
    </main>
  );
};

export default MainContent;
