/* Helpers shared by several tools (statistics building blocks, clear-button wiring, input parsing) */

// Robust numeric parser: values may be separated by commas, semicolons, spaces, tabs or new lines.
    // Accepts negatives (also the typographic minus), decimals and scientific notation. A token that is not
    // a complete number ("12abc", "1.2.3") is skipped instead of being silently read as 12 or 1.2.
const NUMBER_TOKEN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

function parseNumbersFromInput(rawText) {
        const parts = String(rawText).replace(/\u2212/g, '-').split(/[,;\s]+/);
        const numbers = [];
        for (const part of parts) {
            if (!NUMBER_TOKEN.test(part)) continue;
            const num = Number(part);
            if (isFinite(num)) numbers.push(num);
        }
        return numbers;
    }

// Wires a Clear button: empties every listed field (textarea or input; `inputIds` is one id or an array of ids)
// and hides the result area.
function attachClearHandler(clearBtnId, inputIds, resultAreaId) {
    const clearBtn = document.getElementById(clearBtnId);
    if (!clearBtn) return;
    const ids = Array.isArray(inputIds) ? inputIds : [inputIds];
    clearBtn.addEventListener('click', () => {
        ids.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });
        const resultDiv = document.getElementById(resultAreaId);
        if (resultDiv) resultDiv.style.display = 'none';
    });
}

// Checks the parameters of a named distribution before a moment/entropy/MGF tool divides by them.
// Returns a message for the first invalid parameter, or null. opts.openProbability: p must lie strictly inside (0, 1),
// for statistics that are undefined for a degenerate binomial (skewness, kurtosis, entropy).
function validateDistributionParams(dist, params, opts) {
    const o = opts || {};
    const bad = (name, cond) => cond ? null : `Invalid ${name}.`;
    const ok = v => typeof v === 'number' && isFinite(v);
    const checks = {
        normal: () => (params.mean !== undefined && !ok(params.mean) ? 'The mean must be a number.' : null) || (ok(params.stdDev) && params.stdDev > 0 ? null : 'The standard deviation σ must be a number greater than 0.'),
        exponential: () => ok(params.rate) && params.rate > 0 ? null : 'The rate λ must be a number greater than 0.',
        uniform: () => ok(params.min) && ok(params.max) && params.min < params.max ? null : 'Uniform needs numbers with minimum a < maximum b.',
        beta: () => ok(params.alpha) && ok(params.beta) && params.alpha > 0 && params.beta > 0 ? null : 'Beta needs α > 0 and β > 0.',
        weibull: () => ok(params.shape) && ok(params.scale) && params.shape > 0 && params.scale > 0 ? null : 'The Weibull distribution needs a shape k > 0 and a scale λ > 0.',
        poisson: () => ok(params.lambda) && params.lambda > 0 ? null : 'The Poisson mean λ must be a number greater than 0.',
        binomial: () => {
            if (!ok(params.n) || params.n < 1 || Math.floor(params.n) !== params.n) return 'The number of trials n must be a whole number of at least 1.';
            if (!ok(params.p) || params.p < 0 || params.p > 1) return 'The probability p must be a number between 0 and 1.';
            if (o.openProbability && (params.p === 0 || params.p === 1)) return 'p must be strictly between 0 and 1 (for p = 0 or 1 the distribution is a single point and this statistic is undefined).';
            return null;
        }
    };
    return checks[dist] ? checks[dist]() : null;
}

// A number for display in a worked step: floating-point noise (7.100000000000001, 3.0000000000000004) is rounded away at
// 10 decimals, whole numbers print without a decimal point, and nothing else changes.
function tidyNumber(v) {
    if (!isFinite(v)) return String(v);
    return Number.isInteger(v) ? String(v) : String(+v.toFixed(10));
}

