/* ===========================================================================
   contact.js — direct contact rows (with copy buttons) and the message form.
   The form posts to the endpoint in js/content/site.config.js. FormSubmit.co
   relays it to the owner's inbox with no backend of its own; the first send
   triggers a one-time activation email. If CONTACT_FORM.enabled is false the
   form is removed rather than left looking dead.
   ========================================================================= */
(function (global) {
  'use strict';
  var App = global.App;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  /* ------------------------------------------------------------ clipboard */
  function copyText(text, btn) {
    function done(ok) {
      var original = btn.textContent;
      btn.textContent = ok ? 'Copied ✓' : 'Select to copy';
      btn.classList.toggle('copied', ok);
      if (!ok) selectText(btn);
      setTimeout(function () { btn.textContent = original; btn.classList.remove('copied'); }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
    } else {
      done(fallback(text));
    }
  }
  function fallback(text) {
    var ta = App.el('textarea', { text: text, style: 'position:fixed;top:-1000px;left:-1000px' });
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  /* if the clipboard is off-limits (no user gesture, or an http origin that is
     not a secure context) the value is left selected so Ctrl+C still works */
  function selectText(btn) {
    var item = btn.closest('.contact-item');
    var value = item && App.qs('.ci-value', item);
    if (!value || !window.getSelection) return;
    var range = document.createRange();
    range.selectNodeContents(value);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* --------------------------------------------------------- contact rows */
  function row(icon, label, valueText, link, extra, download) {
    var value = App.el('div', { class: 'ci-value' });
    if (link) value.appendChild(App.el('a', {
      href: link, text: valueText,
      download: download ? true : null,
      target: /^https?:/i.test(link) ? '_blank' : null,
      rel: /^https?:/i.test(link) ? 'noopener noreferrer' : null
    }));
    else value.appendChild(App.linkOrPlaceholder({
      url: '', label: label, class: 'ci-missing', empty: valueText, source: 'site.config.js'
    }));

    var nodes = [
      App.el('span', { class: 'ci-ico', 'aria-hidden': 'true', text: icon }),
      App.el('div', null, [App.el('div', { class: 'ci-label', text: label }), value])
    ];
    if (extra) nodes.push(extra);
    return App.el('li', { class: 'contact-item' }, nodes);
  }

  function copyBtn(text) {
    return App.el('button', {
      type: 'button', class: 'btn btn-quiet btn-sm copy-btn', text: 'Copy',
      'aria-label': 'Copy ' + text + ' to clipboard',
      onclick: function () { copyText(text, this); }
    });
  }

  function buildRows() {
    var L = App.config.links || {};
    var host = App.qs('#contact-list');
    if (!host) return;
    var rows = [
      row(App.iconFor('email'), 'Email', L.email, 'mailto:' + L.email, copyBtn(L.email))
    ];
    if (L.phone) rows.push(row(App.iconFor('phone'), 'Phone / WhatsApp', L.phone, 'tel:' + (L.phoneDigits || L.phone.replace(/\s/g, ''))));
    if (L.linkedin) rows.push(row(App.iconFor('linkedin'), 'LinkedIn', L.linkedinLabel || 'Profile', L.linkedin));
    rows.push(row(App.iconFor('github'), 'GitHub',
      L.github ? (L.github || '') : 'Not linked yet',
      L.github || ''));
    if (L.cvFile) {
      rows.push(row(App.iconFor('cv'), 'Curriculum vitae', 'Download the current CV', L.cvFile, null, true));
    }
    App.mount(host, rows);
  }

  /* -------------------------------------------------------------- the form */
  function setError(input, msgNode, message) {
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      msgNode.textContent = message;
      return false;
    }
    input.removeAttribute('aria-invalid');
    msgNode.textContent = '';
    return true;
  }

  function validate(form) {
    var name = form.elements['name'];
    var email = form.elements.email;
    var message = form.elements.message;
    var ok = true, firstBad = null;

    if (!setError(name, App.qs('#err-name'),
      name.value.trim().length < 2 ? 'Please give a name of at least 2 characters.' : '')) { ok = false; firstBad = firstBad || name; }
    if (!setError(email, App.qs('#err-email'),
      !EMAIL_RE.test(email.value.trim()) ? 'That does not look like an email address.' : '')) { ok = false; firstBad = firstBad || email; }
    if (!setError(message, App.qs('#err-message'),
      message.value.trim().length < 10 ? 'Tell me a little more — at least 10 characters.' : '')) { ok = false; firstBad = firstBad || message; }

    if (firstBad) firstBad.focus();
    return ok;
  }

  function status(text, tone) {
    var node = App.qs('#form-status');
    node.textContent = text || '';
    node.dataset.tone = tone || '';
  }

  function initForm() {
    var form = App.qs('#contact-form');
    var cfg = App.config.contactForm || {};
    if (!form) return;

    if (!cfg.enabled) {
      var wrap = App.qs('.contact-form-wrap');
      if (wrap) wrap.remove();
      return;
    }
    App.qs('#form-note').textContent = cfg.note || '';

    var fields = ['name', 'email', 'message'];
    fields.forEach(function (f) {
      var input = form.querySelector('[name="' + f + '"]');
      if (input) input.addEventListener('blur', function () { if (input.value.trim()) validate(form); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) { status('Message discarded by the spam filter.', 'err'); return; }
      if (!validate(form)) { status('Check the highlighted fields.', 'err'); return; }

      var submit = App.qs('#cf-submit');
      submit.disabled = true;
      submit.textContent = 'Sending…';
      status('Sending to the relay service…', 'busy');

      var payload = {
        _subject: (cfg.subject || 'Portfolio enquiry').replace('{name}', form.elements['name'].value.trim()),
        _template: 'table',
        'From (name)': form.elements['name'].value.trim(),
        'Reply-to email': form.elements.email.value.trim(),
        Subject: form.elements.subject.value.trim() || 'Portfolio enquiry',
        Message: form.elements.message.value.trim(),
        'Sent from page': global.location.href
      };

      global.fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (res.ok && (data.success === 'true' || data.success === true || !data.error)) {
            status('Sent. Your copy leaves this page — the reply comes from ' + (App.config.links.email) + '.', 'ok');
            form.reset();
          } else {
            status((data && data.message) || 'The relay refused the message. Email me directly instead.', 'err');
          }
        });
      }).catch(function () {
        status('Could not reach the relay — check your connection, or email '
          + App.config.links.email + ' directly.', 'err');
      }).then(function () {
        submit.disabled = false;
        submit.textContent = 'Send message';
      });
    });
  }

  App.initContact = function () {
    buildRows();
    initForm();
    var copy = App.qs('#contact-copy');
    if (copy) {
      App.mount(copy, [
        App.el('p', { text: 'I am looking for an internship or a junior role where I can keep '
          + 'building systems end to end. If you have a role, a project or just a question about '
          + 'something on this page, write to me — I answer within a day or two.' }),
        App.el('p', { text: 'The fastest route is email. LinkedIn works too, and the phone number '
          + 'is on WhatsApp.' })
      ]);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
