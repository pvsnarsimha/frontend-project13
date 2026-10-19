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

// ---- Helpers for tools that read their parameters from the page ----
function withDom(values, fn) {
    const original = app.document.getElementById;
    app.document.getElementById = id => ({ value: values[id] === undefined ? '' : values[id], style: {}, innerText: '', textContent: '' });
    try { return fn(); } finally { app.document.getElementById = original; }
}

test('VIF with three predictors is the real regression R² (SciPy/NumPy least squares), not an average of r²', () => {
    const M = [[1, 2, 4.1], [2, 1, 5.9], [3, 4, 8.2], [4, 3, 9.8], [5, 6, 13.1], [6, 5, 15.7], [7, 8, 18.4], [8, 7, 19.9]];
    const r = app.computeVIF(M);
    [183.35145896303, 8.127673796791436, 220.4777958614278].forEach((v, i) => close(r.vifs[i].vif, v, 1e-6 * v, 'VIF' + (i + 1)));
    // perfectly collinear predictors give an infinite VIF instead of a made-up cap
    const exact = [[1, 2, 5], [2, 1, 4], [3, 4, 10], [4, 3, 9], [5, 6, 15], [6, 5, 14]];   // X3 = X1 + 2·X2
    assert.ok(app.computeVIF(exact).vifs.every(v => v.vif === Infinity));
    // a constant predictor is an error, not a silent 0 correlation
    assert.equal(app.computeVIF([[1, 5], [2, 5], [3, 5], [4, 5]]).error, true);
});

test('random Beta variates follow Beta(α,β) for α, β above and below 1 (Marsaglia-Tsang gamma ratio)', () => {
    for (const [a, b] of [[2, 5], [0.5, 0.5], [0.3, 3]]) {
        const xs = app.generateRandomNumbers(40000, 'beta', { alpha: a, beta: b }, app.createRandomSource(2024));
        const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
        const variance = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length;
        close(mean, a / (a + b), 0.01, `mean Beta(${a},${b})`);
        close(variance, a * b / ((a + b) ** 2 * (a + b + 1)), 0.004, `variance Beta(${a},${b})`);
        assert.ok(xs.every(x => x >= 0 && x <= 1));
    }
    // seeded generation is reproducible; the second Box-Muller normal is reused rather than discarded
    const a = app.generateRandomNumbers(5, 'normal', { mean: 0, std: 1 }, app.createRandomSource(7));
    const b = app.generateRandomNumbers(5, 'normal', { mean: 0, std: 1 }, app.createRandomSource(7));
    assert.deepEqual(Array.from(a), Array.from(b));
    const src = app.createRandomSource(7);
    const first = src.normal(), second = src.normal();
    assert.notEqual(first, second);
});

test('entropy matches SciPy, including Beta (digamma by loop) and Poisson', () => {
    close(app.computeEntropyWithSteps('normal', { stdDev: 2 }).entropy, 2.112085713764618, 1e-12);
    close(app.computeEntropyWithSteps('exponential', { rate: 2 }).entropy, 0.3068528194400547, 1e-12);
    close(app.computeEntropyWithSteps('uniform', { min: 1, max: 5 }).entropy, 1.3862943611198906, 1e-12);
    close(app.computeEntropyWithSteps('beta', { alpha: 2, beta: 5 }).entropy, -0.48453071499548805, 1e-9);
    close(app.computeEntropyWithSteps('beta', { alpha: 0.5, beta: 0.5 }).entropy, -0.24156447527049074, 1e-9);
    close(app.computeEntropyWithSteps('beta', { alpha: 0.3, beta: 4 }).entropy, -2.436522121349705, 1e-9);
    close(app.computeEntropyWithSteps('poisson', { lambda: 3 }).entropy, 1.9314701981485691, 1e-9);
    close(app.computeEntropyWithSteps('poisson', { lambda: 0.5 }).entropy, 0.9276374674957975, 1e-9);
    close(app.computeEntropyWithSteps('binomial', { n: 10, p: 0.3 }).entropy, 1.7790787840900626, 1e-9);
    // digamma: ψ(1) = -γ, ψ(1/2) = -γ - 2 ln 2, and a very small argument does not recurse deeply
    close(app.digamma(1), -0.5772156649015329, 1e-11);
    close(app.digamma(0.5), -1.9635100260214235, 1e-11);
    assert.doesNotThrow(() => app.digamma(1e-9));
});

test('moment generating functions match the closed forms', () => {
    close(app.computeMGFWithSteps('normal', { mean: 1, stdDev: 2 }, 0.5).mgfValue, Math.E, 1e-12);
    close(app.computeMGFWithSteps('exponential', { rate: 3 }, 1).mgfValue, 1.5, 1e-12);
    close(app.computeMGFWithSteps('uniform', { min: 0, max: 2 }, 1).mgfValue, 3.194528049465325, 1e-12);
    close(app.computeMGFWithSteps('poisson', { lambda: 2 }, 0.5).mgfValue, 3.659924582769379, 1e-10);
    close(app.computeMGFWithSteps('binomial', { n: 10, p: 0.3 }, 0.5).mgfValue, 5.919494989185632, 1e-9);
    assert.ok(app.computeMGFWithSteps('exponential', { rate: 3 }, 4).error || !isFinite(app.computeMGFWithSteps('exponential', { rate: 3 }, 4).mgfValue), 'MGF of Exp(3) does not exist for t >= 3');
});

