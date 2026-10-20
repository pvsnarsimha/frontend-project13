/* Numerical primitives shared by every tool: special functions, CDFs and exact critical values.
 *
 * This is the only place these functions are defined. Every p-value and critical value in the
 * app comes from the exact functions below (incomplete gamma / incomplete beta), not from lookup
 * tables, so any degrees of freedom and any significance level give a correct answer.
 */

// ---- Gamma family -----------------------------------------------------------------------------
function logGamma(z) {
    // Lanczos approximation (g = 7, n = 9), relative error ~1e-15
    const g = 7;
    const p = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];

    if (z < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
    }

    z -= 1;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) {
        x += p[i] / (z + i);
    }
    const t = z + g + 0.5;
    return Math.log(2 * Math.PI) / 2 + Math.log(x) - t + (z + 0.5) * Math.log(t);
}

function gamma(z) {
    if (z <= 0) return Infinity;
    return Math.exp(logGamma(z));
}

// Regularised lower incomplete gamma P(a, x): series for x < a + 1, continued fraction otherwise
function gammaP(a, x) {
    if (x <= 0) return 0;
    if (a <= 0) return 1;
    if (x === Infinity) return 1;
    const lead = Math.exp(-x + a * Math.log(x) - logGamma(a));
    if (x < a + 1) {
        let sum = 1 / a, term = sum, ap = a;
        for (let i = 0; i < 2000; i++) {
            ap += 1;
            term *= x / ap;
            sum += term;
            if (Math.abs(term) < Math.abs(sum) * 1e-16) break;
        }
        return Math.min(1, sum * lead);
    }
    const TINY = 1e-300;
    let b = x + 1 - a, c = 1 / TINY, d = 1 / b, h = d;
    for (let i = 1; i <= 2000; i++) {
        const an = -i * (i - a);
        b += 2;
        d = an * d + b; if (Math.abs(d) < TINY) d = TINY;
        c = b + an / c; if (Math.abs(c) < TINY) c = TINY;
        d = 1 / d;
        const del = d * c;
        h *= del;
        if (Math.abs(del - 1) < 1e-16) break;
    }
    return Math.max(0, 1 - lead * h);
}

// Unregularised lower incomplete gamma, kept for the tools that quote gamma(s, x) directly
function lowerIncompleteGamma(s, x) {
    return gammaP(s, x) * gamma(s);
}

function chiSquareCDF(x, df) {
    if (x <= 0) return 0;
    return gammaP(df / 2, x / 2);
}

// ---- Normal distribution -----------------------------------------------------------------------
function erf(x) {
    // erf(x) = P(1/2, x^2): accurate to ~1e-15 for every x (the old Abramowitz-Stegun 7.1.26 was 1.5e-7)
    if (x === 0) return 0;
    const v = gammaP(0.5, x * x);
    return x < 0 ? -v : v;
}

function normCDF(z) {
    // Standard normal CDF: Hart's rational approximation as published by West (2005),
    // absolute error ~1e-16 and fast enough to be used inside numerical integrals.
    const x = Math.abs(z);
    let tail;
    if (x > 37) {
        tail = 0;
    } else {
        const e = Math.exp(-x * x / 2);
        if (x < 7.07106781186547) {
            let num = 3.52624965998911e-02 * x + 0.700383064443688;
            num = num * x + 6.37396220353165;
            num = num * x + 33.912866078383;
            num = num * x + 112.079291497871;
            num = num * x + 221.213596169931;
            num = num * x + 220.206867912376;
            let den = 8.83883476483184e-02 * x + 1.75566716318264;
            den = den * x + 16.064177579207;
            den = den * x + 86.7807322029461;
            den = den * x + 296.564248779674;
            den = den * x + 637.333633378831;
            den = den * x + 793.826512519948;
            den = den * x + 440.413735824752;
            tail = e * num / den;
        } else {
            let b = x + 0.65;
            b = x + 4 / b;
            b = x + 3 / b;
            b = x + 2 / b;
            b = x + 1 / b;
            tail = e / b / 2.506628274631;
        }
    }
    return z > 0 ? 1 - tail : tail;
}

