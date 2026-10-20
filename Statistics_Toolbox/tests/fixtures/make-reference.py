"""Generates tests/fixtures/reference-values.json: reference results from SciPy / statsmodels / NumPy that
tests/reference-values.test.js compares the app's tools against.

Run it only when a case is added (the JSON is committed, so `npm test` needs no Python):
    python3 -m venv .venv && .venv/bin/pip install scipy numpy statsmodels pandas
    .venv/bin/python tests/fixtures/make-reference.py
Versions used are written into the JSON ("versions")."""
import json, os
import numpy as np
import scipy, scipy.stats as st
import statsmodels, statsmodels.api as sm, statsmodels.formula.api as smf
from statsmodels.stats.stattools import durbin_watson
from statsmodels.stats.contingency_tables import mcnemar
from statsmodels.stats.anova import anova_lm
from statsmodels.stats.diagnostic import lilliefors

out = {"versions": {"scipy": scipy.__version__, "numpy": np.__version__, "statsmodels": statsmodels.__version__}}
x = np.array([2.1, 3.4, 1.9, 5.6, 4.4, 6.1, 3.8, 5.2]); y = np.array([1.8, 3.9, 2.4, 5.1, 5.0, 6.6, 3.1, 5.9])
out["x"], out["y"] = x.tolist(), y.tolist()

# paired and Welch t, every alternative
# the Paired t tool works on the difference d = after - before (second column minus first), so SciPy is called as ttest_rel(after, before)
out["paired"] = {alt: dict(zip(("t", "p"), map(float, st.ttest_rel(y, x, alternative=alt)))) for alt in ("two-sided", "less", "greater")}
out["welch"] = {alt: dict(zip(("t", "p"), map(float, st.ttest_ind(x, y, equal_var=False, alternative=alt)))) for alt in ("two-sided", "less", "greater")}

# exact small-sample rank tests (no ties): Mann-Whitney U and Wilcoxon signed-rank with method="exact"
mw_cases = [([1.1, 2.3, 3.8, 4.4], [2.0, 5.2, 6.1, 7.7, 8.3]), ([12.5, 9.1, 14.8, 11.2, 10.7, 13.9], [8.8, 9.9, 10.1, 7.4, 12.0, 6.5, 9.3]),
            ([5.5, 3.2], [1.1, 2.2, 4.4, 6.6, 7.7, 8.8]), (list(np.linspace(1, 20, 12) + 0.013 * np.arange(12) ** 2), list(np.linspace(2, 19, 11) + 0.007 * np.arange(11) ** 2 + 0.001))]
out["mannwhitney_exact"] = []
for a_, b_ in mw_cases:
    out["mannwhitney_exact"].append({"a": list(map(float, a_)), "b": list(map(float, b_)),
        **{alt: float(st.mannwhitneyu(a_, b_, alternative=alt, method="exact").pvalue) for alt in ("two-sided", "less", "greater")}})
wx_cases = [([12.1, 9.8, 14.2, 11.5, 10.9, 13.3, 15.0, 9.1], [10.2, 9.9, 12.0, 10.5, 11.1, 12.4, 13.9, 8.8]), ([1.5, 2.9, 3.1, 4.7, 5.2], [2.1, 3.8, 3.0, 6.9, 8.4]),
            (list(range(1, 16)), [v + (0.37 * (i + 1) if i % 3 else -0.21 * (i + 2)) for i, v in enumerate(range(1, 16))])]
out["wilcoxon_exact"] = []
for b_, a_ in wx_cases:
    out["wilcoxon_exact"].append({"before": list(map(float, b_)), "after": list(map(float, a_)),
        **{alt: float(st.wilcoxon(a_, b_, alternative=alt, method="exact").pvalue) for alt in ("two-sided", "less", "greater")}})

