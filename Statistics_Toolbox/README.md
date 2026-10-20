# StatLab: Statistics Toolbox

An interactive statistics workbench: paste data, pick one of 99 techniques, and get the result, the formula,
a full worked solution and a chart. It is a static site with **no build step**: open `Statistics.html` in a
browser (Chart.js and the fonts are bundled in `vendor/`, so it works fully offline; Chart.js is only loaded when the first chart is drawn).
Not sure which technique fits your question? Open **[Which tool should I use?](Which-tool.html)**: it starts from the question you are asking and
links straight into the right tool (`Statistics.html#tool=<id>` opens a tool directly).

## Layout

```
Statistics.html            Page shell only: header, tabs, sidebars (static, accessible markup), script tags
Which-tool.html            "Which tool should I use?" guide: questions -> tools, each link a #tool=<id> deep link (css/guide.css; a test checks every id exists)
css/statlab.css            Styles, and the --tp-* palette tokens for result panels
css/tool-panels.css        s-xxxxxx classes generated from the inline styles of every tool (scripts/extract-styles.js), plus the hand-written tp-* state classes
css/responsive.css         Phone / tablet rules (breakpoints 1100, 900, 640, 420)
vendor/                    Chart.js and web fonts, self-hosted (see vendor/README.md for versions and licenses)
js/core/numerics.js        Special functions, CDFs and exact critical values (normal, t, F, chi-square, beta,
                           studentized range, Shapiro-Wilk, Lilliefors), Type 7 quantiles (quantileType7) and the generic
                           matrix helpers (multiplyMatrices, inverseMatrix, transposeMatrix, olsRSquared, computeEigenvalues).
                           Single source of truth: tools never carry their own copy.
js/core/toolkit.js         buildInterface(), defineListTool(), setHtml() (sanitised HTML insertion), escapeHtml()
js/core/charts.js          One variable per plotting tool for its Chart.js instance, lazy loading of Chart.js, labelChart() (accessible chart names)
                           and the shared canvas hover tooltip
js/core/helpers.js         Input parsing (parseNumbersFromInput, parseValueGroupInput), parameter validation (validateDistributionParams),
                           binomialPMF, simpleRegressionCore and other helpers shared by several tools
js/core/distributions.js   Mean, variance, skewness and kurtosis of the six distributions, defined once (distributionMoments)
js/tools/preparation/distribution-analysis.js  generateDistributionAnalysis(): the "Visualize Data" text under the Histogram and Box Plot charts
js/tools/<module>/*.js     One file per tool (about 100): renderXInterface(), computeX(), setupXLogic(); big tools add <tool>-steps.js (worked-solution HTML);
                           js/tools/regression/regression-html.js holds table rows shared by the simple-regression tools
                           modules: descriptive, preparation, probability, correlation, hypothesis, regression
js/app.js                  Route table (STAT_ROUTES), tab/sidebar navigation, chart controls
js/ui/*.js                 Presentation layer: navigation + search, answer tiles and worked-solution layout, form a11y
scripts/sync-script-tags.js  Regenerates the <script> list in Statistics.html from the files under js/
scripts/extract-styles.js  Moves static inline styles in js/tools into css/tool-panels.css (npm run sync:styles; --check is run by the tests)
tests/                     Node tests (no dependencies) and a Playwright browser test
```

Scripts are plain classic scripts loaded in order, so they share one global scope. Order matters only for
code that runs at load time (the `const xTool = defineListTool(...)` lines and the toolkit), which is why `core/`
loads first and `app.js` after every tool. `npm run sync:scripts` writes the list for you.

## Two ways to define a tool

