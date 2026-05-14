/**
 * Default static content used when Strapi is empty or unreachable.
 * Edit Strapi in admin for live site; keep this as backup / seed reference.
 */
export const resume = {
  profile: {
    name: 'Mahmudul Islam',
    title: 'Software Engineer',
    tagline:
      'Full-stack engineer with 5+ years building scalable web platforms, cloud infrastructure, APIs, and microservices. Strong in TypeScript, Python, and pragmatic AI—LLM assistants, RAG, and vector search for real users.',
    email: 'dev.mahmudislam@gmail.com',
    phone: '+49 176 3444 2721',
    location: 'Celle, Germany',
    address: 'Welfenallee 57, 29225 Celle, Germany',
    aboutParagraphs: [
      'I build end-to-end products: typed APIs, resilient services, and interfaces people can trust. Recent work spans GovTech, sustainable commerce, and regulated healthcare platforms—with automation, payments, and observability baked in.',
      'I also design LLM features where retrieval and evaluation matter, not just prompts—so answers stay tied to real data and operations stay maintainable.',
    ],
    links: {
      github: 'https://github.com/mahmudul-islam32',
      linkedin: 'https://linkedin.com/in/mohammad-mahmudul',
      website: 'https://mdislam.dev',
    },
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
  },

  experience: [
    {
      id: 'civis',
      role: 'Software Engineer',
      company: 'CIVIS.digital GmbH',
      location: 'Celle, Germany',
      startDate: '2026-03-01',
      endDate: null,
      current: true,
      type: 'work',
      stack: [
        'TypeScript',
        'Next.js',
        'NestJS',
        'PostgreSQL',
        'Docker',
        'Git',
        'Azure',
        'Jira',
      ],
      highlights: [
        'Building GovTech and social-tech products that map complex regulations into digital workflows.',
        'Delivered subscription flows with solid backend logic and polished UI updates.',
      ],
    },
    {
      id: 'ics',
      role: 'Software Engineer',
      company: 'ICS Sustainable Solutions GmbH',
      location: 'Flensburg, Germany',
      startDate: '2025-01-01',
      endDate: '2026-02-28',
      current: false,
      type: 'work',
      stack: [
        'TypeScript',
        'Svelte',
        'SvelteKit',
        'FastAPI',
        'Python',
        'Docker',
        'GitLab CI',
        'Linux',
        'Microservices',
      ],
      highlights: [
        'Increased order throughput ~50% by redesigning the order workflow.',
        'Built a customer portal and improved search for accounts and orders.',
        'Integrated Stripe; sped up checkout meaningfully for end users.',
      ],
    },
    {
      id: 'dma',
      role: 'Full-Stack Developer (Working Student)',
      company: 'Digital Medical Academy',
      location: 'Stuttgart, Germany',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      current: false,
      type: 'work',
      stack: [
        'React',
        'Node.js',
        'TypeScript',
        'Terraform',
        'Azure',
        'Docker',
        'Datadog',
        'GitHub Actions',
        'Azure Functions',
      ],
      highlights: [
        'Shipped a central login system; cut recurring support tickets ~80%.',
        'Introduced certificate management to fix lost-certificate pain points.',
        'Designed event-driven flows with serverless functions for certificates and secure storage.',
        'Owned IaC (Terraform), CI/CD (GitHub Actions), and monitoring (Datadog).',
      ],
    },
    {
      id: 'rostock-uni',
      role: 'Student Assistant',
      company: 'Universität Rostock',
      location: 'Rostock, Germany',
      startDate: '2021-10-01',
      endDate: '2022-09-30',
      current: false,
      type: 'work',
      stack: ['JavaScript', 'PHP', 'Linux', 'Git', 'SQL'],
      highlights: [
        'Replaced a code-heavy publishing setup with a dynamic portal and server configuration.',
      ],
    },
    {
      id: 'upwork',
      role: 'Freelance Full-Stack Developer',
      company: 'Upwork & direct clients',
      location: 'Remote',
      startDate: '2019-10-01',
      endDate: '2023-10-31',
      current: false,
      type: 'work',
      stack: ['Ruby on Rails', 'WordPress', 'React', 'PHP', 'JavaScript'],
      highlights: [
        '100% Job Success with 30+ international clients, 1,800+ hours.',
        'Complex API integrations and database migrations across stacks.',
      ],
    },
  ],

  education: [
    {
      id: 'msc',
      degree: 'M.Sc. Computer Science (Informatik)',
      school: 'Universität Rostock',
      location: 'Rostock, Germany',
      endDate: '2025-06-01',
      startDate: '2022-10-01',
      current: false,
      type: 'education',
      thesis:
        'Reverse engineering toward relational modelling (Master thesis).',
    },
  ],

  skillGroups: [
    {
      title: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'PHP'],
    },
    {
      title: 'Frameworks',
      items: ['React', 'Next.js', 'Node.js', 'NestJS', 'Express', 'FastAPI', 'SvelteKit'],
    },
    {
      title: 'Integration & APIs',
      items: ['REST', 'API design', 'optimization', 'gateways', 'WebSocket'],
    },
    {
      title: 'Architecture',
      items: ['Microservices', 'event-driven design', 'RabbitMQ', 'system integration'],
    },
    {
      title: 'Data',
      items: ['PostgreSQL', 'MySQL', 'MongoDB'],
    },
    {
      title: 'AI engineering',
      items: ['LLM apps', 'RAG', 'vector search', 'prompting', 'OpenAI API'],
    },
    {
      title: 'Platform & delivery',
      items: ['Docker', 'Terraform', 'GitHub Actions', 'GitLab CI', 'AWS EC2', 'Azure', 'Linux'],
    },
    {
      title: 'Quality & ops',
      items: ['Datadog', 'log analysis', 'code review', 'requirements'],
    },
  ],

  projects: [
    {
      id: 'erp-2025',
      title: 'Microservice ERP platform',
      year: '2025',
      summary:
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
    },
  ],

  certifications: [
    {
      label: 'Top-rated web developer — Upwork',
      url: 'https://www.upwork.com/nx/find-talent/?q=Mohammad%20Mahmudul%20Islam',
    },
    {
      label: 'HackerRank — JavaScript, REST API, SQL (advanced)',
      url: 'https://www.hackerrank.com/mahmudul_islam32',
    },
    {
      label: 'Udemy — The Ultimate React & Redux',
      url: 'https://www.udemy.com/course/react-redux/',
    },
  ],

  languages: [
    { name: 'English', level: 'C1' },
    { name: 'German', level: 'A2 (actively improving)' },
    { name: 'Bengali', level: 'Native' },
  ],
};

export default resume;
