// Worked-solution HTML for computeViolinWithSteps (split out of violin.js): receives the values the calculation produced.
function stepsHtmlViolin(scope) {
    const { bandwidth, densitySteps, iqr, maxDensity, maxVal, mean, median, minVal, outliers, q1, q3, statsTable } = scope;
    let steps = `
<div class="s-3097a8">
    
    <!-- Header -->
    <div class="s-54cb97">
        <div class="s-b15718 gen-flex">
            <div>
                <div class="s-e9f44b gen-flex">
                    <span class="s-93df4f gen-big">🎻</span>
                    <div>
                        <h1 class="s-b80b8c">Violin Plot Analysis</h1>
                        <p class="s-259079">Kernel Density Estimation + Boxplot for Distribution Visualization</p>
                    </div>
                </div>
            </div>
            <div class="s-f85ed7">
                <div class="s-7ce57c">BANDWIDTH</div>
                <div class="s-c2434f">h = ${bandwidth}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div class="s-3d837c gen-grid">
        <div class="s-9ca8be">
            <div class="s-033765">MINIMUM</div>
            <div class="s-d3b644">${minVal}</div>
        </div>
        <div class="s-0b060f">
            <div class="s-033765">Q₁</div>
            <div class="s-3c6f5f">${q1.toFixed(4)}</div>
        </div>
        <div class="s-f94899">
            <div class="s-033765">MEDIAN</div>
            <div class="s-7fdc7a">${median.toFixed(4)}</div>
        </div>
        <div class="s-0b060f">
            <div class="s-033765">Q₃</div>
            <div class="s-3c6f5f">${q3.toFixed(4)}</div>
        </div>
        <div class="s-6b289d">
            <div class="s-033765">MAXIMUM</div>
            <div class="s-2e1589">${maxVal}</div>
        </div>
    </div>
    
    <!-- Statistics Table -->
    ${statsTable}
    
    <!-- Density Explanation -->
    ${densitySteps}
    
    <!-- Violin Plot Visualization -->
    <div class="s-117739 gen-pad">
        <div class="s-62466c gen-flex">
            <span class="s-da9be8">🎻</span>
            <h3 class="s-b625f3">VIOLIN PLOT VISUALIZATION</h3>
            <p class="s-79cb4e">💡 Hover over the plot to see values | Wider = Higher density</p>
        </div>
        
        <canvas class="s-0e19d6 gen-sized" id="violinChartCanvas"></canvas>
        
        <div class="s-4eeef9 gen-flex">
            <div class="s-6d12cd gen-flex"><div class="s-82173d gen-sized"></div><span class="s-205a8c">Violin Shape (KDE)</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-f63681 gen-sized"></div><span class="s-205a8c">Median Line</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-8b4784 gen-sized"></div><span class="s-205a8c">IQR Box Boundaries</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-823510 gen-sized"></div><span class="s-205a8c">Outliers</span></div>
        </div>
    </div>
    
    <!-- Interpretation -->
    <div class="s-284793 gen-pad">
        <h2 class="s-2ce3ad">📖 Final Interpretation</h2>
        <div class="s-9ee21a gen-grid">
            <div class="s-6fdce2">
                <strong>Distribution Shape:</strong><br>
                • ${Math.abs(median - mean) < 0.1 * iqr ? 'Symmetric' : (median < mean ? 'Right-skewed' : 'Left-skewed')}<br>
                • IQR = ${iqr.toFixed(4)}<br>
                • Range = ${(maxVal - minVal).toFixed(4)}
            </div>
            <div class="s-6fdce2">
                <strong>Outliers:</strong><br>
                • ${outliers.length} outlier(s) detected<br>
                ${outliers.length > 0 ? `• Values: ${outliers.join(', ')}` : '• No outliers'}
            </div>
            <div class="s-6fdce2">
                <strong>Density Interpretation:</strong><br>
                • ${maxDensity > 0.5 ? 'High peak concentration' : 'Spread out distribution'}<br>
                • Bandwidth = ${bandwidth} (${bandwidth < 0.5 ? 'detailed' : (bandwidth > 1 ? 'smooth' : 'balanced')})
            </div>
        </div>
    </div>
</div>`;
    return steps;
}
