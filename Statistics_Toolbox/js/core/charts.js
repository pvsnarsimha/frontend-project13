/* Chart.js instances: one module-level variable per plotting tool (released together by destroyAllCharts in app.js) */

// Chart instance reference
let currentChart = null;

// ========== STEM-AND-LEAF PLOT FUNCTIONS ==========
// ========== PROFESSIONAL STEM-AND-LEAF PLOT WITH SCATTER VISUALIZATION ==========
let stemLeafChart = null;

// ========== PROFESSIONAL HISTOGRAM FUNCTIONS ==========
// Global chart instance
let histogramChart = null;

// ========== PROFESSIONAL BOXPLOT USING CHART.JS WITH CUSTOM DRAWING ==========
let boxplotChartInstance = null;

// ========== VIOLIN PLOT COMPUTATION ==========
let violinChart = null;

// ========== Q-Q PLOT COMPUTATION ==========
let qqplotChart = null;

// ========== P-P PLOT COMPUTATION ==========
let ppplotChart = null;

// ---- Canvas hover tooltip (used by the boxplot) ----
// One tooltip element for the whole page, created on first use and reused (never one per chart), positioned with
// `position: fixed` so it follows the pointer correctly however far the page is scrolled.
function getCanvasTooltipElement() {
    let tip = document.getElementById('canvasChartTooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'canvasChartTooltip';
        tip.setAttribute('role', 'tooltip');
        tip.style.cssText = 'position: fixed; background: #1a5490; color: white; padding: 8px 16px; border-radius: 8px; ' +
            'font-size: 12px; font-family: monospace; pointer-events: none; z-index: 1000; display: none; ' +
            'box-shadow: 0 2px 10px rgba(0,0,0,0.3); border-left: 4px solid;';
        document.body.appendChild(tip);
    }
    return tip;
}

function setupCanvasTooltip(canvas, chart) {
    const tooltipDiv = getCanvasTooltipElement();
    tooltipDiv.style.display = 'none';
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        let found = null;
        const tolerance = 10;
        
        if (chart.interactiveElements) {
            for (let elem of chart.interactiveElements) {
                if (elem.type === 'whisker' || elem.type === 'median' || elem.type === 'q1' || elem.type === 'q3') {
                    const distance = Math.abs(mouseY - elem.y);
                    if (distance < tolerance) {
                        found = elem;
                        break;
                    }
                } else if (elem.type === 'point' || elem.type === 'outlier') {
                    const distance = Math.hypot(mouseX - elem.x, mouseY - elem.y);
                    if (distance < tolerance) {
                        found = elem;
                        break;
                    }
                } else if (elem.type === 'box') {
                    // Box detection handled differently
                }
            }
        }
        
        if (found) {
            let tooltipText = '';
            switch (found.type) {
                case 'whisker':
                    tooltipText = `${found.label}: ${found.value.toFixed(4)}`;
                    break;
                case 'median':
                    tooltipText = `📊 ${found.label}: ${found.value.toFixed(4)}`;
                    break;
                case 'q1':
                    tooltipText = `📉 ${found.label}: ${found.value.toFixed(4)} (25% of data ≤ this value)`;
                    break;
                case 'q3':
                    tooltipText = `📈 ${found.label}: ${found.value.toFixed(4)} (75% of data ≤ this value)`;
                    break;
                case 'point':
                    tooltipText = `${found.label}: ${found.value.toFixed(4)}`;
                    break;
                case 'outlier':
                    tooltipText = `⚠️ ${found.label}: ${found.value.toFixed(4)}`;
                    break;
            }
            tooltipDiv.textContent = tooltipText;
            tooltipDiv.style.display = 'block';
            tooltipDiv.style.borderLeftColor = found.color || '#4fc3f7';
            // position: fixed, so viewport coordinates (clientX/Y) are used as they are, whatever the page scroll
            const tipW = tooltipDiv.offsetWidth || 0;
            const left = e.clientX + 15 + tipW > window.innerWidth ? e.clientX - 15 - tipW : e.clientX + 15;
            tooltipDiv.style.left = Math.max(8, left) + 'px';
            tooltipDiv.style.top = Math.max(8, e.clientY - 35) + 'px';
        } else {
            tooltipDiv.style.display = 'none';
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        tooltipDiv.style.display = 'none';
    });
}

// ---- Accessible names for charts ----
// A canvas is just pixels to assistive technology, so each chart is given role="img" and a label that states what the
// data shows (sample size, range, centre, shape), not just "chart". Call it each time a chart is (re)drawn.
function labelChart(canvas, description) {
    if (!canvas) return;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', description);
}

function describeSample(numbers) {
    const n = numbers.length;
    if (!n) return 'no data';
    const sorted = [...numbers].sort((a, b) => a - b);
    const fmtNum = v => String(+v.toFixed(3));
    const mean = numbers.reduce((s, v) => s + v, 0) / n;
    return `${n} value${n === 1 ? '' : 's'} from ${fmtNum(sorted[0])} to ${fmtNum(sorted[n - 1])}, mean ${fmtNum(mean)}, median ${fmtNum(quantileType7(sorted, 0.5))}`;
}
