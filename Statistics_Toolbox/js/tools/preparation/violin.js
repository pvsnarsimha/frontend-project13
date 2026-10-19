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
                label: "🎨 Bandwidth (smoothing factor):",
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
                html: "<div style=\"display: flex; justify-content: space-between; font-size: 12px;\">\n                    <span>Less smooth (more detail)</span>\n                    <span id=\"bandwidthValue\">0.50</span>\n                    <span>More smooth (general shape)</span>\n                </div>"
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
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = numbers.length;
    const minVal = Math.min(...numbers);
    const maxVal = Math.max(...numbers);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Calculate quartiles
    const getMedian = (arr) => {
        const m = arr.length;
        if (m % 2 === 0) return (arr[m/2 - 1] + arr[m/2]) / 2;
        else return arr[Math.floor(m/2)];
    };
    
    // Type 7 quantiles (linear interpolation at (n - 1)p), the same method as every other quantile in the app
    const q1 = quantileType7(sorted, 0.25);
    const q3 = quantileType7(sorted, 0.75);
    
    const median = getMedian(sorted);
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
    const skewness = numbers.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 3), 0) / n;
    const kurtosis = numbers.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 4), 0) / n - 3;
    
    // Build statistics table
    let statsTable = `
    <div style="background: white; border-radius: 16px; margin: 20px 0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin: 0; padding: 14px; background: linear-gradient(135deg, #6a1b9a, #4a148c); color: white; text-align: center;">📊 Statistical Summary</h3>
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
                    <td style="padding: 10px; font-weight: bold;">Sample Size (n)</td>
                    <td style="text-align: center;">${n}</td>
                    <td style="text-align: center;">Number of observations</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Mean (μ)</td>
                    <td style="text-align: center;">${mean.toFixed(4)}</td>
                    <td style="text-align: center;">Average value</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Median (Q₂)</td>
                    <td style="text-align: center;">${median.toFixed(4)}</td>
                    <td style="text-align: center;">Middle value (50th percentile)</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Standard Deviation (σ)</td>
                    <td style="text-align: center;">${stdDev.toFixed(4)}</td>
                    <td style="text-align: center;">Measure of spread</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Skewness (γ₁)</td>
                    <td style="text-align: center;">${skewness.toFixed(4)}</td>
                    <td style="text-align: center;">${Math.abs(skewness) < 0.1 ? 'Symmetric' : (skewness > 0 ? 'Right-skewed' : 'Left-skewed')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Kurtosis (γ₂)</td>
                    <td style="text-align: center;">${kurtosis.toFixed(4)}</td>
                    <td style="text-align: center;">${Math.abs(kurtosis) < 0.5 ? 'Mesokurtic (normal-like)' : (kurtosis > 0 ? 'Leptokurtic (heavy tails)' : 'Platykurtic (light tails)')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">IQR (Interquartile Range)</td>
                    <td style="text-align: center;">${iqr.toFixed(4)}</td>
                    <td style="text-align: center;">Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold;">Outliers</td>
                    <td style="text-align: center;">${outliers.length}</td>
                    <td style="text-align: center;">${outliers.length > 0 ? `Values: ${outliers.join(', ')}` : 'No outliers detected'}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build density calculation explanation
    let densitySteps = `
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1a5490; margin-top: 0;">📐 Kernel Density Estimation (KDE)</h3>
        <div style="background: white; border-radius: 12px; padding: 15px;">
            <strong>Formula:</strong>
            <div style="font-family: monospace; background: #f0f4fa; padding: 12px; border-radius: 8px; margin: 10px 0;">
                f̂(x) = (1/(n·h)) × Σ K((x - xᵢ)/h)
            </div>
            <div style="margin-top: 10px;">
                <strong>Where:</strong><br>
                • <strong>K(u)</strong> = Gaussian kernel = (1/√(2π)) × e^(-u²/2)<br>
                • <strong>h</strong> = Bandwidth = ${bandwidth}<br>
                • <strong>n</strong> = Sample size = ${n}<br>
                • <strong>xᵢ</strong> = Data points
            </div>
            <div style="margin-top: 12px; background: #d4edda; padding: 10px; border-radius: 8px;">
                💡 <strong>Interpretation:</strong> The violin shape shows the probability density of data at different values.
                Wider sections = higher density (more data points clustered there).
            </div>
        </div>
    </div>`;
    
    let steps = `
