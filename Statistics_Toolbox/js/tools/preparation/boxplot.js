/* Boxplot: boxplot tool (render, compute, setup) */

// Function to create box plot
// Function to create box plot (using bar chart with error bars)
// Function to create box plot (using bar chart with error bars)
function createBoxPlot(numbers, chartTitle) {
    if (!numbers || numbers.length === 0) return;
    
    // Calculate statistics
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    
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
    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    const dataCanvas = document.getElementById('dataChart');
    labelChart(dataCanvas, `Box plot of ${describeSample(numbers)}. Quartiles: Q1 ${+q1.toFixed(3)}, median ${+median.toFixed(3)}, Q3 ${+q3.toFixed(3)}; whiskers ${+lowerWhisker.toFixed(3)} to ${+upperWhisker.toFixed(3)}. ${chartTitle}.`);
    const ctx = dataCanvas.getContext('2d');
    
    // Create a horizontal bar chart representing the box plot
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dataset'],
            datasets: [
                {
                    label: 'Min to Max (Whiskers)',
                    data: [upperWhisker - lowerWhisker],
                    backgroundColor: 'rgba(200, 200, 200, 0.3)',
                    borderColor: 'rgba(31, 79, 138, 0.5)',
                    borderWidth: 1,
                    barPercentage: 0.3,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Q1 to Q3 (Box)',
                    data: [q3 - q1],
                    backgroundColor: 'rgba(44, 125, 160, 0.7)',
                    borderColor: 'rgba(31, 79, 138, 1)',
                    borderWidth: 2,
                    barPercentage: 0.3,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: { size: 14, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Q1 to Q3 (Box)') {
                                return [
                                    `Q1: ${q1.toFixed(2)}`,
                                    `Q3: ${q3.toFixed(2)}`,
                                    `IQR: ${iqr.toFixed(2)}`,
                                    `Median: ${median.toFixed(2)}`
                                ];
                            } else if (context.dataset.label === 'Min to Max (Whiskers)') {
                                return [
                                    `Min: ${lowerWhisker.toFixed(2)}`,
                                    `Max: ${upperWhisker.toFixed(2)}`,
                                    `Range: ${(upperWhisker - lowerWhisker).toFixed(2)}`
                                ];
                            }
                            return context.raw;
                        }
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: { 
                        display: true, 
                        text: 'Value Range', 
                        font: { weight: 'bold' } 
                    },
                    stacked: false
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Statistics', 
                        font: { weight: 'bold' } 
                    }
                }
            }
        }
    });
    
    // Add distribution analysis below the chart
    const analysisText = generateDistributionAnalysis(numbers);
    
    // Check if analysis container exists, if not create it
    let analysisContainer = document.getElementById('distributionAnalysis');
    if (!analysisContainer) {
        analysisContainer = document.createElement('div');
        analysisContainer.id = 'distributionAnalysis';
        analysisContainer.className = 'calculation-steps';
        analysisContainer.style.marginTop = '20px';
        analysisContainer.style.fontSize = '0.85rem';
        analysisContainer.style.maxHeight = '500px';
        analysisContainer.style.overflowY = 'auto';
        const chartContainer = document.getElementById('chartDisplayArea');
        chartContainer.appendChild(analysisContainer);
    }
    setHtml(analysisContainer, analysisText);
    analysisContainer.style.whiteSpace = 'pre-wrap';
}

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

