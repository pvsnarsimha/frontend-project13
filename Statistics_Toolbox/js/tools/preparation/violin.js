/* Violin: violin tool (render, compute, setup) */

// ========== VIOLIN PLOT RENDER FUNCTION ==========
function renderViolinInterface() {
    return buildInterface({
        id: "statViolinInterface",
        title: "🎻 Violin Plot (Density + Boxplot)",
        card: [
            { formula: "📌 Kernel Density Estimation + Boxplot" },
            {
                desc: "<strong>What is a Violin Plot?</strong><br>\n                    A violin plot combines a boxplot with a rotated kernel density plot on each side.\n                    It shows the distribution's shape, central tendency, spread, and multimodality."
            },
            {
                desc: "<strong>Interpretation:</strong><br>\n                    • <strong>Wider sections</strong> = Higher density (more data points)<br>\n                    • <strong>Narrower sections</strong> = Lower density (fewer data points)<br>\n                    • <strong>White dot</strong> = Median<br>\n                    • <strong>Thick black bar</strong> = Interquartile Range (IQR)<br>\n                    • <strong>Lines</strong> = Whiskers (1.5×IQR rule)",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated):",
                textarea: { id: "violinInput", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33, 100, 5" }
            },
            {
                label: "🎨 Bandwidth h (smoothing, in the same units as your data):",
                labelAttrs: { style: FIELD_GAP },
                input: {
                    type: "range",
                    id: "violinBandwidth",
                    min: "0.1",
                    max: "2",
                    step: "0.05",
                    value: "0.5",
                    style: "width: 100%; margin-bottom: 10px;"
                }
            },
            {
                html: "<div class=\"s-65936d\">\n                    <span>Less smooth (more detail)</span>\n                    <span id=\"bandwidthValue\">0.50</span>\n                    <span>More smooth (general shape)</span>\n                </div>"
            }
        ],
        run: { id: "violinComputeBtn", text: "🎻 Generate Violin Plot + Statistics" },
        clear: { id: "violinClearBtn", text: "Clear" },
        result: {
            area: "violinResultArea",
            label: "🎯 VIOLIN PLOT RESULTS",
            value: "violinValueDisplay",
            steps: "violinStepsDisplay"
        }
    });
}