function normInv(p) {
    // Inverse standard normal CDF: Acklam's rational approximation (relative error 1.2e-9),
    // then one Halley refinement step against the exact CDF (full double precision).
    if (isNaN(p) || p < 0 || p > 1) return NaN;
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104961687e+02,
               1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
               6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
               -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
               3.754408661907416e+00];
    const tail = q => (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                       ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    const pLow = 0.02425;

    let x;
    if (p < pLow) {
        x = tail(Math.sqrt(-2 * Math.log(p)));
    } else if (p <= 1 - pLow) {
        const q = p - 0.5, r = q * q;
        x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
            (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
        x = -tail(Math.sqrt(-2 * Math.log(1 - p)));
    }
    const e = normCDF(x) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
}

function erfinv(x) {
    // erf^-1(x) = normInv((x + 1) / 2) / sqrt(2)
    return normInv((x + 1) / 2) / Math.SQRT2;
}

// ---- Incomplete beta, Student t and F ----------------------------------------------------------
function betaIncReg(x, a, b) {
    // Regularized incomplete beta I_x(a, b) via continued fraction (Lentz)
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const lbeta = logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
    const cf = (xx, aa, bb) => {
        const TINY = 1e-300;
        let c = 1, d = 1 - (aa + bb) * xx / (aa + 1);
        if (Math.abs(d) < TINY) d = TINY;
        d = 1 / d;
        let h = d;
        for (let m = 1; m <= 300; m++) {
            const m2 = 2 * m;
            let n = m * (bb - m) * xx / ((aa + m2 - 1) * (aa + m2));
            d = 1 + n * d; if (Math.abs(d) < TINY) d = TINY;
            c = 1 + n / c; if (Math.abs(c) < TINY) c = TINY;
            d = 1 / d; h *= d * c;
            n = -(aa + m) * (aa + bb + m) * xx / ((aa + m2) * (aa + m2 + 1));
            d = 1 + n * d; if (Math.abs(d) < TINY) d = TINY;
            c = 1 + n / c; if (Math.abs(c) < TINY) c = TINY;
            d = 1 / d;
            const del = d * c; h *= del;
            if (Math.abs(del - 1) < 3e-14) break;
        }
        return h;
    };
    return x < (a + 1) / (a + b + 2)
        ? Math.exp(lbeta) * cf(x, a, b) / a
        : 1 - Math.exp(lbeta) * cf(1 - x, b, a) / b;
}

function tCDF(t, df) {
    // Exact Student-t CDF through the incomplete beta function
    if (df <= 0) return t > 0 ? 1 : 0;
    if (t === Infinity) return 1;
    if (t === -Infinity) return 0;
    if (isNaN(t)) return NaN;
    const ib = betaIncReg(df / (df + t * t), df / 2, 0.5);
    return t >= 0 ? 1 - ib / 2 : ib / 2;
}

function fCDF(f, df1, df2) {
    // Exact F CDF through the incomplete beta function
    if (f <= 0) return 0;
    if (f === Infinity) return 1;
    return betaIncReg(df1 * f / (df1 * f + df2), df1 / 2, df2 / 2);
}

// ---- Exact critical values (upper-tail probability -> quantile) ---------------------------------
// Monotone bisection on the exact CDFs. `upper(x)` is the right-tail probability and decreases in x.
function solveUpperTail(upper, p, hi, tol = 1e-13) {
    let lo = 0;
    let guard = 0;
    while (upper(hi) > p && guard++ < 200) { lo = hi; hi *= 2; }
    for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        if (upper(mid) > p) lo = mid; else hi = mid;
        if (hi - lo <= tol * Math.max(1, hi)) break;
    }
    return (lo + hi) / 2;
}

function tCriticalValue(p, df) {
    // t such that P(T > t) = p (p is the one-tailed probability, e.g. alpha or alpha / 2)
    if (!(df > 0) || !(p > 0) || p >= 1) return NaN;
    if (p === 0.5) return 0;
    if (p > 0.5) return -tCriticalValue(1 - p, df);
    return solveUpperTail(t => 1 - tCDF(t, df), p, 4);
}

function fCriticalValue(alpha, df1, df2) {
    // f such that P(F > f) = alpha
    if (!(df1 > 0) || !(df2 > 0) || !(alpha > 0) || alpha >= 1) return NaN;
    return solveUpperTail(f => 1 - fCDF(f, df1, df2), alpha, 4);
}

