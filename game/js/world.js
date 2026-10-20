/* The plaza: daylight stage, seven checkpoint plinths, props and 3D labels. */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE) throw new Error('world.js needs three.js loaded first');

  const C = {
    skyTop: '#dfeafc',
    skyBottom: '#b9d2ea',
    fog: 0xcddfec,
    ground: 0xc9d7e5,
    field: 0xcddcc9,
    strip: 0x9fbfe0,
    rim: 0x8ba6c0,
    plinth: 0xf2f6fa,
    plinthEdge: 0xd5e0ea,
    accent: 0x2f7de1,
    done: 0x3f9e6d,
    ink: '#1b2430',
    sub: '#5a6b7d',
    leafA: 0x74ac82,
    leafB: 0x5d9670,
    trunk: 0x9a836b,
    stone: 0xd3dde7,
    screen: 0x1f3857,
    paper: 0xf2f7fb,
    metal: 0x9fabb8
  };

  function std(color, rough, metal) {
    return new THREE.MeshStandardMaterial({
      color: color, roughness: rough === undefined ? 0.85 : rough,
      metalness: metal === undefined ? 0.02 : metal, flatShading: false
    });
  }

  function box(w, h, d, color, x, y, z, rough, metal) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(color, rough, metal));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  function cyl(rt, rb, h, seg, color, x, y, z, rough, metal) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 18), std(color, rough, metal));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /* Screen-space vertical gradient used as the scene background. */
  function skyTexture() {
    const cv = document.createElement('canvas');
    cv.width = 4;
    cv.height = 256;
    const g = cv.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, C.skyTop);
    grad.addColorStop(0.62, '#d3e3f4');
    grad.addColorStop(1, C.skyBottom);
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 256);
    const tex = new THREE.CanvasTexture(cv);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function labelSprite(title, sub) {
    const dpr = 2;
    const w = 460, h = 150;
    const cv = document.createElement('canvas');
    cv.width = w * dpr;
    cv.height = h * dpr;
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.94)';
    const r = 16;
    g.beginPath();
    g.moveTo(r, 8); g.lineTo(w - r, 8); g.quadraticCurveTo(w - 8, 8, w - 8, r + 8);
    g.lineTo(w - 8, h - 40 - r); g.quadraticCurveTo(w - 8, h - 40, w - 8 - r, h - 40);
    g.lineTo(r + 8, h - 40); g.quadraticCurveTo(8, h - 40, 8, h - 40 - r);
    g.lineTo(8, r + 8); g.quadraticCurveTo(8, 8, r, 8);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(47,125,225,0.35)';
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = C.ink;
    g.font = '600 40px system-ui, "Segoe UI", Roboto, sans-serif';
    g.textAlign = 'center';
    g.fillText(title, w / 2, 68);
    g.fillStyle = C.sub;
    g.font = '500 24px ui-monospace, Menlo, Consolas, monospace';
    g.fillText(sub, w / 2, 100);
    const tex = new THREE.CanvasTexture(cv);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(w / 150, h / 150, 1);
    return sp;
  }

  /* ---------------- props, keyed by the names used in data.js ---------------- */
  const PROPS = {
    arch: function () {
      const g = new THREE.Group();
      g.add(box(0.34, 3.4, 0.34, C.stone, -2.1, 1.7, 0));
      g.add(box(0.34, 3.4, 0.34, C.stone, 2.1, 1.7, 0));
      g.add(box(4.6, 0.34, 0.4, C.plinth, 0, 3.5, 0));
      g.add(box(4.6, 0.1, 0.44, C.accent, 0, 3.2, 0));
      return g;
    },
    nameplate: function () {
      const g = new THREE.Group();
      g.add(box(2.6, 0.9, 0.16, C.plinth, 0, 0.75, -0.1));
      g.add(box(2.3, 0.1, 0.2, C.accent, 0, 1.12, -0.1));
      return g;
    },
    podium: function () {
      const g = new THREE.Group();
      g.add(cyl(0.75, 0.85, 0.7, 8, C.plinth, -1.1, 0.35, 0.2));
      g.add(cyl(0.6, 0.7, 1.15, 8, C.plinth, 1.0, 0.575, -0.2));
      g.add(box(1.1, 0.06, 1.1, C.accent, 1.0, 1.18, -0.2));
      g.add(box(0.9, 0.06, 0.9, C.done, -1.1, 0.73, 0.2));
      return g;
    },
    cap: function () {
      const g = new THREE.Group();
      const board = box(1.15, 0.09, 1.15, 0x2b333d, 0, 1.6, 0);
      board.rotation.y = 0.5;
      g.add(board);
      g.add(cyl(0.36, 0.42, 0.3, 14, 0x2b333d, 0, 1.42, 0));
      g.add(box(0.06, 0.5, 0.06, C.accent, 0.5, 1.4, 0.5));
      g.add(cyl(0.06, 0.06, 0.24, 8, C.accent, 0.5, 1.05, 0.5));
      return g;
    },
    counter: function () {
      const g = new THREE.Group();
      g.add(box(2.6, 0.95, 0.9, C.plinth, 0, 0.475, 0));
      g.add(box(2.75, 0.12, 1.0, C.stone, 0, 1.0, 0));
      for (let i = 0; i < 3; i++) {
        g.add(box(0.42, 0.34, 0.3, i === 1 ? C.accent : C.paper, -0.85 + i * 0.85, 1.23, 0));
      }
      return g;
    },
    terminal: function () {
      const g = new THREE.Group();
      g.add(box(0.5, 0.85, 0.34, C.plinth, 1.7, 0.42, 0.4));
      g.add(box(0.42, 0.3, 0.05, C.screen, 1.7, 0.72, 0.58));
      g.add(box(0.3, 0.06, 0.2, C.metal, 1.7, 0.9, 0.5));
      return g;
    },
    crate: function () {
      const g = new THREE.Group();
      g.add(box(0.9, 0.9, 0.9, C.stone, -1.3, 0.45, 0.3));
      g.add(box(0.9, 0.9, 0.9, C.paper, -1.3, 1.35, 0.3));
      g.add(box(0.7, 0.7, 0.7, C.stone, -0.2, 0.35, -0.7));
      return g;
    },
    scanner: function () {
      const g = new THREE.Group();
      const gun = cyl(0.07, 0.09, 0.7, 10, C.metal, 1.4, 1.15, 0.2);
      gun.rotation.z = 1.3;
      g.add(gun);
      g.add(box(0.16, 0.34, 0.16, C.plinth, 1.4, 1.05, 0.2));
      const beam = box(0.02, 0.02, 1.6, 0xff5c5c, 1.4, 1.15, 1.0);
      beam.material = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
      g.add(beam);
      return g;
    },
    screen: function () {
      const g = new THREE.Group();
      g.add(box(2.1, 1.25, 0.1, C.plinth, 0.4, 1.75, -1.0));
      g.add(box(1.88, 1.02, 0.06, C.screen, 0.4, 1.78, -0.93));
      for (let i = 0; i < 4; i++) {
        g.add(box(0.3, 0.1 + i * 0.16, 0.04, i === 2 ? C.done : 0x63a4ff, -0.35 + i * 0.45, 1.4 + (0.1 + i * 0.16) / 2, -0.88));
      }
      g.add(box(0.14, 1.1, 0.14, C.metal, 0.4, 0.55, -1.0));
      g.add(box(0.7, 0.06, 0.5, C.metal, 0.4, 0.03, -1.0));
      return g;
    },
    phone: function () {
      const g = new THREE.Group();
      const body = box(1.1, 2.15, 0.12, 0x2b333d, 0, 1.5, -0.6);
      body.rotation.y = -0.35;
      g.add(body);
      const face = box(0.96, 1.9, 0.03, 0xbfd8f2, 0, 1.5, -0.53);
      face.rotation.y = -0.35;
      g.add(face);
      return g;
    },
    skeleton: function () {
      const g = new THREE.Group();
      const joints = [[0, 0.9, 0], [0.22, 1.25, 0], [-0.2, 1.3, 0.05], [0.05, 1.6, -0.05],
        [0.34, 1.68, 0], [-0.05, 1.85, 0.05], [0.2, 1.9, 0], [0.42, 1.95, -0.05]];
      const jm = new THREE.MeshStandardMaterial({ color: C.accent, roughness: 0.4, metalness: 0.1 });
      joints.forEach(function (p) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), jm);
        s.position.set(p[0], p[1], p[2] - 0.4);
        s.castShadow = false;
        g.add(s);
      });
      const pts = [];
      const links = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [5, 6], [6, 7]];
      links.forEach(function (l) {
        pts.push(joints[l[0]][0], joints[l[0]][1], joints[l[0]][2] - 0.4,
          joints[l[1]][0], joints[l[1]][1], joints[l[1]][2] - 0.4);
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x2f7de1 }));
      g.add(lines);
      return g;
    },
    shelf: function () {
      const g = new THREE.Group();
      g.add(box(2.4, 0.08, 0.5, C.plinth, 0, 0.85, -0.9));
      g.add(box(2.4, 0.08, 0.5, C.plinth, 0, 1.5, -0.9));
      g.add(box(0.1, 1.6, 0.1, C.stone, -1.15, 0.8, -0.9));
      g.add(box(0.1, 1.6, 0.1, C.stone, 1.15, 0.8, -0.9));
      const cols = [C.accent, C.done, 0xd98a3c, 0x7c6bd6, C.metal];
      for (let i = 0; i < 5; i++) {
        g.add(box(0.3, 0.55 - (i % 3) * 0.06, 0.06, cols[i], -0.9 + i * 0.45, 0.85 + (0.55 - (i % 3) * 0.06) / 2 + 0.04, -0.9));
      }
      return g;
    },
    medal: function () {
      const g = new THREE.Group();
      const disc = cyl(0.42, 0.42, 0.08, 24, 0xe3b64c, 1.7, 1.25, 0.3);
      disc.rotation.x = Math.PI / 2;
      g.add(disc);
      g.add(box(0.34, 0.5, 0.05, C.accent, 1.7, 1.72, 0.28));
      return g;
    },
    flag: function () {
      const g = new THREE.Group();
      g.add(cyl(0.05, 0.06, 2.9, 10, C.metal, 0, 1.45, -1.2));
      const cloth = box(1.0, 0.62, 0.03, C.done, 0.55, 2.5, -1.2);
      cloth.rotation.y = -0.2;
      g.add(cloth);
      return g;
    },
    board: function () {
      const g = new THREE.Group();
      g.add(box(2.5, 1.5, 0.1, C.plinth, 0, 1.2, -1.1));
      g.add(box(2.3, 1.3, 0.04, 0xeaf2fb, 0, 1.2, -1.04));
      g.add(box(0.12, 1.5, 0.12, C.stone, -1.15, 0.75, -1.1));
      g.add(box(0.12, 1.5, 0.12, C.stone, 1.15, 0.75, -1.1));
      for (let i = 0; i < 3; i++) {
        g.add(box(1.6 - i * 0.35, 0.09, 0.03, i === 0 ? C.accent : C.rim, -0.2 + i * 0.1, 1.55 - i * 0.34, -1.0));
      }
      return g;
    }
  };

  function buildRibbon(pathPts, width) {
    const v3 = pathPts.map(function (p) { return new THREE.Vector3(p[0], 0, p[1]); });
    const curve = new THREE.CatmullRomCurve3(v3, false, 'centripetal');
    const n = 180;
    const pos = [];
    const idx = [];
    const half = width / 2;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const nx = tan.z, nz = -tan.x;
      const l = Math.hypot(nx, nz) || 1;
      const ox = (nx / l) * half, oz = (nz / l) * half;
      pos.push(p.x - ox, 0.02, p.z - oz);
      pos.push(p.x + ox, 0.02, p.z + oz);
      if (i < n) {
        const a = i * 2;
        /* wound so the strip faces up out of the ground */
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, std(C.strip, 0.95, 0));
    mesh.receiveShadow = true;
    return mesh;
  }

  function tree(scale) {
    const g = new THREE.Group();
    g.add(cyl(0.13, 0.18, 1.1, 7, C.trunk, 0, 0.55, 0));
    g.add(new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.9, 7), std(C.leafA, 0.9, 0)));
    g.children[1].position.y = 1.9;
    g.children[1].castShadow = true;
    g.children[1].receiveShadow = true;
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.3, 7), std(C.leafB, 0.9, 0));
    top.position.y = 2.85;
    top.castShadow = true;
    g.add(top);
    g.scale.setScalar(scale);
    return g;
  }

  function create(opts) {
    const data = opts.data;
    const scene = new THREE.Scene();
    scene.background = skyTexture();
    scene.fog = new THREE.Fog(C.fog, 52, 150);

    const hemi = new THREE.HemisphereLight(0xf6fbff, 0xa9c0d6, 0.42);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff2df, 0.78);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 70;
    key.shadow.camera.left = -14;
    key.shadow.camera.right = 14;
    key.shadow.camera.top = 14;
    key.shadow.camera.bottom = -14;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    scene.add(key.target);

    const fill = new THREE.DirectionalLight(0xd9e8ff, 0.18);
    fill.position.set(-16, 12, -14);
    scene.add(fill);

    /* the park the plaza sits in, far enough out that the follow camera never clips it */
    const field = new THREE.Mesh(new THREE.CircleGeometry(96, 72), std(C.field, 0.98, 0));
    field.rotation.x = -Math.PI / 2;
    field.position.y = -0.03;
    scene.add(field);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(data.WORLD.groundRadius, 96),
      std(C.ground, 0.96, 0)
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const rim = new THREE.Mesh(new THREE.RingGeometry(data.WORLD.groundRadius - 1.2, data.WORLD.groundRadius, 96), std(C.rim, 0.96, 0));
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.004;
    scene.add(rim);

    const grid = new THREE.GridHelper(data.WORLD.groundRadius * 2, 44, 0xdde7f0, 0xdde7f0);
    grid.position.y = 0.006;
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    grid.material.depthWrite = false;
    scene.add(grid);

    /* the route the visitor is invited to walk, drawn as a strip under the plinths */
    const route = [data.WORLD.start].concat(data.STOPS.map(function (s) { return s.pos; }));
    scene.add(buildRibbon(route, 2.2));

    /* perimeter scenery */
    const treeSpots = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + 0.14;
      const r = data.WORLD.groundRadius + 6 + (i % 5) * 5.5;
      treeSpots.push([Math.cos(a) * r, Math.sin(a) * r, 1.0 + ((i * 37) % 70) / 100]);
    }
    treeSpots.forEach(function (t) {
      const tr = tree(t[2]);
      tr.position.set(t[0], 0, t[1]);
      tr.rotation.y = t[0] * 0.3;
      scene.add(tr);
    });

    /* stops */
    const stops = [];
    const pickTargets = [];
    data.STOPS.forEach(function (s, i) {
      const g = new THREE.Group();
      g.position.set(s.pos[0], 0, s.pos[1]);
      scene.add(g);

      const plinth = cyl(1.85, 1.95, 0.22, 40, C.plinth, 0, 0.11, 0, 0.9, 0.03);
      g.add(plinth);
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.52, 1.72, 40), new THREE.MeshBasicMaterial({ color: C.accent }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.225;
      g.add(ring);

      const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0),
        new THREE.MeshStandardMaterial({ color: C.accent, roughness: 0.35, metalness: 0.15, emissive: 0x1a4a8f, emissiveIntensity: 0.5 }));
      beacon.position.y = 1.35;
      beacon.castShadow = true;
      g.add(beacon);

      const shaft = cyl(0.05, 0.05, 1.0, 8, C.metal, 0, 0.72, 0, 0.5, 0.4);
      g.add(shaft);

      const halo = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 28), new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0.35 }));
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.23;
      g.add(halo);

      const lbl = labelSprite(s.label, 'Level ' + (i + 1));
      lbl.position.set(0, 2.75, 0);
      g.add(lbl);

      (s.props || []).forEach(function (name) {
        const fn = PROPS[name];
        if (!fn) return;
        const p = fn();
        p.rotation.y = (i * 0.7) % (Math.PI * 2);
        p.position.set(0, 0, -2.6);
        g.add(p);
      });

      const pick = new THREE.Mesh(new THREE.SphereGeometry(data.WORLD.reach, 12, 8),
        new THREE.MeshBasicMaterial({ visible: false }));
      pick.position.set(s.pos[0], 1.2, s.pos[1]);
      pick.userData.stopIndex = i;
      scene.add(pick);
      pickTargets.push(pick);

      stops.push({
        id: s.id, index: i, group: g, ring: ring, beacon: beacon, halo: halo,
        label: lbl, baseScale: lbl.scale.clone(),
        pos: new THREE.Vector3(s.pos[0], 0, s.pos[1]), visited: false
      });
    });

    let t = 0;
    const shadowTarget = new THREE.Vector3();

    function setVisited(index) {
      const st = stops[index];
      if (!st || st.visited) return;
      st.visited = true;
      st.ring.material.color.setHex(C.done);
      st.beacon.material.color.setHex(C.done);
      st.beacon.material.emissive.setHex(0x14432c);
      st.halo.material.color.setHex(C.done);
      st.beacon.scale.setScalar(0.72);
      st.label.scale.multiplyScalar(0.86);
    }

    function resetAll() {
      stops.forEach(function (st) {
        st.visited = false;
        st.ring.material.color.setHex(C.accent);
        st.beacon.material.color.setHex(C.accent);
        st.beacon.material.emissive.setHex(0x1a4a8f);
        st.halo.material.color.setHex(C.accent);
        st.beacon.scale.setScalar(1);
        st.label.scale.copy(st.baseScale);
      });
    }

    function update(dt, focusIndex) {
      t += dt;
      stops.forEach(function (st, i) {
        const active = i === focusIndex;
        const pulse = st.visited ? 0.03 : 0.10;
        st.beacon.rotation.y += dt * (st.visited ? 0.35 : 0.85);
        st.beacon.position.y = 1.35 + Math.sin(t * 1.4 + i) * (st.visited ? 0.04 : 0.13);
        const hs = 1 + Math.sin(t * 2.2 + i * 0.9) * pulse;
        st.halo.scale.set(hs, hs, hs);
        st.halo.material.opacity = st.visited ? 0.16 : 0.24 + 0.14 * Math.sin(t * 2.2 + i * 0.9);
        st.label.position.y = 2.75 + Math.sin(t * 1.1 + i) * 0.05;
        st.label.material.opacity = active ? 1 : (st.visited ? 0.62 : 0.9);
      });
    }

    /* keep the shadow frustum centred on the walker */
    function updateShadow(pos) {
      shadowTarget.copy(pos);
      key.position.set(pos.x + 14, 24, pos.z + 11);
      key.target.position.set(pos.x, 0, pos.z);
      key.target.updateMatrixWorld();
    }

    return {
      scene: scene,
      stops: stops,
      pickTargets: pickTargets,
      setVisited: setVisited,
      resetAll: resetAll,
      update: update,
      updateShadow: updateShadow,
      colors: C
    };
  }

  const api = { create: create, COLORS: C, labelSprite: labelSprite };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.PortfolioWorld = api;
})(typeof window !== 'undefined' ? window : globalThis);