// Guard for every procedure that divides by the pooled within-group variance (ANOVA, Tukey, Scheffe, Bonferroni, Levene):
// returns an error result when the within-group degrees of freedom are below 1 (every group has a single value) or the
// within-group sum of squares is 0 (no variation inside any group, so F and the t / q statistics are infinite), else null.
function withinGroupError(dfWithin, ssWithin, testName, quantity) {
    const q = quantity || 'values';
    if (!(dfWithin >= 1)) {
        return { error: true, message: `${testName} needs at least one group with two or more observations: with every group holding a single value there are no within-group degrees of freedom (N - k = ${dfWithin}), so the pooled variance cannot be estimated.` };
    }
    if (!(ssWithin > 0) || !isFinite(ssWithin)) {
        return { error: true, message: `The ${q} do not vary inside any group (within-group sum of squares = 0), so the test statistic would be infinite and ${testName} is undefined. Add variation within the groups.` };
    }
    return null;
}

// Shows a validation message in the standard result area of a tool whose element ids start with `prefix`
function showToolError(prefix, message) {
    const area = document.getElementById(prefix + 'ResultArea');
    const value = document.getElementById(prefix + 'ValueDisplay');
    const steps = document.getElementById(prefix + 'StepsDisplay');
    if (area) area.style.display = 'block';
    if (value) value.textContent = 'Error';
    if (steps) setHtml(steps, '⚠️ ' + escapeHtml(message));
}

// Parses "value:group" input for the group-comparison tests (Levene, Bartlett, Bonferroni, Scheffe, Tukey).
// Entries are separated by commas, semicolons or line breaks, and by spaces when a space is followed by another "number:";
// so "2.5:Group A, 3.1:Group B" and "2.5:A 3.1:A 4:B" both work and a group name may contain spaces.
// Returns { groups: Map(name -> numbers), skipped: [text that could not be read] }; group names are HTML-escaped.
function parseValueGroupInput(inputText) {
    const groups = new Map(), skipped = [];
    const entry = /([-+−]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*:\s*([^,;\n]*?)(?=\s+[-+−]?\d*\.?\d+(?:[eE][-+]?\d+)?\s*:|[,;\n]|$)/g;
    const text = String(inputText || '');
    let last = 0, m;
    const leftover = piece => piece.split(/[,;\n]+/).map(t => t.trim()).filter(Boolean).forEach(t => skipped.push(t));
    while ((m = entry.exec(text)) !== null) {
        leftover(text.slice(last, m.index));
        last = entry.lastIndex;
        const value = parseFloat(m[1].replace('−', '-')), name = m[2].trim();
        if (!isFinite(value) || !name) { skipped.push(m[0].trim()); continue; }
        const key = escapeHtml(name);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(value);
    }
    leftover(text.slice(last));
    return { groups, skipped };
}


// Enhanced visualization function
// Enhanced visualization function
function visualizeData(numbers, statType) {
    if (!numbers || numbers.length === 0) {
        notifyUser('Please enter numeric data first.');
        return false;
    }
    
    // Clear previous analysis
    const oldAnalysis = document.getElementById('distributionAnalysis');
    if (oldAnalysis) {
        oldAnalysis.remove();
    }
    
    const chartArea = document.getElementById('chartDisplayArea');
    const chartTitleSpan = document.getElementById('chartTitle');
    
    // Determine best visualization based on stat type
    if (statType === 'mean' || statType === 'median' || statType === 'mode' || statType === 'variance' || statType === 'stddev') {
        createHistogram(numbers, `Distribution of Data - ${statType.toUpperCase()}`);
        chartTitleSpan.textContent = `📊 Histogram - ${statType.toUpperCase()} Analysis`;
    } else if (statType === 'iqr' || statType === 'range') {
        createBoxPlot(numbers, `Spread Analysis - ${statType.toUpperCase()}`);
        chartTitleSpan.textContent = `📦 Box Plot - ${statType.toUpperCase()} Analysis`;
    } else {
        createHistogram(numbers, `Data Distribution - ${statType.toUpperCase()}`);
        chartTitleSpan.textContent = `📊 Data Visualization - ${statType.toUpperCase()}`;
    }
    
    chartArea.classList.add('show');
    return true;
}

// ========== PROBABILITY DISTRIBUTIONS COMPUTATION FUNCTIONS ==========

// Normal Distribution Functions
function normalPDF(x, mean = 0, std = 1) {
    const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
    return coefficient * Math.exp(exponent);
}

function normalCDF(x, mean = 0, std = 1) {
    return normCDF((x - mean) / std);
}

// Beta Distribution Functions
// Beta density, evaluated in log space: for large shapes (Beta(1000, 1000)) B(α, β) and x^(α-1) underflow to 0 as plain numbers,
// which turned the density into NaN / Infinity. At x = 0 or 1 the density is +Infinity for a shape below 1, 1/B for a shape of 1, 0 above 1.
function betaPDF(x, alpha = 2, beta = 5) {
    if (x < 0 || x > 1) return 0;
    const logB = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
    if (x === 0) return alpha < 1 ? Infinity : (alpha === 1 ? Math.exp(-logB) : 0);
    if (x === 1) return beta < 1 ? Infinity : (beta === 1 ? Math.exp(-logB) : 0);
    return Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log1p(-x) - logB);
}

