/* Third-person follow camera: spherical rig around the walker, drag to orbit, wheel to zoom. */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE) throw new Error('camera.js needs three.js loaded first');

  const LIM = {
    pitchMin: 0.16,
    pitchMax: 1.12,
    distMin: 4.2,
    distMax: 15,
    heightMin: 0.75,
    /* how eagerly the camera swings behind the walking direction */
    autoYawRate: 1.15,
    posRate: 7.0
  };

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function angleDelta(a, b) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function create(camera, opts) {
    const o = opts || {};
    const focusY = o.focusY === undefined ? 1.15 : o.focusY;
    let yaw = o.yaw === undefined ? Math.PI : o.yaw;
    let pitch = o.pitch === undefined ? 0.38 : o.pitch;
    let dist = o.dist === undefined ? 8.2 : o.dist;
    let wantDist = dist;
    let dragging = false;
    const focus = new THREE.Vector3();
    const desired = new THREE.Vector3();
    const offset = new THREE.Vector3();

    function apply() {
      camera.position.copy(desired);
      camera.lookAt(focus.x, focus.y + focusY, focus.z);
    }

    /* spherical offset for the current yaw/pitch/dist */
    function place(target) {
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      offset.set(Math.sin(yaw) * cp * dist, sp * dist, Math.cos(yaw) * cp * dist);
      desired.set(target.x + offset.x, Math.max(LIM.heightMin, target.y + offset.y), target.z + offset.z);
    }

    return {
      orbit: function (dx, dy) {
        yaw -= dx * 0.0055;
        pitch = clamp(pitch + dy * 0.004, LIM.pitchMin, LIM.pitchMax);
      },
      zoom: function (delta) {
        wantDist = clamp(wantDist + delta * 0.0075, LIM.distMin, LIM.distMax);
      },
      setDragging: function (on) { dragging = on; },
      /* aim the camera so that "forward" points along (dx, dz) on the ground */
      face: function (dx, dz) {
        if (Math.hypot(dx, dz) < 1e-5) return;
        yaw = Math.atan2(-dx, -dz);
      },
      update: function (dt, target, heading, moving) {
        /* swing behind the walker unless the visitor is dragging to look around */
        if (!dragging && moving) {
          const d = angleDelta(yaw, heading + Math.PI);
          if (Math.abs(d) >= 0.02) yaw += d * Math.min(1, LIM.autoYawRate * dt);
        }
        dist += (wantDist - dist) * Math.min(1, dt * 6);
        place(target);
        focus.lerp(target, Math.min(1, dt * LIM.posRate));
        apply();
      },
      snap: function (target) {
        focus.copy(target);
        place(target);
        apply();
      },
      state: function () {
        return { yaw: yaw, pitch: pitch, dist: dist, dragging: dragging };
      },
      /* camera-relative movement basis, flattened to the ground plane */
      axes: function () {
        const s = Math.sin(yaw), c = Math.cos(yaw);
        return {
          forward: { x: -s, z: -c },
          right: { x: c, z: -s }
        };
      }
    };
  }

  const api = { create: create, LIMITS: LIM };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.PortfolioCam = api;
})(typeof window !== 'undefined' ? window : globalThis);
