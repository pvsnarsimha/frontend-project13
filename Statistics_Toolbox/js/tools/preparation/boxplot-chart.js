/* Boxplot: chart drawing (createBoxPlot, custom plugin, renderBoxplotChart); split out of boxplot.js */

// Function to create box plot
// Function to create box plot (using bar chart with error bars)
// Function to create box plot (using bar chart with error bars)
function createBoxPlot(numbers, chartTitle) {
    if (!chartJsReady(createBoxPlot, arguments)) return;
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

// Render Boxplot Chart using Chart.js with Custom Plugin and Tooltips
function renderBoxplotChart(numbers, stats) {
    if (!chartJsReady(renderBoxplotChart, arguments)) return;
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
