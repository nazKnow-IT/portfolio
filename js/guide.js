/* guide.js — "Mini Mirza", a small robot in the bottom-right corner that
   invites visitors into the 3D studio version (studio/). It works like a chat
   launcher: tap the robot to open its speech bubble. The bubble also opens by
   itself once per visit, a few seconds in, and stays closed after "Maybe later". */
(function () {
  'use strict';
  var root = document.getElementById('guide');
  if (!root) return;
  var bot = root.querySelector('.guide-bot');
  var bubble = root.querySelector('.guide-bubble');
  var later = root.querySelector('[data-later]');
  var KEY = 'mini-mirza-seen';

  function open() {
    bubble.hidden = false;
    // next frame so the entrance transition runs
    requestAnimationFrame(function () { root.classList.add('open'); });
    bot.setAttribute('aria-expanded', 'true');
    root.classList.add('wave');
    setTimeout(function () { root.classList.remove('wave'); }, 1600);
  }
  function close() {
    root.classList.remove('open');
    bot.setAttribute('aria-expanded', 'false');
    setTimeout(function () { if (!root.classList.contains('open')) bubble.hidden = true; }, 250);
  }

  bot.addEventListener('click', function () { root.classList.contains('open') ? close() : open(); });
  later.addEventListener('click', function () { close(); bot.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) close(); });

  // say hello once per visit, after the visitor has had a moment with the hero
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* storage blocked */ }
  if (!seen) {
    setTimeout(function () {
      if (document.body.classList.contains('app-open')) return; // never interrupt the live app
      open();
      try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    }, 4500);
  }
})();
