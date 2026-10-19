# StatLab: Statistics Toolbox

An interactive statistics workbench: paste data, pick one of 99 techniques, and get the result, the formula,
a full worked solution and a chart. It is a static site with **no build step**: open `Statistics.html` in a
browser (Chart.js and the fonts are bundled in `vendor/`, so it works fully offline; Chart.js is only loaded when the first chart is drawn).

## Layout

```
Statistics.html            Page shell only: header, tabs, sidebars (static, accessible markup), script tags
css/statlab.css            Styles, and the --tp-* palette tokens for result panels
css/tool-panels.css        Classes generated from the inline styles of the largest tools (MANOVA, ANCOVA, Levene, Bartlett, Cook's distance, Bonferroni, Scheffe)
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
js/tools/<module>/*.js     One file per tool (about 100): renderXInterface(), computeX(), setupXLogic(); big tools add <tool>-steps.js (worked-solution HTML);
                           js/tools/regression/regression-html.js holds table rows shared by the simple-regression tools
                           modules: descriptive, preparation, probability, correlation, hypothesis, regression
js/app.js                  Route table (STAT_ROUTES), tab/sidebar navigation, chart controls
js/ui/*.js                 Presentation layer: navigation + search, answer tiles and worked-solution layout, form a11y
scripts/sync-script-tags.js  Regenerates the <script> list in Statistics.html from the files under js/
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
  attribute (HTML entities such as `&#10;` are decoded; category names without digits are fine). Keep that format;
  tools that are pure parameter forms (no pasted data) are the only ones without a button, and `tests/e2e/sample.js` lists them.
* Plotting tools give their canvas a descriptive label with `labelChart(canvas, text)` (sample size, range, centre), and the chart canvas
  lives in the worked solution only: one canvas id per page.
* Each plotting tool keeps its Chart.js instance in a module-level `let ...Chart = null;`. Add the variable to
  `destroyAllCharts()` in `js/app.js` (a test fails if you forget).
* Chart.js is not a `<script>` tag: `vendor/chart.umd.js` is fetched on the first chart. Start every chart-drawing function with
  `if (!chartJsReady(thisFunction, arguments)) return;`, which loads the library and then calls the function again.
* Probability tools that ask for distribution parameters call `showDistributionParams('prefix')` from their `updateXParams()`
  (fields live in `DISTRIBUTION_PARAMS` in `core/toolkit.js`; inputs get the ids `prefixMean`, `prefixStd`, `prefixRate`, ...).

## Design notes

* **`setHtml()` fallback.** `setHtml(element, html)` parses into an inert `<template>`, strips anything that can run code and attaches the
  result. If the environment has no real `<template>` (the unit tests run the scripts against a stub DOM, and take this path), it falls back to
  assigning the string to the element after removing every `on*="…"` handler attribute from its tags. That is not a full sanitiser (there is
  no DOM tree to walk), and there is no browser to execute the markup anyway; it exists only so calculation code can be tested in Node and must
  never be relied on for untrusted input. In a browser the sanitised path is always used, and a unit test checks that the fallback still strips handlers.
* **One breakpoint file.** `css/responsive.css` is the only place that sets media-query breakpoints (including 900 px). Generated result markup
  carries inline styles; `tagGeneratedLayout()` in `js/ui/solution.js` turns the layout-relevant ones into classes (`.gen-grid`,
  `.gen-flex`, ...) and the responsive CSS targets those classes. The colour re-theming rules in `statlab.css` still match substrings of the
  inline `style` attribute; replacing them means changing the tools that emit the inline colours (long-term clean-up).
* **Answer tiles keep a live value.** When the answer is split into tiles (`.kpi-row`, hidden from assistive technology), the plain value stays
  in the page, visually clipped, as the `role="status"` live region that announces "Answer: ...".

* **Classic scripts, not ES modules.** The page is meant to open straight from disk (`file://`), where browsers
  refuse to load ES modules. The cost is one shared global scope, which `tests/structure.test.js` polices
  (duplicate definitions, route integrity). Moving to modules would require serving the folder over http and a bundler.
