const pptxgen = require("pptxgenjs");
const path = require("path");

const IMG = "/Users/yaakovsl/dev/agent-methodology-kit/article/images";
const OUT = "/Users/yaakovsl/dev/agent-methodology-kit/deck/Agentic-Delivery-Office-Payoneer.pptx";

// ---- Payoneer brand palette (payoneer.com) ----
const INK = "1E1E28", NAVY2 = "2B2B36";
const ICE = "C9CBD6", ICE2 = "9A9CA8";
const ORANGE = "FF4800", ORANGE_SOFT = "FF9466";
const BLUE = "0092F4", GREEN = "15C474", MAGENTA = "D054CE";
const SLATE = "6C757D", PANEL = "F8F8F8", PANEL2 = "F1F1F3", BORDER = "E4E4E9", WHITE = "FFFFFF";
const HEAD = "Avenir Next", BODY = "Avenir Next";

const DIM = {
  "fig01-org-chart.png": [1600, 900],
  "fig02-three-gates.png": [1600, 900],
  "fig03-review-loop.png": [1600, 900],
  "fig04-model-routing.png": [1600, 900],
  "fig05-context-isolation.png": [1600, 900],
  "fig06-cockpit-live-board.png": [1600, 950],
  "fig07-cockpit-gate1.png": [1600, 950],
  "fig09-match-broadcast.png": [1640, 2920],
  "fig10-economics.png": [1600, 900],
};

const cardSh = () => ({ type: "outer", color: "1E1E28", blur: 5, offset: 1, angle: 135, opacity: 0.07 });

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Yaakov Slonimczyk";
pres.title = "The Agentic Delivery Office";
const PW = 13.33, PH = 7.5, ML = 0.7, CW = PW - 2 * ML;

function fit(file, boxW, boxH) {
  const [nw, nh] = DIM[file]; const r = nw / nh;
  let w = boxW, h = boxW / r; if (h > boxH) { h = boxH; w = boxH * r; }
  return { w, h };
}
function diagram(slide, file, bx, by, bw, bh) {
  const { w, h } = fit(file, bw, bh);
  const x = bx + (bw - w) / 2, y = by + (bh - h) / 2;
  const pad = 0.13;
  slide.addShape(pres.shapes.RECTANGLE, { x: x - pad, y: y - pad, w: w + 2 * pad, h: h + 2 * pad, fill: { color: WHITE }, line: { color: BORDER, width: 1 }, shadow: cardSh() });
  slide.addImage({ path: path.join(IMG, file), x, y, w, h });
}
function kicker(slide, text, dark) {
  slide.addText(text, { x: ML, y: 0.46, w: CW - 2.5, h: 0.3, fontFace: HEAD, fontSize: 11.5, bold: true, color: dark ? ORANGE_SOFT : ORANGE, charSpacing: 3, margin: 0 });
}
function title(slide, text, dark) {
  slide.addShape(pres.shapes.RECTANGLE, { x: ML, y: 0.84, w: 0.16, h: 0.42, fill: { color: ORANGE }, line: { type: "none" } });
  slide.addText(text, { x: ML + 0.3, y: 0.76, w: CW - 0.3, h: 0.62, fontFace: HEAD, fontSize: 29, bold: true, color: dark ? WHITE : INK, margin: 0, valign: "middle" });
}
function footer(slide, n) {
  slide.addText([{ text: "payoneer", options: { color: ORANGE, bold: true } }, { text: "   The Agentic Delivery Office · beta", options: { color: SLATE } }], { x: ML, y: PH - 0.42, w: 10.5, h: 0.3, fontFace: HEAD, fontSize: 9, margin: 0 });
  slide.addText(String(n), { x: PW - 1.1, y: PH - 0.42, w: 0.4, h: 0.3, fontFace: HEAD, fontSize: 10, bold: true, color: SLATE, align: "right", margin: 0 });
}
function blText(items, opt) {
  return items.map((it) => {
    const o = typeof it === "string" ? { text: it } : it;
    return { text: o.text, options: Object.assign({ bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: opt && opt.gap != null ? opt.gap : 7 }, o.options || {}) };
  });
}

