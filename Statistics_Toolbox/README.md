# StatLab: Statistics Toolbox

An interactive statistics workbench: paste data, pick one of 99 techniques, and get the result, the formula,
a full worked solution and a chart. It is a static site with **no build step**: open `Statistics.html` in a
browser (Chart.js and the fonts are bundled in `vendor/`, so it works fully offline).

## Layout

```
Statistics.html            Page shell only: header, tabs, sidebars (static, accessible markup), script tags
css/statlab.css            Styles
css/responsive.css         Phone / tablet rules (breakpoints 1100, 900, 640, 420)
vendor/                    Chart.js and web fonts, self-hosted (see vendor/README.md for versions and licenses)
js/core/numerics.js        Special functions, CDFs and exact critical values (normal, t, F, chi-square, beta,
                           studentized range, Shapiro-Wilk, Lilliefors). Single source of truth.
js/core/toolkit.js         buildInterface(), defineListTool(), setHtml() (sanitised HTML insertion), escapeHtml()
js/core/charts.js          One variable per plotting tool for its Chart.js instance
js/core/helpers.js         Input parsing and helpers shared by several tools
js/tools/<module>/*.js     One file per tool (about 100): renderXInterface(), computeX(), setupXLogic()
                           modules: descriptive, preparation, probability, correlation, hypothesis, regression
js/app.js                  Route table (STAT_ROUTES), tab/sidebar navigation, chart controls
js/ui/*.js                 Presentation layer: navigation + search, answer tiles and worked-solution layout, form a11y
scripts/sync-script-tags.js  Regenerates the <script> list in Statistics.html from the files under js/
tests/                     Node tests (no dependencies) and a Playwright browser test
```

Scripts are plain classic scripts loaded in order, so they share one global scope. Order matters only for
code that runs at load time (the `const xTool = defineListTool(...)` lines and the toolkit), which is why `core/`
loads first and `app.js` after every tool. `npm run sync:scripts` writes the list for you.

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
* **Sample data contract:** the "Try sample data" button reads the `Example:` text in a textarea's `placeholder`
  attribute. Keep that format; a test checks that nearly all tools still provide one.
* Each plotting tool keeps its Chart.js instance in a module-level `let ...Chart = null;`. Add the variable to
  `destroyAllCharts()` in `js/app.js` (a test fails if you forget).

## Design notes

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

**What has been checked against a reference implementation (SciPy / statsmodels / NumPy)**

* **28 tools have automated tests** in `tests/`: mean, variance, geometric and harmonic mean, one-sample t, Welch t,
  one-way ANOVA, Pearson, simple and multiple linear regression, chi-square independence and goodness of fit,
  F-test, ANCOVA, MANOVA, Tukey HSD, Scheffe, Shapiro-Wilk, Anderson-Darling, Kolmogorov-Smirnov, one-sample z,
  binomial exact, Kruskal-Wallis, Friedman, Cochran Q, runs test, Cook's distance, Mann-Whitney (decision).
* **8 more were compared by hand once** (paired t, Levene, Spearman, Kendall, sign test, Mood's median,
  one-proportion z, Wilcoxon) but have no automated test yet.
* **The remaining ~63 tools have not been independently verified.** They share the verified numerics layer, but
  their own formulas and worked solutions may still contain mistakes. Please report any result that disagrees with
  R, SciPy or a textbook.

## Tests

```
npm test            # unit tests, no dependencies (Node 18+)
npm install         # once, for the browser test
npx playwright install chromium
npm run test:e2e    # opens every tool in a real browser, loads sample data, presses Calculate
npm run test:all    # both
```

* `.github/workflows/ci.yml` runs the unit tests on Node 18/20/22 and the browser test on every pull request
* `tests/e2e/edge-cases.js`: every tool with one value, identical values, zeros, negatives and huge numbers: no freeze, no script error, and any NaN/Infinity comes with an explanation
* `tests/e2e/responsive.js`: no tool makes the page scroll sideways at 360 px and 768 px
* `tests/e2e/smoke.js`: every tool opens, sample data produces a result with no NaN/undefined, no script or console errors
* `tests/numerics.test.js`: special functions and critical values against SciPy reference values
* `tests/calculations.test.js`: whole tests (t, ANOVA, ANCOVA, MANOVA, Tukey, Shapiro-Wilk, ...) against SciPy/NumPy
* `tests/toolkit-and-safety.test.js`: toolkit behaviour, HTML escaping, CSP / no inline handlers, chart cleanup
* `tests/parsing-and-ui.test.js`: input parsing edge cases, `parseSolution`, larger-sample normality tests
* `tests/structure.test.js`: no duplicate function definitions, every button has a route and vice versa,
  rendered interfaces have unique ids, accessibility basics of the page shell

The tests load the real browser scripts into a Node `vm` context with a stub DOM, so they exercise exactly
the code the page runs.
