'use strict';
// Compares tools against reference values computed with SciPy / statsmodels / NumPy (tests/fixtures/make-reference.py writes the JSON).
// This is the independent check behind the README's "verified" list: a formula slip in a tool shows up here, not only in the worked solution.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./load-app');

const app = loadApp();
const ref = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'reference-values.json'), 'utf8'));
const close = (got, want, tol, label) => assert.ok(Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)), `${label}: got ${got}, reference ${want}`);
const ALT = { 'two-sided': 'two.sided', less: 'less', greater: 'greater' };

test('reference: paired t and Welch t, every alternative (scipy.stats.ttest_rel / ttest_ind)', () => {
    for (const [alt, want] of Object.entries(ref.paired)) {
        const r = app.computePairedTTest(ref.x, ref.y, 0.05, ALT[alt]);
        close(r.tStatistic, want.t, 1e-10, `paired t ${alt}`); close(r.pValue, want.p, 1e-9, `paired p ${alt}`);
    }
    for (const [alt, want] of Object.entries(ref.welch)) {
        const r = app.computeTwoSampleTTest(ref.x, ref.y, 0.05, ALT[alt]);
        close(r.tStatistic, want.t, 1e-10, `Welch t ${alt}`); close(r.pValue, want.p, 1e-9, `Welch p ${alt}`);
    }
});

test('reference: Levene, Bartlett, Mood\'s median, ANOVA / Scheffé F and Bonferroni pairwise t (scipy)', () => {
    const lev = app.computeLeveneTest(ref.groups_text, 0.05);
    // the tool centres on the group MEAN (the original Levene test); scipy center="mean"
    close(lev.fStatistic, ref.levene_mean.F, 1e-9, 'Levene F'); close(lev.pValue, ref.levene_mean.p, 1e-8, 'Levene p');
    const bt = app.computeBartlettTest(ref.groups_text, 0.05);
    close(bt.chiSquare, ref.bartlett.chi2, 1e-9, 'Bartlett chi2'); close(bt.pValue, ref.bartlett.p, 1e-8, 'Bartlett p');
    const mm = app.computeMoodsMedianTest(ref.groups_text, 0.05);
    close(mm.chiSquare, ref.moods.chi2, 1e-9, "Mood's chi2"); close(mm.pValue, ref.moods.p, 1e-8, "Mood's p"); close(mm.overallMedian, ref.moods.median, 1e-12, "Mood's median");
    close(app.computeANOVA(ref.groups_text, 0.05).fStatistic, ref.anova.F, 1e-9, 'ANOVA F');
    close(app.computeScheffeTest(ref.groups_text, 0.05).fStatistic, ref.anova.F, 1e-9, 'Scheffé F');
    const bon = app.computeBonferroniCorrection(ref.groups_text, 0.05);
    for (const w of ref.bonferroni_pairs) {
        const c = bon.comparisons.find(p => (p.group1 === w.g1 && p.group2 === w.g2));
        assert.ok(c, `pair ${w.g1}-${w.g2}`);
        close(Math.abs(c.tStat), Math.abs(w.t), 1e-9, `Bonferroni |t| ${w.g1}-${w.g2} (the sign only says which group is larger)`); close(c.pValue, w.p, 1e-8, `Bonferroni p ${w.g1}-${w.g2}`);
    }
});

test('reference: McNemar, phi, Cramér\'s V (statsmodels / scipy.stats.contingency)', () => {
    const mc = app.computeMcNemarTest(ref.mcnemar.table.join(', '), 0.05);
    close(mc.chiSquare, ref.mcnemar.chi2, 1e-10, 'McNemar chi2'); close(mc.pValue, ref.mcnemar.p, 1e-9, 'McNemar p');
    close(Math.abs(app.computePhiWithSteps(ref.phi.table.join(', ')).phi), ref.phi.phi_abs, 1e-10, 'phi');
    const cv = app.computeCramersVWithSteps(ref.cramers.pairs.join('\n'));
    close(cv.cramersV, ref.cramers.V, 1e-10, "Cramér's V"); close(cv.chiSquare, ref.cramers.chi2, 1e-10, 'Cramér chi2');
});

