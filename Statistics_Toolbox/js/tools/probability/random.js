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
    showDistributionParams('random');
}

// ---- Samplers ----
// A random source wraps a uniform generator (seeded when a seed is given). normal() uses the Box-Muller transform,
// which yields two independent normals per pair of uniforms; the second one is kept for the next call.
function createRandomSource(seed) {
    const uniform = seed === null || seed === undefined ? Math.random : seededRandom(seed);
    let spare = null;
    return {
        uniform() { return uniform(); },
        normal() {
            if (spare !== null) { const z = spare; spare = null; return z; }
            const u1 = 1 - uniform(), u2 = uniform();            // 1 - U avoids log(0)
            const r = Math.sqrt(-2 * Math.log(u1));
            spare = r * Math.sin(2 * Math.PI * u2);
            return r * Math.cos(2 * Math.PI * u2);
        }
    };
}

// Gamma(shape, 1) by Marsaglia & Tsang (2000); shapes below 1 use the boost Gamma(a) = Gamma(a + 1) * U^(1/a).
function sampleGamma(shape, source) {
    if (shape < 1) return sampleGamma(shape + 1, source) * Math.pow(1 - source.uniform(), 1 / shape);
    const d = shape - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
        let x, v;
        do { x = source.normal(); v = 1 + c * x; } while (v <= 0);
        v = v * v * v;
        const u = 1 - source.uniform();
        if (u < 1 - 0.0331 * x * x * x * x) return d * v;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
}

function sampleBeta(alpha, beta, source) {
    const x = sampleGamma(alpha, source), y = sampleGamma(beta, source);
    return x / (x + y);
}

function generateRandomNumbers(count, dist, params, source) {
    const numbers = [];
    for (let i = 0; i < count; i++) {
        if (dist === 'normal') {
            numbers.push(params.mean + params.std * source.normal());
        } else if (dist === 'uniform') {
            numbers.push(params.min + source.uniform() * (params.max - params.min));
        } else if (dist === 'exponential') {
            numbers.push(-Math.log(1 - source.uniform()) / params.rate);
        } else if (dist === 'beta') {
            numbers.push(sampleBeta(params.alpha, params.beta, source));
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
    
    const seedText = document.getElementById('randomSeed') ? document.getElementById('randomSeed').value : '';
    const seed = seedText !== '' && !isNaN(parseInt(seedText)) ? parseInt(seedText) : null;
    const source = createRandomSource(seed);
    
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
        steps += `Method: Box-Muller transform (each pair of uniforms gives two independent normals)\n`;
        steps += `Z = μ + σ × √(-2 ln(U₁)) × cos(2πU₂)  and  μ + σ × √(-2 ln(U₁)) × sin(2πU₂)\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params, source);
        
    } else if (dist === 'uniform') {
        params.min = parseFloat(document.getElementById('randomMin').value);
        params.max = parseFloat(document.getElementById('randomMax').value);
        steps += `Parameters: a = ${params.min}, b = ${params.max}\n`;
        steps += `Method: X = a + U × (b - a)\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params, source);
        
    } else if (dist === 'exponential') {
        params.rate = parseFloat(document.getElementById('randomRate').value);
        steps += `Parameters: λ = ${params.rate}\n`;
        steps += `Method: X = -ln(1 - U) / λ\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params, source);
        
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
                    x = source.uniform();
                    y = source.uniform() * maxDensity;
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
            steps += `✓ METHOD: Gamma Ratio (Marsaglia-Tsang Gamma generator, works for all α,β > 0)\n\n`;
            steps += `Why this method?\n`;
            steps += `• One or both shape parameters ≤ 1 → Distribution may be J-shaped or U-shaped\n`;
            steps += `• Gamma ratio method is stable and works for all parameter values\n`;
            steps += `• Based on relationship between Beta and Gamma distributions\n\n`;
            
            steps += `📐 MATHEMATICAL BASIS:\n`;
            steps += `   If X ~ Gamma(α,1) and Y ~ Gamma(β,1) are independent,\n`;
            steps += `   then Z = X/(X+Y) ~ Beta(α,β)\n\n`;
            
            steps += `🔢 ALGORITHM STEPS:\n`;
            steps += `1. Draw X ~ Gamma(α,1) and Y ~ Gamma(β,1) independently using Marsaglia-Tsang\n`;
            steps += `   (d = a - 1/3, c = 1/√(9d); accept d·(1 + c·N)³ for N ~ Normal(0,1) by a squeeze test;\n`;
            steps += `    for a < 1 draw Gamma(a+1) and multiply by U^(1/a))\n`;
            steps += `2. Return Z = X/(X+Y) ~ Beta(α,β)\n\n`;
            
            steps += `🔢 GENERATION PROCESS (showing first 5 samples in detail):\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            
            let samplesShown = 0;
            const maxShowDetails = Math.min(5, count);
            
            for (let i = 0; i < count; i++) {
                const X = sampleGamma(params.alpha, source);
                const Y = sampleGamma(params.beta, source);
                const Z = X / (X + Y);
                randomNumbers.push(Z);
                
                if (samplesShown < maxShowDetails) {
                    steps += `\nSample #${i+1}:\n`;
                    steps += `  Step 1: Draw X ~ Gamma(${params.alpha}, 1) = ${X.toFixed(6)}\n`;
                    steps += `  Step 2: Draw Y ~ Gamma(${params.beta}, 1) = ${Y.toFixed(6)}\n`;
                    steps += `  Step 3: Calculate Z = X/(X+Y) = ${X.toFixed(6)}/(${X.toFixed(6)}+${Y.toFixed(6)}) = ${Z.toFixed(6)}\n`;
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
        randomNumbers = generateRandomNumbers(count, dist, params, source);
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
    
    attachClearHandler('randomClearBtn', ['randomCount', 'randomSeed'], 'randomResultArea');
}
