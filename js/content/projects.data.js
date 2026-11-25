/* ============================================================================
 * PROJECTS — the single source of truth for the gallery and the detail views.
 * ----------------------------------------------------------------------------
 * ADD A PROJECT: copy any object below, change `id` (also used for asset file
 * names) and fill the fields. Delete fields you cannot answer honestly — the
 * renderer hides empty sections rather than showing a stub.
 *
 *   id            unique, lowercase-hyphen. Used for the deep link
 *                 #/project/<id> and the "open project" labels.
 *   title         card + page heading
 *   subtitle      one line under the title
 *   status        'Shipped' | 'Live' | 'In development' | 'Coursework' ...
 *   period        '2025' | '2024 — 2025'
 *   role          your role, so group work is never implied to be solo
 *   solo          true  -> badge "built independently"
 *   categories    ids from CATEGORIES below; a project may have several
 *   tech          skill ids from js/content/skills.data.js — this is what
 *                 powers the Skills explorer's "projects using this" link
 *   summary       one or two sentences for the card
 *   overview      paragraphs for the detail view
 *   problem       why the project existed
 *   objectives    bullet list
 *   features      what the finished thing does
 *   methodology   { name, steps } — how the work was actually run
 *   architecture  { caption, diagram, flow } — flow is the text fallback
 *   gallery       [{ src, alt, caption, kind }] kind: screenshot|diagram|concept
 *   challenges    [{ problem, solution }] — the part recruiters read
 *   results       { metrics: [{ k, v }], outcomes: [..] } — real numbers only
 *   learnings     what you took away
 *   links         { repo, demo } — '' means "not linked yet", never a fake URL
 *   verify        internal note shown only at index.html?edit=1
 * ==========================================================================*/