test('reference: covariance, partial, point-biserial, correlation matrix, distance correlation, Durbin-Watson', () => {
    close(app.computeCovarianceWithSteps(ref.x, ref.y).covariance, ref.cov_sample, 1e-12, 'covariance (sample)');
    close(app.computePartialCorrelationWithSteps(ref.xs, ref.ys, ref.z).r_xy_z, ref.partial, 1e-10, 'partial correlation (residual method)');
    close(app.computePointBiserialWithSteps(ref.x, ref.pointbiserial.binary).r_pb, ref.pointbiserial.r, 1e-10, 'point-biserial');
    const cm = app.computeCorrelationMatrixWithSteps([ref.x, ref.y, ref.corr_third]).corrMatrix;
    ref.corrmatrix.forEach((row, i) => row.forEach((v, j) => close(cm[i][j], v, 1e-12, `corr[${i}][${j}]`)));
    close(app.computeDistanceCorrelationWithSteps(ref.x, ref.y).dCor, ref.dcor, 1e-10, 'distance correlation');
    close(app.computeDurbinWatson(ref.durbin_watson.residuals).durbinWatson, ref.durbin_watson.dw, 1e-12, 'Durbin-Watson');
});

test('reference: simple regression inference, overall F and model summary (statsmodels OLS)', () => {
    const o = ref.ols;
    const se = app.computeStdErrorsWithSteps(ref.xs, ref.ys);
    close(se.seSlope, o.se_slope, 1e-10, 'SE slope'); close(se.seIntercept, o.se_intercept, 1e-10, 'SE intercept');
    const t = app.computeTStatsWithSteps(ref.xs, ref.ys);
    close(t.tSlope, o.t_slope, 1e-9, 't slope'); close(t.tIntercept, o.t_intercept, 1e-9, 't intercept');
    close(t.pSlope, o.p_slope, 1e-7, 'p slope'); close(t.pIntercept, o.p_intercept, 1e-8, 'p intercept');
    const f = app.computeFTestOverallWithSteps(ref.xs, ref.ys, 0.05);
    close(f.fStatistic, o.F, 1e-9, 'overall F'); close(f.pValue, o.F_p, 1e-6, 'overall F p'); close(f.rSquared, o.r2, 1e-12, 'R²'); close(f.adjRSquared, o.adj_r2, 1e-12, 'adjusted R²');
    const s = ref.model_summary, ms = app.computeModelSummary(s.actual, s.predicted, s.k);
    close(ms.rSquared, s.r2, 1e-12, 'summary R²'); close(ms.adjRSquared, s.adj_r2, 1e-12, 'summary adjusted R²');
    close(ms.rmse, s.rmse, 1e-12, 'RMSE'); close(ms.rse, s.rse, 1e-12, 'RSE'); close(ms.mae, s.mae, 1e-12, 'MAE'); close(ms.mape, s.mape, 1e-10, 'MAPE');
});

test('reference: ANCOVA group F (statsmodels anova_lm type II) and Lilliefors D (statsmodels)', () => {
    const a = app.computeANCOVA(ref.ancova.text, 0.05);
    close(a.fStatistic, ref.ancova.F, 1e-8, 'ANCOVA F'); close(a.pValue, ref.ancova.p, 1e-7, 'ANCOVA p');
    const ks = app.computeKolmogorovSmirnovTest(ref.x, 0.05);
    close(ks.D, ref.lilliefors.D, 1e-12, 'Lilliefors D');
    assert.ok(Math.abs(ks.pValue - ref.lilliefors.p) < 0.03, `Lilliefors p: ${ks.pValue} vs ${ref.lilliefors.p} (table interpolation vs simulation)`);
});

test('reference: descriptive and preparation tools (scipy / numpy)', () => {
    close(app.computeMedianAbsDevWithSteps(ref.d).value, ref.mad, 1e-12, 'MAD');
    close(app.computeStdErrorWithSteps(ref.sem_x).value, ref.sem, 1e-12, 'SEM');
    close(app.sampleSkewness(ref.sem_x), ref.skew_g1, 1e-12, 'skewness G1'); close(app.sampleExcessKurtosis(ref.sem_x), ref.kurt_g2, 1e-12, 'kurtosis G2');
    close(app.computeCVWithSteps(ref.sem_x).cv / 100, ref.cv_pop, 1e-12, 'CV (population)');
    const w = app.computeWinsorizeWithSteps(ref.winsor.data, ref.winsor.pct);
    ref.winsor.result.forEach((v, i) => close(w.winsorized[i], v, 1e-12, `winsorized[${i}]`));
    app.computeRankingWithSteps(ref.rank.data).ranks.forEach((v, i) => close(v, ref.rank.ranks[i], 1e-12, `rank[${i}]`));
    app.computeZScoreWithSteps(ref.sem_x).zScores.forEach((v, i) => close(v, ref.zscore[i], 1e-12, `z[${i}]`));
    app.computeNormalizeWithSteps(ref.sem_x).normalized.forEach((v, i) => close(v, ref.minmax[i], 1e-12, `minmax[${i}]`));
    const o = app.computeIQROutlierWithSteps(ref.iqr_fence.data);
    close(o.lowerBound, ref.iqr_fence.lo, 1e-12, 'IQR lower fence'); close(o.upperBound, ref.iqr_fence.hi, 1e-12, 'IQR upper fence');
});