function combination(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    if (k > 1000) return Math.exp(logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1));   // avoids a long loop / overflow
    let result = 1;
    for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
    return result;
}

// P(X = k) for X ~ Binomial(n, p). C(n, k) overflows a double from about n = 1030, so large n is evaluated in log space
// (a product of Infinity and a tiny power would be NaN); for n up to 1000 the direct product keeps full precision.
function binomialPMF(n, k, p) {
    if (k < 0 || k > n || !Number.isInteger(k)) return 0;
    if (p <= 0) return k === 0 ? 1 : 0;
    if (p >= 1) return k === n ? 1 : 0;
    if (n <= 1000) return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return Math.exp(logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log1p(-p));
}

// Simple linear regression y = b0 + b1·x: the formulas shared by the simple-linear, standard-error, t-statistic and F-test tools.
// Returns null when x does not vary (Σ(x - x̄)² = 0), where the slope is undefined.
// One rule for a perfect fit, shared by every regression tool: a residual sum of squares at rounding level relative to the
// total sum of squares. Descriptive tools (simple regression, model summary) still report R² = 1; the inference tools
// (standard errors, t statistics, overall F) stop with PERFECT_FIT_MESSAGE because their divisors are zero.
const PERFECT_FIT_REL_TOL = 1e-12;
function isPerfectFit(ssRes, ssTot) {
    return ssRes <= PERFECT_FIT_REL_TOL * ssTot;
}
const PERFECT_FIT_MESSAGE = "The line fits the data perfectly (residual sum of squares ≈ 0), so the standard errors are 0 and the t and F statistics are infinite. Inference needs some scatter around the line.";

function simpleRegressionCore(x, y) {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n, meanY = y.reduce((a, b) => a + b, 0) / n;
    let sxx = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
        sxx += (x[i] - meanX) * (x[i] - meanX);
        sxy += (x[i] - meanX) * (y[i] - meanY);
    }
    if (!(sxx > 0)) return null;
    const slope = sxy / sxx, intercept = meanY - slope * meanX;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
        const residual = y[i] - (intercept + slope * x[i]);
        ssRes += residual * residual;
        ssTot += (y[i] - meanY) * (y[i] - meanY);
    }
    const mse = n > 2 ? ssRes / (n - 2) : NaN;
    return { n, meanX, meanY, sxx, sxy, slope, intercept, ssRes, ssTot, mse,
             seSlope: Math.sqrt(mse / sxx), seIntercept: Math.sqrt(mse * (1 / n + meanX * meanX / sxx)) };
}