<div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 48px;">🎻</span>
                    <div>
                        <h1 style="margin: 0; font-size: 28px;">Violin Plot Analysis</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Kernel Density Estimation + Boxplot for Distribution Visualization</p>
                    </div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.8;">BANDWIDTH</div>
                <div style="font-size: 24px; font-weight: 700;">h = ${bandwidth}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #28a745;">
            <div style="font-size: 11px; color: #6c757d;">MINIMUM</div>
            <div style="font-size: 24px; font-weight: 700; color: #28a745;">${minVal}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">Q₁</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${q1.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #ffc107;">
            <div style="font-size: 11px; color: #6c757d;">MEDIAN</div>
            <div style="font-size: 24px; font-weight: 700; color: #ffc107;">${median.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">Q₃</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${q3.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #dc3545;">
            <div style="font-size: 11px; color: #6c757d;">MAXIMUM</div>
            <div style="font-size: 24px; font-weight: 700; color: #dc3545;">${maxVal}</div>
        </div>
    </div>
    
    <!-- Statistics Table -->
    ${statsTable}
    
    <!-- Density Explanation -->
    ${densitySteps}
    
    <!-- Violin Plot Visualization -->
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%); border-radius: 20px; padding: 25px; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #9c27b0; padding-bottom: 15px;">
            <span style="font-size: 28px;">🎻</span>
            <h3 style="margin: 0; color: #ce93d8;">VIOLIN PLOT VISUALIZATION</h3>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #b39ddb;">💡 Hover over the plot to see values | Wider = Higher density</p>
        </div>
        
        <canvas id="violinChartCanvas" style="max-height: 500px; width: 100%; margin-top: 10px;"></canvas>
        
        <div style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 20px; height: 20px; background: rgba(156, 39, 176, 0.5); border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">Violin Shape (KDE)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 3px; background: #ffb74d;"></div><span style="color: #e6edf3; font-size: 11px;">Median Line</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 3px; background: #81c784;"></div><span style="color: #e6edf3; font-size: 11px;">IQR Box Boundaries</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #ef5350; border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">Outliers</span></div>
        </div>
    </div>
    
    <!-- Interpretation -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 25px;">
        <h2 style="color: #1a5490; margin-top: 0;">📖 Final Interpretation</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Distribution Shape:</strong><br>
                • ${Math.abs(median - mean) < 0.1 * iqr ? 'Symmetric' : (median < mean ? 'Right-skewed' : 'Left-skewed')}<br>
                • IQR = ${iqr.toFixed(4)}<br>
                • Range = ${(maxVal - minVal).toFixed(4)}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Outliers:</strong><br>
                • ${outliers.length} outlier(s) detected<br>
                ${outliers.length > 0 ? `• Values: ${outliers.join(', ')}` : '• No outliers'}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Density Interpretation:</strong><br>
                • ${maxDensity > 0.5 ? 'High peak concentration' : 'Spread out distribution'}<br>
                • Bandwidth = ${bandwidth} (${bandwidth < 0.5 ? 'detailed' : (bandwidth > 1 ? 'smooth' : 'balanced')})
            </div>
        </div>
    </div>
</div>`;
    
    return { 
        steps, 
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
    
    computeBtn.addEventListener('click', () => {
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
        setHtml(valueSpan, `🎻 n = ${result.n} | Median = ${result.median.toFixed(4)} | IQR = ${result.iqr.toFixed(4)} | Outliers = ${result.outliers.length}`);
        setHtml(stepsSpan, result.steps);
        
        setTimeout(() => {
            renderViolinChart(result, numbers, bandwidth);
        }, 100);
    });
    
    attachClearHandler("violinClearBtn", "violinInput", "violinResultArea");
}
