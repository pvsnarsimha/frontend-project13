/* Random: random tool (render, compute, setup) */

function renderRandomInterface() {
    return buildInterface({
        id: "statRandomInterface",
        title: "🎲 Random Number Generation",
        formula: "📌 Generate random samples from specified distributions",
        desc: "Generate random numbers following specific probability distributions.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: { id: "randomDistribution", style: FIELD_STYLE },
                options: DISTRIBUTION_OPTIONS
            },
            {
                html: "<div id=\"randomParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            },
            {
                label: "🔢 Number of Random Values to Generate:",
                input: {
                    type: "number",
                    id: "randomCount",
                    value: "10",
                    min: "1",
                    max: "1000",
                    style: FIELD_STYLE
                }
            },
            {
                label: "🔢 Random Seed (optional, for reproducibility):",
                input: {
                    type: "number",
                    id: "randomSeed",
                    placeholder: "Leave empty for random",
                    style: FIELD_STYLE
                }
            }
        ],
        run: { id: "randomComputeBtn", text: "🎲 Generate Random Numbers + Steps" },
        clear: { id: "randomClearBtn", text: "Clear" },
        result: {
            area: "randomResultArea",
            label: "🎯 RANDOM NUMBERS GENERATED",
            value: "randomValueDisplay",
            steps: "randomStepsDisplay"
        }
    });
}

// ========== RANDOM NUMBER GENERATION FUNCTIONS ==========
function updateRandomParams() {
    const dist = document.getElementById('randomDistribution').value;
    const paramsDiv = document.getElementById('randomParams');
    
    if (dist === 'normal') {
        setHtml(paramsDiv, `
            <label>📊 Mean (μ):</label>
            <input type="number" id="randomMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="randomStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'uniform') {
        setHtml(paramsDiv, `
            <label>📊 Minimum (a):</label>
            <input type="number" id="randomMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="randomMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'exponential') {
        setHtml(paramsDiv, `
            <label>📊 Rate (λ):</label>
            <input type="number" id="randomRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'beta') {
        setHtml(paramsDiv, `
            <label>📊 Alpha (α):</label>
            <input type="number" id="randomAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="randomBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    }
}

function generateRandomNumbers(count, dist, params) {
    let numbers = [];
    
    // Set seed if provided
    const seedInput = document.getElementById('randomSeed');
    if (seedInput && seedInput.value) {
        const seed = parseInt(seedInput.value);
        if (!isNaN(seed)) {
            // Simple seeded random generator
            let seedValue = seed;
            const seededRandom = () => {
                seedValue = (seedValue * 9301 + 49297) % 233280;
                return seedValue / 233280;
            };
            
            for (let i = 0; i < count; i++) {
                const u = seededRandom();
                if (dist === 'normal') {
                    // Box-Muller transform
                    const u1 = seededRandom();
                    const u2 = seededRandom();
                    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                    numbers.push(params.mean + params.std * z0);
                } else if (dist === 'uniform') {
                    numbers.push(params.min + u * (params.max - params.min));
                } else if (dist === 'exponential') {
                    numbers.push(-Math.log(1 - u) / params.rate);
                } else if (dist === 'beta') {
                    // Beta distribution approximation using Gamma
                    let x = Math.pow(u, 1/params.alpha);
                    numbers.push(x);
                }
            }
        }
    } else {
        // Standard random generation
        for (let i = 0; i < count; i++) {
            if (dist === 'normal') {
                // Box-Muller transform
                const u1 = Math.random();
                const u2 = Math.random();
                const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                numbers.push(params.mean + params.std * z0);
            } else if (dist === 'uniform') {
                numbers.push(params.min + Math.random() * (params.max - params.min));
            } else if (dist === 'exponential') {
                numbers.push(-Math.log(1 - Math.random()) / params.rate);
            } else if (dist === 'beta') {
    // Enhanced Beta generation using acceptance-rejection method
    const alpha = params.alpha;
    const beta = params.beta;
    
    // For α,β > 1, use efficient method
    if (alpha > 1 && beta > 1) {
        const mode = (alpha - 1) / (alpha + beta - 2);
        const maxDensity = betaPDF(mode, alpha, beta);
        
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.random(); // Uniform [0,1]
                y = Math.random() * maxDensity; // Scale to max density
            } while (y > betaPDF(x, alpha, beta));
            numbers.push(x);
        }
    } else {
        // For other cases, use Gamma ratio method
        for (let i = 0; i < count; i++) {
            let u = Math.random();
            let v = Math.random();
            let x = Math.pow(u, 1/alpha);
            let y = Math.pow(v, 1/beta);
            numbers.push(x / (x + y));
        }
    }
}

        }
    }
    
    return numbers;
}

