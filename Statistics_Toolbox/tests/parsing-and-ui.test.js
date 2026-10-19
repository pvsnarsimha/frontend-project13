'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./load-app');
const deepEqual = require('node:assert').deepEqual;   // arrays come from another vm realm, so compare structurally

const app = loadApp();
const UI = app.get('window.StatLabUI');

test('parseNumbersFromInput handles negatives, decimals, scientific notation and mixed separators', () => {
    deepEqual(app.parseNumbersFromInput('1, 2.5;  -3\n4e2\t+5 .5 1E-2'), [1, 2.5, -3, 400, 5, 0.5, 0.01]);
    deepEqual(app.parseNumbersFromInput('−3, 4'), [-3, 4]);          // typographic minus
    deepEqual(app.parseNumbersFromInput(''), []);
    deepEqual(app.parseNumbersFromInput('  \n , ; '), []);
});

test('parseNumbersFromInput skips incomplete tokens instead of silently reading a prefix', () => {
    deepEqual(app.parseNumbersFromInput('12abc 7 1.2.3 abc 8e'), [7]);
    deepEqual(app.parseNumbersFromInput('NaN Infinity 0x10'), []);
});

test('Lilliefors K-S test agrees with statsmodels', () => {
    const d = [12, 15, 11, 18, 14, 16, 13, 17, 22, 19, 25, 21, 24, 18, 23, 20.5, 30, 31, 29, 40];
    const r = app.computeKolmogorovSmirnovTest(d, 0.05);
    assert.ok(Math.abs(r.D - 0.10447659731616693) < 1e-12);
    assert.ok(Math.abs(r.pValue - 0.809) < 0.02, `p=${r.pValue}`);          // statsmodels (table interpolation): 0.809
    // published Lilliefors 5% critical values
    assert.ok(Math.abs(app.lillieforsCritical(0.05, 20) - 0.190) < 0.006);
    assert.ok(Math.abs(app.lillieforsCritical(0.05, 50) - 0.1246) < 0.004);
    assert.ok(Math.abs(app.lillieforsCritical(0.05, 100) - 0.0886) < 0.003);
    // deterministic: same input, same answer
    assert.equal(app.computeKolmogorovSmirnovTest(d, 0.05).pValue, r.pValue);
});

test('Shapiro-Wilk matches SciPy for larger samples (n = 50, 200)', () => {
    const fixtures = [['sw50', 0.9780489635641811, 0.47293855349411934], ['sw200', 0.9951223969501711, 0.7677517128057203]];
    for (const [name, W, p] of fixtures) {
        const data = require(`./fixtures/${name}.json`);
        const r = app.computeShapiroWilkTest(data, 0.05);
        assert.ok(Math.abs(r.W - W) < 1e-9, name + ' W');
        assert.ok(Math.abs(r.pValue - p) < 1e-7, name + ' p');
    }
});

test('MANOVA F and p use Rao approximation (matches the textbook formula)', () => {
    const text = 'Group, Y1, Y2, Y3\nA, 12, 15, 14\nA, 14, 16, 17\nA, 13, 14, 13\nB, 18, 20, 19\nB, 20, 22, 24\nB, 19, 21, 20\nC, 25, 27, 26\nC, 27, 29, 28\nC, 26, 28, 30';
    const r = app.computeMANOVA(text, 0.05);
    assert.ok(Math.abs(r.fStatistic - 9.58859571070578) < 1e-6);
    assert.equal(r.df1, 6);
    assert.ok(Math.abs(r.df2 - 8) < 1e-9);
    assert.ok(Math.abs(r.pValue - 0.0027139285576096) < 1e-9);
});

test('multiple regression: coefficients match least squares and near-collinearity is flagged', () => {
    const rows = [[10, 1, 2], [12, 2, 1], [15, 3, 4], [14, 4, 2], [18, 5, 5], [21, 6, 3], [22, 7, 6], [25, 8, 4]];
    const r = app.computeMultipleLinearRegression(rows);
    [7.46039604, 2.04125413, 0.14191419].forEach((v, i) => assert.ok(Math.abs(r.coefficients[i] - v) < 1e-7));
    assert.ok(!r.steps.includes('Near-collinearity'));
    const near = [[10, 1, 1.0001], [12, 2, 2.0002], [15, 3, 2.9999], [14, 4, 4.0003], [18, 5, 5.0001], [21, 6, 5.9998], [22, 7, 7.0002], [25, 8, 8.0001]];
    assert.ok(app.computeMultipleLinearRegression(near).steps.includes('Near-collinearity'));
    const exact = [[10, 1, 2], [12, 2, 4], [15, 3, 6], [14, 4, 8], [18, 5, 10], [21, 6, 12], [22, 7, 14], [25, 8, 16]];
    assert.ok(app.computeMultipleLinearRegression(exact).steps.includes('Cannot compute'));
});