| | `defineListTool({...})` | `buildInterface({...})` |
|---|---|---|
| For | "paste a list of numbers, press Calculate" | everything else: two samples, groups, tables, parameters, plots |
| You write | configuration + `computeX(numbers)` | `renderXInterface()` (a `buildInterface` call) + `computeX(...)` + `setupXLogic()` |
| Element ids | derived from `id` (`<id>Input`, `<id>ComputeBtn`, `<id>ClearBtn`, `<id>ResultArea`, `<id>ValueDisplay`, `<id>StepsDisplay`) | yours; list them in `inputs`, `run`, `clear`, `result` |
| Wiring | done for you: parse, empty/min-count checks, error display, Clear button | you attach the Calculate handler and call `attachClearHandler(clearBtnId, fieldIds, resultAreaId)` |
| Result of `compute` | `{ steps, ...values }` or `{ error: true, message }`; `display(result)` turns it into the answer tile | the same shape; your handler decides what goes in the answer tile and the steps |

`attachClearHandler` takes one id or a **list** of ids and empties every listed `<textarea>` or `<input>` and hides the result
area, so a two-sample tool clears both boxes. A tool is never half-defined: either it is built with `defineListTool` or its
`render` function returns a `buildInterface` string (a test renders every interface and checks the markup is well formed).

## Adding a tool

**A list-of-numbers tool** (mean, variance, skewness, ...) is configuration only. Write `computeMyTool(numbers)`
(returns `{ steps, ...values }` or `{ error: true, message }`) and declare the tool:

```js
const myTool = defineListTool({
    id: 'my', interfaceId: 'statMyInterface', title: '...', formula: '...', desc: '...',
    placeholder: 'Example: 1, 2, 3', buttonText: '...', resultLabel: '...',
    empty: { value: 'No data', steps: 'Enter numbers ...' },
    compute: computeMyTool, display: r => r.value.toFixed(6)
});
```

**Any other tool** (two samples, grouped data, tables, plots) writes `renderMyToolInterface()` as a
`buildInterface({...})` call (title, formula card, a list of labelled inputs, buttons and result ids; see the comment in
`core/toolkit.js`), plus `computeMyTool(...)` and `setupMyToolLogic()` (wires Calculate/Clear).

Put the tool in `js/tools/<module>/<name>.js`, then register it: one row in `STAT_ROUTES` (`js/app.js`), one
`<button class="stat-btn" data-stat="my">` in the right sidebar of `Statistics.html`, and run `npm run sync:scripts`.

Rules for all tools:
* Use `normCDF`, `tCriticalValue`, `fCriticalValue`, `chiSquareCriticalValue`, ... from `core/numerics.js` rather than
  lookup tables or local approximations.
* Return `{ error: true, message }` for bad input and say how to fix it.
* **Escape user text** (`escapeHtml`) before it goes into generated HTML, and insert HTML only with `setHtml(element, html)`
  (it strips scripts, event handlers and `javascript:` URLs). Never assign to `.innerHTML`; a test enforces this. The page also ships a Content-Security-
  Policy that blocks inline scripts and event handlers, so never emit `onclick=`/`<script>`; mark clickable parts with
  a `data-*` attribute and handle it in `app.js`.
* **Quantiles are Type 7 everywhere** (the NumPy / SciPy / R default: position (n - 1)p, linear interpolation). Use
  `quantileType7(sortedValues, p)` and `describeQuantileType7(...)` for the worked step; never re-implement hinges or medians of halves.
* **Zero variance is an error, not 0.** A correlation or ratio that is undefined for the data returns `{ error: true, message }`.
* **Confidence intervals are two-sided at 1 - alpha** (`tCriticalValue(alpha / 2, df)`), whatever the alternative of the test; use the
  t quantile, never 1.96, when the standard deviation is estimated. `rejectH0` is always `pValue < alpha`.
* **Sample data contract:** the "Try sample data" button reads the `Example:` text in a textarea's `placeholder`
  attribute (HTML entities such as `&#10;` are decoded; category names without digits are fine; under 700 characters, no markup). Keep that
  format: a unit test fails for any textarea without an `Example:` placeholder. Tools that are pure parameter forms (no pasted data) declare
  `parameterOnly: true` in their `buildInterface` config, have no textarea and are the only ones without a button; `tests/e2e/sample.js` presses the
  button of every other tool and checks the answer. The rule is repeated where the placeholder is read (`js/ui/forms.js`) and where interfaces are built (`js/core/toolkit.js`).