function chiSquareCriticalValue(alpha, df) {
    // x such that P(chi2_df > x) = alpha
    if (!(df > 0) || !(alpha > 0) || alpha >= 1) return NaN;
    return solveUpperTail(x => 1 - chiSquareCDF(x, df), alpha, Math.max(4, df));
}

// ---- Beta distribution -------------------------------------------------------------------------
function betaCDF(x, alpha, beta) {
    return betaIncReg(x, alpha, beta);
}

function betaQuantile(p, alpha, beta) {
    // x such that I_x(alpha, beta) = p, by bisection on the exact CDF
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let lo = 0, hi = 1;
    for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        if (betaIncReg(mid, alpha, beta) < p) lo = mid; else hi = mid;
        if (hi - lo < 1e-15) break;
    }
    return (lo + hi) / 2;
}

// ---- Studentized range (Tukey HSD) -------------------------------------------------------------
// Gauss-Legendre nodes/weights on [-1, 1], computed once per order
const _glCache = {};
function gaussLegendre(n) {
    if (_glCache[n]) return _glCache[n];
    const x = new Array(n), w = new Array(n);
    for (let i = 0; i < Math.ceil(n / 2); i++) {
        let z = Math.cos(Math.PI * (i + 0.75) / (n + 0.5)), pp = 1;
        for (let it = 0; it < 100; it++) {
            let p1 = 1, p2 = 0;
            for (let j = 0; j < n; j++) { const p3 = p2; p2 = p1; p1 = ((2 * j + 1) * z * p2 - j * p3) / (j + 1); }
            pp = n * (z * p1 - p2) / (z * z - 1);
            const dz = p1 / pp;
            z -= dz;
            if (Math.abs(dz) < 1e-15) break;
        }
        x[i] = -z; x[n - 1 - i] = z;
        w[i] = w[n - 1 - i] = 2 / ((1 - z * z) * pp * pp);
    }
    return (_glCache[n] = { x, w });
}

function gaussLegendreIntegral(f, a, b, panels, order) {
    const { x, w } = gaussLegendre(order);
    const h = (b - a) / panels;
    let sum = 0;
    for (let p = 0; p < panels; p++) {
        const lo = a + p * h, mid = lo + h / 2;
        for (let i = 0; i < order; i++) sum += w[i] * f(mid + x[i] * h / 2);
    }
    return sum * h / 2;
}

// P(range of k standard normals <= w)
function normalRangeCDF(w, k) {
    if (w <= 0) return 0;
    const inner = z => {
        const phi = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
        const d = normCDF(z) - normCDF(z - w);
        return phi * Math.pow(Math.max(d, 0), k - 1);
    };
    return Math.min(1, k * gaussLegendreIntegral(inner, -8, 8 + w, 6, 20));
}

// P(Q <= q) for the studentized range with k groups and df error degrees of freedom
function studentizedRangeCDF(q, k, df) {
    if (q <= 0) return 0;
    if (!isFinite(df) || df > 5000) return normalRangeCDF(q, k);
    // s = sqrt(chi2_df / df); density f(s) = 2 (df/2)^(df/2) / Gamma(df/2) * s^(df-1) * exp(-df s^2 / 2)
    const logC = Math.log(2) + (df / 2) * Math.log(df / 2) - logGamma(df / 2);
    const dens = s => s <= 0 ? 0 : Math.exp(logC + (df - 1) * Math.log(s) - df * s * s / 2);
    const sHi = Math.sqrt(chiSquareCriticalValue(1e-14, df) / df);
    const integrand = s => dens(s) * normalRangeCDF(q * s, k);
    return Math.min(1, gaussLegendreIntegral(integrand, 0, sHi, 5, 16));
}

const studentizedRangeCache = new Map();
function studentizedRangeCritical(alpha, k, df) {
    const key = alpha + '|' + k + '|' + df;
    if (!studentizedRangeCache.has(key)) studentizedRangeCache.set(key, studentizedRangeCriticalUncached(alpha, k, df));
    return studentizedRangeCache.get(key);
}

