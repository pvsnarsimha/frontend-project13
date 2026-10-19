// Moments of the named distributions (normal, exponential, uniform, beta, Poisson, binomial), defined once.
// The expected-value, variance, skewness and kurtosis tools take their numbers from here, so a formula can never differ
// between tools. Parameters use the names of the tool forms: mean, stdDev, rate, min, max, alpha, beta, lambda, n, p.
// kurtosis is the EXCESS kurtosis (normal = 0). Parameters are assumed valid (see validateDistributionParams in helpers.js).
const DISTRIBUTION_MOMENTS = {
    normal: p => ({ mean: p.mean === undefined ? 0 : p.mean, variance: p.stdDev * p.stdDev, skewness: 0, kurtosis: 0 }),
    exponential: p => ({ mean: 1 / p.rate, variance: 1 / (p.rate * p.rate), skewness: 2, kurtosis: 6 }),
    uniform: p => ({ mean: (p.min + p.max) / 2, variance: Math.pow(p.max - p.min, 2) / 12, skewness: 0, kurtosis: -1.2 }),
    beta: p => {
        const s = p.alpha + p.beta;
        return {
            mean: p.alpha / s,
            variance: (p.alpha * p.beta) / (s * s * (s + 1)),
            skewness: 2 * (p.beta - p.alpha) * Math.sqrt(s + 1) / ((s + 2) * Math.sqrt(p.alpha * p.beta)),
            kurtosis: 6 * (Math.pow(p.alpha - p.beta, 2) * (s + 1) - p.alpha * p.beta * (s + 2)) / (p.alpha * p.beta * (s + 2) * (s + 3))
        };
    },
    poisson: p => ({ mean: p.lambda, variance: p.lambda, skewness: 1 / Math.sqrt(p.lambda), kurtosis: 1 / p.lambda }),
    binomial: p => {
        const v = p.n * p.p * (1 - p.p);
        return { mean: p.n * p.p, variance: v, skewness: (1 - 2 * p.p) / Math.sqrt(v), kurtosis: (1 - 6 * p.p * (1 - p.p)) / v };
    }
};

function distributionMoments(distType, params) {
    const moments = DISTRIBUTION_MOMENTS[distType];
    if (!moments) throw new Error(`Unknown distribution: ${distType}`);
    return moments(params);
}
