/* ============================================================================
 * SKILLS, EDUCATION, CERTIFICATIONS, AWARDS
 * ----------------------------------------------------------------------------
 * HOW TO ADD A TECHNOLOGY
 *   { id: 'vue', name: 'Vue.js', cat: 'web', blurb: 'What you used it for.', source: 'self-taught' }
 *   - id    : lowercase, hyphenated, unique. Projects reference skills by this id.
 *   - cat   : one of the keys in SKILL_CATS below.
 *   - blurb : one honest sentence about what you did with it. No percentages,
 *             no star ratings — the site deliberately has no proficiency bars.
 *   - source: academic | industry | self-taught | certified  (shown as a small tag)
 *   Then list that id in a project's `tech` array in projects.data.js and the
 *   Skills explorer automatically shows the project when the tech is selected.
 * ==========================================================================*/
(function (global) {
  'use strict';

  var SKILL_CATS = [
    { id: 'lang', label: 'Programming Languages', hue: 'amber' },
    { id: 'web', label: 'Web Development', hue: 'teal' },
    { id: 'mobile', label: 'Mobile Application Development', hue: 'violet' },
    { id: 'ai', label: 'AI & Machine Learning', hue: 'rose' },
    { id: 'data', label: 'Data Science & Data Mining', hue: 'cyan' },
    { id: 'db', label: 'Databases & Cloud Backends', hue: 'slate' },
    { id: 'tools', label: 'Development Tools & Frameworks', hue: 'lime' },
    { id: 'design', label: 'Design & Creative Software', hue: 'orange' }
  ];

  var SOURCE_LABELS = {
    academic: 'Studied academically',
    industry: 'Used in industry',
    'self-taught': 'Self-taught through projects',
    certified: 'Certified'
  };

  var SKILLS = [
    /* ---------------------------------------------------- programming languages */
    { id: 'c', name: 'C', cat: 'lang', blurb: 'Foundation coursework: pointers, memory layout and procedural program structure.', source: 'academic' },
    { id: 'cpp', name: 'C++', cat: 'lang', blurb: 'Object-oriented assignments and data-structure work during the diploma.', source: 'academic' },
    { id: 'python', name: 'Python', cat: 'lang', blurb: 'The recognition backend, model training scripts and dataset preprocessing for SignSpeak.', source: 'academic' },
    { id: 'php', name: 'PHP', cat: 'lang', blurb: 'Server-side logic for the coop store POS: authentication, stock movement and reporting.', source: 'academic' },
    { id: 'javascript', name: 'JavaScript', cat: 'lang', blurb: 'POS front-end interactions, this portfolio site and the three.js world behind it.', source: 'self-taught' },
    { id: 'typescript', name: 'TypeScript', cat: 'lang', blurb: 'Studied for typed React work; the language I reach for when a project outgrows plain JS.', source: 'academic' },
    { id: 'r', name: 'R', cat: 'lang', blurb: 'Statistical analysis and plotting in the data modules alongside SPSS and SAS.', source: 'academic' },

    /* ------------------------------------------------------------ web development */
    { id: 'html5', name: 'HTML5', cat: 'web', blurb: 'Semantic, landmark-based markup — the structure of this site is hand-written.', source: 'self-taught' },
    { id: 'css3', name: 'CSS3', cat: 'web', blurb: 'Custom properties, grid and flexbox layouts, transitions and a print stylesheet.', source: 'self-taught' },
    { id: 'bootstrap', name: 'Bootstrap', cat: 'web', blurb: 'Admin layout, tables and form controls for the POS dashboard.', source: 'academic' },
    { id: 'tailwind', name: 'Tailwind CSS', cat: 'web', blurb: 'Utility-first styling studied for faster React interfaces.', source: 'academic' },
    { id: 'react', name: 'React.js', cat: 'web', blurb: 'Component-based interfaces; the framework I am deepening next.', source: 'academic' },
    { id: 'node', name: 'Node.js', cat: 'web', blurb: 'Server-side JavaScript for small APIs and tooling.', source: 'academic' },
    { id: 'express', name: 'Express', cat: 'web', blurb: 'Routing and middleware for Node backends.', source: 'academic' },
    { id: 'rest-api', name: 'REST APIs', cat: 'web', blurb: 'Designed and consumed JSON endpoints, including the FastAPI service the Flutter client calls.', source: 'academic' },
    { id: 'responsive-ui', name: 'Responsive design', cat: 'web', blurb: 'Layouts that hold up from a 320px phone to a desktop, checked at three widths.', source: 'industry' },
    { id: 'wordpress', name: 'WordPress', cat: 'web', blurb: 'Theme and plugin work on commercial sites during the internship.', source: 'industry' },
    { id: 'wix', name: 'Wix', cat: 'web', blurb: 'Rapid site builds where the client needed a low-cost, self-managed storefront.', source: 'industry' },

    /* --------------------------------------------------- mobile application dev */
    { id: 'flutter', name: 'Flutter', cat: 'mobile', blurb: 'SignSpeak client: role-based navigation, screens, widgets and state management in Dart.', source: 'academic' },
    { id: 'camera-capture', name: 'Live camera capture', cat: 'mobile', blurb: 'Streaming preview frames to the recognition service and drawing landmark overlays on top.', source: 'academic' },
    { id: 'tts', name: 'Speech & text output', cat: 'mobile', blurb: 'Text-to-speech service so a recognised sign can be spoken aloud for two-way conversation.', source: 'academic' },
    { id: 'mobile-ux', name: 'Mobile UX for accessibility', cat: 'mobile', blurb: 'Designing for Deaf and hard-of-hearing users: high contrast, minimal text, visual feedback.', source: 'academic' },

    /* -------------------------------------------------------- AI & machine learning */
    { id: 'opencv', name: 'OpenCV', cat: 'ai', blurb: 'Frame decoding, resizing and hand-region preparation before inference.', source: 'academic' },
    { id: 'mediapipe', name: 'MediaPipe', cat: 'ai', blurb: 'Hands and Holistic landmark extraction — 1,662 keypoints per frame for the dataset.', source: 'academic' },
    { id: 'tensorflow', name: 'TensorFlow / Keras', cat: 'ai', blurb: 'Model definition, training loops and .keras export for the Python backend.', source: 'academic' },
    { id: 'cnn', name: 'CNN classifiers', cat: 'ai', blurb: 'MobileNetV3-style spatial classifiers for single-frame alphabet and phrase signs.', source: 'academic' },
    { id: 'lstm', name: 'LSTM / BiLSTM', cat: 'ai', blurb: 'Conv1D + BiLSTM sequence model over 30-frame windows for dynamic signs.', source: 'academic' },
    { id: 'yolo', name: 'YOLO (in progress)', cat: 'ai', blurb: 'Landmark-detection hook built and wired; still waiting on trained weights before it activates.', source: 'self-taught' },
    { id: 'model-eval', name: 'Training & evaluation', cat: 'ai', blurb: 'Dataset splits, normalisation, retraining runs and testing on unseen sequences.', source: 'academic' },
    { id: 'teachable-machine', name: 'Teachable Machine', cat: 'ai', blurb: 'Converted Keras image models used as a fast baseline for static signs.', source: 'self-taught' },

    /* ------------------------------------------------- data science & data mining */
    { id: 'powerbi', name: 'Power BI', cat: 'data', blurb: 'Interactive dashboards from operational data, certified through coursework.', source: 'certified' },
    { id: 'tableau', name: 'Tableau', cat: 'data', blurb: 'Exploratory visualisation and stakeholder-facing charts.', source: 'academic' },
    { id: 'sas', name: 'SAS', cat: 'data', blurb: 'Programming, business intelligence and data literacy — three separate certifications.', source: 'certified' },
    { id: 'spss', name: 'SPSS', cat: 'data', blurb: 'Descriptive statistics and survey analysis, including the POS usability results.', source: 'academic' },
    { id: 'excel', name: 'Excel', cat: 'data', blurb: 'Cleaning, pivoting and order tracking sheets feeding production systems.', source: 'industry' },
    { id: 'dataset-pipeline', name: 'Dataset engineering', cat: 'data', blurb: 'Built the 117-class / 15,258-sequence BIM landmark dataset and its normalisation formula.', source: 'academic' },
    { id: 'analytics-dashboards', name: 'Operational analytics', cat: 'data', blurb: 'Sales trends and monthly performance views built from live transactional tables.', source: 'academic' },

    /* --------------------------------------------------- databases & cloud backends */
    { id: 'mysql', name: 'MySQL', cat: 'db', blurb: 'Normalised schema for stock, suppliers, roles and sales in the POS system.', source: 'academic' },
    { id: 'firebase', name: 'Firebase', cat: 'db', blurb: 'Authentication and Firestore document storage behind the SignSpeak app.', source: 'academic' },
    { id: 'supabase', name: 'Supabase', cat: 'db', blurb: 'Hosted Postgres plus auth for project backends.', source: 'self-taught' },

    /* -------------------------------------------- development tools & frameworks */
    { id: 'fastapi', name: 'FastAPI', cat: 'tools', blurb: 'The Python inference service: /health, /translate-frame and /translate-sequence.', source: 'academic' },
    { id: 'git', name: 'Git', cat: 'tools', blurb: 'Version control across project repositories.', source: 'self-taught' },
    { id: 'local-server', name: 'Local LAMP stack', cat: 'tools', blurb: 'XAMPP for PHP/MySQL development, hardware testing and user acceptance runs.', source: 'academic' },
    { id: 'ai-tools', name: 'AI-assisted development', cat: 'tools', blurb: 'Qoder, Kiro, Codex and Antigravity used to scaffold, refactor and review code faster.', source: 'self-taught' },
    { id: 'hardware-integration', name: 'Hardware integration', cat: 'tools', blurb: 'Barcode scanner input wired into checkout and warehouse receiving flows.', source: 'academic' },
    { id: 'rbac', name: 'Role-based access control', cat: 'tools', blurb: 'Four-tier permission design: superadmin, manager, warehouse staff, cashier.', source: 'academic' },
    { id: 'uat', name: 'User acceptance testing', cat: 'tools', blurb: 'Ran structured UAT with store personnel and scored the results.', source: 'academic' },

    /* ------------------------------------------------- design & creative software */
    { id: 'illustrator', name: 'Adobe Illustrator', cat: 'design', blurb: 'Vectorised client logos and print-ready artwork at production resolution.', source: 'industry' },
    { id: 'photoshop', name: 'Adobe Photoshop', cat: 'design', blurb: 'Retouching, mock-ups and pre-press preparation for print runs.', source: 'industry' },
    { id: 'canva', name: 'Canva', cat: 'design', blurb: 'Fast marketing collateral for client review cycles.', source: 'industry' },
    { id: 'capcut', name: 'CapCut', cat: 'design', blurb: 'Short product and demo edits, including project walkthrough videos.', source: 'self-taught' },
    { id: 'svg', name: 'SVG authoring', cat: 'design', blurb: 'Hand-written vector covers and architecture diagrams — every graphic on this site.', source: 'self-taught' }
  ];

  /* ---------------------------------------------------------------- education
   * verify: fields are shown only at index.html?edit=1 — they mark facts that
   * need one look-over before you publish. Nothing renders for visitors.
   * ------------------------------------------------------------------------ */
  var EDUCATION = [
    {
      institution: 'Universiti Tun Hussein Onn Malaysia (UTHM)',
      qualification: 'Bachelor of Information Technology with Honours',
      period: '2025 — current',
      status: 'Final stage',
      cgpa: '3.86',
      summary: 'Degree study taken after the diploma, with project work weighted towards '
        + 'intelligent systems, full-stack development and data analytics.',
      focus: [
        'Software engineering across the full cycle, from schema design to deployment',
        'Computer vision and deep learning pipelines',
        'Statistics and business intelligence tooling',
        'Cloud backends and rapid web platforms'
      ],
      coursework: [],
      courseworkNote: 'Module names are not listed on the CV — paste the official transcript titles here.',
      projects: ['signspeak'],
      achievements: [],
      verify: 'The degree entry carries no awards of its own — the medals below the diploma are diploma awards. Add degree honours here if the CV gains any.'
    },
    {
      institution: 'Universiti Tun Hussein Onn Malaysia (UTHM)',
      qualification: 'Diploma of Information Technology',
      period: '2022 — 2025',
      status: 'Completed',
      cgpa: '3.76',
      summary: 'Diploma grounding in programming, databases and systems development, finished '
        + 'with distinction-level standing and a deployed campus retail system.',
      focus: [
        'Programming foundations in C, C++ and Python',
        'Database design and web development with PHP and MySQL',
        'Systems analysis and requirements gathering with real users',
        'Statistics with R, SPSS and SAS'
      ],
      coursework: [],
      courseworkNote: 'Add the diploma module titles here if you want them listed.',
      projects: ['coop-pos', 'bim-dataset'],
      achievements: [
        'Graduated with CGPA 3.76',
        'Vice-Chancellor’s Award (Anugerah Naib Canselor)',
        'Gold Medal for the Final Year Project',
        'Top 5 Best Final Year Project — Centre for Diploma Studies'
      ]
    }
  ];

  var EXPERIENCE = [
    {
      org: 'Click Pixel Studio',
      role: 'Intern — Web Developer & Graphic Designer',
      period: '2024 — 2025',
      points: [
        'Built and launched the company’s end-to-end e-commerce website: product catalogue, job overview charts, shopping cart and direct online payment.',
        'Integrated and tested secure payment gateways and e-commerce plugins across the whole path from cart to checkout.',
        'Designed product pages, service breakdown charts and custom inquiry forms for sublimation wear, stickers, business cards and print merchandise.',
        'Recreated and vectorised client logos into high-resolution print-ready artwork in Adobe Illustrator and Photoshop.',
        'Produced digital mock-ups for client approval and synchronised order quantities and specifications into the printing production system.'
      ],
      projects: ['clickpixel-commerce']
    },
    {
      org: 'Fizar Enterprise',
      role: 'Part-Time Web Developer & Graphic Designer',
      period: '2024 — 2025',
      points: [
        'Developed and deployed a responsive website showcasing company services, completed print works and custom apparel designs.',
        'Designed custom print-ready vector graphics, sublimation apparel and marketing collateral including large-format banners.',
        'Evaluated sublimation materials and production specifications to hold print quality and durability.',
        'Consulted directly with clients to gather requirements and present mock-ups for final production approval.'
      ],
      projects: ['fizar-website']
    }
  ];

  /* ------------------------------------------------------------ certifications
   * date and verifyUrl are blank on purpose — the CV does not state issue dates
   * or credential URLs. Fill them and the card picks them up automatically.
   * An entry with no URL renders "Verification link not published yet".
   * ------------------------------------------------------------------------ */
  /* icon: a mark from js/modules/icons.js — the issuer's own where one is
     licensed for reuse, otherwise the plain certificate seal. */
  var CERTIFICATIONS = [
    { title: 'Google Data Analytics Professional Certificate', issuer: 'Google / Coursera', date: '', url: '', icon: 'google', skills: ['powerbi', 'tableau', 'excel', 'spss'], blurb: 'End-to-end analytics path: ask, prepare, process, analyse, share and act on data.' },
    { title: 'SAS Programming Certification', issuer: 'SAS', date: '', url: '', icon: 'certificate', skills: ['sas'], blurb: 'Data step and PROC SQL programming for cleaning and transforming tabular data.' },
    { title: 'SAS Business Intelligence Certification', issuer: 'SAS', date: '', url: '', icon: 'certificate', skills: ['sas', 'analytics-dashboards'], blurb: 'Building governed reporting assets and BI dashboards on SAS.' },
    { title: 'SAS Data Literacy Certification', issuer: 'SAS', date: '', url: '', icon: 'certificate', skills: ['sas'], blurb: 'Reading, questioning and communicating with data responsibly.' },
    { title: 'AWS Introduction to PartyRock Certification', issuer: 'Amazon Web Services', date: '', url: '', icon: 'ai-tools', skills: ['ai-tools'], blurb: 'Building generative-AI applications on the AWS PartyRock platform.' }
  ];

  var AWARDS = [
    { title: 'Vice-Chancellor’s Award (Anugerah Naib Canselor)', org: 'Universiti Tun Hussein Onn Malaysia', detail: 'Diploma of Information Technology', date: '' },
    { title: 'Gold Medal — Final Year Project', org: 'Universiti Tun Hussein Onn Malaysia', detail: 'Diploma of Information Technology', date: '' },
    { title: 'Top 5 Best Final Year Project', org: 'Centre for Diploma Studies, UTHM', detail: 'Ranked among the five best diploma projects', date: '' }
  ];

  var LANGUAGES_SPOKEN = [
    { name: 'Malay', level: 'Native' },
    { name: 'English', level: 'Working proficiency' }
  ];

  var api = {
    SKILL_CATS: SKILL_CATS,
    SOURCE_LABELS: SOURCE_LABELS,
    SKILLS: SKILLS,
    EDUCATION: EDUCATION,
    EXPERIENCE: EXPERIENCE,
    CERTIFICATIONS: CERTIFICATIONS,
    AWARDS: AWARDS,
    LANGUAGES_SPOKEN: LANGUAGES_SPOKEN
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.SiteContent = api;
})(typeof window !== 'undefined' ? window : globalThis);
