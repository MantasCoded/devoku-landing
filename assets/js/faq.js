/* The FAQ, as an accordion.

   Each row is a real button. Opening one slides the answer out of the row and
   pushes everything below the block down by exactly the height of the answers
   that are open, so the CTA and the footer stay attached to the page instead of
   being covered. The artboard itself is fixed-size, so the frame height is
   grown here and assets/js/fit.js is asked to re-measure. */
(function () {
  'use strict';

  function num(value) {
    var n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function frameOf(el) {
    return el.closest ? el.closest('.fig-f') : null;
  }

  function relayout(frame) {
    var faq = frame.querySelector('.faq');
    if (!faq) return;
    var below = num(faq.getAttribute('data-bottom'));
    var panels = faq.querySelectorAll('.faq-p');
    var shift = 0;
    for (var p = 0; p < panels.length; p++) {
      if (panels[p].parentNode.getAttribute('data-open') === 'true') {
        shift += panels[p].firstElementChild.offsetHeight;
      }
    }
    var baseH = frame.getAttribute('data-h');
    if (baseH === null) {
      baseH = frame.offsetHeight;
      frame.setAttribute('data-h', baseH);
    }
    baseH = num(baseH);
    var moved = frame.getAttribute('data-shift');
    moved = moved === null ? 0 : num(moved);
    if (moved === shift) return;

    /* Sections and mirrored bands sit on absolute y. Anything at or below the
       FAQ's bottom edge moves with it; the bands pinned to the frame's bottom
       edge are left alone, because growing the frame already carries them. */
    var nodes = frame.querySelectorAll('.fig-s, .fig-m');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (num(el.style.top) < below - 0.5 || el.style.bottom) continue;
      var flipped = (el.style.transform || '').indexOf('scaleX(-1)') !== -1;
      el.style.transform = shift
        ? 'translateY(' + shift + 'px)' + (flipped ? ' scaleX(-1)' : '')
        : (flipped ? 'scaleX(-1)' : '');
    }
    frame.style.height = (baseH + shift) + 'px';
    frame.setAttribute('data-shift', shift);
    if (window.figFit) window.figFit();
  }

  function toggle(button) {
    var item = button.closest('.faq-item');
    var frame = frameOf(button);
    if (!item || !frame) return;
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    var open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', open ? 'false' : 'true');
    item.setAttribute('data-open', open ? 'false' : 'true');
    if (open) {
      panel.style.height = panel.offsetHeight + 'px';
      void panel.offsetHeight; /* flush the start value */
      panel.style.height = '0px';
    } else {
      panel.style.height = panel.firstElementChild.offsetHeight + 'px';
    }
    relayout(frame);
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('.faq-btn') : null;
    if (!button) return;
    event.preventDefault();
    toggle(button);
  });

  /* An answer keeps its measured height; if the page is zoomed or the window
     re-sized the artboard scales as a whole, so only a font-size change can
     reflow the copy. Re-measure the open ones to stay exact. */
  var remeasure = function () {
    var open = document.querySelectorAll('.faq-item[data-open="true"]');
    for (var i = 0; i < open.length; i++) {
      var panel = open[i].querySelector('.faq-p');
      panel.style.height = panel.firstElementChild.offsetHeight + 'px';
    }
  };
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(remeasure);
  }
})();