* **No build step** means no minification or tree-shaking: the page loads about 1.7 MB of script from disk (instant locally,
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
| MANOVA F | Rao's approximation to Wilks' Lambda | exact only for 1-2 dependent variables or 2-3 groups |
| Mann-Whitney, Wilcoxon, runs test | Normal approximation | **not exact for small samples** (e.g. n = 6 vs 7 can differ from SciPy's exact p) |
| Kruskal-Wallis, Friedman, Cochran Q, Mood's median, chi-square tests | Asymptotic chi-square | needs reasonable sample sizes; expected counts below 5 weaken the p-value |
| Sign test, binomial exact | Exact binomial | exact |

**Known approximations**

These tools give a close answer, not an exact one, and say so in their worked solution where it matters:

* **Normal approximations for rank tests.** Mann-Whitney and Wilcoxon use the normal approximation with a 0.5 continuity correction
  (moved toward the null for every alternative), the tie correction to the variance, and (Wilcoxon) zero differences dropped. SciPy's
  `method="asymptotic"` / `"approx"` agrees to 1e-10; for small samples without ties SciPy's exact p-value can differ.
* **Kendall's tau is tau-b** (ties in X or Y corrected). Without ties it equals tau-a. **Spearman's rho** is the Pearson correlation of the
  average ranks, so ties are handled; **Friedman** divides by the tie correction C.
* **Box-Cox** maximises the profile log-likelihood by a grid scan on [-5, 5] plus golden-section refinement (lambda to about 1e-8); data must be positive.
* **VIF** regresses each predictor on all the others by least squares (normal equations). Perfectly collinear predictors give an infinite VIF.
* **Model summary (MAPE, adjusted R²).** MAPE leaves out points whose actual value is 0 (a percentage error is undefined there) and says how many
  it used. Adjusted R² uses the number of predictors k you enter (1 for simple regression).
* **Beta random numbers for tiny shapes.** They are drawn in log space, so they never underflow, but for α or β around 0.001 the true distribution is
  almost two spikes at 0 and 1, and many draws are exactly 0 or 1 in double precision. Means are still correct.
* **Random numbers** use `Math.random` (or a seeded 32-bit generator when a seed is given: the seed is read as an integer and only its low 32 bits matter). Normals come from Box-Muller (both values of each
  pair are used), Gamma from Marsaglia-Tsang, Beta as a Gamma ratio (or rejection sampling when both shapes exceed 1). They are for teaching
  and simulation, not cryptography.
* **Entropy** of Normal, Exponential, Uniform and Beta is closed form; Poisson and Binomial are summed exactly; the Beta entropy uses a series digamma (about 1e-12).
* **Lilliefors K-S** p-values come from a seeded simulation (deterministic, about +-0.004).
* **Anderson-Darling p** uses polynomial approximations (about 3 digits). **MANOVA** uses Rao's F approximation.
* **Histogram** bin rules (Sturges, Freedman-Diaconis) are suggestions; the chart uses the bin count you choose.

**What has been checked against a reference implementation (SciPy / statsmodels / NumPy)**

* **28 tools have automated tests** in `tests/`: mean, variance, geometric and harmonic mean, one-sample t, Welch t,
  one-way ANOVA, Pearson, simple and multiple linear regression, chi-square independence and goodness of fit,
  F-test, ANCOVA, MANOVA, Tukey HSD, Scheffe, Shapiro-Wilk, Anderson-Darling, Kolmogorov-Smirnov, one-sample z,
  binomial exact, Kruskal-Wallis, Friedman, Cochran Q, runs test, Cook's distance, Mann-Whitney (decision).
* **Also tested against SciPy / NumPy:** sign test, Wilcoxon, Mann-Whitney (one- and two-sided), one-sample z and one-proportion z
  (every alternative), F-test (every alternative), Kendall tau-b, Spearman with ties, Friedman with ties, VIF, Box-Cox lambda,
  entropy, MGF, hazard and survival functions, random Beta moments, and the quartile/percentile/decile tools (Type 7).
* **Compared by hand once, no automated test yet:** paired t, Levene, Mood's median.
* **The remaining tools have not been independently verified.** They share the verified numerics layer, but
  their own formulas and worked solutions may still contain mistakes. Please report any result that disagrees with
  R, SciPy or a textbook.

## Tests

```
npm test            # unit tests, no dependencies (Node 20+)
npm install         # once, for the browser test
npx playwright install chromium
npm run test:e2e    # opens every tool in a real browser, loads sample data, presses Calculate
npm run test:all    # both
```

* `.github/workflows/ci.yml` runs the unit tests on Node 20 and 22 and the browser test on every pull request
* `tests/e2e/edge-cases.js`: every tool with one value, identical values, zeros, negatives and huge numbers: no freeze, no script error, and any NaN/Infinity comes with an explanation
* `tests/e2e/responsive.js`: no tool makes the page scroll sideways at 360 px and 768 px
* `tests/e2e/lazy-chartjs.js`: Chart.js is not fetched at page load, is fetched once on the first chart, and a failed fetch shows a message and can be retried
* `tests/e2e/smoke.js`: every tool opens, sample data produces a result with no NaN/undefined, no script or console errors
* `tests/e2e/sample.js`: sample data + Calculate for every tool: no NaN/Infinity, no entity debris in the sample, an "Answer:" label, an `aria-live` solution, no duplicate ids, labelled charts, a labelled tab panel
* `tests/numerics.test.js`: special functions and critical values against SciPy reference values
* `tests/calculations.test.js`: whole tests (t, ANOVA, ANCOVA, MANOVA, Tukey, Shapiro-Wilk, ...) against SciPy/NumPy
* `tests/toolkit-and-safety.test.js`: toolkit behaviour, HTML escaping, CSP / no inline handlers, chart cleanup
* `tests/parsing-and-ui.test.js`: input parsing edge cases, `parseSolution`, larger-sample normality tests
* `tests/structure.test.js`: no duplicate function definitions or top-level `const`/`let`/`class` names, every function lives in the file that names it, every script parses,
  no mangled closing tags or unterminated attributes, rendered interfaces are balanced, every button has a route and vice versa,
  rendered interfaces have unique ids, accessibility basics of the page shell

The tests load the real browser scripts into a Node `vm` context with a stub DOM, so they exercise exactly
the code the page runs.
