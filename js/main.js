/* ===========================================================================
   main.js — renders the static sections from the content files, then boots
   each interaction module. Order matters: content first (so section heights
   are final), navigation scroll spy last.
   ========================================================================= */
(function (global) {
  'use strict';
  var App = global.App;
  var P = (App.config.profile) || {};
  var L = (App.config.links) || {};

  /* ------------------------------------------------------------------ hero */
  function heroName() {
    var parts = String(P.name || '').split(' ');
    var last = parts.pop();
    return [document.createTextNode(parts.join(' ') + ' '), App.el('span', { class: 'surname', text: last })];
  }

  function socialNodes(extraClass) {
    var items = [
      { key: 'github', label: 'GitHub', url: L.github, emptyLabel: 'GitHub — not published yet' },
      { key: 'linkedin', label: 'LinkedIn', url: L.linkedin, emptyLabel: 'LinkedIn' },
      { key: 'email', label: 'Email', url: 'mailto:' + L.email, emptyLabel: 'Email' },
      { key: 'phone', label: 'WhatsApp', url: 'https://wa.me/' + (L.phoneDigits || ''), emptyLabel: 'WhatsApp' }
    ];
    return items.map(function (it) {
      if (!it.url) {
        return App.el('li', null, [App.el('span', {
          class: 'social-link', 'data-state': 'empty',
          text: it.emptyLabel, title: App.isEdit ? 'Set ' + it.key + ' in js/content/site.config.js' : null
        })]);
      }
      return App.el('li', null, [App.el('a', {
        class: 'social-link' + (extraClass ? ' ' + extraClass : ''),
        href: it.url,
        target: /^https?:/i.test(it.url) ? '_blank' : null,
        rel: /^https?:/i.test(it.url) ? 'noopener noreferrer' : null
      }, [
        App.el('span', { class: 'social-ico', 'aria-hidden': 'true', text: App.iconFor(it.key) }),
        document.createTextNode(it.label)
      ])]);
    });
  }

  function renderHero() {
    App.mount('#hero-eyebrow', [document.createTextNode(P.availability || '')]);
    App.mount('#hero-title', heroName());
    App.mount('#hero-tagline', [document.createTextNode(P.tagline || '')]);
    App.mount('#hero-role', [document.createTextNode(P.role || '')]);
    App.mount('#hero-location', [document.createTextNode(P.location || '')]);
    App.mount('#hero-social', socialNodes());
    App.mount('#hero-stats', (P.stats || []).map(function (s) {
      return App.el('div', { class: 'stat' }, [App.el('dt', { text: s.value }), App.el('dd', { text: s.label })]);
    }));
    var photo = App.qs('#hero-photo');
    if (photo) { photo.src = P.photo; photo.alt = P.photoAlt || P.name; }
    ['#nav-cv', '#hero-cv'].forEach(function (sel) {
      var a = App.qs(sel);
      if (!a) return;
      a.href = L.cvFile || '#';
      if (!L.cvFile) { a.setAttribute('data-state', 'empty'); a.addEventListener('click', function (e) { e.preventDefault(); }); }
      else a.setAttribute('download', '');
      if (sel === '#hero-cv') a.textContent = L.cvLabel || 'Download CV';
    });
    var brand = App.qs('#brand-role');
    if (brand) brand.textContent = P.role || '';
  }

  /* ----------------------------------------------------------------- about */
  function aboutBlock(block) {
    if (typeof block === 'string') return App.el('p', { text: block });
    return App.el('p', { class: 'about-point' }, [
      App.el('strong', { text: block.label }),
      App.el('span', { text: block.text })
    ]);
  }

  function renderAbout() {
    App.mount('#about-body', (P.intro || []).map(aboutBlock));
    var facts = (P.glance || []).map(function (f) { return [f.label, f.value]; });
    var langs = (App.content.LANGUAGES_SPOKEN || []).map(function (l) {
      return l.name + ' (' + l.level.toLowerCase() + ')';
    }).join(', ');
    if (langs) facts.push(['Speaks', langs]);
    App.mount('#about-side', [
      App.el('h3', { text: 'At a glance' }),
      App.el('dl', { class: 'panel-list' }, facts.filter(function (f) {
        return f[1];
      }).map(function (f) {
        return App.el('div', { class: 'panel-item' }, [App.el('dt', { text: f[0] }), App.el('dd', { text: f[1] })]);
      }))
    ]);
  }

  function achievementLine(text) {
    var icon = App.iconSvg('medal');
    return App.el('li', { class: 'ach-line' }, [
      icon ? App.el('span', { class: 'ach-ico', 'aria-hidden': 'true' }, [icon]) : null,
      App.el('span', { text: text })
    ]);
  }

  /* ------------------------------------------------------------- education */
  function projectChips(ids) {
    return App.el('div', { class: 'tag-list' }, (ids || []).map(function (id) {
      var p = App.projectById(id);
      if (!p) return null;
      return App.el('button', {
        type: 'button', class: 'chip chip-btn hue-teal', text: p.title,
        title: 'Open project details', onclick: function () { App.openProject(id); }
      });
    }));
  }

  function renderEducation() {
    var cards = (App.content.EDUCATION || []).map(function (e) {
      var left = App.el('div', { class: 'edu-when' }, [
        App.el('span', { class: 'edu-period', text: e.period }),
        e.status ? App.el('span', { class: 'edu-badge', text: e.status }) : null,
        e.cgpa ? App.el('span', { class: 'edu-cgpa' }, [
          document.createTextNode(e.cgpa), App.el('small', { text: 'CGPA' })
        ]) : null
      ]);
      var right = App.el('div', { class: 'edu-body' }, [
        App.el('h3', { text: e.qualification }),
        App.el('p', { class: 'edu-inst', text: e.institution }),
        e.summary ? App.el('p', { text: e.summary }) : null,
        App.el('h4', { class: 'sub-title', text: 'Study focus', style: 'margin-top:14px' }),
        App.el('ul', { class: 'tick-list' }, (e.focus || []).map(function (f) { return App.el('li', { text: f }); })),
        (e.coursework && e.coursework.length)
          ? App.el('div', null, [
            App.el('h4', { class: 'sub-title', text: 'Relevant coursework', style: 'margin-top:14px' }),
            App.el('div', { class: 'tag-list' }, e.coursework.map(function (c) { return App.el('span', { class: 'chip', text: c }); }))
          ])
          : App.verifyNote(e.courseworkNote),
        (e.projects && e.projects.length) ? App.el('div', null, [
          App.el('h4', { class: 'sub-title', text: 'Academic projects from this stage', style: 'margin-top:14px' }),
          projectChips(e.projects)
        ]) : null,
        (e.achievements && e.achievements.length) ? App.el('div', { class: 'edu-ach' }, [
          App.el('h4', { text: 'Achievements' }),
          App.el('ul', null, e.achievements.map(achievementLine))
        ]) : null,
        App.verifyNote(e.verify)
      ]);
      return App.el('article', { class: 'edu-card' }, [left, right]);
    });
    App.mount('#education-list', cards);
    App.mount('#education-lede', [document.createTextNode(
      'Two qualifications, both finished near the top of the cohort, with project work that '
      + 'went into real use rather than a drawer.'
    )]);

    App.mount('#experience-list', (App.content.EXPERIENCE || []).map(function (x) {
      return App.el('article', { class: 'exp-card' }, [
        App.el('h4', { text: x.org }),
        App.el('p', { class: 'exp-meta', text: x.role + ' · ' + x.period }),
        App.el('ul', null, x.points.map(function (t) { return App.el('li', { text: t }); })),
        projectChips(x.projects)
      ]);
    }));
  }

  /* --------------------------------------------------------- certifications */
  function certSkills(c) {
    return App.el('div', { class: 'cert-skills' }, (c.skills || []).map(function (id) {
      return App.techChip(id);
    }));
  }

  function certFoot(c) {
    var kids = [
      c.date ? App.el('span', { class: 'cert-date', text: c.date }) : null,
      c.url
        ? App.el('a', { class: 'card-link cert-link', href: c.url, target: /^https?:/i.test(c.url) ? '_blank' : null, rel: 'noopener noreferrer', text: 'Verify ↗' })
        : (App.isEdit ? App.linkOrPlaceholder({
          url: '', label: 'Verify', empty: 'No verification URL yet',
          class: 'card-link cert-link', source: 'skills.data.js → CERTIFICATIONS'
        }) : null)
    ].filter(Boolean);
    /* an empty footer would leave a stray rule line on every card */
    return kids.length ? App.el('div', { class: 'cert-foot' }, kids) : null;
  }

  function renderCerts() {
    var certs = (App.content.CERTIFICATIONS || []).map(function (c) {
      var seal = App.iconSvg(c.icon || 'certificate');
      return App.el('article', { class: 'cert-card' }, [
        seal ? App.el('span', { class: 'cert-seal has-ico', 'aria-hidden': 'true' }, [seal])
          : App.el('span', { class: 'cert-seal', 'aria-hidden': 'true', text: c.issuer.slice(0, 2).toUpperCase() }),
        App.el('h3', { text: c.title }),
        App.el('p', { class: 'cert-issuer', text: c.issuer }),
        c.blurb ? App.el('p', { class: 'cert-blurb', text: c.blurb }) : null,
        certSkills(c),
        certFoot(c),
        App.verifyNote(c.date && c.url ? '' : 'Add the completion date and the verification URL in skills.data.js → CERTIFICATIONS')
      ]);
    });
    var host = App.qs('#cert-list');
    App.mount(host, certs.length ? certs : [App.el('p', { class: 'empty-state', text: 'No certifications listed yet.' })]);
    if (!certs.length && host) host.closest('section').hidden = true;

    var awards = (App.content.AWARDS || []).map(function (a) {
      var trophy = App.iconSvg('trophy');
      return App.el('li', { class: 'award-item' }, [
        trophy ? App.el('span', { class: 'award-medal has-ico', 'aria-hidden': 'true' }, [trophy])
          : App.el('span', { class: 'award-medal', 'aria-hidden': 'true', text: '★' }),
        App.el('div', null, [
          App.el('strong', { text: a.title }),
          App.el('span', { text: a.org + (a.detail ? ' — ' + a.detail : '') })
        ]),
        App.el('span', { class: 'award-when', text: a.date || '' })
      ]);
    });
    var awardHost = App.qs('#award-list');
    App.mount(awardHost, awards.length ? awards : [App.el('p', { class: 'empty-state', text: 'No awards recorded yet.' })]);
    if (!awards.length && awardHost) awardHost.closest('.award-block').hidden = true;
  }

  /* ---------------------------------------------------------------- footer */
  function renderFooter() {
    App.mount('#footer-name', [document.createTextNode(P.name || '')]);
    App.mount('#footer-copy', [document.createTextNode(P.title + ' · ' + (P.location || ''))]);
    App.mount('#footer-links', (App.config.nav || []).map(function (s) {
      return App.el('li', null, [App.el('a', { href: '#' + s.id, text: s.label })]);
    }));
    App.mount('#footer-social', socialNodes());
    App.mount('#footer-built', [document.createTextNode(
      '© ' + (App.config.year || new Date().getFullYear()) + ' ' + (P.name || '') +
      '. Hand-written HTML, CSS and JavaScript — no framework, no build step.'
    )]);
  }

  /* ------------------------------------------------------------ edit notes */
  function renderEditBanner() {
    if (!App.isEdit) return;
    var banner = App.qs('#edit-banner');
    if (!banner) return;
    var notes = [];
    (App.content.EDUCATION || []).forEach(function (e) {
      if (e.verify) notes.push(App.el('div', null, [App.el('h4', { text: 'Education — ' + e.qualification }), App.el('p', { text: e.verify })]));
    });
    App.projects.forEach(function (p) {
      if (p.verify) notes.push(App.el('div', null, [App.el('h4', { text: 'Project — ' + p.title }), App.el('p', { text: p.verify })]));
    });
    if (!L.github) notes.push(App.el('div', null, [App.el('h4', { text: 'Links' }), App.el('p', { text: 'No GitHub profile URL set in js/content/site.config.js — every repository button currently renders as a placeholder.' })]));
    App.mount('#edit-notes', notes);
    banner.hidden = false;
  }

  function runContentChecks() {
    var checker = global.SiteProjects && global.SiteProjects.selfCheck;
    if (typeof checker !== 'function') return;
    var issues = checker();
    if (issues.length && global.console) {
      console.warn('[content] ' + issues.length + ' issue(s) found:\n • ' + issues.join('\n • '));
    }
    if (issues.length && App.isEdit) {
      App.qs('#edit-notes').insertAdjacentHTML('afterbegin',
        '<h4>Content self-check failed</h4><p>' + issues.map(App.esc).join('<br>') + '</p>');
    }
  }

  /* ----------------------------------------------------------------- boot */
  function boot() {
    renderHero();
    renderAbout();
    renderEducation();
    renderCerts();
    renderFooter();
    App.initProjects();
    App.initSkills();
    App.initShowcase();
    App.initContact();
    App.initNav();
    renderEditBanner();
    runContentChecks();
    document.body.classList.add('is-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : globalThis);
