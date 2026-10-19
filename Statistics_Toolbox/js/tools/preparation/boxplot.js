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
    // the median is the Type 7 value; for an even n that is the mean of the two middle values, which the worked step shows
    const medianOf = arr => {
        const m = arr.length, value = quantileType7(arr, 0.5);
        if (m % 2 === 0) return { value, left: arr[m/2 - 1], right: arr[m/2], formula: `(${arr[m/2 - 1]} + ${arr[m/2]}) / 2 = ${value}` };
        return { value, left: value, right: value, formula: `${value}` };
    };
    
    const q1 = quantileType7(sorted, 0.25);
    const q3 = quantileType7(sorted, 0.75);
    
    const medianResult = medianOf(sorted);
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
    <div class="s-538424">
        <table class="s-897d74 gen-sized">
            <thead>
                <tr class="s-2d88ce">
                    <th class="s-16aba4">Quartile</th>
                    <th class="s-16aba4">Data Range</th>
                    <th class="s-16aba4">Calculation</th>
                    <th class="s-16aba4">Result</th>
                </tr>
            </thead>
            <tbody>
                <tr class="s-00049c">
                    <td class="s-0ed842">Q₁ (25th Percentile)</td>
                    <td class="s-61a8ef">Full sorted data, p = 0.25</td>
                    <td class="s-0c5934">${describeQuantileType7(sorted, 0.25, 'Q₁')}</td>
                    <td class="s-69cbad">${q1.toFixed(4)}</td>
                </tr>
                <tr class="s-00049c">
                    <td class="s-0ed842">Q₂ (Median)</td>
                    <td class="s-61a8ef">Full data: [${sorted.join(', ')}]</td>
                    <td class="s-0c5934">${medianResult.formula}</td>
                    <td class="s-69cbad">${median.toFixed(4)}</td>
                </tr>
                <tr class="s-00049c">
                    <td class="s-0ed842">Q₃ (75th Percentile)</td>
                    <td class="s-61a8ef">Full sorted data, p = 0.75</td>
                    <td class="s-0c5934">${describeQuantileType7(sorted, 0.75, 'Q₃')}</td>
                    <td class="s-69cbad">${q3.toFixed(4)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build outlier detection table
    let outlierTable = `
    <div class="s-538424">
        <table class="s-897d74 gen-sized">
            <thead>
                <tr class="s-fce476">
                    <th class="s-16aba4">#</th>
                    <th class="s-16aba4">Value</th>
                    <th class="s-16aba4">Comparison</th>
                    <th class="s-16aba4">Status</th>
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
                <td class="s-09833f">${idx + 1}</td>
                <td class="s-09833f">${val}</td>
                <td class="s-762d5d">${comparison}</td>
                <td class="s-aa3a8a">${status}</td>
            </tr>`;
    }
    
    outlierTable += `
            </tbody>
        </table>
    </div>`;
    
    // Build Five-Number Summary Table
    let fiveNumTable = `
    <div class="s-20f162">
        <h3 class="s-ba9de1">📊 Five-Number Summary</h3>
        <table class="s-897d74 gen-sized">
            <thead>
                <tr class="s-bfd0ae">
                    <th class="s-34ffd2">Statistic</th>
                    <th class="s-34ffd2">Value</th>
                    <th class="s-34ffd2">Interpretation</th>
                </tr>
            </thead>
            <tbody>
                <tr class="s-b490b8">
                    <td class="s-8136fa">Minimum (Min)</td>
                    <td class="s-5dac7a">${minVal}</td>
                    <td class="s-02528c">Smallest value in dataset</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-8136fa">Q₁ (First Quartile)</td>
                    <td class="s-f91e25">${q1.toFixed(4)}</td>
                    <td class="s-02528c">25% of data ≤ this value</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-8136fa">Median (Q₂)</td>
                    <td class="s-65630c">${median.toFixed(4)}</td>
                    <td class="s-02528c">50% of data ≤ this value</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-8136fa">Q₃ (Third Quartile)</td>
                    <td class="s-f91e25">${q3.toFixed(4)}</td>
                    <td class="s-02528c">75% of data ≤ this value</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-8136fa">Maximum (Max)</td>
                    <td class="s-ec8a35">${maxVal}</td>
                    <td class="s-02528c">Largest value in dataset</td>
                </tr>
                <tr class="s-2411fb">
                    <td class="s-8136fa">IQR (Interquartile Range)</td>
                    <td class="s-a79d4a">${iqr.toFixed(4)}</td>
                    <td class="s-02528c">Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build Whisker Table
    let whiskerTable = `
    <div class="s-538424">
        <h3 class="s-3fb06f">📏 Whisker Calculations</h3>
        <table class="s-897d74 gen-sized">
            <thead>
                <tr class="s-bfd0ae">
                    <th class="s-34ffd2">Whisker</th>
                    <th class="s-34ffd2">Formula</th>
                    <th class="s-34ffd2">Value</th>
                    <th class="s-34ffd2">Interpretation</th>
                </tr>
            </thead>
            <tbody>
                <tr class="s-b490b8">
                    <td class="s-8136fa">Lower Whisker</td>
                    <td class="s-365ea1">Smallest value ≥ Q₁ - 1.5×IQR</td>
                    <td class="s-5dac7a">${whiskerMin.toFixed(4)}</td>
                    <td class="s-02528c">Smallest non-outlier</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-8136fa">Upper Whisker</td>
                    <td class="s-365ea1">Largest value ≤ Q₃ + 1.5×IQR</td>
                    <td class="s-ec8a35">${whiskerMax.toFixed(4)}</td>
                    <td class="s-02528c">Largest non-outlier</td>
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