test('parseSolution turns plain-text working into titled steps, formulas and final results', () => {
    const text = [
        'ARITHMETIC MEAN',
        'Formula: x̄ = Σx / n',
        'Step 1: Add the values',
        '   2 + 4 + 6 = 12',
        'Step 2: Divide by n',
        '   12 / 3 = 4',
        '✅ Mean = 4'
    ].join('\n');
    const sol = UI.parseSolution(text);
    assert.equal(sol.title, 'ARITHMETIC MEAN');
    deepEqual(sol.formulas, ['x̄ = Σx / n']);
    assert.equal(sol.items.filter(i => i.step).length, 2);
    assert.equal(sol.items[0].title, 'Add the values');
    assert.ok(sol.items[1].lines.some(l => l.t.includes('12 / 3 = 4')));
    assert.ok(sol.finals.some(f => f.includes('Mean = 4')));
});

test('parseSolution tolerates plain text with no structure and escapes HTML', () => {
    const sol = UI.parseSolution('Just a sentence with <b>markup</b> & no steps');
    assert.equal(sol.items.length, 1);
    assert.equal(sol.items[0].title, 'Working');
    assert.equal(UI.fmt('a < b & c^2'), 'a &lt; b &amp; c<sup>2</sup>');
});

// ---- One-sided and tie-corrected tests, checked against SciPy (scipy.stats 1.18) ----
const near = (a, e, tol, msg) => assert.ok(Math.abs(a - e) <= tol, `${msg || ''} expected ${e}, got ${a}`);
const A = [12.1, 9.8, 14.2, 11.5, 10.9, 13.3, 15.0, 9.1, 12.7, 11.0], B = [10.2, 9.9, 12.0, 10.5, 11.1, 12.4, 13.9, 8.8, 10.0, 10.4];
const M1 = [3, 5, 5, 8, 9, 12, 12, 12, 15, 20], M2 = [2, 5, 6, 6, 9, 10, 14, 14, 17, 18, 25];

test('sign test: one-sided p-values use P(X >= k), not P(X >= k - 1) (scipy.stats.binomtest)', () => {
    const p = alt => app.computeSignTest(A, 11, 0.05, alt).pValue;
    near(p('two.sided'), 0.5078125, 1e-12);
    near(p('greater'), 0.25390625, 1e-12);
    near(p('less'), 0.91015625, 1e-12);
});

test('Mann-Whitney: one-sided direction, continuity correction and tie correction (scipy.stats.mannwhitneyu)', () => {
    const p = alt => app.computeMannWhitneyTest(M1, M2, 0.05, alt).pValue;
    near(p('two.sided'), 0.6715480472230665, 1e-10);
    near(p('greater'), 0.6895923151731271, 1e-10);
    near(p('less'), 0.33577402361153325, 1e-10);
    // clearly larger first sample: "greater" is significant, "less" is not
    const big = [21, 22, 23, 24, 25, 26], small = [1, 2, 3, 4, 5, 6];
    assert.equal(app.computeMannWhitneyTest(big, small, 0.05, 'greater').rejectH0, true);
    assert.equal(app.computeMannWhitneyTest(big, small, 0.05, 'less').rejectH0, false);
    assert.equal(app.computeMannWhitneyTest(small, big, 0.05, 'less').rejectH0, true);
});

