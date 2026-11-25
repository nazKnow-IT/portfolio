/* Homepage (Live Desk design).
   Scroll phases inside the pinned desk section (p = 0..1):
     0.00-0.45  camera flies from the wide desk shot to face the laptop screen
     0.45-0.80  the real MyDompet app is placed over the screen; visitors can use it
     0.80-1.00  the view dives "through" the screen into the dark project gallery   */
(function () {
  'use strict';
  var SITE = window.SiteConfig || { links: {} };
  var P = window.SiteProjects, C = window.SiteContent;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };

  /* ------------------------------------------------ links from site config */
  $('#cvLink').href = '' + (SITE.links.cvFile || 'assets/cv/Mirza-Nazeef-CV.pdf');
  $('#mailLink').href = 'mailto:' + (SITE.links.email || '');
  $('#liLink').href = SITE.links.linkedin || '#';

  /* ------------------------------------------------ project gallery */
  var ACCENT = { 'signspeak': '#5CE1E6', 'coop-pos': '#FFB547', 'teampilot': '#FF4F2E', 'dapurkita': '#F5B800' };
  var SHORT = { 'coop-pos': 'Coop POS' };
  // honest notes for projects whose picture is not a real screenshot
  var IMAGE_NOTE = { 'dapurkita': 'Still being built. The screenshot uses the app’s own sample pantry.', 'coop-pos': 'The picture is an illustration. The live system runs inside the UTHM cooperative store and isn’t public.' };
  var skillName = {};
  (C && C.SKILLS || []).forEach(function (s) { skillName[s.id] = s.name; });
  (P && P.EXTRA_TECHS || []).forEach(function (s) { skillName[s.id] = s.name; });
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  // AI projects first (the headline promises AI), then the shipped Gold Medal system
  var ORDER = ['signspeak', 'teampilot', 'coop-pos', 'dapurkita'];
  var list = (P ? P.PROJECTS : []).filter(function (p) { return p.id !== 'mydompet'; })
    .sort(function (a, b) { var x = ORDER.indexOf(a.id), y = ORDER.indexOf(b.id); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); });
  // the strongest image for each project: a real screenshot if there is one, else the cover
  function bestImage(p) {
    var shot = (p.gallery || []).filter(function (g) { return g.kind === 'screenshot'; })[0];
    return { src: '' + (shot ? shot.src : p.cover), alt: shot ? shot.alt : (p.title + ' cover illustration') };
  }
  $('#projects').innerHTML = list.map(function (p) {
    var img = bestImage(p);
    var facts = ((p.results && p.results.metrics) || []).slice(0, 3).map(function (m) {
      return '<div><b>' + esc(m.v) + '</b>' + esc(m.k) + '</div>';
    }).join('');
    var tags = (p.tech || []).slice(0, 6).map(function (t) { return skillName[t] || t; }).join(', ');
    return '<section class="project" style="--accent:' + (ACCENT[p.id] || '#9EE6C4') + '">' +
      '<h3>' + esc(SHORT[p.id] || p.title) + '</h3>' +
      (p.video
        // a real demo beats a cover: play the project's own video, with sound, only when asked
        ? '<video class="shot" src="' + p.video.src + '" poster="' + p.video.poster + '" controls preload="none" playsinline aria-label="' + esc(p.video.caption || (p.title + ' demo video')) + '"></video>'
        : '<img class="shot" src="' + img.src + '" alt="' + esc(img.alt) + '" loading="lazy">') +
      '<div class="copy">' +
        '<p class="status">' + esc(p.status) + '</p>' +
        '<p class="line"><span>' + esc(p.subtitle) + '</span></p>' +
        '<p class="line"><span>' + esc(p.summary) + '</span></p>' +
        '<div class="facts">' + facts + '</div>' +
        '<p class="tags">' + esc(tags) + '</p>' +
        (IMAGE_NOTE[p.id] ? '<p class="imgnote">' + esc(IMAGE_NOTE[p.id]) + '</p>' : '') +
        // proof a recruiter can click: the write-up, plus code, a live demo or the demo video where they exist
        '<div class="proof"><a class="more" href="#/project/' + p.id + '">Read how I built it</a>' +
        (p.video ? '<button type="button" class="ghostbtn" data-play="' + p.id + '">Watch the demo</button>' : '') +
        (p.links && p.links.demo ? '<a class="ghostbtn" href="' + esc(p.links.demo) + '">Live demo</a>' : '') +
        (p.links && p.links.repo ? '<a class="ghostbtn" href="' + esc(p.links.repo) + '">Code on GitHub</a>' : '') +
        '</div>' +
      '</div></section>';
  }).join('');

  // Watch the demo: bring the section's video into view and play it
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-play]'); if (!b) return;
    var v = b.closest('.project').querySelector('video'); if (!v) return;
    v.scrollIntoView({ block: 'center' }); v.play();
  });

  /* ------------------------------------------------ everything from the CV
     Each CV section uses the project layout: giant coloured title, status line,
     two lines of story, key numbers, tags, one action, and a tilted visual card. */
  var PROFILE = SITE.profile || {}, LINKS = SITE.links || {};
  var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };
  var EDU = (C && C.EDUCATION) || [], EXP = (C && C.EXPERIENCE) || [], AW = (C && C.AWARDS) || [];
  var CERTS = (C && C.CERTIFICATIONS) || [], SK = (C && C.SKILLS) || [], CATS = (C && C.SKILL_CATS) || [];
  var SRC = (C && C.SOURCE_LABELS) || {};

  // hero stats: same numbers as the current site, CGPA included
  $('#stats').innerHTML = (PROFILE.stats || []).map(function (s) { return '<div><dt>' + esc(s.label) + '</dt><dd>' + esc(s.value) + '</dd></div>'; }).join('');

  // The CV is one compact section of tiles; the giant-title layout is kept for projects only.
  var intro = (PROFILE.intro || []);
  var industry = SK.filter(function (s) { return s.source === 'industry'; }).length;
  // core skills: the ones the projects actually prove, most-used first
  var uses = {};
  (P.PROJECTS || []).forEach(function (p) { (p.tech || []).forEach(function (t) { uses[t] = (uses[t] || 0) + 1; }); });
  var SOFT = { 'camera-capture': 1, 'tts': 1, 'mobile-ux': 1, 'responsive-ui': 1, 'ai-tools': 1 };
  var core = SK.filter(function (s) { return uses[s.id] && !SOFT[s.id] && !/progress/i.test(s.name); })
    .sort(function (a, b) { return uses[b.id] - uses[a.id]; }).slice(0, 15);
  var chip = function (s) { return '<button type="button" class="chip src-' + esc(s.source) + '" data-skill="' + esc(s.id) + '">' + esc(s.name) + '</button>'; };

  $('#cvSections').innerHTML =
    '<section class="cvb" id="cv" aria-labelledby="cv-h">' +
      '<div class="cvb-head"><h3 id="cv-h">CV</h3>' +
        '<div><p class="status">' + esc(PROFILE.role || '') + ' · ' + esc(PROFILE.location || '') + '</p>' +
        '<a class="more" href="' + esc(LINKS.cvFile || '') + '">Download the full CV (PDF)</a></div></div>' +
      '<div class="bento">' +
        // about
        '<article class="tile t-about reveal" id="about"><h4>About</h4><div class="ab">' +
          '<img src="' + esc(PROFILE.photo || '') + '" alt="' + esc(PROFILE.photoAlt || '') + '">' +
          '<div><p class="big">' + esc(PROFILE.tagline || '') + '</p><p>' + esc(intro[0] || '') + '</p></div></div>' +
          '<dl class="glance">' + (PROFILE.glance || []).map(function (g) { return '<div><dt>' + esc(g.label) + '</dt><dd>' + esc(g.value) + '</dd></div>'; }).join('') + '</dl></article>' +
        // education
        '<article class="tile t-edu reveal" id="education"><h4>Education</h4><div class="cgs">' +
          EDU.map(function (e, i) { return '<div><b data-cgpa="' + esc(e.cgpa) + '">' + esc(e.cgpa) + '</b><span>' + (i === 0 ? 'Degree CGPA' : 'Diploma CGPA') + '</span></div>'; }).join('') + '</div>' +
          EDU.map(function (e) { return '<p class="q"><b>' + esc(e.qualification) + '</b><span>' + esc(e.institution.replace(/ \(UTHM\)/, '')) + ', ' + esc(e.period) + '</span></p>'; }).join('') +
          '<div class="pills">' + EDU.reduce(function (a, e) { return a.concat(e.achievements || []); }, [])
            .filter(function (a) { return !/^Graduated with/.test(a); })
            .map(function (a) { return '<span>' + esc(a.replace(/ — Centre for Diploma Studies/, '')) + '</span>'; }).join('') + '</div></article>' +
        // experience
        '<article class="tile t-exp reveal" id="experience"><h4>Experience</h4>' +
          EXP.map(function (x) {
            return '<div class="job"><div class="jt"><b>' + esc(x.role) + '</b><span>' + esc(x.org) + ', ' + esc(x.period) + '</span></div>' +
              '<ul>' + (x.points || []).slice(0, 2).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
          }).join('') +
          // backs up the hero's '3 systems built for real clients'
          '<p class="launched"><b>Built for real clients:</b> Click Pixel Studio online store, Fizar Enterprise company website, and the UTHM cooperative store POS.</p>' +
          '<details class="more-detail"><summary>See every responsibility</summary>' + EXP.map(function (x) {
            return '<h5>' + esc(x.org) + '</h5><ul>' + (x.points || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>';
          }).join('') + '</details></article>' +
        // awards + certificates
        '<article class="tile t-aw reveal" id="achievements"><h4>Awards and certificates</h4><ul class="aw">' +
          AW.map(function (a) { return '<li><b>' + esc(a.title.replace(/\s*\(.*\)/, '')) + '</b><span>' + esc(a.org.replace('Universiti Tun Hussein Onn Malaysia', 'UTHM')) + '</span></li>'; }).join('') +
          '</ul><div class="certs">' + CERTS.map(function (c) { return c.url ? '<a href="' + esc(c.url) + '">' + esc(c.title) + '</a>' : '<span>' + esc(c.title) + '</span>'; }).join('') + '</div></article>' +
        // skills
        '<article class="tile t-sk reveal" id="skills"><h4>Core skills <span>proven in my projects</span></h4>' +
          '<div class="chips">' + core.map(chip).join('') + '</div>' +
          '<p class="skillnote" id="skillNote" aria-live="polite">Tap a skill to see where I learned it and which projects used it.</p>' +
          '<details class="more-detail allsk"><summary>Show all ' + SK.length + ' skills across ' + CATS.length + ' areas</summary>' +
            CATS.map(function (c) { return '<div class="sk-row"><h5>' + esc(c.label) + '</h5><div class="chips">' + SK.filter(function (s) { return s.cat === c.id; }).map(chip).join('') + '</div></div>'; }).join('') +
          '</details></article>' +
      '</div></section>';

  // skills: explain a tapped skill
  var usedIn = {};
  (P ? P.PROJECTS : []).forEach(function (p) { (p.tech || []).forEach(function (t) { (usedIn[t] = usedIn[t] || []).push(p.title); }); });
  $('#skills').addEventListener('click', function (e) {
    var b = e.target.closest('[data-skill]'); if (!b) return;
    var sk = SK.filter(function (s) { return s.id === b.dataset.skill; })[0]; if (!sk) return;
    [].forEach.call(document.querySelectorAll('.chip.on'), function (x) { x.classList.remove('on'); }); b.classList.add('on');
    $('#skillNote').innerHTML = '<b>' + esc(sk.name) + '</b>: ' + esc(SRC[sk.source] || '') + '. ' + esc(sk.blurb) + (usedIn[sk.id] ? ' Used in ' + esc(usedIn[sk.id].join(', ')) + '.' : '');
  });
  // tiles fade up as they arrive
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  function revealTiles() { reveals.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight * .9) el.classList.add('in'); }); }
  addEventListener('scroll', revealTiles, { passive: true }); revealTiles();

  /* ------------------------------------------------ scroll extras: CGPA count-up and the contact headline */
  var cgpas = [].slice.call(document.querySelectorAll('[data-cgpa]'));
  var bigTalk = $('#bigTalk');
  function choreograph() {
    cgpas.forEach(function (b) {
      var r = b.getBoundingClientRect(), target = parseFloat(b.dataset.cgpa) || 0;
      var p = reduce ? 1 : clamp01((innerHeight - r.top) / (innerHeight * .35));
      b._p = Math.max(b._p || 0, p); b.textContent = (target * b._p).toFixed(2);
    });
    if (bigTalk && !reduce) {
      var t = clamp01((innerHeight - bigTalk.getBoundingClientRect().top) / (innerHeight * .6));
      bigTalk.style.transform = 'translateX(' + ((1 - t) * -12) + 'vw)'; bigTalk.style.opacity = t;
    }
  }
  addEventListener('scroll', choreograph, { passive: true });
  addEventListener('resize', choreograph);
  choreograph();

  // contact: languages, WhatsApp, and the same FormSubmit form the current site uses
  $('#langs').textContent = 'I speak ' + (C && C.LANGUAGES_SPOKEN || []).map(function (l) { return l.name + ' (' + l.level.toLowerCase() + ')'; }).join(' and ') + '.';
  if (LINKS.phoneDigits) $('#waLink').href = 'https://wa.me/' + LINKS.phoneDigits; else $('#waLink').remove();
  var CF = SITE.contactForm || {};
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, note = $('#formNote'), data = new FormData(f);
    if (!CF.enabled || !CF.endpoint) { location.href = 'mailto:' + LINKS.email; return; }
    data.append('_subject', (CF.subject || 'Portfolio enquiry').replace('{name}', data.get('name')));
    note.textContent = 'Sending your message...';
    fetch(CF.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(); note.textContent = 'Message sent. I usually reply within a day.'; f.reset(); })
      .catch(function () { note.innerHTML = 'That did not send. Email me directly at <a href="mailto:' + esc(LINKS.email) + '">' + esc(LINKS.email) + '</a>.'; });
  });

  /* ------------------------------------------------ 3D desk */
  var canvas = $('#stage'), renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (e) { canvas.remove(); }
  if (renderer) { renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.outputEncoding = THREE.sRGBEncoding; }
  var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 100);
  scene.add(new THREE.HemisphereLight('#ffffff', '#9AA8B8', 1));
  var sun = new THREE.DirectionalLight('#ffffff', .9); sun.position.set(4, 8, 6); sun.castShadow = true; scene.add(sun);
  var loader = new THREE.TextureLoader();
  function texture(url, fn) { loader.load(url, function (t) { t.encoding = THREE.sRGBEncoding; fn(t); }); }

  var rig = new THREE.Group(); scene.add(rig);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .16 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; rig.add(floor);

  /* devices: rounded aluminium laptop with real keys, and a rounded phone */
  if (renderer) { renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004;
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  var fillLight = new THREE.DirectionalLight('#E8EEFF', .35); fillLight.position.set(-6, 4, -4); scene.add(fillLight);
  // a rectangle with rounded corners in the XY plane
  function roundRect(w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  // a slab with softly rounded corners and edges; lies flat (thickness along Y) unless upright
  function slab(w, d, t, r, bevel, upright) {
    var g = new THREE.ExtrudeGeometry(roundRect(w - 2 * bevel, d - 2 * bevel, Math.max(.001, r - bevel)),
      { depth: Math.max(.001, t - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 10 });
    g.translate(0, 0, -(t - 2 * bevel) / 2);
    if (!upright) g.rotateX(-Math.PI / 2);
    return g;
  }
  // a flat rounded screen whose image fills it exactly
  function screenGeo(w, h, r) {
    var g = new THREE.ShapeGeometry(roundRect(w, h, r), 12), uv = g.attributes.uv, p = g.attributes.position;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
    return g;
  }
  var alu = new THREE.MeshStandardMaterial({ color: '#D3D8DF', metalness: .6, roughness: .32 });
  var aluDark = new THREE.MeshStandardMaterial({ color: '#B9C0C9', metalness: .6, roughness: .4 });
  var black = new THREE.MeshStandardMaterial({ color: '#0D1014', roughness: .5 });
  var keyMat = new THREE.MeshStandardMaterial({ color: '#2A3039', roughness: .55 });

  var laptop = new THREE.Group(); laptop.position.set(.9, 0, 0); rig.add(laptop);
  var base = new THREE.Mesh(slab(3.2, 2.15, .1, .12, .035), alu); base.position.y = .05; base.castShadow = true; base.receiveShadow = true; laptop.add(base);
  var well = new THREE.Mesh(slab(2.86, 1.08, .012, .05, .004), aluDark); well.position.set(0, .101, -.3); laptop.add(well);
  // individual keys, instanced so they cost one draw call
  var cols = 14, rowsN = 5, kw = .17, kd = .165, gap = .03;
  var keyGeo = slab(kw, kd, .02, .025, .007);
  var keysMesh = new THREE.InstancedMesh(keyGeo, keyMat, cols * rowsN + 1), m4 = new THREE.Matrix4(), k = 0;
  for (var r = 0; r < rowsN; r++) for (var c = 0; c < cols; c++) {
    m4.makeTranslation(-((cols - 1) * (kw + gap)) / 2 + c * (kw + gap), .114, -.3 - ((rowsN - 1) * (kd + gap)) / 2 + r * (kd + gap));
    keysMesh.setMatrixAt(k++, m4);
  }
  m4.compose(new THREE.Vector3(0, .114, .19 + .01), new THREE.Quaternion(), new THREE.Vector3(6, 1, 1)); keysMesh.setMatrixAt(k, m4); // space bar
  keysMesh.position.y = 0; laptop.add(keysMesh);
  var pad = new THREE.Mesh(slab(1.05, .62, .006, .06, .002), new THREE.MeshStandardMaterial({ color: '#C7CDD5', metalness: .4, roughness: .25 }));
  pad.position.set(0, .102, .62); laptop.add(pad);
  var hingeBar = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 2.4, 20), aluDark); hingeBar.rotation.z = Math.PI / 2; hingeBar.position.set(0, .1, -1.04); laptop.add(hingeBar);

  var hinge = new THREE.Group(); hinge.position.set(0, .1, -1.05); laptop.add(hinge);
  var lid = new THREE.Mesh(slab(3.2, 2.1, .06, .12, .025, true), alu); lid.position.set(0, 1.05, -.01); lid.castShadow = true; hinge.add(lid);
  var bezel = new THREE.Mesh(screenGeo(3.1, 2.0, .09), black); bezel.position.set(0, 1.05, .022); hinge.add(bezel);
  var cam0 = new THREE.Mesh(new THREE.CircleGeometry(.014, 16), new THREE.MeshBasicMaterial({ color: '#2B3340' })); cam0.position.set(0, 2.0, .024); hinge.add(cam0);
  var SW = 3, SH = 1.88;
  var screenMat = new THREE.MeshBasicMaterial({ color: '#0B0F14', toneMapped: false });
  var screen = new THREE.Mesh(screenGeo(SW, SH, .03), screenMat); screen.position.set(0, 1.02, .025); hinge.add(screen);
  texture('assets/projects/mydompet-1.jpg', function (t) { screenMat.map = t; screenMat.color.set('#fff'); screenMat.needsUpdate = true; });

  var phone = new THREE.Group(); phone.position.set(-1.25, 0, .55); phone.rotation.set(-.12, .35, 0); rig.add(phone);
  var body = new THREE.Mesh(slab(.8, 1.65, .085, .13, .03, true), new THREE.MeshStandardMaterial({ color: '#1C232D', metalness: .5, roughness: .35 }));
  body.position.y = .83; body.castShadow = true; phone.add(body);
  var pGlass = new THREE.Mesh(screenGeo(.76, 1.61, .11), black); pGlass.position.set(0, .83, .044); phone.add(pGlass);
  var phoneMat = new THREE.MeshBasicMaterial({ color: '#0B0F14', toneMapped: false });
  var phoneScreen = new THREE.Mesh(screenGeo(.72, 1.55, .09), phoneMat); phoneScreen.position.set(0, .83, .046); phone.add(phoneScreen);
  var island = new THREE.Mesh(screenGeo(.2, .055, .027), new THREE.MeshBasicMaterial({ color: '#05070A' })); island.position.set(0, 1.53, .047); phone.add(island);
  var camBump = new THREE.Mesh(slab(.26, .26, .02, .07, .006, true), new THREE.MeshStandardMaterial({ color: '#2A323D', metalness: .5, roughness: .3 }));
  camBump.position.set(-.2, 1.42, -.052); phone.add(camBump);
  texture('assets/projects/signspeak-1.jpg', function (t) { phoneMat.map = t; phoneMat.color.set('#fff'); phoneMat.needsUpdate = true; });

  /* ------------------------------------------------ camera shots */
  var WIDE = { pos: new THREE.Vector3(-1.2, 3.4, 8.4), look: new THREE.Vector3(-.6, 1, 0) };
  // narrower desktops: aim further left so the devices clear the headline
  function wideShot() { var x = -1.3 - Math.max(0, 1440 / innerWidth - 1) * 3.2; WIDE.look.x = x; WIDE.pos.x = x - .6; WIDE.pos.z = 8.4 + Math.max(0, 1440 / innerWidth - 1) * 2; }
  wideShot(); addEventListener('resize', wideShot);
  // phones: camera aims below the desk so the devices sit above the headline
  var NARROW_WIDE = { pos: new THREE.Vector3(.2, 9, 22), look: new THREE.Vector3(.2, -3.4, 0) };
  var SCREEN = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  var tmpN = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
  // a shot that puts the laptop screen square to the camera, filling ~88% of the view
  // on a phone-sized window the target is the 3D phone, so the app gets its phone layout
  var target = screen, TW = SW, TH = SH;
  function pickTarget() {
    var narrow = innerWidth < 760;
    target = narrow ? phoneScreen : screen; TW = narrow ? .72 : SW; TH = narrow ? 1.55 : SH;
    corners = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(function (c) { return new THREE.Vector3(c[0] * TW / 2, c[1] * TH / 2, 0); });
  }
  function frameScreen() {
    rig.updateMatrixWorld(true);
    target.getWorldPosition(SCREEN.look);
    target.getWorldQuaternion(tmpQ);
    tmpN.set(0, 0, 1).applyQuaternion(tmpQ);
    var k = innerWidth < 760 ? .82 : .88, half = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    var d = Math.max((TH / 2) / (k * half), (TW / 2) / (k * half * cam.aspect));
    SCREEN.pos.copy(SCREEN.look).addScaledVector(tmpN, d);
  }

  var mouse = { x: 0, y: 0 };
  addEventListener('pointermove', function (e) { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });
  function resize() {
    if (!renderer) return;
    renderer.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  }
  addEventListener('resize', function () { resize(); pickTarget(); }); resize();

  /* ------------------------------------------------ the live app */
  var live = $('#live'), app = $('#app'), note = $('#liveNote'), appLoaded = false;
  // fresh visitors see a filled-in app instead of an empty one
  function seedDemo() {
    try {
      if (localStorage.getItem('mydompet-v1')) return;
      var d = new Date(), iso = function (x) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
      var day = function (n) { var x = new Date(d); x.setDate(Math.max(1, d.getDate() - n)); return iso(x); };
      var tx = [['Nasi lemak and kopi', 12.5, 0, 'Food & drink', 'Cash'], ['Grab ride to campus', 9.5, 1, 'Transport', 'E-wallet'],
        ['Popular bookstore', 35.9, 4, 'Books & learning', 'Card'], ['Lotus groceries', 64.3, 6, 'Groceries', 'Card'],
        ['Phone bill', 38, 9, 'Bills & utilities', 'Online banking'], ['Cinema tickets', 28, 12, 'Entertainment', 'E-wallet']];
      localStorage.setItem('mydompet-v1', JSON.stringify({
        tx: tx.map(function (t, i) { return { id: 'demo-' + i, merchant: t[0], amount: t[1], date: day(t[2]), category: t[3], payment: t[4], receipt: '', created: Date.now() - i }; }),
        goals: { day: 50, week: 250, month: 1500, year: 18000 }
      }));
    } catch (e) { /* storage blocked: the app still works, just empty */ }
  }
  var corners; pickTarget();
  var cv = new THREE.Vector3();
  function placeLive() {
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    corners.forEach(function (c) {
      cv.copy(c).applyMatrix4(target.matrixWorld).project(cam);
      var x = (cv.x * .5 + .5) * innerWidth, y = (-cv.y * .5 + .5) * innerHeight;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });
    var w = maxX - minX, h = maxY - minY;
    live.style.left = minX + 'px'; live.style.top = minY + 'px'; live.style.width = w + 'px'; live.style.height = h + 'px';
    // render the app at laptop resolution and shrink it to the screen, like a real display;
    // on narrow screens let it use its own phone layout instead
    // (zoom is applied inside the app's own document: it is same-origin, and unlike a
    // transformed iframe it keeps clicks, scrolling and rendering exact)
    var s = w < 700 ? 1 : w / 1280;
    app.style.width = w + 'px'; app.style.height = h + 'px';
    try {
      var root = app.contentDocument && app.contentDocument.documentElement;
      if (root && root.style.zoom !== String(s)) root.style.zoom = s;
    } catch (e) { /* not loaded yet */ }
  }

  // the app is locked (clicks and wheel pass to the page) until the visitor chooses to use it
  function unlockApp() { live.classList.remove('locked'); app.tabIndex = 0; app.focus(); document.body.classList.add('app-open'); }
  function lockApp() { live.classList.add('locked'); app.tabIndex = -1; document.body.classList.remove('app-open'); }
  $('#tryApp').addEventListener('click', unlockApp);
  // glide down past the laptop; animated by hand so it works even where smooth scrolling is unsupported
  function glideBy(dy) {
    var from = scrollY, t0 = performance.now(), dur = reduce ? 0 : 700;
    (function step(now) {
      var k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
      window.scrollTo(0, from + dy * e); if (k < 1) requestAnimationFrame(step);
    })(t0);
    // if animation frames are paused (background tab), still arrive
    setTimeout(function () { if (Math.abs(scrollY - (from + dy)) > 2) window.scrollTo(0, from + dy); }, dur + 150);
  }
  $('#doneApp').addEventListener('click', function () { lockApp(); glideBy(innerHeight * .9); });

  /* ------------------------------------------------ scroll + loop */
  var desk = $('#desk'), heroCopy = $('#heroCopy'), pin = document.querySelector('.desk-pin'), nav = $('#top');
  var cur = { pos: WIDE.pos.clone(), look: WIDE.look.clone() }, tgt = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  var easeIO = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var t0 = performance.now(), phase = 0;

  function deskProgress() {
    var span = desk.offsetHeight - innerHeight;
    return clamp((scrollY - desk.offsetTop) / span, 0, 1);
  }

  function frame() {
    var t = (performance.now() - t0) / 1000;
    var p = deskProgress();
    var zoom = easeIO(clamp(p / .45, 0, 1));
    var dive = clamp((p - .8) / .2, 0, 1);

    // lid swings open on load
    var open = reduce ? 1 : 1 - Math.pow(1 - clamp(t / 1.4, 0, 1), 3);
    hinge.rotation.x = Math.PI / 2 + (-.28 - Math.PI / 2) * open;
    if (!reduce) phone.position.y = Math.sin(t * 1.3) * .05 * (1 - easeIO(clamp(deskProgress() / .45, 0, 1)));

    // the desk tilts with the pointer only while you are looking at the whole desk
    var tilt = 1 - zoom;
    rig.rotation.y += (mouse.x * .5 * tilt - rig.rotation.y) * .06;
    rig.rotation.x += (mouse.y * .15 * tilt - rig.rotation.x) * .06;
    frameScreen();

    var start = innerWidth < 760 ? NARROW_WIDE : WIDE;
    tgt.pos.copy(start.pos).lerp(SCREEN.pos, zoom); tgt.look.copy(start.look).lerp(SCREEN.look, zoom);
    var k = reduce || zoom > .98 ? 1 : .09;
    cur.pos.lerp(tgt.pos, k); cur.look.lerp(tgt.look, k);
    cam.position.copy(cur.pos); cam.lookAt(cur.look);

    heroCopy.style.opacity = clamp(1 - p / .12, 0, 1);
    heroCopy.style.visibility = p > .12 ? 'hidden' : 'visible';
    pin.style.setProperty('--dive', dive);
    nav.classList.toggle('on-dark', dive > .5 || scrollY > desk.offsetTop + desk.offsetHeight - innerHeight);

    // live app: only once the camera is square to the screen
    var showLive = zoom > .995 && p < .9;
    nav.style.opacity = showLive ? 0 : 1; nav.style.pointerEvents = showLive ? 'none' : '';
    if (showLive) {
      if (!appLoaded) { seedDemo(); app.src = 'apps/mydompet/'; appLoaded = true; }
      live.hidden = false; placeLive();
    } else live.hidden = true;
    if (!showLive && !live.classList.contains('locked')) lockApp();
    note.classList.toggle('show', showLive && p < .8 && !live.classList.contains('locked'));

    if (renderer) renderer.render(scene, cam);
    requestAnimationFrame(frame);
  }
  frame();

  /* project sections: parallax screenshot + line reveal */
  var sections = [].slice.call(document.querySelectorAll('.project'));
  function onScroll() {
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top < innerHeight * .65) s.classList.add('in');
      if (!reduce && innerWidth >= 760) s.querySelector('.shot').style.transform = 'translateY(' + (r.top * -.18) + 'px) rotate(-2deg)';
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
