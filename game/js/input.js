/* Input: keyboard walking, touch D-pad, drag-to-orbit, tap-to-pick, wheel zoom. */
(function (global) {
  'use strict';

  const KEY_MAP = {
    KeyW: 'f', ArrowUp: 'f',
    KeyS: 'b', ArrowDown: 'b',
    KeyA: 'l', ArrowLeft: 'l',
    KeyD: 'r', ArrowRight: 'r'
  };

  function create(el, handlers) {
    const h = handlers || {};
    const held = Object.create(null);
    const pad = Object.create(null);
    let dash = false;
    let pointer = null;

    function fire(name, a, b) {
      if (h[name]) h[name](a, b);
    }

    function editable(t) {
      if (!t || !t.tagName) return false;
      const n = t.tagName.toLowerCase();
      return n === 'input' || n === 'textarea' || n === 'select' || t.isContentEditable === true;
    }

    function onKeyDown(e) {
      if (editable(e.target)) return;
      const m = KEY_MAP[e.code];
      if (m) {
        held[m] = true;
        dash = e.shiftKey || dash;
        if (e.code.indexOf('Arrow') === 0) e.preventDefault();
        return;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { dash = true; return; }
      if (e.key === 'Escape') { fire('onEscape'); return; }
      const k = (e.key || '').toLowerCase();
      if (k === 't') { fire('onTour'); return; }
      if (k === 'p') { fire('onPage'); return; }
      if (k === 'f') { fire('onFullscreen'); return; }
      const n = parseInt(e.key, 10);
      if (!isNaN(n) && n >= 1 && n <= 9) fire('onJump', n - 1);
    }

    function onKeyUp(e) {
      const m = KEY_MAP[e.code];
      if (m) held[m] = false;
      if (e.key === 'ShiftLeft' || e.key === 'ShiftRight') dash = false;
    }

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointer = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: Date.now(), id: e.pointerId, moved: false };
      if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ } }
      fire('onDragState', true);
    }

    function onPointerMove(e) {
      if (!pointer || e.pointerId !== pointer.id) return;
      const dx = e.clientX - pointer.x;
      const dy = e.clientY - pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pointer.moved && Math.hypot(e.clientX - pointer.sx, e.clientY - pointer.sy) > 7) pointer.moved = true;
      if (pointer.moved) fire('onOrbit', dx, dy);
    }

    function onPointerUp(e) {
      if (!pointer || e.pointerId !== pointer.id) return;
      const quick = Date.now() - pointer.t < 500;
      if (!pointer.moved && quick) {
        const r = el.getBoundingClientRect();
        fire('onTap', ((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      }
      pointer = null;
      fire('onDragState', false);
    }

    function onWheel(e) {
      e.preventDefault();
      fire('onZoom', e.deltaY);
    }

    el.addEventListener('pointerdown', onPointerDown);
    global.addEventListener('pointermove', onPointerMove);
    global.addEventListener('pointerup', onPointerUp);
    global.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    global.addEventListener('keydown', onKeyDown);
    global.addEventListener('keyup', onKeyUp);
    global.addEventListener('blur', function () {
      Object.keys(held).forEach(function (k) { held[k] = false; });
      Object.keys(pad).forEach(function (k) { pad[k] = false; });
      dash = false;
    });

    return {
      /* returns -1..1 on both axes; y is forward */
      axis: function () {
        let x = (held.r ? 1 : 0) - (held.l ? 1 : 0) + (pad.r ? 1 : 0) - (pad.l ? 1 : 0);
        let y = (held.f ? 1 : 0) - (held.b ? 1 : 0) + (pad.f ? 1 : 0) - (pad.b ? 1 : 0);
        x = Math.max(-1, Math.min(1, x));
        y = Math.max(-1, Math.min(1, y));
        return { x: x, y: y, dash: dash };
      },
      setPad: function (dir, on) { pad[dir] = !!on; },
      isDragging: function () { return pointer !== null && pointer.moved; },
      dispose: function () {
        el.removeEventListener('pointerdown', onPointerDown);
        global.removeEventListener('pointermove', onPointerMove);
        global.removeEventListener('pointerup', onPointerUp);
        global.removeEventListener('pointercancel', onPointerUp);
        el.removeEventListener('wheel', onWheel);
        global.removeEventListener('keydown', onKeyDown);
        global.removeEventListener('keyup', onKeyUp);
      }
    };
  }

  const api = { create: create, KEY_MAP: KEY_MAP };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.PortfolioInput = api;
})(typeof window !== 'undefined' ? window : globalThis);