function studentizedRangeCriticalUncached(alpha, k, df) {
    // q such that P(Q > q) = alpha; Illinois (modified regula falsi) on the monotone CDF
    if (!(k >= 2) || !(df >= 1) || !(alpha > 0) || alpha >= 1) return NaN;
    const target = 1 - alpha;
    let lo = 0, hi = 4, fLo = -target, fHi = studentizedRangeCDF(hi, k, df) - target;
    for (let g = 0; fHi < 0 && g < 60; g++) { lo = hi; fLo = fHi; hi *= 2; fHi = studentizedRangeCDF(hi, k, df) - target; }
    let side = 0;
    for (let i = 0; i < 60; i++) {
        const q = (lo * fHi - hi * fLo) / (fHi - fLo);
        const fq = studentizedRangeCDF(q, k, df) - target;
        if (Math.abs(fq) < 1e-10 || hi - lo < 1e-10) return q;
        if (fq * fHi > 0) { hi = q; fHi = fq; if (side === -1) fLo /= 2; side = -1; }
        else { lo = q; fLo = fq; if (side === 1) fHi /= 2; side = 1; }
    }
    return (lo + hi) / 2;
}

// ---- Normality tests ---------------------------------------------------------------------------
// Shapiro-Wilk coefficients (positive half, a[0] pairs the smallest and largest observation): Royston (1992), AS R94
function shapiroWilkCoefficients(n) {
    const half = Math.floor(n / 2);
    if (n === 3) return [Math.SQRT1_2];
    const m = [];
    for (let i = 1; i <= n; i++) m.push(normInv((i - 0.375) / (n + 0.25)));
    const mm = 2 * m.slice(half + (n % 2)).reduce((s, v) => s + v * v, 0);   // sum of m_i^2 over all i (symmetric)
    const u = 1 / Math.sqrt(n);
    const poly = (c, x) => c.reduce((s, v, k) => s + v * Math.pow(x, k), 0);
    const cn = m[n - 1] / Math.sqrt(mm);
    const an = poly([cn, 0.221157, -0.147981, -2.07119, 4.434685, -2.706056], u);
    const a = new Array(half);
    a[0] = an;
    let phi;
    if (n > 5) {
        const an1 = poly([m[n - 2] / Math.sqrt(mm), 0.042981, -0.293762, -1.752461, 5.682633, -3.582633], u);
        a[1] = an1;
        phi = (mm - 2 * m[n - 1] * m[n - 1] - 2 * m[n - 2] * m[n - 2]) / (1 - 2 * an * an - 2 * an1 * an1);
        for (let i = 2; i < half; i++) a[i] = m[n - 1 - i] / Math.sqrt(phi);
    } else {
        phi = (mm - 2 * m[n - 1] * m[n - 1]) / (1 - 2 * an * an);
        for (let i = 1; i < half; i++) a[i] = m[n - 1 - i] / Math.sqrt(phi);
    }
    return a;
}

// Shapiro-Wilk p-value: Royston (1995) normalising transformation of W
function shapiroWilkPValue(W, n) {
    if (n === 3) {
        const p = 6 / Math.PI * (Math.asin(Math.sqrt(W)) - Math.asin(Math.sqrt(0.75)));
        return Math.min(1, Math.max(0, p));
    }
    let z;
    if (n <= 11) {
        const gamma = -2.273 + 0.459 * n;
        const arg = gamma - Math.log(1 - W);
        if (arg <= 0) return 0;
        const mu = 0.5440 - 0.39978 * n + 0.025054 * n * n - 0.0006714 * n * n * n;
        const sigma = Math.exp(1.3822 - 0.77857 * n + 0.062767 * n * n - 0.0020322 * n * n * n);
        z = (-Math.log(arg) - mu) / sigma;
    } else {
        const x = Math.log(n);
        const mu = -1.5861 - 0.31082 * x - 0.083751 * x * x + 0.0038915 * x * x * x;
        const sigma = Math.exp(-0.4803 - 0.082676 * x + 0.0030302 * x * x);
        z = (Math.log(1 - W) - mu) / sigma;
    }
    return 1 - normCDF(z);
}

// Kolmogorov distribution: P(sqrt(n) * D > x) with the Stephens (1970) small-sample correction
function kolmogorovPValue(D, n) {
    const x = D * (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n));
    if (x <= 0) return 1;
    if (x < 0.27) return 1;
    let sum = 0;
    for (let k = 1; k <= 100; k++) {
        const term = Math.exp(-2 * k * k * x * x);
        sum += (k % 2 ? 1 : -1) * term;
        if (term < 1e-16) break;
    }
    return Math.min(1, Math.max(0, 2 * sum));
}