test('Wilcoxon signed-rank: one-sided direction, zeros dropped, ties corrected (scipy.stats.wilcoxon)', () => {
    const p = (b, a, alt) => app.computeWilcoxonTest(b, a, 0.05, alt).pValue;
    near(p(A, B, 'two.sided'), 0.014432823938841816, 1e-10);
    near(p(A, B, 'greater'), 0.9945865393614344, 1e-10);
    near(p(A, B, 'less'), 0.007216411969420908, 1e-10);
    const before = M1, after = [3, 4, 7, 8, 9, 10, 12, 14, 13, 22];       // zero differences and tied |d|
    near(p(before, after, 'two.sided'), 0.8241408957418852, 1e-10);
    near(p(before, after, 'greater'), 0.4120704478709426, 1e-10);
    near(p(before, after, 'less'), 0.6716393567181147, 1e-10);
    assert.equal(app.computeWilcoxonTest([1, 2, 3], [1, 2, 3], 0.05, 'two.sided').error, true);
});

test('one-sample z and one-proportion z: rejectH0 follows p < alpha for every alternative', () => {
    const z = alt => app.computeOneSampleZTest(A, 11, 2, 0.05, alt);
    near(z('two.sided').pValue, 0.12904130509946773, 1e-12);
    near(z('greater').pValue, 0.06452065254973387, 1e-12);
    near(z('less').pValue, 0.9354793474502662, 1e-12);
    // a clearly negative statistic must reject the "less" alternative (the old |z| > z_crit rule got this wrong)
    const low = app.computeOneSampleZTest([1, 2, 3, 2, 1, 2], 10, 1, 0.05, 'less');
    assert.equal(low.rejectH0, true);
    assert.equal(app.computeOneSampleZTest([1, 2, 3, 2, 1, 2], 10, 1, 0.05, 'greater').rejectH0, false);
    const prop = alt => app.computeOneProportionZTest(18, 40, 0.5, 0.05, alt);
    near(prop('two.sided').pValue, 0.5270892568655383, 1e-12);
    near(prop('greater').pValue, 0.7364553715672308, 1e-12);
    near(prop('less').pValue, 0.26354462843276916, 1e-12);
    const lowProp = app.computeOneProportionZTest(5, 40, 0.5, 0.05, 'less');
    assert.equal(lowProp.rejectH0, true);
    // the confidence interval uses sqrt(p̂(1-p̂)/n) and the two-sided z, whatever the alternative
    const ci = app.computeOneProportionZTest(5, 40, 0.5, 0.05, 'less').steps;
    const se = Math.sqrt(0.125 * 0.875 / 40);
    assert.ok(ci.includes((0.125 - 1.959963984540054 * se).toFixed(4)), 'lower CI limit');
});

test('F-test: unswapped one-sided alternatives and folded two-sided p-value (scipy.stats.f)', () => {
    const f = alt => app.computeFTest(A, B, 0.05, alt);
    near(f('greater').pValue, 0.2425447521779146, 1e-12);
    near(f('less').pValue, 0.7574552478220855, 1e-12);
    near(f('two.sided').pValue, 0.4850895043558292, 1e-12);
    assert.equal(f('less').df1, A.length - 1);
    assert.equal(f('less').df2, B.length - 1);
    near(f('less').fStatistic, f('greater').fStatistic, 1e-15);
});

test('t confidence intervals use the t quantile and are two-sided for one-sided tests', () => {
    const ci = app.computePairedTTest(A, B, 0.05, 'less').steps;
    const d = A.map((v, i) => B[i] - v), n = d.length, md = d.reduce((s, v) => s + v, 0) / n;
    const sd = Math.sqrt(d.reduce((s, v) => s + (v - md) ** 2, 0) / (n - 1)), half = 2.2621571627409915 * sd / Math.sqrt(n);
    assert.ok(ci.includes(`[${(md - half).toFixed(4)}, ${(md + half).toFixed(4)}]`), 'paired CI uses t(0.025, 9) = 2.262');
    const sem = app.computeStdErrorWithSteps([1, 2, 3, 4, 5]).steps;
    assert.ok(sem.includes('2.7764') && !/± 1\.96 /.test(sem), 'standard error CI uses t(0.025, 4), not 1.96');
});

test('Kendall τ-b, Spearman ρ and Friedman χ² handle ties like SciPy', () => {
    const y = [1, 3, 3, 7, 5, 9, 9, 10, 12, 11];
    near(app.computeKendallWithSteps(M1, y).tau, 0.8812021902246507, 1e-12);                 // scipy kendalltau, variant b
    near(app.computeKendallWithSteps([1, 2, 3, 4, 5, 6], [2, 1, 4, 3, 6, 5]).tau, 0.6, 1e-12);   // no ties: τ-a = τ-b
    near(app.computeSpearmanWithSteps(M1, y).rho, 0.9659859390052364, 1e-12);                 // scipy spearmanr
    const rows = '1,2,2\n1,2,2\n2,1,3\n3,3,1\n1,1,2\n2,2,2\n4,3,5';
    near(app.computeFriedmanTest(rows, 0.05).chiSq, 2.8, 1e-9);                              // scipy friedmanchisquare (tie corrected)
    assert.equal(app.computeFriedmanTest('1,1,1\n2,2,2\n3,3,3', 0.05).error, true);
});