(function (global) {
  'use strict';

  var CATEGORIES = [
    { id: 'all', label: 'All Projects' },
    { id: 'personal', label: 'Personal Projects' },
    { id: 'academic', label: 'Academic Projects' },
    { id: 'web', label: 'Web Development' },
    { id: 'mobile', label: 'Mobile Application Development' },
    { id: 'ai', label: 'AI & Machine Learning' },
    { id: 'data', label: 'Data Science & Data Mining' },
    { id: 'other', label: 'Other Projects' }
  ];

  var PROJECTS = [
    {
      id: 'signspeak',
      title: 'SignSpeak',
      subtitle: 'Real-time Bahasa Isyarat Malaysia recognition and two-way translation',
      status: 'Final year project · in development',
      period: '2025',
      role: 'Project lead — app, backend and model pipeline',
      solo: false,
      categories: ['academic', 'mobile', 'ai', 'data'],
      featured: true,
      cover: 'assets/covers/signspeak.svg',
      tech: ['flutter', 'python', 'fastapi', 'rest-api', 'opencv', 'mediapipe', 'tensorflow', 'cnn', 'lstm', 'yolo', 'firebase', 'camera-capture', 'tts', 'mobile-ux', 'model-eval', 'dataset-pipeline'],
      summary: 'A Flutter application that reads Malaysian Sign Language from the camera and '
        + 'translates both ways, backed by a Python FastAPI service running MediaPipe '
        + 'landmark extraction and CNN/BiLSTM classifiers.',
      overview: [
        'SignSpeak exists to shorten the gap between Deaf and hard-of-hearing users and the '
          + 'people around them. A user points the camera at their hands, the service returns '
          + 'the recognised sign with a confidence score, and the app can speak it aloud. The '
          + 'reverse path lets a hearing user type or speak and see the sign taught back.',
        'Architecturally it is three layers: a Flutter client that owns camera preview, '
          + 'landmark overlay and role-based navigation; a FastAPI service that turns frames '
          + 'into features and predictions; and trained model files that can be swapped '
          + 'without touching client code. Firebase handles accounts and history.'
      ],
      problem: 'Malaysian Sign Language is not widely understood by hearing people, and the '
        + 'tools that do exist either work on a fixed vocabulary of static handshapes or '
        + 'cannot run on a phone camera. Dynamic signs — where motion carries meaning — need '
        + 'a pipeline that keeps temporal context, and a learner needs feedback on whether '
        + 'they got it right.',
      objectives: [
        'Recognise BIM signs from a live phone camera and return the word plus a confidence score',
        'Support two-way communication: sign-to-text and text-to-sign, including spoken output',
        'Teach signs to hearing users through a practice module with immediate correctness feedback',
        'Keep the recognition service swappable so a better model can ship without an app update',
        'Separate learner, Deaf/hard-of-hearing and administrator roles with their own surfaces'
      ],
      features: [
        'Live translate screen streaming camera frames to /translate-sequence and drawing returned landmarks over the preview',
        'Guided learn screens with a BIM library, saved phrases and personal history',
        'Practice module scoring each attempt and showing which signs need repetition',
        'Text-to-speech output so a recognised sign can be heard, not just read',
        'Role-based docks: learner, DHH user (with verification and speech-to-text), and admin',
        'Admin area for dataset governance — reviewing samples, users and submitted feedback',
        'Health endpoint reporting which detectors and classes are loaded, so a misconfigured model is obvious'
      ],
      methodology: {
        name: 'Iterative build–measure–replace',
        steps: [
          'Collect and label sequences, then extract landmarks offline before writing any interface code',
          'Baseline with a static image classifier to prove the capture path end to end',
          'Move to landmark features so recognition stops depending on lighting and background',
          'Train sequence models on normalised features and test on unseen samples',
          'Replace the model behind the same API contract; the client keeps working unchanged'
        ]
      },
      architecture: {
        caption: 'Camera frames travel to a FastAPI service; the response carries the predicted sign, its confidence and the landmark points to draw.',
        diagram: 'assets/diagrams/signspeak-flow.svg',
        flow: [
          'Flutter camera preview captures frames',
          'Frames POST to /translate-sequence (multipart)',
          'OpenCV decodes and prepares each frame',
          'MediaPipe Holistic extracts 1,662 keypoints per frame',
          'Shoulder-midpoint normalisation makes features position and scale invariant',
          'Conv1D + BiLSTM (or MobileNetV3 CNN for single frames) classifies across 117 BIM classes',
          'JSON response: sign word, confidence, landmark points',
          'Client overlays the skeleton and optionally speaks the word'
        ]
      },
      gallery: [
        { src: 'assets/diagrams/signspeak-flow.svg', alt: 'SignSpeak recognition pipeline from camera capture to translated output', caption: 'Recognition pipeline — authored from the implemented code, not a marketing diagram', kind: 'diagram' },
        { src: 'assets/covers/signspeak.svg', alt: 'Abstract cover for SignSpeak showing a hand skeleton over a phone frame', caption: 'Project cover — concept illustration, not an app screenshot', kind: 'concept' }
      ],
      galleryNote: 'App screenshots are not included yet. Drop images at assets/projects/signspeak-1.png and add a gallery entry with kind: "screenshot".',
      challenges: [
        {
          problem: 'An image classifier memorised the room. The first baseline worked on the training background and fell apart on a different wall or lighting condition.',
          solution: 'Switched the representation from pixels to MediaPipe Holistic keypoints, then normalised every sequence by the shoulder midpoint and nose-to-shoulder distance so position and scale stop mattering.'
        },
        {
          problem: 'Mixing datasets made results impossible to read — alphabet samples, phrase samples and ad-hoc captures all had different feature shapes.',
          solution: 'Built an isolated training path for the normalised 117-class dataset with its own train and test scripts, so no legacy sample is silently merged into a run.'
        },
        {
          problem: 'Dynamic signs need temporal context, but a phone cannot stream every frame to a server at 30fps on a campus network.',
          solution: 'The client sends a short window of frames and the service aggregates over the sequence; a 5-frame averaging path exists as a fast fallback while the full sequence model is being improved.'
        },
        {
          problem: 'The hybrid detector was blocked on weights that do not exist yet.',
          solution: 'Wrote the YOLO landmark hook against a defined contract: if the weights file is present the API returns landmarks, if not the client shows a guide overlay. Nothing crashes and the gap is visible instead of hidden.'
        }
      ],
      results: {
        metrics: [
          { k: 'BIM classes', v: '117' },
          { k: 'Training sequences', v: '15,258' },
          { k: 'Keypoints per frame', v: '1,662' },
          { k: 'Client surfaces', v: '3 roles' }
        ],
        outcomes: [
          'A working end-to-end path from phone camera to translated sign, with the model behind a stable API',
          'A reusable normalised landmark dataset and training scripts that can be re-run from scratch',
          'Honest scope: the full YOLO → CNN → LSTM hybrid is designed and partially built, not finished'
        ]
      },
      learnings: [
        'Feature choice matters more than model size — moving to normalised landmarks fixed what more epochs could not',
        'A prototype that averages frame probabilities is useful, but it is not sequence learning, and pretending otherwise would have wasted the next two iterations',
        'Designing the API contract first let the client and the model evolve independently'
      ],
      links: { repo: '', demo: '' },
      verify: 'Supervisor and teammates are not credited on the site. The CV names your project '
        + 'supervisor in its References block — add her to the credits only with her permission. '
        + 'The Gold Medal belongs to the POS project, not this one.'
    },

    {
      id: 'coop-pos',
      title: 'Coop Store Inventory & POS System',
      subtitle: 'Barcode-driven point of sale and stock control for a university cooperative store',
      status: 'Shipped · Gold Medal final year project',
      period: '2024 — 2025',
      role: 'Developer — analysis, database design, implementation and UAT',
      solo: false,
      categories: ['academic', 'web', 'data'],
      featured: true,
      cover: 'assets/covers/coop-pos.svg',
      tech: ['php', 'mysql', 'javascript', 'bootstrap', 'html5', 'css3', 'responsive-ui', 'rbac', 'hardware-integration', 'analytics-dashboards', 'uat', 'local-server', 'excel'],
      summary: 'A web-based inventory and point-of-sale system running a campus retail operation: '
        + 'barcode checkout, four access roles, automatic replenishment alerts and a sales '
        + 'analytics dashboard.',
      overview: [
        'The cooperative store was tracking stock and sales by hand, which meant slow queues at '
          + 'peak hours and stock counts nobody trusted. This system replaces that with a '
          + 'barcode-first checkout, a stock ledger, and role-scoped screens for the people who '
          + 'actually run the place: cashiers, warehouse staff, department managers and the superadmin.',
        'It was built and demonstrated as a final year project and awarded a Gold Medal, placing '
          + 'among the five best projects in the Centre for Diploma Studies.'
      ],
      problem: 'Manual stock records produced three failures at once: checkout queues at '
        + 'class breaks, stockouts discovered only when a customer asked for the item, and '
        + 'reordering done from memory rather than from movement data.',
      objectives: [
        'Automate stock tracking and retail sales workflow for the cooperative store',
        'Make checkout fast enough to clear a queue between classes using barcode scanning',
        'Prevent stockouts and over-ordering with threshold-based replenishment alerts',
        'Give each operational role only the screens and permissions it needs',
        'Replace guesswork with a dashboard of real sales and supplier performance'
      ],
      features: [
        'Barcode scanning for item lookup, checkout and warehouse receiving verification',
        'Multi-role authentication with access control for superadmin, department managers, warehouse staff and cashiers',
        'Stock ledger with movement history and automatic replenishment alerts at minimum thresholds',
        'Administrative dashboard with dynamic sales analytics, monthly performance charts and supplier tracking tables',
        'Cart, discount and receipt flow built for a shared counter terminal',
        'Responsive interface usable on the store desktop and a phone on the warehouse floor'
      ],
      methodology: {
        name: 'Structured systems development with user acceptance',
        steps: [
          'Observed the store workflow and collected requirements from the staff who run it',
          'Modelled the MySQL schema around stock movements rather than around screens',
          'Built role by role, testing each permission boundary as it was added',
          'Integrated barcode hardware against real item labels, not a keyboard emulator',
          'Ran user acceptance testing with store personnel and scored the results',
          'Refined the checkout path from what staff fumbled during those sessions'
        ]
      },
      architecture: {
        caption: 'A PHP application over a MySQL stock ledger, with scanner input at the counter and role-scoped dashboards.',
        diagram: 'assets/diagrams/coop-pos-flow.svg',
        flow: [
          'Cashier scans a barcode at the counter terminal',
          'PHP endpoint resolves the item and writes the sale line',
          'MySQL stock ledger decrements quantity in the same transaction',
          'Threshold check fires a replenishment alert to warehouse staff',
          'Manager dashboard aggregates sales, movement and supplier tables',
          'Session-based role middleware gates every screen behind the four permission levels'
        ]
      },
      gallery: [
        { src: 'assets/diagrams/coop-pos-flow.svg', alt: 'System flow for the POS: scanner, PHP application, MySQL ledger and dashboards', caption: 'System architecture — drawn from the implemented modules', kind: 'diagram' },
        { src: 'assets/covers/coop-pos.svg', alt: 'Abstract cover showing a receipt and barcode motif', caption: 'Project cover — concept illustration, not a screenshot of the deployed system', kind: 'concept' }
      ],
      galleryNote: 'Screenshots of the running system are not published yet (it is campus infrastructure). Add them at assets/projects/coop-pos-1.png if you are cleared to show them.',
      challenges: [
        {
          problem: 'Manual data entry was where the errors lived, so removing it had to be genuine rather than a second input box.',
          solution: 'Wired the scanner into item lookup, checkout and warehouse receiving so the barcode — not a person — is the source of truth at every stock movement.'
        },
        {
          problem: 'Four roles sharing one system meant a cashier should never see supplier cost, and warehouse staff should never see takings.',
          solution: 'Centralised session-based role checks in one middleware layer instead of scattering conditionals through pages, so a new screen is denied by default.'
        },
        {
          problem: 'Reordering depended on someone noticing a nearly empty shelf.',
          solution: 'Added a minimum-threshold alert module that raises replenishment notices automatically, preventing both stockouts and the over-ordering that followed them.'
        },
        {
          problem: 'A system the staff would not use is a failed system, regardless of the code.',
          solution: 'Ran formal user acceptance testing with store personnel and used the sessions to fix the checkout flow; the evaluation scored above 90% positive on ease of use and workflow efficiency.'
        }
      ],
      results: {
        metrics: [
          { k: 'UAT positive rating', v: '>90%' },
          { k: 'Access roles', v: '4' },
          { k: 'Award', v: 'Gold Medal' },
          { k: 'Ranking', v: 'Top 5 FYP' }
        ],
        outcomes: [
          'Deployed for the university cooperative store’s stock and sales workflow',
          'Checkout, receiving and reordering reduced to barcode-driven steps with far less manual entry',
          'Recognised by the faculty: Gold Medal and Top 5 Best Final Year Project, Centre for Diploma Studies'
        ]
      },
      learnings: [
        'Modelling the data first made every screen easier — the stock ledger, not the UI, was the hard part',
        'Permission checks belong in one place; duplicating them across pages is how leaks happen',
        'Watching a real cashier use the system found bugs that no amount of self-testing surfaced'
      ],
      links: { repo: '', demo: '' },
      verify: 'The store name and any live URL are not on the CV. Add the deployment period and a supervisor signature if you want the award independently checkable.'
    },

    {
      id: 'teampilot',
      title: 'TeamPilot',
      subtitle: 'Group project planner with a capacity-aware scheduler and a reviewable AI coordinator',
      status: 'Working prototype',
      period: '2026',
      role: 'Designed and built independently — planner, interface, server and AI agent',
      solo: true,
      categories: ['personal', 'web', 'ai'],
      featured: true,
      cover: 'assets/covers/teampilot.svg',
      tech: ['javascript', 'node', 'html5', 'css3', 'responsive-ui', 'rest-api', 'agents-sdk', 'gemini-api', 'git', 'ai-tools'],
      summary: 'A browser workspace that turns a group assignment brief, meeting notes and each '
        + 'member’s available hours into a feasible schedule — and when someone drops out, an '
        + 'AI coordinator proposes a recovery plan that the team leader reviews before anything changes.',
      overview: [
        'Student group projects usually fail the same way: tasks are split by guesswork, nobody '
          + 'knows which piece blocks which, and when one member goes quiet the deadline slips '
          + 'before anyone notices. TeamPilot gives the team leader one place to hold the brief, '
          + 'the team’s skills and daily availability, the task board and the schedule.',
        'A deterministic planning engine checks dependencies, fits work into each member’s '
          + 'declared hours in half-hour blocks and flags anything that will not fit. On top of it '
          + 'sits an AI coordinator built with an agents SDK and connected to Google Gemini. The '
          + 'agent can read the project, evaluate a delay and stage a proposal through six narrowly '
          + 'scoped tools — but it can never change the board on its own. Every change waits for '
          + 'the leader to approve or reject it.'
      ],
      problem: 'Group work is planned from memory and good intentions. Nobody checks whether the '
        + 'hours people actually have can cover the work assigned to them, dependencies are '
        + 'discovered when someone is already blocked, and replanning after a member becomes '
        + 'unavailable is done in a hurry over chat.',
      objectives: [
        'Turn a brief, meeting notes and team availability into a schedule that fits declared capacity',
        'Detect blocking dependencies and impossible deadlines before the work starts',
        'Let an AI agent investigate delays and propose recovery plans using real planner results, not guesses',
        'Keep the human in charge: no AI change reaches the task board without explicit approval',
        'Keep API keys server-side and the whole app runnable locally without a build step'
      ],
      features: [
        'Project setup with brief, meeting notes, team skills and day-by-day available hours',
        'Task board with owners, effort estimates, progress, blockers and dependency links',
        'Scheduler that checks dependency order and allocates work in half-hour blocks against each member’s capacity',
        'Team & capacity view showing planned hours against what each member declared',
        'AI coordinator with six scoped tools (such as read_project, evaluate_delay and propose_plan) and a live tool-activity panel',
        'Review, apply or reject flow — proposals are recalculated on approval and refused if the project changed in the meantime',
        'Browser persistence plus JSON backup/import and CSV or Markdown report export'
      ],
      methodology: {
        name: 'Specification first, deterministic core, bounded AI on top',
        steps: [
          'Wrote a build specification with the demonstration flow and acceptance criteria before any code',
          'Built and tested the planning engine on its own: data validation, dependency ordering and capacity scheduling',
          'Built the interface on the same shared planner code so browser and server agree on every rule',
          'Added the AI agent last, limited to tools that call the tested planner instead of inventing schedules',
          'Covered planner, server security and agent behaviour with automated tests, then ran a live check with Gemini on fictional data'
        ]
      },
      architecture: {
        caption: 'The browser and the server share one planning engine; the AI agent only works through tools that call it.',
        diagram: '',
        flow: [
          'Team leader enters the brief, notes, team skills and daily availability in the browser',
          'planner.js validates the data, orders tasks by dependency and allocates half-hour blocks per member',
          'A request such as “Ali is unavailable on Tuesday” goes to the local Node.js server',
          'The agent calls scoped tools — read the project, evaluate the delay, propose a plan — each backed by the planner',
          'The staged proposal streams back with its tool activity, without touching the board',
          'The leader approves or rejects; approval recalculates the plan and applies exactly the reviewed changes'
        ]
      },
      gallery: [
        { src: 'assets/projects/teampilot-1.jpg', alt: 'TeamPilot overview screen with project progress, upcoming tasks, team capacity bars and the AI project copilot panel', caption: 'Overview screen with a fictional sample project', kind: 'screenshot' },
        { src: 'assets/covers/teampilot.svg', alt: 'Abstract cover for TeamPilot showing a task schedule grid with an approval check', caption: 'Project cover — concept illustration', kind: 'concept' }
      ],
      challenges: [
        {
          problem: 'An AI model that edits a schedule directly can produce plans that look confident but break dependencies or overload someone.',
          solution: 'The agent never writes to the board. It can only call tools backed by the tested planner, its output is schema-validated, and every proposal is staged for the leader to approve or reject.'
        },
        {
          problem: 'A proposal can go stale if the leader edits the project while the agent is still working.',
          solution: 'Proposals carry the project revision they were built from. On approval the plan is recalculated and refused if the revision changed or any work is left unscheduled.'
        },
        {
          problem: 'Browser and server could disagree about what a valid schedule is.',
          solution: 'Wrote the planner once in plain JavaScript and shared it between the browser and the Node.js server, so both apply exactly the same rules.'
        },
        {
          problem: 'Model availability and free-tier quotas changed during development, and some models were overloaded or retired.',
          solution: 'Made provider and model selection explicit with a connection test, clear error messages for quota, overload and retired models, and no silent fallback to another provider.'
        }
      ],
      results: {
        metrics: [
          { k: 'Automated checks', v: '35 passing' },
          { k: 'Agent tools', v: '6' },
          { k: 'Team size', v: 'Up to 12' },
          { k: 'Build step', v: 'none' }
        ],
        outcomes: [
          'A working local application covering setup, task board, schedule, capacity, recovery and export',
          'A live recovery run with Gemini moved a task from an unavailable member to a teammate and produced a feasible schedule without changing the board',
          'Demo videos produced in English and Malay'
        ]
      },
      learnings: [
        'The reliable part of an AI feature is the deterministic code it is allowed to call — the model should choose, not calculate',
        'A human review step is a design feature, not a limitation, when the output affects other people’s workload',
        'Writing the specification and acceptance criteria first made it obvious when the project was actually done'
      ],
      links: { repo: 'https://github.com/nazKnow-IT/TeamPilot', demo: '' },
      verify: 'The README mentions a competition demonstration. Add the competition name and result here if you want it shown. There is no hosted demo yet.'
    },

    {
      id: 'mydompet',
      title: 'MyDompet',
      subtitle: 'Personal spending tracker with receipt scanning and spending goals',
      status: 'Working prototype',
      period: '2026',
      role: 'Designed and built independently',
      solo: true,
      categories: ['personal', 'web'],
      featured: true,
      cover: 'assets/covers/mydompet.svg',
      tech: ['javascript', 'html5', 'css3', 'responsive-ui', 'svg', 'tesseract'],
      summary: 'A lightweight web app for tracking everyday spending in Ringgit: snap a receipt and '
        + 'it reads the shop, date and total for you, sorts the expense into a category, and shows '
        + 'how you are doing against daily, weekly and monthly limits.',
      overview: [
        'MyDompet (“my wallet”) is a personal finance tracker built for students and young adults '
          + 'who want to know where their money goes without a bank login or a subscription. '
          + 'Expenses can be typed in or captured from a photo of the receipt.',
        'Receipt reading runs entirely in the browser with Tesseract.js OCR. The app compresses '
          + 'the photo, extracts the text, picks out the merchant, date and total, and suggests a '
          + 'category from keywords — including local ones like “kopi” and “nasi”. Everything is '
          + 'stored on the device, so no spending data leaves the phone.'
      ],
      problem: 'Small daily purchases — food, transport, e-wallet top-ups — add up without anyone '
        + 'noticing. Most budgeting apps need a bank connection or an account, and typing every '
        + 'receipt in by hand is tedious enough that people stop after a week.',
      objectives: [
        'Make logging an expense take seconds, including straight from a receipt photo',
        'Show spending clearly by day, week, month and category',
        'Let users set spending limits and see how close they are at a glance',
        'Keep all data on the user’s own device with no sign-up',
        'Work well on a phone screen'
      ],
      features: [
        'Receipt scanning: OCR reads the merchant, date and total, then fills in the expense form for checking',
        'Add, edit and delete expenses, with the receipt photo kept alongside each one',
        'Automatic category suggestion from merchant and receipt keywords across 11 categories',
        'Payment method tracking: cash, card, e-wallet and online banking',
        'Daily spending chart for the month, drawn as SVG',
        'Spending goals with daily, weekly, monthly and yearly limits and progress bars',
        'Month-by-month transaction history with CSV export',
        'Data saved in the browser’s local storage — no account and no server'
      ],
      methodology: {
        name: 'Small, phone-first and private by default',
        steps: [
          'Started from the fastest possible manual entry flow before adding any automation',
          'Added receipt scanning as an optional helper that fills the form, never saving without the user checking',
          'Tuned the receipt parser against real Malaysian receipt layouts: totals in RM, day-first dates and common headers',
          'Kept the whole app as static files so it opens anywhere without a backend'
        ]
      },
      architecture: {
        caption: 'Everything runs in the browser: OCR, parsing, charts and storage.',
        diagram: '',
        flow: [
          'User takes or chooses a receipt photo',
          'Image is resized and compressed on a canvas to speed up reading',
          'Tesseract.js extracts the receipt text in the browser',
          'Parser finds the merchant line, the date and the grand total in RM',
          'Keyword rules suggest a category and the expense form is pre-filled for the user to confirm',
          'Saved expenses go to local storage and update the chart, goals and history'
        ]
      },
      gallery: [
        { src: 'assets/projects/mydompet-1.jpg', alt: 'MyDompet home screen with monthly spending, budget remaining, today’s total, recent expenses and the monthly budget bar', caption: 'Home screen with sample expenses', kind: 'screenshot' },
        { src: 'assets/covers/mydompet.svg', alt: 'Abstract cover for MyDompet showing a receipt next to a phone with a spending chart', caption: 'Project cover — concept illustration', kind: 'concept' }
      ],
      challenges: [
        {
          problem: 'Receipt photos from a phone are large, and OCR on a full-size image is slow on mobile.',
          solution: 'Resize every photo to at most 1,800 pixels and re-encode it as JPEG on a canvas before reading, and load the OCR library only when the user first scans.'
        },
        {
          problem: 'Receipts are inconsistent — many lines contain numbers, and only one of them is the amount actually paid.',
          solution: 'The parser ranks total lines — grand total, amount due and net total first, then plain total but never subtotal — and reads amounts written as RM14.70, RM 14.70 or 14.70. Testing found that totals printed without a space after RM were being missed, which this fixed.'
        },
        {
          problem: 'Dates appear in different formats, and day and month can be swapped.',
          solution: 'Handle both day-first and year-first formats, expand two-digit years, and swap day and month when the month value is impossible.'
        },
        {
          problem: 'OCR will sometimes misread a receipt, and a wrong expense is worse than no expense.',
          solution: 'Scanning only pre-fills the form and tells the user which fields it found. Nothing is saved until the user checks the details and presses save.'
        }
      ],
      results: {
        metrics: [
          { k: 'Categories', v: '11' },
          { k: 'Goal periods', v: '4' },
          { k: 'Server needed', v: 'none' },
          { k: 'Account needed', v: 'none' }
        ],
        outcomes: [
          'A working tracker that runs from two static files on any modern phone or laptop browser',
          'Receipt-to-expense in one scan for clear, well-lit receipts',
          'Spending data that stays entirely on the user’s device'
        ]
      },
      learnings: [
        'OCR gets you text, but the value is in the parsing rules that turn it into the right fields',
        'Automation should fill in the form, not make the decision — users trust what they can check',
        'Keeping everything on the device removed the need for accounts, servers and a privacy policy'
      ],
      links: { repo: 'https://github.com/nazKnow-IT/MyDompet', demo: '' },
      verify: 'If you host it (for example on GitHub Pages), add the live demo link. Confirm the 2026 period.'
    }
  ];

  /* --------------------------------------------------------------- derived
   * Technologies used by a project that are not personal skill entries;
   * registered here so the tech chip still renders and links.
   * ---------------------------------------------------------------------- */
  var EXTRA_TECHS = [
    { id: 'threejs', name: 'three.js', cat: 'tools', blurb: 'WebGL scene graph, geometry and lighting used to build the 3D showcase on this site.', source: 'self-taught' },
    { id: 'agents-sdk', name: 'Agents SDK', cat: 'ai', blurb: 'Agent definitions, scoped tools and structured output for the TeamPilot coordinator.', source: 'self-taught' },
    { id: 'gemini-api', name: 'Google Gemini API', cat: 'ai', blurb: 'Gemini models called through Google’s OpenAI-compatible endpoint with function calling.', source: 'self-taught' },
    { id: 'tesseract', name: 'Tesseract.js OCR', cat: 'ai', blurb: 'In-browser text recognition used to read receipts in MyDompet.', source: 'self-taught' }
  ];

  function selfCheck() {
    const issues = [];
    const cats = new Set(CATEGORIES.map(function (c) { return c.id; }));
    const ids = new Set();
    CATEGORIES.forEach(function (c, i) {
      if (!c.id) issues.push('category ' + i + ' has no id');
      if (!c.label) issues.push('category ' + c.id + ' has no label');
    });
    PROJECTS.forEach(function (p) {
      if (ids.has(p.id)) issues.push('duplicate project id: ' + p.id);
      ids.add(p.id);
      ['title', 'summary', 'overview', 'problem'].forEach(function (k) {
        if (!p[k] || (Array.isArray(p[k]) && !p[k].length)) issues.push(p.id + ': missing ' + k);
      });
      if (!p.categories || !p.categories.length) issues.push(p.id + ': no categories');
      (p.categories || []).forEach(function (c) {
        if (!cats.has(c)) issues.push(p.id + ': unknown category "' + c + '"');
      });
      if (!p.tech || !p.tech.length) issues.push(p.id + ': no technologies — it will not appear in the skills explorer');
      (p.challenges || []).forEach(function (c, i) {
        if (!c.problem || !c.solution) issues.push(p.id + ': challenge ' + i + ' needs both problem and solution');
      });
      (p.gallery || []).forEach(function (g) {
        if (!g.src || !g.alt) issues.push(p.id + ': gallery entry needs src and alt');
      });
      if (p.links && p.links.repo === undefined && p.links.demo === undefined) {
        issues.push(p.id + ': links object present but empty keys');
      }
    });
    return issues;
  }

  var api = {
    CATEGORIES: CATEGORIES,
    PROJECTS: PROJECTS,
    EXTRA_TECHS: EXTRA_TECHS,
    selfCheck: selfCheck
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.SiteProjects = api;
})(typeof window !== 'undefined' ? window : globalThis);
