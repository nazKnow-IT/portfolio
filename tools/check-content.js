/* ===========================================================================
   tools/check-content.js — content and asset validator.
   Run:  node tools/check-content.js      (from the portfolio folder)
   Exits non-zero when a content edit has broken something the browser would
   only reveal as a missing image or a dead link.
   ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const load = (p) => require(path.join(ROOT, p));

const SITE = load('js/content/site.config.js');
const CONTENT = load('js/content/skills.data.js');
const PROJECTS = load('js/content/projects.data.js');

const errors = [];
const warnings = [];
const check = (cond, msg) => { if (!cond) errors.push(msg); };
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

/* -------------------------------------------------------------- projects */
PROJECTS.selfCheck().forEach((e) => errors.push('project: ' + e));

const catIds = new Set(PROJECTS.CATEGORIES.map((c) => c.id));
const skillIds = new Set(CONTENT.SKILLS.map((s) => s.id)
  .concat(PROJECTS.EXTRA_TECHS.map((s) => s.id)));
const seen = new Set();

PROJECTS.PROJECTS.forEach((p) => {
  check(!seen.has(p.id), `duplicate project id "${p.id}"`);
  seen.add(p.id);

  (p.categories || []).forEach((c) => check(catIds.has(c), `${p.id}: category "${c}" is not in CATEGORIES`));
  (p.tech || []).forEach((t) => check(skillIds.has(t), `${p.id}: tech "${t}" has no skill entry`));

  if (p.cover) check(exists(p.cover), `${p.id}: missing cover asset ${p.cover}`);
  if (p.architecture && p.architecture.diagram) {
    check(exists(p.architecture.diagram), `${p.id}: missing diagram ${p.architecture.diagram}`);
  }
  (p.gallery || []).forEach((g, i) => {
    check(exists(g.src), `${p.id}: gallery[${i}] missing file ${g.src}`);
  });
  ['repo', 'demo'].forEach((k) => {
    const url = (p.links || {})[k];
    if (url) check(/^https?:\/\//.test(url), `${p.id}.links.${k} must be a full http(s) URL, got "${url}"`);
  });
});

/* ---------------------------------------------------------------- skills */
const catKeys = new Set(CONTENT.SKILL_CATS.map((c) => c.id));
CONTENT.SKILLS.forEach((s) => {
  check(catKeys.has(s.cat), `skill "${s.id}" has unknown category "${s.cat}"`);
  check(!!s.blurb && s.blurb.length > 12, `skill "${s.id}" needs a real blurb`);
  check(['academic', 'industry', 'self-taught', 'certified'].includes(s.source),
    `skill "${s.id}" has unknown source "${s.source}"`);
});

/* --------------------------------------------------------- icon coverage */
/* the two icon tables are browser scripts, but they only touch `document`
   inside iconSvg(), so requiring them here is safe */
load('js/modules/icons.brand.js');
load('js/modules/icons.js');
const ICONS = globalThis.App;
const hasIcon = (id) => !!(ICONS.BRAND_ICONS[id] || ICONS.GLYPH_ICONS[id]);

CONTENT.SKILLS.concat(PROJECTS.EXTRA_TECHS).forEach((s) => check(hasIcon(s.id),
  `technology "${s.id}" has no icon — add a glyph in js/modules/icons.js, or its slug in tools/fetch-tech-icons.js and re-run it`));
CONTENT.CERTIFICATIONS.forEach((c) => {
  if (c.icon) check(hasIcon(c.icon), `certification "${c.title}" names an unknown icon "${c.icon}"`);
});

/* -------------------------------------------------- cross-references */
CONTENT.EDUCATION.forEach((e) => (e.projects || []).forEach((id) =>
  check(seen.has(id), `education "${e.institution}" references unknown project "${id}"`)));
CONTENT.EXPERIENCE.forEach((x) => (x.projects || []).forEach((id) =>
  check(seen.has(id), `experience "${x.org}" references unknown project "${id}"`)));
CONTENT.CERTIFICATIONS.forEach((c) => (c.skills || []).forEach((id) =>
  check(skillIds.has(id), `certification "${c.title}" references unknown skill "${id}"`)));

/* ------------------------------------------------------- site config */
const L = SITE.links;
check(/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(L.email || ''), `site.config: invalid email "${L.email}"`);
if (L.cvFile) check(exists(L.cvFile), `site.config: CV file missing at ${L.cvFile}`);
if (L.github) check(/^https:\/\/github\.com\//.test(L.github), 'site.config: github must be a full github.com URL or empty');
if (SITE.showcase.src) check(exists(SITE.showcase.src), `site.config: showcase src missing (${SITE.showcase.src})`);
if (SITE.contactForm.enabled) {
  check(/^https:\/\/formsubmit\.co\//.test(SITE.contactForm.endpoint || ''),
    'contactForm.endpoint should be a formsubmit.co URL when the form is enabled');
  check((SITE.contactForm.endpoint || '').indexOf(L.email) !== -1,
    'contactForm.endpoint should deliver to the same address as links.email');
}
SITE.nav.forEach((n) => {
  const hay = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  check(hay.includes(`id="${n.id}"`), `nav entry "${n.id}" has no matching section id in index.html`);
});

/* ---------------------------------------------------------- report */
const placeholderCount = PROJECTS.PROJECTS.filter((p) => !(p.links || {}).repo).length;
warnings.push(`${placeholderCount} project(s) have no repository URL yet — they render as "not linked" placeholders`);
if (!L.github) warnings.push('no GitHub profile URL set — the hero and footer show a dashed placeholder');

console.log('\ncontent check');
console.log('  projects      : ' + PROJECTS.PROJECTS.length);
console.log('  technologies  : ' + CONTENT.SKILLS.length + ' (+' + PROJECTS.EXTRA_TECHS.length + ' project-only)');
console.log('  certifications: ' + CONTENT.CERTIFICATIONS.length);
console.log('  awards        : ' + CONTENT.AWARDS.length);
console.log('  icons         : ' + Object.keys(ICONS.BRAND_ICONS).length + ' brand marks + '
  + Object.keys(ICONS.GLYPH_ICONS).length + ' drawn glyphs');

if (warnings.length) {
  console.log('\nnotes:');
  warnings.forEach((w) => console.log('  · ' + w));
}
if (errors.length) {
  console.log('\nFAILED — ' + errors.length + ' problem(s):');
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\nOK — content is consistent and every referenced asset exists.\n');