// ============================================================ SLIDE 1 — TITLE
(() => {
  const s = pres.addSlide(); s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: PW, h: 0.1, fill: { color: ORANGE }, line: { type: "none" } });
  s.addText("payoneer", { x: ML, y: 0.55, w: 4, h: 0.55, fontFace: HEAD, fontSize: 28, bold: true, color: ORANGE, margin: 0, valign: "middle" });
  // BETA tag
  s.addShape(pres.shapes.RECTANGLE, { x: PW - ML - 1.25, y: 0.62, w: 1.25, h: 0.42, fill: { color: NAVY2 }, line: { color: ORANGE, width: 1 } });
  s.addText("BETA", { x: PW - ML - 1.25, y: 0.62, w: 1.25, h: 0.42, fontFace: HEAD, fontSize: 13, bold: true, color: ORANGE, align: "center", valign: "middle", charSpacing: 2, margin: 0 });

  s.addText("METHODOLOGY · AI DELIVERY", { x: ML, y: 1.55, w: CW, h: 0.3, fontFace: HEAD, fontSize: 12, bold: true, color: ICE, charSpacing: 3, margin: 0 });
  s.addText("The Agentic Delivery Office", { x: ML, y: 2.05, w: CW, h: 1.0, fontFace: HEAD, fontSize: 46, bold: true, color: WHITE, margin: 0, valign: "middle" });
  s.addText("Running AI sub-agents like a delivery firm", { x: ML, y: 3.1, w: CW, h: 0.6, fontFace: HEAD, fontSize: 24, bold: true, color: ORANGE, margin: 0 });
  s.addText("Stop prompting a fast developer and reviewing every line. Start staffing — agents with roles, honest reviews, and staged gates. Structure beats talent.", { x: ML, y: 3.85, w: 9.6, h: 0.7, fontFace: BODY, fontSize: 15, color: ICE, margin: 0 });

  const nodes = [["Two benches", "senior + junior", ORANGE], ["Three gates", "cost-ordered", BLUE], ["The cockpit", "watch it live", GREEN]];
  nodes.forEach((nd, i) => {
    const x = 1.95 + i * 3.4;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 4.8, w: 2.6, h: 0.95, fill: { color: NAVY2 }, line: { color: nd[2], width: 1.5 } });
    s.addText([{ text: nd[0], options: { bold: true, fontSize: 15, color: WHITE, breakLine: true } }, { text: nd[1], options: { fontSize: 11, color: ICE } }], { x, y: 4.8, w: 2.6, h: 0.95, fontFace: HEAD, align: "center", valign: "middle", margin: 0 });
    if (i < 2) s.addText("→", { x: x + 2.6, y: 4.8, w: 0.4, h: 0.95, fontFace: HEAD, fontSize: 20, bold: true, color: ORANGE_SOFT, align: "center", valign: "middle", margin: 0 });
  });

  s.addText([
    { text: "Yaakov Slonimczyk", options: { color: WHITE, bold: true } },
    { text: "  ·  Solution Architect", options: { color: ICE } },
    { text: "      Works with Claude Code · Codex · Grok", options: { color: ICE2 } },
  ], { x: ML, y: 6.65, w: CW, h: 0.3, fontFace: BODY, fontSize: 12, margin: 0 });
  s.addNotes("20-minute talk. Open with the personal thesis: I spent 20 years watching structure beat talent. When I started orchestrating AI agents I made the rookie mistake — treated the model as a fast dev, myself as the patient reviewer. The bottleneck was me. So I stopped prompting and started staffing.");
})();