function kolmogorovCritical(alpha, n) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 80; i++) {
        const mid = (lo + hi) / 2;
        if (kolmogorovPValue(mid, n) > alpha) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}

// ---- Lilliefors (K-S for normality with estimated mean and SD) ------------------------------------
// The null distribution of D does not depend on the true mean/SD, so it is simulated once per n with a fixed
// seed (deterministic results) and cached. This is Lilliefors' original method; precision is about +-0.004 in p.
function seededRandom(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function kolmogorovD(sortedValues, mean, sd) {
    const n = sortedValues.length;
    let d = 0;
    for (let i = 0; i < n; i++) {
        const F = normCDF((sortedValues[i] - mean) / sd);
        d = Math.max(d, (i + 1) / n - F, F - i / n);
    }
    return d;
}

const LILLIEFORS_CACHE_LIMIT = 8;                 // each entry holds a simulated null distribution; keep the most recent few
const _lillieforsCache = new Map();
function lillieforsNullDistribution(n) {
    if (_lillieforsCache.has(n)) {
        const hit = _lillieforsCache.get(n);
        _lillieforsCache.delete(n);                  // re-insert so the Map keeps least-recently-used first
        _lillieforsCache.set(n, hit);
        return hit;
    }
    const sims = n <= 100 ? 10000 : n <= 500 ? 4000 : 1500;
    const rand = seededRandom(12345 + n);
    const out = new Array(sims);
    const x = new Array(n);
    for (let s = 0; s < sims; s++) {
        let sum = 0;
        for (let i = 0; i < n; i += 2) {
            const r = Math.sqrt(-2 * Math.log(1 - rand())), t = 2 * Math.PI * rand();
            x[i] = r * Math.cos(t);
            if (i + 1 < n) x[i + 1] = r * Math.sin(t);
        }
        for (let i = 0; i < n; i++) sum += x[i];
        const mean = sum / n;
        let ss = 0;
        for (let i = 0; i < n; i++) ss += (x[i] - mean) * (x[i] - mean);
        const sorted = x.slice().sort((a, b) => a - b);
        out[s] = kolmogorovD(sorted, mean, Math.sqrt(ss / (n - 1)));
    }
    out.sort((a, b) => a - b);
    _lillieforsCache.set(n, out);
    if (_lillieforsCache.size > LILLIEFORS_CACHE_LIMIT) _lillieforsCache.delete(_lillieforsCache.keys().next().value);
    return out;
}

function lillieforsPValue(D, n) {
    const d = lillieforsNullDistribution(n);
    let lo = 0, hi = d.length;                       // first index with d[i] >= D
    while (lo < hi) { const mid = (lo + hi) >> 1; if (d[mid] < D) lo = mid + 1; else hi = mid; }
    return (d.length - lo + 1) / (d.length + 1);
}

function lillieforsCritical(alpha, n) {
    const d = lillieforsNullDistribution(n);
    return d[Math.min(d.length - 1, Math.floor((1 - alpha) * d.length))];
}

// ---- Generic matrix helpers (arrays of rows) ----
function multiplyMatrices(A, B) {
    let result = Array(A.length).fill().map(() => Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            for (let k = 0; k < A[0].length; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}

// Returns the inverse, or null when the matrix is singular (callers must handle null)
function inverseMatrix(matrix) {
    const n = matrix.length;
    let augmented = matrix.map((row, i) => [...row, ...Array(n).fill().map((_, j) => i === j ? 1 : 0)]);
    
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) maxRow = k;
        }
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        let pivot = augmented[i][i];
        if (!isFinite(pivot) || Math.abs(pivot) < 1e-12) return null;   // singular (or numerically singular)
        for (let j = 0; j < 2 * n; j++) augmented[i][j] /= pivot;
        
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) augmented[k][j] -= factor * augmented[i][j];
            }
        }
    }
    
    return augmented.map(row => row.slice(n));
}