* **One definition per statistic.** The same number must never differ between tools. Quartiles, medians and percentiles: `quantileType7`.
  Skewness and kurtosis: `sampleSkewness` / `sampleExcessKurtosis` (the adjusted estimators the Skewness and Kurtosis tools use). Perfect
  regression fit: `isPerfectFit` (the inference tools stop with `PERFECT_FIT_MESSAGE`; the descriptive tools report R² = 1 and print
  "undefined" for t and F). Within-group tests: `withinGroupError` (fewer than one residual degree of freedom, or no variation inside the groups, is an error).
  Distribution parameters: `validateDistributionParams`. `tests/consistency.test.js` runs the same data through every tool that shows one of these.
* **RMSE and the residual standard error are different numbers.** Model Summary reports RMSE = √(SS<sub>res</sub> / n) (the average prediction error on
  these points) and, next to it, the residual standard error √(SS<sub>res</sub> / (n - k - 1)) that regression software prints. Both are labelled with their divisor.
* **Eigenvalues.** `symmetricEigenvalues` (Jacobi) is for covariance / SSCP / correlation matrices; `generalizedSymmetricEigenvalues(B, W)` gives the
  eigenvalues of W⁻¹B in the symmetric form L⁻¹BL⁻ᵀ (W = LLᵀ) and is what MANOVA uses. `computeEigenvalues` is the general QR routine: it is only valid
  when every eigenvalue is real, and returns NaN (not a wrong real number) when they are not.
* Plotting tools give their canvas a descriptive label with `labelChart(canvas, text)` (sample size, range, centre), and the chart canvas
  lives in the worked solution only: one canvas id per page.
* Each plotting tool keeps its Chart.js instance in a module-level `let ...Chart = null;`. Add the variable to
  and register it on the next line with `registerChart(() => name, () => { name = null; })` in `js/core/charts.js`; `destroyAllCharts()` then releases it (a test fails if you forget).
* Chart.js is not a `<script>` tag: `vendor/chart.umd.js` is fetched on the first chart. Start every chart-drawing function with
  `if (!chartJsReady(thisFunction, arguments)) return;`, which loads the library and then calls the function again.
* Probability tools that ask for distribution parameters call `showDistributionParams('prefix')` from their `updateXParams()`
  (fields live in `DISTRIBUTION_PARAMS` in `core/toolkit.js`; inputs get the ids `prefixMean`, `prefixStd`, `prefixRate`, ...).

## Checklist for adding or changing a tool

1. Put the tool in `js/tools/<module>/<name>.js`; keep it under 600 lines (a test enforces the budget). Move the worked-solution HTML to `<name>-steps.js`
   (`stepsHtmlName(scope)`, see `scheffe.js` / `manova.js`) when it grows.
2. Run `npm run sync:scripts` (script tags) and `npm run sync:styles` (inline styles to classes); add the sidebar button with a `data-stat` id and register the route in `js/app.js`.
3. Use the shared definitions listed under *One definition per statistic*; do not write a second quantile, skewness or critical-value routine.
4. Bad input returns `{ error: true, message }` that says how to fix it; zero variance, a perfect fit, fewer than one residual degree of freedom and overflow are errors, never `NaN` or `Infinity` in the output.
5. Escape user text (`escapeHtml`) that goes into generated HTML; labels typed by the user are escaped once, where they are parsed.
6. Give every pasted-data textarea an `Example:` placeholder (sample-data contract above) or mark the tool `parameterOnly: true`.
7. Plotting tool: own Chart.js variable registered with `registerChart(...)`, `chartJsReady(...)` first, `labelChart(...)` for the canvas.
8. Add a row to `Which-tool.html` (a card under the question the tool answers) and, if the tool uses an approximation, a row to the accuracy table below.
9. Add a test: a known value from SciPy / R / statsmodels for the calculation, and an edge case (one value, identical values, perfect fit).
10. `npm test` (and `npm run test:e2e` with Playwright installed) must pass before you commit.

## Design notes

