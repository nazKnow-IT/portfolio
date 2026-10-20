/* HUD: level bar, growing skill inventory, achievement toasts, checkpoint card. */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }

  function create(opts) {
    const data = opts.data;
    const cb = opts.on || {};
    const top = {
      lvl: el('lvl'),
      xpFill: el('xp-fill'),
      xpText: el('xp-text'),
      progress: el('progress')
    };
    const inv = { wrap: el('inv-groups'), toggle: el('inv-toggle'), count: el('inv-count') };
    const toasts = el('toasts');
    const card = {
      root: el('card'),
      kicker: el('card-kicker'),
      title: el('card-title'),
      meta: el('card-meta'),
      para: el('card-para'),
      bullets: el('card-bullets'),
      stats: el('card-stats'),
      unlocks: el('card-unlocks'),
      next: el('card-next'),
      close: el('card-close')
    };
    const hint = el('hint');

    const chips = Object.create(null);      /* label -> element, so duplicates never appear */
    let groupByCat = Object.create(null);
    let cardIndex = -1;
    let lastFocus = null;
    let toastTimer = 0;
    const queue = [];

    function ensureGroup(cat) {
      if (groupByCat[cat]) return groupByCat[cat];
      const g = document.createElement('div');
      g.className = 'inv-group';
      const h = document.createElement('h4');
      const t = document.createElement('span');
      t.textContent = data.SKILL_CATS[cat] || cat;
      const c = document.createElement('span');
      c.className = 'inv-num';
      c.textContent = '0';
      h.appendChild(t);
      h.appendChild(c);
      const body = document.createElement('div');
      body.className = 'inv-chips';
      g.appendChild(h);
      g.appendChild(body);
      inv.wrap.appendChild(g);
      groupByCat[cat] = { root: g, body: body, num: c, n: 0 };
      return groupByCat[cat];
    }

    function chipEl(label, cat) {
      const s = document.createElement('span');
      s.className = 'chip' + (cat === 'badge' ? ' chip-badge' : '');
      s.textContent = label;
      s.title = (data.SKILL_CATS[cat] || cat) + ' · unlocked in this run';
      return s;
    }

    function addSkills(unlocks, animate) {
      let added = 0;
      (unlocks || []).forEach(function (u) {
        if (chips[u.label]) return;
        const grp = ensureGroup(u.cat);
        const s = chipEl(u.label, u.cat);
        if (animate) s.classList.add('pop');
        grp.body.appendChild(s);
        grp.n += 1;
        grp.num.textContent = String(grp.n);
        chips[u.label] = s;
        added += 1;
      });
      if (added) {
        inv.count.textContent = String(Object.keys(chips).length);
        if (animate) {
          inv.root && inv.root.classList.add('bump');
          window.setTimeout(function () { inv.root && inv.root.classList.remove('bump'); }, 700);
        }
      }
      return added;
    }

    /* rebuild the inventory silently, used when resuming a saved run */
    function restore(unlockLists) {
      while (inv.wrap.firstChild) inv.wrap.removeChild(inv.wrap.firstChild);
      groupByCat = Object.create(null);
      for (const k in chips) delete chips[k];
      let n = 0;
      (unlockLists || []).forEach(function (list) { n += addSkills(list, false); });
      inv.count.textContent = String(n);
    }

    function setLevel(level, xp, xpMax, visited, total) {
      top.lvl.textContent = String(level);
      const done = visited >= total;
      const pct = done ? 100 : Math.max(0, Math.min(100, (xp / xpMax) * 100));
      top.xpFill.style.width = pct.toFixed(1) + '%';
      top.xpText.textContent = done ? xp + ' XP · route complete' : xp + ' / ' + xpMax + ' XP';
      top.progress.textContent = visited + ' / ' + total + ' stops';
    }

    function pulseXP() {
      top.xpFill.classList.add('flash');
      window.setTimeout(function () { top.xpFill.classList.remove('flash'); }, 650);
    }

    function toast(title, sub, kind) {
      if (!toasts) return;
      const t = document.createElement('div');
      t.className = 'toast' + (kind ? ' toast-' + kind : '');
      const a = document.createElement('strong');
      a.textContent = title;
      const b = document.createElement('span');
      b.textContent = sub || '';
      t.appendChild(a);
      if (sub) t.appendChild(b);
      queue.push(t);
      toasts.appendChild(t);
      window.setTimeout(function () {
        t.classList.add('out');
        window.setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 420);
      }, 3200 + Math.min(2000, toastTimer));
      toastTimer = 380;
      window.setTimeout(function () { toastTimer = 0; }, 900);
      while (queue.length > 4) {
        const old = queue.shift();
        if (old.parentNode) old.parentNode.removeChild(old);
      }
    }

    function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

    function fillCard(stop, unlocks) {
      card.kicker.textContent = stop.kicker;
      card.title.textContent = stop.title;
      card.meta.textContent = stop.meta;
      card.para.textContent = stop.para;

      clear(card.bullets);
      stop.bullets.forEach(function (b) {
        const li = document.createElement('li');
        li.textContent = b;
        card.bullets.appendChild(li);
      });

      clear(card.stats);
      (stop.stats || []).forEach(function (s) {
        const d = document.createElement('div');
        const k = document.createElement('dt');
        k.textContent = s.k;
        const v = document.createElement('dd');
        v.textContent = s.v;
        d.appendChild(k);
        d.appendChild(v);
        card.stats.appendChild(d);
      });

      clear(card.unlocks);
      if (unlocks && unlocks.length) {
        const lead = document.createElement('p');
        lead.className = 'unlock-lead';
        lead.textContent = '+' + unlocks.length + ' unlocked';
        card.unlocks.appendChild(lead);
        unlocks.forEach(function (u) {
          const s = chipEl(u.label, u.cat);
          s.classList.add('pop');
          card.unlocks.appendChild(s);
        });
      }
    }

    function openCard(index, stop, unlocks, hasNext) {
      cardIndex = index;
      lastFocus = document.activeElement;
      fillCard(stop, unlocks);
      card.next.textContent = hasNext ? 'Next stop →' : 'Back to the plaza';
      card.root.classList.add('open');
      card.root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('card-open');
      try { card.root.focus({ preventScroll: true }); } catch (e) { card.root.focus(); }
    }

    function closeCard() {
      card.root.classList.remove('open');
      card.root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('card-open');
      cardIndex = -1;
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }

    function setHint(text) { if (hint) hint.textContent = text; }

    function wire() {
      if (inv.toggle) {
        inv.toggle.addEventListener('click', function () {
          const open = inv.wrap.classList.toggle('open');
          inv.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
      if (card.close) card.close.addEventListener('click', function () { cb.onClose && cb.onClose(); });
      if (card.next) card.next.addEventListener('click', function () { cb.onNext && cb.onNext(cardIndex); });
      (Array.prototype.slice.call(document.querySelectorAll('[data-dir]'))).forEach(function (btn) {
        const dir = btn.getAttribute('data-dir');
        const on = function (e) { e.preventDefault(); cb.onPad && cb.onPad(dir, true); btn.classList.add('on'); };
        const off = function () { cb.onPad && cb.onPad(dir, false); btn.classList.remove('on'); };
        btn.addEventListener('pointerdown', on);
        btn.addEventListener('pointerup', off);
        btn.addEventListener('pointerleave', off);
        btn.addEventListener('pointercancel', off);
      });
      [['btn-tour', 'onTour'], ['btn-page', 'onPage'], ['btn-reset', 'onReset'], ['btn-full', 'onFull']]
        .forEach(function (pair) {
          const b = el(pair[0]);
          if (b && cb[pair[1]]) b.addEventListener('click', cb[pair[1]]);
        });
    }

    wire();

    return {
      addSkills: addSkills,
      restore: restore,
      setLevel: setLevel,
      pulseXP: pulseXP,
      toast: toast,
      openCard: openCard,
      closeCard: closeCard,
      setHint: setHint,
      skillCount: function () { return Object.keys(chips).length; },
      cardOpen: function () { return cardIndex >= 0; },
      currentCard: function () { return cardIndex; }
    };
  }

  const api = { create: create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.PortfolioHUD = api;
})(typeof window !== 'undefined' ? window : globalThis);
