// Worked solution for a test that starts from summary statistics (n, mean, standard deviation, counts) instead of a list of values.
// Same layout and classes as the raw-data tests, so the two look alike. Used by the "summary statistics" paths of the t, z, proportion
// and chi-square tools.
//
// cfg: { icon, title, formula, h0, h1, stats: [[label, value], ...], steps: [[title, html], ...], rejectH0, conclusion: [[label, value], ...],
//        decision, interpretation, significance (text line comparing p with alpha), note (html shown under the conclusion, e.g. a confidence interval) }
function summaryTestHtml(cfg) {
    const stepHtml = (s, i, last) => `
            <div class="${last ? 's-6025fc' : 's-ca9e5c'}">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">${i + 1}</div>
                    <div><strong>${s[0]}</strong></div>
                </div>
                <div class="s-f55593">${s[1]}</div>
            </div>`;
    return `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">${cfg.icon || '📐'}</span>
                <h2 class="s-f8a94d">${cfg.title}</h2>
            </div>
            <p class="s-259079">Formula: ${cfg.formula}</p>
            <p class="s-20a400">${cfg.h0} | ${cfg.h1}</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Summary Statistics (as given)</h3>
            <div class="s-a7ffd4 gen-grid">
                ${cfg.stats.map(([label, value]) => `<div class="s-63afdf"><div class="s-137d30">${label}</div><div class="s-c2434f">${value}</div></div>`).join('\n                ')}
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step-by-Step Calculation</h3>
            ${cfg.steps.map((s, i) => stepHtml(s, i, i === cfg.steps.length - 1)).join('')}
        </div>
        
        <div class="${cfg.rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            ${cfg.conclusion.map(([label, value]) => `<div><strong>${label}:</strong> ${value}</div>`).join('\n            ')}
            <div class="s-34b24f">
                <strong>Decision:</strong> ${cfg.decision}<br>
                <strong>Interpretation:</strong> ${cfg.interpretation}<br>
                ${cfg.significance}
            </div>
        </div>${cfg.note ? `
        
        <div class="s-afe18c">
            ${cfg.note}
        </div>` : ''}
    </div>`;
}

// the decision text shared by the summary tests
function testDecisionTexts(rejectH0, alternative, subject, claimTwoSided, claimGreater, claimLess) {
    const claim = alternative === 'two.sided' ? claimTwoSided : (alternative === 'greater' ? claimGreater : claimLess);
    return {
        decision: rejectH0 ? 'REJECT the null hypothesis' : 'FAIL TO REJECT the null hypothesis',
        interpretation: rejectH0 ? `There IS sufficient evidence that ${subject} ${claim}.` : `There is NOT sufficient evidence that ${subject} ${claim}.`
    };
}

function significanceLine(pValue, alpha) {
    return pValue < alpha ? `✓ p-value (${pValue.toFixed(6)}) < α (${alpha}) → Statistically significant` : `✗ p-value (${pValue.toFixed(6)}) ≥ α (${alpha}) → Not statistically significant`;
}
