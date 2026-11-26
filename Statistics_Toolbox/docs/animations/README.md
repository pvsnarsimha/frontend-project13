# StatLab AI Tutor: narrated animations

The chosen design: **the AI narrates while the animation plays.** Every scene draws its picture and speaks its line at the same moment;
the next scene starts only when both are done. The line also stays on screen as a caption, so it works with the sound off.

| # | Concept | Animation | Where it appears | Code | Expected output |
|---|---|---|---|---|---|
| 1 | Hypothesis test | Rejection region shades in, the statistic drops onto the curve: inside = reject, outside = fail to reject | every z / t / χ² / F test, under its graph | `js/core/tutor-hypothesis.js` | [01-hypothesis-test.png](01-hypothesis-test.png) |
| 2 | Mean / SD | Dots slide on, mean balances like a seesaw, deviations grow and are squared into boxes | Mean tool (first 2 scenes), Standard deviation tool (all 5) | `js/core/tutor-descriptive.js` | [02-mean-and-sd.png](02-mean-and-sd.png) |
| 3 | Normal / z-score | A point moves along the curve; the shaded area fills live | Z-score tool | `js/core/tutor-normal.js` | [03-normal-z-score.png](03-normal-z-score.png) |
| 4 | Box plot | Values sort, Q1 / median / Q3 cut them, the box forms, whiskers stretch | Box plot tool | `js/core/tutor-boxplot.js` | [04-box-plot.png](04-box-plot.png) |
| 5 | Correlation | A slider moves r and the scatter points follow, ending on your own data | Pearson correlation tool | `js/core/tutor-relations.js` | [05-correlation.png](05-correlation.png) |
| 6 | Regression | Residual squares form, the line pivots to make their total smallest | Simple linear regression tool | `js/core/tutor-relations.js` | [06-regression.png](06-regression.png) |
| 7 | Sampling / CLT | Sample means drop into a histogram that becomes a bell | **New tool:** Probability → Sampling & Central Limit Theorem | `js/core/tutor-clt.js`, `js/tools/probability/sampling.js` | [07-sampling-clt.png](07-sampling-clt.png) |

All seven are built. Every picture is made of screenshots of the running app (frames of the real animation with the line the narrator speaks);
regenerate them with `node scripts/animation-previews.js`. The animation is skipped when it would not be legible: the mean / SD, box plot and
z-score pictures need 2 to 15 values (box plot 4 to 15), regression up to 40 pairs.

## AI Teacher class (every tab, every topic)

Above the inputs of **every one of the 103 topics** there is an animated cartoon classroom with an AI maths teacher. Three classes, switched with the buttons above the board:

| Button | What she does |
|---|---|
| **Teach this topic** | Greets the class, says why the topic matters, chalks the formula, shows how it fits the tab, and asks "who can tell me?" (a student puts a hand up). |
| **Solve my problem** | Reads back **what you typed**, then works your problem step by step from **the tool's own worked solution**, and announces **your answer** (she jumps, the class cheers). If your input is wrong she says "Oh no!" and explains the fix. It plays automatically after you press **Calculate** (not under browser automation, so the test suites stay fast). |
| **About this tab** | Introduces the whole tab: the big idea, the 4-step method, the topics in it. (Opens when you click a tab.) |

| Piece | File |
|---|---|
| Lessons: scenes, words, the worked example, the "solve my problem" parser | `js/core/teacher-lessons.js` |
| The classroom and the cartoon teacher (canvas drawing, skeleton, poses) | `js/core/teacher.js` |
| Player (Play / Pause / Replay / voice / step buttons), shared with the animations above | `js/core/tutor.js` |

* **Where "Solve my problem" gets its facts:** the inputs are read from the form; the answer from the answer tile; the working from the tool's `.solution .step` blocks (43 tools) or, for the table-style tools (t-tests, ANOVA, correlation, regression ...), from the equations in the solution text (label / value pairs, lines with `=`, the Decision / Interpretation lines). Long decimals are rounded and symbols are spoken (Σ = "sum of", ÷ = "divided by"). Nothing is invented: if a tool shows no answer yet, she presses Calculate first.
* **Cartoon style, original character:** bold outlines, flat bright colours, a big round head with huge eyes behind round glasses, a pointer stick, squash-and-stretch bounce, sparkles, a sweat drop, a "?" and "!" for emphasis, and a class of five students. Style only: the character is original, not a copy of any TV character.
* **Motion is a skeleton, not a clip:** arms are two-bone IK limbs that reach the chalk or the pointer's target; she walks along the board to stand beside the line she writes (never in front of the text) and returns to the middle; the mouth opens and closes while she speaks; blinking, head bob, gaze to the board or class; poses *greet, explain, write, point, count, ask, celebrate, oops, think*.
* **Not a video file:** a vector animation drawn live on a canvas, so it works offline, adds no downloads, and the CSP stays strict. The voice is the browser's speech synthesis; without a voice the captions set the pace. A canvas is released when its card is replaced (WebKit keeps removed canvases' memory until GC).
* Hand-written teaching notes (when to use it, what to watch) exist for about 55 topics in `TEACHER_TOPIC_NOTES`; the others use the tab's note.
* Tests: `tests/teacher.test.js` (lesson text, numbers, the solve parser) and `tests/e2e/teacher.js` (all 6 tabs and 103 topics open and draw; **solve mode runs on every tool with its sample data**; the button works with no answer yet; bad input gives the "oh no" class; a replaced card releases its canvas).

## How the narration works

* The **narrator is the browser's built-in speech voice** (Web Speech API). It works offline and nothing is sent to any server, which fits the site's
  strict Content-Security-Policy. If a browser has no voice, the caption timing is used instead.
* The **words are written from the real result**, not canned: the statistic, α, the cut-offs, the p-value and the verdict all come from the same numbers as the
  answer tile, so the narration can never disagree with it. (It is "AI tutor" in the teaching sense; there is no language-model call. A model could be
  added later by replacing the `line` strings, and the player would not change.)
* Controls: Play / Pause, Replay, "Narrate aloud" on/off, and numbered buttons to jump to a step. `prefers-reduced-motion` skips the motion and keeps the steps and captions.
  The canvas has a text description for screen readers, and the animation is left out of the printout.

## Adding the next animation

1. Write `js/core/tutor-<concept>.js` (helpers for drawing are in `TD`, top of `js/core/tutor.js`) with a function that returns a definition `{ key, title, hint, description, scenes: [{ id, title, line, ms }], draw(ctx, W, H, at) }`
   (see the header of `js/core/tutor.js`; `at.prog(k)` is how far scene *k* has played, 0 to 1).
2. Call `mountTutorCard(resultAreaId, definition)` from the tool after it calculates, and `hideTutorCard(key)` when it shows an error.
3. Add the file to `scripts/sync-script-tags.js`, run `npm run sync:scripts`, and add a test of the narration lines like `tests/tutor.test.js`.
