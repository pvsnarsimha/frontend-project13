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

Above the inputs of **every one of the 103 topics** there is an animated classroom where an AI maths teacher teaches that topic at the chalkboard.
Clicking a **tab** opens a class that introduces the whole tab; clicking a **topic** opens that topic's class ("This topic" / "About this tab" switch between them).

| Piece | File |
|---|---|
| Lessons: the scenes, the words, the worked example on the student's own numbers | `js/core/teacher-lessons.js` |
| The classroom and the teacher (canvas drawing, skeleton, gestures) | `js/core/teacher.js` |
| Player (Play / Pause / Replay / voice / step buttons), shared with the animations above | `js/core/tutor.js` |

* **Each class has 7 scenes** (a tab overview has 6): welcome, why we use it, the formula chalked up, how it fits the tab's method, **your own numbers**, a "who can tell me?" question (a student puts a hand up) and a wrap-up.
* **Based on what the student gave:** the topic and tab come from the page; if numbers are typed in the tool the teacher reads them back (n, smallest, largest, mean, SD) and works out the topic's own statistic where it is a simple one (mean, median, mode, range, variance, SD, SE, CV, geometric, harmonic, sum of squares). The lesson refreshes as the student types (not while it is playing). Without numbers she asks the student to type some.
* **Teacher motion is a skeleton, not a clip:** arms are two-bone IK limbs that really reach the chalk; she walks along the board to stand beside the line she is writing and returns to the middle; mouth opens and closes while she speaks; blinking, breathing, nodding; gaze to the board or to the class; poses *greet* (waves), *explain* (open hands), *write*, *point*, *count*, *ask*.
* **Not a video file and not photographic:** it is a stylised 2-D illustration drawn live on a canvas, so it works offline, adds no downloads, and the CSP stays strict. The voice is the browser's speech synthesis, as for the other animations; without a voice the captions set the pace.
* Hand-written teaching notes (when to use it, what to watch) exist for about 55 topics in `TEACHER_TOPIC_NOTES`; the others use the tab's note. Add a line there to improve any topic.
* Tests: `tests/teacher.test.js` (lesson text and numbers) and `tests/e2e/teacher.js` (all 6 tabs and 103 topics open and draw, a full class plays through).

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
