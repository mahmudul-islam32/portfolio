import { profile, type Lang } from '../data/profile';

/** schema.org data that helps Google show your name, role and profiles correctly. */
export function personSchema(site: URL, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    inLanguage: lang,
    mainEntity: {
      '@type': 'Person',
      '@id': new URL('/#person', site).href,
      name: profile.fullName,
      alternateName: profile.name,
      jobTitle: 'Software Engineer',
      description: profile.intro[lang],
      url: site.href,
      image: new URL('/og.png', site).href,
      email: `mailto:${profile.email}`,
      sameAs: [profile.github, profile.linkedin],
      address: { '@type': 'PostalAddress', addressLocality: profile.location.city, addressRegion: profile.location.region, addressCountry: profile.location.country },
      worksFor: { '@type': 'Organization', name: 'CIVIS.digital GmbH' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universität Rostock' },
      knowsLanguage: ['de', 'en', 'bn'],
      knowsAbout: ['Python', 'FastAPI', 'TypeScript', 'NestJS', 'Next.js', 'React', 'SvelteKit', 'PostgreSQL', 'LLM', 'RAG', 'Docker', 'Terraform', 'Azure', 'AWS'],
    },
  };
}

export function websiteSchema(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: profile.name,
    url: site.href,
    inLanguage: ['en', 'de'],
    author: { '@id': new URL('/#person', site).href },
  };
}
