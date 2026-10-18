/* Pearson / Spearman / Kendall / covariance */
// PEARSON CORRELATION INTERFACE
function renderPearsonInterface() {
    return `
        <div class="stat-interface" id="statPearsonInterface">
            <div class="interface-title">📐 Pearson Correlation Coefficient (r)</div>
            <div class="formula-card">
                <div class="formula">📌 r = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]</div>
                <div class="desc">Measures linear relationship between two variables. Range: -1 to +1. 
                -1 = perfect negative, 0 = no linear, +1 = perfect positive correlation.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (comma, space, or line separated):</label>
                <textarea id="pearsonXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                <label style="margin-top: 15px;">📋 Enter Y values (same number of values):</label>
                <textarea id="pearsonYInput" rows="3" placeholder="Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="pearsonComputeBtn">📐 Calculate Pearson r + Full Steps</button>
                    <button class="secondary-btn" id="pearsonClearBtn">Clear All</button>
                </div>
            </div>
            <div id="pearsonResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 PEARSON CORRELATION RESULT</div>
                    <div class="result-value" id="pearsonValueDisplay">—</div>
                    <div class="calculation-steps" id="pearsonStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// SPEARMAN'S RANK CORRELATION INTERFACE
function renderSpearmanInterface() {
    return `
        <div class="stat-interface" id="statSpearmanInterface">
            <div class="interface-title">📈 Spearman's Rank Correlation (ρ)</div>
            <div class="formula-card">
                <div class="formula">📌 ρ = 1 - [6 × Σdᵢ²] / [n(n² - 1)]</div>
                <div class="desc">Non-parametric measure of monotonic association. Works with ranks, handles outliers well.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values:</label>
                <textarea id="spearmanXInput" rows="3" placeholder="Example: 10, 20, 30, 40, 50, 60, 70, 80"></textarea>
                <label style="margin-top: 15px;">📋 Enter Y values (same number of values):</label>
                <textarea id="spearmanYInput" rows="3" placeholder="Example: 15, 25, 35, 45, 55, 65, 75, 85"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="spearmanComputeBtn">📈 Calculate Spearman's ρ + Steps</button>
                    <button class="secondary-btn" id="spearmanClearBtn">Clear All</button>
                </div>
            </div>
            <div id="spearmanResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 SPEARMAN'S RANK CORRELATION RESULT</div>
                    <div class="result-value" id="spearmanValueDisplay">—</div>
                    <div class="calculation-steps" id="spearmanStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// KENDALL'S TAU INTERFACE
function renderKendallInterface() {
    return `
        <div class="stat-interface" id="statKendallInterface">
            <div class="interface-title">🔗 Kendall's Tau (τ)</div>
            <div class="formula-card">
                <div class="formula">📌 τ = (C - D) / [n(n-1)/2]</div>
                <div class="desc">Measures ordinal association based on concordant vs discordant pairs. Range: -1 to +1.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values:</label>
                <textarea id="kendallXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8"></textarea>
                <label style="margin-top: 15px;">📋 Enter Y values (same number of values):</label>
                <textarea id="kendallYInput" rows="3" placeholder="Example: 1, 4, 9, 16, 25, 36, 49, 64"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="kendallComputeBtn">🔗 Calculate Kendall's Tau + Steps</button>
                    <button class="secondary-btn" id="kendallClearBtn">Clear All</button>
                </div>
            </div>
            <div id="kendallResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 KENDALL'S TAU RESULT</div>
                    <div class="result-value" id="kendallValueDisplay">—</div>
                    <div class="calculation-steps" id="kendallStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// COVARIANCE INTERFACE
function renderCovarianceInterface() {
    return `
        <div class="stat-interface" id="statCovarianceInterface">
            <div class="interface-title">📊 Covariance</div>
            <div class="formula-card">
                <div class="formula">📌 Cov(X,Y) = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / (n-1)  [Sample]</div>
                <div class="desc">Measures direction of linear relationship. Positive = variables move together, Negative = move opposite.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values:</label>
                <textarea id="covarianceXInput" rows="3" placeholder="Example: 2, 4, 6, 8, 10, 12, 14, 16"></textarea>
                <label style="margin-top: 15px;">📋 Enter Y values (same number of values):</label>
                <textarea id="covarianceYInput" rows="3" placeholder="Example: 1, 3, 5, 7, 9, 11, 13, 15"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="covarianceComputeBtn">📊 Calculate Covariance + Steps</button>
                    <button class="secondary-btn" id="covarianceClearBtn">Clear All</button>
                </div>
            </div>
            <div id="covarianceResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 COVARIANCE RESULT</div>
                    <div class="result-value" id="covarianceValueDisplay">—</div>
                    <div class="calculation-steps" id="covarianceStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== PEARSON CORRELATION - BEAUTIFUL VERSION ==========
function computePearsonWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values. X has ${xValues.length}, Y has ${yValues.length}.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 pairs for meaningful correlation." };
    }
    
    const n = xValues.length;
    let sumX = xValues.reduce((a,b) => a+b, 0);
    let sumY = yValues.reduce((a,b) => a+b, 0);
    let meanX = sumX / n;
    let meanY = sumY / n;
    
    let deviations = [];
    let sumDevX = 0, sumDevY = 0, sumProduct = 0;
    
    for (let i = 0; i < n; i++) {
        let devX = xValues[i] - meanX;
        let devY = yValues[i] - meanY;
        let sqDevX = devX * devX;
        let sqDevY = devY * devY;
        let product = devX * devY;
        
        deviations.push({
            i: i+1,
            x: xValues[i],
            y: yValues[i],
            devX: devX,
            devY: devY,
            sqDevX: sqDevX,
            sqDevY: sqDevY,
            product: product
        });
        
        sumDevX += sqDevX;
        sumDevY += sqDevY;
        sumProduct += product;
    }
    
    let denominator = Math.sqrt(sumDevX * sumDevY);
    let r = denominator !== 0 ? sumProduct / denominator : 0;
    
    // Build table rows with perfect alignment
    let tableRows = '';
    for (let d of deviations) {
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px 8px; text-align: center; font-weight: 500;">${d.i}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.x}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.y}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc3545;">${d.devX.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc3545;">${d.devY.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; color: #28a745;">${d.sqDevX.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; color: #28a745;">${d.sqDevY.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; background: #e8f4f8; font-weight: 600; color: #1f6392;">${d.product.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">📐</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Pearson Correlation Coefficient (r)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Formula: r = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75; font-size: 13px;">Range: -1 to +1 | -1 = perfect negative, 0 = no linear, +1 = perfect positive</p>
        </div>
        
        <!-- Data Summary Grid -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📊</span> Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #1a5490;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Pairs</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1a5490;">${n}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Σx (Sum of X)</div>
                    <div style="font-size: 20px; font-weight: 600;">${sumX.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Σy (Sum of Y)</div>
                    <div style="font-size: 20px; font-weight: 600;">${sumY.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Mean of X (x̄)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanX.toFixed(6)}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Mean of Y (ȳ)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanY.toFixed(6)}</div>
                </div>
            </div>
        </div>
        
        <!-- Calculations Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490; font-size: 16px; display: flex; align-items: center; gap: 8px;"><span>📋</span> Deviation Calculations</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px 8px; text-align: center;">i</th>
                        <th style="padding: 12px 8px; text-align: center;">xᵢ</th>
                        <th style="padding: 12px 8px; text-align: center;">yᵢ</th>
                        <th style="padding: 12px 8px; text-align: center;">(xᵢ - x̄)</th>
                        <th style="padding: 12px 8px; text-align: center;">(yᵢ - ȳ)</th>
                        <th style="padding: 12px 8px; text-align: center;">(xᵢ - x̄)²</th>
                        <th style="padding: 12px 8px; text-align: center;">(yᵢ - ȳ)²</th>
                        <th style="padding: 12px 8px; text-align: center;">(xᵢ - x̄)(yᵢ - ȳ)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="background: #e9ecef; font-weight: 700; border-top: 2px solid #dee2e6;">
                        <td colspan="5" style="padding: 12px 8px; text-align: right;">SUM →</td>
                        <td style="padding: 12px 8px; text-align: center; color: #28a745;">${sumDevX.toFixed(4)}</td>
                        <td style="padding: 12px 8px; text-align: center; color: #28a745;">${sumDevY.toFixed(4)}</td>
                        <td style="padding: 12px 8px; text-align: center; background: #e8f4f8; color: #1a5490;">${sumProduct.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Calculation Steps -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>🔢</span> Step-by-Step Calculation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">1</div>
                    <div><strong>Calculate Covariance Sum (Numerator)</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 14px;">
                    Σ(xᵢ - x̄)(yᵢ - ȳ) = ${sumProduct.toFixed(6)}
                </div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">2</div>
                    <div><strong>Calculate Denominator</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 14px;">
                    √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²] = √(${sumDevX.toFixed(6)} × ${sumDevY.toFixed(6)}) = ${denominator.toFixed(6)}
                </div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">3</div>
                    <div><strong>Calculate Pearson r</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 16px; font-weight: 700; color: #1a5490;">
                    r = ${sumProduct.toFixed(6)} / ${denominator.toFixed(6)} = ${r.toFixed(8)}
                </div>
            </div>
        </div>
        
        <!-- Interpretation Section -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(r) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(r) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 style="margin: 0 0 12px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📌</span> Interpretation</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Correlation Coefficient:</strong> r = ${r.toFixed(6)} → <strong style="color: ${r > 0 ? '#28a745' : '#dc3545'};">${r > 0 ? 'Positive' : 'Negative'}</strong> correlation</div>
                <div><strong>Strength:</strong> ${Math.abs(r) >= 0.9 ? '🔥 Very Strong' : (Math.abs(r) >= 0.7 ? '✅ Strong' : (Math.abs(r) >= 0.5 ? '📊 Moderate' : (Math.abs(r) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No')))} ${Math.abs(r) >= 0.3 ? 'linear relationship' : 'linear correlation'}</div>
                <div><strong>Coefficient of Determination (r²):</strong> ${(r*r).toFixed(6)} → ${((r*r)*100).toFixed(1)}% of variance in Y is explained by X</div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px; color: #555;">
                    💡 <strong>Practical Meaning:</strong> ${r > 0.7 ? 'Strong positive relationship - as X increases, Y tends to increase significantly.' : (r < -0.7 ? 'Strong negative relationship - as X increases, Y tends to decrease significantly.' : (Math.abs(r) > 0.3 ? 'Moderate relationship exists between X and Y.' : 'Little to no linear relationship between X and Y.'))}
                </div>
            </div>
        </div>
    </div>`;
    
    return { r, steps, n, meanX, meanY, sumProduct, sumDevX, sumDevY };
}

// ========== SPEARMAN'S RANK - BEAUTIFUL VERSION ==========
function computeSpearmanWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 pairs for meaningful correlation." };
    }
    
    const n = xValues.length;
    
    function assignRanks(arr) {
        let indexed = arr.map((val, idx) => ({ val, idx }));
        indexed.sort((a, b) => a.val - b.val);
        let ranks = new Array(n);
        let i = 0;
        while (i < n) {
            let j = i;
            while (j < n && indexed[j].val === indexed[i].val) j++;
            let avgRank = (i + 1 + j) / 2;
            for (let k = i; k < j; k++) {
                ranks[indexed[k].idx] = avgRank;
            }
            i = j;
        }
        return ranks;
    }
    
    let rankX = assignRanks(xValues);
    let rankY = assignRanks(yValues);
    
    let rankData = [];
    let sumDSquared = 0;
    
    for (let i = 0; i < n; i++) {
        let d = rankX[i] - rankY[i];
        let dSq = d * d;
        sumDSquared += dSq;
        rankData.push({
            i: i+1,
            x: xValues[i],
            y: yValues[i],
            rankX: rankX[i],
            rankY: rankY[i],
            d: d,
            dSq: dSq
        });
    }
    
    let rho = 1 - (6 * sumDSquared) / (n * (n * n - 1));
    
    let tableRows = '';
    for (let d of rankData) {
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px 8px; text-align: center; font-weight: 500;">${d.i}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.x}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.y}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 500; color: #1a5490;">${d.rankX}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 500; color: #1a5490;">${d.rankY}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 600;">${d.d}</td>
            <td style="padding: 10px 8px; text-align: center; background: #e8f4f8; font-weight: 600; color: #1a5490;">${d.dSq}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">📈</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Spearman's Rank Correlation (ρ)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: ρ = 1 - [6 × Σdᵢ²] / [n(n² - 1)]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75; font-size: 13px;">Non-parametric | Measures monotonic association | Robust against outliers</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; font-size: 18px;"><span>📊</span> Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #1a5490;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Pairs</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1a5490;">${n}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Σd² (Sum of squared differences)</div>
                    <div style="font-size: 20px; font-weight: 600;">${sumDSquared}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490; font-size: 16px;"><span>📋</span> Rank Assignment & Differences</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px 8px; text-align: center;">i</th>
                        <th style="padding: 12px 8px; text-align: center;">Xᵢ</th>
                        <th style="padding: 12px 8px; text-align: center;">Yᵢ</th>
                        <th style="padding: 12px 8px; text-align: center;">Rank(Xᵢ)</th>
                        <th style="padding: 12px 8px; text-align: center;">Rank(Yᵢ)</th>
                        <th style="padding: 12px 8px; text-align: center;">d = R(X)-R(Y)</th>
                        <th style="padding: 12px 8px; text-align: center;">d²</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="6" style="padding: 12px 8px; text-align: right;">Σd² →</td>
                        <td style="padding: 12px 8px; text-align: center; background: #e8f4f8; color: #1a5490;">${sumDSquared}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; font-size: 18px;"><span>🔢</span> Step-by-Step Calculation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</div>
                    <div><strong>Sum of squared rank differences</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">Σd² = ${sumDSquared}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">2</div>
                    <div><strong>Calculate denominator</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">n(n² - 1) = ${n} × (${n}² - 1) = ${n} × ${n*n - 1} = ${n * (n*n - 1)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">3</div>
                    <div><strong>Calculate Spearman's ρ</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 16px; font-weight: 700; color: #1a5490;">
                    ρ = 1 - [6 × ${sumDSquared}] / ${n * (n*n - 1)} = ${rho.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(rho) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(rho) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 style="margin: 0 0 12px 0; font-size: 18px;"><span>📌</span> Interpretation</h3>
            <div><strong>Spearman's ρ:</strong> ${rho.toFixed(6)} → <strong style="color: ${rho > 0 ? '#28a745' : '#dc3545'};">${rho > 0 ? 'Positive' : 'Negative'}</strong> monotonic association</div>
            <div><strong>Strength:</strong> ${Math.abs(rho) >= 0.9 ? '🔥 Very Strong' : (Math.abs(rho) >= 0.7 ? '✅ Strong' : (Math.abs(rho) >= 0.5 ? '📊 Moderate' : (Math.abs(rho) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No')))} monotonic relationship</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px; color: #555;">
                💡 <strong>Practical Meaning:</strong> Spearman's ρ measures whether as X increases, Y tends to increase (positive) or decrease (negative) consistently, even if not perfectly linear.
            </div>
        </div>
    </div>`;
    
    return { rho, steps, sumDSquared, rankX, rankY };
}

// ========== KENDALL'S TAU - BEAUTIFUL VERSION ==========
// ========== KENDALL'S TAU - COMPLETELY FIXED WITH PROPER DATA DISPLAY ==========
function computeKendallWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 pairs for meaningful correlation." };
    }
    
    const n = xValues.length;
    
    // Create pairs and sort by X
    let pairs = [];
    for (let i = 0; i < n; i++) {
        pairs.push({ 
            x: xValues[i], 
            y: yValues[i], 
            originalIndex: i 
        });
    }
    pairs.sort((a, b) => a.x - b.x);
    
    // Build sorted pairs table - FIXED: Properly display all data
    let sortedRows = '';
    for (let idx = 0; idx < pairs.length; idx++) {
        sortedRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px 8px; text-align: center; font-weight: 500;">${idx + 1}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 500; color: #1a5490;">${pairs[idx].x}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 500; color: #2d6a4f;">${pairs[idx].y}</td>
        </tr>`;
    }
    
    // Calculate concordant and discordant pairs with detailed comparison
    let concordant = 0;
    let discordant = 0;
    let ties = 0;
    let comparisonRows = '';
    
    // Generate all pair comparisons
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
            let y1 = pairs[i].y;
            let y2 = pairs[j].y;
            let comparison = "";
            let result = "";
            let bgColor = "";
            
            if (y1 < y2) {
                concordant++;
                comparison = `${y1} < ${y2}`;
                result = "✓ CONCORDANT (+)";
                bgColor = "#d4edda";
            } else if (y1 > y2) {
                discordant++;
                comparison = `${y1} > ${y2}`;
                result = "✗ DISCORDANT (-)";
                bgColor = "#f8d7da";
            } else {
                ties++;
                comparison = `${y1} = ${y2}`;
                result = "○ TIE (ignored)";
                bgColor = "#fff3cd";
            }
            
            comparisonRows += `<tr style="background: ${bgColor}; border-bottom: 1px solid #dee2e6;">
                <td style="padding: 8px 8px; text-align: center;">(${i+1}, ${j+1})</td>
                <td style="padding: 8px 8px; text-align: center; font-weight: 500;">${pairs[i].y}</td>
                <td style="padding: 8px 8px; text-align: center; font-weight: 500;">${pairs[j].y}</td>
                <td style="padding: 8px 8px; text-align: center; font-weight: 500;">${comparison}</td>
                <td style="padding: 8px 8px; text-align: center; font-weight: 600;">${result}</td>
            </tr>`;
        }
    }
    
    let totalPairs = (n * (n - 1)) / 2;
    let tau = (concordant - discordant) / totalPairs;
    
    // Build the complete HTML
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">🔗</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Kendall's Tau (τ)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Formula: τ = (C - D) / [n(n-1)/2]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75; font-size: 13px;">Measures ordinal association | Based on concordant vs discordant pairs | Range: -1 to +1</p>
        </div>
        
        <!-- Original Data -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #2d6a4f; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📋</span> Original Data</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; max-height: 150px; overflow-y: auto; padding: 8px;">
                ${xValues.map((x, i) => `<div style="background: white; padding: 6px 12px; border-radius: 8px; text-align: center;">(${x}, ${yValues[i]})</div>`).join('')}
            </div>
        </div>
        
        <!-- Data Summary Grid -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #2d6a4f; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📊</span> Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #2d6a4f;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Pairs (n)</div>
                    <div style="font-size: 28px; font-weight: 700; color: #2d6a4f;">${n}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Total Possible Pairs</div>
                    <div style="font-size: 22px; font-weight: 600;">${totalPairs}</div>
                    <div style="font-size: 11px; color: #6c757d;">= ${n} × (${n}-1) / 2</div>
                </div>
            </div>
        </div>
        
        <!-- Step 1: Sorted Pairs Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #2d6a4f; color: #2d6a4f; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <span>📋</span> Step 1: Sort Pairs by X Value (Ascending)
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #2d6a4f; color: white;">
                        <th style="padding: 12px 8px; text-align: center; width: 33%;">Position</th>
                        <th style="padding: 12px 8px; text-align: center; width: 33%;">X Value</th>
                        <th style="padding: 12px 8px; text-align: center; width: 33%;">Y Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedRows}
                </tbody>
            </table>
            <div style="padding: 12px 20px; background: #f8f9fa; font-size: 13px; color: #555; border-top: 1px solid #e9ecef;">
                💡 <strong>Note:</strong> Pairs are now sorted by X in ascending order. Next, we compare Y values of each pair with all subsequent pairs.
            </div>
        </div>
        
        <!-- Step 2: Pair Comparisons Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #2d6a4f; color: #2d6a4f; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <span>🔍</span> Step 2: Compare Each Pair with Subsequent Pairs
            </h3>
            <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #2d6a4f; color: white; position: sticky; top: 0;">
                            <th style="padding: 10px 8px; text-align: center;">Pair (i, j)</th>
                            <th style="padding: 10px 8px; text-align: center;">Yᵢ (from pair i)</th>
                            <th style="padding: 10px 8px; text-align: center;">Yⱼ (from pair j)</th>
                            <th style="padding: 10px 8px; text-align: center;">Comparison</th>
                            <th style="padding: 10px 8px; text-align: center;">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisonRows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 3: Count Concordant and Discordant -->
        <div style="background: linear-gradient(135deg, #e8f4e8 0%, #d4e8d4 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #2d6a4f; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                <span>📊</span> Step 3: Count Concordant and Discordant Pairs
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 36px;">✓</div>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Concordant Pairs (C)</div>
                    <div style="font-size: 32px; font-weight: 700; color: #28a745;">${concordant}</div>
                    <div style="font-size: 11px; color: #6c757d;">When Yᵢ &lt; Yⱼ</div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 36px;">✗</div>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Discordant Pairs (D)</div>
                    <div style="font-size: 32px; font-weight: 700; color: #dc3545;">${discordant}</div>
                    <div style="font-size: 11px; color: #6c757d;">When Yᵢ &gt; Yⱼ</div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 36px;">○</div>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Ties (ignored)</div>
                    <div style="font-size: 32px; font-weight: 700; color: #ffc107;">${ties}</div>
                    <div style="font-size: 11px; color: #6c757d;">When Yᵢ = Yⱼ</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #2d6a4f; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</div>
                    <div><strong>Calculate C - D (Difference)</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 18px; font-weight: 600;">
                    C - D = ${concordant} - ${discordant} = <strong style="color: #2d6a4f;">${concordant - discordant}</strong>
                </div>
            </div>
        </div>
        
        <!-- Step 4: Final Calculation -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #2d6a4f; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                <span>🔢</span> Step 4: Calculate Kendall's Tau
            </h3>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">
                    τ = (C - D) / [n(n-1)/2]
                </div>
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">
                    τ = (${concordant} - ${discordant}) / ${totalPairs}
                </div>
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">
                    τ = ${concordant - discordant} / ${totalPairs}
                </div>
                <div style="font-family: monospace; font-size: 28px; font-weight: 700; color: #2d6a4f; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; margin-top: 12px;">
                    τ = ${tau.toFixed(8)}
                </div>
            </div>
        </div>
        
        <!-- Interpretation Section -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(tau) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(tau) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 style="margin: 0 0 12px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📌</span> Interpretation</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Kendall's τ:</strong> ${tau.toFixed(6)} → <strong style="color: ${tau > 0 ? '#28a745' : '#dc3545'};">${tau > 0 ? 'Positive' : 'Negative'}</strong> ordinal association</div>
                <div><strong>Strength:</strong> ${Math.abs(tau) >= 0.7 ? '🔥 Strong' : (Math.abs(tau) >= 0.5 ? '📊 Moderate' : (Math.abs(tau) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No'))} association</div>
                <div><strong>Agreement Rate:</strong> ${((concordant / totalPairs) * 100).toFixed(1)}% of pairs are concordant</div>
                <div><strong>Disagreement Rate:</strong> ${((discordant / totalPairs) * 100).toFixed(1)}% of pairs are discordant</div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px; color: #555;">
                    💡 <strong>Practical Meaning:</strong> ${tau > 0 ? 'A positive τ indicates that larger X values tend to be associated with larger Y values (monotonic increasing relationship).' : (tau < 0 ? 'A negative τ indicates that larger X values tend to be associated with smaller Y values (monotonic decreasing relationship).' : 'A τ near 0 indicates no monotonic association between X and Y.')}
                </div>
            </div>
        </div>
    </div>`;
    
    return { tau, steps, concordant, discordant, ties, totalPairs };
}

// ========== COVARIANCE - BEAUTIFUL VERSION ==========
function computeCovarianceWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 2) {
        return { error: true, message: "Need at least 2 pairs for covariance." };
    }
    
    const n = xValues.length;
    let sumX = xValues.reduce((a,b) => a+b, 0);
    let sumY = yValues.reduce((a,b) => a+b, 0);
    let meanX = sumX / n;
    let meanY = sumY / n;
    
    let devData = [];
    let sumProduct = 0;
    
    for (let i = 0; i < n; i++) {
        let devX = xValues[i] - meanX;
        let devY = yValues[i] - meanY;
        let product = devX * devY;
        sumProduct += product;
        devData.push({
            i: i+1,
            x: xValues[i],
            y: yValues[i],
            devX: devX,
            devY: devY,
            product: product
        });
    }
    
    let covariance = sumProduct / (n - 1);
    let sumDevX = xValues.reduce((a, b) => a + Math.pow(b - meanX, 2), 0);
    let sumDevY = yValues.reduce((a, b) => a + Math.pow(b - meanY, 2), 0);
    let r = sumProduct / Math.sqrt(sumDevX * sumDevY);
    
    let tableRows = '';
    for (let d of devData) {
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px 8px; text-align: center; font-weight: 500;">${d.i}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.x}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.y}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc3545;">${d.devX.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc3545;">${d.devY.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; background: #e8f4f8; font-weight: 600; color: #1a5490;">${d.product.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <div style="background: linear-gradient(135deg, #495057 0%, #343a40 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">📊</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Covariance (Sample)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: Cov(X,Y) = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / (n-1)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75; font-size: 13px;">Measures direction of linear relationship | Positive = same direction, Negative = opposite direction</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #495057; font-size: 18px;"><span>📊</span> Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #495057;"><div style="font-size: 12px; color: #6c757d;">n (Pairs)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #28a745;"><div style="font-size: 12px; color: #6c757d;">x̄ (Mean X)</div><div style="font-size: 18px; font-weight: 600;">${meanX.toFixed(6)}</div></div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;"><div style="font-size: 12px; color: #6c757d;">ȳ (Mean Y)</div><div style="font-size: 18px; font-weight: 600;">${meanY.toFixed(6)}</div></div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #495057; color: #495057;"><span>📋</span> Deviation Products</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead><tr style="background: #495057; color: white;">
                    <th style="padding: 10px;">i</th><th style="padding: 10px;">xᵢ</th><th style="padding: 10px;">yᵢ</th>
                    <th style="padding: 10px;">(xᵢ - x̄)</th><th style="padding: 10px;">(yᵢ - ȳ)</th>
                    <th style="padding: 10px;">(xᵢ - x̄)(yᵢ - ȳ)</th>
                </tr></thead>
                <tbody>${tableRows}<tr style="background: #e9ecef; font-weight: 700;"><td colspan="5" style="padding: 10px; text-align: right;">SUM →</td><td style="padding: 10px; text-align: center; background: #e8f4f8;">${sumProduct.toFixed(4)}</td></tr></tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #495057; font-size: 18px;"><span>🔢</span> Calculation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">Σ[(xᵢ - x̄)(yᵢ - ȳ)] = ${sumProduct.toFixed(6)}</div>
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">Cov(X,Y) = ${sumProduct.toFixed(6)} / (${n} - 1)</div>
                <div style="font-family: monospace; font-size: 20px; font-weight: 700; color: #495057; text-align: center; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    Covariance = ${covariance.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${covariance > 0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (covariance < 0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #fff3cd; border-left: 6px solid #ffc107;')}">
            <h3 style="margin: 0 0 12px 0; font-size: 18px;"><span>📌</span> Interpretation</h3>
            <div><strong>Covariance:</strong> ${covariance.toFixed(6)} → <strong style="color: ${covariance > 0 ? '#28a745' : (covariance < 0 ? '#dc3545' : '#ffc107')};">${covariance > 0 ? 'POSITIVE' : (covariance < 0 ? 'NEGATIVE' : 'ZERO')}</strong> relationship</div>
            <div>${covariance > 0 ? '✓ X and Y tend to move in the SAME direction' : (covariance < 0 ? '✓ X and Y tend to move in OPPOSITE directions' : '✓ No linear relationship between X and Y')}</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px; color: #555;">
                💡 <strong>Note:</strong> Covariance magnitude depends on units. For standardized comparison, use Pearson correlation (r = ${r.toFixed(6)}).
            </div>
        </div>
    </div>`;
    
    return { covariance, steps, meanX, meanY, sumProduct, n };
}

// ========== CORRELATION SETUP FUNCTIONS (FIXED) ==========
function setupPearsonLogic() {
    const computeBtn = document.getElementById("pearsonComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("pearsonXInput").value;
        const rawY = document.getElementById("pearsonYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("pearsonResultArea");
        const valueSpan = document.getElementById("pearsonValueDisplay");
        const stepsSpan = document.getElementById("pearsonStepsDisplay");
        
        const result = computePearsonWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;  // Changed to innerHTML
        } else {
            valueSpan.innerHTML = `r = ${result.r.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;  // Changed to innerHTML
        }
    });
    
    const clearBtn = document.getElementById("pearsonClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("pearsonXInput").value = '';
            document.getElementById("pearsonYInput").value = '';
            document.getElementById("pearsonResultArea").style.display = 'none';
        });
    }
}

function setupSpearmanLogic() {
    const computeBtn = document.getElementById("spearmanComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("spearmanXInput").value;
        const rawY = document.getElementById("spearmanYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("spearmanResultArea");
        const valueSpan = document.getElementById("spearmanValueDisplay");
        const stepsSpan = document.getElementById("spearmanStepsDisplay");
        
        const result = computeSpearmanWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;  // Changed to innerHTML
        } else {
            valueSpan.innerHTML = `ρ = ${result.rho.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;  // Changed to innerHTML
        }
    });
    
    const clearBtn = document.getElementById("spearmanClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("spearmanXInput").value = '';
            document.getElementById("spearmanYInput").value = '';
            document.getElementById("spearmanResultArea").style.display = 'none';
        });
    }
}

function setupKendallLogic() {
    const computeBtn = document.getElementById("kendallComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("kendallXInput").value;
        const rawY = document.getElementById("kendallYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("kendallResultArea");
        const valueSpan = document.getElementById("kendallValueDisplay");
        const stepsSpan = document.getElementById("kendallStepsDisplay");
        
        const result = computeKendallWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;  // Changed to innerHTML
        } else {
            valueSpan.innerHTML = `τ = ${result.tau.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;  // Changed to innerHTML
        }
    });
    
    const clearBtn = document.getElementById("kendallClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("kendallXInput").value = '';
            document.getElementById("kendallYInput").value = '';
            document.getElementById("kendallResultArea").style.display = 'none';
        });
    }
}

function setupCovarianceLogic() {
    const computeBtn = document.getElementById("covarianceComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("covarianceXInput").value;
        const rawY = document.getElementById("covarianceYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("covarianceResultArea");
        const valueSpan = document.getElementById("covarianceValueDisplay");
        const stepsSpan = document.getElementById("covarianceStepsDisplay");
        
        const result = computeCovarianceWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;  // Changed to innerHTML
        } else {
            valueSpan.innerHTML = `Cov = ${result.covariance.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;  // Changed to innerHTML
        }
    });
    
    const clearBtn = document.getElementById("covarianceClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("covarianceXInput").value = '';
            document.getElementById("covarianceYInput").value = '';
            document.getElementById("covarianceResultArea").style.display = 'none';
        });
    }
}
// ========== LOG TRANSFORMATION SETUP FUNCTION ==========
function setupLogTransformLogic() {
    const computeBtn = document.getElementById("logComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("logInput").value;
        const numbers = parseNumbersFromInput(raw);
        const base = document.getElementById("logBase").value;
        const resultDiv = document.getElementById("logResultArea");
        const valueSpan = document.getElementById("logValueDisplay");
        const stepsSpan = document.getElementById("logStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to transform.";
            return;
        }
        
        const logRes = computeLogTransformWithSteps(numbers, base);
        if (logRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerText = logRes.message;
            return;
        }
        
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `Transformed: ${logRes.transformed.map(x => x.toFixed(6)).join(', ')}`;
        stepsSpan.innerText = logRes.steps;
    });
    
    attachClearHandler("logClearBtn", "logInput", "logResultArea");
}
