/* Tool toolkit: declarative definitions for the common "paste a list of numbers, press Calculate" tool.
 *
 * defineListTool({...}) returns { render, setup } with the same markup, element ids and behaviour that were
 * previously copy-pasted into every renderXInterface()/setupXLogic() pair. A tool is now its configuration plus
 * a compute function:
 *
 *   const meanTool = defineListTool({
 *       id: 'mean', interfaceId: 'statMeanInterface',
 *       title: '📐 Arithmetic Mean', formula: 'μ = (Σ xᵢ) / n', desc: '...',
 *       placeholder: 'Example: 12, 45.5, 78', buttonText: '📐 Calculate Mean',
 *       resultLabel: '📊 ARITHMETIC MEAN RESULT',
 *       empty: { value: 'No data', steps: 'Enter numbers ...' },
 *       min: { count: 2, value: '❌ Need at least 2 values', steps: '...' },   // optional
 *       compute: computeMeanWithSteps,        // (numbers) -> { steps, error?, message?, ...values }
 *       display: r => r.value.toFixed(10)     // result -> text shown in the answer tile
 *   });
 *
 * Conventions every compute function follows: return { error: true, message } for bad input (the message says
 * how to fix it) and put the worked solution in `steps`.
 */

// Escape text that comes from the user before it is placed into innerHTML
function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function defineListTool(cfg) {
    const id = cfg.id, elementId = suffix => (cfg.elementPrefix || id) + suffix;

    function render() {
        return `
            <div class="stat-interface" id="${cfg.interfaceId}">
                <div class="interface-title">${cfg.title}</div>
                <div class="formula-card">
                    <div class="formula">${cfg.formula}</div>
                    <div class="desc">${cfg.desc}</div>
                </div>
                <div class="data-input-section">
                    <label>${cfg.label || '📋 Enter numeric values'}</label>
                    <textarea id="${elementId('Input')}" rows="3" placeholder="${cfg.placeholder}"></textarea>
                    <div class="action-row">
                        <button class="primary-btn" id="${elementId('ComputeBtn')}">${cfg.buttonText}</button>
                        <button class="secondary-btn" id="${elementId('ClearBtn')}">Clear</button>
                    </div>
                </div>
                <div id="${elementId('ResultArea')}" style="display: none;">
                    <div class="result-card">
                        <div class="result-label">${cfg.resultLabel}</div>
                        <div class="result-value" id="${elementId('ValueDisplay')}">—</div>
                        <div class="calculation-steps" id="${elementId('StepsDisplay')}">${cfg.stepsPlaceholder || ''}</div>
                    </div>
                </div>
            </div>
        `;
    }

    function setup() {
        const computeBtn = document.getElementById(elementId('ComputeBtn'));
        if (!computeBtn) return;
        computeBtn.addEventListener('click', () => {
            const numbers = parseNumbersFromInput(document.getElementById(elementId('Input')).value);
            const resultDiv = document.getElementById(elementId('ResultArea'));
            const valueSpan = document.getElementById(elementId('ValueDisplay'));
            const stepsSpan = document.getElementById(elementId('StepsDisplay'));
            resultDiv.style.display = 'block';
            if (!numbers.length) {
                valueSpan.innerText = cfg.empty.value;
                stepsSpan.innerText = cfg.empty.steps;
                return;
            }
            if (cfg.min && numbers.length < cfg.min.count) {
                valueSpan.innerText = cfg.min.value;
                stepsSpan.innerText = cfg.min.steps;
                return;
            }
            const result = cfg.compute(numbers);
            if (result.error) {
                valueSpan.innerText = cfg.errorValue || 'Error';
                stepsSpan.innerText = result.message;
                return;
            }
            valueSpan.innerText = cfg.display(result);
            stepsSpan.innerText = result.steps;
        });
        attachClearHandler(elementId('ClearBtn'), elementId('Input'), elementId('ResultArea'));
    }

    return { render, setup };
}