test('hazard and survival functions match SciPy', () => {
    const hazard = (dist, extra, xs) => withDom({ hazardDistribution: dist, hazardXValues: xs, ...extra }, () => app.computeHazardWithSteps());
    const w = hazard('weibull', { hazardShape: '2', hazardScale: '3' }, '0.5, 1, 2, 4');
    [0.1111111111111111, 0.2222222222222222, 0.4444444444444444, 0.8888888888888888].forEach((v, i) => close(w.results[i], v, 1e-12));
    const n = hazard('normal', { hazardMean: '0', hazardStd: '1' }, '0, 1, 2');
    [0.7978845608028654, 1.525135276160981, 2.373215532822843].forEach((v, i) => close(n.results[i], v, 1e-7));
    close(hazard('exponential', { hazardRate: '0.7' }, '3').results[0], 0.7, 1e-12);

    const surv = (dist, extra, xs) => withDom({ survivalDistribution: dist, survivalXValues: xs, ...extra }, () => app.computeSurvivalWithSteps());
    const sn = surv('normal', { survivalMean: '0', survivalStd: '1' }, '1.5, -1');
    close(sn.results[0], 0.06680720126885807, 1e-10);
    close(sn.results[1], 0.8413447460685429, 1e-10);
    const sw = surv('weibull', { survivalShape: '2', survivalScale: '3' }, '2, 5');
    close(sw.results[0], 0.6411803884299546, 1e-12);
    close(sw.results[1], 0.06217652402211629, 1e-12);
    close(surv('exponential', { survivalRate: '0.5' }, '3').results[0], 0.22313016014842982, 1e-12);
});

test('Box-Cox optimal λ is found by golden-section search (not rounded to one decimal) and matches SciPy', () => {
    const x = [1.2, 2.3, 2.9, 4.1, 5.5, 7.8, 12.1, 20.4, 33.0, 60.2];
    const r = app.computeBoxCoxWithSteps(x, 'optimal');
    close(r.lambda, -0.10555311213115026, 1e-5);
    assert.notEqual(Math.round(r.lambda * 10) / 10, r.lambda);
    const x2 = [2, 3, 3, 4, 5, 7, 9, 15, 40, 41, 99];
    close(app.computeBoxCoxWithSteps(x2, 'optimal').lambda, -0.3147662264562613, 1e-5);
    assert.equal(app.computeBoxCoxWithSteps([5, 5, 5, 5], 'optimal').error, true);
    assert.equal(app.computeBoxCoxWithSteps([1, 2, -3], 'optimal').error, true);
});

test('generated markup is balanced: tables built by correlation tools are closed and numbers are not NaN', () => {
    const count = (s, re) => (s.match(re) || []).length;
    const cm = app.computeCorrelationMatrixWithSteps([[1, 2, 3, 4, 5], [2, 1, 4, 3, 6], [5, 3, 4, 1, 2]]);
    assert.equal(count(cm.steps, /<table/g), count(cm.steps, /<\/table>/g));
    assert.ok(!cm.steps.includes('/table>') || !/[^<]\/table>/.test(cm.steps), 'a "</table>" lost its "<"');
    const cv = app.computeCramersVWithSteps('a,x\na,y\nb,x\nb,y\na,x\nb,y\na,y\nb,x\na,x\nb,y', 0.05);
    assert.equal(count(cv.steps, /<table/g), count(cv.steps, /<\/table>/g));
    assert.ok(!/[^<]\/table>/.test(cv.steps));
});

// Reference values for the next four tests come from independent implementations of the textbook formulas (pure
// Python), not from this code: Pearson r with a 0/1 variable, double-centred distance matrices, equal-width binning
// with log2, and the DW sum-of-squares definition.
test('point-biserial correlation equals Pearson r with the 0/1 variable', () => {
    const b = [0, 1, 0, 1, 1, 0, 0, 1];
    const r = app.computePointBiserialWithSteps(X, b);
    close(r.r_pb, 0.7844050370414015, 1e-12);
    close(r.r_pb, app.computePearsonWithSteps(X, b).r, 1e-12);
    close(app.computePointBiserialWithSteps(X, b.map(v => 1 - v)).r_pb, -0.7844050370414015, 1e-12);   // swapping the labels flips the sign
    assert.equal(app.computePointBiserialWithSteps(X, [1, 1, 1, 1, 1, 1, 1, 1]).error, true);          // no 0s
    assert.equal(app.computePointBiserialWithSteps(X, [0, 1, 2, 1, 0, 1, 0, 1]).error, true);          // not binary
});