# k groups
groups = {"A": [1.2, 2.3, 1.9, 2.8], "B": [3.1, 4.2, 3.8, 5.9], "C": [2.2, 7.1, 4.4, 9.3]}
gtext = ", ".join(f"{v}:{g}" for g, vs in groups.items() for v in vs)
out["groups_text"] = gtext
vals = [np.array(v) for v in groups.values()]
lev = st.levene(*vals, center="mean"); out["levene_mean"] = {"F": float(lev.statistic), "p": float(lev.pvalue)}
lev_med = st.levene(*vals, center="median"); out["levene_median"] = {"F": float(lev_med.statistic), "p": float(lev_med.pvalue)}
bt = st.bartlett(*vals); out["bartlett"] = {"chi2": float(bt.statistic), "p": float(bt.pvalue)}
mm = st.median_test(*vals, ties="ignore", correction=False); out["moods"] = {"chi2": float(mm[0]), "p": float(mm[1]), "median": float(mm[2])}
fo = st.f_oneway(*vals); out["anova"] = {"F": float(fo.statistic), "p": float(fo.pvalue)}
n_tot = sum(len(v) for v in vals); k = len(vals)
msw = sum(((v - v.mean()) ** 2).sum() for v in vals) / (n_tot - k)
pairs = []
names = list(groups)
for i in range(k):
    for j in range(i + 1, k):
        a, b = vals[i], vals[j]
        t = (a.mean() - b.mean()) / np.sqrt(msw * (1 / len(a) + 1 / len(b)))
        pairs.append({"g1": names[i], "g2": names[j], "t": float(t), "p": float(2 * st.t.sf(abs(t), n_tot - k))})
out["bonferroni_pairs"] = pairs

# 2x2 and r x c tables
out["mcnemar"] = {}
tab = np.array([[20, 5], [11, 14]])      # a, b, c, d = 20, 5, 11, 14
mc = mcnemar(tab, exact=False, correction=True); out["mcnemar"] = {"table": [20, 5, 11, 14], "chi2": float(mc.statistic), "p": float(mc.pvalue)}
t2 = np.array([[12, 5], [3, 9]])
out["phi"] = {"table": [12, 5, 3, 9], "phi_abs": float(st.contingency.association(t2, method="cramer", correction=False))}
t3 = np.array([[10, 3, 4], [2, 8, 6], [5, 4, 9]])
rows = ["a", "b", "c"]; cols = ["x", "y", "z"]
out["cramers"] = {"pairs": [f"{rows[i]},{cols[j]}" for i in range(3) for j in range(3) for _ in range(t3[i, j])],
                  "V": float(st.contingency.association(t3, method="cramer", correction=False)),
                  "chi2": float(st.chi2_contingency(t3, correction=False)[0])}

# correlation family
z = np.array([3, 1, 4, 1, 5, 9, 2, 6.0]); xs = np.arange(1, 9.0); ys = np.array([2.1, 3.9, 6.2, 7.8, 10.3, 11.9, 14.2, 15.8])
out["xs"], out["ys"], out["z"] = xs.tolist(), ys.tolist(), z.tolist()
def resid(a, c):
    A = np.column_stack([np.ones_like(c), c]); return a - A @ np.linalg.lstsq(A, a, rcond=None)[0]
out["partial"] = float(np.corrcoef(resid(xs, z), resid(ys, z))[0, 1])
bin_ = np.array([0, 0, 0, 1, 1, 1, 0, 1])
out["pointbiserial"] = {"binary": bin_.tolist(), "r": float(st.pointbiserialr(bin_, x).statistic)}
out["cov_sample"] = float(np.cov(x, y, ddof=1)[0, 1])
out["corrmatrix"] = np.corrcoef([x, y, z]).tolist(); out["corr_third"] = z.tolist()
def dcor(a, b):
    def cen(v):
        d = np.abs(v[:, None] - v[None, :]); return d - d.mean(0) - d.mean(1)[:, None] + d.mean()
    A, B = cen(a), cen(b)
    return float(np.sqrt((A * B).mean() / np.sqrt((A * A).mean() * (B * B).mean())))
out["dcor"] = dcor(x, y)
res = np.array([0.5, -0.2, 0.3, -0.8, 0.1, 0.4, -0.5]); out["durbin_watson"] = {"residuals": res.tolist(), "dw": float(durbin_watson(res))}

