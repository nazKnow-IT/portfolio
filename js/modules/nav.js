/* ===========================================================================
   nav.js — primary navigation: built from config, scroll spy, mobile drawer,
   offset-aware smooth scrolling and the header's scrolled state.
   ========================================================================= */
(function (global) {
  'use strict';
  var App = global.App;

  function headerOffset() {
    var h = App.qs('#site-header');
    return (h ? h.offsetHeight : 64) + 10;
  }

  function scrollToSection(id, pushHash) {
    var target = document.getElementById(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top + global.pageYOffset - headerOffset();
    global.scrollTo({ top: Math.max(top, 0), behavior: App.reducedMotion() ? 'auto' : 'smooth' });
    if (pushHash !== false) {
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      else location.hash = id;
    }
    /* keep tab order honest: the heading receives focus after the jump */
    var heading = target.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      setTimeout(function () { heading.focus({ preventScroll: true }); }, App.reducedMotion() ? 0 : 420);
    }
  }
  App.scrollToSection = scrollToSection;

  function buildNav() {
    var list = App.qs('#nav-list');
    if (!list) return;
    var items = (App.config.nav || []).map(function (sec) {
      return App.el('li', null, [
        App.el('a', {
          class: 'nav-link',
          href: '#' + sec.id,
          text: sec.label,
          'data-section': sec.id,
          onclick: function (e) {
            e.preventDefault();
            closeDrawer();
            scrollToSection(sec.id);
          }
        })
      ]);
    });
    App.mount(list, items);
  }

  /* ------------------------------------------------------------- scroll spy */
  function initSpy() {
    var links = App.qsa('.nav-link');
    var sections = (App.config.nav || []).map(function (s) { return document.getElementById(s.id); })
      .filter(Boolean);
    if (!('IntersectionObserver' in global) || !sections.length) return;

    var visible = {};
    var pending = null;
    function render() {
      pending = null;
      var best = null, bestRatio = 0;
      sections.forEach(function (sec) {
        var r = visible[sec.id] || 0;
        if (r > bestRatio) { bestRatio = r; best = sec.id; }
      });
      if (!best) {
        /* nothing intersects (fast scroll past a long section): use position */
        var probe = global.pageYOffset + headerOffset() + 40;
        for (var i = sections.length - 1; i >= 0; i--) {
          if (sections[i].offsetTop <= probe) { best = sections[i].id; break; }
        }
        if (!best) best = sections[0].id;
      }
      links.forEach(function (a) {
        var on = a.dataset.section === best;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      if (pending === null) pending = global.requestAnimationFrame(render);
    }, { rootMargin: '-80px 0px -55% 0px', threshold: [0, .12, .35, .6, .9] });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* --------------------------------------------------------------- drawer */
  var toggle, drawer, open = false;
  function setDrawer(next) {
    open = next;
    if (!drawer || !toggle) return;
    drawer.classList.toggle('is-open', next);
    toggle.setAttribute('aria-expanded', next ? 'true' : 'false');
  }
  function closeDrawer() { setDrawer(false); }

  function initDrawer() {
    toggle = App.qs('#nav-toggle');
    drawer = App.qs('#main-nav');
    if (!toggle || !drawer) return;
    toggle.addEventListener('click', function () {
      var next = !open;
      setDrawer(next);
      if (next) {
        var first = drawer.querySelector('.nav-link');
        if (first) first.focus();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { setDrawer(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!open) return;
      if (drawer.contains(e.target) || toggle.contains(e.target)) return;
      setDrawer(false);
    });
    global.addEventListener('resize', App.debounce(function () {
      if (global.innerWidth > 900 && open) setDrawer(false);
    }, 160));
  }

  /* -------------------------------------------------------- misc chrome */
  function initHeaderState() {
    var header = App.qs('#site-header');
    if (!header) return;
    var onScroll = App.debounce(function () {
      header.classList.toggle('is-scrolled', global.pageYOffset > 6);
    }, 60);
    global.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initInPageLinks() {
    /* every in-page anchor outside the nav (hero buttons, footer) scrolls too */
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id || id.indexOf('/') === 0) return;               /* modal deep links belong to projects.js */
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      scrollToSection(id);
    });
  }

  function initBackToTop() {
    var btn = App.qs('#back-to-top');
    if (!btn) return;
    btn.addEventListener('click', function () {
      global.scrollTo({ top: 0, behavior: App.reducedMotion() ? 'auto' : 'smooth' });
      var brand = App.qs('.brand');
      if (brand) brand.focus();
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
  }

  App.initNav = function () {
    buildNav();
    initDrawer();
    initSpy();
    initHeaderState();
    initInPageLinks();
    initBackToTop();
    /* land on a section if the visitor arrived at #education etc. */
    var incoming = (location.hash || '').replace('#', '');
    if (incoming && incoming.indexOf('/') !== 0 && document.getElementById(incoming)) {
      setTimeout(function () { scrollToSection(incoming, false); }, 60);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
