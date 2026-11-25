/* world.js — the 3D studio: soft, rounded, warm-white isometric models with
   orange guide stripes, curved feature walls and room signs.
   Exposes window.StudioWorld(content) -> handles the scroll code animates. */
(function () {
  'use strict';

  var COL = {
    wall: '#FBF8F4', floor: '#F3EEE7', floor2: '#EEE7DD', plinth: '#E4DBCF',
    orange: '#EC6A1E', orangeSoft: '#F7B486', ink: '#22262D', wood: '#E3C9A6', woodDark: '#B98E62',
    leaf: '#9DCB8C', leaf2: '#7FB673', glass: '#C9DCE3', metal: '#D9DDE2', grey: '#B9B2A8', road: '#E1DBD2'
  };
  var SKIN = ['#E8B994', '#C99573', '#A9744F', '#F1C9A5'];
  var SHIRTS = ['#F07A2B', '#4C6FFF', '#7FB673', '#F2C14E', '#E86F8C', '#5FB3B3', '#FFFFFF'];

  window.StudioWorld = function (canvas, C) {
    C = C || {};
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    // no film tone mapping: it greys out the orange; lights are balanced by hand instead
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#F4EFE8', 120, 240);
    var cam = new THREE.PerspectiveCamera(34, 1, .1, 400);

    // bright, high-key light: warm sky, soft sun, a cool fill so shadows are not grey mud
    scene.add(new THREE.HemisphereLight('#FFF7EE', '#B9AA98', .7));
    var sun = new THREE.DirectionalLight('#FFF1E2', .82);
    sun.position.set(20, 34, 16); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 100 });
    sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; scene.add(sun);
    var fill = new THREE.DirectionalLight('#E8F0FF', .25); fill.position.set(-20, 12, -10); scene.add(fill);

    /* ---------------------------------------------- primitives */
    var MATS = {};
    function mat(color, o) {
      var key = color + JSON.stringify(o || {});
      return MATS[key] || (MATS[key] = new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: .72, metalness: 0 }, o || {})));
    }
    var GEO = {};
    // a box with softly rounded edges: the single most important thing for the look
    function roundedGeo(w, h, d, r) {
      r = Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001);
      var key = [w, h, d, r].join('|'); if (GEO[key]) return GEO[key];
      var s = new THREE.Shape(), x = -w / 2 + r, y = -d / 2 + r, ww = w - 2 * r, dd = d - 2 * r;
      s.moveTo(x, y); s.lineTo(x + ww, y); s.lineTo(x + ww, y + dd); s.lineTo(x, y + dd); s.lineTo(x, y);
      var g = new THREE.ExtrudeGeometry(s, { depth: Math.max(.001, h - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 4 });
      g.rotateX(-Math.PI / 2); g.translate(0, -(h - 2 * r) / 2, 0); g.computeVertexNormals();
      return (GEO[key] = g);
    }
    function rbox(w, h, d, color, x, y, z, parent, r, o) {
      var m = new THREE.Mesh(roundedGeo(w, h, d, r == null ? .06 : r), o && o.material ? o.material : mat(color, o));
      m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m;
    }
    function mesh(geo, color, x, y, z, parent, o) {
      var m = new THREE.Mesh(geo, mat(color, o)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    }
    // text on a rounded board, drawn on a canvas
    function board(lines, w, h, o) {
      o = o || {};
      var c = document.createElement('canvas'), px = 256; c.width = Math.round(px * w); c.height = Math.round(px * h);
      var g = c.getContext('2d'), rad = (o.radius == null ? .18 : o.radius) * px;
      g.fillStyle = o.bg || COL.orange;
      g.beginPath(); g.moveTo(rad, 0); g.arcTo(c.width, 0, c.width, c.height, rad); g.arcTo(c.width, c.height, 0, c.height, rad);
      g.arcTo(0, c.height, 0, 0, rad); g.arcTo(0, 0, c.width, 0, rad); g.closePath(); g.fill();
      var sizes = o.sizes || [74, 36], gap = sizes[0] * 1.15, top = c.height / 2 - (lines.length - 1) * gap / 2;
      lines.forEach(function (ln, i) {
        g.font = (i ? '600 ' : '800 ') + (sizes[i] || sizes[1]) + 'px Figtree, Arial, sans-serif';
        g.fillStyle = i ? (o.fg2 || 'rgba(255,255,255,.85)') : (o.fg || '#FFFFFF');
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ln, c.width / 2, top + i * gap);
      });
      var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
      return m;
    }
    var loader = new THREE.TextureLoader();
    function picture(url, w, h, x, y, z, parent, crop) {
      var m = new THREE.MeshBasicMaterial({ color: '#EDE7DF', toneMapped: false });
      function use(t) { t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (crop) { t.repeat.set(1, crop); t.offset.set(0, 1 - crop); } m.map = t; m.color.set('#FFFFFF'); m.needsUpdate = true; }
      if (/\.svg$/.test(url)) {
        var img = new Image(); img.onload = function () { var c = document.createElement('canvas'); c.width = 1600; c.height = 900; c.getContext('2d').drawImage(img, 0, 0, 1600, 900); use(new THREE.CanvasTexture(c)); }; img.src = url;
      } else loader.load(url, use);
      var p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); parent.add(p); return p;
    }

    /* ---------------------------------------------- characters and props */
    var people = [], spinners = [], wavers = [];
    var CAPS = {};
    function capsule(r, len) { var k = r + '|' + len; return CAPS[k] || (CAPS[k] = new THREE.CapsuleGeometry(r, len, 6, 12)); }
    var HEAD = new THREE.SphereGeometry(.25, 24, 18), HAIR = new THREE.SphereGeometry(.265, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5);
    var n = 0;
    function person(parent, x, z, rotY, o) {
      o = o || {}; n++;
      var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY || 0;
      var shirt = o.shirt || SHIRTS[n % SHIRTS.length], skin = o.skin || SKIN[n % SKIN.length], pants = o.pants || '#3A4150';
      if (o.seated) {
        mesh(capsule(.1, .42), pants, -.13, .58, .25, g).rotation.x = Math.PI / 2;
        mesh(capsule(.1, .42), pants, .13, .58, .25, g).rotation.x = Math.PI / 2;
        mesh(capsule(.09, .3), pants, -.13, .3, .5, g); mesh(capsule(.09, .3), pants, .13, .3, .5, g);
      } else {
        mesh(capsule(.1, .5), pants, -.13, .36, 0, g); mesh(capsule(.1, .5), pants, .13, .36, 0, g);
      }
      var body = mesh(capsule(.26, .38), shirt, 0, o.seated ? .98 : 1.02, 0, g);
      var armL = mesh(capsule(.08, .42), shirt, -.34, 1.02, 0, g); armL.rotation.z = .12;
      var armR = mesh(capsule(.08, .42), shirt, .34, 1.02, 0, g); armR.rotation.z = -.12;
      mesh(HEAD, skin, 0, 1.6, 0, g);
      var hair = mesh(HAIR, o.hair || '#2A2522', 0, 1.62, -.02, g); hair.rotation.x = -.25;
      if (o.cap) { rbox(.5, .06, .5, COL.ink, 0, 1.9, 0, g, .02); rbox(.28, .12, .28, COL.ink, 0, 1.83, 0, g, .03); }
      g.userData = { bob: Math.random() * 6, armR: armR, body: body, seated: !!o.seated };
      parent.add(g); people.push(g); if (o.wave) wavers.push(g); return g;
    }
    function plant(parent, x, z, s) {
      s = s || 1; var g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
      mesh(new THREE.CylinderGeometry(.28, .22, .5, 20), COL.wall, 0, .25, 0, g);
      [[0, .9, 0, .38], [.18, 1.15, .05, .28], [-.16, 1.12, -.06, .3]].forEach(function (l, i) { mesh(new THREE.SphereGeometry(l[3], 16, 12), i ? COL.leaf : COL.leaf2, l[0], l[1], l[2], g); });
      return g;
    }
    function chair(parent, x, z, rotY, color) {
      var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY || 0; parent.add(g);
      rbox(.6, .1, .58, color || COL.ink, 0, .5, 0, g, .04); rbox(.58, .55, .08, color || COL.ink, 0, .82, -.27, g, .04);
      mesh(new THREE.CylinderGeometry(.04, .04, .45, 10), COL.metal, 0, .25, 0, g); rbox(.5, .04, .5, COL.metal, 0, .03, 0, g, .02);
      return g;
    }
    function desk(parent, x, z, w, d, top) {
      var g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
      rbox(w, .08, d, top || COL.wood, 0, .84, 0, g, .035);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { rbox(.07, .8, .07, COL.wall, c[0] * (w / 2 - .12), .4, c[1] * (d / 2 - .12), g, .03); });
      return g;
    }
    function monitor(parent, x, z, url, crop) {
      var g = new THREE.Group(); g.position.set(x, .88, z); parent.add(g);
      rbox(.3, .03, .2, COL.metal, 0, .015, 0, g, .01); rbox(.05, .32, .05, COL.metal, 0, .18, -.03, g, .02);
      rbox(1.05, .64, .05, COL.ink, 0, .62, 0, g, .025);
      if (url) picture(url, .98, .57, 0, .62, .03, g, crop);
      return g;
    }
    function tree(x, z, s) {
      var g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s || 1); scene.add(g);
      mesh(new THREE.CylinderGeometry(.14, .2, 1.6, 10), COL.woodDark, 0, .8, 0, g);
      [[0, 2.1, 0, 1.05], [.55, 1.75, .2, .7], [-.5, 1.85, -.25, .75], [.05, 2.65, -.1, .7]].forEach(function (l, i) { mesh(new THREE.SphereGeometry(l[3], 20, 14), i % 2 ? COL.leaf : COL.leaf2, l[0], l[1], l[2], g); });
      return g;
    }
    function lamp(x, z) {
      var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
      mesh(new THREE.CylinderGeometry(.06, .08, 3, 10), COL.ink, 0, 1.5, 0, g); rbox(.7, .1, .22, COL.ink, .3, 3, 0, g, .04);
    }
    function bench(parent, x, z, rotY) {
      var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY || 0; parent.add(g);
      rbox(1.8, .1, .5, COL.wood, 0, .45, 0, g, .04); rbox(.1, .4, .45, COL.wall, -.75, .22, 0, g, .03); rbox(.1, .4, .45, COL.wall, .75, .22, 0, g, .03);
    }
    var cars = [];
    function car(color) {
      var g = new THREE.Group(); scene.add(g);
      rbox(2.2, .55, 1.05, color, 0, .5, 0, g, .22); rbox(1.2, .5, .95, color, -.1, .95, 0, g, .2);
      rbox(1.15, .38, .97, COL.glass, -.1, .98, 0, g, .16, { roughness: .2 });
      [[-.7, .5], [.7, .5], [-.7, -.5], [.7, -.5]].forEach(function (w) { var wh = mesh(new THREE.CylinderGeometry(.24, .24, .16, 16), COL.ink, w[0], .24, w[1], g); wh.rotation.x = Math.PI / 2; });
      cars.push(g); return g;
    }

    /* ---------------------------------------------- ground and street */
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat('#EFE9E1'));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    rbox(34, .1, 34, '#F7F3EE', 0, .05, 0, scene, .04);                       // plaza
    rbox(1.2, .02, 17, COL.orange, 7, .11, 23.5, scene, .01);                  // orange walkway from the street to the door
    rbox(30, .02, .5, COL.orangeSoft, 0, .11, 16.6, scene, .01);
    var road = new THREE.Mesh(new THREE.RingGeometry(24, 30, 64, 1, -Math.PI * .15, Math.PI * .8), mat(COL.road));
    road.rotation.x = -Math.PI / 2; road.position.set(-4, .06, -4); road.receiveShadow = true; scene.add(road);
    var lane = new THREE.Mesh(new THREE.RingGeometry(26.9, 27.1, 64, 1, -Math.PI * .15, Math.PI * .8), new THREE.MeshBasicMaterial({ color: '#FFFFFF' }));
    lane.rotation.x = -Math.PI / 2; lane.position.set(-4, .07, -4); scene.add(lane);
    car('#F07A2B'); car('#FFFFFF'); car('#4C6FFF');
    [[-17, 15, 1.1], [-12, 17.5, .9], [17, -12, 1], [18, -5, .8], [17.5, 15.5, 1.05], [-18, -16, 1.2], [3, 17.5, .85], [-17.5, 3, .9]].forEach(function (t) { tree(t[0], t[1], t[2]); });
    [[14, 16.5], [-6, 16.5], [16.5, 6]].forEach(function (l) { lamp(l[0], l[1]); });
    bench(scene, -2, 16.4, 0); bench(scene, 16.3, -1, Math.PI / 2);
    person(scene, 12.5, 16.2, -.6); person(scene, -9, 15.8, .8); person(scene, 16, 10, Math.PI * 1.3);

    /* ---------------------------------------------- the building */
    var R = 9, H = 3.2, HALF = R * 1.5, FL = .36;
    var building = new THREE.Group(); scene.add(building);
    rbox(R * 3 + .8, .3, R * 3 + .8, COL.plinth, 0, .2, 0, building, .1);
    var ROOMS = { desk: [0, 0], gallery: [1, 0], edu: [2, 0], trophy: [0, 1], certs: [1, 1], work: [2, 1], skills: [0, 2], design: [1, 2], contact: [2, 2] };
    function center(key) { var r = ROOMS[key]; return new THREE.Vector3((r[0] - 1) * R, 0, (r[1] - 1) * R); }
    Object.keys(ROOMS).forEach(function (k, i) { var c = center(k); rbox(R - .14, .06, R - .14, i % 2 ? COL.floor2 : COL.floor, c.x, FL, c.z, building, .02); });
    // orange guide stripes on the floor, running through every doorway
    [-R, 0, R].forEach(function (x) { rbox(.22, .02, R * 3 - .6, COL.orange, x, FL + .04, 0, building, .01); });
    [-R, 0, R].forEach(function (z) { rbox(R * 3 - .6, .02, .22, COL.orange, 0, FL + .045, z + 2.2, building, .01); });

    var walls = [];
    function wall(axis, at, from, to, h, color) {
      var len = to - from, mid = (from + to) / 2, m;
      var material = mat(color || COL.wall).clone(); material.transparent = true;
      m = axis === 'z' ? rbox(len, h, .24, null, mid, FL + h / 2, at, building, .06, { material: material })
                       : rbox(.24, h, len, null, at, FL + h / 2, mid, building, .06, { material: material });
      walls.push({ mesh: m, axis: axis, at: at }); return m;
    }
    wall('z', -HALF, -HALF, HALF, H); wall('x', -HALF, -HALF, HALF, H);
    [-R / 2, R / 2].forEach(function (z) { for (var c = -1; c <= 1; c++) { wall('z', z, c * R - R / 2, c * R - 1.2, H); wall('z', z, c * R + 1.2, c * R + R / 2, H); } });
    [-R / 2, R / 2].forEach(function (x) { for (var r = -1; r <= 1; r++) wall('x', x, r * R - R / 2, r * R + R / 2, 1.2, '#F1EBE3'); });

    // shell: roof and street-facing facade, which lift off as the camera goes in
    var shell = new THREE.Group(); scene.add(shell);
    var shellMats = [];
    function sbox(w, h, d, color, x, y, z, r) { var mm = mat(color).clone(); mm.transparent = true; shellMats.push(mm); return rbox(w, h, d, null, x, y, z, shell, r == null ? .08 : r, { material: mm }); }
    sbox(R * 3 + 1.2, .45, R * 3 + 1.2, '#EDE6DC', 0, FL + H + .25, 0, .12);                // roof slab
    sbox(R * 3 + 1.2, .35, .35, COL.plinth, 0, FL + H + .6, HALF + .4, .1);                // parapet
    sbox(.35, .35, R * 3 + 1.2, COL.plinth, HALF + .4, FL + H + .6, 0, .1);
    [[-8, -6], [-3, -9], [6, -8]].forEach(function (a) { sbox(2, .9, 1.4, '#E9E3DA', a[0], FL + H + .9, a[1], .12); });  // rooftop units
    sbox(R * 3 + .8, H, .26, COL.wall, 0, FL + H / 2, HALF, .08);                          // facade
    sbox(.26, H, R * 3 + .8, COL.wall, HALF, FL + H / 2, 0, .08);
    sbox(R * 3 - 1, 1.3, .1, COL.glass, -1, FL + 1.9, HALF + .15, .05);                    // window bands
    sbox(.1, 1.3, R * 3 - 1, COL.glass, HALF + .15, FL + 1.9, -1, .05);
    for (var mx = -12; mx <= 11; mx += 2.3) { sbox(.12, 1.32, .14, COL.wall, mx, FL + 1.9, HALF + .2, .04); sbox(.14, 1.32, .12, COL.wall, HALF + .2, FL + 1.9, mx, .04); }
    // the orange fin rising from the front corner, with the studio's name
    sbox(1.6, H + 5.2, 3.2, COL.orange, HALF - .4, FL + (H + 5.2) / 2, HALF - 2.6, .2);
    var fin = board(['MIRZA', 'STUDIO'], 2.6, 1.3, { bg: 'rgba(0,0,0,0)', sizes: [120, 120] });
    fin.rotation.y = Math.PI / 2; fin.rotation.z = Math.PI / 2; fin.position.set(HALF + .42, FL + 5.2, HALF - 2.6);
    fin.material.transparent = true; shellMats.push(fin.material); shell.add(fin);
    // entrance canopy
    sbox(4.2, .18, 2.2, COL.orange, 7, FL + 2.7, HALF + 1.2, .08);
    sbox(.14, 2.6, .14, COL.ink, 5.2, FL + 1.3, HALF + 2.1, .05); sbox(.14, 2.6, .14, COL.ink, 8.8, FL + 1.3, HALF + 2.1, .05);
    sbox(2.2, 2.3, .12, COL.glass, 7, FL + 1.15, HALF + .2, .05);

    /* ---------------------------------------------- rooms */
    var roomGroups = [];
    function room(key, title) {
      var g = new THREE.Group(); g.position.copy(center(key)); g.position.y = FL + .03; building.add(g); roomGroups.push(g);
      if (title) {   // hanging orange room sign, like a wayfinding board
        var b = board([title], 2.3, .62, { sizes: [72] }); b.position.set(-2.6, 3.08, -4.2); g.add(b);
        rbox(.03, .4, .03, COL.ink, -3.4, 3.55, -4.2, g, .01); rbox(.03, .4, .03, COL.ink, -1.8, 3.55, -4.2, g, .01);
      }
      return g;
    }
    // curved feature wall: an open half-cylinder in orange
    function curve(parent, x, z, r, h, color, arc) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48, 1, true, Math.PI - (arc || Math.PI) / 2, arc || Math.PI), mat(color || COL.orange, { side: THREE.DoubleSide }));
      m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    }

    // desk room
    var deskRoom = room('desk', 'My desk');
    curve(deskRoom, 0, -1.4, 2.9, 2.4, COL.orangeSoft, Math.PI * .8);
    desk(deskRoom, 0, -2.4, 3.2, 1.4);
    rbox(1.5, .05, 1, COL.metal, 0, .91, -2.3, deskRoom, .03, { metalness: .4, roughness: .3 });
    var lidG = new THREE.Group(); lidG.position.set(0, .93, -2.8); lidG.rotation.x = -.22; deskRoom.add(lidG);
    rbox(1.5, .96, .04, COL.metal, 0, .48, 0, lidG, .03, { metalness: .4, roughness: .3 });
    picture('../assets/projects/mydompet-1.jpg', 1.4, .86, 0, .48, .025, lidG);
    rbox(.36, .7, .05, COL.ink, 1.15, 1.18, -2.75, deskRoom, .05).rotation.x = -.2;
    chair(deskRoom, -.3, -1.2, Math.PI, COL.orange);
    person(deskRoom, -.3, -1.25, Math.PI, { seated: true, shirt: '#4C6FFF' });
    plant(deskRoom, 3.4, -3.6, 1.2); plant(deskRoom, -3.5, 3, .9);
    rbox(2.4, .06, 1.6, '#E9E0D4', 0, .03, -1, deskRoom, .03);

    // project gallery
    var gallery = room('gallery', 'Projects');
    var SCREENS = [
      { id: 'signspeak', x: -2.9, img: '../assets/covers/signspeak.svg' },
      { id: 'coop-pos', x: 0, img: '../assets/covers/coop-pos.svg' },
      { id: 'teampilot', x: 2.9, img: '../assets/projects/teampilot-1.jpg', crop: .32 }
    ];
    SCREENS.forEach(function (s) {
      rbox(2.66, 1.7, .1, COL.ink, s.x, 1.78, -4.25, gallery, .06);
      picture(s.img, 2.5, 1.55, s.x, 1.78, -4.19, gallery, s.crop);
      rbox(.9, .05, .5, COL.orange, s.x, .03, -3.3, gallery, .02);
    });
    bench(gallery, 0, -1, 0); person(gallery, -3.4, 2.2, Math.PI * .95); person(gallery, 2.4, .4, Math.PI * 1.1);
    plant(gallery, 3.8, 3.4);

    // education hall
    var EDU = C.EDUCATION || [];
    var eduRoom = room('edu', 'Education');
    rbox(6.6, .3, 2.8, COL.plinth, 0, .15, -3, eduRoom, .1);
    var arch = new THREE.Mesh(new THREE.TorusGeometry(3, .22, 16, 64, Math.PI), mat(COL.orange)); arch.position.set(0, .3, -3.6); arch.castShadow = true; eduRoom.add(arch);
    [{ h: 1.5, x: -1.3, i: 0 }, { h: 1.1, x: 1.3, i: 1 }].forEach(function (pd) {
      var e = EDU[pd.i] || {};
      rbox(1.8, pd.h, 1.4, COL.wall, pd.x, .3 + pd.h / 2, -2.8, eduRoom, .08);
      var lab = board([e.cgpa || '', pd.i === 0 ? 'Degree' : 'Diploma'], 1.5, .9, { bg: '#FFFFFF', fg: COL.orange, fg2: '#6B6F77', sizes: [100, 40] });
      lab.position.set(pd.x, .3 + pd.h / 2, -2.08); eduRoom.add(lab);
    });
    var cap = new THREE.Group(); cap.position.set(-1.3, 2.05, -2.8); eduRoom.add(cap);
    rbox(.4, .2, .4, COL.ink, 0, 0, 0, cap, .04); rbox(.8, .05, .8, COL.ink, 0, .12, 0, cap, .02); spinners.push(cap);
    var banner = board(['UTHM', 'Universiti Tun Hussein Onn Malaysia'], 3.1, .95, { sizes: [92, 27] }); banner.position.set(0, 2.25, -4.36); eduRoom.add(banner);
    person(eduRoom, 3, -1.2, -.6, { cap: true, shirt: COL.ink }); person(eduRoom, -3.2, .6, .4);
    for (var cr = 0; cr < 2; cr++) for (var cc = 0; cc < 4; cc++) chair(eduRoom, -2.4 + cc * 1.6, .8 + cr * 1.4, Math.PI, '#FFFFFF');

    // trophy room: three plinths under warm light, an orange feature wall
    var trophy = room('trophy', 'Awards');
    curve(trophy, 0, -1.7, 2.6, 2.4, COL.orange, Math.PI * .7);
    var gold = { color: '#F0B84A', metalness: .25, roughness: .3, emissive: '#5A3A00', emissiveIntensity: .35 };
    [-1.7, 0, 1.7].forEach(function (x, i) { rbox(1, 1 + (i === 1 ? .3 : 0), 1, COL.wall, x, .5 + (i === 1 ? .15 : 0), -3.6, trophy, .08); });
    var medal = new THREE.Group(); medal.position.set(-1.7, 1.55, -3.6); trophy.add(medal);
    var disc = new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, .07, 40), mat('#E6B04B', gold)); disc.rotation.x = Math.PI / 2; disc.castShadow = true; medal.add(disc);
    rbox(.12, .5, .02, COL.orange, 0, .4, 0, medal, .01); spinners.push(medal);
    var plaque = board(['Vice-Chancellor’s', 'Award'], 1.1, .8, { bg: COL.ink, fg: '#F2C46E', fg2: '#FFFFFF', sizes: [34, 44], radius: .08 });
    plaque.position.set(0, 1.75, -3.08); trophy.add(plaque);
    var cup = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.32, 0], [.32, .06], [.09, .1], [.07, .42], [.34, .5], [.38, .92], [0, .92]].map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 32), mat('#E6B04B', gold));
    cup.position.set(1.7, 1.02, -3.6); cup.castShadow = true; trophy.add(cup); spinners.push(cup);
    var t5 = board(['Top 5 FYP'], 1.1, .32, { bg: '#FFFFFF', fg: COL.orange, sizes: [60] }); t5.position.set(1.7, 2.2, -3.05); trophy.add(t5);
    var warm = new THREE.PointLight('#FFC88A', .8, 8, 2); warm.position.set(0, 3, -2.4); trophy.add(warm);
    person(trophy, 2.6, -.5, Math.PI * 1.15); plant(trophy, -3.6, 3.2);

    // certificate wall
    var certs = room('certs', 'Certificates');
    (C.CERTIFICATIONS || []).forEach(function (c, i) {
      var x = -3.3 + i * 1.65;
      rbox(1.42, 1.06, .06, COL.woodDark, x, 1.8, -4.27, certs, .03);
      var f = board([c.issuer.split(/[\s/]/)[0], c.title.replace(/ (Professional )?Certific(ate|ation)/, '')], 1.26, .9, { bg: '#FFFFFF', fg: COL.orange, fg2: '#5C6068', sizes: [48, 21], radius: .02 });
      f.position.set(x, 1.8, -4.23); certs.add(f);
    });
    bench(certs, 0, -1.4, 0); person(certs, -.6, -1.5, Math.PI, { seated: true }); person(certs, 2.6, -2, Math.PI * .9);
    plant(certs, 3.7, 3.3);

    // work area: two workstations
    var work = room('work', 'Experience');
    (C.EXPERIENCE || []).forEach(function (x, i) {
      var dx = i === 0 ? -2.2 : 2.2;
      desk(work, dx, -3, 2.6, 1.2);
      monitor(work, dx, -3.3, i === 0 ? '../assets/covers/clickpixel.svg' : '../assets/covers/fizar.svg');
      chair(work, dx, -1.95, Math.PI, i === 0 ? COL.orange : COL.ink);
      person(work, dx, -2, Math.PI, { seated: true, shirt: i === 0 ? '#F2C14E' : '#5FB3B3' });
      var s = board([x.org], 2, .42, { bg: i === 0 ? COL.orange : COL.ink, sizes: [52] }); s.position.set(dx, 2.05, -4.36); work.add(s);
    });
    plant(work, 0, -3.5, .9);

    // skills workshop: one rounded block per skill, coloured by category
    var skillsRoom = room('skills', 'Skills');
    var CAT = ['#F07A2B', '#4C6FFF', '#9B7BEA', '#E86F8C', '#F2C14E', '#8E9AAD', '#7FB673', '#5FB3B3'];
    [1, 2].forEach(function (lv) { rbox(7.2, .08, 1, COL.wood, 0, lv * 1.05, -3.9, skillsRoom, .03); });
    rbox(.1, 2.3, 1, COL.wall, -3.6, 1.15, -3.9, skillsRoom, .04); rbox(.1, 2.3, 1, COL.wall, 3.6, 1.15, -3.9, skillsRoom, .04);
    var k = 0;
    (C.SKILL_CATS || []).forEach(function (cat, ci) {
      (C.SKILLS || []).filter(function (s) { return s.cat === cat.id; }).forEach(function () {
        var lv = k < 26 ? 1 : 2, slot = k % 26;
        rbox(.22, .22, .22, CAT[ci % CAT.length], -3.2 + slot * .256, lv * 1.05 + .15, -3.95 + (slot % 2) * .22, skillsRoom, .05);
        k++;
      });
    });
    person(skillsRoom, -1.6, -1.6, Math.PI * .9); desk(skillsRoom, 1.8, -1, 2, 1, '#FFFFFF'); plant(skillsRoom, 3.6, 3);

    // design room: empty easels
    var design = room('design', 'Design');
    [-2.6, 0, 2.6].forEach(function (x) {
      rbox(.06, 2.1, .06, COL.woodDark, x - .55, 1.05, -3.1, design, .02).rotation.x = -.08;
      rbox(.06, 2.1, .06, COL.woodDark, x + .55, 1.05, -3.1, design, .02).rotation.x = -.08;
      var cv = board(['Soon'], 1.5, 1.1, { bg: '#FFFFFF', fg: '#CFC6BA', sizes: [64], radius: .02 }); cv.position.set(x, 1.45, -2.98); cv.rotation.x = -.08; design.add(cv);
    });
    plant(design, 3.7, 3.3);

    // contact: a reception counter with an orange top, like a front desk
    var contact = room('contact', 'Contact');
    curve(contact, 0, -2.1, 2.2, 2.6, COL.orangeSoft, Math.PI * .7);
    // curved reception counter: outer and inner faces plus an orange ring-shaped top
    var cG = new THREE.Group(); cG.position.set(0, 0, -3.4); contact.add(cG);
    [2.1, 1.65].forEach(function (r) {
      var f = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.05, 48, 1, true, -Math.PI * .35, Math.PI * .7), mat(COL.wall, { side: THREE.DoubleSide }));
      f.position.y = .53; f.castShadow = true; f.receiveShadow = true; cG.add(f);
    });
    var topRing = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.2, 48, 1, -Math.PI * .85, Math.PI * .7), mat(COL.orange, { side: THREE.DoubleSide }));
    topRing.rotation.x = -Math.PI / 2; topRing.position.y = 1.07; topRing.castShadow = true; cG.add(topRing);
    var talk = board(['Let’s talk'], 2.6, .7, { sizes: [100] }); talk.position.set(0, 2.85, -4.3); contact.add(talk);
    person(contact, 0, -2.6, 0, { shirt: '#4C6FFF', wave: true });
    person(contact, 2.4, .8, Math.PI * 1.2); plant(contact, -3.6, -3.6, 1.1);

    // focus marker: an orange floor outline under the visited room
    var focusRing = new THREE.Mesh(new THREE.RingGeometry(3.7, 3.85, 72), new THREE.MeshBasicMaterial({ color: COL.orange, transparent: true, opacity: 0 }));
    focusRing.rotation.x = -Math.PI / 2; focusRing.position.y = FL + .06; scene.add(focusRing);

    /* ---------------------------------------------- per-frame life */
    function animate(t, reduce) {
      if (reduce) return;
      people.forEach(function (p) { if (!p.userData.seated) p.userData.body.position.y = 1.02 + Math.abs(Math.sin(t * 1.8 + p.userData.bob)) * .025; });
      spinners.forEach(function (s, i) { s.rotation.y = t * .8 + i; });
      wavers.forEach(function (w) { var a = w.userData.armR; a.rotation.z = -2.6 + Math.sin(t * 6) * .35; a.position.set(.42, 1.42, 0); });
      cars.forEach(function (c, i) {
        var a = (-Math.PI * .15) + ((t * .05 + i * .27) % 1) * Math.PI * .8, r = i % 2 ? 25.5 : 28.4;
        c.position.set(-4 + Math.cos(a) * r, .06, -4 - Math.sin(a) * r); c.rotation.y = a + (i % 2 ? 0 : Math.PI);
      });
    }

    return { renderer: renderer, scene: scene, cam: cam, R: R, center: center, SCREENS: SCREENS, shell: shell, shellMats: shellMats,
      walls: walls, roomGroups: roomGroups, focusRing: focusRing, animate: animate };
  };
})();
