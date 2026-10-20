/* The game: renderer bootstrap, walking simulation, checkpoint rules, save state. */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  const Data = global.PortfolioData;
  const WorldLib = global.PortfolioWorld;
  const AvatarLib = global.Avatar;
  const CamLib = global.PortfolioCam;
  const InputLib = global.PortfolioInput;
  const HUDLib = global.PortfolioHUD;

  const SAVE_KEY = 'nazeef.portfolio.v1';
  const TUNE = {
    walk: 2.7,
    dash: 4.5,
    accel: 13,
    yawRate: 9,
    plinthRadius: 2.15,
    reach: Data.WORLD.reach
  };

  function damp(cur, to, dt, rate) {
    return cur + (to - cur) * Math.min(1, dt * rate);
  }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function readSave() {
    try {
      const raw = global.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || o.v !== 1 || !Array.isArray(o.visited)) return null;
      return o;
    } catch (e) { return null; }
  }
  function writeSave(obj) {
    try { global.localStorage.setItem(SAVE_KEY, JSON.stringify(obj)); } catch (e) { /* private mode */ }
  }

  function boot() {
    const out = { ok: false, reason: '' };
    const stage = document.getElementById('viewport');
    if (!stage) { out.reason = 'no #viewport'; return out; }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (e) {
      out.reason = 'webgl-unavailable';
      return out;
    }
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    /* author colours in sRGB so the palette on screen is the palette in the code */
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    stage.appendChild(renderer.domElement);

    const world = WorldLib.create({ data: Data });
    const cam = new THREE.PerspectiveCamera(48, 1, 0.1, 400);

    const avatar = AvatarLib.create({ maxSpeed: TUNE.dash });
    world.scene.add(avatar.root);

    const pos = new THREE.Vector3(Data.WORLD.start[0], 0, Data.WORLD.start[1]);
    const vel = new THREE.Vector3();
    const follow = new THREE.Vector3();
    avatar.root.position.copy(pos);

    let heading = Math.atan2(0, -1);
    let turnRate = 0;
    let visited = [];
    let xp = 0;
    let autoTarget = -1;
    let tourMode = false;
    let cardOpen = false;
    let paused = false;

    const rig = CamLib.create(cam, { focusY: 1.15, pitch: 0.36, dist: 8.4 });
    /* open looking down the path toward the first beacon, not at the rim */
    const toFirst = { x: Data.STOPS[0].pos[0] - pos.x, z: Data.STOPS[0].pos[1] - pos.z };
    heading = Math.atan2(toFirst.x, toFirst.z);
    rig.face(toFirst.x, toFirst.z);

    function level() { return Math.floor(xp / Data.XP_PER_LEVEL) + 1; }
    function xpInLevel() { return xp % Data.XP_PER_LEVEL; }
    function isVisited(id) { return visited.indexOf(id) >= 0; }
    function nextUnvisited(from) {
      for (let i = (from === undefined ? 0 : from); i < Data.STOPS.length; i++) {
        if (!isVisited(Data.STOPS[i].id)) return i;
      }
      return -1;
    }

    const hud = HUDLib.create({
      data: Data,
      on: {
        onClose: function () { dismissCard(); },
        onNext: function () {
          dismissCard();
          const n = nextUnvisited();
          if (n >= 0) { tourMode = true; autoTarget = n; hud.setHint('Tour running — the character will walk the route'); }
          else { hud.toast('Run complete', 'Every checkpoint visited', 'done'); }
        },
        onPad: function (dir, on) { input.setPad(dir, on); autoTarget = -1; },
        onTour: function () { startTour(); },
        onPage: function () { setMode('page'); },
        onReset: function () { resetRun(); },
        onFull: function () { toggleFullscreen(); }
      }
    });

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const input = InputLib.create(renderer.domElement, {
      onTap: function (x, y) { pick(x, y); },
      onOrbit: function (dx, dy) { rig.orbit(dx, dy); },
      onZoom: function (d) { rig.zoom(d); },
      onDragState: function (on) { rig.setDragging(on); },
      onEscape: function () { if (cardOpen) dismissCard(); },
      onTour: function () { startTour(); },
      onPage: function () { setMode('page'); },
      onFullscreen: function () { toggleFullscreen(); },
      onJump: function (i) { if (i < Data.STOPS.length) walkTo(i, true); }
    });

    function pick(x, y) {
      ndc.set(x, y);
      ray.setFromCamera(ndc, cam);
      const hit = ray.intersectObjects(world.pickTargets, false);
      if (hit.length) {
        const i = hit[0].object.userData.stopIndex;
        if (cardOpen && i === hud.currentCard()) return;
        walkTo(i, true);
      }
    }

    function walkTo(i, cancelCard) {
      if (cancelCard && cardOpen) dismissCard();
      autoTarget = i;
      tourMode = false;
    }

    function startTour() {
      const n = nextUnvisited();
      if (n < 0) { hud.toast('Already visited every stop', 'Reset the run to replay it', 'muted'); return; }
      tourMode = true;
      autoTarget = n;
      if (cardOpen) dismissCard();
      hud.setHint('Tour running — press Esc or walk to take over');
    }

    function award(i) {
      const stop = Data.STOPS[i];
      visited.push(stop.id);
      xp += stop.xp;
      world.setVisited(i);
      const added = hud.addSkills(stop.unlocks, true);
      hud.pulseXP();
      refreshLevel();
      avatar.celebrate();
      hud.toast('Checkpoint reached · ' + stop.label, '+' + stop.xp + ' XP', 'xp');
      if (added) {
        window.setTimeout(function () {
          hud.toast('+' + added + ' added to your skill inventory',
            stop.unlocks.map(function (u) { return u.label; }).slice(0, 3).join(' · ') +
            (stop.unlocks.length > 3 ? ' …' : ''), 'skill');
        }, 620);
      }
      (stop.unlocks || []).filter(function (u) { return u.cat === 'badge'; }).forEach(function (u, k) {
        window.setTimeout(function () { hud.toast('Badge unlocked', u.label, 'badge'); }, 1250 + k * 260);
      });
      writeSave({ v: 1, visited: visited, mode: mode });
      cardOpen = true;
      hud.openCard(i, stop, stop.unlocks, nextUnvisited() >= 0);
      document.body.classList.add('card-open');
      refreshHint();
    }

    function dismissCard() {
      if (!cardOpen) return;
      cardOpen = false;
      hud.closeCard();
      document.body.classList.remove('card-open');
      if (tourMode) {
        const n = nextUnvisited();
        if (n >= 0) autoTarget = n;
        else { tourMode = false; hud.toast('Tour complete', 'All ' + Data.STOPS.length + ' stops visited', 'done'); }
      }
      refreshHint();
    }

    function refreshLevel() {
      const done = visited.length >= Data.STOPS.length;
      hud.setLevel(done ? 'MAX' : level(), done ? xp : xpInLevel(), Data.XP_PER_LEVEL, visited.length, Data.STOPS.length);
    }

    function refreshHint() {
      const left = Data.STOPS.length - visited.length;
      if (!left) { hud.setHint('All checkpoints cleared — press P for the readable version'); return; }
      if (tourMode) { hud.setHint('Tour running — press Esc or walk to take over'); return; }
      hud.setHint('Walk with WASD · tap a beacon · press 1–7 to head for a stop · ' + left + ' left');
    }

    let mode = 'game';
    function setMode(next) {
      mode = next;
      document.body.setAttribute('data-mode', next);
      paused = next !== 'game';
      writeSave({ v: 1, visited: visited, mode: mode });
      if (next === 'page' && global.PortfolioPage) global.PortfolioPage.render();
      if (next === 'game') { clock.getDelta(); }
    }

    function toggleFullscreen() {
      const host = document.getElementById('game');
      if (!document.fullscreenElement && host && host.requestFullscreen) {
        host.requestFullscreen().catch(function () { hud.toast('Fullscreen blocked', 'Use your browser menu instead', 'muted'); });
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(function () { /* ignore */ });
      }
    }

    function resetRun() {
      visited = [];
      xp = 0;
      autoTarget = -1;
      tourMode = false;
      if (cardOpen) dismissCard();
      world.resetAll();
      hud.restore([]);
      pos.set(Data.WORLD.start[0], 0, Data.WORLD.start[1]);
      vel.set(0, 0, 0);
      avatar.root.position.copy(pos);
      rig.snap(pos);
      refreshLevel();
      refreshHint();
      writeSave({ v: 1, visited: visited, mode: mode });
      hud.toast('Run reset', 'Start walking again', 'muted');
    }

    function restoreFromSave(save) {
      if (!save) return false;
      let applied = 0;
      save.visited.forEach(function (id) {
        const i = Data.STOPS.map(function (s) { return s.id; }).indexOf(id);
        if (i < 0) return;
        xp += Data.STOPS[i].xp;
        world.setVisited(i);
        applied += 1;
      });
      const lists = Data.STOPS.filter(function (s) { return save.visited.indexOf(s.id) >= 0; })
        .map(function (s) { return s.unlocks; });
      hud.restore(lists);
      visited = Data.STOPS.filter(function (s) { return save.visited.indexOf(s.id) >= 0; })
        .map(function (s) { return s.id; });
      refreshLevel();
      if (applied) hud.toast('Welcome back', applied + ' of ' + Data.STOPS.length + ' stops already visited', 'muted');
      return applied > 0;
    }

    /* ---------------- simulation ---------------- */
    const stepVec = new THREE.Vector3();

    function steer(dt) {
      const axes = rig.axes();
      const ax = input.axis();
      let wantX = 0, wantZ = 0, wantSpeed = 0;

      if (autoTarget >= 0) {
        const t = world.stops[autoTarget].pos;
        const dx = t.x - pos.x, dz = t.z - pos.z;
        const d = Math.hypot(dx, dz);
        if (d < TUNE.reach * 0.95) {
          if (!isVisited(Data.STOPS[autoTarget].id)) award(autoTarget);
          autoTarget = -1;
        } else {
          wantX = dx / d;
          wantZ = dz / d;
          wantSpeed = tourMode ? TUNE.walk : TUNE.dash;
        }
      }

      const manual = Math.abs(ax.x) + Math.abs(ax.y);
      if (manual > 0.05) {
        autoTarget = -1;
        tourMode = false;
        wantX = axes.forward.x * ax.y + axes.right.x * ax.x;
        wantZ = axes.forward.z * ax.y + axes.right.z * ax.x;
        const l = Math.hypot(wantX, wantZ);
        if (l > 0) { wantX /= l; wantZ /= l; }
        wantSpeed = (ax.dash ? TUNE.dash : TUNE.walk) * Math.min(1, l);
      }

      if (cardOpen || paused) { wantSpeed = 0; wantX = 0; wantZ = 0; }

      vel.x = damp(vel.x, wantX * wantSpeed, dt, TUNE.accel);
      vel.z = damp(vel.z, wantZ * wantSpeed, dt, TUNE.accel);
      if (Math.abs(vel.x) < 0.01) vel.x = 0;
      if (Math.abs(vel.z) < 0.01) vel.z = 0;

      pos.x += vel.x * dt;
      pos.z += vel.z * dt;

      /* stay on the plaza */
      const r = Math.hypot(pos.x, pos.z);
      if (r > Data.WORLD.walkRadius) {
        const k = Data.WORLD.walkRadius / r;
        pos.x *= k;
        pos.z *= k;
      }
      /* walk around the plinths instead of through them */
      world.stops.forEach(function (st) {
        const dx = pos.x - st.pos.x, dz = pos.z - st.pos.z;
        const d = Math.hypot(dx, dz);
        if (d > 1e-5 && d < TUNE.plinthRadius) {
          const push = TUNE.plinthRadius - d;
          pos.x += (dx / d) * push;
          pos.z += (dz / d) * push;
        }
      });

      const speed = Math.hypot(vel.x, vel.z);
      if (speed > 0.2) {
        let d = Math.atan2(vel.x, vel.z) - heading;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        heading += d * Math.min(1, dt * TUNE.yawRate);
        turnRate = d;
      } else {
        turnRate = damp(turnRate, 0, dt, 8);
      }

      avatar.root.position.copy(pos);
      avatar.root.rotation.y = heading;
      avatar.step(dt, speed, clamp(turnRate, -1.4, 1.4) * 2.2);

      follow.copy(pos);
      rig.update(dt, follow, heading, speed > 0.6);
      world.updateShadow(pos);

      if (!cardOpen) {
        for (let i = 0; i < world.stops.length; i++) {
          if (isVisited(Data.STOPS[i].id)) continue;
          stepVec.set(pos.x - world.stops[i].pos.x, 0, pos.z - world.stops[i].pos.z);
          if (stepVec.length() < TUNE.reach) { award(i); break; }
        }
      }
    }

    /* ---------------- sizing and the loop ---------------- */
    let w = 0, h = 0;
    function resize() {
      const rect = stage.getBoundingClientRect();
      const cw = Math.max(1, Math.round(rect.width));
      const ch = Math.max(1, Math.round(rect.height));
      if (cw === w && ch === h) return;
      w = cw; h = ch;
      renderer.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }

    const clock = new THREE.Clock();

    function frame() {
      global.requestAnimationFrame(frame);
      if (paused) return;
      const dt = Math.min(0.05, clock.getDelta());
      resize();
      steer(dt);
      world.update(dt, cardOpen ? hud.currentCard() : -1);
      renderer.render(world.scene, cam);
    }

    /* ---------------- go ---------------- */
    resize();
    rig.snap(pos);
    renderer.render(world.scene, cam);

    const save = readSave();
    const wantPage = save && save.mode === 'page';
    const reducedMotion = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (save) restoreFromSave(save);
    refreshLevel();
    if (wantPage || reducedMotion) {
      setMode('page');
    } else {
      setMode('game');
      if (!visited.length) hud.toast('Drag to look around, WASD to walk', 'Head for the first beacon', 'muted');
      refreshHint();
    }

    global.requestAnimationFrame(frame);

    out.ok = true;
    out.api = {
      state: function () {
        return {
          pos: { x: pos.x, z: pos.z }, speed: Math.hypot(vel.x, vel.z), heading: heading,
          visited: visited.slice(), xp: xp, level: level(), autoTarget: autoTarget,
          cardOpen: cardOpen, mode: mode, skills: hud.skillCount()
        };
      },
      steer: steer,
      walkTo: function (i) { walkTo(i, true); },
      award: award,
      dismiss: dismissCard,
      startTour: startTour,
      reset: resetRun,
      setMode: setMode,
      renderer: renderer,
      world: world,
      avatar: avatar,
      rig: rig,
      input: input,
      hud: hud
    };
    Object.assign(api, out.api);
    return out;
  }

  const api = { boot: boot, SAVE_KEY: SAVE_KEY, TUNE: TUNE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.PortfolioGame = api;
})(typeof window !== 'undefined' ? window : globalThis);