function computeViolinWithSteps(numbers, bandwidth) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    if (!(bandwidth > 0) || !isFinite(bandwidth)) return { error: true, message: "Bandwidth must be greater than 0." };
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = numbers.length;
    const minVal = Math.min(...numbers);
    const maxVal = Math.max(...numbers);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Calculate quartiles
    
    // Type 7 quantiles (linear interpolation at (n - 1)p), the same method as every other quantile in the app
    const q1 = quantileType7(sorted, 0.25);
    const q3 = quantileType7(sorted, 0.75);
    
    const median = quantileType7(sorted, 0.5);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Identify outliers
    const outliers = numbers.filter(x => x < lowerBound || x > upperBound).sort((a, b) => a - b);
    const nonOutliers = numbers.filter(x => x >= lowerBound && x <= upperBound);
    const whiskerMin = nonOutliers.length > 0 ? Math.min(...nonOutliers) : q1;
    const whiskerMax = nonOutliers.length > 0 ? Math.max(...nonOutliers) : q3;
    
    // Calculate variance and standard deviation
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Kernel Density Estimation
    const points = 100;
    const xMin = Math.min(minVal, whiskerMin) - (maxVal - minVal) * 0.1;
    const xMax = Math.max(maxVal, whiskerMax) + (maxVal - minVal) * 0.1;
    const step = (xMax - xMin) / points;
    
    const densityPoints = [];
    for (let i = 0; i <= points; i++) {
        const x = xMin + i * step;
        let density = 0;
        
        // Gaussian kernel
        for (let val of numbers) {
            const u = (x - val) / bandwidth;
            density += (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
        }
        density /= (n * bandwidth);
        densityPoints.push({ x: x, density: density });
    }
    
    // Find max density for scaling
    const maxDensity = Math.max(...densityPoints.map(p => p.density));
    
    // Calculate statistics for display
    const variancePop = variance;
    const skewness = sampleSkewness(numbers);            // the Skewness / Kurtosis tools' estimators (null when undefined)
    const kurtosis = sampleExcessKurtosis(numbers);
    
    // Build statistics table
    let statsTable = `
    <div class="s-538424">
        <h3 class="s-5041c4">📊 Statistical Summary</h3>
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
                    <td class="s-31373e">Sample Size (n)</td>
                    <td class="s-02528c">${n}</td>
                    <td class="s-02528c">Number of observations</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-31373e">Mean (μ)</td>
                    <td class="s-02528c">${mean.toFixed(4)}</td>
                    <td class="s-02528c">Average value</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-31373e">Median (Q₂)</td>
                    <td class="s-02528c">${median.toFixed(4)}</td>
                    <td class="s-02528c">Middle value (50th percentile)</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-31373e">Standard Deviation (σ)</td>
                    <td class="s-02528c">${stdDev.toFixed(4)}</td>
                    <td class="s-02528c">Measure of spread</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-31373e">Skewness (γ₁)</td>
                    <td class="s-02528c">${skewness === null ? 'N/A' : skewness.toFixed(4)}</td>
                    <td class="s-02528c">${skewness === null ? 'Needs at least 3 distinct values' : (Math.abs(skewness) < 0.1 ? 'Symmetric' : (skewness > 0 ? 'Right-skewed' : 'Left-skewed'))}</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-31373e">Kurtosis (γ₂)</td>
                    <td class="s-02528c">${kurtosis === null ? 'N/A' : kurtosis.toFixed(4)}</td>
                    <td class="s-02528c">${kurtosis === null ? 'Needs at least 4 distinct values' : (Math.abs(kurtosis) < 0.5 ? 'Mesokurtic (normal-like)' : (kurtosis > 0 ? 'Leptokurtic (heavy tails)' : 'Platykurtic (light tails)'))}</td>
                </tr>
                <tr class="s-b490b8">
                    <td class="s-31373e">IQR (Interquartile Range)</td>
                    <td class="s-02528c">${iqr.toFixed(4)}</td>
                    <td class="s-02528c">Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)}</td>
                </tr>
                <tr>
                    <td class="s-31373e">Outliers</td>
                    <td class="s-02528c">${outliers.length}</td>
                    <td class="s-02528c">${outliers.length > 0 ? `Values: ${outliers.join(', ')}` : 'No outliers detected'}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build density calculation explanation
    let densitySteps = `
    <div class="s-498a55 gen-pad">
        <h3 class="s-862845">📐 Kernel Density Estimation (KDE)</h3>
        <div class="s-6fdce2">
            <strong>Formula:</strong>
            <div class="s-fa6a70">
                f̂(x) = (1/(n·h)) × Σ K((x - xᵢ)/h)
            </div>
            <div class="s-7fd1d1">
                <strong>Where:</strong><br>
                • <strong>K(u)</strong> = Gaussian kernel = (1/√(2π)) × e^(-u²/2)<br>
                • <strong>h</strong> = Bandwidth = ${bandwidth}<br>
                • <strong>n</strong> = Sample size = ${n}<br>
                • <strong>xᵢ</strong> = Data points
            </div>
            <div class="s-45aed0">
                💡 <strong>Interpretation:</strong> The violin shape shows the probability density of data at different values.
                Wider sections = higher density (more data points clustered there).
            </div>
        </div>
    </div>`;
    
    const steps = stepsHtmlViolin({ bandwidth, densitySteps, iqr, maxDensity, maxVal, mean, median, minVal, outliers, q1, q3, statsTable });
    
    return { 
        steps, 
        normal: numbers.filter(x => x >= lowerBound && x <= upperBound),   // same shape as the IQR-outlier and boxplot results
        densityPoints, 
        maxDensity, 
        q1, median, q3, whiskerMin, whiskerMax, 
        outliers, minVal, maxVal, mean, stdDev,
        n, iqr, variance, skewness, kurtosis
    };
}

function renderViolinChart(stats, numbers, bandwidth) {
    if (!chartJsReady(renderViolinChart, arguments)) return;
    const canvas = document.getElementById('violinChartCanvas');
    if (!canvas) return;
    labelChart(canvas, `Violin plot of ${describeSample(numbers)}. Quartiles: Q1 ${+stats.q1.toFixed(3)}, median ${+stats.median.toFixed(3)}, Q3 ${+stats.q3.toFixed(3)}; kernel density with bandwidth ${bandwidth}.`);
    
    if (violinChart) violinChart.destroy();
    
    const { densityPoints, maxDensity, q1, median, q3, whiskerMin, whiskerMax, outliers, minVal, maxVal } = stats;
    
    // Create dataset for the violin (filled area)
    const violinLeftData = densityPoints.map(p => ({ x: p.x, y: -p.density / maxDensity * 0.8 }));
    const violinRightData = densityPoints.map(p => ({ x: p.x, y: p.density / maxDensity * 0.8 }));
    
    // Combine for area chart
    const areaData = [];
    for (let i = 0; i < densityPoints.length; i++) {
        areaData.push({ x: densityPoints[i].x, y: violinLeftData[i].y });
    }
    for (let i = densityPoints.length - 1; i >= 0; i--) {
        areaData.push({ x: densityPoints[i].x, y: violinRightData[i].y });
    }
    
    const ctx = canvas.getContext('2d');
    
    violinChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Violin Shape (KDE)',
                    data: areaData,
                    type: 'scatter',
                    showLine: true,
                    fill: true,
                    backgroundColor: 'rgba(156, 39, 176, 0.4)',
                    borderColor: '#9c27b0',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Median',
                    data: [{ x: median, y: -0.05 }, { x: median, y: 0.05 }],
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#ffb74d',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0
                },
                {
                    label: 'IQR Box (Q₁ to Q₃)',
                    data: [{ x: q1, y: -0.08 }, { x: q1, y: 0.08 }, { x: q3, y: 0.08 }, { x: q3, y: -0.08 }, { x: q1, y: -0.08 }],
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#81c784',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                },
                {
                    label: 'Whiskers',
                    data: [{ x: whiskerMin, y: -0.02 }, { x: whiskerMin, y: 0.02 }, { x: whiskerMax, y: 0.02 }, { x: whiskerMax, y: -0.02 }],
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#81c784',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                },
                {
                    label: 'Whisker Caps',
                    data: [{ x: whiskerMin, y: -0.05 }, { x: whiskerMin, y: 0.05 }, { x: whiskerMax, y: 0.05 }, { x: whiskerMax, y: -0.05 }],
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#81c784',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                },
                {
                    label: 'Outliers',
                    data: outliers.map(o => ({ x: o, y: 0 })),
                    type: 'scatter',
                    backgroundColor: '#ef5350',
                    borderColor: '#ef5350',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Violin Plot (n = ${stats.n}) | Bandwidth = ${bandwidth}`,
                    font: { size: 14, weight: 'bold', family: "'Segoe UI', sans-serif" },
                    color: '#e6edf3',
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Outliers') {
                                return `Outlier: ${context.parsed.x.toFixed(4)}`;
                            }
                            return `${context.dataset.label}: ${context.parsed.x.toFixed(4)}`;
                        }
                    },
                    backgroundColor: '#1a5490',
                    titleColor: 'white',
                    bodyColor: 'white'
                },
                legend: { 
                    position: 'top',
                    labels: { color: '#e6edf3', font: { size: 10 } }
                }
            },
            scales: {
                x: {
                    title: { 
                        display: true, 
                        text: 'Value', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { color: '#e6edf3', font: { size: 11 } }
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Density', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { 
                        color: '#e6edf3',
                        callback: function(val) {
                            return Math.abs(val).toFixed(2);
                        }
                    },
                    min: -0.9,
                    max: 0.9
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 50,
                    right: 50
                }
            }
        }
    });
}