test('zero variance is an error, never a silent correlation of 0', () => {
    for (const r of [
        app.computePearsonWithSteps([1, 2, 3, 4], [5, 5, 5, 5]), app.computeSpearmanWithSteps([1, 2, 3, 4], [5, 5, 5, 5]),
        app.computeKendallWithSteps([1, 2, 3, 4], [5, 5, 5, 5]), app.computePointBiserialWithSteps([1, 1, 1, 1], [0, 1, 0, 1]),
        app.computeDistanceCorrelationWithSteps([1, 2, 3, 4], [5, 5, 5, 5]), app.computePhiWithSteps('5, 3, 0, 0'),
        app.computeCorrelationMatrixWithSteps([[1, 2, 3, 4], [7, 7, 7, 7]])
    ]) { assert.equal(r.error, true); assert.match(r.message, /zero variance|identical|undefined|sums to zero/i); }
});

test('every tool that reports quartiles uses Type 7 (NumPy/SciPy default)', () => {
    const q = [5, 3, 8, 1, 9, 4, 7, 2, 6, 10, 12];                       // np.percentile: Q1 = 3.5, Q3 = 8.5, P10 = 2, P90 = 10
    const results = {
        iqr: app.computeIQRWithSteps(q), five: app.computeFiveNumWithSteps(q), quartiles: app.computeQuartilesWithSteps(q),
        boxplot: app.computeBoxplotWithSteps(q), outlier: app.computeIQROutlierWithSteps(q), violin: app.computeViolinWithSteps(q, 1)
    };
    for (const [name, r] of Object.entries(results)) { near(r.q1, 3.5, 1e-12, name + ' Q1'); near(r.q3, 8.5, 1e-12, name + ' Q3'); }
    const pct = app.computePercentilesWithSteps(q, [10, 90]).results;
    near(pct[10], 2, 1e-12); near(pct[90], 10, 1e-12);
    const dec = app.computeDecilesWithSteps(q).deciles;
    near(dec.D1, 2, 1e-12); near(dec.D9, 10, 1e-12);
    near(app.quantileType7([1, 2, 3, 4], 0.25), 1.75, 1e-12);          // an even-sized sample, where hinge methods disagree
});

test('sample-data extraction strips HTML entities and accepts category samples', () => {
    const sample = UI.sampleFromPlaceholder;
    assert.equal(sample('Example: 12, 45.5, 78'), '12, 45.5, 78');
    assert.equal(sample('Example:&#10;1, 4, 7&#10;2, 5, 8'), '1, 4, 7\n2, 5, 8');          // numeric entity -> newline
    assert.equal(sample('Example:&amp;#10;1, 2&amp;#13;&amp;#10;3, 4'), '1, 2\n3, 4');      // double-escaped, CR LF collapsed
    assert.equal(sample('Example:&#x0A;5, 6'), '5, 6');
    assert.equal(sample('Example: a &amp; b, c&nbsp;d, 1'), 'a & b, c d, 1');             // named entities decoded
    assert.equal(sample('Example: 1 &lt;b&gt; 2'), null);                                // ...but entities that decode to markup are refused
    assert.equal(sample('Example:&#10;Red, Apple&#10;Green, Orange'), 'Red, Apple\nGreen, Orange');   // categories have no digits
    assert.equal(sample('1, 2, 3'), '1, 2, 3');                                         // bare numeric placeholder
    assert.equal(sample('Enter your values here'), null);                              // no marker, not numeric
    assert.equal(sample('Example: <b>bold</b> 1'), null);                              // markup is never accepted
    assert.equal(sample(''), null);
    // no sample on the page contains entity debris
    const R = app.get('STAT_ROUTES');
    for (const [name, [render]] of Object.entries(R)) {
        for (const m of render().matchAll(/placeholder="([^"]*)"/g)) {
            const s = sample(m[1]);
            if (s !== null) assert.ok(!/&#?\w+;/.test(s), `${name}: ${s}`);
        }
    }
});