// ============================================================ SLIDE 2 — DISCLAIMER
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  kicker(s, "BEFORE WE START"); title(s, "What this is — and what it is not"); footer(s, 2);
  const cy = 1.85, ch = 4.4, cw = 5.75;
  s.addShape(pres.shapes.RECTANGLE, { x: ML, y: cy, w: cw, h: ch, fill: { color: PANEL }, line: { color: BORDER, width: 1 }, shadow: cardSh() });
  s.addShape(pres.shapes.RECTANGLE, { x: ML, y: cy, w: 0.14, h: ch, fill: { color: ORANGE }, line: { type: "none" } });
  s.addText("What it is", { x: ML + 0.35, y: cy + 0.24, w: cw - 0.6, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
  s.addText(blText([
    "A personal open-source side project — built and maintained on my own time",
    "MIT-licensed — clone it, fork it, rip it apart",
    "Shared internally to spark ideas and start a discussion",
    "An early beta — I genuinely want feedback",
  ], { gap: 11 }), { x: ML + 0.35, y: cy + 0.85, w: cw - 0.65, h: ch - 1.05, fontFace: BODY, fontSize: 14, color: INK, valign: "top" });

  const x2 = ML + cw + 0.43;
  s.addShape(pres.shapes.RECTANGLE, { x: x2, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: BORDER, width: 1 }, shadow: cardSh() });
  s.addShape(pres.shapes.RECTANGLE, { x: x2, y: cy, w: 0.14, h: ch, fill: { color: SLATE }, line: { type: "none" } });
  s.addText("What it is not", { x: x2 + 0.35, y: cy + 0.24, w: cw - 0.6, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, color: SLATE, margin: 0 });
  s.addText(blText([
    "Not an official or supported Payoneer tool",
    "No SLA, no on-call, no guarantees",
    "Not wired into any production system",
    "It will have rough edges — that is the point of a beta",
  ], { gap: 11 }), { x: x2 + 0.35, y: cy + 0.85, w: cw - 0.65, h: ch - 1.05, fontFace: BODY, fontSize: 14, color: INK, valign: "top" });

  s.addText("Personal IP, shared as-is. Curious experiments welcome; production dependencies are not.", { x: ML, y: 6.5, w: CW, h: 0.4, fontFace: BODY, italic: true, fontSize: 12.5, color: SLATE, margin: 0 });
  s.addNotes("Keep this short and light. State it once, clearly, so the personal-vs-employer IP line is on the record, then move on. Do not dwell.");
})();

// ============================================================ SLIDE 3 — THE PROBLEM
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  kicker(s, "THE PROBLEM"); title(s, "The bottleneck is me"); footer(s, 3);
  s.addText("Treat the model as a very fast developer, and yourself as the very patient reviewer of every line —", { x: ML, y: 2.0, w: CW, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true, color: INK, margin: 0, valign: "top" });
  s.addText("it works the way reviewing every line of a junior's output \"works.\" It does not scale.", { x: ML, y: 2.75, w: CW, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true, color: ORANGE, margin: 0, valign: "top" });
  const pts = [
    "More speed downstream just piles more review onto the one human in the loop",
    "Every line of output is a line you have to read, question, and own",
    "Faster generation does not buy faster judgment — it buys a deeper queue",
  ];
  s.addText(blText(pts, { gap: 12 }), { x: ML, y: 3.9, w: CW - 0.5, h: 2.2, fontFace: BODY, fontSize: 15, color: INK, valign: "top" });
  s.addNotes("Punchy, no image. The honest confession slide. Everyone in the room has felt this. Land 'the bottleneck was me' and pause.");
})();

// ============================================================ SLIDE 4 — THE SHIFT
(() => {
  const s = pres.addSlide(); s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: PW, h: 0.1, fill: { color: ORANGE }, line: { type: "none" } });
  kicker(s, "THE SHIFT", true); title(s, "Stop prompting. Start staffing.", true);
  s.addText("Structure beats talent.", { x: ML, y: 2.35, w: CW, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true, color: ORANGE, margin: 0, valign: "middle" });
  s.addText("A mediocre team with clear roles, honest reviews, and staged approvals ships. A brilliant team without them debates.", { x: ML, y: 3.45, w: 10.6, h: 0.9, fontFace: BODY, fontSize: 18, color: ICE, margin: 0, valign: "top" });
  s.addText("So I did what an architect does: I stopped prompting and started staffing — a portable kit of agent definitions, a delivery protocol, and mechanical quality gates, installed in every project.", { x: ML, y: 4.6, w: 10.6, h: 0.9, fontFace: BODY, fontSize: 15, color: ICE2, italic: true, margin: 0, valign: "top" });
  s.addText("Five principles. Five drawings. Then the cockpit where it becomes something you can watch.", { x: ML, y: 5.9, w: CW, h: 0.5, fontFace: HEAD, fontSize: 15, bold: true, color: ORANGE_SOFT, margin: 0 });
  s.addNotes("This is the thesis slide. The shift from prompting to staffing is the whole talk in one line. Set up the structure: five principles coming.");
})();

