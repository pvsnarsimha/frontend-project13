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

function attachClearHandler(clearBtnId, textareaId, resultAreaId) {
        const clearBtn = document.getElementById(clearBtnId);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const textarea = document.getElementById(textareaId);
                if (textarea) textarea.value = '';
                const resultDiv = document.getElementById(resultAreaId);
                if (resultDiv) resultDiv.style.display = 'none';
            });
        }
    }

// Function to generate detailed distribution analysis
// Function to generate detailed distribution analysis
function generateDistributionAnalysis(numbers) {
    if (!numbers || numbers.length === 0) return "No data available for analysis.";
    
    const n = numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    
    // Calculate mean
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Calculate median
    let median;
    if (n % 2 === 0) {
        median = (sorted[n/2 - 1] + sorted[n/2]) / 2;
    } else {
        median = sorted[Math.floor(n/2)];
    }
    
    // Calculate mode
    const freqMap = new Map();
    numbers.forEach(num => freqMap.set(num, (freqMap.get(num) || 0) + 1));
    let maxFreq = 0;
    let modes = [];
    for (let [num, freq] of freqMap) {
        if (freq > maxFreq) {
            maxFreq = freq;
            modes = [num];
        } else if (freq === maxFreq) {
            modes.push(num);
        }
    }
    const modeText = maxFreq === 1 ? "No mode (all values unique)" : modes.join(", ") + ` (appears ${maxFreq} time${maxFreq > 1 ? 's' : ''})`;
    
    // Calculate variance and standard deviation
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Calculate Coefficient of Variation (CV)
    const cv = stdDev / mean;
    
    // Calculate quartiles
    const getQ = (arr, percentile) => {
        const pos = (arr.length - 1) * percentile;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (rest === 0) return arr[base];
        return arr[base] + rest * (arr[base + 1] - arr[base]);
    };
    const q1 = getQ(sorted, 0.25);
    const q3 = getQ(sorted, 0.75);
    const iqr = q3 - q1;
    
    // Determine skewness
    const skewness = (mean - median) / stdDev;
    let skewType = "";
    if (Math.abs(skewness) < 0.1) skewType = "Approximately symmetric";
    else if (skewness > 0) skewType = "Right-skewed (positive skew)";
    else skewType = "Left-skewed (negative skew)";
    
    // Determine kurtosis approximation
    const fourthMoment = numbers.reduce((a, b) => a + Math.pow(b - mean, 4), 0) / n;
    const kurtosis = fourthMoment / Math.pow(variance, 2) - 3;
    let kurtosisType = "";
    if (Math.abs(kurtosis) < 0.5) kurtosisType = "Mesokurtic (normal-like peak)";
    else if (kurtosis > 0) kurtosisType = "Leptokurtic (heavy tails, sharp peak)";
    else kurtosisType = "Platykurtic (light tails, flat peak)";
    
    // Outlier detection (using IQR method)
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = numbers.filter(x => x < lowerBound || x > upperBound);
    
    // Generate analysis text
    let analysis = `📊 DETAILED DISTRIBUTION ANALYSIS\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    analysis += `📌 BASIC STATISTICS:\n`;
    analysis += `• Sample size (n): ${n}\n`;
    analysis += `• Minimum value: ${min.toFixed(4)}\n`;
    analysis += `• Maximum value: ${max.toFixed(4)}\n`;
    analysis += `• Range: ${range.toFixed(4)}\n\n`;
    
    analysis += `📌 CENTRAL TENDENCY:\n`;
    analysis += `• Mean (average): ${mean.toFixed(4)}\n`;
    analysis += `• Median (middle): ${median.toFixed(4)}\n`;
    analysis += `• Mode (most frequent): ${modeText}\n`;
    analysis += `• Mean vs Median difference: ${Math.abs(mean - median).toFixed(4)}\n\n`;
    
    analysis += `📌 DISPERSION (SPREAD):\n`;
    analysis += `• Variance: ${variance.toFixed(4)}\n`;
    analysis += `• Standard Deviation: ${stdDev.toFixed(4)}\n`;
    analysis += `• Coefficient of Variation (CV): ${(cv * 100).toFixed(2)}%\n`;
    analysis += `• Q1 (25th percentile): ${q1.toFixed(4)}\n`;
    analysis += `• Q3 (75th percentile): ${q3.toFixed(4)}\n`;
    analysis += `• Interquartile Range (IQR): ${iqr.toFixed(4)}\n\n`;
    
    analysis += `📌 DISTRIBUTION SHAPE:\n`;
    analysis += `• Skewness: ${skewness.toFixed(4)} → ${skewType}\n`;
    analysis += `  `;
    if (skewness > 0.1) analysis += `Mean > Median, tail extends to the right.\n`;
    else if (skewness < -0.1) analysis += `Mean < Median, tail extends to the left.\n`;
    else analysis += `Mean ≈ Median, roughly bell-shaped.\n`;
    
    analysis += `• Kurtosis: ${kurtosis.toFixed(4)} → ${kurtosisType}\n`;
    analysis += `  `;
    if (kurtosis > 0.5) analysis += `Distribution has heavier tails and sharper peak than normal.\n`;
    else if (kurtosis < -0.5) analysis += `Distribution has lighter tails and flatter peak than normal.\n`;
    else analysis += `Distribution similar to normal curve.\n\n`;
    
    analysis += `📌 OUTLIER DETECTION (IQR Method):\n`;
    analysis += `• Lower bound (Q1 - 1.5×IQR): ${lowerBound.toFixed(4)}\n`;
    analysis += `• Upper bound (Q3 + 1.5×IQR): ${upperBound.toFixed(4)}\n`;
    if (outliers.length === 0) {
        analysis += `• ✅ No outliers detected in the dataset.\n`;
    } else {
        analysis += `• ⚠️ Outliers found (${outliers.length} value${outliers.length > 1 ? 's' : ''}): ${outliers.map(x => x.toFixed(4)).join(", ")}\n`;
        analysis += `  These values fall outside the typical range and may affect statistical measures.\n`;
    }
    analysis += `\n`;
    
    analysis += `📌 INTERPRETATION:\n`;
    if (Math.abs(mean - median) < 0.1 * stdDev) {
        analysis += `• The data appears roughly symmetric. The mean and median are close,\n`;
        analysis += `  suggesting the average is representative of typical values.\n`;
    } else if (mean > median) {
        analysis += `• The data is right-skewed (positively skewed). This means there are\n`;
        analysis += `  some relatively high values pulling the mean above the median.\n`;
        analysis += `  Consider using median for central tendency.\n`;
    } else {
        analysis += `• The data is left-skewed (negatively skewed). This means there are\n`;
        analysis += `  some relatively low values pulling the mean below the median.\n`;
        analysis += `  Consider using median for central tendency.\n`;
    }
    
    if (outliers.length > 0) {
        analysis += `\n• Outliers detected! These extreme values may significantly impact\n`;
        analysis += `  the mean and standard deviation. Consider investigating these\n`;
        analysis += `  values or using robust statistics (median, IQR).\n`;
    }
    
    if (cv > 0.3) {
        analysis += `\n• High relative variability (CV > 30%). The data shows substantial\n`;
        analysis += `  spread relative to the mean.\n`;
    } else if (cv < 0.1) {
        analysis += `\n• Low relative variability (CV < 10%). The data is tightly clustered\n`;
        analysis += `  around the mean.\n`;
    } else {
        analysis += `\n• Moderate relative variability (CV between 10-30%). The data has\n`;
        analysis += `  reasonable spread around the mean.\n`;
    }
    
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    return analysis;
}

// Enhanced visualization function
// Enhanced visualization function
function visualizeData(numbers, statType) {
    if (!numbers || numbers.length === 0) {
        alert('Please enter numeric data first!');
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
function betaPDF(x, alpha = 2, beta = 5) {
    if (x < 0 || x > 1) return 0;
    // Beta function approximation
    const B = Math.exp(logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta));
    return Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1) / B;
}

function combination(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    if (k > 1000) return Math.exp(logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1));   // avoids a long loop / overflow
    let result = 1;
    for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
    return result;
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
    if (xxSum === 0 || yySum === 0) return 0;
    return xySum / Math.sqrt(xxSum * yySum);
}

function calculateCorrelationArray(y, x) {
    return calculateCorrelation(y, x);
}