# regression (statsmodels OLS)
m = sm.OLS(ys, sm.add_constant(xs)).fit()
out["ols"] = {"slope": float(m.params[1]), "intercept": float(m.params[0]), "se_slope": float(m.bse[1]), "se_intercept": float(m.bse[0]),
              "t_slope": float(m.tvalues[1]), "t_intercept": float(m.tvalues[0]), "p_slope": float(m.pvalues[1]), "p_intercept": float(m.pvalues[0]),
              "F": float(m.fvalue), "F_p": float(m.f_pvalue), "r2": float(m.rsquared), "adj_r2": float(m.rsquared_adj), "mse_resid": float(m.mse_resid)}
act = np.array([2, 3, 4, 5, 6.5, 7]); pred = np.array([2.1, 2.9, 4.2, 4.8, 6.0, 7.2]); kk = 2; r = act - pred
ssr, sst = (r ** 2).sum(), ((act - act.mean()) ** 2).sum()
out["model_summary"] = {"actual": act.tolist(), "predicted": pred.tolist(), "k": kk, "r2": float(1 - ssr / sst),
                        "adj_r2": float(1 - (1 - (1 - ssr / sst)) * (len(act) - 1) / (len(act) - kk - 1)),
                        "rmse": float(np.sqrt((r ** 2).mean())), "rse": float(np.sqrt(ssr / (len(act) - kk - 1))),
                        "mae": float(np.abs(r).mean()), "mape": float(np.mean(np.abs(r / act)) * 100)}
# ANCOVA
yv = [1.2, 2.3, 1.9, 2.8, 3.1, 4.2, 3.8, 5.9, 2.2, 7.1, 4.4, 9.3]; gv = list("AAAABBBBCCCC"); cv = [1, 2, 3, 4, 1, 2, 3, 5, 2, 3, 4, 6]
import pandas as pd
df = pd.DataFrame({"y": yv, "g": gv, "c": cv}); an = anova_lm(smf.ols("y ~ c + C(g)", df).fit(), typ=2)
out["ancova"] = {"text": "\n".join(f"{a},{b},{c}" for a, b, c in zip(yv, gv, cv)), "F": float(an.loc["C(g)", "F"]), "p": float(an.loc["C(g)", "PR(>F)"])}
# Lilliefors
ks = lilliefors(x, dist="norm", pvalmethod="table"); out["lilliefors"] = {"D": float(ks[0]), "p": float(ks[1])}

# descriptive / preparation
d = np.array([1, 2, 3, 4, 100, 6, 7.0]); out["d"] = d.tolist()
out["mad"] = float(st.median_abs_deviation(d)); out["sem"] = float(st.sem(x)); out["sem_x"] = x.tolist()
out["skew_g1"] = float(st.skew(x, bias=False)); out["kurt_g2"] = float(st.kurtosis(x, bias=False)); out["cv_pop"] = float(st.variation(x))
w = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 100.0]); out["winsor"] = {"data": w.tolist(), "pct": 10, "result": np.clip(w, np.percentile(w, 10), np.percentile(w, 90)).tolist()}
r8 = [3, 1, 4, 1, 5, 9, 2, 6]; out["rank"] = {"data": r8, "ranks": st.rankdata(r8).tolist()}
out["zscore"] = st.zscore(x, ddof=1).tolist(); out["minmax"] = ((x - x.min()) / (x.max() - x.min())).tolist()
o = np.array([1, 2, 3, 4, 5, 60.0]); q1, q3 = np.percentile(o, [25, 75]); out["iqr_fence"] = {"data": o.tolist(), "lo": float(q1 - 1.5 * (q3 - q1)), "hi": float(q3 + 1.5 * (q3 - q1))}

# histogram / binning counts (NumPy: equal-width bins, [a, b) with the last bin closed), log transform, mutual information (bits), MLE fits
fd = np.array([2.1, 3.4, 1.9, 5.6, 4.4, 6.1, 3.8, 5.2, 2.7, 4.9]); fy = np.array([1.8, 3.9, 2.4, 5.1, 5.0, 6.6, 3.1, 5.9, 2.2, 4.1])
out["fd"], out["fy"] = fd.tolist(), fy.tolist()
out["hist_counts"] = {str(b): np.histogram(fd, bins=b)[0].tolist() for b in (3, 4, 5, 7)}
out["log10"] = np.log10(fd).tolist(); out["ln"] = np.log(fd).tolist(); out["log2"] = np.log2(fd).tolist()
def mi_bits(a, b, bins):
    j, _, _ = np.histogram2d(a, b, bins=bins); p = j / j.sum(); px, py = p.sum(1), p.sum(0)
    nz = p > 0; return float((p[nz] * np.log2(p[nz] / np.outer(px, py)[nz])).sum())