// helper for principle slides: left text column + right framed figure
function principleSlide(n, kick, ttl, num, lead, bullets, fig, figW) {
  const s = pres.addSlide(); s.background = { color: WHITE };
  kicker(s, kick); title(s, ttl); footer(s, n);
  const lw = 4.55;
  // big principle number
  s.addText(num, { x: ML, y: 1.7, w: 1.0, h: 0.9, fontFace: HEAD, fontSize: 54, bold: true, color: ORANGE, margin: 0, valign: "top" });
  s.addText(lead, { x: ML + 1.05, y: 1.75, w: lw - 1.05, h: 1.55, fontFace: HEAD, fontSize: 15, bold: true, color: INK, margin: 0, valign: "top" });
  s.addText(blText(bullets, { gap: 11 }), { x: ML, y: 3.55, w: lw, h: 3.3, fontFace: BODY, fontSize: 12.5, color: INK, valign: "top" });
  diagram(s, fig, ML + lw + 0.2, 1.62, CW - lw - 0.2, 5.3);
  return s;
}

// ============================================================ SLIDE 5 — PRINCIPLE 1
(() => {
  const s = principleSlide(5, "PRINCIPLE 1", "The boundary is the product", "01",
    "A sub-agent gets a completely fresh context window. A self-contained brief in; conclusions out; everything in between dies inside.",
    [
      "~1k-token brief in, ~0.5k of conclusions out — 150k of exploration die inside",
      "Read as cost? Secondary. The real product is judgment quality",
      "A reviewer who never saw the implementer's reasoning can't inherit its blind spots",
      "Fresh eyes are not a limitation of the architecture — they are the mechanism",
    ], "fig05-context-isolation.png");
  s.addNotes("Lead with the cost reading, then knock it down: the real win is fresh judgment. We separate authors from reviewers in human orgs for exactly this reason. Caveat: total tokens go UP 3-5x — context hygiene in the one context that must survive.");
})();

// ============================================================ SLIDE 6 — PRINCIPLE 2
(() => {
  const s = principleSlide(6, "PRINCIPLE 2", "One persistent mind, two benches", "02",
    "The orchestrator — the main session — is the only entity that persists. It holds the spec and every verdict, and presents decisions, never logs.",
    [
      "Sub-agents can't spawn sub-agents, can't pause, remember nothing between calls",
      "Delete the org-chart instinct: a \"CFO agent\" with no spreadsheet is the model in a hat",
      "An agent earns a seat through two things only: distinct tools + a verifiable deliverable",
      "Every business-lens finding cites a number, data, or a quote — or it is omitted",
    ], "fig01-org-chart.png");
  s.addNotes("The split between the two benches is the first thing people get wrong. Eloquence without evidence doesn't get a seat. The business lenses survive but transformed: grounded reviewers, one per lens, hard evidence rule.");
})();

// ============================================================ SLIDE 7 — PRINCIPLE 3
(() => {
  const s = principleSlide(7, "PRINCIPLE 3", "Gates ordered by cost", "03",
    "Concept ($) → Gate 1 → Design ($$) → Gate 2 → Build ($$$). Each gate approves the cheap artifact before the next order of magnitude of spend.",
    [
      "Concept: a clickable mockup + component diagram, verified before it reaches me",
      "Gate 1 — the only question: right product, right shape? Demos reveal what plans hide",
      "Design: full HLD (with a \"deviations from approved concept\" section) + the deck",
      "Build & harden: tests from the spec, shortcuts tracked, then the review swarm",
    ], "fig02-three-gates.png");
  s.addNotes("Direction errors are the expensive kind — they die at the mockup, for the price of a demo. Each human gate spends pennies of attention before the next order of magnitude of agent spend.");
})();

// ============================================================ SLIDE 8 — PRINCIPLE 4
(() => {
  const s = principleSlide(8, "PRINCIPLE 4", "The loop that converges", "04",
    "An LLM asked to review will always find something. Two unbounded critics oscillate forever. Three rules make the loop converge.",
    [
      "The verdict contract: tag BLOCKING / NON-BLOCKING, cite verified evidence — APPROVED is a valid answer",
      "The refuter: every blocking finding gets an adversary whose only job is to disprove it",
      "Hallucinated objections die before causing rework — near-pure precision gain",
      "The hard cap: two fix rounds, then escalate. What reaches me is already criticized + fixed",
    ], "fig03-review-loop.png");
  s.addNotes("The verdict contract — telling a reviewer that silence is a valid answer — is the most portable quality mechanism in the system. Residual findings are listed honestly as my backlog, not smoothed over.");
})();