test('copy falls back to execCommand when the Clipboard API is missing or refuses', async () => {
    const calls = [];
    const el = () => ({ style: {}, setAttribute() {}, select() { calls.push('select'); }, setSelectionRange() {}, remove() { calls.push('remove'); }, focus() {} });
    const fresh = loadApp();
    fresh.document.createElement = el;
    fresh.document.body.appendChild = () => {};
    fresh.document.execCommand = cmd => { calls.push(cmd); return true; };
    fresh.navigator.clipboard = undefined;
    assert.equal(await fresh.get('window.StatLabUI').copyText('hello'), true);
    assert.deepEqual(calls, ['select', 'copy', 'remove']);
    // clipboard present but rejected (permission / insecure context): same fallback
    calls.length = 0;
    fresh.navigator.clipboard = { writeText: () => Promise.reject(new Error('denied')) };
    assert.equal(await fresh.get('window.StatLabUI').copyText('hello'), true);
    assert.ok(calls.includes('copy'));
    // clipboard works: no fallback
    calls.length = 0;
    fresh.navigator.clipboard = { writeText: () => Promise.resolve() };
    assert.equal(await fresh.get('window.StatLabUI').copyText('hello'), true);
    assert.deepEqual(calls, []);
    // nothing works: reports failure instead of pretending
    fresh.document.execCommand = () => false;
    fresh.navigator.clipboard = undefined;
    assert.equal(await fresh.get('window.StatLabUI').copyText('hello'), false);
});

test('parseSolution: FORMULA mid-step, Note line, boxed row and a final line containing "="', () => {
    const sol = UI.parseSolution([
        'DEMO',
        'Step 1: Set up',
        '   Formula: z = (x - μ) / σ',
        '   Note: values are illustrative',
        '   │ x │ z │',
        '   │ 3 │ 0.5 │',
        '✅ Result: z = 0.5'
    ].join('\n'));
    const s1 = sol.items[0];
    assert.equal(sol.formulas.length, 0, 'a FORMULA inside a step stays in the step');
    assert.ok(s1.lines.some(l => l.cls === 'formula' && l.t.includes('z = (x - μ) / σ')));
    assert.ok(s1.lines.some(l => l.t.trim().startsWith('Note:')));
    const rows = s1.lines.filter(l => l.cls === 'row');
    assert.equal(rows.length, 2);
    deepEqual(rows[0].cells, ['x', 'z']);
    assert.ok(sol.finals.some(f => f.includes('Result: z = 0.5')));
});

test('parseSolution: a boxed ASCII line becomes a chapter and is followed by an anonymous block', () => {
    const sol = UI.parseSolution(['TITLE HERE', '║ PART ONE ║', 'first line of work', 'Step 1: Next'].join('\n'));
    const chapter = sol.items.find(i => i.chapter);
    assert.ok(chapter, 'chapter header');
    assert.equal(chapter.title, 'PART ONE');
    const idx = sol.items.indexOf(chapter);
    assert.ok(sol.items[idx + 1].anon, 'anonymous block follows the chapter');
    assert.ok(sol.items[idx + 1].lines.some(l => l.t.includes('first line of work')));
    assert.ok(sol.items[idx + 2].step);
});

test('parseSolution: "📌 FINAL RESULTS:" starts the finals, and a bare "Interpretation:" / "Note:" is a highlight line, not a section', () => {
    const sol = UI.parseSolution(['TITLE HERE', 'Step 1: Add', '   2 + 4 = 6', 'Interpretation:', '   The result is six', 'Note:', '   careful', '📌 FINAL RESULTS:', 'Mean = 3'].join('\n'));
    deepEqual(sol.items.map(i => i.title), ['Add'], 'only the step is a section');
    const lines = sol.items[0].lines.map(l => l.t.trim());
    assert.ok(lines.includes('Interpretation:') && lines.includes('Note:'), 'the keywords stay as lines of the step');
    assert.ok(sol.finals.some(f => f.includes('Mean = 3')), 'the finals were split off');
    assert.ok(!sol.finals.some(f => /FINAL RESULTS/.test(f)), 'the heading itself is not a final result');
});
