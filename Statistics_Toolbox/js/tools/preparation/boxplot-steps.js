// Worked-solution HTML for computeBoxplotWithSteps (split out of boxplot.js): receives the values the calculation produced.
function stepsHtmlBoxplot(scope) {
    const { fiveNumTable, iqr, lowerBound, maxVal, mean, median, minVal, n, numbers, outlierTable, outliers, q1, q3, quartileTable, sorted, stdDev, upperBound, whiskerTable } = scope;
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
    return steps;
}
