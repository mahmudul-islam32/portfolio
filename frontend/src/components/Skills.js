import React from 'react';

const Skills = ({ resume }) => {
  const groups = resume.skillGroups || [];

  return (
    <section id="skills" className="site-section">
      <div className="site-section__head">
        <p className="site-section__label">Skills</p>
        <h2 className="site-section__title">Tools and domains</h2>
      </div>
      <div className="site-skills">
        {groups.map((g) => (
          <div key={g.title} className="site-skill-block">
            <h3>{g.title}</h3>
            <ul>
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
