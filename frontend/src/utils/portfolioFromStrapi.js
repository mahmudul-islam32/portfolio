import { resume as fallbackResume } from '../data/resume';

function unwrapSingle(fulfilled) {
  if (!fulfilled || fulfilled.status !== 'fulfilled') return null;
  const entity = fulfilled.value?.data?.data;
  if (entity && entity.attributes) return entity;
  return null;
}

function unwrapList(fulfilled) {
  if (!fulfilled || fulfilled.status !== 'fulfilled') return [];
  const list = fulfilled.value?.data?.data;
  return Array.isArray(list) ? list : [];
}

function ensureUrl(u) {
  if (!u || typeof u !== 'string') return null;
  const t = u.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function parseStringArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    try {
      const p = JSON.parse(val);
      if (Array.isArray(p)) return p.map(String).filter(Boolean);
    } catch (_) {
      return val
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function parseParagraphsField(val) {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string' && val.trim()) {
    return val
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseHighlights(jsonField, description) {
  if (Array.isArray(jsonField)) return jsonField.map(String).filter(Boolean);
  if (jsonField && typeof jsonField === 'object' && Array.isArray(jsonField.items)) {
    return jsonField.items.map(String).filter(Boolean);
  }
  if (typeof jsonField === 'string') {
    try {
      const p = JSON.parse(jsonField);
      if (Array.isArray(p)) return p.map(String).filter(Boolean);
    } catch (_) {}
  }
  if (description && typeof description === 'string') {
    const lines = description.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const bullets = lines.filter((l) => /^[-•*]\s/.test(l));
    if (bullets.length) return bullets.map((l) => l.replace(/^[-•*]\s+/, ''));
    if (lines.length > 1) return lines;
    if (lines.length === 1) return [lines[0]];
  }
  return [];
}

function normalizeTechnologies(raw) {
  const list = parseStringArray(raw);
  return list.length ? list : [];
}

const CATEGORY_LABELS = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  tools: 'Tools',
  other: 'Other',
};

function skillGroupsFromStrapi(skills) {
  const groups = new Map();
  skills.forEach((entry) => {
    const a = entry.attributes || entry;
    const name = a.name;
    if (!name) return;
    const key =
      (a.displayGroup && String(a.displayGroup).trim()) ||
      CATEGORY_LABELS[a.category] ||
      'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(name);
  });
  return Array.from(groups.entries()).map(([title, items]) => ({ title, items }));
}

function mergeProfile(aboutEntity, fb) {
  const a = aboutEntity?.attributes;
  if (!a) return { ...fb };
  const social = a.socialLinks && typeof a.socialLinks === 'object' ? a.socialLinks : {};
  const coreStack = parseStringArray(a.coreStack);
  const aboutParagraphs = parseParagraphsField(a.aboutParagraphs);

  return {
    ...fb,
    name: a.name || fb.name,
    title: a.title || fb.title,
    tagline: (a.tagline && String(a.tagline).trim()) || a.bio || fb.tagline,
    email: a.email || fb.email,
    phone: a.phone || fb.phone,
    location: a.location || fb.location,
    address: a.address || fb.address,
    links: {
      ...fb.links,
      github: ensureUrl(social.github) || fb.links?.github,
      linkedin: ensureUrl(social.linkedin) || fb.links?.linkedin,
      website: ensureUrl(social.website) || fb.links?.website,
    },
    coreStack: coreStack.length ? coreStack : fb.coreStack,
    aboutParagraphs: aboutParagraphs.length ? aboutParagraphs : fb.aboutParagraphs,
  };
}

function mapProject(entry) {
  const a = entry.attributes || entry;
  const created = a.createdAt || a.publishedAt;
  let year = a.year ? String(a.year).trim() : '';
  if (!year && created) {
    const d = new Date(created);
    if (!Number.isNaN(d.getTime())) year = String(d.getFullYear());
  }
  return {
    id: entry.id,
    title: a.title,
    year: year || '—',
    summary: a.shortDescription,
    description: a.description,
    technologies: normalizeTechnologies(a.technologies),
    githubUrl: a.githubUrl || null,
    liveUrl: a.liveUrl || null,
  };
}

function mapWork(entry) {
  const a = entry.attributes || entry;
  return {
    id: entry.id,
    role: a.title,
    company: a.company,
    location: a.location || '',
    startDate: a.startDate,
    endDate: a.endDate,
    current: !!a.current,
    type: 'work',
    stack: parseStringArray(a.stack),
    highlights: parseHighlights(a.highlights, a.description),
  };
}

function mapEducation(entry) {
  const a = entry.attributes || entry;
  return {
    id: entry.id,
    degree: a.title,
    school: a.company,
    location: a.location || '',
    startDate: a.startDate,
    endDate: a.endDate,
    current: !!a.current,
    type: 'education',
    thesis: (a.thesis && String(a.thesis).trim()) || a.description || '',
  };
}

function mapCert(entry) {
  const a = entry.attributes || entry;
  return { label: a.label, url: a.url };
}

function mapLang(entry) {
  const a = entry.attributes || entry;
  return { name: a.name, level: a.level };
}

/**
 * Merge Strapi API responses with static fallback so the site always renders.
 */
export function buildPortfolio(
  { aboutRes, skillsRes, projectsRes, experiencesRes, certsRes, langsRes },
  fallback = fallbackResume
) {
  const aboutEntity = unwrapSingle(aboutRes);
  const profile = mergeProfile(aboutEntity, fallback.profile);

  const skills = unwrapList(skillsRes);
  const skillGroups =
    skills.length > 0 ? skillGroupsFromStrapi(skills) : fallback.skillGroups || [];

  const projectsRaw = unwrapList(projectsRes);
  const projects =
    projectsRaw.length > 0 ? projectsRaw.map(mapProject) : fallback.projects || [];

  const experiences = unwrapList(experiencesRes);
  const work = [];
  const education = [];
  experiences.forEach((entry) => {
    const t = entry.attributes?.type || entry.type;
    if (t === 'education') education.push(mapEducation(entry));
    else work.push(mapWork(entry));
  });
  const experienceOut = work.length ? work : fallback.experience || [];
  const educationOut = education.length ? education : fallback.education || [];

  const certsRaw = unwrapList(certsRes);
  const certifications =
    certsRaw.length > 0 ? certsRaw.map(mapCert).filter((c) => c.label && c.url) : fallback.certifications || [];

  const langsRaw = unwrapList(langsRes);
  const languages =
    langsRaw.length > 0 ? langsRaw.map(mapLang).filter((l) => l.name && l.level) : fallback.languages || [];

  return {
    profile,
    experience: experienceOut,
    education: educationOut,
    skillGroups,
    projects,
    certifications,
    languages,
  };
}
