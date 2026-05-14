'use strict';

/**
 * Seeds default portfolio content on first Strapi boot when tables are empty.
 * Safe to run repeatedly: skips any type that already has data.
 */

const PUBLISHED = { publishedAt: new Date() };

const SEED = {
  about: {
    name: 'Mahmudul Islam',
    title: 'Software Engineer',
    tagline:
      'Full-stack engineer with 5+ years building scalable web platforms, cloud infrastructure, APIs, and microservices. Strong in TypeScript, Python, and pragmatic AI—LLM assistants, RAG, and vector search for real users.',
    bio: `Full-stack engineer with 5+ years building scalable web platforms, cloud infrastructure, APIs, and microservices. Strong in TypeScript, Python, and pragmatic AI—LLM assistants, RAG, and vector search for real users.

Edit this bio in Strapi Admin → About.`,
    aboutParagraphs: [
      'I build end-to-end products: typed APIs, resilient services, and interfaces people can trust. Recent work spans GovTech, sustainable commerce, and regulated healthcare platforms—with automation, payments, and observability baked in.',
      'I also design LLM features where retrieval and evaluation matter, not just prompts—so answers stay tied to real data and operations stay maintainable.',
    ],
    coreStack: [
      'Python',
      'TypeScript',
      'React',
      'Node.js',
      'FastAPI',
      'SQL',
      'MongoDB',
      'LLM integration',
      'RAG',
      'Vector DB',
    ],
    email: 'dev.mahmudislam@gmail.com',
    phone: '+49 176 3444 2721',
    location: 'Celle, Germany',
    address: 'Welfenallee 57, 29225 Celle, Germany',
    socialLinks: {
      github: 'https://github.com/mahmudul-islam32',
      linkedin: 'https://linkedin.com/in/mohammad-mahmudul',
      website: 'https://mdislam.dev',
    },
  },

  skillGroups: [
    { title: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'PHP'] },
    { title: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'NestJS', 'Express', 'FastAPI', 'SvelteKit'] },
    {
      title: 'Integration & APIs',
      items: ['REST', 'API design', 'optimization', 'gateways', 'WebSocket'],
    },
    {
      title: 'Architecture',
      items: ['Microservices', 'event-driven design', 'RabbitMQ', 'system integration'],
    },
    { title: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB'] },
    { title: 'AI engineering', items: ['LLM apps', 'RAG', 'vector search', 'prompting', 'OpenAI API'] },
    {
      title: 'Platform & delivery',
      items: ['Docker', 'Terraform', 'GitHub Actions', 'GitLab CI', 'AWS EC2', 'Azure', 'Linux'],
    },
    { title: 'Quality & ops', items: ['Datadog', 'log analysis', 'code review', 'requirements'] },
  ],

  projects: [
    {
      title: 'Microservice ERP platform',
      year: '2025',
      shortDescription:
        'Scalable ERP with microservices and RabbitMQ—auth, inventory, orders, payments, and notifications.',
      description:
        'RAG-powered AI chatbot for data-backed customer questions; infrastructure and deployment automated with Terraform on AWS and GitHub Actions.',
      technologies: [
        'Python',
        'FastAPI',
        'TypeScript',
        'Node.js',
        'Express',
        'NestJS',
        'MongoDB',
        'React',
        'Tailwind CSS',
        'Docker',
        'Terraform',
        'RabbitMQ',
        'WebSocket',
        'OpenAI',
      ],
      githubUrl: 'https://github.com/mahmudul-islam32',
      liveUrl: null,
      featured: true,
    },
  ],

  experiences: [
    {
      type: 'work',
      title: 'Software Engineer',
      company: 'CIVIS.digital GmbH',
      location: 'Celle, Germany',
      startDate: '2026-03-01',
      endDate: null,
      current: true,
      stack: ['TypeScript', 'Next.js', 'NestJS', 'PostgreSQL', 'Docker', 'Git', 'Azure', 'Jira'],
      highlights: [
        'Building GovTech and social-tech products that map complex regulations into digital workflows.',
        'Delivered subscription flows with solid backend logic and polished UI updates.',
      ],
    },
    {
      type: 'work',
      title: 'Software Engineer',
      company: 'ICS Sustainable Solutions GmbH',
      location: 'Flensburg, Germany',
      startDate: '2025-01-01',
      endDate: '2026-02-28',
      current: false,
      stack: ['TypeScript', 'Svelte', 'SvelteKit', 'FastAPI', 'Python', 'Docker', 'GitLab CI', 'Linux', 'Microservices'],
      highlights: [
        'Increased order throughput ~50% by redesigning the order workflow.',
        'Built a customer portal and improved search for accounts and orders.',
        'Integrated Stripe; sped up checkout meaningfully for end users.',
      ],
    },
    {
      type: 'work',
      title: 'Full-Stack Developer (Working Student)',
      company: 'Digital Medical Academy',
      location: 'Stuttgart, Germany',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      current: false,
      stack: ['React', 'Node.js', 'TypeScript', 'Terraform', 'Azure', 'Docker', 'Datadog', 'GitHub Actions', 'Azure Functions'],
      highlights: [
        'Shipped a central login system; cut recurring support tickets ~80%.',
        'Introduced certificate management to fix lost-certificate pain points.',
        'Designed event-driven flows with serverless functions for certificates and secure storage.',
        'Owned IaC (Terraform), CI/CD (GitHub Actions), and monitoring (Datadog).',
      ],
    },
    {
      type: 'work',
      title: 'Student Assistant',
      company: 'Universität Rostock',
      location: 'Rostock, Germany',
      startDate: '2021-10-01',
      endDate: '2022-09-30',
      current: false,
      stack: ['JavaScript', 'PHP', 'Linux', 'Git', 'SQL'],
      highlights: [
        'Replaced a code-heavy publishing setup with a dynamic portal and server configuration.',
      ],
    },
    {
      type: 'work',
      title: 'Freelance Full-Stack Developer',
      company: 'Upwork & direct clients',
      location: 'Remote',
      startDate: '2019-10-01',
      endDate: '2023-10-31',
      current: false,
      stack: ['Ruby on Rails', 'WordPress', 'React', 'PHP', 'JavaScript'],
      highlights: [
        '100% Job Success with 30+ international clients, 1,800+ hours.',
        'Complex API integrations and database migrations across stacks.',
      ],
    },
    {
      type: 'education',
      title: 'M.Sc. Computer Science (Informatik)',
      company: 'Universität Rostock',
      location: 'Rostock, Germany',
      startDate: '2022-10-01',
      endDate: '2025-06-01',
      current: false,
      thesis: 'Reverse engineering toward relational modelling (Master thesis).',
      stack: [],
      highlights: [],
    },
  ],

  certifications: [
    {
      label: 'Top-rated web developer — Upwork',
      url: 'https://www.upwork.com/nx/find-talent/?q=Mohammad%20Mahmudul%20Islam',
      sortOrder: 0,
    },
    {
      label: 'HackerRank — JavaScript, REST API, SQL (advanced)',
      url: 'https://www.hackerrank.com/mahmudul_islam32',
      sortOrder: 1,
    },
    {
      label: 'Udemy — The Ultimate React & Redux',
      url: 'https://www.udemy.com/course/react-redux/',
      sortOrder: 2,
    },
  ],

  languages: [
    { name: 'English', level: 'C1', sortOrder: 0 },
    { name: 'German', level: 'A2 (actively improving)', sortOrder: 1 },
    { name: 'Bengali', level: 'Native', sortOrder: 2 },
  ],
};