function setupViolinLogic() {
    const computeBtn = document.getElementById("violinComputeBtn");
    if (!computeBtn) return;
    
    const bandwidthSlider = document.getElementById("violinBandwidth");
    const bandwidthValue = document.getElementById("bandwidthValue");
    
    if (bandwidthSlider && bandwidthValue) {
        bandwidthSlider.addEventListener('input', () => {
            bandwidthValue.textContent = parseFloat(bandwidthSlider.value).toFixed(2);
        });
    }
    
    const runViolin = () => {
        const raw = document.getElementById("violinInput").value;
        const numbers = parseNumbersFromInput(raw);
        const bandwidth = parseFloat(document.getElementById("violinBandwidth").value);
        const resultDiv = document.getElementById("violinResultArea");
        const valueSpan = document.getElementById("violinValueDisplay");
        const stepsSpan = document.getElementById("violinStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter numbers to generate violin plot.");
            return;
        }
        
        const result = computeViolinWithSteps(numbers, bandwidth);
        resultDiv.style.display = "block";
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
            return;
        }
        setHtml(valueSpan, `🎻 n = ${result.n} | Median = ${result.median.toFixed(4)} | IQR = ${result.iqr.toFixed(4)} | Outliers = ${result.outliers.length}`);
        setHtml(stepsSpan, result.steps);
        
        setTimeout(() => {
            renderViolinChart(result, numbers, bandwidth);
        }, 100);
    };
    computeBtn.addEventListener('click', runViolin);

    // Once a plot has been drawn, moving the slider redraws it (debounced) so the control does what it looks like
    if (bandwidthSlider) {
        let timer = null;
        bandwidthSlider.addEventListener('input', () => {
            const resultDiv = document.getElementById("violinResultArea");
            if (!resultDiv || resultDiv.style.display !== "block") return;
            clearTimeout(timer);
            timer = setTimeout(runViolin, 200);
        });
    }
    
    attachClearHandler("violinClearBtn", "violinInput", "violinResultArea");
}
