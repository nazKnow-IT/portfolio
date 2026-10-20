/* Accessible, printable fallback: the same data.js rendered as a normal portfolio page. */
(function (global) {
  'use strict';

  const Data = global.PortfolioData;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function h2(text) {
    const h = el('h2');
    h.textContent = text;
    return h;
  }

  function linkRow() {
    const row = el('div', 'contact-row');
    const P = Data.PROFILE;
    [[P.email, 'mailto:' + P.email], [P.phone, 'tel:' + P.phone.replace(/[^+\d]/g, '')],
      [P.linkedin, 'https://' + P.linkedin]].forEach(function (p) {
      const a = el('a', 'contact-link', p[0]);
      a.href = p[1];
      if (p[1].indexOf('http') === 0) a.target = '_blank';
      a.rel = 'noopener';
      row.appendChild(a);
    });
    row.appendChild(el('span', 'contact-link contact-static', P.location));
    return row;
  }

  function bulletList(items) {
    const ul = el('ul', 'points');
    items.forEach(function (t) { ul.appendChild(el('li', null, t)); });
    return ul;
  }

  function statRow(stop) {
    if (!stop.stats || !stop.stats.length) return null;
    const dl = el('dl', 'stat-row');
    stop.stats.forEach(function (s) {
      const w = el('div', 'stat');
      w.appendChild(el('dt', null, s.k));
      w.appendChild(el('dd', null, s.v));
      dl.appendChild(w);
    });
    return dl;
  }

  function skillWall() {
    const wrap = el('div', 'skill-grid');
    Object.keys(Data.FULL_SKILLS).forEach(function (cat) {
      if (cat === 'badge') return;
      const card = el('section', 'skill-card');
      card.appendChild(el('h3', null, Data.SKILL_CATS[cat]));
      const list = el('ul', 'chips');
      Data.FULL_SKILLS[cat].forEach(function (s) { list.appendChild(el('li', 'chip', s)); });
      card.appendChild(list);
      wrap.appendChild(card);
    });
    return wrap;
  }

  function badgeList() {
    const ul = el('ul', 'points points-badges');
    Data.STOPS.forEach(function (s) {
      s.unlocks.forEach(function (u) {
        if (u.cat !== 'badge') return;
        ul.appendChild(el('li', null, u.label + ' — ' + s.title));
      });
    });
    return ul;
  }

  function render() {
    const host = document.getElementById('page');
    if (!host || host.getAttribute('data-built') === '1') return;
    host.setAttribute('data-built', '1');
    while (host.firstChild) host.removeChild(host.firstChild);
    const P = Data.PROFILE;

    const head = el('header', 'page-head');
    head.appendChild(el('p', 'eyebrow', P.kicker));
    head.appendChild(el('h1', null, P.name));
    head.appendChild(el('p', 'lede', P.headline + ' · ' + P.seeking));
    head.appendChild(linkRow());
    const actions = el('div', 'page-actions');
    const play = el('button', 'btn btn-primary', 'Play the 3D version');
    play.type = 'button';
    play.addEventListener('click', function () {
      const G = global.PortfolioGame;
      if (G && G.setMode) G.setMode('game');
    });
    const print = el('button', 'btn', 'Print or save as PDF');
    print.type = 'button';
    print.addEventListener('click', function () { global.print(); });
    actions.appendChild(play);
    actions.appendChild(print);
    head.appendChild(actions);
    host.appendChild(head);

    const about = el('section', 'page-sec');
    about.appendChild(h2('Profile'));
    about.appendChild(el('p', 'body', P.summary));
    host.appendChild(about);

    Data.STOPS.slice(1, Data.STOPS.length - 1).forEach(function (s) {
      const sec = el('section', 'page-sec stop');
      sec.appendChild(el('p', 'eyebrow', s.kicker));
      sec.appendChild(h2(s.heading));
      sec.appendChild(el('p', 'meta', s.meta));
      sec.appendChild(el('p', 'body', s.para));
      sec.appendChild(bulletList(s.bullets));
      const st = statRow(s);
      if (st) sec.appendChild(st);
      const chips = el('ul', 'chips chips-inline');
      s.unlocks.forEach(function (u) { chips.appendChild(el('li', 'chip' + (u.cat === 'badge' ? ' chip-badge' : ''), u.label)); });
      sec.appendChild(chips);
      host.appendChild(sec);
    });

    const skills = el('section', 'page-sec');
    skills.appendChild(h2('Skills'));
    skills.appendChild(skillWall());
    host.appendChild(skills);

    const awards = el('section', 'page-sec');
    awards.appendChild(h2('Awards & certifications'));
    awards.appendChild(badgeList());
    host.appendChild(awards);

    const contact = el('section', 'page-sec');
    contact.appendChild(h2('Contact'));
    contact.appendChild(el('p', 'body', 'Looking for an internship where I can build scalable, AI-powered software — happy to walk through any of the systems above.'));
    contact.appendChild(linkRow());
    host.appendChild(contact);

    host.appendChild(el('footer', 'page-foot', Data.PROFILE.name + ' · built as a playable portfolio — drag, walk, unlock.'));
  }

  const api = { render: render };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.PortfolioPage = api;
})(typeof window !== 'undefined' ? window : globalThis);
