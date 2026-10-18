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