// Critical value as text for the t and z tests, stating the rejection rule so a negative lower-tail value reads naturally:
// two-sided "±1.96 (reject if |t| > 1.96)", greater "1.96 (reject if t > 1.96)", less "−1.96 (reject if t < −1.96)"
function criticalValueText(criticalValue, alternative, statName) {
    const st = statName || 't', c = Math.abs(criticalValue).toFixed(6);
    if (alternative === 'two.sided') return `±${c} (reject H₀ if |${st}| > ${c})`;
    if (alternative === 'less') return `−${c} (reject H₀ if ${st} < −${c})`;
    return `${c} (reject H₀ if ${st} > ${c})`;
}

// k! as text for worked solutions: exact while it fits in a double (k <= 170), otherwise a power of ten
function formatFactorial(k) {
    if (k <= 170) return String(factorial(k));
    return `≈ 10^${(logGamma(k + 1) / Math.LN10).toFixed(2)} (too large for a double)`;
}

// C(n, k) as text for worked solutions: the exact value when it fits in a double, otherwise a power of ten
function formatCombination(n, k) {
    const c = combination(n, k);
    if (isFinite(c)) return String(c);
    const log10 = (logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1)) / Math.LN10;
    return `≈ 10^${log10.toFixed(2)} (too large for a double; probabilities are computed in log space)`;
}

// Expand/collapse a metric explanation in the model summary (called from the onclick of each metric header)
function toggleMetric(element) {
    const formulaDiv = element.nextElementSibling;
    if (formulaDiv) formulaDiv.style.display = formulaDiv.style.display === 'block' ? 'none' : 'block';
}

// ========== HELPER FUNCTIONS (Place these BEFORE computeVIF) ==========
function calculateCorrelation(x, y) {
    if (!x.length || !y.length || x.length !== y.length) return 0;
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let xySum = 0, xxSum = 0, yySum = 0;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        xySum += dx * dy;
        xxSum += dx * dx;
        yySum += dy * dy;
    }
    if (xxSum === 0 || yySum === 0) return NaN;   // undefined for a constant variable (callers report an error)
    return xySum / Math.sqrt(xxSum * yySum);
}

function calculateCorrelationArray(y, x) {
    return calculateCorrelation(y, x);
}

// One-line worked example of a Type 7 quantile (see quantileType7 in numerics.js), for step-by-step solutions.
// `sorted` is ascending, p is a fraction in [0, 1], `label` names the quantile ("Q₁", "P90", ...).
function describeQuantileType7(sorted, p, label) {
    const h = (sorted.length - 1) * p;
    const lo = Math.floor(h), hi = Math.ceil(h);
    const value = quantileType7(sorted, p);
    const position = `h = (n - 1) × p = ${sorted.length - 1} × ${+p.toFixed(6)} = ${+h.toFixed(6)} (0-based position)`;
    if (lo === hi) return `${position} → ${label} = x[${lo}] = ${sorted[lo]}`;
    return `${position} → ${label} = x[${lo}] + ${+(h - lo).toFixed(6)} × (x[${hi}] - x[${lo}]) = ${sorted[lo]} + ${+(h - lo).toFixed(6)} × (${sorted[hi]} - ${sorted[lo]}) = ${+value.toFixed(10)}`;
}

// Result colours chosen at run time (green / red / amber / teal) are bright enough for a bar or a background but fail the 4.5:1 contrast
// minimum as TEXT on a light card. Use textSafeColor(c) wherever the colour is applied to text; other colours pass through unchanged.
const TEXT_SAFE_COLORS = { '#28a745': '#155724', '#dc3545': '#b02a37', '#ffc107': '#8a6500', '#17a2b8': '#0b6b7c', '#e74c3c': '#b02a37', '#f39c12': '#8a5a00', '#27ae60': '#155724', '#6c757d': '#5a6268', '#10b981': '#047857', '#ef4444': '#b91c1c' };
function textSafeColor(color) {
    return TEXT_SAFE_COLORS[String(color).toLowerCase()] || color;
}