// Custom plugin to draw boxplot elements with interactive tooltips
const boxplotPlugin = {
    id: 'boxplotPlugin',
    afterDatasetsDraw(chart) {
        const { ctx, scales } = chart;
        
        // Get the boxplot data from the chart config
        const boxplotData = chart.config.data.boxplotData;
        if (!boxplotData) return;
        
        const { q1, median, q3, whiskerMin, whiskerMax, outliers, minVal, maxVal } = boxplotData;
        
        // Calculate X position (center of the chart)
        const xAxis = scales.x;
        const xCenter = (xAxis.getPixelForValue(0) + xAxis.getPixelForValue(1)) / 2;
        
        // Box width
        const boxWidth = 100;
        const boxLeft = xCenter - boxWidth / 2;
        const boxRight = xCenter + boxWidth / 2;
        
        // Y positions
        const q1Y = scales.y.getPixelForValue(q1);
        const q3Y = scales.y.getPixelForValue(q3);
        const medianY = scales.y.getPixelForValue(median);
        const whiskerMinY = scales.y.getPixelForValue(whiskerMin);
        const whiskerMaxY = scales.y.getPixelForValue(whiskerMax);
        const minY = scales.y.getPixelForValue(minVal);
        const maxY = scales.y.getPixelForValue(maxVal);
        
        // Store interactive elements for tooltips
        chart.interactiveElements = [];
        
        ctx.save();
        
        // 1. Draw WHISKER LINES (store for tooltips)
        ctx.beginPath();
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 2.5;
        // Lower whisker
        ctx.moveTo(xCenter, whiskerMinY);
        ctx.lineTo(xCenter, q1Y);
        ctx.stroke();
        chart.interactiveElements.push({
            type: 'whisker',
            label: 'Lower Whisker',
            value: whiskerMin,
            y: whiskerMinY,
            color: '#81c784'
        });
        
        // Upper whisker
        ctx.beginPath();
        ctx.moveTo(xCenter, q3Y);
        ctx.lineTo(xCenter, whiskerMaxY);
        ctx.stroke();
        chart.interactiveElements.push({
            type: 'whisker',
            label: 'Upper Whisker',
            value: whiskerMax,
            y: whiskerMaxY,
            color: '#81c784'
        });
        
        // 2. Draw WHISKER CAPS
        ctx.beginPath();
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 2.5;
        const capWidth = 15;
        ctx.moveTo(xCenter - capWidth, whiskerMinY);
        ctx.lineTo(xCenter + capWidth, whiskerMinY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xCenter - capWidth, whiskerMaxY);
        ctx.lineTo(xCenter + capWidth, whiskerMaxY);
        ctx.stroke();
        
        // 3. Draw IQR BOX
        ctx.fillStyle = 'rgba(79, 195, 247, 0.25)';
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2.5;
        const boxHeight = q1Y - q3Y;
        if (boxHeight > 0) {
            ctx.fillRect(boxLeft, q3Y, boxWidth, boxHeight);
            ctx.strokeRect(boxLeft, q3Y, boxWidth, boxHeight);
            chart.interactiveElements.push({
                type: 'box',
                label: 'IQR Box',
                value: `${q1.toFixed(4)} to ${q3.toFixed(4)}`,
                q1: q1,
                q3: q3,
                iqr: (q3 - q1).toFixed(4),
                color: '#4fc3f7'
            });
        }
        
        // 4. Draw MEDIAN LINE
        ctx.beginPath();
        ctx.strokeStyle = '#ffb74d';
        ctx.lineWidth = 4;
        ctx.moveTo(boxLeft, medianY);
        ctx.lineTo(boxRight, medianY);
        ctx.stroke();
        chart.interactiveElements.push({
            type: 'median',
            label: 'Median (Q₂)',
            value: median,
            y: medianY,
            color: '#ffb74d'
        });
        
        // 5. Draw Q1 horizontal reference line
        ctx.beginPath();
        ctx.strokeStyle = '#17a2b8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.moveTo(boxLeft - 20, q1Y);
        ctx.lineTo(boxRight + 20, q1Y);
        ctx.stroke();
        ctx.setLineDash([]);
        chart.interactiveElements.push({
            type: 'q1',
            label: 'Q₁ (25th Percentile)',
            value: q1,
            y: q1Y,
            color: '#17a2b8'
        });
        
        // 6. Draw Q3 horizontal reference line
        ctx.beginPath();
        ctx.strokeStyle = '#17a2b8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.moveTo(boxLeft - 20, q3Y);
        ctx.lineTo(boxRight + 20, q3Y);
        ctx.stroke();
        ctx.setLineDash([]);
        chart.interactiveElements.push({
            type: 'q3',
            label: 'Q₃ (75th Percentile)',
            value: q3,
            y: q3Y,
            color: '#17a2b8'
        });
        
        // 7. Draw MIN and MAX points
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(xCenter, minY, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px "Segoe UI", Arial';
        ctx.fillText('Min', xCenter + 18, minY - 5);
        chart.interactiveElements.push({
            type: 'point',
            label: 'Minimum',
            value: minVal,
            x: xCenter,
            y: minY,
            color: '#28a745'
        });
        
        ctx.fillStyle = '#dc3545';
        ctx.beginPath();
        ctx.arc(xCenter, maxY, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText('Max', xCenter + 18, maxY + 5);
        chart.interactiveElements.push({
            type: 'point',
            label: 'Maximum',
            value: maxVal,
            x: xCenter,
            y: maxY,
            color: '#dc3545'
        });
        
        // 8. Draw OUTLIERS with better positioning
        if (outliers && outliers.length > 0) {
            for (let i = 0; i < outliers.length; i++) {
                const outlier = outliers[i];
                const outlierY = scales.y.getPixelForValue(outlier);
                const xOffset = (i - (outliers.length - 1) / 2) * 20;
                ctx.fillStyle = '#ef5350';
                ctx.beginPath();
                ctx.arc(xCenter + xOffset, outlierY, 9, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#c62828';
                ctx.beginPath();
                ctx.arc(xCenter + xOffset, outlierY, 5, 0, 2 * Math.PI);
                ctx.fill();
                chart.interactiveElements.push({
                    type: 'outlier',
                    label: 'Outlier',
                    value: outlier,
                    x: xCenter + xOffset,
                    y: outlierY,
                    color: '#ef5350'
                });
            }
        }
        
        // 9. Draw NON-OVERLAPPING LABELS with proper positioning
        ctx.font = 'bold 12px "Segoe UI", Arial';
        
        // Q1 Label - left side of box
// Q1 Label - RIGHT side of box (moved from left to right)
ctx.font = 'bold 12px "Segoe UI", Arial';
ctx.fillStyle = '#17a2b8';
ctx.fillText('Q₁', boxRight + 15, q1Y + 4);
ctx.font = '10px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(q1.toFixed(4), boxRight + 15, q1Y + 20);


        // Q3 Label - RIGHT side of box (moved from left to right)
ctx.font = 'bold 12px "Segoe UI", Arial';
ctx.fillStyle = '#17a2b8';
ctx.fillText('Q₃', boxRight + 15, q3Y + 4);
ctx.font = '10px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(q3.toFixed(4), boxRight + 15, q3Y + 20);

        
        // Median Label - right side of box
        ctx.font = 'bold 12px "Segoe UI", Arial';
        ctx.fillStyle = '#ffb74d';
        ctx.fillText('Median', boxRight + 20, medianY + 4);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#8b949e';
        ctx.fillText(median.toFixed(4), boxRight + 20, medianY + 20);
        
// Lower Whisker Label - move DOWN more (increase the negative offset)
ctx.font = 'bold 11px "Segoe UI", Arial';
ctx.fillStyle = '#81c784';
ctx.fillText('Lower Whisker', xCenter, whiskerMinY - 28);      // ← CHANGE: -15 to -28
ctx.font = '9px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(whiskerMin.toFixed(4), xCenter, whiskerMinY - 12); // ← CHANGE: -3 to -12

// Upper Whisker Label - move UP more (increase the positive offset)
ctx.fillStyle = '#81c784';
ctx.fillText('Upper Whisker', xCenter, whiskerMaxY + 38);       // ← CHANGE: +25 to +38
ctx.font = '9px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(whiskerMax.toFixed(4), xCenter, whiskerMaxY + 52);  // ← CHANGE: +38 to +52
        
        // IQR Box Label - above the box
        ctx.font = 'bold 11px "Segoe UI", Arial';
        ctx.fillStyle = '#4fc3f7';
ctx.fillText('IQR Box', xCenter + 50, q3Y - 15);  // ← Moved to the right
        ctx.font = '9px monospace';
        ctx.fillStyle = '#8b949e';
        ctx.fillText(`IQR = ${(q3 - q1).toFixed(4)}`, xCenter, q1Y + 28);
        
// Min Value Label - move further right
ctx.font = '9px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(minVal.toFixed(4), xCenter + 35, minY + 12);  // ← 18 to 35

// Max Value Label - move further right
ctx.fillText(maxVal.toFixed(4), xCenter + 35, maxY - 8);   // ← 18 to 35
        
        // Outlier Label if any
        if (outliers && outliers.length > 0) {
            ctx.font = 'bold 10px "Segoe UI", Arial';
            ctx.fillStyle = '#ef5350';
            const maxOutlierY = Math.max(...outliers.map(o => scales.y.getPixelForValue(o)));
            ctx.fillText(`⚠️ ${outliers.length} Outlier(s)`, xCenter, maxOutlierY - 25);
        }
        
        ctx.restore();
    }
};

// The plugin is passed to each boxplot chart through its own `plugins: [boxplotPlugin]` option (renderBoxplotChart),
// so it never runs for the other charts in the app.

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
    let steps = `
<div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 48px;">📦</span>
                    <div>
                        <h1 style="margin: 0; font-size: 28px;">Boxplot Analysis</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Five-Number Summary & Outlier Detection (1.5 × IQR Rule)</p>
                    </div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.8;">SAMPLE SIZE</div>
                <div style="font-size: 36px; font-weight: 700;">${n}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 25px;">
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
    
    <!-- Step 1: Sort Data -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">1</span>
            📋 Sort the Data
        </h2>
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <p><strong>Original Data:</strong> [${numbers.join(', ')}]</p>
            <p><strong>Sorted Data:</strong> <code style="background: #e8f4f8; padding: 8px 12px; border-radius: 8px; display: inline-block;">[${sorted.join(', ')}]</code></p>
        </div>
    </div>
    
    <!-- Step 2: Quartiles -->
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">2</span>
            📐 Calculate Quartiles
        </h2>
        ${quartileTable}
    </div>
    
    <!-- Step 3: IQR and Boundaries -->
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">3</span>
            🔢 IQR & Outlier Boundaries
        </h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>IQR (Interquartile Range):</strong>
                <div style="font-family: monospace; font-size: 20px; margin: 15px 0; text-align: center;">
                    IQR = Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)} = <strong style="color: #1a5490;">${iqr.toFixed(4)}</strong>
                </div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>Outlier Boundaries (1.5 × IQR):</strong>
                <div style="margin: 15px 0;">
                    <div style="font-family: monospace; padding: 8px; background: #f8f9fa; border-radius: 6px;">Lower Bound = Q₁ - 1.5×IQR = ${q1.toFixed(4)} - 1.5×${iqr.toFixed(4)} = <strong style="color: #dc3545;">${lowerBound.toFixed(4)}</strong></div>
                    <div style="font-family: monospace; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-top: 10px;">Upper Bound = Q₃ + 1.5×IQR = ${q3.toFixed(4)} + 1.5×${iqr.toFixed(4)} = <strong style="color: #dc3545;">${upperBound.toFixed(4)}</strong></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Step 4: Outliers -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">4</span>
            🔍 Identify Outliers
        </h2>
        ${outlierTable}
    </div>
    
    <!-- Step 5: Five-Number Summary -->
    ${fiveNumTable}
    
    <!-- Step 6: Whiskers -->
    ${whiskerTable}
    
    <!-- Boxplot Visualization -->
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%); border-radius: 20px; padding: 25px; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #4fc3f7; padding-bottom: 15px;">
            <span style="font-size: 28px;">📊</span>
            <h3 style="margin: 0; color: #4fc3f7;">BOXPLOT VISUALIZATION</h3>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #b39ddb;">💡 Hover over any line or point to see its value</p>
        </div>
        
        <!-- Chart Canvas -->
        <canvas id="boxplotChartCanvas" style="max-height: 450px; width: 100%; margin-top: 10px;"></canvas>
        
        <div style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 20px; height: 20px; background: rgba(79, 195, 247, 0.3); border: 2px solid #4fc3f7;"></div><span style="color: #e6edf3; font-size: 11px;">IQR Box (Q₁ to Q₃)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 3px; background: #ffb74d;"></div><span style="color: #e6edf3; font-size: 11px;">Median Line (Q₂)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 2px; background: #81c784;"></div><span style="color: #e6edf3; font-size: 11px;">Whiskers</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #ef5350; border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">Outliers</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 2px; background: #81c784;"></div><span style="color: #e6edf3; font-size: 11px;">Whisker Caps</span></div>
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
                <strong>Summary Stats:</strong><br>
                • Mean = ${mean.toFixed(4)}<br>
                • Median = ${median.toFixed(4)}<br>
                • Std Dev = ${stdDev.toFixed(4)}
            </div>
        </div>
    </div>
</div>`;
    
    return { steps, minVal, q1, median, q3, maxVal, iqr, lowerBound, upperBound, outliers, whiskerMin, whiskerMax, mean, stdDev, skewness };
}

// Render Boxplot Chart using Chart.js with Custom Plugin and Tooltips
function renderBoxplotChart(numbers, stats) {
    const canvas = document.getElementById('boxplotChartCanvas');
    if (!canvas) return;
    labelChart(canvas, `Box plot of ${describeSample(numbers)}. Quartiles: Q1 ${+stats.q1.toFixed(3)}, median ${+stats.median.toFixed(3)}, Q3 ${+stats.q3.toFixed(3)}; whiskers ${+stats.whiskerMin.toFixed(3)} to ${+stats.whiskerMax.toFixed(3)}; ${stats.outliers.length} outlier${stats.outliers.length === 1 ? '' : 's'}.`);
    
    if (boxplotChartInstance) {
        boxplotChartInstance.destroy();
        boxplotChartInstance = null;
    }
    
    const { minVal, q1, median, q3, maxVal, whiskerMin, whiskerMax, outliers } = stats;
    
    // Create a dummy scatter dataset just to set up the axes
    const dummyData = [
        { x: 'Dataset', y: minVal },
        { x: 'Dataset', y: maxVal }
    ];
    
    const ctx = canvas.getContext('2d');
    
    boxplotChartInstance = new Chart(ctx, {
        type: 'scatter',
        plugins: [boxplotPlugin],
        data: {
            datasets: [{
                label: 'Data Range',
                data: dummyData,
                type: 'scatter',
                pointRadius: 0,
                showLine: false
            }],
            // Store boxplot data for the plugin
            boxplotData: { q1, median, q3, whiskerMin, whiskerMax, outliers, minVal, maxVal }
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Boxplot Analysis - Distribution of Data (n = ${numbers.length})`,
                    font: { size: 16, weight: 'bold', family: "'Segoe UI', sans-serif" },
                    color: '#e6edf3',
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    enabled: false // Disable default tooltip, use custom
                },
                legend: { display: false }
            },
            scales: {
               y: {
        title: { 
            display: true, 
            text: 'Value', 
            font: { weight: 'bold', size: 13 }, 
            color: '#e6edf3' 
        },
        grid: { color: '#2d2d44' },
        ticks: { 
            color: '#e6edf3',
            stepSize: Math.ceil((maxVal - minVal) / 6),
            font: { size: 11 }
        },
min: Math.min(minVal, whiskerMin) - 15,   // ← CHANGE: 3 to 12 (more space below)
max: Math.max(maxVal, whiskerMax) + 15    // ← CHANGE: 3 to 12 (more space above)
    },
                x: {
                    title: { 
                        display: true, 
                        text: 'Variable', 
                        font: { weight: 'bold', size: 13 }, 
                        color: '#e6edf3' 
                    },
                    grid: { display: false },
                    ticks: { 
                        color: '#e6edf3',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            layout: {
                padding: {
                    top: 30,
                    bottom: 30,
                    left: 50,
                    right: 50
                }
            }
        }
    });
    
    // Setup custom tooltip after chart is created
    setTimeout(() => {
        setupCanvasTooltip(canvas, boxplotChartInstance);
    }, 100);
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
