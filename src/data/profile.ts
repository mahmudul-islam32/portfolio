// All personal content lives here. Edit this file to update the site.
// Every text field has an English (en) and German (de) version.

export type Lang = 'en' | 'de';
type T = { en: string; de: string };

export const profile = {
  name: 'Mahmudul Islam',
  fullName: 'Mohammad Mahmudul Islam',
  email: 'dev.mahmudislam@gmail.com',
  github: 'https://github.com/mahmudul-islam32',
  linkedin: 'https://www.linkedin.com/in/mohammad-mahmudul',
  location: { city: 'Celle', region: 'Niedersachsen', country: 'DE' },
  cvFile: '/Mahmudul_Islam_CV.pdf',

  // Optional: fill in to show it in the fact sheet, e.g. "Blue Card" / "Niederlassungserlaubnis".
  // German recruiters filter on this early. Leave empty ('') to hide the row.
  workPermit: { en: '', de: '' } as T,
  // e.g. { en: 'Open to new roles', de: 'Offen für neue Positionen' }; leave empty to hide.
  availability: { en: 'Open to backend & full-stack roles', de: 'Offen für Backend- & Full-Stack-Rollen' } as T,

  role: { en: 'Software Engineer, backend & full-stack', de: 'Software Engineer, Backend & Full-Stack' } as T,
  headline: {
    en: 'I build production web software from the data model to the UI.',
    de: 'Ich baue produktive Web-Software, vom Datenmodell bis zur Oberfläche.',
  } as T,
  intro: {
    en: 'Software engineer with an M.Sc. in Computer Science and 5+ years of shipping web applications. I design REST APIs in Python/FastAPI and NestJS on PostgreSQL, build frontends in Next.js, React and SvelteKit, and put LLM and RAG features into live products. Currently at CIVIS.digital in Celle.',
    de: 'Software Engineer mit M.Sc. Informatik und über 5 Jahren Erfahrung mit Webanwendungen im Produktivbetrieb. Ich entwerfe REST-APIs mit Python/FastAPI und NestJS auf PostgreSQL, baue Frontends mit Next.js, React und SvelteKit und bringe LLM- und RAG-Funktionen in laufende Produkte. Derzeit bei CIVIS.digital in Celle.',
  } as T,

  languages: [
    { name: { en: 'German', de: 'Deutsch' }, level: 'B1' },
    { name: { en: 'English', de: 'Englisch' }, level: 'C1' },
    { name: { en: 'Bengali', de: 'Bengalisch' }, level: { en: 'native', de: 'Muttersprache' } },
  ],

  impact: [
    { value: '70 %', label: { en: 'more users on the SO12 dashboard after I modernised it', de: 'mehr Nutzer im SO12-Dashboard nach meiner Modernisierung' } },
    { value: '80 %', label: { en: 'faster checkout after the Stripe integration', de: 'schnellerer Checkout nach der Stripe-Integration' } },
    { value: '80 %', label: { en: 'fewer login support tickets after a central login system', de: 'weniger Login-Supporttickets durch ein zentrales Login-System' } },
    { value: '1,800+', label: { en: 'freelance hours, Top Rated, 100 % job success on Upwork', de: 'Freelance-Stunden, Top Rated, 100 % Job Success auf Upwork' } },
  ],

  experience: [
    {
      from: '03/2026', to: null,
      title: { en: 'Software Engineer, backend & frontend', de: 'Software Engineer, Backend & Frontend' },
      company: 'CIVIS.digital GmbH', place: 'Celle',
      stack: ['Python', 'NestJS', 'Next.js', 'PostgreSQL', 'Jest', 'Azure', 'LLM/RAG'],
      points: [
        { en: 'Integrated LLM and RAG services into the MeinLeistungsCheck chatbot, giving people a quick social-benefits check in plain language.', de: 'LLM- und RAG-Services in den MeinLeistungsCheck-Chatbot integriert: ein schneller Sozialleistungs-Check in einfacher Sprache.' },
        { en: 'Built a central rule engine that unifies complex benefit calculations for an ESF-funded platform, working closely with social workers as domain experts.', de: 'Zentrale Rule-Engine für komplexe Leistungsberechnungen einer ESF-geförderten Plattform gebaut, in enger Abstimmung mit Sozialarbeiter:innen als Fachexpert:innen.' },
        { en: 'Own subscription billing end to end: relational data model, backend logic and UI.', de: 'Verantwortung für das Abo-Billing von Ende zu Ende: relationales Datenmodell, Backend-Logik und UI.' },
        { en: 'Modernised the SO12 dashboard; new features and fixes grew its user base by about 70 %.', de: 'SO12-Dashboard modernisiert; neue Features und Fixes steigerten die Nutzerzahl um rund 70 %.' },
        { en: 'Introduced automated and end-to-end tests with Jest across several projects.', de: 'Automatisierte und End-to-End-Tests mit Jest in mehreren Projekten eingeführt.' },
      ],
    },
    {
      from: '01/2025', to: '02/2026',
      title: { en: 'Software Developer', de: 'Softwareentwickler' },
      company: 'ICS Sustainable Solutions GmbH', place: 'Flensburg',
      stack: ['Python', 'FastAPI', 'PostgreSQL', 'SvelteKit', 'Docker', 'GitLab CI'],
      points: [
        { en: 'Developed and operated Python/FastAPI microservices, including deployment and configuration via GitLab CI.', de: 'Python/FastAPI-Microservices entwickelt und betrieben, inklusive Deployment und Konfiguration über GitLab CI.' },
        { en: 'Integrated Stripe via REST, cutting checkout time by 80 %; redesigned the order workflow, raising throughput by 50 %.', de: 'Stripe per REST integriert und die Checkout-Zeit um 80 % verkürzt; Bestellprozess neu gestaltet, Durchsatz um 50 % erhöht.' },
        { en: 'Built a SvelteKit customer portal with improved search.', de: 'SvelteKit-Kundenportal mit verbesserter Suche gebaut.' },
      ],
    },
    {
      from: '01/2024', to: '12/2024',
      title: { en: 'Full-Stack Developer (working student)', de: 'Full-Stack-Entwickler (Werkstudent)' },
      company: 'Digital Medical Academy', place: 'Stuttgart',
      stack: ['React', 'Node.js', 'TypeScript', 'Azure Functions', 'Terraform', 'GitHub Actions', 'Datadog'],
      points: [
        { en: 'Built a central login system, reducing recurring support tickets by about 80 %.', de: 'Zentrales Login-System gebaut, wiederkehrende Supporttickets um rund 80 % reduziert.' },
        { en: 'Replaced a manual process with a serverless, event-driven certificate generation and storage pipeline on Azure.', de: 'Manuellen Prozess durch eine serverlose, ereignisgesteuerte Pipeline zur Zertifikatserstellung und -ablage auf Azure ersetzt.' },
        { en: 'Set up Terraform infrastructure as code, GitHub Actions CI/CD and Datadog monitoring.', de: 'Infrastructure as Code mit Terraform, CI/CD mit GitHub Actions und Monitoring mit Datadog aufgesetzt.' },
      ],
    },
    {
      from: '10/2021', to: '09/2022',
      title: { en: 'Web Developer (student assistant)', de: 'Webentwickler (studentische Hilfskraft)' },
      company: 'Universität Rostock', place: 'Rostock',
      stack: ['PHP', 'MySQL', 'JavaScript', 'Linux', 'Apache'],
      points: [
        { en: 'Replaced a hard-coded publication system with a configurable, database-backed web portal that staff maintain without code changes; ran the Linux server stack.', de: 'Hartcodiertes Publikationssystem durch ein konfigurierbares, datenbankgestütztes Webportal ersetzt, das Mitarbeitende ohne Code-Änderungen pflegen; Linux-Serverbetrieb.' },
      ],
    },
    {
      from: '10/2019', to: '10/2023',
      title: { en: 'Freelance Full-Stack Developer', de: 'Freiberuflicher Full-Stack-Entwickler' },
      company: 'Upwork', place: 'remote',
      stack: ['PHP', 'Ruby on Rails', 'JavaScript', 'MySQL'],
      points: [
        { en: 'Top Rated with 100 % Job Success across 30+ international clients and 1,800+ hours: web apps, API integrations, data imports and database migrations.', de: 'Top Rated mit 100 % Job Success bei über 30 internationalen Kund:innen und mehr als 1.800 Stunden: Web-Apps, API-Integrationen, Datenimporte und Datenbankmigrationen.' },
      ],
    },
  ],

  skills: [
    { group: { en: 'Languages', de: 'Sprachen' }, items: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'PHP', 'Bash'] },
    { group: { en: 'Backend & APIs', de: 'Backend & APIs' }, items: ['FastAPI', 'NestJS', 'Node.js', 'REST API design', 'Microservices', 'RabbitMQ'] },
    { group: { en: 'Frontend', de: 'Frontend' }, items: ['Next.js', 'React', 'SvelteKit', 'HTML/CSS', 'Responsive UI'] },
    { group: { en: 'AI & LLM', de: 'KI & LLM' }, items: ['LLM integration', 'RAG pipelines', 'Chatbots in production'] },
    { group: { en: 'Databases', de: 'Datenbanken' }, items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Data modelling', 'Schema migration'] },
    { group: { en: 'Cloud & DevOps', de: 'Cloud & DevOps' }, items: ['Docker', 'Terraform', 'Azure', 'AWS', 'GitLab CI', 'GitHub Actions', 'Datadog', 'Linux'] },
    { group: { en: 'Quality', de: 'Qualität' }, items: ['Jest', 'End-to-end tests', 'Code review', 'Documentation', 'Git'] },
    { group: { en: 'Integrations', de: 'Integrationen' }, items: ['Stripe', 'Third-party APIs', 'Event-driven imports'] },
  ],

  education: {
    degree: { en: 'M.Sc. Computer Science', de: 'M.Sc. Informatik' } as T,
    school: 'Universität Rostock',
    year: '2025',
    thesis: {
      en: 'Thesis: reverse engineering existing databases into explicit relational models.',
      de: 'Masterarbeit: Reverse Engineering bestehender Datenbanken zu expliziten relationalen Modellen.',
    } as T,
  },
  certificates: ['HackerRank: SQL (Advanced)', 'HackerRank: REST API', 'HackerRank: JavaScript', 'Upwork Top Rated Web Developer'],

  references: [
    {
      quote: 'Consistently demonstrated exceptional technical ability, strong problem-solving skills, and a deep understanding of modern software development practices.',
      who: 'Kenneth Liedtke',
      what: { en: 'CEO, ICS Sustainable Solutions GmbH', de: 'CEO, ICS Sustainable Solutions GmbH' },
    },
    {
      quote: 'He was reliable and competent in always finding solutions and answers.',
      who: 'Johannes Michael Ossadnik',
      what: { en: 'Research associate, Universität Rostock', de: 'Wissenschaftlicher Mitarbeiter, Universität Rostock' },
    },
  ],
};

// Legal details for the Impressum (required in Germany). Check these before going live.
export const legal = {
  name: 'Mohammad Mahmudul Islam',
  street: 'Welfenallee 57',
  city: '29225 Celle',
  country: 'Deutschland',
  email: 'dev.mahmudislam@gmail.com',
  // Name of your hosting provider, used in the privacy policy, e.g. 'Netlify, Inc., 512 2nd Street, San Francisco, CA 94107, USA'
  host: 'Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, USA',
};