// Eigenvalues (largest first) of a real SYMMETRIC matrix by the cyclic Jacobi method. It always converges and every
// eigenvalue is real, so this is the routine to use for covariance, SSCP and correlation matrices.
function symmetricEigenvalues(matrix) {
    const n = matrix.length;
    const A = matrix.map(r => r.slice());
    for (let sweep = 0; sweep < 100; sweep++) {
        let off = 0, scale = 0;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { scale += Math.abs(A[i][j]); if (i !== j) off += Math.abs(A[i][j]); }
        if (off <= 1e-14 * (scale || 1)) break;
        for (let p = 0; p < n - 1; p++) {
            for (let q = p + 1; q < n; q++) {
                if (A[p][q] === 0) continue;
                const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
                const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
                const c = 1 / Math.sqrt(t * t + 1), s = t * c;
                for (let k = 0; k < n; k++) {
                    const akp = A[k][p], akq = A[k][q];
                    A[k][p] = c * akp - s * akq;
                    A[k][q] = s * akp + c * akq;
                }
                for (let k = 0; k < n; k++) {
                    const apk = A[p][k], aqk = A[q][k];
                    A[p][k] = c * apk - s * aqk;
                    A[q][k] = s * apk + c * aqk;
                }
            }
        }
    }
    return A.map((r, i) => r[i]).sort((x, y) => y - x);
}

// Cholesky factor L (lower triangular, A = L L') of a symmetric positive-definite matrix, or null when A is not positive definite.
function choleskyLower(A) {
    const n = A.length;
    const L = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = A[i][j];
            for (let k = 0; k < j; k++) sum -= L[i][k] * L[j][k];
            if (i === j) {
                if (!(sum > 0)) return null;
                L[i][i] = Math.sqrt(sum);
            } else {
                L[i][j] = sum / L[j][j];
            }
        }
    }
    return L;
}

// Eigenvalues (largest first) of W^-1 B for a symmetric B and a symmetric positive-definite W, which is what MANOVA needs
// (B W^-1 has the same eigenvalues). Solved in the symmetric form L^-1 B L^-T with W = L L', so the result is always real.
// Returns null when W is not positive definite.
function generalizedSymmetricEigenvalues(B, W) {
    const L = choleskyLower(W);
    if (!L) return null;
    const n = B.length;
    // C = L^-1 B (forward substitution on each column), then S = C L^-T = (L^-1 C')'
    const solveLower = M => {
        const X = M.map(r => r.slice());
        for (let col = 0; col < n; col++) {
            for (let i = 0; i < n; i++) {
                let sum = X[i][col];
                for (let k = 0; k < i; k++) sum -= L[i][k] * X[k][col];
                X[i][col] = sum / L[i][i];
            }
        }
        return X;
    };
    const C = solveLower(B);
    const S = transposeMatrix(solveLower(transposeMatrix(C)));
    const sym = S.map((r, i) => r.map((v, j) => (v + S[j][i]) / 2));       // remove rounding asymmetry
    return symmetricEigenvalues(sym);
}

// Eigenvalues (largest first) of a general square matrix, valid ONLY when they are all real. Shifted QR iteration; if the
// iteration does not settle (complex eigenvalues) or a 2x2 matrix has a negative discriminant, every entry is NaN rather
// than a wrong real number. For symmetric matrices (covariance, SSCP) use symmetricEigenvalues; for MANOVA's B W^-1 use
// generalizedSymmetricEigenvalues.
function computeEigenvalues(matrix) {
    const n = matrix.length;
    if (n === 1) return [matrix[0][0]];
    if (n === 2) {
        const [[a, b], [c, d]] = matrix;
        const trace = a + d, rawDisc = trace * trace - 4 * (a * d - b * c);
        if (rawDisc < -1e-12 * Math.max(1, trace * trace)) return [NaN, NaN];       // complex pair
        const disc = Math.max(0, rawDisc);
        return [(trace + Math.sqrt(disc)) / 2, (trace - Math.sqrt(disc)) / 2];
    }
    if (matrix.every((r, i) => r.every((v, j) => v === matrix[j][i]))) return symmetricEigenvalues(matrix);
    // Shifted QR iteration (Gram-Schmidt QR)
    let A = matrix.map(r => r.slice());
    let converged = false;
    for (let iter = 0; iter < 1000; iter++) {
        const mu = A[n - 1][n - 1];
        const M = A.map((r, i) => r.map((v, j) => v - (i === j ? mu : 0)));
        const Q = Array.from({ length: n }, () => new Array(n).fill(0));
        const R = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let j = 0; j < n; j++) {
            const v = M.map(r => r[j]);
            for (let i = 0; i < j; i++) {
                R[i][j] = Q.reduce((s, r, k) => s + r[i] * M[k][j], 0);
                for (let k = 0; k < n; k++) v[k] -= R[i][j] * Q[k][i];
            }
            R[j][j] = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
            for (let k = 0; k < n; k++) Q[k][j] = R[j][j] > 1e-300 ? v[k] / R[j][j] : 0;
        }
        A = R.map((r, i) => r.map((_, j) => r.reduce((s, _x, k) => s + R[i][k] * Q[k][j], 0) + (i === j ? mu : 0)));
        let off = 0;
        for (let i = 1; i < n; i++) for (let j = 0; j < i; j++) off += Math.abs(A[i][j]);
        if (off < 1e-12) { converged = true; break; }
    }
    if (!converged) return new Array(n).fill(NaN);
    return A.map((r, i) => r[i]).sort((x, y) => y - x);
}

