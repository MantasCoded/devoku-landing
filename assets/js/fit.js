/* Scale the active artboard to the viewport.
   The page is a pixel-exact reproduction of the Figma frames at 1440 / 768 /
   402 px. Between those widths the frame is scaled down rather than reflowed,
   so the artboard never distorts. Anything that must reach the screen edges -
   the footer gradient, the black bar, the full-bleed section washes - does so
   with mirrored copies painted in the margins (see mirror_html in work/gen.py),
   so those stay edge to edge at any window width without being scaled. */
(function () {
  var SIZES = { desktop: [1440, 8716], tablet: [768, 7895], mobile: [402, 10034] };

  function activeFrame() {
    var frames = document.querySelectorAll('.fig-f');
    for (var i = 0; i < frames.length; i++) {
      if (getComputedStyle(frames[i]).display !== 'none') return frames[i];
    }
    return null;
  }

  function fit() {
    var frame = activeFrame();
    var stage = document.querySelector('.fig-stage');
    if (!frame || !stage) return;
    var size = SIZES[frame.getAttribute('data-bp')] || SIZES.desktop;
    var width = document.documentElement.clientWidth || window.innerWidth;
    /* The phone artboard must span the screen, so above 402 px it grows instead
       of staying at 1x. Left at 1x on a 412-479 px phone it is centred with a
       5-38 px gutter: full-bleed parts of the design still reach the edges (the
       mirrored copies in the margins), but any full-width card inside them - the
       get-started banner, for instance - stops short of the dark band it sits in
       and reads as a panel that slipped out of place. Tablet and desktop keep the
       1x cap: those artboards are wider than the phone ones and are meant to sit
       centred in the window rather than be blown up past their breakpoint. */
    var k = frame.getAttribute('data-bp') === 'mobile'
      ? Math.min(width / size[0], 1.25)
      : Math.min(1, width / size[0]);
    /* Pin the frame to the left edge of the stage and centre it with a
       translate. Scaling about the centre of a box that is wider than the
       viewport (a 402 px phone frame on a 360 px screen) leaves a strip of white
       on one side and clips the other, so the offset is applied explicitly. */
    frame.style.alignSelf = 'flex-start';
    frame.style.margin = '0';
    frame.style.transformOrigin = 'top left';
    var shift = Math.max(0, (width - size[0] * k) / 2);
    frame.style.transform = k === 1 && shift === 0
      ? 'none'
      : 'translateX(' + shift + 'px) scale(' + k + ')';
    /* The frame is taller than the Figma artboard once an FAQ answer is open,
       so the stage follows the frame as it is now, not the artboard's height.
       On phones the live v2 hero sits above the frame in normal flow, so the
       stage also has to include its height - otherwise the page cuts off the
       bottom of the artboard. */
    var hero = document.querySelector('.hero2');
    var heroH = hero && getComputedStyle(hero).display !== 'none' ? hero.offsetHeight : 0;
    stage.style.height = Math.round(heroH + (frame.offsetHeight || size[1]) * k) + 'px';
  }

  /* The three artboards share the same section names, so an in-page anchor is
     resolved inside the frame that is currently on screen. */
  function jump(hash) {
    var frame = activeFrame();
    if (!frame) return false;
    if (hash === '#top' || hash === '' || hash === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
    var target = frame.querySelector('[data-anchor="' + hash.slice(1) + '"]');
    if (!target) return false;
    /* Measure through the rects: the frame is scaled, and sections below an open
       FAQ answer are translated, so offsetTop alone would land short. */
    var t = target.getBoundingClientRect();
    var top = window.scrollY + t.top;
    window.scrollTo({ top: Math.round(top), behavior: 'smooth' });
    return true;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var hash = link.getAttribute('href');
    if (jump(hash)) event.preventDefault();
  });

  if (document.readyState !== 'loading') fit();
  else document.addEventListener('DOMContentLoaded', fit);
  window.figFit = fit;
  window.addEventListener('resize', fit, { passive: true });
  window.addEventListener('orientationchange', fit, { passive: true });
})();
