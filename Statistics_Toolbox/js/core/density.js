// Density / mass functions and a registry of named distributions, for the distribution graphs and the Probability Calculator.
// Everything here is evaluated in log space where a power or a gamma function could overflow (the same lesson as betaPDF).
// The CDFs come from numerics.js (exact incomplete gamma / beta functions); tests/reference-values.test.js checks them against SciPy.

function tPDF(x, df) {
    return Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log1p(x * x / df));
}

function chiSquarePDF(x, df) {
    if (x < 0) return 0;
    if (x === 0) return df < 2 ? Infinity : (df === 2 ? 0.5 : 0);
    return Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.LN2 - logGamma(df / 2));
}

function fPDF(x, df1, df2) {
    if (x < 0) return 0;
    if (x === 0) return df1 < 2 ? Infinity : (df1 === 2 ? 1 : 0);
    const logB = logGamma(df1 / 2) + logGamma(df2 / 2) - logGamma((df1 + df2) / 2);
    return Math.exp((df1 / 2) * Math.log(df1 / df2) + (df1 / 2 - 1) * Math.log(x) - ((df1 + df2) / 2) * Math.log1p(df1 * x / df2) - logB);
}

function exponentialPDF(x, rate) {
    return x < 0 ? 0 : rate * Math.exp(-rate * x);
}

function uniformPDF(x, min, max) {
    return x >= min && x <= max ? 1 / (max - min) : 0;
}

function poissonPMF(k, lambda) {
    if (k < 0 || !Number.isInteger(k)) return 0;
    return Math.exp(-lambda + k * Math.log(lambda) - logGamma(k + 1));
}

// P(X <= k) for a discrete distribution given its pmf: a plain sum over 0..floor(k)
function discreteCDF(pmf, k) {
    let sum = 0;
    for (let i = 0, top = Math.floor(k); i <= top; i++) sum += pmf(i);
    return Math.min(1, sum);
}