* **`setHtml()` fallback.** `setHtml(element, html)` parses into an inert `<template>`, strips anything that can run code and attaches the
  result. If the environment has no real `<template>` (the unit tests run the scripts against a stub DOM, and take this path), it falls back to
  assigning the string to the element after removing every `on*="…"` handler attribute from its tags. That is not a full sanitiser (there is
  no DOM tree to walk), and there is no browser to execute the markup anyway; it exists only so calculation code can be tested in Node and must
  never be relied on for untrusted input. In a browser the sanitised path is always used, and a unit test checks that the fallback still strips handlers.
* **One breakpoint file.** `css/responsive.css` is the only place that sets media-query breakpoints (including 900 px). Generated result markup
  carries layout in classes (`.gen-grid`, `.gen-flex`, `.gen-pad`, ...) and the responsive CSS targets those. `scripts/extract-styles.js` adds them
  statically when it converts a tool's inline style; `tagGeneratedLayout()` in `js/ui/solution.js` still adds them to the few inline styles that
  remain (colours chosen from the data at run time).
* **Tool markup is styled by classes, not inline styles.** Run `npm run sync:styles` after writing a tool: every static `style="..."` in
  `js/tools` becomes `class="s-xxxxxx"` and the rule is written to `css/tool-panels.css` (with the old palette re-theming applied through the
  `--tp-*` tokens, so `statlab.css` no longer matches substrings of style attributes). Styles that depend on data (`style="color: ${color}"`) stay
  inline; a style of the form `${cond ? 'css' : 'css'}` becomes `class="${cond ? 's-a' : 's-b'}"`. `display: none` stays inline because scripts toggle it.
  The tests fail if a convertible inline style remains, a class has no rule, a rule is unused, or an inline style uses one of the old accent colours.
* **The Content-Security-Policy allows `style-src 'unsafe-inline'` on purpose.** Static inline styles were moved to classes, but many places in the tools still
  put a value that is only known at run time into a `style` attribute (a colour chosen from the data, a bar width from a percentage, `display: none`
  toggled by scripts). Without `'unsafe-inline'` those would need a nonce or a generated stylesheet per result. Scripts stay locked down (`script-src 'self'`, no inline handlers), which is where the risk is.
* **Tabs are `div role="tab"` elements.** They follow the WAI-ARIA tabs pattern (roving `tabindex`, arrow keys, Home/End, `aria-selected`, `aria-controls`). Native `<button>` elements
  would be equivalent for assistive technology; this was left as is on purpose and would only change in a rewrite of the tab bar.
* **Worked solutions are labelled regions, not live regions.** The short answer is the live region (`role="status"`); the derivation is read when the user moves to it.
* **Answer tiles keep a live value.** When the answer is split into tiles (`.kpi-row`, hidden from assistive technology), the plain value stays
  in the page, visually clipped, as the `role="status"` live region that announces "Answer: ...".

* **Classic scripts, not ES modules.** The page is meant to open straight from disk (`file://`), where browsers
  refuse to load ES modules. The cost is one shared global scope, which `tests/structure.test.js` polices
  (duplicate definitions, route integrity). Moving to modules would require serving the folder over http and a bundler.
* **No build step** means no minification or tree-shaking: the page loads about 1.5 MB of script from disk, about 390 KB once a web server gzips it (`npm run size` prints both and CI enforces a budget; `tests/structure.test.js` fails if the 1.5 MB drifts more than 10%) (instant locally,
  noticeable over a slow network if you host it). Chart.js and the fonts are vendored, so there are no CDN requests and
  the Content-Security-Policy only allows the page's own files.

## Accuracy and verification

**How results are computed**

