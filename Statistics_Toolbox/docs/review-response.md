# Response to the 14-point review (each claim checked against the code first)

| # | Claim | Result |
|---|---|---|
| 1 | `variance.js`, `z-score.js`, `hazard.js`, `helpers.js` contain mojibake and must be re-saved as UTF-8 | **Not true.** All three existing files are valid UTF-8 without a BOM and contain none of the listed sequences; `z-score.js` lives in `js/tools/preparation/`, not `descriptive/`. A repo-wide scan of every `.js`, `.html` and `.css` file found no mojibake. (The garbled text appears only when a file is *viewed* with the wrong encoding.) Tests that already guard this: `consistency.test.js` (valid UTF-8, no mojibake, no Cyrillic, the four named tools keep their symbols). |
| 2 | Add a test that tool titles are readable | **Done**, and wider than asked: every `render*Interface()` title is checked (no Cyrillic, no mojibake), plus exact checks for Z-scores and the hazard function. |
| 3 | The "Visualize Data" path is half-finished: register `dataChart`, `labelChart`, `registerChart`, or delete it | **Not true.** The path is live and complete: the histogram and box plot call `labelChart` on `#dataChart`, the chart instance is registered and destroyed by `destroyAllCharts`. Checked in a browser: Visualize Data draws, the canvas gets its description, closing the panel destroys the chart. Nothing was deleted. |
| 4 | Add `isPerfectFit` to `t-stats.js` | **Already there** (`t-stats.js` line 79, with the shared `PERFECT_FIT_MESSAGE`), and `review-fixes.test.js` covers `computeTStatsWithSteps` in its perfect-fit loop. |
| 5 | Escape category labels in `cramers-v.js` | **True, fixed.** The parse loop now uses `escapeHtml`; test with `<b>x</b>` as a category. |
| 6 | Extend `leftoverInline` to `-steps.js` files | **Not needed.** `toolFiles()` already walks every `.js` under `js/tools`, `-steps.js` included; `extract-styles.js --check` passes. |
| 7 | Add a Tukey timing guard at k = 6, df = 100 | **Done.** It measures about 0.1 s, so no panels needed reducing; a test now fails if it ever exceeds 2 s. |
| 8 | Reconcile the size budget | **True, fixed.** One budget (440 KB gzipped / 1700 KB raw) in `report-size.js`; the README states the same number; `structure.test.js` fails if the README's budget or measured size drifts from the real ones. |
| 9 | Fix the ANCOVA test | **True, and worse than described.** The old test fed a format the tool rejects and passed on any error, so it proved nothing. It now uses the real format (`Y, Group, Covariate` lines) and asserts F(2, 5) = 58.947368 against statsmodels. |
| 10 | Durbin-Watson: state the table covers n ≤ 50 | **True, fixed.** The note now says n = 15 to 50 and 1 to 5 predictors. |
| 11 | Notify the user on an unknown `switchToStat` id | **True, fixed** (the user sees a message, and the tool falls back to the mean). Tested. |
| 12 | Remove the `if (dist !== 'normal' \|\| true)` wrapper | **Not present** anywhere in the code (`grep "\|\| true"` finds nothing). |
| 13 | Document `tidyNumber`'s `< 1e-10 → '0'` | **True, documented** next to the function, with a test (also records that 1.5e-10 prints as 1e-10). |
| 14 | Unify dark mode | **True, unified.** Only the guide page had a dark theme; the app and the other pages did not. All pages are now light-only (`color-scheme: light`), and a test forbids a stray dark theme. |
