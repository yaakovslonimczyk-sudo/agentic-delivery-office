# Publish Guide — copy/paste journey

Every step below is: open a URL, paste a block, click a button. Blocks to
paste are in fenced boxes — copy them verbatim.

---

## STEP 0 — Account (once, ~2 min)

1. Open `https://medium.com` → **Get started** → sign in with Google.
2. Pick your display name: `Yaakov Slonimczyk`. Done. (No approval process —
   you can publish immediately. Membership is NOT required to publish.)

## STEP 1 — Import the article (1 paste)

1. Open: `https://medium.com/p/import`
2. Paste this URL into the box and click **Import**:

```
https://yaakovslonimczyk-sudo.github.io/agentic-delivery-office/
```

Medium pulls the text AND the seven figures automatically. It lands as a
draft. (If the import tool ever misbehaves → use the fallback at the bottom.)

## STEP 2 — Title and subtitle (2 pastes)

The imported title should already be correct. If you need to re-paste it:

```
The Agentic Delivery Office
```

Click the line directly under the title (or add one), select it, choose the
small **T** in the toolbar to make it the subtitle, and paste:

```
How I run AI sub-agents like a consulting firm — and why the org chart matters more than the prompts
```

If the import duplicated the byline line ("*By Yaakov Slonimczyk…*"), delete
it — Medium shows your name automatically.

## STEP 3 — Verify the five figures + captions (5 pastes)

Scroll the draft. Each figure should be present. Click each image and paste
its caption into the caption field (delete the old italic caption line from
the body if the import kept it as a paragraph):

Fig 1 (under "One persistent mind, two benches"):
```
Fig. 01 — The Agentic Delivery Office: client, orchestrator, and two benches of specialists who never talk to each other.
```

Fig 2 (under "Gates ordered by cost"):
```
Fig. 02 — Concept ($) → Gate 1 → Design ($$) → Gate 2 → Build ($$$). Each gate approves the cheap artifact before the next order of magnitude of spend.
```

Fig 3 (under "The loop that converges"):
```
Fig. 03 — Parallel lens reviews → refuters kill weak findings → fix verified blockers → max two rounds → deliver with residuals.
```

Fig 4 (under "Pay for judgment, not for difficulty"):
```
Fig. 04 — Route by failure visibility: grounded agents run a tier below; judging agents run the frontier. Tiers are relative — never hardcoded.
```

Fig 5 (under "The boundary is the product"):
```
Fig. 05 — The context boundary: a 1k-token brief goes in; 0.5k tokens of conclusions come out; 150k tokens of exploration die inside.
```

Fig 6 (under "The cockpit: you can't delegate what you can't see"):
```
Fig. 06 — The Office, live: who has the ball right now, every pass logged, every token accounted.
```

Fig 7 (same section, second image):
```
Fig. 07 — Gate 1 as a screen: the verified mockup, the component diagram, the key decisions with their rejected alternatives — and three buttons.
```

If any image is missing: download it from
`https://github.com/yaakovslonimczyk-sudo/agentic-delivery-office/tree/main/article/images`
and drag the PNG into place.

## STEP 4 — Featured image (3 clicks)

Click the **⋯** menu (top right) → **Change featured image** → select the
org-chart figure (Fig. 01). This is the thumbnail on social previews.

## STEP 5 — Publish with tags (5 pastes)

Click **Publish** (top right). In "Add a topic…", paste these one at a time,
pressing Enter after each:

```
AI Agents
```
```
Claude
```
```
Software Architecture
```
```
Software Development
```
```
Productivity
```

Click **Publish now**.

## STEP 6 — Grab the friend link (1 copy)

On the published story: click the share icon → **Copy friend link** (lets
non-members read free). You'll paste it in Step 7.

## STEP 7 — LinkedIn post (1 paste + 1 link)

New LinkedIn post → paste this, then replace `<FRIEND-LINK>` with the link
from Step 6:

```
I stopped prompting AI coding agents and started staffing them.

After months of running multi-agent software delivery with Claude Code, I wrote up the methodology I now install on every project: an "Agentic Delivery Office" — one orchestrator acting as solution architect, two benches of specialist sub-agents, human approval gates ordered by artifact cost, and an internal review-and-fix loop so that already-criticized, already-fixed work is what reaches me.

Five principles, five blueprints, and an open-source kit you can install in your own project in one command.

Article: <FRIEND-LINK>
Kit: https://github.com/yaakovslonimczyk-sudo/agentic-delivery-office

#AIAgents #SoftwareArchitecture #ClaudeCode #EngineeringLeadership
```

Attach Fig. 01 (the org chart PNG) to the post for the visual.

## OPTIONAL STEP 8 — Submit to a publication (bigger reach, adds days)

If you prefer 5–20× distribution over publishing today: BEFORE Step 5, leave
the story as a draft and apply to one publication. Pitch text to paste into
their writer-application form:

```
I'd like to contribute "The Agentic Delivery Office" — a practitioner's methodology for orchestrating AI coding sub-agents like a consulting firm: isolated-context specialists, staged human gates ordered by artifact cost, an adversarial review-and-fix loop, and cost-aware model routing. ~1,600 words, five original diagrams, with an open-source companion kit on GitHub. Draft link: <DRAFT-LINK>
```

Where to apply (pick ONE first):
- Level Up Coding: https://levelup.gitconnected.com/ → "Write for us" link in their About page
- ITNEXT: https://itnext.io/ → submission form linked in their About page

Get `<DRAFT-LINK>` from ⋯ → **Share draft link** on your draft.

---

## FALLBACK — if the import tool fails

1. Open `https://yaakovslonimczyk-sudo.github.io/agentic-delivery-office/` in
   Chrome.
2. Select all (Cmd+A), copy (Cmd+C).
3. Open `https://medium.com/new-story`, paste. Headings, bold, images and
   code blocks survive the rich-text paste.
4. Continue from Step 2.