out["mutual_info_bits"] = {str(b): mi_bits(fd, fy, b) for b in (3, 4, 5)}
mu, sd = st.norm.fit(fd)
out["fit"] = {"normal": {"mean": float(mu), "stdDev": float(sd), "logLikelihood": float(st.norm.logpdf(fd, mu, sd).sum())},
              "exponential": {"rate": float(1 / st.expon.fit(fd, floc=0)[1]), "logLikelihood": float(st.expon.logpdf(fd, 0, st.expon.fit(fd, floc=0)[1]).sum())},
              "uniform": {"min": float(fd.min()), "max": float(fd.max()), "logLikelihood": float(-len(fd) * np.log(fd.max() - fd.min()))}}

# core distribution functions on a grid
grid = {"norm_cdf": [[z_, float(st.norm.cdf(z_))] for z_ in (-3.1, -1, 0, 0.5, 1.96, 4)],
        "t_cdf": [[t_, df, float(st.t.cdf(t_, df))] for t_ in (-2.5, 0.3, 1.7) for df in (1, 5, 30)],
        "chi2_cdf": [[c_, df, float(st.chi2.cdf(c_, df))] for c_ in (0.5, 3, 12) for df in (1, 4, 10)],
        "f_cdf": [[f_, a_, b_, float(st.f.cdf(f_, a_, b_))] for f_ in (0.4, 2.2, 6) for a_, b_ in ((1, 5), (4, 12), (10, 3))],
        "beta_cdf": [[x_, a_, b_, float(st.beta.cdf(x_, a_, b_))] for x_ in (0.1, 0.5, 0.9) for a_, b_ in ((2, 5), (0.5, 0.5), (8, 3))],
        "binom_pmf": [[n_, k_, p_, float(st.binom.pmf(k_, n_, p_))] for n_, k_, p_ in ((10, 3, 0.4), (50, 25, 0.5), (200, 10, 0.05))],
        "t_crit": [[a_, df, float(st.t.ppf(1 - a_, df))] for a_ in (0.025, 0.05, 0.005) for df in (3, 12, 60)],
        "chi2_crit": [[a_, df, float(st.chi2.ppf(1 - a_, df))] for a_ in (0.05, 0.01) for df in (1, 5, 20)],
        "f_crit": [[a_, d1, d2, float(st.f.ppf(1 - a_, d1, d2))] for a_ in (0.05, 0.01) for d1, d2 in ((2, 9), (5, 20), (1, 100))]}
out["grid"] = grid

# summary-statistics input (textbook questions): the same tests from n / mean / sd / counts
from scipy.stats import chi2_contingency
from statsmodels.stats.proportion import proportions_ztest
out["summary"] = {}
# one-sample t from summary: t = (mean - mu0)/(s/sqrt(n)), p from the t distribution (computed here, not copied from the app)
def t_from_summary(n, mean, s, mu0, alt):
    t = (mean - mu0) / (s / np.sqrt(n)); df = n - 1
    p = {"two-sided": 2 * st.t.sf(abs(t), df), "greater": st.t.sf(t, df), "less": st.t.cdf(t, df)}[alt]
    return {"t": float(t), "p": float(p)}
out["summary"]["one_t"] = {alt: t_from_summary(25, 16.2, 2.5, 15, alt) for alt in ("two-sided", "less", "greater")}
out["summary"]["one_z"] = {alt: {"z": float((15.8 - 15) / (2 / 6)), "p": float({"two-sided": 2 * st.norm.sf(abs((15.8 - 15) / (2 / 6))), "greater": st.norm.sf((15.8 - 15) / (2 / 6)), "less": st.norm.cdf((15.8 - 15) / (2 / 6))}[alt])} for alt in ("two-sided", "less", "greater")}
out["summary"]["welch"] = {alt: dict(zip(("t", "p"), map(float, st.ttest_ind_from_stats(82, 8, 30, 78, 10, 35, equal_var=False, alternative=alt)))) for alt in ("two-sided", "less", "greater")}
out["summary"]["two_prop"] = {alt: dict(zip(("z", "p"), map(float, proportions_ztest([45, 30], [120, 110], alternative={"two-sided": "two-sided", "greater": "larger", "less": "smaller"}[alt])))) for alt in ("two-sided", "less", "greater")}
tbl = [[30, 20, 10], [20, 25, 15]]
c2 = chi2_contingency(tbl, correction=False)
out["summary"]["chisq_table"] = {"table": tbl, "chi2": float(c2[0]), "p": float(c2[1]), "df": int(c2[2])}

