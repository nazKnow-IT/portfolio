/* ===========================================================================
   showcase.js — the 3D slot. The game is a separate build living in /game;
   this module mounts it in an iframe on demand, keeps a poster/loading state
   for visitors who would rather not wake up their GPU, and offers fullscreen.
   Swapping in a different build means replacing the files in /game only.
   ========================================================================= */
(function (global) {
  'use strict';
  var App = global.App;

  var frame, poster, iframe, loaded = false;

  function cfg() { return App.config.showcase || {}; }

  function mount() {
    if (!iframe) return;
    if (loaded) return;
    loaded = true;
    poster.classList.add('is-loading');
    App.qs('#showcase-note').textContent = 'Starting WebGL scene…';
    iframe.src = cfg().src || 'game/index.html';
    iframe.hidden = false;
    iframe.addEventListener('load', function () {
      poster.classList.remove('is-loading');
      frame.classList.add('is-live');
      App.qs('#showcase-note').textContent = 'Running.';
    });
  }

  function reload() {
    if (!iframe || !loaded) { mount(); return; }
    poster.classList.add('is-loading');
    frame.classList.remove('is-live');
    App.qs('#showcase-note').textContent = 'Restarting world…';
    try { iframe.contentWindow.location.reload(); }
    catch (e) { iframe.src = cfg().src; }
    setTimeout(function () {
      poster.classList.remove('is-loading');
      frame.classList.add('is-live');
    }, 900);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      frame.requestFullscreen().catch(function () {
        App.qs('#showcase-note').textContent = 'Fullscreen was blocked — use “Open fullscreen” instead.';
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function buildLegend() {
    var host = App.qs('#showcase-controls');
    if (!host) return;
    App.mount(host, (cfg().controls || []).map(function (c) {
      return App.el('span', { class: 'k' }, [
        App.el('kbd', { text: c.keys }),
        document.createTextNode(c.what)
      ]);
    }));
  }

  App.initShowcase = function () {
    frame = App.qs('#showcase-frame');
    poster = App.qs('#showcase-poster');
    iframe = App.qs('#showcase-frame-el');
    if (!frame || !iframe) return;

    frame.style.setProperty('--showcase-h', (cfg().height || 620) + 'px');
    iframe.setAttribute('title', cfg().title || '3D portfolio showcase');
    var lede = App.qs('#showcase-lede');
    if (lede && cfg().blurb) lede.textContent = cfg().blurb;
    buildLegend();

    App.qs('#showcase-load').addEventListener('click', function () {
      mount();
      var btn = App.qs('#showcase-focus');
      if (btn) btn.hidden = false;
    });
    App.qs('#showcase-reload').addEventListener('click', reload);
    App.qs('#showcase-focus').addEventListener('click', function () {
      mount();
      iframe.focus();
      try { iframe.contentWindow.focus(); } catch (e) { /* cross-origin guard */ }
      App.qs('#showcase-note').textContent = 'Focused — WASD walks the character.';
    });

    /* desktop visitors get it automatically once it is in view; touch devices
       keep the explicit button so nothing burns the GPU unasked */
    var auto = !!global.matchMedia && global.matchMedia('(hover: hover)').matches
      && !App.reducedMotion();
    if (auto && 'IntersectionObserver' in global) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); mount(); }
      }, { rootMargin: '200px' });
      io.observe(frame);
    }

    document.addEventListener('fullscreenchange', function () {
      var on = document.fullscreenElement === frame;
      frame.classList.toggle('is-fullscreen', on);
      App.qs('#showcase-note').textContent = on ? 'Fullscreen — Esc to exit.' : 'Running.';
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
