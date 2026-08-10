# 0005 — Infrastructure: Stylesheet Fixes, Module 0, Anki Deck

Applied three infrastructure improvements in parallel:

1. **Stylesheet patched**: Added `.hook`, `.trick-note` (with `†` prefix), `.answer-toggle` (with `→` prefix), and `table.anchors` (Union blue headers, monospace numbers) CSS classes to fix rendering bugs in Lesson 1.

2. **Module 0 created**: `lessons/0000-numerical-anchors.html` — a printable daily-drill page with the 25 Core Facts grouped into Class Years, Ranks & Positions, Key Counts, and Couples. The user opens this for 2 minutes before every session. Uses `.arc` blocks for relationship pairs.

3. **Anki deck generated**: `reference/anki-deck-core25.tsv` — 78 cards (26 facts × 3 directions per the Jeopardy expert's 3-card format: Name→Fact, Fact→Name, Jeopardy simulation). Ready for import into Anki for spaced repetition, the tool used by Jeopardy champions Roger Craig and Arthur Chu.
