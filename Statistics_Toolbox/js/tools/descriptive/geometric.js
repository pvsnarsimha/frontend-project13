/* geometric: geometric tool (render, compute, setup) */

// ------------------ GEOMETRIC MEAN with product/log safety + detailed steps ------------------
function computeGeometricWithSteps(numbers) {
        if (!numbers.length) return { error: true, message: "No numbers entered. Provide at least one positive value.", value: null };
        const nonPositive = numbers.filter(v => v <= 0);
        if (nonPositive.length > 0) {
            return { error: true, message: `❌ Geometric mean requires ALL values > 0 (strictly positive). Invalid entries: ${nonPositive.join(', ')}`, value: null };
        }
        let n = numbers.length;
        let product = 1;
        let steps = `📉 FORMULA: Geometric Mean = (∏ xᵢ)^{1/n}   (all xᵢ > 0)\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `Data: [${numbers.map(v => v.toFixed(6)).join(", ")}]\n`;
        steps += `n (sample size) = ${n}\n`;
        
        // Safe approach: if product might overflow or is extremely large, use log-sum
        let useLogMethod = false;
        let testProduct = numbers.reduce((acc, v) => acc * Math.abs(v), 1);
        if (testProduct > 1e100 || testProduct === Infinity || numbers.some(v => v === 0)) useLogMethod = true;
        
        if (useLogMethod) {
            let sumLog = numbers.reduce((acc, v) => acc + Math.log(v), 0);
            let geomMean = Math.exp(sumLog / n);
            steps += `Step 1 (log method): Compute natural logs\n`;
            let logTerms = numbers.map(v => `ln(${v.toFixed(6)})`).join(" + ");
            steps += `   Σ ln(xᵢ) = ${logTerms}\n`;
            steps += `            = ${sumLog.toFixed(10)}\n`;
            steps += `Step 2: Divide sum of logs by n → ${sumLog.toFixed(10)} / ${n} = ${(sumLog/n).toFixed(10)}\n`;
            steps += `Step 3: Exponentiate → e^( ${(sumLog/n).toFixed(10)} ) = ${geomMean.toFixed(12)}\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            steps += `✅ Geometric Mean = ${geomMean.toFixed(12)}`;
            return { error: false, value: geomMean, steps: steps };
        } else {
            for (let v of numbers) product *= v;
            let geomMean = Math.pow(product, 1 / n);
            let productExpr = numbers.map(v => v.toFixed(6)).join(" × ");
            steps += `Step 1: Multiply all values together → ${productExpr}\n`;
            steps += `        Product = ${product.toFixed(10)}\n`;
            steps += `Step 2: Raise product to power 1/${n} → (${product.toFixed(10)})^(1/${n})\n`;
            steps += `        = ${geomMean.toFixed(12)}\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            steps += `✅ Geometric Mean = ${geomMean.toFixed(12)}`;
            return { error: false, value: geomMean, steps: steps };
        }
    }

const geometricTool = defineListTool({
    id: 'geometric', interfaceId: 'statGeomInterface', elementPrefix: 'geom',
    title: "📉 Geometric Mean (Multiplicative Average)",
    formula: "📌 GM = (∏ x_i)^{1/n}   (all x_i > 0)",
    desc: "Used for growth rates, ratios, percentages. Always ≤ arithmetic mean for positive data.",
    label: "📋 Enter positive numeric values (growth rates, ratios, or any positive numbers)",
    placeholder: "Example: 1.05, 1.08, 1.02   or   2, 8, 4",
    buttonText: "📉 Calculate Geometric Mean + Steps",
    resultLabel: "📐 GEOMETRIC MEAN RESULT",
    empty: { value: "⚠️ No valid numbers", steps: "Please enter positive numbers for geometric mean." },
    errorValue: "❌ Invalid",
    compute: computeGeometricWithSteps,
    display: r => r.value.toFixed(12)
});
