# CLAUDE.md — Vowel Teams

## Project Description

**"Vowel Teams"** — a remedial phonics course for ages 9-11. Systematic, explicit instruction on vowel teams (ai, ay, ee, ea, igh, oa, oe, ue, ui, oi, oy, ou, ow, au, aw, oo). Multi-sensory, game-like, structured literacy approach.

**Platform:** Windows. Commands use PowerShell (`Start-Process`). Not tested on macOS/Linux.

## Directory Structure

```
/ (root)
├── CLAUDE.md              ← this file
├── MISSION.md             ← why the learner is doing this
├── SYLLABUS.md            ← full course syllabus (modules, order, pacing)
├── RESOURCES.md           ← curated decodable texts, games, manipulatives
├── NOTES.md               ← user preferences and working notes
├── assets/
│   └── stylesheet.css     ← shared kid-friendly CSS for all lessons
├── lessons/
│   ├── 0000-vowel-team-overview.html     ← pre-assessment + vowel team families
│   ├── 0001-whats-a-vowel-team.html      ← what is a vowel team?
│   ├── 0002-ai-ay.html                   ← /ā/ ai, ay (UFLI 84)
│   ├── 0003-ee-ea-ey.html                ← /ē/ ee, ea, ey (UFLI 85)
│   ├── 0004-oa-ow-oe.html                ← /ō/ oa, ow, oe (UFLI 86)
│   ├── 0005-ie-igh.html                  ← /ī/ ie, igh (UFLI 87)
│   ├── 0006-long-vowel-review.html       ← long vowel teams review (UFLI 88)
│   ├── 0007-oo.html                      ← /oo/ oo both sounds (UFLI 89-90)
│   ├── 0008-ew-ui-ue.html                ← /ū/ ew, ui, ue (UFLI 91)
│   ├── 0009-other-vowel-review.html      ← other vowel teams review (UFLI 92)
│   ├── 0010-au-aw-augh.html              ← /aw/ au, aw, augh (UFLI 93)
│   ├── 0011-ea-short-a.html              ← /ĕ/ ea, /ŏ/ a (UFLI 94)
│   ├── 0012-oi-oy.html                   ← /oi/ oi, oy (UFLI 95)
│   ├── 0013-ou-ow.html                   ← /ou/ ou, ow (UFLI 96)
│   └── 0014-final-review.html            ← all vowel teams + post-assessment (UFLI 97)
├── reference/
│   ├── vowel-team-cards.html             ← printable sound-spelling cards
│   ├── self-test-progress.html           ← progress check (10 Q per section)
│   └── word-lists.tsv                    ← decodable word bank for all teams
├── reference/
│   ├── vowel-team-cards.html            ← printable sound-spelling cards
│   ├── self-test-progress.html          ← progress check (10 Q per section)
│   └── word-lists.tsv                   ← decodable word bank for all teams
└── learning-records/
    ├── 0001-course-plan.md
    ├── 0002-progress-tracking.md
    └── 0003-ufli-alignment.md
```

## Lesson Structure

Every lesson follows a **kid-friendly 5-phase structure**:

1. **Hook** (`<div class="hook">`) — A riddle, puzzle, or visual that introduces the vowel team
2. **Teach** (`<div class="teach">`) — Explicit instruction: the sound, the spelling pattern, keywords
3. **Practice** — Word reading, sentence reading, spelling practice with immediate feedback
4. **Game** (`<div class="game">`) — Fun application activity (word sort, board game, memory match, etc.)
5. **Check** (`<div class="check">`) — Quick 3-5 question review with answers inline

**HTML boilerplate:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lesson N: Vowel Team — Vowel Teams</title>
<link rel="stylesheet" href="../assets/stylesheet.css">
</head>
<body>
<!-- lesson content -->
</body>
</html>
```

**Numbering:** Lessons use 4-digit prefixes (`0000-`, `0001-`, ...). Module 0 = `0000-vowel-team-overview.html`. Module 1 = `0001-ai-ay.html`, etc. New lessons take the next available prefix (`0013-` for the 14th lesson).

**Cumulative review:** Every `mixed-review` lesson must link back to all prior modules. Final review links to all modules.

All lessons link `../assets/stylesheet.css` and cross-reference each other via relative links.

## UFLI Integration

This course aligns with [UFLI Foundations](https://ufli.education.ufl.edu/foundations/) (Lessons 84–97). Each lesson should include a **"UFLI Toolbox Resources"** section linking to the free resources from the University of Florida Literacy Institute.

### Per-Lesson Links

For each vowel team lesson, add links to these UFLI resources:

| Resource | Link Pattern |
|----------|-------------|
| Slide deck (Google Slides) | `https://docs.google.com/presentation/d/XXXXX/copy` |
| Decodable passage | `https://ufli.education.ufl.edu/wp-content/uploads/2022/XX/XX_Decodable_UFLIFoundations.pdf` |
| Roll and Read game | `https://ufli.education.ufl.edu/wp-content/uploads/2022/XX/XX_RollRead_UFLI-Foundations.pdf` |
| Home practice | `https://ufli.education.ufl.edu/wp-content/uploads/2022/XX/XX_HomePractice_UFLI-Foundations.pdf` |
| Unit resources page | `https://ufli.education.ufl.edu/foundations/toolbox/84-88/` (or 89-94, 95-98) |

