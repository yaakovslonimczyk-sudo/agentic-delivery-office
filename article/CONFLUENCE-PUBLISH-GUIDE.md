# Publishing to internal Confluence — step by step

Source: [`CONFLUENCE-ARTICLE.md`](./CONFLUENCE-ARTICLE.md). It's the Medium article,
adapted for an internal audience: BETA/personal-project disclaimer up top, the
soccer-field GIF as the hero image, and **all images already pointing at public
raw-GitHub URLs** so they render the moment you paste — no manual upload needed.

---

## Fastest path (Confluence Cloud, Markdown paste)

1. In Confluence, **Create** a new page in the right space (a personal space or a
   sandbox/Innovation space is the safest home for a personal side project — see
   "Where to put it" below).
2. Give it the title: **The Agentic Delivery Office**.
3. Click into the body, then use **`/Markdown`** → *Markdown* (the macro), **or**
   simply **paste the full contents of `CONFLUENCE-ARTICLE.md`** — modern
   Confluence Cloud auto-converts pasted Markdown, including the `![](…)` images.
4. The images load straight from GitHub. If your Confluence network policy blocks
   external image hosts, fall back to "Attach the images" below.

## Turn the disclaimer into a proper panel (30 seconds, do this)

The disclaimer is written as a blockquote so it survives the paste. Make it pop:

1. Select the ⚠️ BETA paragraph.
2. Type **`/Warning`** (or **`/Info`**) to drop a Confluence panel, and move the
   text inside it. Delete the italic "*Convert this blockquote…*" note afterward.

That panel is what makes the "personal project, not an official Payoneer tool"
line unmissable — which is the whole point of it being there.

## If external images are blocked — attach them instead

All 11 assets live in [`./images/`](./images/) in the repo on your machine:

```
open ~/dev/agent-methodology-kit/article/images/
```

1. On the Confluence page: **Insert → Files and images → Upload**, and upload the
   whole `images/` folder (the GIF + the ten `figNN-*.png`).
2. For each image in the body, replace the external URL embed with the uploaded
   attachment (click the image → **Replace** → pick the matching filename).
   Filenames match the captions (`fig01-org-chart.png`, `match-demo.gif`, …).

> The **hero** is `match-demo.gif` — Confluence plays animated GIFs inline, so the
> soccer field moves on the page. That's the one that earns the scroll.

## Where to put it (the one judgment call)

This is your **personal, patent-pending side project** shared on company
infrastructure. Keep the IP line clean:

- **Prefer** a personal Confluence space, or an Innovation / Sandbox / Guild space
  meant for experiments — not an official team/product space.
- Keep the **Warning panel** (personal, MIT, not-official, no-SLA) visible at the
  top. It sets expectations *and* protects the personal-vs-employer IP boundary.
- Link **out** to the public repo for the code; don't paste the kit's source into
  Confluence. The article points to it; that's enough.

## Final checklist before you hit Publish

- [ ] Title set, page in the right space
- [ ] Disclaimer converted to a **Warning/Info panel**, helper note deleted
- [ ] Hero `match-demo.gif` renders **and animates**
- [ ] All 10 figures render (or are attached) with their captions
- [ ] Repo link works: github.com/yaakovslonimczyk-sudo/agentic-delivery-office
- [ ] A feedback channel named (page comments / repo issues / your Teams handle)
- [ ] Restrict edit access to you; leave comments open for feedback