| Quantity | Method | Accuracy |
|---|---|---|
| Normal, t, F, chi-square, beta, gamma CDFs and critical values | Exact (incomplete gamma / beta functions, bisection for quantiles) | about 1e-12 |
| Studentized range (Tukey HSD) | Numerical integration (Gauss-Legendre) | about 1e-9 |
| Shapiro-Wilk W and p | Royston (1992/1995), same algorithm as SciPy and R | W to 1e-9, p to 1e-7 |
| Kolmogorov-Smirnov (normality) | Lilliefors null distribution, simulated with a fixed seed and cached per n | p within about 0.004 |
| Anderson-Darling p | D'Agostino and Stephens polynomial formulas | approximate (3 digits) |
| MANOVA F | Rao's approximation to Wilks' Lambda | exact for 1-2 dependent variables or 2-3 groups; the answer tile says "exact F" or "Rao F approximation" |
| Mann-Whitney, Wilcoxon | **Exact** null distribution when there are no ties (Mann-Whitney: both samples ≤ 20; Wilcoxon: ≤ 50 non-zero pairs); otherwise the normal approximation | exact = SciPy `method="exact"` to 1e-12; with ties the tile says "normal approx." for small samples |
| Runs test | Normal approximation | rough for fewer than about 10 runs |
| Kruskal-Wallis, Friedman, Cochran Q, Mood's median, chi-square tests | Asymptotic chi-square | needs reasonable sample sizes; expected counts below 5 weaken the p-value |
| Sign test, binomial exact | Exact binomial | exact |

**Known approximations**

These tools give a close answer, not an exact one, and say so in their worked solution where it matters:

* **Rank tests.** Mann-Whitney and Wilcoxon give the exact p-value (counting every arrangement of the ranks / every sign pattern) when
  there are no ties and the samples are small. With ties, or for larger samples, they use the normal approximation with a 0.5 continuity
  correction (moved toward the null for every alternative), the tie correction to the variance and (Wilcoxon) zero differences dropped;
  SciPy's `method="asymptotic"` / `"approx"` agrees to 1e-10. The answer tile says "(exact)" or "(normal approx.)".
* **Kendall's tau is tau-b** (ties in X or Y corrected). Without ties it equals tau-a. **Spearman's rho** is the Pearson correlation of the
  average ranks, so ties are handled; **Friedman** divides by the tie correction C.
* **Box-Cox** maximises the profile log-likelihood by a grid scan on [-5, 5] plus golden-section refinement (lambda to about 1e-8); data must be positive.
* **VIF** regresses each predictor on all the others by least squares (normal equations). Perfectly collinear predictors give an infinite VIF.
* **Model summary (MAPE, adjusted R²).** MAPE leaves out points whose actual value is 0 (a percentage error is undefined there) and says how many
  it used. Adjusted R² uses the number of predictors k you enter (1 for simple regression).
* **Beta random numbers for tiny shapes.** They are drawn in log space, so they never underflow, but for α or β around 0.001 the true distribution is
  almost two spikes at 0 and 1, and many draws are exactly 0 or 1 in double precision. Means are still correct.
* **Random numbers** use `Math.random` (or a seeded 32-bit generator when a seed is given: the seed is read as an integer and only its low 32 bits matter). Normals come from Box-Muller (both values of each
  pair are used), Gamma from Marsaglia-Tsang, Beta as a Gamma ratio (or rejection sampling when both shapes exceed 1, with the Gamma ratio as the exact fallback if a very peaked Beta exhausts the attempt limit). They are for teaching
  and simulation, not cryptography.
* **Entropy** of Normal, Exponential, Uniform and Beta is closed form; Poisson and Binomial are summed exactly in a window around the mean (beyond variance 1e7 / 1e8 the asymptotic expansion replaces the sum, which is accurate to far more digits than shown); the Beta entropy uses a series digamma (about 1e-12).
* **Lilliefors K-S** p-values come from a seeded simulation (deterministic, about +-0.004).
* **Anderson-Darling p** uses polynomial approximations (about 3 digits). **MANOVA** uses Rao's F approximation.
* **Histogram** bin rules (Sturges, Freedman-Diaconis) are suggestions; the chart uses the bin count you choose.

**What has been checked against a reference implementation (SciPy / statsmodels / NumPy)**