function transposeMatrix(A) {
    return A[0].map((_, j) => A.map(row => row[j]));
}

// R² of the ordinary-least-squares regression of y on the columns in `predictors` (with an intercept).
// Returns 1 when the predictors are perfectly collinear with y or with each other (singular X'X).
function olsRSquared(y, predictors) {
    const n = y.length;
    const X = y.map((_, i) => [1, ...predictors.map(col => col[i])]);
    const Xt = transposeMatrix(X);
    const XtXinv = inverseMatrix(multiplyMatrices(Xt, X));
    if (!XtXinv) return 1;
    const beta = multiplyMatrices(XtXinv, multiplyMatrices(Xt, y.map(v => [v]))).map(r => r[0]);
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
        const fit = X[i].reduce((s, v, k) => s + v * beta[k], 0);
        ssRes += (y[i] - fit) * (y[i] - fit);
        ssTot += (y[i] - yMean) * (y[i] - yMean);
    }
    return ssTot === 0 ? 0 : Math.min(1, Math.max(0, 1 - ssRes / ssTot));
}

// ---- Exact null distributions of the rank tests (small samples without ties) ----
// Mann-Whitney: counts[u] = number of the C(m+n, m) equally likely arrangements with U = u, by the recursion
// c(u; m, n) = c(u - n; m - 1, n) + c(u; m, n - 1). Exact integers while C(m+n, m) < 2^53 (m, n up to about 25).
function mannWhitneyUCounts(m, n) {
    const size = m * n + 1;
    // table[i][j] = counts for sample sizes (i, j)
    const table = Array.from({ length: m + 1 }, () => new Array(n + 1));
    for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
            const c = new Array(i * j + 1).fill(0);
            if (i === 0 || j === 0) { c[0] = 1; }
            else {
                const a = table[i - 1][j], b = table[i][j - 1];            // a: the largest value is from the first sample; b: from the second
                for (let u = 0; u <= i * j; u++) c[u] = (u - j >= 0 && u - j < a.length ? a[u - j] : 0) + (u < b.length ? b[u] : 0);
            }
            table[i][j] = c;
        }
    }
    return table[m][n].slice(0, size);
}

// Wilcoxon signed-rank: counts[w] = number of the 2^n sign patterns with W+ = w (subsets of {1, ..., n} with sum w).
function signedRankCounts(n) {
    const max = n * (n + 1) / 2, counts = new Array(max + 1).fill(0);
    counts[0] = 1;
    for (let rank = 1; rank <= n; rank++) for (let w = max; w >= rank; w--) counts[w] += counts[w - rank];
    return counts;
}

// P(S <= k) and P(S >= k) from a table of counts (k is rounded to the nearest integer: the statistics are integers when there are no ties)
function exactTailProbabilities(counts, k) {
    const total = counts.reduce((a, b) => a + b, 0), kk = Math.round(k);
    let lower = 0, upper = 0;
    counts.forEach((c, v) => { if (v <= kk) lower += c; if (v >= kk) upper += c; });
    return { lower: lower / total, upper: upper / total };
}