### Always-Available Digital Tools

Every lesson should also link to these UFLI digital tools:
- [Word Work Mat – Beginner](https://research.dwi.ufl.edu/op.n/file/cbhd8xmn9i4ctf7i/embed)
- [Blending Board](https://research.dwi.ufl.edu/op.n/file/bca9ju45kvvrvoan/embed)

### UFLI Lesson Mapping

| Our Module | UFLI Lesson | Concept |
|-----------|-------------|---------|
| 0002 | 84 | ai, ay /ā/ |
| 0003 | 85 | ee, ea, ey /ē/ |
| 0004 | 86 | oa, ow, oe /ō/ |
| 0005 | 87 | ie, igh /ī/ |
| 0006 | 88 | Vowel Teams Review 1 |
| 0007 | 89–90 | oo /oo/, /ū/ |
| 0008 | 91 | ew, ui, ue /ū/ |
| 0009 | 92 | Vowel Teams Review 2 |
| 0010 | 93 | au, aw, augh /aw/ |
| 0011 | 94 | ea /ĕ/, a /ŏ/ |
| 0012 | 95 | oi, oy /oi/ |
| 0013 | 96 | ou, ow /ow/ |
| 0014 | 97 | Vowel Teams & Diphthongs Review |

### Copyright Note

UFLI Foundations materials are free for educational use. Always link directly to UFLI's hosted resources rather than redistributing files.

## Available CSS Classes

| Class | Purpose |
|-------|---------|
| `.season-header` | Lesson numbering |
| `.hook` | Cold-open riddle or puzzle |
| `.teach` | Explicit instruction block (blue left border) |
| `.game` | Game/activity block (green left border) |
| `.check` | Quick review block (yellow left border) |
| `.info-box` | General callout — answers, keywords, tips |
| `.answer-toggle` | Inline answers (CSS-only, no JS — just a → prefix) |
| `.word-card` | Individual decodable word card for blending practice |
| `.word-grid` | Grid of word cards for reading practice |
| `.vowel-highlight` | Highlights the target vowel team in example words |
| `table.anchors` | Data tables (sorting charts, progress grids) |

**Word card HTML structure:**
```html
<div class="word-grid">
  <div class="word-card"><span class="vowel-highlight">ai</span>m</div>
  <div class="word-card">r<span class="vowel-highlight">ai</span>n</div>
  <div class="word-card">tr<span class="vowel-highlight">ai</span>n</div>
</div>
```

## Key Commands

- **Open a lesson**: `Start-Process "lessons/XXXX-name.html"` (verify file exists first)
- **View syllabus**: `Start-Process "SYLLABUS.md"`
- **Run progress check**: `Start-Process "reference/self-test-progress.html"`
- **Print word cards**: open `reference/vowel-team-cards.html` → Print
- **Build a new lesson**: follow the 5-phase structure above, use existing lessons as pattern

## Boundaries

- Do NOT modify files in `learning-records/` without user confirmation
- Do NOT modify `MISSION.md` without user confirmation
- All lessons must link `../assets/stylesheet.css`
- New lessons must include cumulative review connections to prior modules
- Never delete or overwrite existing lessons
- This course targets **remedial readers ages 9-11** — all text, examples, and activities must be age-respecting (not babyish)
- Vowel teams are taught by **sound first**, then spelling pattern — never the reverse

## Verification

After building a new lesson, verify against this checklist:
- [ ] Links `../assets/stylesheet.css`
- [ ] Follows the 5-phase structure (Hook → Teach → Practice → Game → Check)
- [ ] Has HTML boilerplate (`<!DOCTYPE html>`, `<meta charset>`, `<meta viewport>`, `<title>`)
- [ ] Cross-references prior modules in the Practice or Check section
- [ ] Includes cumulative review connections
- [ ] Preview or closing links to the next lesson
- [ ] Uses `<span class="vowel-highlight">` on target vowel team in example words
