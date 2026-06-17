# Showcase deck (Payoneer house style)

A 14-slide "FOCUS LASER" presentation for showing the Agentic Delivery Office
in a ~20-minute talk. Built with [pptxgenjs](https://gitbrent.github.io/PptxGenJS/).

The rendered `.pptx` is **not committed** (Payoneer-branded artifact, kept local —
see `.gitignore`). The generator below reproduces it from the public figures in
[`../article/images/`](../article/images/).

## Build

```bash
cd .deckbuild
npm install            # pptxgenjs + image-size
node build.js          # → ../Agentic-Delivery-Office-Payoneer.pptx
```

## Slides

1. Title · 2. Disclaimer (beta / personal project) · 3. The problem ·
4. The shift (stop prompting, start staffing) · 5–9. The five principles
(context boundary, two benches, gates, refuter loop, model routing) ·
10. The cockpit · 11. The match view (soccer field) · 12. The economics ·
13. How to run it (install → `/office-init` → `/office-board`) · 14. Try it / CTA.

Content is distilled from [`../article/CONFLUENCE-ARTICLE.md`](../article/CONFLUENCE-ARTICLE.md).
To re-theme, edit the brand tokens at the top of `.deckbuild/build.js`.
