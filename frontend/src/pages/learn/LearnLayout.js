import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const LearnLayout = ({ resume }) => {
  return (
    <main className="site-main">
      <Header profile={resume.profile} />
      <Outlet />
      <Footer resume={resume} />
    </main>
  );
};

export default LearnLayout;
