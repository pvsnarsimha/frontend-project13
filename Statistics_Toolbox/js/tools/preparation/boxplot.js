/* Boxplot: boxplot tool (interface, calculation, setup); chart drawing is in boxplot-chart.js, the worked solution in boxplot-steps.js */

function renderBoxplotInterface() {
    return buildInterface({
        title: "📦 Boxplot with Outlier Detection",
        formula: "📌 IQR = Q₃ - Q₁ | Outliers: x < Q₁ - 1.5×IQR or x > Q₃ + 1.5×IQR",
        desc: "Displays the five-number summary (Min, Q1, Median, Q3, Max) and highlights outliers using the IQR rule.",
        inputs: [
            {
                label: "📋 Enter numeric values:",
                textarea: { id: "boxplotInput", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33, 100, 5" }
            }
        ],
        run: { id: "boxplotComputeBtn", text: "📦 Generate Boxplot + Chart" },
        clear: { id: "boxplotClearBtn", text: "Clear" },
        result: {
            area: "boxplotResultArea",
            label: "🎯 BOXPLOT",
            value: "boxplotValueDisplay",
            steps: "boxplotStepsDisplay"
        }
    });
}


function computeBoxplotWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    const minVal = sorted[0];
    const maxVal = sorted[n - 1];
    const sum = numbers.reduce((a,b) => a+b, 0);
    const mean = sum / n;
    
    // Type 7 quantiles (linear interpolation at (n - 1)p)
    const getMedian = (arr) => {
        const m = arr.length;
        if (m % 2 === 0) {
            const left = arr[m/2 - 1];
            const right = arr[m/2];
            return { value: (left + right) / 2, left, right, formula: `(${left} + ${right}) / 2 = ${(left + right) / 2}` };
        } else {
            const median = arr[Math.floor(m/2)];
            return { value: median, left: median, right: median, formula: `${median}` };
        }
    };
    
    const q1 = quantileType7(sorted, 0.25);
    const q3 = quantileType7(sorted, 0.75);
    
    const medianResult = getMedian(sorted);
    const median = medianResult.value;
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Identify outliers
    const outliers = numbers.filter(x => x < lowerBound || x > upperBound).sort((a,b) => a-b);
    const nonOutliers = numbers.filter(x => x >= lowerBound && x <= upperBound);
    const whiskerMin = nonOutliers.length > 0 ? Math.min(...nonOutliers) : q1;
    const whiskerMax = nonOutliers.length > 0 ? Math.max(...nonOutliers) : q3;
    
    // Calculate additional statistics
    const variance = numbers.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const skewness = numbers.reduce((a,b) => a + Math.pow((b - mean)/stdDev, 3), 0) / n;
    
    // Build quartile calculation table
    let quartileTable = `
    <div style="background: white; border-radius: 16px; margin: 20px 0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: linear-gradient(135deg, #1a5490, #0d3b66); color: white;">
                    <th style="padding: 14px; text-align: center;">Quartile</th>
                    <th style="padding: 14px; text-align: center;">Data Range</th>
                    <th style="padding: 14px; text-align: center;">Calculation</th>
                    <th style="padding: 14px; text-align: center;">Result</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #e9ecef;">
                    <td style="padding: 12px; font-weight: bold; text-align: center;">Q₁ (25th Percentile)</td>
                    <td style="padding: 12px;">Full sorted data, p = 0.25</td>
                    <td style="padding: 12px; font-family: monospace; text-align: center;">${describeQuantileType7(sorted, 0.25, 'Q₁')}</td>
                    <td style="padding: 12px; background: #e8f4f8; font-weight: bold; text-align: center;">${q1.toFixed(4)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                    <td style="padding: 12px; font-weight: bold; text-align: center;">Q₂ (Median)</td>
                    <td style="padding: 12px;">Full data: [${sorted.join(', ')}]</td>
                    <td style="padding: 12px; font-family: monospace; text-align: center;">${medianResult.formula}</td>
                    <td style="padding: 12px; background: #e8f4f8; font-weight: bold; text-align: center;">${median.toFixed(4)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                    <td style="padding: 12px; font-weight: bold; text-align: center;">Q₃ (75th Percentile)</td>
                    <td style="padding: 12px;">Full sorted data, p = 0.75</td>
                    <td style="padding: 12px; font-family: monospace; text-align: center;">${describeQuantileType7(sorted, 0.75, 'Q₃')}</td>
                    <td style="padding: 12px; background: #e8f4f8; font-weight: bold; text-align: center;">${q3.toFixed(4)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build outlier detection table
    let outlierTable = `
    <div style="background: white; border-radius: 16px; margin: 20px 0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: linear-gradient(135deg, #dc3545, #a71d2a); color: white;">
                    <th style="padding: 14px; text-align: center;">#</th>
                    <th style="padding: 14px; text-align: center;">Value</th>
                    <th style="padding: 14px; text-align: center;">Comparison</th>
                    <th style="padding: 14px; text-align: center;">Status</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let idx = 0; idx < sorted.length; idx++) {
        let val = sorted[idx];
        let status = "";
        let comparison = "";
        let bgColor = "";
        if (val < lowerBound) {
            status = "🔴 OUTLIER (Below Lower Bound)";
            comparison = `${val} < ${lowerBound.toFixed(4)}`;
            bgColor = "#f8d7da";
        } else if (val > upperBound) {
            status = "🔴 OUTLIER (Above Upper Bound)";
            comparison = `${val} > ${upperBound.toFixed(4)}`;
            bgColor = "#f8d7da";
        } else {
            status = "✅ Normal";
            comparison = `${lowerBound.toFixed(4)} ≤ ${val} ≤ ${upperBound.toFixed(4)}`;
            bgColor = "#d4edda";
        }
        
        outlierTable += `
            <tr style="border-bottom: 1px solid #e9ecef; background: ${bgColor};">
                <td style="padding: 10px; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 10px; text-align: center; font-weight: bold;">${val}</td>
                <td style="padding: 10px; font-family: monospace; text-align: center;">${comparison}</td>
                <td style="padding: 10px;">${status}</td>
            </tr>`;
    }
    
    outlierTable += `
            </tbody>
        </table>
    </div>`;
    
    // Build Five-Number Summary Table
    let fiveNumTable = `
    <div style="background: white; border-radius: 16px; margin-bottom: 25px; border: 2px solid #1a5490; overflow-x: auto;">
        <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 Five-Number Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #e9ecef;">
                    <th style="padding: 12px; text-align: center;">Statistic</th>
                    <th style="padding: 12px; text-align: center;">Value</th>
                    <th style="padding: 12px; text-align: center;">Interpretation</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Minimum (Min)</td>
                    <td style="text-align: center; font-weight: bold; color: #28a745;">${minVal}</td>
                    <td style="text-align: center;">Smallest value in dataset</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Q₁ (First Quartile)</td>
                    <td style="text-align: center; font-weight: bold;">${q1.toFixed(4)}</td>
                    <td style="text-align: center;">25% of data ≤ this value</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Median (Q₂)</td>
                    <td style="text-align: center; font-weight: bold; color: #ffc107;">${median.toFixed(4)}</td>
                    <td style="text-align: center;">50% of data ≤ this value</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Q₃ (Third Quartile)</td>
                    <td style="text-align: center; font-weight: bold;">${q3.toFixed(4)}</td>
                    <td style="text-align: center;">75% of data ≤ this value</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Maximum (Max)</td>
                    <td style="text-align: center; font-weight: bold; color: #dc3545;">${maxVal}</td>
                    <td style="text-align: center;">Largest value in dataset</td>
                </tr>
                <tr style="background: #f0f4fa;">
                    <td style="padding: 12px; font-weight: bold;">IQR (Interquartile Range)</td>
                    <td style="text-align: center; font-weight: bold; color: #1a5490;">${iqr.toFixed(4)}</td>
                    <td style="text-align: center;">Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build Whisker Table
    let whiskerTable = `
    <div style="background: white; border-radius: 16px; margin: 20px 0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin: 0; padding: 14px; background: #17a2b8; color: white; text-align: center;">📏 Whisker Calculations</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #e9ecef;">
                    <th style="padding: 12px; text-align: center;">Whisker</th>
                    <th style="padding: 12px; text-align: center;">Formula</th>
                    <th style="padding: 12px; text-align: center;">Value</th>
                    <th style="padding: 12px; text-align: center;">Interpretation</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Lower Whisker</td>
                    <td style="text-align: center; font-family: monospace;">Smallest value ≥ Q₁ - 1.5×IQR</td>
                    <td style="text-align: center; font-weight: bold; color: #28a745;">${whiskerMin.toFixed(4)}</td>
                    <td style="text-align: center;">Smallest non-outlier</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Upper Whisker</td>
                    <td style="text-align: center; font-family: monospace;">Largest value ≤ Q₃ + 1.5×IQR</td>
                    <td style="text-align: center; font-weight: bold; color: #dc3545;">${whiskerMax.toFixed(4)}</td>
                    <td style="text-align: center;">Largest non-outlier</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build complete steps HTML
    const steps = stepsHtmlBoxplot({ fiveNumTable, iqr, lowerBound, maxVal, mean, median, minVal, n, numbers, outlierTable, outliers, q1, q3, quartileTable, sorted, stdDev, upperBound, whiskerTable });
    // `normal` mirrors the IQR-outlier tool: every value that is not an outlier
    const normal = numbers.filter(x => x >= lowerBound && x <= upperBound);
    return { steps, minVal, q1, median, q3, maxVal, iqr, lowerBound, upperBound, outliers, normal, whiskerMin, whiskerMax, mean, stdDev, skewness };
}


function setupBoxplotLogic() {
    const computeBtn = document.getElementById("boxplotComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("boxplotInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("boxplotResultArea");
        const valueSpan = document.getElementById("boxplotValueDisplay");
        const stepsSpan = document.getElementById("boxplotStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter numbers to generate boxplot.");
            return;
        }
        
        const result = computeBoxplotWithSteps(numbers);
        resultDiv.style.display = "block";
        setHtml(valueSpan, `📦 Outliers: ${result.outliers.length} | IQR: ${result.iqr.toFixed(4)} | Range: ${result.minVal} - ${result.maxVal} | Median: ${result.median.toFixed(4)}`);
        setHtml(stepsSpan, result.steps);
        
        setTimeout(() => {
            renderBoxplotChart(numbers, result);
        }, 100);
    });
    
    attachClearHandler("boxplotClearBtn", "boxplotInput", "boxplotResultArea");
}
