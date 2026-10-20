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
      id: 'clickpixel-commerce',
      title: 'Click Pixel E-Commerce Platform',
      subtitle: 'Storefront, quotation calculator and payment flow for a printing business',
      status: 'Shipped during internship',
      period: '2024 — 2025',
      role: 'Intern — built and launched the site, integrated payments and order tracking',
      solo: false,
      categories: ['web', 'other'],
      featured: true,
      cover: 'assets/covers/clickpixel.svg',
      tech: ['php', 'javascript', 'html5', 'css3', 'responsive-ui', 'wordpress', 'wix', 'rest-api', 'excel', 'ai-tools'],
      summary: 'An end-to-end e-commerce site for a custom printing business: catalogue, dynamic '
        + 'price calculation from material and volume options, cart, tested payment gateway, and '
        + 'order data synchronised into the production workflow.',
      overview: [
        'A print shop sells things that do not fit a normal product page — a sublimation jersey '
          + 'is priced by fabric, size run and quantity; a sticker by material, die-cut and '
          + 'volume. This project replaced quote-by-message with a storefront that calculates a '
          + 'price from the same options the production floor needs.',
        'The work covered the whole path: catalogue structure, inquiry and quotation forms, '
          + 'cart and payment integration, then getting the resulting order data into the '
          + 'printing production system so nothing had to be retyped.'
      ],
      problem: 'Custom print orders arrived as unstructured messages. Every quote meant '
        + 're-asking the same questions, and the answer then had to be re-entered by hand into '
        + 'production, which is where quantities and specifications get lost.',
      objectives: [
        'Launch a storefront covering the business’s real product range with usable category structure',
        'Turn material, dimension and volume choices into an instant price instead of a manual quote',
        'Take payment online with a tested gateway across the full cart-to-checkout path',
        'Synchronise order quantities and specifications into the printing production system',
        'Improve navigation and mobile usability enough that the site could be the front door'
      ],
      features: [
        'Product catalogue for sublimation jerseys, mirror kote stickers, business cards, flyers, envelopes, textile stamps and wall calendars',
        'Dynamic pricing tiers and cost calculation forms driven by fabric, paper, dimension and order-volume options',
        'Shopping cart with secure online payment gateway integration, tested from cart addition through to final checkout',
        'Custom inquiry and quotation forms capturing the specification fields production actually needs',
        'Google Sheets pipelines tracking customer orders and synchronising order records against the production queue',
        'Interactive mega menus, responsive layouts and CSS animations for a faster browsing experience',
        'Client verification flow and pre-press checks before an order reaches the print run'
      ],
      methodology: {
        name: 'Requirement-led build with production-side verification',
        steps: [
          'Shadowed the quoting conversation to learn which options actually change a price',
          'Structured products around those options instead of a generic catalogue template',
          'Integrated the payment gateway and tested the transaction path end to end before announcing it',
          'Connected order output to spreadsheets and the production system so one entry served both',
          'Optimised asset loading and queries, then re-checked the flow on a phone'
        ]
      },
      architecture: {
        caption: 'From a customer’s option selection to a production-ready order record.',
        diagram: 'assets/diagrams/clickpixel-flow.svg',
        flow: [
          'Customer picks product, material, dimensions and quantity',
          'Pricing rules compute a tiered quote on the same form',
          'Cart and payment gateway take the order with a verification step',
          'Order record written to the store backend and mirrored to Google Sheets',
          'Pre-press specification check gates the job into production',
          'Quantities and specs land in the printing production system without re-entry'
        ]
      },
      gallery: [
        { src: 'assets/diagrams/clickpixel-flow.svg', alt: 'Order flow from product options through payment to the production system', caption: 'Order-to-production flow', kind: 'diagram' },
        { src: 'assets/covers/clickpixel.svg', alt: 'Abstract cover of a storefront and price tag motif', caption: 'Project cover — concept illustration', kind: 'concept' }
      ],
      galleryNote: 'The live site belongs to the company. Ask before publishing screenshots or the URL.',
      challenges: [
        {
          problem: 'Print pricing is not one number — fabric, paper stock, dimensions and volume all move it, and a wrong quote is paid for in production.',
          solution: 'Modelled the options as pricing tiers in one place so the customer-facing calculator and the production specification read from the same rules.'
        },
        {
          problem: 'A payment gateway that works in a test mode is not evidence it works for a customer.',
          solution: 'Integrated and tested the gateway across the whole transaction path, from adding to cart through to completed checkout, before treating it as done.'
        },
        {
          problem: 'Orders captured online still had to survive contact with a print queue.',
          solution: 'Structured inquiry forms and client verification flows to carry pre-press specifications, then synchronised quantities and specs into the production system.'
        },
        {
          problem: 'Rich product pages on a phone were slow.',
          solution: 'Optimised web asset loading and queries to keep browsing responsive on mobile data, not just on the office desktop.'
        }
      ],
      results: {
        metrics: [
          { k: 'Scope', v: 'Catalogue → payment' },
          { k: 'Product lines', v: '7' },
          { k: 'Status', v: 'Launched' }
        ],
        outcomes: [
          'A live storefront handling custom print orders end to end, including online payment',
          'Order data flowing into production without manual re-entry between systems',
          'Measurable reduction in quoting back-and-forth for the sales team'
        ]
      },
      learnings: [
        'The hardest part of an e-commerce build is not the cart, it is modelling how the business actually prices things',
        'Testing a payment path means testing it the way a customer does, once, fully',
        'Two systems holding the same order need one authoritative record or the mismatch becomes someone’s weekend'
      ],
      links: { repo: '', demo: '' },
      verify: 'The CV does not name the platform (WordPress, Wix or custom PHP) or the payment provider. Confirm both before publishing, and get written permission before linking the live site.'
    },

    {
      id: 'fizar-website',
      title: 'Fizar Enterprise Service Site',
      subtitle: 'Portfolio and services website for a print and apparel business',
      status: 'Delivered',
      period: '2024 — 2025',
      role: 'Part-time developer and designer',
      solo: true,
      categories: ['web', 'other'],
      featured: false,
      cover: 'assets/covers/fizar.svg',
      tech: ['html5', 'css3', 'javascript', 'responsive-ui', 'wordpress', 'illustrator', 'photoshop', 'canva'],
      summary: 'A responsive site presenting the company’s services, completed print works and '
        + 'custom apparel designs, backed by print-ready artwork and client mock-up workflows.',
      overview: [
        'A small print and apparel business needed somewhere to put its completed work so '
          + 'prospects could see quality before asking for a quote. The site carries the service '
          + 'range, a gallery of finished print works, and custom apparel designs.',
        'Half the job was front-end, half was pre-press: vectorising logos for print, preparing '
          + 'large-format banner artwork and producing mock-ups accurate enough that a client '
          + 'approving one was approving what would actually be printed.'
      ],
      problem: 'Work samples lived in a chat history. Prospects could not judge print quality '
        + 'before ordering, and approvals given from imprecise previews turned into reprints.',
      objectives: [
        'Publish the service range and completed works in one responsive site',
        'Present apparel and merchandise designs at a quality that supports a price',
        'Produce mock-ups accurate enough to serve as client approval artefacts',
        'Keep the site maintainable by the business after handover'
      ],
      features: [
        'Responsive service pages with a gallery of completed print works and custom apparel designs',
        'Print-ready vector artwork recreated from client-supplied low-resolution logos',
        'Large-format banner and promotional collateral layouts prepared to production specifications',
        'Sublimation apparel mock-ups used for client approval before a print run',
        'Material and durability notes so customers could compare print options knowingly'
      ],
      methodology: {
        name: 'Design-to-production handoff',
        steps: [
          'Gathered requirements directly from the client and clarified design specifications',
          'Rebuilt brand artwork as vectors so it survived large-format printing',
          'Mocked the design on the real product surface for approval, not on a blank canvas',
          'Checked material and technical specification against production requirements',
          'Built the site around the approved assets and coordinated delivery with the production team'
        ]
      },
      architecture: {
        caption: 'Asset pipeline: from a client logo file to a print-ready vector, an approved mock-up, and a page that displays it.',
        diagram: '',
        flow: [
          'Client supplies artwork, often a low-resolution raster',
          'Recreate and vectorise in Illustrator at production resolution',
          'Apply to a product mock-up in Photoshop for approval',
          'Approved asset published on the responsive site',
          'Same asset released to the print queue at the correct specification'
        ]
      },
      gallery: [
        { src: 'assets/covers/fizar.svg', alt: 'Abstract cover with apparel and banner motifs', caption: 'Project cover — concept illustration', kind: 'concept' }
      ],
      galleryNote: 'Client work is not published without permission. Add cleared screenshots at assets/projects/fizar-1.png.',
      challenges: [
        {
          problem: 'Client logos arrived as small raster images that pixelated the moment they were scaled for a banner.',
          solution: 'Recreated and vectorised each logo into high-resolution print-ready artwork in Illustrator and Photoshop before any layout work.'
        },
        {
          problem: 'Approvals given on a flat preview did not match how ink behaves on fabric.',
          solution: 'Produced digital product mock-ups on the actual garment and surface, and evaluated sublimation materials and technical specifications so the approval matched the deliverable.'
        },
        {
          problem: 'Deadlines were shared with a production team that could not absorb late specification changes.',
          solution: 'Coordinated print deadlines inside the cross-functional team and held specification sign-off before artwork entered the queue.'
        }
      ],
      results: {
        metrics: [
          { k: 'Deliverables', v: 'Site + print assets' },
          { k: 'Client approvals', v: 'Mock-up based' }
        ],
        outcomes: [
          'A published site carrying the company’s services and completed works',
          'A reusable print-ready asset set for future campaigns',
          'Fewer reprint surprises once approvals were based on accurate mock-ups'
        ]
      },
      learnings: [
        'Front-end and pre-press share a problem: what you display must match what can be produced',
        'An approval artefact is a contract — building it properly saved a reprint',
        'Handing over a site the client can maintain themselves is worth more than extra features'
      ],
      links: { repo: '', demo: '' },
      verify: 'Live URL is not on the CV. Get the owner’s permission before linking it.'
    },

    {
      id: 'playable-portfolio',
      title: 'Playable 3D Portfolio',
      subtitle: 'A three.js WebGL world where the CV is the level design',
      status: 'Live — you are looking at it',
      period: '2026',
      role: 'Designed, modelled and programmed independently',
      solo: true,
      categories: ['personal', 'web', 'other'],
      featured: true,
      cover: 'assets/covers/playable-portfolio.svg',
      tech: ['javascript', 'threejs', 'html5', 'css3', 'svg', 'responsive-ui', 'ai-tools'],
      summary: 'A self-contained 3D run: walk a character between seven checkpoints, each of '
        + 'which unlocks part of the skill inventory. No game engine, no build step, no '
        + 'dependencies beyond one three.js file — and it degrades to a readable page.',
      overview: [
        'This is the section below the Projects gallery. A procedurally built character walks a '
          + 'route across a circular island; seven beacons hold the real content — education, '
          + 'internship, the POS system, SignSpeak, certifications and contact. Reaching one '
          + 'awards XP and unlocks the skills that project actually used.',
        'Everything is generated in code: the character is boxes and pivots with a two-bone '
          + 'walk cycle, the terrain is displaced geometry, and the lighting is a single '
          + 'shadow-casting directional source. The point was to prove I can build an '
          + 'interactive experience from scratch rather than assemble a template.'
      ],
      problem: 'A CV PDF flattens a student with real systems into a list of bullet points. I '
        + 'wanted something that showed engineering judgement and gave a visitor a reason to '
        + 'engage with the material — without becoming the kind of flashy site that hides its '
        + 'content behind a loading screen.',
      objectives: [
        'Render a navigable 3D world with keyboard, mouse and touch controls in vanilla JavaScript',
        'Gate nothing: every fact in the game must also be reachable as plain text',
        'Persist progress so a returning visitor resumes where they stopped',
        'Fall back automatically to the readable version when WebGL is unavailable',
        'Keep it dependency-light enough to open from a USB stick with no server'
      ],
      features: [
        'Third-follow camera with collision-aware clamping and a smooth beacon-lock during auto-tour',
        'Two-bone procedural walk cycle, idle bob and directional turning on a box-built character',
        'Seven checkpoint beacons with proximity triggers, XP awards and level progression',
        'Skill inventory that fills as checkpoints clear, grouped by discipline',
        'Keyboard shortcuts 1–7 to auto-walk to any stop, plus a touch D-pad on coarse-pointer devices',
        'Local save of visited checkpoints and mode, restored on reload',
        'Print stylesheet and a page mode so the same content works for a recruiter with paper',
        'A content self-check that fails loudly if a beacon is placed outside the walk radius or two beacons sit close enough to double-trigger'
      ],
      methodology: {
        name: 'System, then content, then guards',
        steps: [
          'Proved the render loop, camera follow and input on an empty ground plane first',
          'Built the character and walk cycle until movement read at a glance',
          'Placed beacons and wrote the content as data, never inline in the renderer',
          'Added HUD, inventory and save state against that data layer',
          'Wrote a structural validator so a future content edit cannot silently break the world',
          'Tested the no-WebGL path deliberately by disabling the context'
        ]
      },
      architecture: {
        caption: 'Data drives both surfaces: one content file feeds the 3D world and the readable fallback page.',
        diagram: 'assets/diagrams/playable-portfolio-flow.svg',
        flow: [
          'data.js holds profile, stops, unlocks and world constants',
          'world.js builds geometry, lighting and beacon props',
          'avatar.js + camera.js handle movement, turning and follow',
          'input.js unifies WASD, pointer, keys and D-pad into one intent vector',
          'hud.js paints XP, inventory, toasts and the checkpoint card',
          'game.js runs the loop, proximity checks, save state and mode switching',
          'page.js renders the same data as an accessible document when WebGL is missing'
        ]
      },
      gallery: [
        { src: 'assets/diagrams/playable-portfolio-flow.svg', alt: 'Module map of the 3D portfolio: data, world, avatar, camera, input, HUD and game loop', caption: 'Module map — how the seven files fit together', kind: 'diagram' },
        { src: 'assets/covers/playable-portfolio.svg', alt: 'Abstract cover showing beacons on a circular island', caption: 'Project cover — concept illustration of the checkpoint layout', kind: 'concept' }
      ],
      galleryNote: 'Add a real capture of the running world at assets/projects/playable-portfolio-1.png.',
      challenges: [
        {
          problem: 'A 3D site that only works for people with a good GPU and no disability is a worse CV, not a better one.',
          solution: 'Every checkpoint’s content is authored as data, so the same file renders a readable page; WebGL failure switches modes automatically and a print stylesheet covers paper.'
        },
        {
          problem: 'Camera follow felt nauseating when the character turned sharply and clipped through props.',
          solution: 'Separated desired from actual camera position with damping, clamped to the walk radius, and locked the camera to a beacon frame while a card is open.'
        },
        {
          problem: 'Beacons placed by hand drifted close enough to trigger each other in pairs.',
          solution: 'Added a structural self-check that validates positions against the walk radius and a minimum beacon spacing, so layout mistakes surface at authoring time instead of during a demo.'
        },
        {
          problem: 'Touch devices needed movement without a keyboard, and a joystick fight with the camera.',
          solution: 'A four-button D-pad bound to the same intent vector as WASD, shown only on coarse-pointer devices via a media query.'
        }
      ],
      results: {
        metrics: [
          { k: 'Dependencies', v: '1 (three.js)' },
          { k: 'Checkpoints', v: '7' },
          { k: 'Own code', v: '~2,500 lines' },
          { k: 'Build step', v: 'none' }
        ],
        outcomes: [
          'Runs from a static folder with no server, bundler or package manager',
          'Same content reachable three ways: playable, readable and printable',
          'Now embedded as the 3D showcase section of this site, with the readable version kept intact'
        ]
      },
      learnings: [
        'Rendering was the easy half; input feel and camera damping decide whether anyone keeps playing',
        'Keeping content out of the render code is what made the fallback page nearly free to build',
        'A validator over your own data is the cheapest way to stop a fun project rotting'
      ],
      links: { repo: '', demo: '' },
      verify: 'Add a line-record count or a screen recording if you want this verifiable to an outside reviewer.'
    },

    {
      id: 'bim-dataset',
      title: 'BIM Landmark Dataset & Training Pipeline',
      subtitle: '117 classes, 15,258 normalised sign sequences, reproducible training',
      status: 'Built and in use',
      period: '2025',
      role: 'Self-directed data engineering and model training work',
      solo: true,
      categories: ['personal', 'data', 'ai'],
      featured: false,
      cover: 'assets/covers/bim-dataset.svg',
      tech: ['python', 'mediapipe', 'opencv', 'tensorflow', 'lstm', 'cnn', 'model-eval', 'dataset-pipeline', 'numpy'],
      summary: 'The dataset work behind SignSpeak, done independently: capturing and labelling '
        + 'sign sequences, extracting 1,662 MediaPipe Holistic keypoints per frame, normalising '
        + 'them, and shipping isolated training and testing scripts.',
      overview: [
        'Public Malaysian Sign Language data at usable scale does not exist, so the model work '
          + 'started with building the data. This is the part of SignSpeak that is easy to '
          + 'underestimate: recording, segmenting and labelling 117 sign classes into 15,258 '
          + 'sequence files with a consistent feature representation.',
        'Each sequence is stored as normalised keypoints rather than images, which makes the '
          + 'training runs small enough to repeat and removes the background as a variable.'
      ],
      problem: 'Model results were unreadable while every experiment used a different mix of '
        + 'raw frames, alphabet samples and ad-hoc captures. Without one normalised dataset '
        + 'and one isolated training path, there was no way to tell whether a change helped.',
      objectives: [
        'Assemble a labelled BIM dataset covering 117 sign classes',
        'Convert video sequences into a fixed-size keypoint feature representation',
        'Normalise features so camera distance, framing and position stop affecting the signal',
        'Keep this dataset strictly isolated from earlier experimental collections',
        'Make training and evaluation reproducible from a single command'
      ],
      features: [
        '15,258 sequence files stored as .npy arrays with a shared 1,662-keypoint layout (pose 132 + face mesh 1,404 + both hands 126)',
        'Shoulder-midpoint centring with nose-to-shoulder scale normalisation, so each sequence is position and size invariant',
        'Isolated training script with dedicated label encoder output, never merging legacy datasets',
        'Class-subset and single-class run flags for fast iteration before committing to a full 117-class epoch',
        'Separate evaluation script scoring the trained model against random unseen sequences',
        'PowerShell runners so a full retrain is one command on the project machine'
      ],
      methodology: {
        name: 'Data-first, one variable at a time',
        steps: [
          'Define the class list and recording protocol before capturing anything',
          'Extract keypoints offline so the storage format is fixed early',
          'Normalise and verify a few sequences by eye before trusting a training run',
          'Train on a ten-class subset to validate the pipeline cheaply',
          'Scale to the full 117 classes only once the loop is stable',
          'Evaluate on held-out sequences, not training samples'
        ]
      },
      architecture: {
        caption: 'Raw sign videos become fixed-size normalised keypoint tensors that any sequence model can consume.',
        diagram: 'assets/diagrams/bim-dataset-flow.svg',
        flow: [
          'Recorded sign videos segmented per class',
          'Frames decoded with OpenCV',
          'MediaPipe Holistic extracts 1,662 keypoints per frame',
          'Sequence centred on the shoulder midpoint and divided by nose-to-shoulder scale',
          'Saved as .npy under models keyed by class label',
          'train_normalized_lstm.py builds the Conv1D + BiLSTM classifier',
          'test_normalized_model.py scores unseen sequences'
        ]
      },
      gallery: [
        { src: 'assets/diagrams/bim-dataset-flow.svg', alt: 'Dataset pipeline from recorded video to normalised keypoint tensors to training', caption: 'Dataset pipeline', kind: 'diagram' },
        { src: 'assets/covers/bim-dataset.svg', alt: 'Abstract cover of scattered keypoint clusters', caption: 'Project cover — concept illustration of normalised keypoints', kind: 'concept' }
      ],
      galleryNote: 'A skeleton-overlay capture from the extractor would be the strongest image here. Add it at assets/projects/bim-dataset-1.png.',
      challenges: [
        {
          problem: 'Raw landmark coordinates encode where the person stood, not what they signed.',
          solution: 'Centred every frame on the shoulder midpoint and divided by nose-to-shoulder distance, so the feature vector describes pose shape rather than camera geometry.'
        },
        {
          problem: 'Earlier experimental collections kept leaking into new training runs and silently inflating apparent accuracy.',
          solution: 'Wrote dedicated train and test scripts bound to one dataset directory with their own label encoder, and documented the isolation guarantee so a future run cannot mix sources.'
        },
        {
          problem: 'A full 117-class epoch was too slow to iterate against.',
          solution: 'Added subset flags to train the first ten classes or a named handful, so pipeline bugs get caught in minutes instead of hours.'
        },
        {
          problem: 'Face-mesh keypoints dominate the vector by count and can swamp hand signal.',
          solution: 'Kept the full 1,662 layout for compatibility and evaluated hand-region subsets separately when a class depended on finger shape.'
        }
      ],
      results: {
        metrics: [
          { k: 'Classes', v: '117' },
          { k: 'Sequences', v: '15,258' },
          { k: 'Keypoints/frame', v: '1,662' },
          { k: 'Retrain', v: '1 command' }
        ],
        outcomes: [
          'A single reproducible feature format shared by every model in SignSpeak',
          'Training runs cheap enough to repeat, which is what made the normalisation decision testable',
          'Documentation good enough to hand to someone else without walking them through it'
        ]
      },
      learnings: [
        'Most of “machine learning” for an under-resourced language is data engineering',
        'A normalisation formula is a hypothesis — checking it visually on a few samples first saved days',
        'Dataset isolation is not bureaucracy; without it every number produced afterwards is unverifiable'
      ],
      links: { repo: '' },
      verify: 'If you publish the dataset or its documentation, add the citation or repository here — it is the most defensible artefact in this list.'
    }
  ];

  /* --------------------------------------------------------------- derived
   * three.js is used by the playable portfolio but is not a personal skill
   * entry; it is registered here so the tech chip still renders and links.
   * ---------------------------------------------------------------------- */
  var EXTRA_TECHS = [
    { id: 'threejs', name: 'three.js', cat: 'tools', blurb: 'WebGL scene graph, geometry and lighting used to build the 3D portfolio.', source: 'self-taught' },
    { id: 'numpy', name: 'NumPy', cat: 'data', blurb: 'Array storage and feature maths for the landmark sequences.', source: 'academic' }
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
