import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import './styles/portfolio.css';
import { ThemeProvider } from './context/ThemeContext';
import MainContent from './components/MainContent';
import LearnLayout from './pages/learn/LearnLayout';
import LearnCourseGrid from './pages/learn/LearnCourseGrid';
import LearnCourseRedirect from './pages/learn/LearnCourseRedirect';
import LearnLessonDoc from './pages/learn/LearnLessonDoc';
import { resume as fallbackResume } from './data/resume';
import { STRAPI_URL } from './config/strapi';
import { buildPortfolio } from './utils/portfolioFromStrapi';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [portfolio, setPortfolio] = useState(() => buildPortfolio({}, fallbackResume));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const base = `${STRAPI_URL}/api`;

    const fetchAll = async () => {
      const opts = { signal: controller.signal };
      const [aboutRes, skillsRes, projectsRes, experiencesRes, certsRes, langsRes] = await Promise.allSettled([
        axios.get(`${base}/about?populate=*`, opts),
        axios.get(`${base}/skills?populate=*&pagination[pageSize]=100`, opts),
        axios.get(`${base}/projects?populate=*&sort=createdAt:desc&pagination[pageSize]=50`, opts),
        axios.get(`${base}/experiences?populate=*&sort=startDate:desc&pagination[pageSize]=50`, opts),
        axios.get(`${base}/certifications?sort=sortOrder:asc&pagination[pageSize]=50`, opts),
        axios.get(`${base}/languages?sort=sortOrder:asc&pagination[pageSize]=50`, opts),
      ]);

      if (!controller.signal.aborted) {
        setPortfolio(
          buildPortfolio({ aboutRes, skillsRes, projectsRes, experiencesRes, certsRes, langsRes }, fallbackResume)
        );
      }
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    };

    fetchAll().catch(() => {
      if (!controller.signal.aborted) {
        setPortfolio(buildPortfolio({}, fallbackResume));
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, []);

  return (
    <ThemeProvider>
      <ScrollToTop />
      {loading ? (
        <div className="site-loading">
          <div className="spinner" />
          <p>Loading portfolio…</p>
        </div>
      ) : (
        <div className="site">
          <Routes>
            <Route path="/" element={<MainContent resume={portfolio} />} />
            <Route path="/learn" element={<LearnLayout resume={portfolio} />}>
              <Route index element={<LearnCourseGrid />} />
              <Route path=":courseSlug/:lessonSlug" element={<LearnLessonDoc />} />
              <Route path=":courseSlug" element={<LearnCourseRedirect />} />
            </Route>
          </Routes>
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;
