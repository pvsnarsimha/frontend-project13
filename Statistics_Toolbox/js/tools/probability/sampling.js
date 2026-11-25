/* Sampling: the sampling distribution of the mean / central limit theorem (render, compute, setup) */

// Populations to sample from. Each: name, range [lo, hi] for drawing, pdf, mean mu, standard deviation sigma, and draw(uniform) -> one value.
const SAMPLING_POPULATIONS = (() => {
    const normalDraw = (u, mean, sd) => mean + sd * Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
    const npdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
    return {
        skewed: { label: 'Skewed to the right (exponential)', name: 'a population skewed to the right, nothing like a bell', lo: 0, hi: 5, mu: 1, sigma: 1, pdf: x => (x < 0 ? 0 : Math.exp(-x)), draw: u => -Math.log(1 - u()) },
        uniform: { label: 'Flat (uniform from 0 to 1)', name: 'a flat population, where every value from 0 to 1 is equally likely', lo: 0, hi: 1, mu: 0.5, sigma: Math.sqrt(1 / 12), pdf: x => (x >= 0 && x <= 1 ? 1 : 0), draw: u => u() },
        bimodal: { label: 'Two humps (bimodal)', name: 'a population with two separate humps', lo: 0, hi: 1, mu: 0.5, sigma: Math.sqrt(0.07 ** 2 + 0.25 ** 2),
            pdf: x => 0.5 * npdf(x, 0.25, 0.07) + 0.5 * npdf(x, 0.75, 0.07), draw: u => normalDraw(u, u() < 0.5 ? 0.25 : 0.75, 0.07) },
        normal: { label: 'Bell-shaped (normal)', name: 'a bell-shaped population', lo: 0, hi: 1, mu: 0.5, sigma: 0.15, pdf: x => npdf(x, 0.5, 0.15), draw: u => normalDraw(u, 0.5, 0.15) }
    };
})();

function renderSamplingInterface() {
    return buildInterface({
        id: "statSamplingInterface",
        parameterOnly: true,
        title: "🎱 Sampling and the Central Limit Theorem",
        formula: "📌 Sample means follow N(μ, σ/√n) whatever the population looks like (for large enough n)",
        desc: "Draw many random samples from a population, take the mean of each, and watch the means pile up into a bell shape.",
        inputs: [
            { label: "🌍 Population to sample from:", select: { id: "samplingPopulation", style: FIELD_STYLE }, options: Object.entries(SAMPLING_POPULATIONS).map(([k, p]) => [k, p.label, k === 'skewed']) },
            { label: "🔢 Sample size n (values in each sample):", input: { type: "number", id: "samplingN", value: "30", min: "2", max: "200", style: FIELD_STYLE } },
            { label: "🔁 Number of samples to draw:", input: { type: "number", id: "samplingK", value: "1000", min: "30", max: "5000", style: FIELD_STYLE } },
            { label: "🌱 Random seed (optional, to repeat the same run):", input: { type: "number", id: "samplingSeed", placeholder: "Leave empty for random", style: FIELD_STYLE } }
        ],
        run: { id: "samplingComputeBtn", text: "🎱 Draw Samples + Watch the Bell Form" },
        clear: { id: "samplingClearBtn", text: "Clear" },
        result: { area: "samplingResultArea", label: "🎯 SAMPLING DISTRIBUTION OF THE MEAN", value: "samplingValueDisplay", steps: "samplingStepsDisplay" }
    });
}

// Pure: draws k samples of size n and returns the sample means with the summary numbers (seed null = unseeded)
function computeSamplingDistribution(popKey, n, k, seed) {
    const pop = SAMPLING_POPULATIONS[popKey];
    if (!pop) return { error: true, message: "Choose a population." };
    if (!Number.isInteger(n) || n < 2 || n > 200) return { error: true, message: "Sample size n must be a whole number from 2 to 200." };
    if (!Number.isInteger(k) || k < 30 || k > 5000) return { error: true, message: "The number of samples must be a whole number from 30 to 5000." };
    const u = seed === null || seed === undefined || !Number.isFinite(seed) ? Math.random : seededRandom(seed);
    const means = [];
    for (let i = 0; i < k; i++) { let s = 0; for (let j = 0; j < n; j++) s += pop.draw(u); means.push(s / n); }
    const meanOfMeans = means.reduce((a, b) => a + b, 0) / k;
    const sdOfMeans = Math.sqrt(means.reduce((a, b) => a + (b - meanOfMeans) ** 2, 0) / (k - 1));
    const theorySd = pop.sigma / Math.sqrt(n);
    const steps = `📐 THE CENTRAL LIMIT THEOREM\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Population: ${pop.label}\n   mean μ = ${pop.mu.toFixed(4)}, standard deviation σ = ${pop.sigma.toFixed(4)}\n\n` +
        `Step 1: Draw ${k} random samples, each of ${n} values.\nStep 2: Take the mean of each sample (${k} sample means).\n` +
        `Step 3: Look at those ${k} means:\n   mean of the sample means = ${meanOfMeans.toFixed(4)}   (theory: μ = ${pop.mu.toFixed(4)})\n` +
        `   SD of the sample means   = ${sdOfMeans.toFixed(4)}   (theory: σ / √n = ${pop.sigma.toFixed(4)} / √${n} = ${theorySd.toFixed(4)})\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ The means centre on μ and spread by σ / √n, in a bell shape.`;
    return { means, meanOfMeans, sdOfMeans, theorySd, pop, popKey, n, k, steps };
}

function setupSamplingLogic() {
    const btn = document.getElementById("samplingComputeBtn");
    if (!btn) return;
    btn.addEventListener('click', () => {
        const resultDiv = document.getElementById("samplingResultArea"), valueSpan = document.getElementById("samplingValueDisplay"), stepsSpan = document.getElementById("samplingStepsDisplay");
        const seedText = document.getElementById("samplingSeed").value.trim();
        const r = computeSamplingDistribution(document.getElementById("samplingPopulation").value, parseInt(document.getElementById("samplingN").value, 10), parseInt(document.getElementById("samplingK").value, 10), seedText === '' ? null : parseFloat(seedText));
        resultDiv.style.display = "block";
        hideTutorCard('clt');
        if (r.error) { valueSpan.innerText = "Error"; setHtml(stepsSpan, '⚠️ ' + escapeHtml(r.message)); return; }
        valueSpan.innerText = `Mean of means = ${r.meanOfMeans.toFixed(4)} | SD of means = ${r.sdOfMeans.toFixed(4)} | σ/√n = ${r.theorySd.toFixed(4)}`;
        stepsSpan.innerText = r.steps;
        showSamplingAnimation("samplingResultArea", r);
    });
    attachClearHandler("samplingClearBtn", ["samplingSeed"], "samplingResultArea");
}
