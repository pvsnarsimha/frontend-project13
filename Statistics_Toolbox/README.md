# StatLab: Statistics Toolbox

An interactive statistics workbench: paste data, pick one of 99 techniques, and get the result, the formula,
a full worked solution and a chart. It is a static site with **no build step**: open `Statistics.html` in a
browser (Chart.js and the web fonts load from a CDN).

## Layout

```
Statistics.html            Page shell only: header, tabs, sidebars (static, accessible markup), script tags
css/statlab.css            All styles
js/00-toolkit.js           defineListTool(): declarative definition of "paste numbers, press Calculate" tools, escapeHtml()
js/00-numerics.js          Special functions, CDFs and exact critical values (normal, t, F, chi-square,
                           beta, studentized range, Shapiro-Wilk, Kolmogorov). Single source of truth.
js/01..09-*.js             The tools: for each one a renderXInterface(), computeX() and setupXLogic()
js/app.js                  Route table (STAT_ROUTES), tab/sidebar navigation, chart controls
js/ui/*.js                 Presentation layer: navigation + search, answer tiles and worked-solution layout, form a11y
tests/                     Node tests (no dependencies)
```

Scripts are plain classic scripts loaded in order, so they share one global scope. Order matters only for
code that runs at load time, which is why `00-numerics.js` comes first and `app.js` last.

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

**Any other tool** (two samples, grouped data, tables, plots) hand-writes `renderMyToolInterface()` (form HTML),
`computeMyTool(...)` and `setupMyToolLogic()` (wires Calculate/Clear). These still carry the older, repetitive
template markup; porting them to a shared builder is the next refactoring step.

Then register it: one row in `STAT_ROUTES` (`js/app.js`) and one `<button class="stat-btn" data-stat="my">` in the
right sidebar of `Statistics.html`.

Rules for all tools:
* Use `normCDF`, `tCriticalValue`, `fCriticalValue`, `chiSquareCriticalValue`, ... from `00-numerics.js` rather than
  lookup tables or local approximations.
* Return `{ error: true, message }` for bad input and say how to fix it.
* **Escape user text** (`escapeHtml`) before it goes into generated HTML. The page also ships a Content-Security-
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
* **No build step** means no minification or tree-shaking; the page loads about 1.7 MB of script.

## Tests

```
npm test        # or: node --test
```

* `tests/numerics.test.js`: special functions and critical values against SciPy reference values
* `tests/calculations.test.js`: whole tests (t, ANOVA, ANCOVA, MANOVA, Tukey, Shapiro-Wilk, ...) against SciPy/NumPy
* `tests/toolkit-and-safety.test.js`: toolkit behaviour, HTML escaping, CSP / no inline handlers, chart cleanup
* `tests/parsing-and-ui.test.js`: input parsing edge cases, `parseSolution`, larger-sample normality tests
* `tests/structure.test.js`: no duplicate function definitions, every button has a route and vice versa,
  rendered interfaces have unique ids, accessibility basics of the page shell

The tests load the real browser scripts into a Node `vm` context with a stub DOM, so they exercise exactly
the code the page runs.
