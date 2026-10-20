/* Procedural low-poly character: a transform hierarchy driven by a hand-written gait.
   No animation clips, no external model — the walk is trigonometry on pivots. */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE) throw new Error('avatar.js needs three.js loaded first');

  const TWO_PI = Math.PI * 2;
  /* A limb hangs along -Y, so a negative rotation about X tips it toward +Z (the facing way). */
  const AHEAD = -1;

  const LOOK = {
    skin: 0xd9a06b,
    hair: 0x241d19,
    top: 0x2f4d7b,      /* hoodie */
    trim: 0x4d7bb5,     /* hood and cuffs */
    legs: 0x2b333d,
    shoe: 0xf4f6f8,
    sole: 0x8c97a3,
    pack: 0xd98a3c,
    eye: 0x1b2430
  };

  const H = {
    hip: 0.88,
    thigh: 0.42,
    shin: 0.40,
    shoulderY: 0.42,
    neckY: 0.50,
    headY: 0.58,
    upperArm: 0.30,
    forearm: 0.28,
    total: 1.72
  };

  function makeMats(look) {
    const mats = {};
    Object.keys(look).forEach(function (k) {
      mats[k] = new THREE.MeshStandardMaterial({
        color: look[k], roughness: 0.74, metalness: 0.0, flatShading: true
      });
    });
    return mats;
  }

  function build(look) {
    const mats = makeMats(look);

    function part(geo, matKey, x, y, z) {
      const m = new THREE.Mesh(geo, mats[matKey]);
      m.position.set(x || 0, y || 0, z || 0);
      m.castShadow = true;
      m.receiveShadow = false;
      return m;
    }
    function box(w, h, d, matKey, x, y, z) {
      return part(new THREE.BoxGeometry(w, h, d), matKey, x, y, z);
    }
    /* Limb cylinder with its pivot at the top end, so the parent joint rotates it cleanly. */
    function limb(len, rTop, rBot, matKey) {
      const g = new THREE.CylinderGeometry(rTop, rBot, len, 8, 1);
      g.translate(0, -len / 2, 0);
      return part(g, matKey, 0, 0, 0);
    }

    const root = new THREE.Group();
    const bob = new THREE.Group();
    root.add(bob);

    const hips = new THREE.Group();
    hips.position.y = H.hip;
    bob.add(hips);
    hips.add(box(0.30, 0.18, 0.21, 'legs', 0, 0.03, 0));

    const spine = new THREE.Group();
    hips.add(spine);
    spine.add(box(0.36, 0.46, 0.23, 'top', 0, 0.25, 0));            /* torso */
    spine.add(box(0.37, 0.09, 0.24, 'trim', 0, 0.465, 0));          /* collar */
    spine.add(box(0.24, 0.15, 0.13, 'trim', 0, 0.44, -0.145));      /* hood bunched behind neck */
    spine.add(box(0.30, 0.34, 0.15, 'pack', 0, 0.27, -0.19));       /* backpack */
    spine.add(box(0.20, 0.06, 0.16, 'sole', 0, 0.40, -0.19));       /* pack flap */

    const neck = new THREE.Group();
    neck.position.y = H.neckY;
    spine.add(neck);
    neck.add(limb(0.08, 0.06, 0.065, 'skin'));

    const head = new THREE.Group();
    head.position.y = 0.08;
    neck.add(head);
    head.add(box(0.255, 0.275, 0.235, 'skin', 0, 0.135, 0));
    head.add(box(0.275, 0.075, 0.255, 'hair', 0, 0.275, -0.005));   /* hair cap */
    head.add(box(0.275, 0.20, 0.06, 'hair', 0, 0.155, -0.135));     /* hair back */
    head.add(box(0.045, 0.055, 0.03, 'eye', -0.062, 0.15, 0.118));
    head.add(box(0.045, 0.055, 0.03, 'eye', 0.062, 0.15, 0.118));

    function arm(side) {
      const s = side === 'L' ? -1 : 1;
      const shoulder = new THREE.Group();
      shoulder.position.set(s * 0.215, H.shoulderY, 0);
      spine.add(shoulder);
      shoulder.add(box(0.115, 0.11, 0.12, 'top', 0, -0.03, 0));     /* shoulder pad */
      shoulder.add(limb(H.upperArm, 0.062, 0.055, 'top'));
      const elbow = new THREE.Group();
      elbow.position.y = -H.upperArm;
      shoulder.add(elbow);
      elbow.add(limb(H.forearm, 0.052, 0.045, 'top'));
      elbow.add(box(0.095, 0.045, 0.095, 'trim', 0, -H.forearm + 0.02, 0)); /* cuff */
      const hand = new THREE.Group();
      hand.position.y = -H.forearm;
      elbow.add(hand);
      hand.add(box(0.078, 0.10, 0.078, 'skin', 0, -0.045, 0));
      return { shoulder: shoulder, elbow: elbow, hand: hand };
    }

    function leg(side) {
      const s = side === 'L' ? -1 : 1;
      const hipJoint = new THREE.Group();
      hipJoint.position.set(s * 0.105, 0, 0);
      hips.add(hipJoint);
      hipJoint.add(limb(H.thigh, 0.085, 0.072, 'legs'));
      const knee = new THREE.Group();
      knee.position.y = -H.thigh;
      hipJoint.add(knee);
      knee.add(limb(H.shin, 0.068, 0.05, 'legs'));
      const ankle = new THREE.Group();
      ankle.position.y = -H.shin;
      knee.add(ankle);
      ankle.add(box(0.105, 0.075, 0.245, 'shoe', 0, -0.019, 0.045));
      ankle.add(box(0.108, 0.028, 0.25, 'sole', 0, -0.046, 0.045));
      return { hipJoint: hipJoint, knee: knee, ankle: ankle };
    }

    return {
      root: root,
      bob: bob,
      hips: hips,
      spine: spine,
      neck: neck,
      head: head,
      armL: arm('L'),
      armR: arm('R'),
      legL: leg('L'),
      legR: leg('R'),
      mats: mats
    };
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(v, a, b) {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function create(opts) {
    const o = opts || {};
    const cfg = {
      look: Object.assign({}, LOOK, o.look || {}),
      maxSpeed: o.maxSpeed === undefined ? 3.0 : o.maxSpeed
    };
    const rig = build(cfg.look);

    let speed = 0;          /* smoothed 0..1 */
    let target = 0;
    let turn = 0;           /* smoothed yaw rate, rad/s */
    let lean = 0;
    let phase = 0;
    let clock = 0;
    let cel = 0;            /* celebrate timer, counts down */

    const jointTargets = {
      thighL: 0, thighR: 0, shinL: 0, shinR: 0,
      armL: 0, armR: 0, elbowL: 0, elbowR: 0
    };

    function damp(cur, to, dt, rate) {
      return cur + (to - cur) * clamp(dt * rate, 0, 1);
    }

    function step(dt, groundSpeed, yawRate) {
      clock += dt;
      target = clamp(groundSpeed / cfg.maxSpeed, 0, 1);
      speed = damp(speed, target, dt, 9);
      turn = damp(turn, yawRate || 0, dt, 11);
      lean = damp(lean, clamp(turn, -1.4, 1.4), dt, 8);

      const gait = smooth(speed, 0.02, 0.28);            /* fade the walk in from a standstill */
      if (speed > 0.012) phase += dt * TWO_PI * (0.30 + 0.78 * speed);
      const sw = Math.sin(phase);
      const sw2 = Math.sin(phase + Math.PI);
      const lift = Math.max(0, Math.cos(phase));

      /* legs: thighs swing in opposition, knees only ever bend backwards */
      jointTargets.thighL = AHEAD * 0.62 * sw * gait;
      jointTargets.thighR = AHEAD * 0.62 * sw2 * gait;
      jointTargets.shinL = (0.22 + 0.66 * Math.max(0, -sw)) * gait;
      jointTargets.shinR = (0.22 + 0.66 * Math.max(0, -sw2)) * gait;

      /* arms counter the legs, elbows keep a running bend */
      jointTargets.armL = AHEAD * 0.50 * sw2 * gait;
      jointTargets.armR = AHEAD * 0.50 * sw * gait;
      jointTargets.elbowL = (0.42 + 0.30 * lift) * gait + 0.10;
      jointTargets.elbowR = (0.42 + 0.30 * lift) * gait + 0.10;

      rig.legL.hipJoint.rotation.x = damp(rig.legL.hipJoint.rotation.x, jointTargets.thighL, dt, 16);
      rig.legR.hipJoint.rotation.x = damp(rig.legR.hipJoint.rotation.x, jointTargets.thighR, dt, 16);
      rig.legL.knee.rotation.x = damp(rig.legL.knee.rotation.x, jointTargets.shinL, dt, 16);
      rig.legR.knee.rotation.x = damp(rig.legR.knee.rotation.x, jointTargets.shinR, dt, 16);
      rig.armL.shoulder.rotation.x = damp(rig.armL.shoulder.rotation.x, jointTargets.armL, dt, 15);
      rig.armR.shoulder.rotation.x = damp(rig.armR.shoulder.rotation.x, jointTargets.armR, dt, 15);
      rig.armL.elbow.rotation.x = damp(rig.armL.elbow.rotation.x, jointTargets.elbowL, dt, 15);
      rig.armR.elbow.rotation.x = damp(rig.armR.elbow.rotation.x, jointTargets.elbowR, dt, 15);

      /* torso: forward lean with pace, counter-yaw with the stride, vertical bob at 2x.
         liftG keeps the trailing foot off the ground while the body bobs and leans. */
      const liftG = 0.012 * gait + 0.020 * Math.min(1, Math.abs(lean));
      rig.spine.rotation.x = AHEAD * (0.055 * speed + 0.02 * Math.sin(clock * 1.7) * (1 - gait));
      rig.spine.rotation.y = 0.085 * sw * gait;
      rig.bob.position.y = liftG + 0.036 * Math.cos(phase * 2) * gait
        + (1 - gait) * 0.012 * Math.sin(clock * 1.5);
      rig.hips.rotation.z = 0.035 * sw * gait;
      rig.root.rotation.z = -clamp(lean, -1.2, 1.2) * 0.075;

      /* head trails the turn a beat then looks where the character is going */
      rig.head.rotation.y = clamp(-turn, -1.2, 1.2) * 0.20 + 0.05 * Math.sin(clock * 0.9) * (1 - gait);
      rig.head.rotation.x = -0.05 * speed + 0.03 * Math.sin(clock * 1.3) * (1 - gait);

      /* idle: slow look-around so the character never freezes like a statue */
      if (gait < 0.05) {
        rig.armL.shoulder.rotation.z = 0.06 + 0.03 * Math.sin(clock * 1.1);
        rig.armR.shoulder.rotation.z = -0.06 - 0.03 * Math.sin(clock * 1.1 + 0.6);
      } else {
        rig.armL.shoulder.rotation.z = damp(rig.armL.shoulder.rotation.z, 0.09, dt, 8);
        rig.armR.shoulder.rotation.z = damp(rig.armR.shoulder.rotation.z, -0.09, dt, 8);
      }

      if (cel > 0) {
        cel = Math.max(0, cel - dt);
        const e = cel / 0.85;                       /* 1 -> 0 */
        const arc = Math.sin(Math.PI * (1 - e));
        rig.bob.position.y += 0.42 * arc;
        rig.armL.shoulder.rotation.x = AHEAD * 2.3 * arc;
        rig.armR.shoulder.rotation.x = AHEAD * 2.3 * arc;
        rig.armL.elbow.rotation.x = 0.5 * arc;
        rig.armR.elbow.rotation.x = 0.5 * arc;
        rig.spine.rotation.x = AHEAD * 0.10 * arc;
      }
    }

    function facingFromVelocity(vx, vz) {
      return Math.atan2(vx, vz);
    }

    return {
      root: rig.root,
      head: rig.head,
      height: H.total,
      maxSpeed: cfg.maxSpeed,
      step: step,
      facingFromVelocity: facingFromVelocity,
      celebrate: function () { cel = 0.85; },
      isCelebrating: function () { return cel > 0; },
      speed01: function () { return speed; },
      phase: function () { return phase; },
      setLookColor: function (key, hex) {
        if (rig.mats[key]) rig.mats[key].color.setHex(hex);
      }
    };
  }

  const api = { create: create, LOOK: LOOK, HEIGHT: H.total };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Avatar = api;
})(typeof window !== 'undefined' ? window : globalThis);
