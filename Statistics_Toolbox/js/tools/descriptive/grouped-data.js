/* GroupedData: statistics from a frequency table or from class intervals (render, compute, setup). The textbook way to describe data that
   arrives as "value, how many times" or "class interval, how many values". */

function renderGroupedDataInterface() {
    return buildInterface({
        id: "statGroupedDataInterface",
        title: "📚 Frequency Table & Grouped Data Statistics",
        formula: "📌 x̄ = Σfx / n   |   Median = L + [(n/2 − cf) / f] × w   |   s² = Σf(x − x̄)² / (n − 1)",
        desc: "For data given as a frequency table (value, frequency) or as class intervals (lower–upper, frequency). Mean, median, mode, quartiles, variance and standard deviation with the textbook formulas, plus the histogram, frequency polygon and ogive.",
        inputs: [
            {
                label: "📋 One row per line: either <b>value, frequency</b> or <b>lower-upper, frequency</b> (class interval):",
                textarea: { id: "groupedInput", rows: "6", placeholder: "Example: 10-20, 5&#10;20-30, 8&#10;30-40, 12&#10;40-50, 15&#10;50-60, 10" }
            },
            {
                hint: "Class intervals can be written 10-20, 10–20, 10 to 20 or 10, 20, 5 (lower, upper, frequency). Classes written with gaps (10-19, 20-29) are converted to class boundaries (9.5-19.5, 19.5-29.5) automatically. A frequency table is a list such as: 2, 5 / 3, 8 / 4, 6 (the value 2 occurs 5 times, ...).",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "groupedComputeBtn", text: "📚 Calculate Statistics + Graphs" },
        clear: { id: "groupedClearBtn", text: "Clear" },
        result: { area: "groupedResultArea", label: "🎯 FREQUENCY TABLE RESULTS", value: "groupedValueDisplay", steps: "groupedStepsDisplay" }
    });
}

// ========== PARSING ==========
// Returns { type: 'classes' | 'values', rows } or { error: true, message }
function parseFrequencyTable(text) {
    const NUM = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)';
    const range = new RegExp(`^\\s*(${NUM})\\s*(?:-|–|—|to)\\s*(${NUM})\\s*[,:;\\s]\\s*(${NUM})\\s*$`, 'i');
    const rows = [], bad = [];
    let kind = null;
    String(text || '').replace(/−/g, '-').split(/\r?\n/).forEach(raw => {
        const line = raw.trim();
        if (!line) return;
        let m = line.match(range), row = null, rowKind = null;
        if (m) { row = { lower: parseFloat(m[1]), upper: parseFloat(m[2]), f: parseFloat(m[3]) }; rowKind = 'classes'; }
        else {
            const nums = line.split(/[,;\s]+/).filter(Boolean);
            if (nums.length >= 2 && nums.every(t => new RegExp(`^${NUM}$`).test(t))) {
                const v = nums.map(Number);
                if (v.length === 3) { row = { lower: v[0], upper: v[1], f: v[2] }; rowKind = 'classes'; }
                else if (v.length === 2) { row = { value: v[0], f: v[1] }; rowKind = 'values'; }
            }
        }
        if (!row || !Number.isFinite(row.f)) { bad.push(line); return; }
        if (kind && kind !== rowKind) { bad.push(line + '   (mixes class intervals with single values)'); return; }
        kind = rowKind;
        rows.push(row);
    });
    if (bad.length) return { error: true, message: `Could not read: ${bad.slice(0, 4).join(' | ')}${bad.length > 4 ? ' …' : ''}. Each line must be "value, frequency" or "lower-upper, frequency".` };
    if (!rows.length) return { error: true, message: "Enter at least one row: value, frequency (or lower-upper, frequency)." };
    return { type: kind, rows };
}

// ========== COMPUTATION ==========
const fgd = (v, d = 4) => (Number.isInteger(v) ? String(v) : v.toFixed(d));
const padGd = (s, w) => String(s).padStart(w, ' ');

