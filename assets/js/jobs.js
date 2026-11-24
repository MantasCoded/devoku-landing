/* Job examples: the five category tabs and the copy they carry.
 *
 * The design shows one static example. Each tab is a real button; choosing one
 * swaps the card's category label, title and three lines. Only the copy changes:
 * the artwork and every coordinate stay exactly where Figma put them, so the
 * block never reflows or grows.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(box) {
    var tabs = [].slice.call(box.querySelectorAll('.jobs-tab'));
    if (!tabs.length) return;
    var panel = document.getElementById(
      tabs[0].getAttribute('aria-controls') || '');
    if (!panel) return;
    var label = panel.querySelector('.jobs-label');
    var title = panel.querySelector('.jobs-title');
    var desc = panel.querySelector('.jobs-desc');
    var items = desc ? [].slice.call(desc.querySelectorAll('li')) : [];
    var timer = null;

    function paint(tab) {
      // The pill carries two copies of its name: the grey label and the white
      // one that travels with the wipe. Keep both in sync.
      var lbl = tab.querySelector('.jobs-lbl');
      var fill = tab.querySelector('.jobs-fill span');
      var name = lbl ? lbl.textContent : '';
      label.textContent = name;
      if (fill) fill.textContent = name;
      title.textContent = tab.getAttribute('data-title');
      var lines = tab.getAttribute('data-lines').split('|');
      items.forEach(function (li, i) { li.textContent = lines[i] || ''; });
    }

    // Only scroll the row far enough to show the chosen tab whole, so the row
    // does not jump under the finger.
    function scrollToTab(tab) {
      if (box.scrollWidth <= box.clientWidth + 1) return;
      var pad = 20;
      var left = tab.offsetLeft - pad;
      var right = tab.offsetLeft + tab.offsetWidth + pad;
      if (left < box.scrollLeft) box.scrollLeft = left;
      else if (right > box.scrollLeft + box.clientWidth) {
        box.scrollLeft = Math.min(right - box.clientWidth,
          box.scrollWidth - box.clientWidth);
      }
    }

    function select(tab, focus) {
      if (!tab || tab.getAttribute('aria-selected') === 'true') {
        if (focus) tab.focus();
        return;
      }
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
      });
      panel.setAttribute('aria-labelledby', tab.id);
      if (focus) tab.focus();
      scrollToTab(tab);
      if (reduced) {
        paint(tab);
        return;
      }
      panel.classList.add('is-out');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        paint(tab);
        panel.classList.remove('is-out');
      }, 150);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var k = e.key, next = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (k === 'ArrowLeft' || k === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === 'Home') next = tabs[0];
        else if (k === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });
    });
  }

  function start() {
    [].slice.call(document.querySelectorAll('[data-jobs]')).forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
