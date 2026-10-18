'use strict';
// Reference values were produced with SciPy (scipy.stats) for the same inputs.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./load-app');

const app = loadApp();
const close = (actual, expected, tol, msg) =>
    assert.ok(Math.abs(actual - expected) <= tol, `${msg || ''} expected ${expected}, got ${actual}`);

const X = [2.1, 3.4, 1.9, 5.6, 4.4, 3.8, 2.7, 4.9];
const Y = [1.8, 3.9, 2.4, 6.1, 4.0, 3.5, 3.1, 5.2];

test('mean and variance', () => {
    close(app.computeMeanWithSteps(X).value, 3.6, 1e-12);
    const v = app.computeVarianceWithSteps(X);
    close(v.sample, 1.7657142857142856, 1e-12);
    close(v.population, 1.545, 1e-12);
});

test('one-sample t-test', () => {
    const r = app.computeOneSampleTTest(X, 3, 0.05, 'two.sided');
    close(r.tStatistic, 1.277132710866435, 1e-10);
    close(r.pValue, 0.24228308628118986, 1e-10);
    close(r.criticalValue, 2.3646242515927844, 1e-9);
    assert.equal(r.rejectH0, false);
});

test('two-sample (Welch) t-test', () => {
    const r = app.computeTwoSampleTTest(X, Y, 0.05, 'two.sided');
    close(r.tStatistic, -0.2193817272381391, 1e-10);
    close(r.df, 13.956594387977727, 1e-9);
    close(r.pValue, 0.8295287547996217, 1e-10);
});

test('one-way ANOVA', () => {
    const r = app.computeANOVA('1:A\n2:A\n3:A\n4:B\n5:B\n6:B\n9:C\n8:C\n10:C', 0.05);
    close(r.fStatistic, 37, 1e-9);
    close(r.pValue, 0.000421875, 1e-10);
    close(r.criticalValue, 5.143252849784718, 1e-8);   // F(0.05; 2, 6): not in the old lookup table
    assert.equal(r.rejectH0, true);
});

test('Pearson correlation and simple linear regression', () => {
    close(app.computePearsonWithSteps(X, Y).r, 0.9571809636275339, 1e-12);
    const r = app.computeSimpleLinearRegression(X, Y);
    close(r.slope, 1.0121359223300967, 1e-12);
    close(r.intercept, 0.10631067961165153, 1e-10);
    close(r.pF, 0.0001900194890246731, 1e-12);
});

test('chi-square test of independence', () => {
    const r = app.computeChisquareWithSteps('a,x\na,y\nb,x\nb,y\na,x\nb,y\na,y\nb,x\na,x\nb,y', 0.05);
    close(r.chiSquare, 0.4, 1e-12);
    close(r.pValue, 0.5270892568655381, 1e-10);
    close(r.criticalValue, 3.841458820694124, 1e-9);
});

test('two-sided F-test uses alpha/2 and a doubled p-value', () => {
    const r = app.computeFTest(X, Y, 0.05, 'two.sided');
    close(r.fStatistic, 1.1181229773462782, 1e-12);
    close(r.pValue, 0.8866848780933091, 1e-10);
    // variance ratio 3.83 with df (7,7): significant one-sided at 5% (crit 3.79) but NOT two-sided (crit 4.99)
    const a = [10, 12, 9, 11, 13, 10, 12, 11], b = [10, 13, 8, 14, 9, 14, 8, 12];
    const two = app.computeFTest(a, b, 0.05, 'two.sided');
    assert.ok(two.fStatistic > 3.79 && two.fStatistic < 4.99, `F=${two.fStatistic}`);
    assert.equal(two.rejectH0, false);
    assert.equal(app.computeFTest(b, a, 0.05, 'greater').rejectH0, true);
});

test('MANOVA reports a singular covariance matrix instead of returning NaN', () => {
    const rows = [];
    for (const [g, base] of [['A', 1], ['B', 3]]) for (let i = 0; i < 5; i++) rows.push(`${g}, ${base + i}, ${2 * (base + i)}`);   // y2 = 2 * y1
    const r = app.computeMANOVA(rows.join('\n'), 0.05);
    assert.equal(r.error, true);
    assert.match(r.message, /singular/i);
});

test('Tukey HSD honours alpha and uses an exact q at any df', () => {
    const data = '4:A\n5:A\n6:A\n5:A\n8:B\n9:B\n7:B\n8:B\n12:C\n11:C\n13:C\n12:C';
    const r5 = app.computeTukeyHSD(data, 0.05), r1 = app.computeTukeyHSD(data, 0.01);
    close(r5.q, 3.948492204, 1e-6);    // q(0.05; k=3, df=9), the table value 3.95 only exists for some df
    close(r1.q, 5.428042817, 1e-6);    // alpha = 0.01 now gives its own critical q
    assert.ok(r1.hsd > r5.hsd);
});

test('MANOVA matches NumPy (header row skipped, 3 dependent variables, general eigenvalues)', () => {
    const text = 'Group, Y1, Y2, Y3\nA, 12, 15, 14\nA, 14, 16, 17\nA, 13, 14, 13\nB, 18, 20, 19\nB, 20, 22, 24\nB, 19, 21, 20\nC, 25, 27, 26\nC, 27, 29, 28\nC, 26, 28, 30';
    const r = app.computeMANOVA(text, 0.05);
    assert.ok(!r.error, r.message);
    close(r.wilksLambda, 0.014903173989350801, 1e-9);
    close(r.pillaiTrace, 0.9894696135883515, 1e-9);
    close(r.roysRoot, 65.80192818944272, 1e-6);
});