# distribution densities / probabilities behind the graphs and the Probability Calculator
out["density"] = {
    "t_pdf": [[x_, df, float(st.t.pdf(x_, df))] for x_ in (-2.5, 0, 1.3) for df in (1, 5, 30)],
    "chi2_pdf": [[x_, df, float(st.chi2.pdf(x_, df))] for x_ in (0.5, 3, 9) for df in (2, 4, 10)],
    "f_pdf": [[x_, a_, b_, float(st.f.pdf(x_, a_, b_))] for x_ in (0.4, 1.5, 4) for a_, b_ in ((4, 12), (2, 9), (10, 30))],
    "exp_pdf": [[x_, r_, float(st.expon.pdf(x_, scale=1 / r_))] for x_ in (0.2, 1, 3) for r_ in (0.5, 2)],
    "poisson_pmf": [[k_, l_, float(st.poisson.pmf(k_, l_))] for k_ in (0, 3, 10) for l_ in (0.7, 4, 12)],
    "weibull_cdf": [[x_, k_, l_, float(st.weibull_min.cdf(x_, k_, scale=l_))] for x_ in (0.5, 2, 5) for k_, l_ in ((1.5, 2), (0.8, 1))],
}
out["probcalc"] = [
    ["normal", {"mean": 0, "stdDev": 1}, "between", -1, 2, float(st.norm.cdf(2) - st.norm.cdf(-1))],
    ["t", {"df": 10}, "gt", 2.228, 0, float(st.t.sf(2.228, 10))],
    ["chisq", {"df": 4}, "ge", 9.488, 0, float(st.chi2.sf(9.488, 4))],
    ["f", {"df1": 4, "df2": 12}, "gt", 3.26, 0, float(st.f.sf(3.26, 4, 12))],
    ["binomial", {"n": 10, "p": 0.4}, "between", 3, 5, float(st.binom.cdf(5, 10, 0.4) - st.binom.cdf(2, 10, 0.4))],
    ["binomial", {"n": 10, "p": 0.4}, "lt", 3, 0, float(st.binom.cdf(2, 10, 0.4))],
    ["poisson", {"lambda": 4}, "ge", 6, 0, float(st.poisson.sf(5, 4))],
    ["poisson", {"lambda": 4}, "eq", 2, 0, float(st.poisson.pmf(2, 4))],
    ["exponential", {"rate": 0.5}, "outside", 1, 4, float(1 - (st.expon.cdf(4, scale=2) - st.expon.cdf(1, scale=2)))],
    ["normal", {"mean": 100, "stdDev": 15}, "le", 85, 0, float(st.norm.cdf(85, 100, 15))],
]

# grouped data: class midpoints expanded to a plain sample; value/frequency table expanded with np.repeat
vals = np.array([2, 3, 5, 8]); fr = np.array([4, 7, 5, 2]); exp = np.repeat(vals, fr)
out["grouped_values"] = {"text": "2, 4\n3, 7\n5, 5\n8, 2", "n": int(exp.size), "mean": float(exp.mean()), "median": float(np.median(exp)), "sd": float(exp.std(ddof=1))}
mids = np.array([15, 25, 35, 45, 55]); cf_ = np.array([4, 10, 18, 6, 2]); mexp = np.repeat(mids, cf_)
out["grouped_classes"] = {"text": "10-20, 4\n20-30, 10\n30-40, 18\n40-50, 6\n50-60, 2", "n": int(mexp.size), "mean": float(mexp.mean()), "sd": float(mexp.std(ddof=1))}
json.dump(out, open(os.path.join(os.path.dirname(__file__), "reference-values.json"), "w"), indent=1)
print("wrote reference-values.json")