function computeRandomWithSteps() {
    const dist = document.getElementById('randomDistribution').value;
    const count = parseInt(document.getElementById('randomCount').value);
    
    if (isNaN(count) || count < 1) {
        return { error: true, message: "Please enter a valid number of values to generate (minimum 1)." };
    }
    
    if (count > 1000) {
        return { error: true, message: "Maximum 1000 values can be generated at once." };
    }
    
    let params = {};
    let steps = `🎲 RANDOM NUMBER GENERATION\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Distribution: ${dist.toUpperCase()}\n`;
    steps += `Number of values: ${count}\n\n`;
    
    // DECLARE randomNumbers HERE (in outer scope)
    let randomNumbers = [];
    
    if (dist === 'normal') {
        params.mean = parseFloat(document.getElementById('randomMean').value);
        params.std = parseFloat(document.getElementById('randomStd').value);
        steps += `Parameters: μ = ${params.mean}, σ = ${params.std}\n`;
        steps += `Method: Box-Muller transform\n`;
        steps += `Z = μ + σ × √(-2 ln(U₁)) × cos(2πU₂)\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params);
        
    } else if (dist === 'uniform') {
        params.min = parseFloat(document.getElementById('randomMin').value);
        params.max = parseFloat(document.getElementById('randomMax').value);
        steps += `Parameters: a = ${params.min}, b = ${params.max}\n`;
        steps += `Method: X = a + U × (b - a)\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params);
        
    } else if (dist === 'exponential') {
        params.rate = parseFloat(document.getElementById('randomRate').value);
        steps += `Parameters: λ = ${params.rate}\n`;
        steps += `Method: X = -ln(1 - U) / λ\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params);
        
    } else if (dist === 'beta') {
        params.alpha = parseFloat(document.getElementById('randomAlpha').value);
        params.beta = parseFloat(document.getElementById('randomBeta').value);
        
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `🎲 BETA DISTRIBUTION RANDOM NUMBER GENERATION\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `Parameters: α (shape1) = ${params.alpha}, β (shape2) = ${params.beta}\n\n`;
        
        // Calculate distribution statistics
        const theoreticalMean = params.alpha / (params.alpha + params.beta);
        const theoreticalVar = (params.alpha * params.beta) / ((params.alpha + params.beta) ** 2 * (params.alpha + params.beta + 1));
        const theoreticalStd = Math.sqrt(theoreticalVar);
        const mode = (params.alpha > 1 && params.beta > 1) ? (params.alpha - 1) / (params.alpha + params.beta - 2) : null;
        
        steps += `📊 DISTRIBUTION CHARACTERISTICS:\n`;
        steps += `• Mean (μ) = α/(α+β) = ${params.alpha}/${params.alpha+params.beta} = ${theoreticalMean.toFixed(6)}\n`;
        steps += `• Variance (σ²) = ${theoreticalVar.toFixed(6)}\n`;
        steps += `• Standard Deviation (σ) = ${theoreticalStd.toFixed(6)}\n`;
        if (mode) steps += `• Mode (peak) = (α-1)/(α+β-2) = ${mode.toFixed(6)}\n`;
        steps += `• Support (domain) = [0, 1] (proportions, probabilities, percentages)\n\n`;
        
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `🔬 GENERATION METHOD SELECTION\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        // Generate the random numbers and store in randomNumbers array
        randomNumbers = [];
        
        if (params.alpha > 1 && params.beta > 1) {
            steps += `✓ METHOD: Acceptance-Rejection Sampling (Best for α>1, β>1)\n\n`;
            steps += `Why this method?\n`;
            steps += `• Both shape parameters > 1 → Distribution is unimodal (has a single peak)\n`;
            steps += `• The mode (peak) provides a good bounding constant for rejection sampling\n`;
            steps += `• Efficient for generating values from the target distribution\n\n`;
            
            steps += `📐 ALGORITHM STEPS:\n`;
            steps += `1. Calculate the mode (peak) of the Beta distribution\n`;
            steps += `   Mode = (α-1)/(α+β-2) = ${mode.toFixed(6)}\n\n`;
            
            const maxDensity = betaPDF(mode, params.alpha, params.beta);
            steps += `2. Calculate maximum density at the mode:\n`;
            steps += `   f(mode) = f(${mode.toFixed(6)}) = ${maxDensity.toFixed(6)}\n\n`;
            
            steps += `3. For each random number to generate:\n`;
            steps += `   a) Generate candidate x ~ Uniform(0,1)\n`;
            steps += `   b) Generate y ~ Uniform(0, ${maxDensity.toFixed(6)})\n`;
            steps += `   c) Accept x if y ≤ f(x), otherwise reject and repeat\n`;
            steps += `   d) This ensures samples follow the Beta(α,β) distribution\n\n`;
            
            steps += `🔢 GENERATION PROCESS (showing first 5 samples in detail):\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            
            let samplesShown = 0;
            const maxShowDetails = Math.min(5, count);
            
            for (let i = 0; i < count; i++) {
                let x, y, attempts = 0;
                do {
                    x = Math.random();
                    y = Math.random() * maxDensity;
                    attempts++;
                } while (y > betaPDF(x, params.alpha, params.beta));
                randomNumbers.push(x);
                
                if (samplesShown < maxShowDetails) {
                    steps += `\nSample #${i+1}:\n`;
                    steps += `  Attempts needed: ${attempts}\n`;
                    steps += `  • Generated candidate x = ${x.toFixed(6)}\n`;
                    steps += `  • Generated y = ${y.toFixed(6)}\n`;
                    steps += `  • f(x) = ${betaPDF(x, params.alpha, params.beta).toFixed(6)}\n`;
                    steps += `  • y ≤ f(x)? ${y <= betaPDF(x, params.alpha, params.beta) ? '✓ YES → ACCEPTED' : '✗ NO → REJECTED'}\n`;
                    steps += `  • Final value = ${x.toFixed(6)}\n`;
                    samplesShown++;
                }
            }
            
            if (count > maxShowDetails) {
                steps += `\n... and ${count - maxShowDetails} more values generated similarly ...\n`;
            }
            
        } else {
            steps += `✓ METHOD: Gamma Ratio Transformation (Works for all α,β > 0)\n\n`;
            steps += `Why this method?\n`;
            steps += `• One or both shape parameters ≤ 1 → Distribution may be J-shaped or U-shaped\n`;
            steps += `• Gamma ratio method is more stable and works for all parameter values\n`;
            steps += `• Based on relationship between Beta and Gamma distributions\n\n`;
            
            steps += `📐 MATHEMATICAL BASIS:\n`;
            steps += `   If X ~ Gamma(α,1) and Y ~ Gamma(β,1) are independent,\n`;
            steps += `   then Z = X/(X+Y) ~ Beta(α,β)\n\n`;
            
            steps += `🔢 ALGORITHM STEPS:\n`;
            steps += `1. Generate U ~ Uniform(0,1)\n`;
            steps += `2. Generate V ~ Uniform(0,1) (independent)\n`;
            steps += `3. Transform using Gamma quantile:\n`;
            steps += `   X = (-ln(U))^(1/α)  [approximation for Gamma(α,1)]\n`;
            steps += `   Y = (-ln(V))^(1/β)  [approximation for Gamma(β,1)]\n`;
            steps += `4. Return Z = X/(X+Y) ~ Beta(α,β)\n\n`;
            
            steps += `🔢 GENERATION PROCESS (showing first 5 samples in detail):\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            
            let samplesShown = 0;
            const maxShowDetails = Math.min(5, count);
            
            for (let i = 0; i < count; i++) {
                const u = Math.random();
                const v = Math.random();
                const X = Math.pow(-Math.log(u), 1/params.alpha);
                const Y = Math.pow(-Math.log(v), 1/params.beta);
                const Z = X / (X + Y);
                randomNumbers.push(Z);
                
                if (samplesShown < maxShowDetails) {
                    steps += `\nSample #${i+1}:\n`;
                    steps += `  Step 1: Generate U = ${u.toFixed(6)}\n`;
                    steps += `  Step 2: Generate V = ${v.toFixed(6)}\n`;
                    steps += `  Step 3: Calculate X = (-ln(${u.toFixed(6)}))^(1/${params.alpha}) = ${X.toFixed(6)}\n`;
                    steps += `  Step 4: Calculate Y = (-ln(${v.toFixed(6)}))^(1/${params.beta}) = ${Y.toFixed(6)}\n`;
                    steps += `  Step 5: Calculate Z = X/(X+Y) = ${X.toFixed(6)}/(${X.toFixed(6)}+${Y.toFixed(6)}) = ${Z.toFixed(6)}\n`;
                    steps += `  ✓ Generated Beta(α=${params.alpha}, β=${params.beta}) value = ${Z.toFixed(6)}\n`;
                    samplesShown++;
                }
            }
            
            if (count > maxShowDetails) {
                steps += `\n... and ${count - maxShowDetails} more values generated similarly ...\n`;
            }
        }
        
        steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `📊 GENERATION SUMMARY\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        // Calculate sample statistics from generated numbers
        const sampleMean = randomNumbers.reduce((a,b) => a+b, 0) / randomNumbers.length;
        const sampleVar = randomNumbers.reduce((a,b) => a + Math.pow(b - sampleMean, 2), 0) / randomNumbers.length;
        const sampleStd = Math.sqrt(sampleVar);
        const sampleMin = Math.min(...randomNumbers);
        const sampleMax = Math.max(...randomNumbers);
        
        steps += `Sample Statistics (based on generated values):\n`;
        steps += `• Sample Mean = ${sampleMean.toFixed(6)} (theoretical: ${theoreticalMean.toFixed(6)})\n`;
        steps += `• Sample Std Dev = ${sampleStd.toFixed(6)} (theoretical: ${theoreticalStd.toFixed(6)})\n`;
        steps += `• Sample Min = ${sampleMin.toFixed(6)} (theoretical: 0)\n`;
        steps += `• Sample Max = ${sampleMax.toFixed(6)} (theoretical: 1)\n`;
        steps += `• Sample Range = ${(sampleMax - sampleMin).toFixed(6)}\n`;
        
        steps += `\n💡 QUALITY CHECK:\n`;
        const meanDiff = Math.abs(sampleMean - theoreticalMean);
        if (meanDiff < 0.05 * theoreticalStd) {
            steps += `✓ Sample mean is close to theoretical mean → Good approximation\n`;
        } else {
            steps += `⚠ Sample mean differs from theoretical mean. Try generating more samples.\n`;
        }
        
        steps += `\n🎯 PRACTICAL APPLICATIONS:\n`;
        steps += `• These random values follow a Beta(${params.alpha},${params.beta}) distribution\n`;
        steps += `• Can be used for: Monte Carlo simulation, Bayesian inference, A/B testing\n`;
        steps += `• Values represent: probabilities, proportions, percentages, rates\n`;
    }
    
    // If randomNumbers is still empty (shouldn't happen), generate generic
    if (randomNumbers.length === 0) {
        randomNumbers = generateRandomNumbers(count, dist, params);
    }
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ RANDOM NUMBERS GENERATED:\n`;
    steps += randomNumbers.map(n => n.toFixed(6)).join(', ');
    
    // Calculate summary statistics for the result display
    const sum = randomNumbers.reduce((a,b) => a+b, 0);
    const mean = sum / count;
    const min = Math.min(...randomNumbers);
    const max = Math.max(...randomNumbers);
    const variance = randomNumbers.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    
    steps += `\n\n📊 Summary Statistics:\n`;
    steps += `  Mean: ${mean.toFixed(6)}\n`;
    steps += `  Standard Deviation: ${stdDev.toFixed(6)}\n`;
    steps += `  Minimum: ${min.toFixed(6)}\n`;
    steps += `  Maximum: ${max.toFixed(6)}\n`;
    steps += `  Range: ${(max - min).toFixed(6)}\n`;
    
    return { randomNumbers, steps, resultStr: randomNumbers.map(n => n.toFixed(4)).join(', ') };
}

function setupRandomLogic() {
    const distSelect = document.getElementById('randomDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateRandomParams);
        updateRandomParams();
    }
    
    const computeBtn = document.getElementById('randomComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computeRandomWithSteps();
            const resultDiv = document.getElementById('randomResultArea');
            const valueSpan = document.getElementById('randomValueDisplay');
            const stepsSpan = document.getElementById('randomStepsDisplay');
            
            if (result.error) {
                resultDiv.style.display = 'block';
                valueSpan.innerText = 'Error';
                stepsSpan.innerText = result.message;
            } else {
                resultDiv.style.display = 'block';
                valueSpan.innerText = result.resultStr;
                stepsSpan.innerText = result.steps;
            }
        });
    }
    
    attachClearHandler('randomClearBtn', 'randomCount', 'randomResultArea');
}