function computeGroupedDataWithSteps(inputText) {
    const parsed = typeof inputText === 'string' ? parseFrequencyTable(inputText) : inputText;
    if (parsed.error) return parsed;
    if (parsed.rows.some(r => !(r.f >= 0))) return { error: true, message: "Every frequency must be a number that is 0 or greater." };
    return parsed.type === 'classes' ? groupedClassStatistics(parsed.rows) : frequencyValueStatistics(parsed.rows);
}

// ---- single values with frequencies ----
function frequencyValueStatistics(rawRows) {
    const byValue = new Map();
    rawRows.forEach(r => byValue.set(r.value, (byValue.get(r.value) || 0) + r.f));
    const rows = [...byValue.entries()].sort((a, b) => a[0] - b[0]).map(([value, f]) => ({ value, f }));
    const n = rows.reduce((s, r) => s + r.f, 0);
    if (!(n > 0)) return { error: true, message: "The frequencies add up to 0, so there is no data." };
    let cum = 0;
    rows.forEach(r => { cum += r.f; r.cf = cum; r.fx = r.f * r.value; });
    const mean = rows.reduce((s, r) => s + r.fx, 0) / n;
    rows.forEach(r => { r.dev = r.f * (r.value - mean) * (r.value - mean); });
    const ss = rows.reduce((s, r) => s + r.dev, 0);
    const popVar = ss / n, sampleVar = n > 1 ? ss / (n - 1) : NaN;
    // order statistic number j (1-based) of the expanded data, read from the cumulative frequencies
    const orderStat = j => (rows.find(r => r.cf >= j) || rows[rows.length - 1]).value;
    const type7 = p => { const h = (n - 1) * p, lo = Math.floor(h), hi = Math.ceil(h); const a = orderStat(lo + 1), b = orderStat(hi + 1); return a + (h - lo) * (b - a); };
    const [q1, median, q3] = [type7(0.25), type7(0.5), type7(0.75)];
    const maxF = Math.max(...rows.map(r => r.f)), modes = rows.filter(r => r.f === maxF).map(r => r.value);
    const min = rows[0].value, max = rows[rows.length - 1].value;
    const integerN = Number.isInteger(n);

    let steps = `📚 FREQUENCY TABLE STATISTICS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Step 1: The table (f = frequency, cf = cumulative frequency)\n`;
    steps += `   ${padGd('x', 10)} ${padGd('f', 7)} ${padGd('cf', 7)} ${padGd('f·x', 12)} ${padGd('f(x−x̄)²', 14)}\n`;
    rows.forEach(r => { steps += `   ${padGd(fgd(r.value), 10)} ${padGd(fgd(r.f), 7)} ${padGd(fgd(r.cf), 7)} ${padGd(fgd(r.fx), 12)} ${padGd(r.dev.toFixed(4), 14)}\n`; });
    steps += `   ${padGd('Total', 10)} ${padGd(fgd(n), 7)} ${padGd('', 7)} ${padGd(fgd(rows.reduce((s, r) => s + r.fx, 0)), 12)} ${padGd(ss.toFixed(4), 14)}\n\n`;
    steps += `Step 2: Mean   x̄ = Σfx / n = ${fgd(rows.reduce((s, r) => s + r.fx, 0))} / ${fgd(n)} = ${mean.toFixed(6)}\n\n`;
    steps += `Step 3: Median and quartiles (the same Type 7 rule as every other tool, read from the cumulative frequencies)\n`;
    steps += `   Q₁ = ${q1.toFixed(6)}    Median = ${median.toFixed(6)}    Q₃ = ${q3.toFixed(6)}    IQR = ${(q3 - q1).toFixed(6)}\n\n`;
    steps += `Step 4: Mode = the value with the largest frequency (${fgd(maxF)}): ${modes.length === rows.length && rows.length > 1 ? 'every value occurs equally often, so there is no single mode' : modes.join(', ')}\n\n`;
    steps += `Step 5: Spread\n   Range = ${fgd(max)} − ${fgd(min)} = ${fgd(max - min)}\n`;
    steps += `   Population variance σ² = Σf(x−x̄)² / n = ${ss.toFixed(6)} / ${fgd(n)} = ${popVar.toFixed(6)},  σ = ${Math.sqrt(popVar).toFixed(6)}\n`;
    steps += Number.isFinite(sampleVar) ? `   Sample variance     s² = Σf(x−x̄)² / (n−1) = ${ss.toFixed(6)} / ${fgd(n - 1)} = ${sampleVar.toFixed(6)},  s = ${Math.sqrt(sampleVar).toFixed(6)}\n` : `   Sample variance needs at least 2 observations.\n`;
    steps += `\n✅ n = ${fgd(n)} | mean = ${mean.toFixed(4)} | median = ${median.toFixed(4)} | s = ${Number.isFinite(sampleVar) ? Math.sqrt(sampleVar).toFixed(4) : 'n/a'}`;
    return {
        type: 'values', n, mean, median, q1, q3, iqr: q3 - q1, modes, min, max, range: max - min, populationVariance: popVar, sampleVariance: sampleVar,
        sampleStdDev: Math.sqrt(sampleVar), populationStdDev: Math.sqrt(popVar), steps, summary: `n = ${fgd(n)} | x̄ = ${mean.toFixed(4)} | median = ${median.toFixed(4)} | s = ${Number.isFinite(sampleVar) ? Math.sqrt(sampleVar).toFixed(4) : 'n/a'}`,
        chart: { labels: rows.map(r => fgd(r.value)), freqs: rows.map(r => r.f), midpoints: rows.map(r => r.value), cumulative: rows.map(r => r.cf), discrete: true }, integerN
    };
}

