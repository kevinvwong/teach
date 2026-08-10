# CLAUDE.md — West Point Drama

## Project Description

**"West Point Drama"** — a self-directed history course on the personal relationships between Civil War generals forged at West Point. Character-driven, "reality TV" style. Goal: Jeopardy readiness.

**Platform:** Windows. Commands use PowerShell (`Start-Process`). Not tested on macOS/Linux.

## Directory Structure

```
/ (root)
├── CLAUDE.md              ← this file
├── MISSION.md             ← why the user is learning this
├── SYLLABUS.md            ← full course syllabus (13 modules, 7 sessions)
├── RESOURCES.md           ← curated books, articles, communities
├── NOTES.md               ← user preferences and working notes
├── .env.local             ← PEXELS_API_KEY for image fetching
├── assessments/
│   ├── item-bank.json     ← IRT-calibrated item bank (3PL model)
│   └── quiz-renderer.js   ← Client-side adaptive quiz component
├── api/
│   ├── irt-score.mjs      ← Vercel Edge Function for IRT scoring
│   └── irt-schema.ts      ← Drizzle schema for response storage
├── assets/
│   └── stylesheet.css     ← shared Tufte-inspired CSS for all lessons
├── lessons/
│   ├── 0000-numerical-anchors.html    ← daily drill (25 core facts)
│   ├── 0001-cast-of-characters.html   ← prologue
│   ├── 0002-grants-web.html           ← Grant at West Point
│   ├── 0003-class-of-1842.html        ← Longstreet, Rosecrans, Pope
│   ├── 0004-class-of-1846.html        ← McClellan, Jackson, Hill, Pickett
│   ├── 0005-lees-generation.html      ← Lee, Johnston, Davis
│   ├── 0006-mexico-training-ground.html
│   ├── 0007-the-fracture.html
│   ├── 0008-first-shot.html
│   ├── 0009-antietam.html
│   ├── 0010-gettysburg.html
│   ├── 0011-appomattox.html
│   └── 0012-epilogue.html
├── reference/
│   ├── glossary.html                ← names, classes, key terms
│   ├── self-test-modules-1-3.html   ← mid-course assessment (45 Q)
│   ├── self-test-final.html         ← final assessment (56 Q, 70 pts)
│   └── anki-deck-core25.tsv         ← Anki spaced repetition deck (78 cards)
└── learning-records/
    ├── 0001-west-point-social-network.md
    ├── 0002-curriculum-structure.md
    ├── 0003-jeopardy-objective.md
    ├── 0004-expert-team-curriculum.md
    ├── 0005-infrastructure-fixes.md
    ├── 0006-module-2-grants-web.md
    ├── 0007-module-3-class-of-1842.md
    ├── 0008-course-completion.md
    ├── review-*.md          ← Student panel observations
    └── expert-review-*.md   ← Expert review reports
```

**Relationship between modules and Anki:** Module 0 drills 25 core facts. The Anki deck (`anki-deck-core25.tsv`) contains those same 25 facts in 3 question directions each (Name→Fact, Fact→Name, Jeopardy-style) = 78 cards total.

## Lesson HTML Conventions

Every lesson follows a **6-phase structure**, implemented via these CSS classes:

**HTML boilerplate:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lesson N: Title — West Point Drama</title>
<link rel="stylesheet" href="../assets/stylesheet.css">
</head>
<body>
<!-- lesson content -->
</body>
</html>
```

**6-phase structure:**

1. **Hook** (`<div class="hook">`) — 1–2 sentence cold open
2. **Storytelling** (`<h2>` sections, narrative prose) — character-driven drama
3. **Knowledge Injection** (`<div class="info-box">`) — key facts and numerical data
4. **Connection Map** (`<div class="arc">`) — cross-module relationship storylines
5. **Retrieval Practice** — four phases (in order):
   - **Warm-up** — 1–2 Fill-the-Blank or Odd One Out (answers inline via `.answer-toggle`)
   - **Core Jeopardy** — 5 standard "Who is…" / "What is…" clues
   - **Previously On…** — 3 spaced-recall questions from prior modules
   - **Answers** — revealed in `<div class="info-box">` block at section end
6. **Preview** — next module teaser paragraph

**Numbering:** Lessons use 4-digit prefixes (`0000-`, `0001-`, ...). Module 0 = `0000-numerical-anchors.html`. Module 1 = `0001-cast-of-characters.html`, etc. New lessons take the next available prefix (`0013-` for the 14th lesson). Thematic inserts use the same system.

**Cross-references:** Every lesson's **Connection Map** (Phase 4) must link to all prior modules via relative links. This is a bullet list or prose paragraph in the `.arc` section — not required in every paragraph.

All lessons link `../assets/stylesheet.css` and cross-reference each other via relative links.

## Available CSS Classes

| Class | Purpose |
|-------|---------|
| `.season-header` | Episode numbering (e.g. "Season 1, Episode 1") |
| `.hook` | Cold open pull-quote |
| `.cast-grid` / `.cast-card` | Character profile grids |
| `.side.union` / `.side.confederate` | Side badges on cast cards |
| `.arc` | Relationship storyline blocks (red left border) |
| `.info-box.knowledge` | Knowledge Injection callouts — use `<div class="info-box knowledge">` |
| `.info-box.answers` | Answer block callouts — use `<div class="info-box answers">` |
| `.trick-note` | Footnotes prefixed with † on cast cards |
| `.answer-toggle` | Inline answers in Odd One Out warmups only (CSS-only, no JS — just a → prefix) |
| `table.anchors` | Numerical data tables with `--union` CSS variable header color (`#2b4c7e`) |

