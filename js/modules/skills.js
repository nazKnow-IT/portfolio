/* ===========================================================================
   skills.js — the technology explorer: search, category filter, and the
   "which projects used this?" panel. Skills and projects are joined through
   the usedIn index built in util.js, so adding a tech id to a project's
   `tech` array is all it takes for the link to appear.
   ========================================================================= */
(function (global) {
  'use strict';
  var App = global.App;

  var state = { cat: 'all', q: '', selected: null };
  var filterHost, groupHost, countNode, detailHost, searchNode;

  function matches(skill) {
    if (state.cat !== 'all' && skill.cat !== state.cat) return false;
    if (!state.q) return true;
    var q = state.q.toLowerCase();
    return (skill.name + ' ' + (skill.blurb || '') + ' ' + (skill.catLabel || '') + ' ' + skill.id)
      .toLowerCase().indexOf(q) !== -1;
  }

  function buildFilters() {
    var cats = (App.content.SKILL_CATS || []).slice();
    var nodes = [App.el('button', {
      type: 'button', class: 'chip chip-btn' + (state.cat === 'all' ? ' chip-solid' : ''),
      dataset: { cat: 'all' }, 'aria-pressed': state.cat === 'all' ? 'true' : 'false',
      text: 'All technologies · ' + App.skillList().length
    })];
    cats.forEach(function (c) {
      var n = (App.content.SKILLS || []).filter(function (s) { return s.cat === c.id; }).length;
      var chip = App.el('button', {
        type: 'button',
        class: 'chip chip-btn hue-' + c.hue,
        dataset: { cat: c.id },
        'aria-pressed': state.cat === c.id ? 'true' : 'false',
        text: c.label + ' · ' + n
      });
      nodes.push(chip);
    });
    App.mount(filterHost, nodes);
    App.qsa('[data-cat]', filterHost).forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.cat = chip.dataset.cat;
        render();
      });
    });
  }

  function initialsOf(name) {
    var words = name.trim().split(/\s+/).filter(function (w) { return w.length > 1; });
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    return name.replace(/[^A-Za-z0-9+#.]/g, '').slice(0, 2).toUpperCase();
  }

  function markFor(skill) {
    var mark = App.el('span', { class: 'skill-mark', 'aria-hidden': 'true' });
    var icon = App.iconSvg(skill.id);
    /* the initials tile stays as the fallback so a skill with no honest mark
       still reads as a tile rather than an empty box */
    if (icon) mark.appendChild(icon);
    else mark.textContent = initialsOf(skill.name);
    return mark;
  }

  function tileFor(skill) {
    var hue = 'hue-' + (skill.hue || 'slate');
    var meta = [];
    if (skill.usedIn.length) meta.push(App.el('span', { class: 'skill-projects', text: skill.usedIn.length + ' project' + (skill.usedIn.length > 1 ? 's' : '') }));
    if (skill.source) meta.push(App.el('span', { class: 'skill-source', text: (App.content.SOURCE_LABELS || {})[skill.source] || skill.source }));

    return App.el('button', {
      type: 'button',
      class: 'skill-tile ' + hue,
      'aria-pressed': state.selected === skill.id ? 'true' : 'false',
      onclick: function () { select(skill.id); }
    }, [
      markFor(skill),
      App.el('span', null, [
        App.el('span', { class: 'skill-name', text: skill.name }),
        App.el('span', { class: 'skill-blurb', text: skill.blurb || '' }),
        App.el('span', { class: 'skill-meta' }, meta)
      ])
    ]);
  }

  function render() {
    buildFilters();
    var all = App.skillList();
    var shown = all.filter(matches);

    var groups = [];
    (App.content.SKILL_CATS || []).forEach(function (c) {
      var items = shown.filter(function (s) { return s.cat === c.id; });
      if (!items.length) return;
      groups.push(App.el('section', { class: 'skill-group', dataset: { cat: c.id } }, [
        App.el('h3', null, [
          document.createTextNode(c.label),
          App.el('span', { class: 'count', text: items.length })
        ]),
        App.el('div', { class: 'skill-grid' }, items.map(tileFor))
      ]));
    });
    App.mount(groupHost, groups.length ? groups : [App.el('p', { class: 'empty-state', text: 'No technology matches “' + state.q + '”.' })]);
    countNode.textContent = shown.length === all.length
      ? all.length + ' technologies listed'
      : 'Showing ' + shown.length + ' of ' + all.length + ' technologies';

    if (state.selected) renderDetail(state.selected);
  }

  function renderDetail(id) {
    var skill = App.skillMap[id];
    if (!skill) return;
    var projects = skill.usedIn.map(App.projectById).filter(Boolean);
    var hue = 'hue-' + (skill.hue || 'slate');

    var big = App.iconSvg(skill.id, 'ico-lg');
    var head = App.el('div', { class: 'tech-detail-head' }, [
      App.el('button', {
        type: 'button', class: 'btn btn-quiet btn-sm td-close', text: '✕ Close',
        onclick: function () { state.selected = null; detailHost.hidden = true; App.clear(detailHost); render(); }
      }),
      big ? App.el('span', { class: 'td-mark', 'aria-hidden': 'true' }, [big]) : null,
      App.el('h3', { text: skill.name }),
      App.el('span', { class: 'chip ' + hue, text: skill.catLabel || 'Technology' }),
      skill.source ? App.el('span', { class: 'skill-source', text: (App.content.SOURCE_LABELS || {})[skill.source] || skill.source }) : null
    ]);

    var body = [head, App.el('p', { class: 'td-blurb', text: skill.blurb || '' })];

    if (projects.length) {
      body.push(App.el('h4', { class: 'sub-title', text: 'Projects using ' + skill.name }));
      body.push(App.el('div', { class: 'td-projects' }, projects.map(function (p) {
        return App.el('button', {
          type: 'button', class: 'td-project',
          onclick: function () { App.openProject(p.id); },
          'aria-label': 'Open project details for ' + p.title
        }, [
          App.el('img', { src: p.cover || 'assets/covers/placeholder.svg', alt: '', loading: 'lazy' }),
          App.el('span', null, [
            App.el('strong', { text: p.title }),
            App.el('span', { text: p.summary.slice(0, 116).replace(/\s\S*$/, '') + '…' })
          ]),
          App.el('span', { class: 'go', text: 'open →' })
        ]);
      })));
    } else {
      body.push(App.el('p', {
        class: 'td-empty',
        text: 'Studied or used outside the projects listed here, so there is nothing to link yet.'
      }));
      body.push(App.verifyNote('Add this skill’s id to a project’s tech array in js/content/projects.data.js and it shows up here.'));
    }

    var certs = (App.content.CERTIFICATIONS || []).filter(function (c) {
      return (c.skills || []).indexOf(id) !== -1;
    });
    if (certs.length) {
      body.push(App.el('h4', { class: 'sub-title', text: 'Backed by certification' }));
      body.push(App.el('div', { class: 'cert-skills' }, certs.map(function (c) {
        return App.el('span', { class: 'chip chip-solid', text: c.title });
      })));
    }

    App.mount(detailHost, body);
    detailHost.hidden = false;
    detailHost.className = 'tech-detail ' + hue;
  }

  function select(id) {
    state.selected = (state.selected === id) ? null : id;
    render();
    if (state.selected) {
      detailHost.scrollIntoView({ block: 'nearest', behavior: App.reducedMotion() ? 'auto' : 'smooth' });
    }
  }

  App.initSkills = function () {
    filterHost = App.qs('#skill-filters');
    groupHost = App.qs('#skill-groups');
    countNode = App.qs('#skill-count');
    detailHost = App.qs('#tech-detail');
    searchNode = App.qs('#skill-search');
    if (!groupHost) return;

    render();

    searchNode.addEventListener('input', App.debounce(function () {
      state.q = searchNode.value.trim();
      render();
    }, 120));

    /* a technology chosen from a project card or the detail dialog */
    App.on('tech:select', function (id) {
      state.selected = id;
      state.q = '';
      searchNode.value = '';
      if (state.cat !== 'all' && App.skillMap[id] && App.skillMap[id].cat !== state.cat) state.cat = 'all';
      render();
      App.scrollToSection('skills');
      setTimeout(function () {
        detailHost.scrollIntoView({ block: 'center', behavior: App.reducedMotion() ? 'auto' : 'smooth' });
        var close = detailHost.querySelector('.td-close');
        if (close) close.focus();
      }, App.reducedMotion() ? 30 : 520);
    });

    /* spoken languages sit under the explorer */
    var langs = (App.content.LANGUAGES_SPOKEN || []).map(function (l) {
      return App.el('span', { class: 'chip chip-solid', text: l.name + ' — ' + l.level });
    });
    if (langs.length) {
      App.mount('#spoken-langs', [App.el('span', { class: 'lbl', text: 'Spoken languages' })].concat(langs));
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