// ---- class intervals ----
function groupedClassStatistics(rawRows) {
    const rows = rawRows.map(r => ({ ...r })).sort((a, b) => a.lower - b.lower);
    for (const r of rows) if (!(r.lower < r.upper)) return { error: true, message: `The class ${r.lower}–${r.upper} has no width: the lower limit must be smaller than the upper limit.` };
    // gaps between written limits (10-19, 20-29): convert to class boundaries by moving every limit half a gap outward
    const gaps = rows.slice(1).map((r, i) => r.lower - rows[i].upper);
    if (gaps.some(g => g < -1e-12)) return { error: true, message: "Class intervals must not overlap: a class starts before the previous one ends." };
    const positive = gaps.filter(g => g > 1e-12);
    let adjusted = false;
    if (positive.length) {
        if (positive.length !== gaps.length || positive.some(g => Math.abs(g - positive[0]) > 1e-9)) return { error: true, message: "The classes have gaps of different sizes between them. Write them touching (10-20, 20-30, ...) or with one equal gap (10-19, 20-29, ...)." };
        const half = positive[0] / 2;
        rows.forEach(r => { r.lower -= half; r.upper += half; });
        adjusted = true;
    }
    const n = rows.reduce((s, r) => s + r.f, 0);
    if (!(n > 0)) return { error: true, message: "The frequencies add up to 0, so there is no data." };
    let cum = 0;
    rows.forEach(r => { r.w = r.upper - r.lower; r.m = (r.lower + r.upper) / 2; r.cfBefore = cum; cum += r.f; r.cf = cum; r.fm = r.f * r.m; });
    const mean = rows.reduce((s, r) => s + r.fm, 0) / n;
    rows.forEach(r => { r.dev = r.f * (r.m - mean) * (r.m - mean); });
    const ss = rows.reduce((s, r) => s + r.dev, 0);
    const popVar = ss / n, sampleVar = n > 1 ? ss / (n - 1) : NaN;
    // value below which a fraction p of the data lies, by linear interpolation inside the class that holds it: L + ((p·n − cf) / f) × w
    const percentileClass = p => rows.find(r => r.cf >= p * n && r.f > 0) || rows[rows.length - 1];
    const percentile = p => { const c = percentileClass(p); return c.lower + ((p * n - c.cfBefore) / c.f) * c.w; };
    const [q1, median, q3] = [percentile(0.25), percentile(0.5), percentile(0.75)];
    const mc = rows.reduce((best, r) => (r.f > best.f ? r : best), rows[0]);
    const idx = rows.indexOf(mc), f0 = idx > 0 ? rows[idx - 1].f : 0, f2 = idx < rows.length - 1 ? rows[idx + 1].f : 0;
    const modeDen = 2 * mc.f - f0 - f2;
    const mode = modeDen > 0 ? mc.lower + ((mc.f - f0) / modeDen) * mc.w : mc.m;
    const equalWidth = rows.every(r => Math.abs(r.w - rows[0].w) < 1e-9);
    const label = r => `${fgd(r.lower)}–${fgd(r.upper)}`;

    let steps = `📚 GROUPED DATA STATISTICS (class intervals)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    if (adjusted) steps += `Note: the classes were written with gaps, so they were converted to class boundaries (each limit moved half a gap outward, e.g. 10–19 and 20–29 become 9.5–19.5 and 19.5–29.5).\n\n`;
    steps += `Step 1: The table (m = class midpoint, f = frequency, cf = cumulative frequency)\n`;
    steps += `   ${padGd('Class', 14)} ${padGd('f', 7)} ${padGd('cf', 7)} ${padGd('m', 10)} ${padGd('f·m', 12)} ${padGd('f(m−x̄)²', 14)}\n`;
    rows.forEach(r => { steps += `   ${padGd(label(r), 14)} ${padGd(fgd(r.f), 7)} ${padGd(fgd(r.cf), 7)} ${padGd(fgd(r.m), 10)} ${padGd(fgd(r.fm), 12)} ${padGd(r.dev.toFixed(4), 14)}\n`; });
    steps += `   ${padGd('Total', 14)} ${padGd(fgd(n), 7)} ${padGd('', 7)} ${padGd('', 10)} ${padGd(fgd(rows.reduce((s, r) => s + r.fm, 0)), 12)} ${padGd(ss.toFixed(4), 14)}\n\n`;
    steps += `Step 2: Mean   x̄ = Σfm / n = ${fgd(rows.reduce((s, r) => s + r.fm, 0))} / ${fgd(n)} = ${mean.toFixed(6)}\n\n`;
    const medC = percentileClass(0.5);
    steps += `Step 3: Median   n/2 = ${fgd(n / 2)}, so the median class is ${label(medC)} (the first class whose cf reaches n/2)\n`;
    steps += `   Median = L + [(n/2 − cf) / f] × w = ${fgd(medC.lower)} + [(${fgd(n / 2)} − ${fgd(medC.cfBefore)}) / ${fgd(medC.f)}] × ${fgd(medC.w)} = ${median.toFixed(6)}\n`;
    const q1C = percentileClass(0.25), q3C = percentileClass(0.75);
    steps += `   Q₁ (class ${label(q1C)}) = ${fgd(q1C.lower)} + [(${fgd(n / 4)} − ${fgd(q1C.cfBefore)}) / ${fgd(q1C.f)}] × ${fgd(q1C.w)} = ${q1.toFixed(6)}\n`;
    steps += `   Q₃ (class ${label(q3C)}) = ${fgd(q3C.lower)} + [(${fgd(3 * n / 4)} − ${fgd(q3C.cfBefore)}) / ${fgd(q3C.f)}] × ${fgd(q3C.w)} = ${q3.toFixed(6)}    IQR = ${(q3 - q1).toFixed(6)}\n\n`;
    steps += `Step 4: Mode   modal class = ${label(mc)} (largest frequency ${fgd(mc.f)}), f₀ = ${fgd(f0)} before it, f₂ = ${fgd(f2)} after it\n`;
    steps += modeDen > 0 ? `   Mode = L + [(f₁ − f₀) / (2f₁ − f₀ − f₂)] × w = ${fgd(mc.lower)} + [(${fgd(mc.f)} − ${fgd(f0)}) / (2×${fgd(mc.f)} − ${fgd(f0)} − ${fgd(f2)})] × ${fgd(mc.w)} = ${mode.toFixed(6)}\n` : `   The formula's denominator is 0, so the class midpoint ${mode.toFixed(6)} is used.\n`;
    if (!equalWidth) steps += `   ⚠ The classes have different widths, so the modal-class formula is only a rough estimate here.\n`;
    steps += `\nStep 5: Spread (using the class midpoints)\n`;
    steps += `   Population variance σ² = Σf(m−x̄)² / n = ${ss.toFixed(6)} / ${fgd(n)} = ${popVar.toFixed(6)},  σ = ${Math.sqrt(popVar).toFixed(6)}\n`;
    steps += Number.isFinite(sampleVar) ? `   Sample variance     s² = Σf(m−x̄)² / (n−1) = ${ss.toFixed(6)} / ${fgd(n - 1)} = ${sampleVar.toFixed(6)},  s = ${Math.sqrt(sampleVar).toFixed(6)}\n` : `   Sample variance needs at least 2 observations.\n`;
    steps += `   Range ≈ ${fgd(rows[rows.length - 1].upper)} − ${fgd(rows[0].lower)} = ${fgd(rows[rows.length - 1].upper - rows[0].lower)} (upper boundary of the last class minus lower boundary of the first)\n`;
    steps += `\n📌 These are estimates: grouping hides where the values lie inside each class, so every value is treated as sitting at its class midpoint.\n`;
    steps += `✅ n = ${fgd(n)} | mean ≈ ${mean.toFixed(4)} | median ≈ ${median.toFixed(4)} | mode ≈ ${mode.toFixed(4)} | s ≈ ${Number.isFinite(sampleVar) ? Math.sqrt(sampleVar).toFixed(4) : 'n/a'}`;
    return {
        type: 'classes', n, mean, median, q1, q3, iqr: q3 - q1, mode, populationVariance: popVar, sampleVariance: sampleVar, sampleStdDev: Math.sqrt(sampleVar), populationStdDev: Math.sqrt(popVar),
        classes: rows.map(r => ({ lower: r.lower, upper: r.upper, f: r.f, cf: r.cf, midpoint: r.m })), adjustedBoundaries: adjusted, steps,
        summary: `n = ${fgd(n)} | x̄ ≈ ${mean.toFixed(4)} | median ≈ ${median.toFixed(4)} | mode ≈ ${mode.toFixed(4)} | s ≈ ${Number.isFinite(sampleVar) ? Math.sqrt(sampleVar).toFixed(4) : 'n/a'}`,
        chart: { labels: rows.map(label), freqs: rows.map(r => r.f), midpoints: rows.map(r => r.m), cumulative: rows.map(r => r.cf), boundaries: [rows[0].lower, ...rows.map(r => r.upper)], discrete: false, mean, median }
    };
}

// ========== SETUP ==========
function setupGroupedDataLogic() {
    const computeBtn = document.getElementById("groupedComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("groupedInput").value;
        const resultDiv = document.getElementById("groupedResultArea");
        const valueSpan = document.getElementById("groupedValueDisplay");
        const stepsSpan = document.getElementById("groupedStepsDisplay");
        resultDiv.style.display = "block";
        if (!raw.trim()) {
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter rows such as 10-20, 5 (class interval, frequency) or 7, 3 (value, frequency).";
            hideAllStatCharts();
            return;
        }
        const result = computeGroupedDataWithSteps(raw);
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
            hideAllStatCharts();
            return;
        }
        valueSpan.innerText = result.summary;
        stepsSpan.innerText = result.steps;
        showFrequencyCharts("groupedResultArea", result.chart);
    });
    attachClearHandler("groupedClearBtn", "groupedInput", "groupedResultArea");
}