function bulletsDescription(highlights) {
  if (!highlights || !highlights.length) return '- (Add details in Strapi)';
  return highlights.map((h) => `- ${h}`).join('\n');
}

async function isEmpty(strapi, uid) {
  const rows = await strapi.entityService.findMany(uid, {
    fields: ['id'],
    limit: 1,
    publicationState: 'preview',
  });
  return rows.length === 0;
}

module.exports = async function seedPortfolio(strapi) {
  if (process.env.STRAPI_DISABLE_SEED === 'true') {
    return;
  }

  let seeded = false;

  try {
    if (await isEmpty(strapi, 'api::about.about')) {
      await strapi.entityService.create('api::about.about', {
        data: { ...SEED.about, ...PUBLISHED },
      });
      seeded = true;
      console.log('📝 Seeded About (single type)');
    }

    if (await isEmpty(strapi, 'api::skill.skill')) {
      let i = 0;
      for (const group of SEED.skillGroups) {
        for (const name of group.items) {
          await strapi.entityService.create('api::skill.skill', {
            data: {
              name,
              level: 80 + ((i * 7) % 20),
              category: 'other',
              displayGroup: group.title,
              ...PUBLISHED,
            },
          });
          i += 1;
        }
      }
      seeded = true;
      console.log(`📝 Seeded ${i} Skills`);
    }

    if (await isEmpty(strapi, 'api::project.project')) {
      for (const p of SEED.projects) {
        await strapi.entityService.create('api::project.project', {
          data: {
            title: p.title,
            year: p.year,
            shortDescription: p.shortDescription,
            description: p.description,
            technologies: p.technologies,
            githubUrl: p.githubUrl,
            liveUrl: p.liveUrl || undefined,
            featured: !!p.featured,
            ...PUBLISHED,
          },
        });
      }
      seeded = true;
      console.log(`📝 Seeded ${SEED.projects.length} Project(s)`);
    }

    if (await isEmpty(strapi, 'api::experience.experience')) {
      for (const e of SEED.experiences) {
        const highlights = e.highlights || [];
        const stack = e.stack || [];
        const description =
          e.type === 'education'
            ? e.thesis || e.title
            : bulletsDescription(highlights);

        await strapi.entityService.create('api::experience.experience', {
          data: {
            title: e.title,
            company: e.company,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate || undefined,
            current: !!e.current,
            type: e.type,
            description,
            highlights: highlights.length ? highlights : undefined,
            stack: stack.length ? stack : undefined,
            thesis: e.type === 'education' ? e.thesis : undefined,
            ...PUBLISHED,
          },
        });
      }
      seeded = true;
      console.log(`📝 Seeded ${SEED.experiences.length} Experience entries`);
    }

    if (await isEmpty(strapi, 'api::certification.certification')) {
      for (const c of SEED.certifications) {
        await strapi.entityService.create('api::certification.certification', {
          data: {
            label: c.label,
            url: c.url,
            sortOrder: c.sortOrder,
            ...PUBLISHED,
          },
        });
      }
      seeded = true;
      console.log(`📝 Seeded ${SEED.certifications.length} Certifications`);
    }

    if (await isEmpty(strapi, 'api::language.language')) {
      for (const l of SEED.languages) {
        await strapi.entityService.create('api::language.language', {
          data: {
            name: l.name,
            level: l.level,
            sortOrder: l.sortOrder,
            ...PUBLISHED,
          },
        });
      }
      seeded = true;
      console.log(`📝 Seeded ${SEED.languages.length} Languages`);
    }

    if (seeded) {
      console.log('✅ Portfolio seed complete — open http://localhost:1337/admin to edit');
    }
  } catch (err) {
    console.warn('⚠️  Portfolio seed failed (you can add content manually in Admin):', err.message);
  }
};
