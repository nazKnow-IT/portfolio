/* ===========================================================================
   util.js — shared DOM helpers and the derived data registries.
   Everything here is dependency-free; the site loads as plain scripts so it
   also works opened straight from the filesystem.
   ========================================================================= */
(function (global) {
  'use strict';

  var App = global.App || (global.App = {});

  /* --------------------------------------------------------------- helpers */
  App.qs = function (sel, root) { return (root || document).querySelector(sel); };
  App.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  App.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* el('li', {class:'x'}, ['a', el('b')]) — children arrays or plain strings */
  App.el = function (tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else node.setAttribute(k, v === true ? '' : String(v));
      });
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
      });
    }
    return node;
  };

  App.clear = function (node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; };
  App.mount = function (sel, nodes) {
    var host = typeof sel === 'string' ? App.qs(sel) : sel;
    if (!host) return null;
    App.clear(host);
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (n) { if (n) host.appendChild(n); });
    return host;
  };

  App.debounce = function (fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait || 140);
    };
  };

  App.reducedMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  App.isTouch = function () {
    return window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  };

  /* ------------------------------------------------------------- edit mode */
  App.isEdit = /[?&]edit=1(&|$)/.test(location.search);
  if (App.isEdit && document.body) document.body.dataset.edit = '1';

  App.verifyNote = function (text) {
    if (!text) return null;
    return App.el('p', { class: 'verify-note', text: text });
  };

  /* -------------------------------------------------- derived registries */
  var content = global.SiteContent || {};
  var projectData = global.SiteProjects || {};
  var config = global.SiteConfig || {};

  App.config = config;
  App.content = content;
  App.projects = projectData.PROJECTS || [];
  App.categories = {};
  (projectData.CATEGORIES || []).forEach(function (c) { App.categories[c.id] = c; });

  /* skills registry: declared skills + the few tools a project references that
     are not personal study items (three.js, NumPy) */
  App.skillMap = {};
  (content.SKILLS || []).concat(projectData.EXTRA_TECHS || []).forEach(function (s) {
    App.skillMap[s.id] = Object.assign({ usedIn: [], catLabel: '', hue: 'slate' }, s);
  });
  (content.SKILL_CATS || []).forEach(function (c) {
    (content.SKILLS || []).filter(function (s) { return s.cat === c.id; }).forEach(function (s) {
      if (App.skillMap[s.id]) { App.skillMap[s.id].catLabel = c.label; App.skillMap[s.id].hue = c.hue; }
    });
  });
  /* every project's tech list feeds back into the skill so the explorer can
     answer "which projects used this?" with no extra bookkeeping */
  App.projects.forEach(function (p) {
    (p.tech || []).forEach(function (id) {
      var skill = App.skillMap[id];
      if (!skill) {
        if (global.console) console.warn('[content] project "' + p.id + '" lists unknown tech id "' + id + '"');
        return;
      }
      if (skill.usedIn.indexOf(p.id) === -1) skill.usedIn.push(p.id);
    });
  });
  App.skillList = function () { return Object.keys(App.skillMap).map(function (k) { return App.skillMap[k]; }); };
  App.projectById = function (id) {
    var found = null;
    App.projects.forEach(function (p) { if (p.id === id) found = p; });
    return found;
  };

  /* category ids per project, resolved to labels + hues for chips */
  App.CAT_HUES = {
    personal: 'amber', academic: 'teal', web: 'cyan', mobile: 'violet',
    ai: 'rose', data: 'lime', other: 'slate', all: 'slate'
  };
  App.catChip = function (catId) {
    var cat = App.categories[catId] || { id: catId, label: catId };
    return App.el('span', { class: 'chip hue-' + (App.CAT_HUES[catId] || 'slate'), text: cat.label });
  };
  App.techChip = function (id, onClick) {
    var skill = App.skillMap[id];
    var label = skill ? skill.name : id;
    var hue = skill ? skill.hue : 'slate';
    var icon = App.iconSvg ? App.iconSvg(id, 'ico-sm') : null;
    var node = App.el('button', {
      type: 'button',
      class: 'chip chip-btn hue-' + hue,
      title: 'Show projects using ' + label
    }, [icon, document.createTextNode(label)]);
    if (typeof onClick === 'function') node.addEventListener('click', function () { onClick(id); });
    else node.addEventListener('click', function () { App.emit('tech:select', id); });
    return node;
  };

  /* ----------------------------------------------------------- event bus */
  var bus = {};
  App.on = function (evt, fn) { (bus[evt] || (bus[evt] = [])).push(fn); };
  App.emit = function (evt, detail) { (bus[evt] || []).forEach(function (fn) { fn(detail); }); };

  /* ------------------------------------------------------ focus management */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  App.trapFocus = function (container) {
    function onKey(e) {
      if (e.key !== 'Tab') return;
      var items = App.qsa(FOCUSABLE, container).filter(function (n) {
        return n.offsetParent !== null || n === document.activeElement;
      });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return function () { container.removeEventListener('keydown', onKey); };
  };

  /* ---------------------------------------------------------- link helpers
   * An empty URL never renders a clickable anchor: it becomes a dashed
   * "not linked yet" chip so the site cannot ship a dead or fake link.
   * ---------------------------------------------------------------------- */
  App.linkOrPlaceholder = function (opts) {
    var url = opts.url || '';
    var label = opts.label || 'Link';
    if (!url) {
      return App.el('span', {
        class: (opts.class || 'card-link') + (opts.emptyClass ? ' ' + opts.emptyClass : ''),
        'data-state': 'empty',
        text: opts.empty || (label + ' not linked yet'),
        /* where to fill the gap in is an authoring note, not visitor content */
        title: App.isEdit ? 'Add this URL in js/content/' + (opts.source || 'projects.data.js') : null
      });
    }
    var attrs = { href: url, class: opts.class || 'card-link', text: label };
    if (/^https?:/i.test(url) && opts.internal !== true) {
      attrs.target = '_blank';
      attrs.rel = 'noopener noreferrer';
    }
    return App.el(opts.tag || 'a', attrs);
  };

  App.iconFor = function (key) {
    return { email: '@', phone: '☎', linkedin: 'in', github: '</>', whatsapp: 'w', cv: '↓' }[key] || '↗';
  };
})(typeof window !== 'undefined' ? window : globalThis);