test('reference: distribution functions and critical values on a grid (scipy.stats)', () => {
    const g = ref.grid;
    g.norm_cdf.forEach(([z, v]) => close(app.normCDF(z), v, 1e-12, `normCDF(${z})`));
    g.t_cdf.forEach(([t, df, v]) => close(app.tCDF(t, df), v, 1e-11, `tCDF(${t}, ${df})`));
    g.chi2_cdf.forEach(([c, df, v]) => close(app.chiSquareCDF(c, df), v, 1e-11, `chi2CDF(${c}, ${df})`));
    g.f_cdf.forEach(([f, a, b, v]) => close(app.fCDF(f, a, b), v, 1e-11, `fCDF(${f}, ${a}, ${b})`));
    g.beta_cdf.forEach(([x, a, b, v]) => close(app.betaCDF(x, a, b), v, 1e-11, `betaCDF(${x}, ${a}, ${b})`));
    g.binom_pmf.forEach(([n, k, p, v]) => close(app.binomialPMF(n, k, p), v, 1e-11, `binomialPMF(${n}, ${k}, ${p})`));
    g.t_crit.forEach(([a, df, v]) => close(app.tCriticalValue(a, df), v, 1e-8, `t critical(${a}, ${df})`));
    g.chi2_crit.forEach(([a, df, v]) => close(app.chiSquareCriticalValue(a, df), v, 1e-8, `chi2 critical(${a}, ${df})`));
    g.f_crit.forEach(([a, d1, d2, v]) => close(app.fCriticalValue(a, d1, d2), v, 1e-8, `F critical(${a}, ${d1}, ${d2})`));
});

test('reference: exact Mann-Whitney and Wilcoxon p-values for small samples without ties (scipy method="exact")', () => {
    for (const c of ref.mannwhitney_exact) {
        for (const alt of ['two-sided', 'less', 'greater']) {
            const r = app.computeMannWhitneyTest(c.a, c.b, 0.05, ALT[alt]);
            assert.equal(r.exact, true, 'uses the exact distribution');
            close(r.pValue, c[alt], 1e-12, `Mann-Whitney ${alt} n=${c.a.length},${c.b.length}`);
        }
    }
    for (const c of ref.wilcoxon_exact) {
        for (const alt of ['two-sided', 'less', 'greater']) {
            const r = app.computeWilcoxonTest(c.before, c.after, 0.05, ALT[alt]);
            assert.equal(r.exact, true, 'uses the exact distribution');
            close(r.pValue, c[alt], 1e-12, `Wilcoxon ${alt} n=${c.before.length}`);
        }
    }
});

test('reference: histogram and binning counts, log transform, mutual information, MLE fits (numpy / scipy)', () => {
    for (const [bins, counts] of Object.entries(ref.hist_counts)) {
        assert.deepEqual([...app.computeHistogramWithSteps(ref.fd, +bins).frequencies], counts, `histogram, ${bins} bins`);
        assert.deepEqual([...app.computeBinningWithSteps(ref.fd, 'equal_width', +bins).bins], counts, `binning, ${bins} bins`);
    }
    for (const [base, key] of [['natural', 'ln'], ['base10', 'log10'], ['base2', 'log2']]) {
        app.computeLogTransformWithSteps(ref.fd, base).transformed.forEach((v, i) => close(v, ref[key][i], 1e-12, `${key}[${i}]`));
    }
    for (const [bins, want] of Object.entries(ref.mutual_info_bits)) close(app.computeMutualInfoWithSteps(ref.fd, ref.fy, +bins).mi, want, 1e-10, `mutual information, ${bins} bins`);
    for (const [dist, want] of Object.entries(ref.fit)) {
        const r = app.computeFitDistributionWithSteps(ref.fd, dist).results;
        for (const [k, v] of Object.entries(want)) close(r[k], v, 1e-10, `${dist} fit ${k}`);
    }
});