// Named distributions. params use the names of the tool forms. `range(p)` is the x interval worth drawing (a continuous curve's
// visible part, or the support of a discrete distribution, with the far tail that carries no visible probability cut off).
const PLOT_DISTRIBUTIONS = {
    normal: {
        kind: 'continuous', label: 'Normal(μ, σ)', fields: [['mean', 'Mean μ', 0], ['stdDev', 'Standard deviation σ', 1]],
        valid: p => isFinite(p.mean) && p.stdDev > 0,
        pdf: (x, p) => normalPDF(x, p.mean, p.stdDev), cdf: (x, p) => normalCDF(x, p.mean, p.stdDev),
        range: p => [p.mean - 4.2 * p.stdDev, p.mean + 4.2 * p.stdDev]
    },
    t: {
        kind: 'continuous', label: "Student's t (df)", fields: [['df', 'Degrees of freedom', 10]],
        valid: p => p.df > 0,
        pdf: (x, p) => tPDF(x, p.df), cdf: (x, p) => tCDF(x, p.df),
        range: p => { const w = p.df <= 2 ? 10 : (p.df <= 5 ? 6 : 4.5); return [-w, w]; }
    },
    chisq: {
        kind: 'continuous', label: 'Chi-square (df)', fields: [['df', 'Degrees of freedom', 5]],
        valid: p => p.df > 0,
        pdf: (x, p) => chiSquarePDF(x, p.df), cdf: (x, p) => chiSquareCDF(x, p.df),
        range: p => [0, p.df + 5 * Math.sqrt(2 * p.df) + 4]
    },
    f: {
        kind: 'continuous', label: 'F (df₁, df₂)', fields: [['df1', 'Numerator df₁', 4], ['df2', 'Denominator df₂', 12]],
        valid: p => p.df1 > 0 && p.df2 > 0,
        pdf: (x, p) => fPDF(x, p.df1, p.df2), cdf: (x, p) => fCDF(x, p.df1, p.df2),
        range: p => [0, Math.max(4, fCriticalValue(0.002, p.df1, p.df2) * 1.1)]
    },
    exponential: {
        kind: 'continuous', label: 'Exponential (λ)', fields: [['rate', 'Rate λ', 1]],
        valid: p => p.rate > 0,
        pdf: (x, p) => exponentialPDF(x, p.rate), cdf: (x, p) => (x <= 0 ? 0 : -Math.expm1(-p.rate * x)),
        range: p => [0, 6 / p.rate]
    },
    uniform: {
        kind: 'continuous', label: 'Uniform (a, b)', fields: [['min', 'Minimum a', 0], ['max', 'Maximum b', 1]],
        valid: p => isFinite(p.min) && isFinite(p.max) && p.min < p.max,
        pdf: (x, p) => uniformPDF(x, p.min, p.max), cdf: (x, p) => Math.min(1, Math.max(0, (x - p.min) / (p.max - p.min))),
        range: p => { const w = p.max - p.min; return [p.min - 0.15 * w, p.max + 0.15 * w]; }
    },
    beta: {
        kind: 'continuous', label: 'Beta (α, β)', fields: [['alpha', 'Shape α', 2], ['beta', 'Shape β', 5]],
        valid: p => p.alpha > 0 && p.beta > 0,
        pdf: (x, p) => betaPDF(x, p.alpha, p.beta), cdf: (x, p) => (x <= 0 ? 0 : (x >= 1 ? 1 : betaCDF(x, p.alpha, p.beta))),
        range: () => [0, 1]
    },
    weibull: {
        kind: 'continuous', label: 'Weibull (k, λ)', fields: [['shape', 'Shape k', 1.5], ['scale', 'Scale λ', 2]],
        valid: p => p.shape > 0 && p.scale > 0,
        pdf: (x, p) => (x < 0 ? 0 : (x === 0 ? (p.shape < 1 ? Infinity : (p.shape === 1 ? 1 / p.scale : 0)) : (p.shape / p.scale) * Math.pow(x / p.scale, p.shape - 1) * Math.exp(-Math.pow(x / p.scale, p.shape)))),
        cdf: (x, p) => (x <= 0 ? 0 : -Math.expm1(-Math.pow(x / p.scale, p.shape))),
        range: p => [0, p.scale * Math.pow(7, 1 / p.shape)]
    },
    binomial: {
        kind: 'discrete', label: 'Binomial (n, p)', fields: [['n', 'Trials n', 10], ['p', 'Probability p', 0.4]],
        valid: p => Number.isInteger(p.n) && p.n >= 1 && p.n <= 1000 && p.p >= 0 && p.p <= 1,
        pmf: (k, p) => (Number.isInteger(k) && k >= 0 && k <= p.n ? binomialPMF(p.n, k, p.p) : 0),
        cdf: (x, p) => (x < 0 ? 0 : discreteCDF(k => binomialPMF(p.n, k, p.p), Math.min(x, p.n))),
        range: p => {
            const sd = Math.sqrt(p.n * p.p * (1 - p.p)), mean = p.n * p.p;
            return [Math.max(0, Math.floor(mean - 5 * sd - 1)), Math.min(p.n, Math.ceil(mean + 5 * sd + 1))];
        }
    },
    poisson: {
        kind: 'discrete', label: 'Poisson (λ)', fields: [['lambda', 'Mean λ', 4]],
        valid: p => p.lambda > 0 && p.lambda <= 1e5,
        pmf: (k, p) => poissonPMF(k, p.lambda),
        cdf: (x, p) => (x < 0 ? 0 : discreteCDF(k => poissonPMF(k, p.lambda), x)),
        range: p => [Math.max(0, Math.floor(p.lambda - 5 * Math.sqrt(p.lambda) - 1)), Math.ceil(p.lambda + 6 * Math.sqrt(p.lambda) + 3)]
    }
};
