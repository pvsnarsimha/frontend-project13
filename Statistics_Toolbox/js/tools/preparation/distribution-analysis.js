/* DistributionAnalysis: the plain-language "Visualize Data" summary shown under the Histogram and Box Plot charts.
   Cross-file dependencies (all plain global functions, resolved when generateDistributionAnalysis is called, so the load order
   only has to put every one of these files before the first click):
     quantileType7           js/core/numerics.js
     computeModeWithSteps    js/tools/descriptive/mode.js
   Callers: histogram.js and boxplot-chart.js. If either dependency is renamed, tests/structure.test.js fails. */

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
    const median = quantileType7(sorted, 0.5);       // the app's one quantile definition (core/numerics.js)
    
    // Mode: the Mode tool's own rule and wording (one definition)
    const modeText = computeModeWithSteps(numbers).display;
    
    // Calculate variance and standard deviation
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Calculate Coefficient of Variation (CV)
    const cv = stdDev / mean;
    
    // Calculate quartiles
    const q1 = quantileType7(sorted, 0.25);
    const q3 = quantileType7(sorted, 0.75);
    const iqr = q3 - q1;
    
    // Determine skewness
    const skewness = stdDev > 0 ? (mean - median) / stdDev : 0;   // constant data has no spread, so no skew
    let skewType = "";
    if (Math.abs(skewness) < 0.1) skewType = "Approximately symmetric";
    else if (skewness > 0) skewType = "Right-skewed (positive skew)";
    else skewType = "Left-skewed (negative skew)";
    
    // Determine kurtosis approximation
    const fourthMoment = numbers.reduce((a, b) => a + Math.pow(b - mean, 4), 0) / n;
    const kurtosis = variance > 0 ? fourthMoment / Math.pow(variance, 2) - 3 : 0;   // constant data: no spread, no tails
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
    analysis += `• Population variance (÷ n): ${variance.toFixed(4)}\n`;
    analysis += `• Population standard deviation: ${stdDev.toFixed(4)}\n`;
    analysis += `• Coefficient of Variation (population σ / mean): ${Number.isFinite(cv) ? (cv * 100).toFixed(2) + '%' : 'undefined (mean is 0)'}\n`;
    analysis += `• Q1 (25th percentile): ${q1.toFixed(4)}\n`;
    analysis += `• Q3 (75th percentile): ${q3.toFixed(4)}\n`;
    analysis += `• Interquartile Range (IQR): ${iqr.toFixed(4)}\n\n`;
    
    analysis += `📌 DISTRIBUTION SHAPE:\n`;
    analysis += `• Pearson's median skewness (mean − median) / σ: ${skewness.toFixed(4)} → ${skewType}\n`;
    analysis += `  `;
    if (skewness > 0.1) analysis += `Mean > Median, tail extends to the right.\n`;
    else if (skewness < -0.1) analysis += `Mean < Median, tail extends to the left.\n`;
    else analysis += `Mean ≈ Median, roughly bell-shaped.\n`;
    
    analysis += `• Excess kurtosis (population): ${kurtosis.toFixed(4)} → ${kurtosisType}\n`;
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