// ---- Shape statistics ----
// The adjusted Fisher-Pearson skewness (G1) and the bias-corrected excess kurtosis (G2): the estimators the Skewness and
// Kurtosis tools use (the same as Excel's SKEW / KURT and R's e1071 type 2). Every tool that shows a skewness or kurtosis
// number calls these, so the same data can never give two different answers. null when it is undefined
// (n < 3 for skewness, n < 4 for kurtosis, or no spread).
function sampleSkewness(values) {
    const n = values.length;
    if (n < 3) return null;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const s = Math.sqrt(values.reduce((a, v) => a + (v - mean) * (v - mean), 0) / (n - 1));
    if (!(s > 0)) return null;
    return (n / ((n - 1) * (n - 2))) * values.reduce((a, v) => a + Math.pow((v - mean) / s, 3), 0);
}
function sampleExcessKurtosis(values) {
    const n = values.length;
    if (n < 4) return null;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const s = Math.sqrt(values.reduce((a, v) => a + (v - mean) * (v - mean), 0) / (n - 1));
    if (!(s > 0)) return null;
    const fourth = values.reduce((a, v) => a + Math.pow((v - mean) / s, 4), 0);
    return (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * fourth - (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
}

// ---- Quantiles ----
// Type 7 (the default in R, NumPy and SciPy): h = (n - 1)p, interpolate linearly between the neighbouring order statistics.
// `sorted` must be ascending and non-empty; p is a fraction in [0, 1].
function quantileType7(sorted, p) {
    const h = (sorted.length - 1) * p;
    const lo = Math.floor(h), hi = Math.ceil(h);
    return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
}

// ---- Exact small-sample distributions (used instead of a normal / chi-square approximation) ----
// log of the binomial coefficient C(n, k)
function logChoose(n, k) {
    return k < 0 || k > n ? -Infinity : logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

// Exact null distribution of the number of runs R in a random arrangement of n1 symbols of one kind and n2 of the other:
// P(R = 2k) = 2·C(n1-1,k-1)·C(n2-1,k-1) / C(n,n1);  P(R = 2k+1) = [C(n1-1,k)·C(n2-1,k-1) + C(n1-1,k-1)·C(n2-1,k)] / C(n,n1).
// Returns an array pmf where pmf[r] = P(R = r).
function runsExactPMF(n1, n2) {
    const n = n1 + n2, total = logChoose(n, n1), pmf = new Array(n + 2).fill(0);
    for (let r = 2; r <= Math.min(n, 2 * Math.min(n1, n2) + 1); r++) {
        const k = Math.floor(r / 2);
        pmf[r] = r % 2 === 0
            ? 2 * Math.exp(logChoose(n1 - 1, k - 1) + logChoose(n2 - 1, k - 1) - total)
            : Math.exp(logChoose(n1 - 1, k) + logChoose(n2 - 1, k - 1) - total) + Math.exp(logChoose(n1 - 1, k - 1) + logChoose(n2 - 1, k) - total);
    }
    return pmf;
}

// Two-sided exact p-value of the runs test: twice the smaller tail, capped at 1
function runsExactPValue(runs, n1, n2) {
    const pmf = runsExactPMF(n1, n2);
    let lower = 0, upper = 0;
    pmf.forEach((p, r) => { if (r <= runs) lower += p; if (r >= runs) upper += p; });
    return Math.min(1, 2 * Math.min(lower, upper));
}

// Fisher's exact test for [[a, b], [c, d]], two-sided: the total probability of every table (same margins) that is no more likely than the observed one.
function fisherExact2x2(a, b, c, d) {
    const r1 = a + b, r2 = c + d, c1 = a + c, n = r1 + r2;
    const logP = x => logChoose(r1, x) + logChoose(r2, c1 - x) - logChoose(n, c1);
    const lo = Math.max(0, c1 - r2), hi = Math.min(r1, c1), obs = logP(a);
    let p = 0;
    for (let x = lo; x <= hi; x++) { const lp = logP(x); if (lp <= obs + 1e-9) p += Math.exp(lp); }
    return Math.min(1, p);
}

// Exact McNemar p-value: the discordant pairs b and c are Binomial(b + c, 1/2) under H0; two-sided = twice the smaller tail
function mcNemarExactPValue(b, c) {
    const m = b + c;
    if (m === 0) return 1;
    let tail = 0;
    for (let k = 0, top = Math.min(b, c); k <= top; k++) tail += Math.exp(logChoose(m, k) - m * Math.LN2);
    return Math.min(1, 2 * tail);
}
