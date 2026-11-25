/* The Studio — Mirza's portfolio as one isometric building.
   Scrolling moves the camera from stop to stop: outside the building, then into
   each room. Every room has a panel beside it built from the site's data files. */
(function () {
  'use strict';
  var SITE = window.SiteConfig || {}, C = window.SiteContent || {}, P = window.SiteProjects || {};
  var PROFILE = SITE.profile || {}, LINKS = SITE.links || {};
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var byId = function (list, id) { return (list || []).filter(function (x) { return x.id === id; })[0] || {}; };

  /* =========================================================== world (world.js) */
  var W = window.StudioWorld($('#world'), C);
  var renderer = W.renderer, scene = W.scene, cam = W.cam, R = W.R, center = W.center, SCREENS = W.SCREENS,
      shell = W.shell, shellMats = W.shellMats, walls = W.walls, roomGroups = W.roomGroups, focusRing = W.focusRing;

  /* =========================================================== stops */
  var proj = function (id) { return byId(P.PROJECTS, id); };
  var facts = function (p) { return '<div class="facts">' + ((p.results && p.results.metrics) || []).slice(0, 3).map(function (m) { return '<div><b>' + esc(m.v) + '</b><span>' + esc(m.k) + '</span></div>'; }).join('') + '</div>'; };
  var skillName = {}; (C.SKILLS || []).concat(P.EXTRA_TECHS || []).forEach(function (s) { skillName[s.id] = s.name; });
  var tags = function (p) { return '<div class="tags">' + (p.tech || []).slice(0, 6).map(function (t) { return '<span>' + esc(skillName[t] || t) + '</span>'; }).join('') + '</div>'; };
  var more = function (p) { return '<a class="btn ghost" href="../#/project/' + p.id + '">Read how I built it</a>'; };
  function projectPanel(id) {
    var p = proj(id);
    return '<p class="room-name">Project gallery</p><h2>' + esc(p.title) + '</h2><p>' + esc(p.summary) + '</p>' + facts(p) + tags(p) + more(p);
  }
  var md = proj('mydompet');
  var STOPS = [
    { key: 'outside', nav: 'Home', hero: true, html:
      '<h1>' + esc(PROFILE.shortName || 'Mirza Nazeef') + '<br><em>builds systems people use.</em></h1>' +
      '<p>' + esc(PROFILE.role || '') + ' at UTHM. ' + esc(PROFILE.availability || '') + '.</p>' +
      '<dl class="stats">' + (PROFILE.stats || []).map(function (s) { return '<div><dt>' + esc(s.label) + '</dt><dd>' + esc(s.value) + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="hint">Scroll to walk through my studio.</p>' },
    { key: 'desk', nav: 'About', html:
      '<p class="room-name">My desk</p><h2>Hi, I’m Mirza.</h2>' +
      '<p>' + esc((PROFILE.intro || [])[0] || '') + '</p>' +
      '<dl class="glance">' + (PROFILE.glance || []).map(function (g) { return '<div><dt>' + esc(g.label) + '</dt><dd>' + esc(g.value) + '</dd></div>'; }).join('') + '</dl>' +
      '<p style="margin-top:18px">That laptop is running <b>' + esc(md.title || 'MyDompet') + '</b>, my spending tracker. It works for real.</p>' +
      '<button class="btn" id="openApp" type="button">Try MyDompet live</button>' },
    { key: 'gallery', focus: 0, nav: 'Projects', html: projectPanel('signspeak') },
    { key: 'gallery', focus: 1, html: projectPanel('coop-pos') },
    { key: 'gallery', focus: 2, html: projectPanel('teampilot') },
    { key: 'edu', nav: 'Education', html:
      '<p class="room-name">Education hall</p><h2>Two qualifications, <em>both with honours-level results.</em></h2>' +
      (C.EDUCATION || []).map(function (e) {
        return '<div class="edu"><span class="cg">' + esc(e.cgpa) + '</span><h3>' + esc(e.qualification) + '</h3><small>' + esc(e.institution) + ', ' + esc(e.period) + '</small>' +
          ((e.achievements || []).length ? '<div class="pills">' + e.achievements.map(function (a) { return '<span>' + esc(a) + '</span>'; }).join('') + '</div>' : '') + '</div>';
      }).join('') },
    { key: 'trophy', nav: 'Awards', html:
      '<p class="room-name">Trophy room</p><h2>Awards</h2><ul class="list">' +
      (C.AWARDS || []).map(function (a) { return '<li class="award"><b>' + esc(a.title) + '</b><span>' + esc(a.org) + (a.detail ? '. ' + esc(a.detail) : '') + '</span></li>'; }).join('') + '</ul>' },
    { key: 'certs', nav: 'Certificates', html:
      '<p class="room-name">Certificate wall</p><h2>Certified</h2><ul class="list">' +
      (C.CERTIFICATIONS || []).map(function (c) { return '<li><b>' + esc(c.title) + '</b><span>' + esc(c.issuer) + '. ' + esc(c.blurb) + '</span></li>'; }).join('') + '</ul>' },
    { key: 'work', nav: 'Experience', html:
      '<p class="room-name">Work area</p><h2>Experience</h2>' +
      (C.EXPERIENCE || []).map(function (x) { return '<div class="job"><h3>' + esc(x.role) + '</h3><small>' + esc(x.org) + ', ' + esc(x.period) + '</small><ul>' + (x.points || []).slice(0, 3).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>'; }).join('') },
    { key: 'skills', nav: 'Skills', html:
      '<p class="room-name">Skills workshop</p><h2>' + (C.SKILLS || []).length + ' skills</h2><p>One block on the shelf per skill. Tap one to see where it came from.</p>' +
      '<div class="skillcats">' + (C.SKILL_CATS || []).map(function (cat) {
        return '<div><h3>' + esc(cat.label) + '</h3><div class="chips">' + (C.SKILLS || []).filter(function (s) { return s.cat === cat.id; }).map(function (s) {
          return '<button type="button" class="chip src-' + esc(s.source) + '" data-skill="' + esc(s.id) + '">' + esc(s.name) + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</div><p class="skillnote" id="skillNote" aria-live="polite"></p>' },
    { key: 'design', nav: 'Design', html:
      '<p class="room-name">Design room</p><h2>Design work</h2><p>Interface, poster and brand pieces are being framed for these easels.</p>' },
    { key: 'contact', nav: 'Contact', html:
      '<p class="room-name">Front door</p><h2>Let’s talk.</h2><p>Open to internships in software and AI. I usually reply within a day.</p>' +
      '<div class="row"><a class="btn" href="mailto:' + esc(LINKS.email) + '">Email me</a>' +
      (LINKS.phoneDigits ? '<a class="btn ghost" href="https://wa.me/' + esc(LINKS.phoneDigits) + '">WhatsApp</a>' : '') +
      '<a class="btn ghost" href="' + esc(LINKS.linkedin) + '">LinkedIn</a><a class="btn ghost" href="https://github.com/nazKnow-IT">GitHub</a></div>' +
      '<form class="form" id="contactForm"><input name="name" placeholder="Your name" required autocomplete="name"><input name="email" type="email" placeholder="Your email" required autocomplete="email">' +
      '<textarea name="message" rows="3" placeholder="Message" required></textarea><input type="text" name="_honey" class="honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="btn" type="submit">Send message</button><p id="formNote" aria-live="polite" style="margin:0"></p></form>' +
      '<p style="margin-top:12px">I speak ' + (C.LANGUAGES_SPOKEN || []).map(function (l) { return esc(l.name); }).join(' and ') + '.</p>' }
  ];

  $('#stops').innerHTML = STOPS.map(function (s, i) {
    return '<section class="stop' + (s.hero ? ' hero' : '') + '" id="stop-' + i + '"><div class="panel">' + s.html + '</div></section>';
  }).join('');
  $('#roomNav').innerHTML = STOPS.map(function (s, i) { return s.nav ? '<li><a href="#stop-' + i + '" data-i="' + i + '">' + esc(s.nav) + '</a></li>' : ''; }).join('');
  $('#cvLink').href = '../' + (LINKS.cvFile || 'assets/cv/Mirza-Nazeef-CV.pdf');

  // skills explainer
  var SRC = C.SOURCE_LABELS || {}, usedIn = {};
  (P.PROJECTS || []).forEach(function (p) { (p.tech || []).forEach(function (t) { (usedIn[t] = usedIn[t] || []).push(p.title); }); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-skill]'); if (!b) return;
    var sk = byId(C.SKILLS, b.dataset.skill);
    [].forEach.call(document.querySelectorAll('.chip.on'), function (x) { x.classList.remove('on'); }); b.classList.add('on');
    $('#skillNote').innerHTML = '<b>' + esc(sk.name) + '</b>: ' + esc(SRC[sk.source] || '') + '. ' + esc(sk.blurb) + (usedIn[sk.id] ? ' Used in ' + esc(usedIn[sk.id].join(', ')) + '.' : '');
  });
  // live MyDompet in a window
  var modal = $('#appModal'), appFrame = $('#appFrame');
  $('#openApp').addEventListener('click', function () { appFrame.src = '../apps/mydompet/'; modal.hidden = false; $('#closeApp').focus(); });
  $('#closeApp').addEventListener('click', function () { modal.hidden = true; appFrame.src = 'about:blank'; });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) $('#closeApp').click(); });
  // contact form: same FormSubmit endpoint as the current site
  var CF = SITE.contactForm || {};
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target, note = $('#formNote'), data = new FormData(f);
    if (!CF.enabled || !CF.endpoint) { location.href = 'mailto:' + LINKS.email; return; }
    data.append('_subject', (CF.subject || 'Portfolio enquiry').replace('{name}', data.get('name')));
    note.textContent = 'Sending your message...';
    fetch(CF.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(); note.textContent = 'Message sent.'; f.reset(); })
      .catch(function () { note.textContent = 'That did not send. Please email ' + LINKS.email + '.'; });
  });

  /* =========================================================== camera path */
  var narrow = function () { return innerWidth < 760; };
  function shotFor(s) {
    var c = s.key === 'outside' ? new THREE.Vector3() : center(s.key);
    var pos, look;
    if (s.key === 'outside') { pos = new THREE.Vector3(31, 25, 41); look = new THREE.Vector3(1, 0, 2); }
    else if (s.focus != null) {
      var sx = c.x + SCREENS[s.focus].x, sz = c.z - 4.28;
      pos = new THREE.Vector3(sx + 2.6, 4.4, sz + 10); look = new THREE.Vector3(sx, 1.8, sz);
    } else { pos = new THREE.Vector3(c.x + 5, 7.6, c.z + 9.5); look = new THREE.Vector3(c.x, 1.2, c.z - 2.4); }
    // leave room for the panel: on wide screens push the subject right, on phones push it up
    var right = new THREE.Vector3().subVectors(look, pos).cross(new THREE.Vector3(0, 1, 0)).normalize();
    var dist = pos.distanceTo(look);
    if (narrow()) look.y -= dist * (s.key === 'outside' ? .18 : .2);
    else look.addScaledVector(right, -dist * (s.key === 'outside' ? .34 : .2));
    return { pos: pos, look: look, c: c };
  }
  var shots = [];
  function buildShots() { shots = STOPS.map(shotFor); }
  var sections = [].slice.call(document.querySelectorAll('.stop'));
  var navLinks = [].slice.call(document.querySelectorAll('#roomNav a'));

  // continuous position along the path: 2.5 means halfway between stop 2 and stop 3
  function pathPosition() {
    var mid = scrollY + innerHeight / 2, centres = sections.map(function (s) { return s.offsetTop + s.offsetHeight / 2; });
    if (mid <= centres[0]) return 0;
    for (var i = 0; i < centres.length - 1; i++) {
      if (mid < centres[i + 1]) {
        var t = (mid - centres[i]) / (centres[i + 1] - centres[i]);
        // hold on each room for a moment, then travel
        t = clamp((t - .3) / .4, 0, 1); t = t * t * (3 - 2 * t);
        return i + t;
      }
    }
    return centres.length - 1;
  }

  var cur = { pos: new THREE.Vector3(31, 25, 41), look: new THREE.Vector3() }, tgtPos = new THREE.Vector3(), tgtLook = new THREE.Vector3();
  var active = -1;
  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight; cam.fov = narrow() ? 50 : 34; cam.updateProjectionMatrix();
    buildShots();
  }
  addEventListener('resize', resize); resize();

  var clock = new THREE.Clock();
  function frame() {
    var t = clock.getElapsedTime(), f = pathPosition();
    var i = Math.floor(f), u = f - i, a = shots[i], b = shots[Math.min(shots.length - 1, i + 1)];
    tgtPos.copy(a.pos).lerp(b.pos, u); tgtLook.copy(a.look).lerp(b.look, u);
    var k = reduce ? 1 : .07;
    cur.pos.lerp(tgtPos, k); cur.look.lerp(tgtLook, k);
    // a slow drift outside so the first view is alive before anyone scrolls
    var drift = reduce ? 0 : Math.max(0, 1 - f) * Math.sin(t * .25) * 2;
    cam.position.set(cur.pos.x + drift, cur.pos.y, cur.pos.z - drift * .5); cam.lookAt(cur.look);

    // the roof and street walls lift away on the way in
    var open = clamp(f, 0, 1);
    shell.position.y = open * 16;
    shellMats.forEach(function (m) { m.opacity = 1 - open; });
    shell.visible = open < .99;

    // walls between the camera and the room fade out, like a dollhouse
    var stopNow = STOPS[Math.round(f)], fc = shots[Math.round(f)].c;
    walls.forEach(function (w) {
      var inFront = stopNow.key !== 'outside' && (w.axis === 'z' ? w.at > fc.z + .5 && w.at < fc.z + R : w.at > fc.x + .5 && w.at < fc.x + R);
      w.mesh.material.opacity += ((inFront ? .12 : 1) - w.mesh.material.opacity) * .12;
      w.mesh.castShadow = !inFront;
    });
    // rooms in the row between the camera and the visited room step out of the way
    roomGroups.forEach(function (g) {
      var hide = stopNow.key !== 'outside' && g.position.z > fc.z + 1;
      var s = g.scale.y + ((hide ? .001 : 1) - g.scale.y) * .15; g.scale.set(1, s, 1); g.visible = s > .01;
    });
    focusRing.position.x += (fc.x - focusRing.position.x) * .1; focusRing.position.z += (fc.z - focusRing.position.z) * .1;
    focusRing.material.opacity += ((stopNow.key === 'outside' || stopNow.focus != null ? 0 : .55) - focusRing.material.opacity) * .1;

    W.animate(t, reduce);

    var nowIdx = Math.round(f);
    if (nowIdx !== active) {
      active = nowIdx;
      sections.forEach(function (s, n) { s.classList.toggle('on', n === active); });
      var navOn = active; while (navOn > 0 && !STOPS[navOn].nav) navOn--;
      navLinks.forEach(function (l) { l.classList.toggle('on', +l.dataset.i === navOn); });
    }
    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  }
  frame();
})();
