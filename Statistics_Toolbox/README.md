# StatLab: Statistics Toolbox

An interactive statistics workbench: paste data, pick one of 99 techniques, and get the result, the formula,
a full worked solution and a chart. It is a static site with **no build step**: open `Statistics.html` in a
browser (Chart.js and the web fonts load from a CDN).

## Layout

```
Statistics.html            Page shell only: header, tabs, sidebars (static, accessible markup), script tags
css/statlab.css            All styles
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

1. Write `renderMyToolInterface()` (returns the form HTML), `computeMyTool(...)` (pure calculation, returns
   the numbers plus a `steps` string/HTML) and `setupMyToolLogic()` (wires the Calculate/Clear buttons).
2. Add one row to `STAT_ROUTES` in `js/app.js`: `mytool: [renderMyToolInterface, setupMyToolLogic],`
3. Add one `<button class="stat-btn" data-stat="mytool">` to the right sidebar in `Statistics.html`.

Use `normCDF`, `tCriticalValue`, `fCriticalValue`, `chiSquareCriticalValue`, ... from `00-numerics.js`
rather than lookup tables or local approximations. Return `{ error: true, message }` for bad input and say
how to fix it.

## Tests

```
npm test        # or: node --test
```

* `tests/numerics.test.js`: special functions and critical values against SciPy reference values
* `tests/calculations.test.js`: whole tests (t, ANOVA, ANCOVA, MANOVA, Tukey, Shapiro-Wilk, ...) against SciPy/NumPy
* `tests/structure.test.js`: no duplicate function definitions, every button has a route and vice versa,
  rendered interfaces have unique ids, accessibility basics of the page shell

The tests load the real browser scripts into a Node `vm` context with a stub DOM, so they exercise exactly
the code the page runs.