// ============================================================ SLIDE 9 — PRINCIPLE 5
(() => {
  const s = principleSlide(9, "PRINCIPLE 5", "Pay for judgment, not difficulty", "05",
    "Model tier should be proportional to how silent the agent's failure is — not how hard its task is. The intuitive rule is wrong.",
    [
      "Grounded agents run a tier below: test-writer (tests run), DB reviewer (attaches EXPLAIN)",
      "Judging agents run the frontier: planner, reviewers, and the veto-holding refuters",
      "A shallow APPROVED from a weak model is indistinguishable from a real one — never cheap there",
      "Tiers are relative to the frontier, never hardcoded; assignments evolve like personnel",
    ], "fig04-model-routing.png");
  s.addNotes("A refuter must never be weaker than the finding it judges. The junior bench carries ~half the token volume, so routing cuts 30-40% of spend without touching the part you never cut. Promote/demote logged with date + reason.");
})();

// ============================================================ SLIDE 10 — THE COCKPIT
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  kicker(s, "THE COCKPIT"); title(s, "You can't delegate what you can't see"); footer(s, 10);
  // big live board on the left
  diagram(s, "fig06-cockpit-live-board.png", ML, 1.62, 7.55, 4.0);
  // small gate-1 screen under it
  diagram(s, "fig07-cockpit-gate1.png", ML, 5.55, 7.55, 1.55);
  const rx = ML + 7.85, rw = CW - 7.85;
  s.addText(blText([
    "The home screen is an inbox of decisions — filtered to \"awaiting my decision\"",
    "Hooks fire on every dispatch and every return — the board shows the ball moving",
    "You can see the expensive judging tier only light up when judgment is needed",
    "Reads your real enrolled engagements — not a mockup with sample data",
    "A gate is a screen: the artifact, the decisions, three buttons — approve / adjust / kill",
  ], { gap: 11 }), { x: rx, y: 1.85, w: rw, h: 5.0, fontFace: BODY, fontSize: 13, color: INK, valign: "top" });
  s.addNotes("Minimal intervention without visibility isn't delegation, it's abdication. The cockpit's own mockup was built by the office's mockup-builder agent — the methodology produced the interface that shows the methodology working.");
})();

// ============================================================ SLIDE 11 — THE MATCH VIEW (WOW)
(() => {
  const s = pres.addSlide(); s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: PW, h: 0.1, fill: { color: ORANGE }, line: { type: "none" } });
  kicker(s, "THE MATCH VIEW", true);
  title(s, "Make the serious legible", true);
  // tall portrait figure on the right — give it room
  const { w, h } = fit("fig09-match-broadcast.png", 4.7, 5.4);
  const fx = PW - ML - w, fy = 1.55 + (5.4 - h) / 2;
  const pad = 0.12;
  s.addShape(pres.shapes.RECTANGLE, { x: fx - pad, y: fy - pad, w: w + 2 * pad, h: h + 2 * pad, fill: { color: WHITE }, line: { color: NAVY2, width: 1 } });
  s.addImage({ path: path.join(IMG, "fig09-match-broadcast.png"), x: fx, y: fy, w, h });

  const lw = fx - ML - 0.45;
  s.addText("Same telemetry, rendered as a 4-3-3. A toggle, not a replacement — the blueprint stays the default for the boardroom; the pitch is for everywhere else.", { x: ML, y: 1.75, w: lw, h: 1.0, fontFace: BODY, fontSize: 14, color: ICE, margin: 0, valign: "top" });
  const map = [
    ["Delegation", "a pass", ORANGE],
    ["Milestone", "a goal", GREEN],
    ["Regression", "an own goal", MAGENTA],
    ["Refuter", "the VAR check", BLUE],
    ["Orchestrator", "#10 regista — touches every ball", ORANGE_SOFT],
    ["Jacobito", "the mascot, calling the match", ICE],
  ];
  let y = 2.95;
  map.forEach(m => {
    s.addShape(pres.shapes.RECTANGLE, { x: ML, y: y + 0.04, w: 0.14, h: 0.32, fill: { color: m[2] }, line: { type: "none" } });
    s.addText([{ text: m[0] + "  ", options: { bold: true, color: WHITE, fontSize: 14 } }, { text: "= " + m[1], options: { color: ICE, fontSize: 13 } }], { x: ML + 0.3, y, w: lw - 0.3, h: 0.4, fontFace: BODY, valign: "middle", margin: 0 });
    y += 0.5;
  });
  s.addText("Watch it for thirty seconds and you've absorbed token economics, model tiers, and an adversarial review loop — untaught. (Live animated version in the repo.)", { x: ML, y: 6.05, w: lw, h: 0.9, fontFace: BODY, italic: true, fontSize: 12.5, color: ORANGE_SOFT, margin: 0, valign: "top" });
  s.addNotes("This is the WOW slide — give it air, let it land. I'm Uruguayan; the ball was in the design before the football was. The mapping isn't decoration, it's the methodology in a language a few billion people read fluently. Mention the animated GIF lives in the repo.");
})();

