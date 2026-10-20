/* ===========================================================================
   projects.js — gallery rendering, category filters, search, the detail
   dialog with deep links, the screenshot/diagram lightbox and the print sheet.
   Content comes only from js/content/projects.data.js.
   ========================================================================= */
(function (global) {
  'use strict';
  var App = global.App;

  var state = { cat: 'all', q: '' };
  var grid, countNode, emptyNode, emptyMsg, filterHost;
  var modal, modalShell, modalBody, lastFocus = null, releaseTrap = null;
  var lightbox, lbList = [], lbIndex = 0, lbLastFocus = null;

  /* ------------------------------------------------------------- matching */
  function haystackOf(p) {
    var parts = [p.title, p.subtitle, p.summary, p.status, p.role];
    parts = parts.concat(p.overview || [], p.objectives || [], p.features || []);
    parts = parts.concat((p.categories || []).map(function (c) { return (App.categories[c] || {}).label || c; }));
    parts = parts.concat((p.tech || []).map(function (t) {
      var s = App.skillMap[t];
      return s ? (s.name + ' ' + (s.blurb || '')) : t;
    }));
    return parts.join(' \u0001 ').toLowerCase();
  }
  var HAYSTACK = {};
  App.projects.forEach(function (p) { HAYSTACK[p.id] = haystackOf(p); });

  function matches(p) {
    if (state.cat !== 'all' && (p.categories || []).indexOf(state.cat) === -1) return false;
    if (!state.q) return true;
    var q = state.q.toLowerCase();
    return q.split(/\s+/).every(function (term) { return HAYSTACK[p.id].indexOf(term) !== -1; });
  }

  function visibleProjects() { return App.projects.filter(matches); }

  /* --------------------------------------------------------------- filters */
  function buildFilters() {
    var cats = (global.SiteProjects.CATEGORIES || []);
    var nodes = cats.map(function (c) {
      var n = c.id === 'all' ? App.projects.length
        : App.projects.filter(function (p) { return (p.categories || []).indexOf(c.id) !== -1; }).length;
      var chip = App.el('button', {
        type: 'button',
        class: 'chip chip-btn',
        role: 'button',
        'aria-pressed': state.cat === c.id ? 'true' : 'false',
        dataset: { cat: c.id },
        text: c.label + ' · ' + n
      });
      chip.addEventListener('click', function () {
        state.cat = c.id;
        syncFilterChips();
        renderGrid();
      });
      return chip;
    });
    App.mount(filterHost, nodes);
  }
  function syncFilterChips() {
    App.qsa('[data-cat]', filterHost).forEach(function (chip) {
      var on = chip.dataset.cat === state.cat;
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      chip.classList.toggle('chip-solid', on);
    });
  }

  /* ------------------------------------------------------------------ card */
  function statusTone(status) {
    var s = String(status || '').toLowerCase();
    if (s.indexOf('live') !== -1 || s.indexOf('shipped') !== -1 || s.indexOf('delivered') !== -1) return 'live';
    if (s.indexOf('development') !== -1 || s.indexOf('progress') !== -1) return 'wip';
    return 'default';
  }

  function cardFor(p) {
    var media = App.el('div', { class: 'card-media' }, [
      App.el('img', { src: p.cover || 'assets/covers/placeholder.svg', alt: 'Cover artwork for ' + p.title, loading: 'lazy' }),
      App.el('span', { class: 'card-status', dataset: { tone: statusTone(p.status) }, text: p.status || 'Project' })
    ]);
    if (p.featured) media.appendChild(App.el('span', { class: 'card-featured', text: 'Key project' }));

    var cats = App.el('div', { class: 'card-cats' }, (p.categories || []).map(App.catChip));
    var title = App.el('h3', { class: 'card-title' }, [
      App.el('button', { type: 'button', text: p.title, onclick: function () { openDetail(p.id); } })
    ]);
    var sub = App.el('p', { class: 'card-sub', text: [p.period, p.role].filter(Boolean).join(' · ') });
    var summary = App.el('p', { class: 'card-summary', text: p.summary });

    var techList = (p.tech || []).slice(0, 6);
    var tech = App.el('div', { class: 'card-tech' }, techList.map(function (t) { return App.techChip(t); }));
    if ((p.tech || []).length > techList.length) {
      tech.appendChild(App.el('span', { class: 'chip', text: '+' + (p.tech.length - techList.length) + ' more' }));
    }

    var links = App.linkOrPlaceholder({ url: p.links && p.links.repo, label: 'GitHub', empty: 'GitHub not linked', class: 'card-link', source: 'projects.data.js → ' + p.id + '.links.repo' });
    var demo = App.linkOrPlaceholder({ url: p.links && p.links.demo, label: 'Live demo', empty: 'No live demo', class: 'card-link', source: 'projects.data.js → ' + p.id + '.links.demo' });
    var view = App.el('button', {
      type: 'button', class: 'card-view',
      text: 'View project details →',
      onclick: function () { openDetail(p.id); },
      'aria-label': 'Open full details for ' + p.title
    });

    return App.el('article', { class: 'project-card', dataset: { id: p.id } }, [
      media,
      App.el('div', { class: 'card-body' }, [cats, title, sub, summary, tech]),
      App.el('div', { class: 'card-foot' }, [links, demo, view])
    ]);
  }

  /* ----------------------------------------------------------------- grid */
  function renderGrid() {
    var list = visibleProjects();
    App.mount(grid, list.map(cardFor));
    var total = App.projects.length;
    countNode.textContent = list.length === total
      ? total + ' projects'
      : 'Showing ' + list.length + ' of ' + total + ' projects';
    var none = list.length === 0;
    emptyNode.hidden = !none;
    grid.hidden = none;
    if (none) {
      emptyMsg.textContent = state.q
        ? 'Nothing matches “' + state.q + '”' + (state.cat !== 'all' ? ' inside ' + (App.categories[state.cat] || {}).label : '') + '. Try a technology name like “PHP” or a task like “barcode”.'
        : 'No projects are filed under this category yet.';
    }
  }

  function initControls() {
    grid = App.qs('#project-grid');
    countNode = App.qs('#project-count');
    emptyNode = App.qs('#project-empty');
    emptyMsg = App.qs('#project-empty-msg');
    filterHost = App.qs('#project-filters');
    if (!grid) return;

    buildFilters();
    syncFilterChips();
    renderGrid();

    var search = App.qs('#project-search');
    search.addEventListener('input', App.debounce(function () {
      state.q = search.value.trim();
      renderGrid();
    }, 120));

    function reset() {
      state.cat = 'all'; state.q = '';
      search.value = '';
      syncFilterChips();
      renderGrid();
      search.focus();
    }
    App.qs('#project-reset').addEventListener('click', reset);
    App.qs('#project-empty-reset').addEventListener('click', reset);
  }

  /* --------------------------------------------------------- detail dialog */
  function section(title, bodyNodes) {
    return App.el('section', { class: 'detail-section' }, [
      App.el('h3', { text: title })
    ].concat(bodyNodes.filter(Boolean)));
  }
  function tickList(items, extraClass) {
    return App.el('ul', { class: 'tick-list ' + (extraClass || '') }, items.map(function (t) { return App.el('li', { text: t }); }));
  }

  function detailBody(p) {
    var out = [];

    /* fact sheet + cover */
    var facts = App.el('dl', null, []);
    [['Role', p.role], ['Status', p.status], ['Period', p.period],
     ['Type', (p.categories || []).map(function (c) { return (App.categories[c] || {}).label; }).join(', ')],
     ['Solo work', p.solo ? 'Built independently' : 'Team or client project']].forEach(function (row) {
      if (!row[1]) return;
      facts.appendChild(App.el('div', { class: 'fact' }, [
        App.el('dt', { text: row[0] }), App.el('dd', { text: row[1] })
      ]));
    });
    out.push(App.el('div', { class: 'detail-hero' }, [
      App.el('div', { class: 'prose' }, (p.overview || []).map(function (t) { return App.el('p', { text: t }); })),
      App.el('aside', { class: 'fact-sheet' }, [
        p.cover ? App.el('img', { class: 'cover', src: p.cover, alt: 'Cover artwork for ' + p.title }) : null,
        facts
      ])
    ]));

    if (p.problem) out.push(section('Problem statement', [App.el('p', { text: p.problem })]));
    if (p.objectives) out.push(section('Objectives', [tickList(p.objectives)]));
    if (p.features) out.push(section('Main features', [tickList(p.features)]));

    if (p.tech && p.tech.length) {
      out.push(section('Technologies & tools', [
        App.el('p', { class: 'gallery-note', text: 'Select one to see every project on this site that used it.' }),
        App.el('div', { class: 'tech-grid' }, p.tech.map(function (t) {
          return App.techChip(t, function (id) { closeDetail(); App.emit('tech:select', id); });
        }))
      ]));
    }

    if (p.methodology) {
      out.push(section('Development methodology — ' + p.methodology.name, [
        App.el('ol', { class: 'num-list' }, p.methodology.steps.map(function (s) { return App.el('li', { text: s }); }))
      ]));
    }

    if (p.architecture) {
      var nodes = [];
      if (p.architecture.diagram) {
        nodes.push(App.el('figure', { class: 'arch-figure' }, [
          App.el('img', { src: p.architecture.diagram, alt: 'Architecture diagram for ' + p.title }),
          App.el('figcaption', { text: p.architecture.caption || '' })
        ]));
      } else if (p.architecture.caption) {
        nodes.push(App.el('p', { text: p.architecture.caption }));
      }
      nodes.push(App.el('ol', { class: 'flow-list' }, (p.architecture.flow || []).map(function (s) { return App.el('li', { text: s }); })));
      out.push(section('System architecture & workflow', nodes));
    }

    if (p.gallery && p.gallery.length) {
      var strip = App.el('div', { class: 'gallery' }, p.gallery.map(function (g, i) {
        return App.el('button', {
          type: 'button', class: 'gallery-item',
          onclick: function () { openLightbox(p.gallery, i); },
          'aria-label': 'Enlarge image: ' + g.caption
        }, [
          App.el('img', { src: g.src, alt: g.alt, loading: 'lazy' }),
          App.el('figcaption', null, [
            App.el('span', { class: 'kind', text: g.kind === 'screenshot' ? 'Screenshot' : g.kind === 'diagram' ? 'Diagram' : 'Concept art' }),
            document.createTextNode(g.caption || '')
          ])
        ]);
      }));
      var galleryNodes = [strip];
      if (p.galleryNote) galleryNodes.push(App.verifyNote(p.galleryNote));
      out.push(section('Screenshots & demonstrations', galleryNodes));
    }

    if (p.challenges && p.challenges.length) {
      out.push(section('Challenges & how they were solved', [
        App.el('div', { class: 'challenge-list' }, p.challenges.map(function (c) {
          return App.el('div', { class: 'challenge' }, [
            App.el('p', { class: 'c-prob', text: c.problem }),
            App.el('p', { class: 'c-sol', text: c.solution })
          ]);
        }))
      ]));
    }

    if (p.results) {
      var rNodes = [];
      if (p.results.metrics && p.results.metrics.length) {
        rNodes.push(App.el('div', { class: 'metric-row' }, p.results.metrics.map(function (m) {
          return App.el('div', { class: 'metric' }, [App.el('b', { text: m.v }), App.el('span', { text: m.k })]);
        })));
      }
      if (p.results.outcomes && p.results.outcomes.length) rNodes.push(tickList(p.results.outcomes));
      out.push(section('Results', rNodes));
    }

    if (p.learnings && p.learnings.length) {
      out.push(section('Lessons taken from it', [tickList(p.learnings, 'learn-list')]));
    }

    out.push(section('Repository & demo', [
      App.el('div', { class: 'link-row' }, [
        App.linkOrPlaceholder({ url: p.links && p.links.repo, label: 'View GitHub repository', empty: 'GitHub repository not linked yet', class: 'btn btn-ghost btn-sm', source: 'projects.data.js → ' + p.id }),
        App.linkOrPlaceholder({ url: p.links && p.links.demo, label: 'Open live demo ↗', empty: 'No public live demo', class: 'btn btn-ghost btn-sm', source: 'projects.data.js → ' + p.id })
      ])
    ]));

    var note = App.verifyNote(p.verify);
    if (note) out.push(note);
    return out;
  }

  function orderedIds() {
    var list = visibleProjects().map(function (p) { return p.id; });
    /* if the open project is filtered out, fall back to the full list for prev/next */
    return list.length > 1 || list.indexOf(currentId) !== -1 ? list : App.projects.map(function (p) { return p.id; });
  }

  var currentId = null;

  function openDetail(id, opts) {
    var p = App.projectById(id);
    if (!p) return;
    currentId = id;
    if (!modal) return;
    if (!(opts || {}).fromHash) {
      if (history.pushState) history.pushState(null, '', '#/project/' + id);
      else location.hash = '/project/' + id;
    }
    lastFocus = document.activeElement;
    App.qs('#modal-kicker').textContent = [p.status, p.period].filter(Boolean).join(' · ');
    App.qs('#modal-title').textContent = p.title;
    App.qs('#modal-sub').textContent = p.subtitle || '';
    App.mount(modalBody, detailBody(p));
    modalBody.scrollTop = 0;
    wireNavButtons(p);
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalShell.focus();
    if (!releaseTrap) releaseTrap = App.trapFocus(modalShell);
  }

  function wireNavButtons(p) {
    var ids = orderedIds();
    var i = ids.indexOf(p.id);
    var prev = App.qs('#modal-prev'), next = App.qs('#modal-next');
    prev.disabled = i <= 0;
    next.disabled = i === -1 || i >= ids.length - 1;
    var before = App.projectById(ids[i - 1]);
    var after = App.projectById(ids[i + 1]);
    prev.textContent = before ? '← ' + before.title : '← Previous';
    next.textContent = after ? after.title + ' →' : 'Next →';
    prev.onclick = before ? function () { openDetail(before.id); } : null;
    next.onclick = after ? function () { openDetail(after.id); } : null;
  }

  function closeDetail() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
    currentId = null;
    if (location.hash.indexOf('#/project/') === 0) {
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      else location.hash = '';
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initModal() {
    modal = App.qs('#project-modal');
    if (!modal) return;
    modalShell = App.qs('.modal-shell', modal);
    modalBody = App.qs('#modal-body');
    App.qsa('[data-close]', modal).forEach(function (n) { n.addEventListener('click', closeDetail); });
    document.addEventListener('keydown', function (e) {
      /* an open lightbox sits on top of the modal — the first Escape belongs to
         it, so the modal must not close in the same keypress */
      if (lightbox && !lightbox.hidden) return;
      if (e.key === 'Escape' && !modal.hidden && location.hash.indexOf('#/project/') === 0) closeDetail();
    });
    global.addEventListener('hashchange', function () {
      var m = /^#\/project\/([\w-]+)$/.exec(location.hash);
      if (m) openDetail(m[1], { fromHash: true });
      else if (!m && !modal.hidden) closeDetail();
    });
    var m0 = /^#\/project\/([\w-]+)$/.exec(location.hash);
    if (m0) setTimeout(function () { openDetail(m0[1], { fromHash: true }); }, 30);
  }

  /* ------------------------------------------------------------- lightbox */
  function openLightbox(items, index) {
    lightbox = lightbox || App.qs('#lightbox');
    if (!lightbox || !items || !items.length) return;
    lbList = items;
    lbIndex = index || 0;
    lbLastFocus = document.activeElement;
    showLb();
    lightbox.hidden = false;
    App.qsa('[data-close]', lightbox).forEach(function (n) {
      n.onclick = closeLightbox;
    });
    App.qs('#lightbox-prev').onclick = function () { stepLb(-1); };
    App.qs('#lightbox-next').onclick = function () { stepLb(1); };
    document.addEventListener('keydown', lbKeys);
    var figure = App.qs('.lightbox-figure', lightbox);
    figure.setAttribute('tabindex', '-1');
    if (!lightbox._trap) lightbox._trap = App.trapFocus(figure);
    figure.focus();
  }
  function stepLb(d) { lbIndex = (lbIndex + d + lbList.length) % lbList.length; showLb(); }
  function showLb() {
    var g = lbList[lbIndex];
    var img = App.qs('#lightbox-img');
    img.src = g.src;
    img.alt = g.alt || '';
    App.qs('#lightbox-caption').textContent = g.caption || '';
    App.qs('#lightbox-index').textContent = (lbIndex + 1) + ' / ' + lbList.length;
  }
  function lbKeys(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
    else if (e.key === 'ArrowRight') stepLb(1);
    else if (e.key === 'ArrowLeft') stepLb(-1);
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.removeEventListener('keydown', lbKeys);
    if (lightbox._trap) { lightbox._trap(); lightbox._trap = null; }
    if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
  }

  /* ----------------------------------------------------------- print sheet */
  function buildPrintSheet() {
    var host = App.el('div', { class: 'print-only' }, [App.el('div', { id: 'print-sheet', class: 'print-sheet' })]);
    var sheet = host.firstChild;
    sheet.appendChild(App.el('h2', { text: 'Project details' }));
    App.projects.forEach(function (p) {
      function block(title, items) {
        if (!items || !items.length) return null;
        return App.el('div', null, [
          App.el('h4', { text: title }),
          App.el('ul', null, items.map(function (t) { return App.el('li', { text: t }); }))
        ]);
      }
      var art = App.el('article', null, [
        App.el('h3', { text: p.title }),
        App.el('p', { class: 'ps-meta', text: [p.status, p.period, p.role].filter(Boolean).join(' · ') }),
        p.problem ? App.el('p', { text: p.problem }) : null,
        block('Objectives', p.objectives),
        block('Features', p.features),
        App.el('div', null, [
          App.el('h4', { text: 'Technologies' }),
          App.el('p', { text: (p.tech || []).map(function (t) { return (App.skillMap[t] || {}).name || t; }).join(', ') })
        ]),
        block('Challenges solved', (p.challenges || []).map(function (c) { return c.problem + ' → ' + c.solution; })),
        block('Results', ((p.results || {}).outcomes || []).concat(((p.results || {}).metrics || []).map(function (m) { return m.k + ': ' + m.v; }))),
        block('Links', [p.links && p.links.repo ? 'Repository: ' + p.links.repo : null, p.links && p.links.demo ? 'Demo: ' + p.links.demo : null].filter(Boolean))
      ]);
      sheet.appendChild(art);
    });
    document.body.appendChild(host);
  }

  App.initProjects = function () {
    initControls();
    initModal();
    buildPrintSheet();
  };
  App.openProject = openDetail;
})(typeof window !== 'undefined' ? window : globalThis);
