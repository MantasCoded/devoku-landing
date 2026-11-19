# Devoku landing page

A pixel-accurate, working build of the Devoku landing page from Figma file
`T6NwNS0uWXxzwaRfqZwCgp`.

## What this is

Every visible number on this page comes from the Figma file, not from
eyeballing a screenshot. `work/spec.py` flattens each canonical frame into a
node list (frame-relative boxes, radii, fills, strokes, effects, masks, text
runs) and `work/gen.py` emits the page from it:

| Breakpoint | Figma frame | Canvas |
|---|---|---|
| Desktop | `1977:661` | 1440 × 8716 |
| Tablet | `1977:2772` | 768 × 7895 |
| Mobile | `1977:1977` | 402 × 10810 |

Each artboard is a fixed-size design canvas. At widths between the three
canonical sizes the active canvas is scaled down by `assets/js/fit.js`
(never up), so nothing reflows, clips or overflows. Copy stays real, selectable
HTML text with the design's font family, size, weight, line-height, letter
spacing and colour. Vector and image compositions are cut from Figma's own
render of the frame.

## Working parts

- Header, footer, eyebrow labels and the legal line are real links (`<a>`).
- Bands that must reach the screen edges — the footer gradient, its black bar and
  the full-bleed section washes — are painted in their exact Figma box and
  mirrored into the margins either side, so they run edge to edge on a monitor
  wider than the artboard without being stretched or re-stacked. The mirrors are
  flipped about the frame edge, so the pixel either side of the join is the same
  one and there is no seam. `.fig-stage` clips them, which is what keeps the page
  free of horizontal scroll.
- Every call-to-action pill has an invisible, focusable link covering the whole
  pill: hover darkens it slightly, keyboard focus draws a ring.
- The FAQ is a real accordion. Each row is a `<button>` with `aria-expanded` and
  `aria-controls`; pressing it slides the answer out of the row, and the sections
  below move down by exactly that height (`assets/js/faq.js`), so the CTA and the
  footer stay attached to the page. Rows keep Figma's geometry, the plus mark
  becomes a minus, and the artboard grows with the answers. Answers are the FAQ
  page's own copy (https://devoku-job-examples.pages.dev/faq).
- In-page navigation is resolved inside the artboard that is currently visible,
  because all three canvases exist in the same document.
- `Get started` → https://www.devoku.com/signup, pricing links →
  https://www.devoku.com/pricing, legal links → https://terms.devoku.com/.

Link destinations and anchor ids live in one place: the `CTA_LINKS`,
`TEXT_LINKS` and `SECTION_IDS` tables at the top of `work/gen.py`.

## Rebuild

```sh
python3 work/spec.py            # Figma -> work/spec/<bp>.json
python3 work/gen.py build       # spec -> site/index.html + assets/css/fig.css
python3 work/verify.py desktop  # render vs Figma frame, per-section pixel diff
python3 work/pack.py            # generated_files/*.html and *.zip
bash work/deploy-github-pages.sh
```

`work/verify.py` needs `work/ref/<bp>@1x.png` (the Figma reference render) and a
local HTTP server, because `file://` blocks the self-hosted woff2 fonts and
silently falls back to system fonts.

## Structure

```
index.html                 generated — do not edit by hand
assets/css/fig.css         generated — do not edit by hand
assets/js/fit.js           artboard scaling + in-page anchors
assets/js/faq.js           FAQ accordion: answers slide out, page below moves
assets/fig/<bp>/           raster crops, one per composed vector/image group
assets/fonts/              Funnel Sans, Geist, Google Sans Flex (all OFL/Apache)
preview/                   full-page renders at 1440 / 768 / 402
```

Fonts: Funnel Sans and Geist are self-hosted, Google Sans Flex is the official
Google Fonts release under the SIL Open Font License 1.1.
