/* Sign-in dialog.
 *
 * Every "Get started" call to action points at the real signup page. This
 * intercepts the click and opens a dialog instead, so the page can show an
 * email + password form without leaving the site. The links keep working as
 * ordinary links if this file never runs.
 *
 * The <dialog> element does the hard parts: focus is trapped inside it, Escape
 * closes it, and the page behind it is inert while it is open.
 */
(function () {
  'use strict';

  // The packed single-file build inlines this script into <head> without defer,
  // so it can run before the dialog exists. Wait for the document when needed.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    var dlg = document.getElementById('auth');
    if (!dlg || typeof dlg.showModal !== 'function') return;

    var form = dlg.querySelector('.auth-form');
    var note = dlg.querySelector('.auth-note');
    var email = dlg.querySelector('input[type="email"]');
    var pass = dlg.querySelector('input[type="password"]');
    var opener = null;

    function say(text, state) {
      note.textContent = text;
      if (state) note.setAttribute('data-state', state);
      else note.removeAttribute('data-state');
    }

    function open(trigger) {
      opener = trigger || null;
      say('');
      if (!dlg.open) dlg.showModal();
      document.documentElement.classList.add('auth-open');
      window.setTimeout(function () { if (email) email.focus(); }, 40);
    }

    function close() {
      if (dlg.open) dlg.close();
    }

    // Any call to action that would leave for the signup page opens the dialog.
    // Modified clicks are left alone: opening in a new tab is a deliberate act.
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!/devoku\.com\/(signup|login)/.test(href)) return;
      e.preventDefault();
      open(a);
    });

    dlg.querySelector('.auth-x').addEventListener('click', close);

    // Clicking the dimmed area around the card closes it; clicks inside the card
    // never reach this because the card is not the <dialog> itself.
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) close();
    });

    // Escape is handled by the platform, since the dialog sits in the top layer.
    // The page still needs its scroll lock cleared and the focus returned.
    dlg.addEventListener('close', function () {
      document.documentElement.classList.remove('auth-open');
      if (opener && typeof opener.focus === 'function') opener.focus();
      opener = null;
    });

    function invalid(field, on) {
      if (on) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    [email, pass].forEach(function (f) {
      if (!f) return;
      f.addEventListener('input', function () { invalid(f, false); say(''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var action = (e.submitter && e.submitter.value) || 'login';
      var bad = null;
      [email, pass].forEach(function (f) {
        if (!f) return;
        var empty = !f.value.trim();
        var malformed = f === email && f.value &&
          !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value);
        invalid(f, empty || malformed);
        if ((empty || malformed) && !bad) bad = f;
      });
      if (bad) {
        say(bad === email
          ? 'Enter a valid email address.'
          : 'Enter your password.', 'error');
        bad.focus();
        return;
      }
      // No account system is wired to this page yet. Say so rather than pretend.
      say(action === 'register'
        ? 'Account creation is not connected to a backend yet.'
        : 'Sign-in is not connected to a backend yet.');
    });
  }
})();