**Cast card HTML structure:**
```html
<div class="cast-grid">
  <div class="cast-card">
    <div class="name">Ulysses S. Grant</div>
    <div class="class-year">Class of 1843 — Rank: 21st of 39</div>
    <div class="side union">Union</div>   <!-- or: side confederate -->
    <div class="role">The unlikely hero</div>
    <div class="trick-note">† His real name was Hiram Ulysses Grant</div>
  </div>
</div>
```

## Key Commands

- **Open a lesson**: `Start-Process "lessons/XXXX-name.html"` (verify file exists first)
- **View syllabus**: `Start-Process "SYLLABUS.md"`
- **Run self-test**: `Start-Process "reference/self-test-final.html"`
- **Import Anki deck**: File → Import in Anki app → select `reference/anki-deck-core25.tsv`
- **Build a new lesson**: follow the 6-phase structure above, use existing lessons as pattern

## Boundaries

- Do NOT modify files in `learning-records/` without user confirmation
- Do NOT modify `MISSION.md` without user confirmation
- All lessons must link `../assets/stylesheet.css`
- New lessons must include cross-references to all prior modules in the Connection Map
- Never delete or overwrite existing lessons
- The course curriculum (Modules 0-12) is complete. New lessons are for deep-dives or thematic extensions only — confirm with user before adding.

## Assessments (IRT-Based)

Adaptive quizzes use Item Response Theory (3PL model) via the files in `assessments/` and `api/`.

**Adding a quiz to a lesson:**
```html
<h2>Check Your Understanding</h2>
<div id="quiz-container"
     data-item-bank="../assessments/item-bank.json"
     data-domain="civil-war-module-3"
     data-n-items="5"
     data-se-threshold="0.5">
  <noscript>
    <div class="warning-box">
      <p>This adaptive quiz requires JavaScript.</p>
      <p><a href="0009-quiz-static.html">Take the printable version</a></p>
    </div>
  </noscript>
  <div class="quiz-progress">Question <span id="q-num">0</span> of <span id="q-total">0</span></div>
  <div id="quiz-question"></div>
  <div id="quiz-options"></div>
  <div id="quiz-feedback"></div>
</div>
<script src="../assessments/quiz-renderer.js" defer></script>
```

Lessons stay JS-free; only the quiz container uses JavaScript. See `C:\Users\kwong318\.agents\skills\teach\NO-JS-FALLBACK.md` for the tiered approach.

### Item Bank Format

`assessments/item-bank.json` contains items with IRT parameters (a, b, c). Calibrate via the `psychometric-consultant` subagent after 500+ responses per item.

## Image Workflow (Pexels API)

Source lesson images via the Pexels API. The API key is in `.env.local`.

```bash
node "C:\Users\kwong318\.agents\skills\teach\scripts\fetch-lesson-image.js" ^
  --query "Civil War battlefield fog" ^
  --orientation landscape ^
  --output assets/images/lesson-hero.jpg ^
  --course .
```

Every image needs attribution:
```html
<p class="img-caption">Photo by <a href="...">Photographer</a> on <a href="https://www.pexels.com">Pexels</a></p>
```

## IMSCC Export

Export the course for LMS import (Canvas, Moodle):

```bash
node "C:\Users\kwong318\.agents\skills\teach\scripts\export-imscc.mjs" ^
  --course . ^
  --output west-point-drama.imscc ^
  --version 1.3
```

## Review Cycle

### Student Panels
Run after drafting a module. Observe 3-5 students. File observations as `learning-records/review-<lesson>-panel-<number>.md`.

### Expert Reviews
Before publishing, run:
- **Learning design** (self-review — phase structure, ZPD)
- **Content accuracy** (domain expert review)
- **Accessibility** (WCAG 2.2 AA checklist)
- **Pedagogical** (module coherence review)

File reports as `learning-records/expert-review-*.md`.

## Verification

After building a new lesson, verify against this checklist:
- [ ] Links `../assets/stylesheet.css`
- [ ] Follows the 6-phase structure (Hook → Story → Knowledge → Connection → Retrieval → Preview)
- [ ] Has HTML boilerplate (`<!DOCTYPE html>`, `<meta charset>`, `<meta viewport>`, `<title>`)
- [ ] Cross-references all prior modules in the Connection Map
- [ ] Includes "Previously On…" spaced questions (skip for Module 1 only)
- [ ] Preview section links to the next module
- [ ] All images have alt text and photographer attribution
- [ ] No JavaScript in core lesson (assessments may use JS with `<noscript>` fallback)
- [ ] Print preview shows all content
- [ ] WCAG: keyboard-navigable, color contrast ≥ 4.5:1, skip-to-content link
- [ ] No horizontal scroll on mobile (600px)

## Lesson Structure Diagram (6 Phases)

```
<div class="hook">             ← 1. Hook (cold open, 1–2 sentences)
<h2>Story section</h2>         ← 2. Storytelling (narrative body, multiple h2 sections)
<div class="info-box">         ← 3. Knowledge Injection (key facts)
<div class="arc">              ← 4. Connection Map (cross-module links)
Practice section:              ← 5. Retrieval Practice
  Warm-up (Fill-the-Blank / Odd One Out)
  Core Jeopardy (5 clues)
  Previously On… (3 spaced-recall questions)
  <div class="info-box"> answers
Preview paragraph             ← 6. Next module teaser
```