test('ANCOVA uses the pooled within-group slope (matches an OLS model comparison)', () => {
    const text = 'Dependent Y, Group, Covariate X\n12, A, 5\n15, A, 6\n14, A, 4\n18, B, 7\n20, B, 8\n19, B, 6\n25, C, 9\n27, C, 10\n24, C, 8';
    const r = app.computeANCOVA(text, 0.05);
    assert.ok(!r.error, r.message);
    close(r.fStatistic, 7.441860465116287, 1e-9);
    close(r.pValue, 0.031708877118335324, 1e-9);
    assert.equal(r.dfBetween, 2);
    assert.equal(r.dfWithin, 5);
});

test('Shapiro-Wilk W and p-value match SciPy for n = 3..20 (Royston AS R94)', () => {
    const sets = {
        n3: [[1, 2, 4.5], 0.9423076923076923, 0.5367371250662004],
        n5: [[2.1, 3.4, 1.9, 5.6, 4.4], 0.9320849396015234, 0.6106559050550942],
        n8: [[2.1, 3.4, 1.9, 5.6, 4.4, 3.8, 2.7, 4.9], 0.9600029182620787, 0.8101276552903813],
        n16: [[12, 15, 11, 18, 14, 16, 13, 17, 22, 19, 25, 21, 24, 18, 23, 20.5], 0.9690766198893672, 0.8234374935374149],
        n20: [[2.4, 9.1, 3.3, 7.7, 5.2, 4.8, 6.6, 5.1, 3.9, 8.8, 4.4, 5.9, 6.1, 7.2, 2.9, 5.5, 6.8, 4.1, 9.9, 5.0], 0.9724414472183196, 0.8053750971398357]
    };
    for (const [name, [data, W, p]] of Object.entries(sets)) {
        const r = app.computeShapiroWilkTest(data, 0.05);
        close(r.W, W, 1e-9, name + ' W');
        close(r.pValue, p, 1e-7, name + ' p');
    }
});

test('Anderson-Darling A2 matches SciPy (with the small-sample correction applied once)', () => {
    const d = [12, 15, 11, 18, 14, 16, 13, 17, 22, 19, 25, 21, 24, 18, 23, 20.5];
    const r = app.computeAndersonDarlingTest(d, 0.05);
    close(r.A2, 0.16672308460101382, 1e-9);     // SciPy A2 = 0.15793195, times (1 + 0.75/n + 2.25/n^2)
    assert.equal(r.rejectH0, false);
    // strongly non-normal data must be rejected
    const skew = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5, 8, 13, 21, 55, 120];
    assert.equal(app.computeAndersonDarlingTest(skew, 0.05).rejectH0, true);
});

test('Kolmogorov-Smirnov D uses both sides of every ECDF step', () => {
    const d = [12, 15, 11, 18, 14, 16, 13, 17, 22, 19, 25, 21, 24, 18, 23, 20.5];
    close(app.computeKolmogorovSmirnovTest(d, 0.05).D, 0.0903688452146505, 1e-12);
});

test('z-tests, binomial, goodness of fit, Kruskal-Wallis, Friedman, Cochran Q and runs agree with SciPy', () => {
    const A = [12, 15, 11, 18, 14, 16, 13, 17];
    close(app.computeOneSampleZTest(A, 13, 2.5, 0.05, 'two.sided').pValue, 0.08968602177036457, 1e-10);
    close(app.computeBinomialExactTest(18, 40, 0.5, 0.05, 'two.sided').pValue, 0.6358280026288412, 1e-10);
    close(app.computeChiSquareGoodnessTest([18, 22, 30, 30], [25, 25, 25, 25], 0.05).pValue, 0.22891886433610517, 1e-9);
    close(app.computeKruskalWallisTest('1:A\n2:A\n4:A\n5:A\n6:B\n8:B\n9:B\n3.5:B\n11:C\n12:C\n10:C\n7.5:C', 0.05).pValue, 0.0230698024654865, 1e-9);
    close(app.computeFriedmanTest('1, 2, 3\n2, 3, 1\n3, 1, 2\n1, 3, 2\n2, 1, 3\n1, 2, 3\n1.5, 2.5, 3.5\n2, 4, 5', 0.05).pValue, 0.1353352832366127, 1e-9);
    close(app.computeCochranQTest('1,1,0\n1,0,0\n1,1,1\n0,0,0\n1,1,0\n1,0,1\n0,1,0\n1,1,1', 0.05).pValue, 0.24659696394160646, 1e-9);
    close(app.computeRunsTest('1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1', 0.05).pValue, 0.17252964335868348, 1e-9);
});

test('rank-test decisions use the exact normal quantile (old normInv returned 2.41 for 1.96)', () => {
    const r = app.computeMannWhitneyTest([1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12, 13, 14, 15, 16], 0.05, 'two.sided');
    assert.ok(r.pValue < 0.05);
    assert.equal(r.rejectH0, true);
});

test('Scheffe test uses the exact F critical value', () => {
    const r = app.computeScheffeTest('4:A\n5:A\n6:A\n5:A\n8:B\n9:B\n7:B\n8:B\n12:C\n11:C\n13:C\n12:C', 0.05);
    assert.ok(!r.error);
    assert.ok(JSON.stringify(r).includes('4.2565'), 'F(0.05; 2, 9) = 4.2565');
});