// ============================================================ SLIDE 12 — THE ECONOMICS
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  kicker(s, "THE ECONOMICS"); title(s, "Spend cheap compute to spare scarce judgment"); footer(s, 12);
  const lw = 4.7;
  s.addText("It doesn't optimize the cheap input — tokens. It optimizes the expensive, scarce one: senior human judgment. A factor-substitution play.", { x: ML, y: 1.75, w: lw, h: 1.2, fontFace: HEAD, fontSize: 14.5, bold: true, color: INK, margin: 0, valign: "top" });
  const kpis = [
    ["Human touchpoints / delivery", "review every line → 2–6 decisions at gates", ORANGE],
    ["Cost of a wrong direction", "caught at a mockup, not a build → ~10× cheaper", BLUE],
    ["Rework & defect-escape", "arrives criticized + fixed; refuter kills false findings", GREEN],
    ["Compute / delivery", "−30–40% vs naive same-tier multi-agent", MAGENTA],
  ];
  let y = 3.15;
  kpis.forEach(k => {
    s.addShape(pres.shapes.RECTANGLE, { x: ML, y, w: lw, h: 0.78, fill: { color: PANEL }, line: { color: BORDER, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: ML, y, w: 0.12, h: 0.78, fill: { color: k[2] }, line: { type: "none" } });
    s.addText([{ text: k[0] + "\n", options: { bold: true, color: INK, fontSize: 13 } }, { text: k[1], options: { color: SLATE, fontSize: 11 } }], { x: ML + 0.3, y, w: lw - 0.5, h: 0.78, fontFace: BODY, valign: "middle", margin: 0 });
    y += 0.88;
  });
  diagram(s, "fig10-economics.png", ML + lw + 0.2, 1.62, CW - lw - 0.2, 5.3);
  s.addText("It doesn't ask you to believe the ROI — it measures it. The analytics view instruments the senior/junior split, gate outcomes, refuter kill rate, and fix-rounds histogram.", { x: ML + lw + 0.2, y: 6.95, w: CW - lw - 0.2, h: 0.4, fontFace: BODY, italic: true, fontSize: 10, color: SLATE, margin: 0 });
  s.addNotes("Refuse the fake ROI. Yes it burns 3-5x more tokens — the return is senior hours handed back and rework never incurred. Compute is an input you manage, not minimize. Honest productivity number comes from a short pilot against your own baseline.");
})();

// ============================================================ SLIDE 13 — HOW TO MAKE IT WORK
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  kicker(s, "HOW TO RUN IT"); title(s, "From clone to first delivery"); footer(s, 13);
  const steps = [
    ["1", "Install once, system-wide", "git clone the repo · cd in · ./install.sh (also --target codex | grok). Agents, protocol, Live Board, and the /office commands become available everywhere."],
    ["2", "Opt in per project", "It stays dormant until you run /office-init in a repo — so it never imposes gates on a throwaway script. Give the repo its business context."],
    ["3", "Watch it live", "/office-board opens the cockpit and the match view. See which agent has the ball, at what cost, and whether a gate is waiting on you."],
    ["4", "Earn the trust", "Put ONE real feature through the gates before trusting the office unattended. Judge the mockup at Gate 1; approve the design at Gate 2."],
  ];
  let y = 1.75; const rh = 1.18;
  steps.forEach(st => {
    s.addShape(pres.shapes.RECTANGLE, { x: ML, y: y + 0.05, w: 0.62, h: 0.62, fill: { color: ORANGE }, line: { type: "none" } });
    s.addText(st[0], { x: ML, y: y + 0.05, w: 0.62, h: 0.62, fontFace: HEAD, fontSize: 26, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(st[1], { x: ML + 0.85, y: y, w: 4.0, h: rh - 0.15, fontFace: HEAD, fontSize: 16, bold: true, color: INK, margin: 0, valign: "top" });
    s.addText(st[2], { x: ML + 5.0, y: y, w: CW - 5.0, h: rh - 0.15, fontFace: BODY, fontSize: 12.5, color: SLATE, margin: 0, valign: "top" });
    y += rh;
  });
  // command strip
  s.addShape(pres.shapes.RECTANGLE, { x: ML, y: 6.55, w: CW, h: 0.55, fill: { color: INK }, line: { type: "none" } });
  s.addText([
    { text: "$ ", options: { color: ORANGE, bold: true } },
    { text: "git clone https://github.com/yaakovslonimczyk-sudo/agentic-delivery-office.git  &&  cd agentic-delivery-office  &&  ./install.sh", options: { color: ICE } },
  ], { x: ML + 0.25, y: 6.55, w: CW - 0.4, h: 0.55, fontFace: "Courier New", fontSize: 12, valign: "middle", margin: 0 });
  s.addNotes("This is the practical payoff slide. Walk the four steps. Emphasize OPT-IN — it does nothing until you /office-init. And the discipline: one real feature through the gates first, don't trust it blind.");
})();

