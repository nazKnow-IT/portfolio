/* ============================================================================
 * SITE CONFIG — identity, links, navigation, contact wiring
 * ----------------------------------------------------------------------------
 * This is the only file you need to touch when a link or address changes.
 * Every value here is either taken from the resume or is a placeholder you
 * fill in. Placeholders are always '' (empty string): the UI detects an empty
 * string and renders a "not linked yet" state instead of a dead hyperlink, so
 * leaving a field blank is safe and never produces a broken link.
 *
 * Reveal the content TODO notes while previewing: open index.html?edit=1
 * (recruiters visiting the normal URL never see them).
 * ==========================================================================*/
(function (global) {
  'use strict';

  var PROFILE = {
    name: 'Mirza Nazeef bin Mansor',
    shortName: 'Mirza Nazeef',
    initials: 'MN',
    title: 'Information Technology Student · Aspiring Software Developer',
    tagline: 'I build practical systems end to end — database schema to shipped interface.',
    role: 'Bachelor of Information Technology with Honours Student',
    location: 'Johor, Malaysia',
    availability: 'Open to internships building scalable, AI-powered software',
    photo: 'assets/img/profile.png',
    photoAlt: 'Portrait of Mirza Nazeef bin Mansor',
    /* Blocks, in order. A string is a paragraph; { label, text } is a
       labelled point rendered with the category set before the sentence. */
    intro: [
      'I am a final-year Information Technology student at Universiti Tun Hussein Onn '
        + 'Malaysia specializing in end-to-end software development—from architectural data '
        + 'modeling and backend systems to intuitive, production-ready interfaces.',
      'My hands-on work centers on delivering practical solutions for real operational '
        + 'environments:',
      {
        label: 'Enterprise Operations',
        text: 'Architected an integrated POS and inventory management system deployed for a '
          + 'university cooperative store.'
      },
      {
        label: 'Commercial Systems',
        text: 'Developed an end-to-end e-commerce platform tailored for print studio operations.'
      },
      {
        label: 'Machine Learning & Mobile',
        text: 'Engineered a sign language recognition platform integrating a Flutter mobile '
          + 'client with a Python-based computer vision backend.'
      },
      'I approach software engineering through a pragmatic, iterative mindset. Whether '
        + 'adopting new frameworks or optimizing existing architectures, I prioritize rigorous '
        + 'testing, rapid prototyping, and user-centric problem-solving.'
    ],
    /* "At a glance" rows in the About sidebar. Drop a row by deleting it. */
    glance: [
      { label: 'Studying', value: 'Bachelor of Information Technology with Honours' },
      { label: 'CGPA', value: '3.86 degree · 3.76 diploma' },
      { label: 'Interested in', value: 'Practical applications, computer vision, full-cycle delivery' },
      { label: 'Based in', value: 'Johor, Malaysia' }
    ],
    /* Hero counters. Every number is countable from the content below. */
    stats: [
      { value: '6', label: 'documented projects' },
      { value: '3', label: 'systems deployed for real users' },
      { value: '5', label: 'certifications completed' },
      { value: '3.86', label: 'degree CGPA' }
    ]
  };

  /* ------------------------------------------------------------------ links
   * github: put your profile URL here, then fill repo URLs per project in
   *         js/content/projects.data.js. Blank = UI shows "repo not linked".
   * ------------------------------------------------------------------------ */
  var LINKS = {
    email: 'mmirzanazeeff@gmail.com',
    phone: '+60 14-964 0726',
    phoneDigits: '60149640726',
    linkedin: 'https://www.linkedin.com/in/mirza-nazeef-bin-mansor-1baa46298',
    linkedinLabel: 'linkedin.com/in/mirzanazeef',
    github: '',
    cvFile: 'assets/cv/Mirza-Nazeef-CV.pdf',
    cvLabel: 'Download CV (.pdf)'
  };

  var NAV = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Me' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'showcase', label: '3D Showcase' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' }
  ];

  /* ---------------------------------------------------------------- contact
   * FormSubmit.co relays a plain HTML form POST to your inbox with no account
   * and no API key. The FIRST submission from a new address triggers an
   * activation email to LINKS.email — click it once and every later message
   * arrives in your inbox. Until you activate, submissions bounce back to the
   * visitor with FormSubmit's own notice, so the copy below says "sent to my
   * inbox" only after you have done that step.
   *
   * Set enabled: false to hide the form entirely and leave only the direct
   * email / LinkedIn / WhatsApp buttons.
   * ------------------------------------------------------------------------ */
  var CONTACT_FORM = {
    enabled: true,
    endpoint: 'https://formsubmit.co/ajax/mmirzanazeeff@gmail.com',
    subject: 'Portfolio enquiry from {name}',
    /* FormSubmit pseudo-fields — see https://formsubmit.co/document/ */
    honeypot: '_honey',
    redirect: '',
    note: 'This form posts straight to my inbox — nothing is stored on this site.'
  };

  /* -------------------------------------------------------------- showcase
   * The 3D slot. Replace the contents of /game with any build that serves an
   * index.html and this section picks it up with no code changes.
   * ------------------------------------------------------------------------ */
  var SHOWCASE = {
    src: 'game/index.html',
    title: 'Playable 3D portfolio — walk a character through seven checkpoints',
    blurb: 'A three.js WebGL world I wrote as a second way into this portfolio. Walk a '
      + 'character between seven checkpoints; each one unlocks part of the skill inventory '
      + 'and the story behind a project. If WebGL is unavailable it falls back to the '
      + 'readable version automatically.',
    controls: [
      { keys: 'W A S D', what: 'Walk the character' },
      { keys: '1 – 7', what: 'Auto-walk to a checkpoint' },
      { keys: 'Click', what: 'Open a beacon card' },
      { keys: 'P', what: 'Switch to the readable page' },
      { keys: 'Esc', what: 'Close a card / stop the tour' }
    ],
    height: 620
  };

  var SITE = {
    profile: PROFILE,
    links: LINKS,
    nav: NAV,
    contactForm: CONTACT_FORM,
    showcase: SHOWCASE,
    year: new Date().getFullYear()
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SITE;
  global.SiteConfig = SITE;
})(typeof window !== 'undefined' ? window : globalThis);