* **`tests/reference-values.test.js` compares tools with SciPy / statsmodels / NumPy values** stored in `tests/fixtures/reference-values.json`
  (`tests/fixtures/make-reference.py` regenerates it; `npm test` itself needs no Python). It covers: paired t and Welch t (every alternative),
  Levene (mean-centred), Bartlett, Mood's median, ANOVA / Scheffé F, Bonferroni pairwise t, McNemar, phi, Cramér's V, covariance, partial
  correlation, point-biserial, correlation matrix, distance correlation, Durbin-Watson, simple-regression standard errors / t / p / overall F /
  R² / adjusted R², Model Summary (R², RMSE, RSE, MAE, MAPE), ANCOVA, Lilliefors D, MAD, SEM, skewness, kurtosis, CV, winsorizing, ranking,
  z-scores, min-max, IQR fences, exact Mann-Whitney and Wilcoxon, histogram and binning counts, log transforms, mutual information (bits), Normal / Exponential / Uniform MLE fits, and a grid of CDFs, PMFs and critical values (normal, t, chi-square, F, beta, binomial).
* **Also tested** (other test files): mean, variance, geometric and harmonic mean, one-sample t, one-way ANOVA, Pearson, multiple linear regression,
  chi-square independence and goodness of fit, F-test, MANOVA, Tukey HSD, Shapiro-Wilk, Anderson-Darling, one-sample z, one-proportion z, binomial exact,
  Kruskal-Wallis, Friedman, Cochran Q, runs test, Cook's distance, sign test, Kendall tau-b, Spearman with ties, VIF, Box-Cox lambda, entropy, MGF,
  hazard and survival functions, random Beta moments, and the quartile/percentile/decile tools (Type 7).
* **Not independently verified against a reference implementation:** stem-and-leaf layout, the violin plot's density curve, Q-Q and P-P plot
  coordinates, and the PDF / CDF / PMF / quantile / random-number / distribution-moment tool screens (their underlying functions are in the
  grid check above). They share the verified numerics layer, but their own formulas and worked solutions may still contain mistakes. Please report
  any result that disagrees with R, SciPy or a textbook.

## Tests

```
npm test            # unit tests, no dependencies (Node 20+)
npm install         # once, for the browser test
npx playwright install chromium
npm run test:e2e    # opens every tool in a real browser, loads sample data, presses Calculate
npm run test:e2e:quick   # the same minus the 7-minute edge-case sweep
BROWSER=firefox npm run test:e2e:quick   # or webkit; CI runs Chromium, Firefox and WebKit
npm run size        # script size (raw and gzip) against the budget
npm run test:all    # both
```

* `.github/workflows/ci.yml` runs the unit tests on Node 20 and 22 and the browser test on every pull request
* `tests/e2e/edge-cases.js`: every tool with one value, identical values, zeros, negatives and huge numbers: no freeze, no script error, and any NaN/Infinity comes with an explanation
* `tests/e2e/responsive.js`: no tool makes the page scroll sideways at 360 px and 768 px
* `tests/e2e/lazy-chartjs.js`: Chart.js is not fetched at page load, is fetched once on the first chart, and a failed fetch shows a message and can be retried
* `tests/e2e/smoke.js`: every tool opens, sample data produces a result with no NaN/undefined, no script or console errors
* `tests/e2e/sample.js`: sample data + Calculate for every tool: no NaN/Infinity, no entity debris in the sample, an "Answer:" label, a labelled (not live) worked-solution region, no duplicate ids, labelled charts, a labelled tab panel
* `tests/numerics.test.js`: special functions and critical values against SciPy reference values
* `tests/calculations.test.js`: whole tests (t, ANOVA, ANCOVA, MANOVA, Tukey, Shapiro-Wilk, ...) against SciPy/NumPy
* `tests/toolkit-and-safety.test.js`: toolkit behaviour, HTML escaping, CSP / no inline handlers, chart cleanup
* `tests/parsing-and-ui.test.js`: input parsing edge cases, `parseSolution`, larger-sample normality tests
* `tests/structure.test.js`: no duplicate function definitions or top-level `const`/`let`/`class` names, every function lives in the file that names it, every script parses,
  no mangled closing tags or unterminated attributes, rendered interfaces are balanced, every button has a route and vice versa,
  rendered interfaces have unique ids, accessibility basics of the page shell

The tests load the real browser scripts into a Node `vm` context with a stub DOM, so they exercise exactly
the code the page runs.