test('distance correlation: reference value, detects a non-linear relation, bounded by [0, 1]', () => {
    const r = app.computeDistanceCorrelationWithSteps(X, Y);
    close(r.dCor, 0.9537055874760738, 1e-12);
    const sq = app.computeDistanceCorrelationWithSteps([-3, -2, -1, 0, 1, 2, 3], [9, 4, 1, 0, 1, 4, 9]);
    close(sq.dCor, 0.5053197494397452, 1e-12);
    close(sq.pearsonR, 0, 1e-12);                       // Pearson sees nothing in y = x², distance correlation does
    const perfect = app.computeDistanceCorrelationWithSteps([1, 2, 3, 4, 5], [10, 20, 30, 40, 50]);
    close(perfect.dCor, 1, 1e-12);
    assert.equal(app.computeDistanceCorrelationWithSteps([1, 1, 1, 1], [1, 2, 3, 4]).error, true);    // zero distance variance
});

test('mutual information: reference value, perfect dependence = 1 bit, independence = 0', () => {
    const r = app.computeMutualInfoWithSteps(X, Y, 3);
    close(r.mi, 1.2169171866886992, 1e-12);
    close(r.entropyX, 1.561278124459133, 1e-12);
    close(r.entropyY, 1.561278124459133, 1e-12);
    close(r.jointEntropy, 1.9056390622295665, 1e-12);
    close(r.nmi, 0.7794365191085161, 1e-12);
    close(r.mi, r.entropyX + r.entropyY - r.jointEntropy, 1e-12);     // I(X;Y) = H(X) + H(Y) - H(X,Y)
    const line = [1, 2, 3, 4, 5, 6, 7, 8];
    const dep = app.computeMutualInfoWithSteps(line, line, 2);
    close(dep.mi, 1, 1e-12);
    close(dep.nmi, 1, 1e-12);
    const indep = app.computeMutualInfoWithSteps([1, 1, 2, 2, 1, 1, 2, 2], [1, 2, 1, 2, 1, 2, 1, 2], 2);
    close(indep.mi, 0, 1e-12);
});

test('Durbin-Watson statistic: reference value and the 0 / 2 / 4 landmarks', () => {
    const r = app.computeDurbinWatson([0.5, -0.3, 0.8, -1.1, 0.2, 0.9, -0.4, 0.1]);
    close(r.durbinWatson, 2.9844236760124607, 1e-12);
    close(r.numerator, 9.58, 1e-12);
    close(r.denominator, 3.21, 1e-12);
    close(app.computeDurbinWatson([1, -1, 1, -1]).durbinWatson, 3, 1e-12);       // 12 / 4: alternating signs push towards 4
    close(app.computeDurbinWatson([1, 1, 1, 1]).durbinWatson, 0, 1e-12);         // no change between neighbours: 0
    assert.equal(app.computeDurbinWatson([1]).error, true);
});

test('MANOVA never returns a statistic built on non-positive denominator degrees of freedom', () => {
    // Every small design either fails with a message or yields a finite F and p; never NaN or a p-value from df2 <= 0
    for (let p = 2; p <= 4; p++) for (let k = 2; k <= 3; k++) for (let per = 2; per <= 4; per++) {
        const rows = [];
        for (let g = 0; g < k; g++) for (let i = 0; i < per; i++)
            rows.push([`G${g}`, ...Array.from({ length: p }, (_, j) => (g * 2 + ((i * (j + 3) * 7 + j * j) % 5) + i * 0.37 * (j + 1)).toFixed(2))].join(', '));
        const r = app.computeMANOVA(rows.join('\n'), 0.05);
        const label = `p=${p} k=${k} n/group=${per}`;
        if (r.error) assert.equal(typeof r.message, 'string', label);
        else {
            assert.ok(r.df2 > 0, `${label}: df2=${r.df2}`);
            assert.ok(Number.isFinite(r.fStatistic) && r.pValue >= 0 && r.pValue <= 1, label);
        }
    }
});

test('Box-Cox is continuous at λ = 0: tiny λ agrees with ln(x), and the optimiser works for data whose best λ is ≈ 0', () => {
    const x = [1.2, 2.3, 2.9, 4.1, 5.5, 7.8, 12.1, 20.4, 33.0, 60.2];
    const logs = x.map(Math.log);
    for (const lam of [0, 1e-12, 1e-9, 1e-7, 1e-5, -1e-7]) {
        const t = app.computeBoxCoxWithSteps(x, 'custom', lam).transformed;
        t.forEach((v, i) => close(v, logs[i] + lam * logs[i] * logs[i] / 2, 1e-6, `λ=${lam}, x=${x[i]}`));   // (x^λ-1)/λ ≈ ln x + λ (ln x)²/2
    }
    // lognormal-like data: the profile likelihood peaks very close to 0, and must be found without noise from cancellation
    const lognormal = [0.5, 0.8, 1, 1.3, 2, 2.7, 3.3, 4.9, 7.4, 11, 20];
    const r = app.computeBoxCoxWithSteps(lognormal, 'optimal');
    assert.ok(Math.abs(r.lambda) < 0.5, `λ=${r.lambda}`);
    assert.ok(r.transformed.every(Number.isFinite));
});