// ============================================================ SLIDE 14 — TRY IT / CTA
(() => {
  const s = pres.addSlide(); s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: PW, h: 0.1, fill: { color: ORANGE }, line: { type: "none" } });
  kicker(s, "TRY IT — AND TELL ME WHAT BREAKS", true);
  title(s, "An open kit, and an open invitation", true);
  s.addText("github.com/yaakovslonimczyk-sudo/agentic-delivery-office", { x: ML, y: 2.0, w: CW, h: 0.55, fontFace: HEAD, fontSize: 22, bold: true, color: ORANGE, margin: 0 });
  s.addText("Nine agent definitions · the orchestration protocol · the quality-gate hooks · the CLAUDE.md template · the Live Board.", { x: ML, y: 2.6, w: 11.4, h: 0.5, fontFace: BODY, fontSize: 15, color: ICE, margin: 0 });

  const lx = ML, lw = 6.3;
  s.addText("This is an early beta — I want feedback", { x: lx, y: 3.45, w: lw, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: ORANGE_SOFT, margin: 0 });
  s.addText(blText([
    "What's confusing, what you'd cut, where it breaks on a real codebase",
    "If you want to argue with the org chart — even better",
  ], { gap: 10 }), { x: lx, y: 3.95, w: lw, h: 1.4, fontFace: BODY, fontSize: 13.5, color: ICE, valign: "top" });

  const rx = ML + lw + 0.6, rw = CW - lw - 0.6;
  s.addText("Where to reach me", { x: rx, y: 3.45, w: rw, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: ORANGE_SOFT, margin: 0 });
  const ch = [["Comment on this page"], ["Open an issue on the repo"], ["Ping me on Teams"]];
  let y = 3.95;
  ch.forEach(c => {
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y + 0.07, w: 0.14, h: 0.28, fill: { color: ORANGE }, line: { type: "none" } });
    s.addText(c[0], { x: rx + 0.3, y, w: rw - 0.3, h: 0.42, fontFace: BODY, fontSize: 13.5, color: ICE, valign: "middle", margin: 0 });
    y += 0.5;
  });

  const tags = [["Claude Code", ORANGE], ["Codex", BLUE], ["Grok", GREEN]];
  tags.forEach((t, i) => {
    const x = ML + i * 2.45;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 5.7, w: 2.25, h: 0.6, fill: { color: NAVY2 }, line: { color: t[1], width: 1.5 } });
    s.addText(t[0], { x, y: 5.7, w: 2.25, h: 0.6, fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
  });

  s.addText([{ text: "payoneer", options: { color: ORANGE, bold: true } }, { text: "   The Agentic Delivery Office · beta", options: { color: ICE2 } }], { x: ML, y: 6.65, w: 10, h: 0.4, fontFace: HEAD, fontSize: 12, margin: 0, valign: "middle" });
  s.addText("Thank you", { x: PW - 2.9, y: 6.65, w: 2.2, h: 0.4, fontFace: HEAD, fontSize: 13, bold: true, color: WHITE, align: "right", valign: "middle", margin: 0 });
  s.addNotes("Close warm. Restate: this ships as an open, portable kit, works across Claude Code / Codex / Grok. I'm after feedback, not adoption metrics. Repeat the disclaimer once: personal, MIT, as-is.");
})();

pres.writeFile({ fileName: OUT }).then(f => console.log("WROTE", f)).catch(e => { console.error(e); process.exit(1); });
