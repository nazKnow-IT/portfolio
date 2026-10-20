/* Career content for the playable portfolio.
   Single source of truth: both the 3D world and the readable page render from here.
   Every fact comes from the resume; nothing is inferred. References are deliberately omitted. */
(function (global) {
  'use strict';

  const PROFILE = {
    name: 'Mirza Nazeef bin Mansor',
    headline: 'Information Technology student, UTHM',
    kicker: 'Full-cycle software · computer vision · AI-assisted delivery',
    seeking: 'Open to internships building scalable, AI-powered software solutions.',
    email: 'mmirzanazeeff@gmail.com',
    phone: '+60 14-964 0726',
    linkedin: 'linkedin.com/in/mirzanazeef',
    location: 'Johor, Malaysia',
    summary: 'Proactive Information Technology student at Universiti Tun Hussein Onn Malaysia (CGPA 3.86) '
      + 'with hands-on experience building web applications, systems and intelligent digital solutions. '
      + 'Skilled across full-cycle software engineering — C/C++, Python, PHP and CSS through to cloud '
      + 'backends like Firebase and Supabase — and in designing computer-vision and deep-learning '
      + 'pipelines with OpenCV, MediaPipe, CNNs and LSTMs. Track record of cutting operational task '
      + 'times through automation.'
  };

  const SKILL_CATS = {
    lang: 'Programming languages',
    web: 'Web & frameworks',
    ai: 'AI & computer vision',
    data: 'Data & business intelligence',
    cloud: 'Databases & cloud backends',
    design: 'Design & production tools',
    craft: 'Engineering practice',
    badge: 'Awards & certifications'
  };

  const XP_PER_LEVEL = 110;

  /* World layout: seven plinths the visitor walks between, character starts behind index 0. */
  const WORLD = {
    groundRadius: 44,
    walkRadius: 39,
    reach: 3.4,
    start: [-31, 21]
  };

  const STOPS = [
    {
      id: 'arrival',
      label: 'Start',
      title: 'Mirza Nazeef bin Mansor',
      kicker: 'Where the run begins',
      heading: 'Who you are about to meet',
      meta: 'Bachelor of Information Technology with Honours Student · UTHM · CGPA 3.86',
      para: 'A final-stage IT student who takes a product from database schema to shipped interface, '
        + 'and who has already put two working systems in front of real users.',
      bullets: [
        'Bachelor of Information Technology with Honours, Universiti Tun Hussein Onn Malaysia — 2025 to current, CGPA 3.86',
        'Diploma of Information Technology, Universiti Tun Hussein Onn Malaysia — 2022 to 2025, CGPA 3.76',
        'Seeking a challenging internship to build scalable, AI-powered software solutions',
        'Comfortable across the whole cycle: C/C++ and Python through to cloud backends and rapid platforms'
      ],
      stats: [{ k: 'CGPA', v: '3.86' }, { k: 'Systems shipped', v: '3' }, { k: 'Stack layers', v: '6+' }],
      pos: [-30, 16],
      xp: 40,
      props: ['arch', 'nameplate'],
      unlocks: [
        { label: 'Full-cycle engineering', cat: 'craft' },
        { label: 'Malay (native)', cat: 'craft' },
        { label: 'English (working)', cat: 'craft' }
      ]
    },
    {
      id: 'education',
      label: 'Education',
      title: 'Education',
      kicker: 'Level 1 — foundations',
      heading: 'Two qualifications, two top CGPAs',
      meta: 'UTHM Diploma 3.76 → UTHM Honours degree 3.86',
      para: 'Diploma work at Universiti Tun Hussein Onn Malaysia, now a Bachelor of Information Technology with '
        + 'Honours at the same institution — with distinction-level standing at both.',
      bullets: [
        'Diploma of Information Technology, Universiti Tun Hussein Onn Malaysia, 2022–2025, CGPA 3.76',
        'Bachelor of Information Technology with Honours, UTHM, 2025–current, CGPA 3.86',
        'Vice-Chancellor’s Award (Anugerah Naib Canselor), Diploma of Information Technology',
        'Ground training in C, C++, Python and R alongside statistics packages'
      ],
      stats: [{ k: 'Degree CGPA', v: '3.86' }, { k: 'Diploma CGPA', v: '3.76' }, { k: 'Award', v: 'Anugerah Naib Canselor' }],
      pos: [-18, 5],
      xp: 80,
      props: ['podium', 'cap'],
      unlocks: [
        { label: 'C / C++', cat: 'lang' },
        { label: 'Python', cat: 'lang' },
        { label: 'R', cat: 'lang' },
        { label: 'Vice-Chancellor’s Award', cat: 'badge' }
      ]
    },
    {
      id: 'internship',
      label: 'Internship',
      title: 'CLICK PIXEL STUDIO',
      kicker: 'Level 2 — industry',
      heading: 'Intern, Click Pixel Studio · 2024–2025',
      meta: 'E-commerce platform for a printing business, built and launched',
      para: 'Built and launched the company’s end-to-end e-commerce website, then kept it honest by testing '
        + 'the payment path from cart addition through to final checkout.',
      bullets: [
        'Built and launched an end-to-end e-commerce website: product catalogs, job overview charts, shopping cart, direct online payment',
        'Integrated and tested secure online payment gateways and e-commerce plugins for smooth transactions',
        'Designed structured product pages, service breakdown charts and custom inquiry forms for sublimation wear, stickers, business cards and print merchandise',
        'Improved usability and navigation with responsive layouts, interactive mega menus and clean UI animations',
        'Recreated and vectorised client logos into high-resolution print-ready formats in Adobe Illustrator and Photoshop',
        'Produced digital product mock-ups for client approval and synchronised order quantities and specifications into the printing production system',
        'Structured web product pages for sublimation jerseys, mirror kote stickers, business cards, flyers, envelopes, textile stamps and wall calendars',
        'Configured dynamic pricing tiers and cost calculation forms from fabric, paper, dimension and volume options'
      ],
      stats: [{ k: 'Role', v: 'Intern' }, { k: 'Period', v: '2024–2025' }, { k: 'Live system', v: 'E-commerce' }],
      pos: [-5, -4],
      xp: 110,
      props: ['counter', 'terminal'],
      unlocks: [
        { label: 'PHP', cat: 'lang' },
        { label: 'MySQL', cat: 'cloud' },
        { label: 'Payment gateway integration', cat: 'craft' },
        { label: 'Responsive UI', cat: 'web' },
        { label: 'Adobe Illustrator', cat: 'design' },
        { label: 'Adobe Photoshop', cat: 'design' }
      ]
    },
    {
      id: 'pos',
      label: 'POS system',
      title: 'UTHM PAGOH',
      kicker: 'Level 3 — systems work',
      heading: 'Coop Store Inventory & POS Management System',
      meta: 'Gold Medal final year project · Top 5 across the Centre for Diploma Studies',
      para: 'A web-based inventory and point-of-sale system running the university cooperative store: '
        + 'barcode-driven checkout, four access roles and automatic replenishment alerts.',
      bullets: [
        'Engineered a web-based inventory and POS management system using PHP, MySQL, JavaScript and Bootstrap to automate stock tracking and retail sales workflows',
        'Integrated real-time barcode scanning hardware for automated item lookup, fast checkout and warehouse receiving verification, cutting manual data-entry errors',
        'Architected multi-role authentication and access control for Superadmin, Department Managers, Warehouse Staff and Cashiers',
        'Built an automated stock replenishment alert module monitoring minimum thresholds to prevent stockouts and over-ordering',
        'Developed an interactive administrative dashboard with dynamic sales analytics, monthly performance visualisations and supplier tracking tables',
        'Conducted user acceptance testing and usability evaluations with store personnel, achieving over 90% positive ratings for ease of use and workflow efficiency',
        'Awarded the Gold Medal and recognised among the Top 5 Best Final Year Projects across the Centre for Diploma Studies'
      ],
      stats: [{ k: 'UAT rating', v: '>90%' }, { k: 'Roles', v: '4' }, { k: 'Medal', v: 'Gold' }],
      pos: [8, -14],
      xp: 140,
      props: ['crate', 'scanner', 'screen'],
      unlocks: [
        { label: 'JavaScript', cat: 'lang' },
        { label: 'Bootstrap', cat: 'web' },
        { label: 'Role-based access control', cat: 'craft' },
        { label: 'Hardware integration', cat: 'craft' },
        { label: 'User acceptance testing', cat: 'craft' },
        { label: 'Gold Medal FYP', cat: 'badge' },
        { label: 'Top-5 FYP', cat: 'badge' }
      ]
    },
    {
      id: 'signspeak',
      label: 'SignSpeak',
      title: 'SignSpeak',
      kicker: 'Level 4 — AI & vision',
      heading: 'Intelligent Sign Language Recognition & Translation',
      meta: 'Final year project · mobile application with a CNN + LSTM recognition core',
      para: 'An application built to bridge communication gaps for the deaf and hard-of-hearing community: '
        + 'real-time sign language recognition with bidirectional translation.',
      bullets: [
        'Engineered an intelligent mobile application for real-time sign language recognition and bidirectional translation',
        'Implemented a hybrid deep learning architecture: computer vision with OpenCV and MediaPipe for spatial landmark extraction, paired with CNN and LSTM models to analyse temporal hand gesture sequences',
        'Developed responsive, user-friendly mobile and web interfaces integrated with cloud-backed services for seamless live video gesture capture and processing',
        'Built an interactive practice module giving real-time feedback so hearing users can learn, validate and improve sign language accuracy',
        'Executed end-to-end model training, data preprocessing and iterative testing in Python to maximise gesture classification accuracy across variable lighting and camera angles'
      ],
      stats: [{ k: 'Models', v: 'CNN + LSTM' }, { k: 'Landmarks', v: 'MediaPipe' }, { k: 'Surface', v: 'Mobile + web' }],
      pos: [22, -14],
      xp: 150,
      props: ['phone', 'skeleton'],
      unlocks: [
        { label: 'OpenCV', cat: 'ai' },
        { label: 'MediaPipe', cat: 'ai' },
        { label: 'CNN', cat: 'ai' },
        { label: 'LSTM', cat: 'ai' },
        { label: 'Model training & evaluation', cat: 'ai' },
        { label: 'Firebase', cat: 'cloud' }
      ]
    },
    {
      id: 'certs',
      label: 'Certifications',
      title: 'Certifications & Data',
      kicker: 'Level 5 — analytics',
      heading: 'Certified in data analytics and BI',
      meta: 'Google Data Analytics Professional · three SAS certificates · AWS',
      para: 'Formal proof on the analytics side of the profile — from wrangling and statistics to dashboards '
        + 'a non-technical stakeholder can actually read.',
      bullets: [
        'Google Data Analytics Professional Certificate',
        'SAS Programming Certification',
        'SAS Business Intelligence Certification',
        'SAS Data Literacy Certification',
        'Amazon Web Services (AWS) Introduction to PartyRock Certification',
        'Daily tools: Power BI, Tableau, SAS, SPSS and Excel'
      ],
      stats: [{ k: 'Certificates', v: '5' }, { k: 'BI tools', v: 'Power BI · Tableau' }, { k: 'Cloud', v: 'AWS' }],
      pos: [29, -2],
      xp: 102,
      props: ['shelf', 'medal'],
      unlocks: [
        { label: 'Power BI', cat: 'data' },
        { label: 'Tableau', cat: 'data' },
        { label: 'SAS', cat: 'data' },
        { label: 'SPSS', cat: 'data' },
        { label: 'Google Data Analytics', cat: 'badge' },
        { label: 'AWS PartyRock', cat: 'badge' }
      ]
    },
    {
      id: 'contact',
      label: 'Hire me',
      title: 'Hire me',
      kicker: 'Level 6 — the finish line',
      heading: 'What to take to the next team',
      meta: 'Cloud backends, modern web frameworks and an AI-accelerated workflow',
      para: 'Everything unlocked on this run, in one place — and how to reach me. Happy to walk through any '
        + 'of the three systems above in detail.',
      bullets: [
        'Web & frameworks: React.js, Node.js, Express, HTML5, CSS3, Tailwind CSS, WordPress, Wix, REST APIs',
        'Databases & cloud backends: Supabase, Firebase (Firestore, Authentication), MySQL',
        'AI-assisted development and productivity: Qoder, Kiro, Codex, Antigravity',
        'Works with clients to translate business concepts into concrete technical requirements; collaborates in cross-functional teams; solves problems independently through iterative testing and debugging; manages multiple deadlines while keeping production data accurate; explains technical and design concepts to non-technical stakeholders'
      ],
      stats: [{ k: 'Email', v: PROFILE.email }, { k: 'Phone', v: PROFILE.phone }, { k: 'LinkedIn', v: '/in/mirzanazeef' }],
      pos: [24, 14],
      xp: 120,
      props: ['flag', 'board'],
      unlocks: [
        { label: 'React.js', cat: 'web' },
        { label: 'Node.js', cat: 'web' },
        { label: 'Express', cat: 'web' },
        { label: 'Tailwind CSS', cat: 'web' },
        { label: 'REST APIs', cat: 'web' },
        { label: 'Supabase', cat: 'cloud' },
        { label: 'AI-assisted development', cat: 'craft' }
      ]
    }
  ];

  /* Extra inventory shown only in the full skills wall (page mode and the final plaza). */
  const FULL_SKILLS = {
    lang: ['C', 'C++', 'Python', 'PHP', 'TypeScript', 'JavaScript', 'R'],
    web: ['React.js', 'Node.js', 'Express', 'HTML5', 'CSS3', 'Tailwind CSS', 'WordPress', 'Wix', 'REST APIs'],
    ai: ['OpenCV', 'MediaPipe', 'CNN', 'LSTM'],
    cloud: ['Supabase', 'Firebase (Firestore, Authentication)', 'MySQL'],
    data: ['Power BI', 'Tableau', 'SAS', 'SPSS', 'Excel'],
    design: ['Adobe Illustrator', 'Adobe Photoshop', 'Canva', 'CapCut'],
    craft: ['Client requirement translation', 'Cross-functional collaboration', 'Iterative debugging', 'Multi-deadline delivery', 'Rapid tool adoption', 'Explaining tech to non-technical stakeholders'],
    badge: ['Google Data Analytics Professional', 'SAS Programming', 'SAS Business Intelligence', 'SAS Data Literacy', 'AWS Introduction to PartyRock']
  };

  const ALL = { PROFILE, SKILL_CATS, XP_PER_LEVEL, WORLD, STOPS, FULL_SKILLS };

  /* Structural guard used by the headless test so content edits cannot silently break the game. */
  function selfCheck() {
    const issues = [];
    const ids = new Set();
    STOPS.forEach(function (s, i) {
      if (!s.id) issues.push('stop ' + i + ' has no id');
      if (ids.has(s.id)) issues.push('duplicate id: ' + s.id);
      ids.add(s.id);
      if (!(s.xp > 0)) issues.push(s.id + ': xp must be positive');
      if (!Array.isArray(s.pos) || s.pos.length !== 2) issues.push(s.id + ': pos must be [x, z]');
      else {
        const d = Math.hypot(s.pos[0], s.pos[1]);
        if (d > WORLD.walkRadius) issues.push(s.id + ': beacon outside walk radius (' + d.toFixed(1) + ')');
      }
      ['title', 'heading', 'meta', 'para'].forEach(function (k) {
        if (!s[k] || !String(s[k]).trim()) issues.push(s.id + ': missing ' + k);
      });
      if (!s.bullets || s.bullets.length < 2) issues.push(s.id + ': needs at least two bullets');
      if (!s.unlocks || s.unlocks.length < 1) issues.push(s.id + ': unlocks nothing');
      (s.unlocks || []).forEach(function (u) {
        if (!u.label || !String(u.label).trim()) issues.push(s.id + ': unlock with empty label');
        if (!SKILL_CATS[u.cat]) issues.push(s.id + ': unknown category "' + u.cat + '" on "' + u.label + '"');
      });
    });
    const startDist = Math.hypot(WORLD.start[0], WORLD.start[1]);
    if (startDist > WORLD.walkRadius) issues.push('start position outside walk radius');
    if (WORLD.reach <= 0) issues.push('reach must be positive');
    STOPS.forEach(function (s, i) {
      STOPS.forEach(function (o, j) {
        if (j <= i) return;
        if (Math.hypot(s.pos[0] - o.pos[0], s.pos[1] - o.pos[1]) < WORLD.reach * 2.2) {
          issues.push('beacons too close to auto-trigger: ' + s.id + ' / ' + o.id);
        }
      });
    });
    return issues;
  }

  function totalXP() {
    return STOPS.reduce(function (a, s) { return a + s.xp; }, 0);
  }

  const api = { selfCheck: selfCheck, totalXP: totalXP, PROFILE, SKILL_CATS, XP_PER_LEVEL, WORLD, STOPS, FULL_SKILLS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.PortfolioData = api;
})(typeof window !== 'undefined' ? window : globalThis);
