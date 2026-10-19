/* StatLab application shell: route table, module tabs, sidebar navigation, chart controls.
 *
 * Every tool is one row in STAT_ROUTES: [render function, setup function]. Adding a tool means
 * writing its renderXInterface()/setupXLogic() pair, adding one row here and one <button data-stat>
 * to the matching sidebar in Statistics.html. Nothing else needs touching.
 */
const STAT_ROUTES = {
    mean: [meanTool.render, meanTool.setup],
    median: [medianTool.render, medianTool.setup],
    mode: [modeTool.render, modeTool.setup],
    geometric: [geometricTool.render, geometricTool.setup],
    harmonic: [harmonicTool.render, harmonicTool.setup],
    variance: [varianceTool.render, varianceTool.setup],
    stddev: [stddevTool.render, stddevTool.setup],
    range: [rangeTool.render, rangeTool.setup],
    iqr: [renderIQRInterface, setupIQRCustomLogic],
    quartiles: [renderQuartilesInterface, setupQuartilesLogic],
    percentiles: [renderPercentilesInterface, setupPercentilesLogic],
    cv: [cvTool.render, cvTool.setup],
    skewness: [skewnessTool.render, skewnessTool.setup],
    kurtosis: [kurtosisTool.render, kurtosisTool.setup],
    meanabsdev: [renderMeanAbsDevInterface, setupMeanAbsDevLogic],
    medianabsdev: [renderMedianAbsDevInterface, setupMedianAbsDevLogic],
    deciles: [renderDecilesInterface, setupDecilesLogic],
    stderror: [renderStdErrorInterface, setupStdErrorLogic],
    qqplot: [renderQQPlotInterface, setupQQPlotLogic],
    fivenum: [renderFiveNumInterface, setupFiveNumLogic],
    sumsquares: [renderSumSquaresInterface, setupSumSquaresLogic],
    pdf: [renderPDFInterface, setupPDFLogic],
    cdf: [renderCDFInterface, setupCDFLogic],
    quantile: [renderQuantileInterface, setupQuantileLogic],
    random: [renderRandomInterface, setupRandomLogic],
    pmf: [renderPMFInterface, setupPMFLogic],
    survival: [renderSurvivalInterface, setupSurvivalLogic],
    hazard: [renderHazardInterface, setupHazardLogic],
    pearson: [renderPearsonInterface, setupPearsonLogic],
    spearman: [renderSpearmanInterface, setupSpearmanLogic],
    kendall: [renderKendallInterface, setupKendallLogic],
    covariance: [renderCovarianceInterface, setupCovarianceLogic],
    contingency: [renderContingencyInterface, setupContingencyLogic],
    chisquare: [renderChisquareInterface, setupChisquareLogic],
    stderrors: [renderStdErrorsInterface, setupStdErrorsLogic],
    tstats: [renderTStatsInterface, setupTStatsLogic],
    ftestoverall: [renderFTestOverallInterface, setupFTestOverallLogic],
    mcnemar: [renderMcNemarInterface, setupMcNemarLogic],
    cochranq: [renderCochranQInterface, setupCochranQLogic],
    fitdistribution: [renderFitDistributionInterface, setupFitDistributionLogic],
    expectedvalue: [renderExpectedValueInterface, setupExpectedValueLogic],
    variancedist: [renderDistributionVarianceInterface, setupDistributionVarianceLogic],
    mgf: [renderMGFInterface, setupMGFLogic],
    entropy: [renderEntropyInterface, setupEntropyLogic],
    distSkewness: [renderDistSkewnessInterface, setupDistSkewnessLogic],
    distKurtosis: [renderDistKurtosisInterface, setupDistKurtosisLogic],
    pointbiserial: [renderPointBiserialInterface, setupPointBiserialLogic],
    partial: [renderPartialCorrelationInterface, setupPartialCorrelationLogic],
    iqroutlier: [renderIQROutlierInterface, setupIQROutlierLogic],
    zoutlier: [renderZOutlierInterface, setupZOutlierLogic],
    durbinwatson: [renderDurbinWatsonInterface, setupDurbinWatsonLogic],
    vif: [renderVIFInterface, setupVIFLogic],
    cooksdistance: [renderCooksDistanceInterface, setupCooksDistanceLogic],
    tukeyhsd: [renderTukeyHSDInterface, setupTukeyHSDLogic],
    bonferroni: [renderBonferroniInterface, setupBonferroniLogic],
    scheffe: [renderScheffeInterface, setupScheffeLogic],
    stemleaf: [renderStemLeafInterface, setupStemLeafLogic],
    histogram: [renderHistogramInterface, setupHistogramLogic],
    boxplot: [renderBoxplotInterface, setupBoxplotLogic],
    onesamplet: [renderOneSampleTInterface, setupOneSampleTLogic],
    twosamplet: [renderTwoSampleTInterface, setupTwoSampleTLogic],
    pairedt: [renderPairedTInterface, setupPairedTLogic],
    anova: [renderANOVAInterface, setupANOVALogic],
    ftest: [renderFTestInterface, setupFTestLogic],
    corrmatrix: [renderCorrelationMatrixInterface, setupCorrelationMatrixLogic],
    distcorr: [renderDistanceCorrelationInterface, setupDistanceCorrelationLogic],
    mannwhitney: [renderMannWhitneyInterface, setupMannWhitneyLogic],
    wilcoxon: [renderWilcoxonInterface, setupWilcoxonLogic],
    mutualinfo: [renderMutualInfoInterface, setupMutualInfoLogic],
    kruskalwallis: [renderKruskalWallisInterface, setupKruskalWallisLogic],
    friedman: [renderFriedmanInterface, setupFriedmanLogic],
    cramersv: [renderCramersVInterface, setupCramersVLogic],
    phi: [renderPhiInterface, setupPhiLogic],
    onesamplez: [renderOneSampleZInterface, setupOneSampleZLogic],
    oneproportionz: [renderOneProportionZInterface, setupOneProportionZLogic],
    binomialexact: [renderBinomialExactInterface, setupBinomialExactLogic],
    winsorize: [renderWinsorizeInterface, setupWinsorizeLogic],
    boxcox: [renderBoxCoxInterface, setupBoxCoxLogic],
    runstest: [renderRunsTestInterface, setupRunsTestLogic],
    moodsmedian: [renderMoodsMedianInterface, setupMoodsMedianLogic],
    chisquaregoodness: [renderChiSquareGoodnessInterface, setupChiSquareGoodnessLogic],
    kolmogorovsmirnov: [renderKolmogorovSmirnovInterface, setupKolmogorovSmirnovLogic],
    shapirowilk: [renderShapiroWilkInterface, setupShapiroWilkLogic],
    andersonDarling: [renderAndersonDarlingInterface, setupAndersonDarlingLogic],
    signTest: [renderSignTestInterface, setupSignTestLogic],
    ancova: [renderANCOVAInterface, setupANCOVALogic],
    manova: [renderMANOVAInterface, setupMANOVALogic],
    levene: [renderLeveneInterface, setupLeveneLogic],
    violin: [renderViolinInterface, setupViolinLogic],
    bartlett: [renderBartlettInterface, setupBartlettLogic],
    ppplot: [renderPPPlotInterface, setupPPPlotLogic],
    simplelinear: [renderSimpleLinearInterface, setupSimpleLinearLogic],
    multiplelinear: [renderMultipleLinearInterface, setupMultipleLinearLogic],
    modelsummary: [renderModelSummaryInterface, setupModelSummaryLogic],
    zscore: [renderZScoreInterface, setupZScoreLogic],
    normalize: [renderNormalizeInterface, setupNormalizeLogic],
    ranking: [renderRankingInterface, setupRankingLogic],
    binning: [renderBinningInterface, setupBinningLogic],
    logtransform: [renderLogTransformInterface, setupLogTransformLogic]
};

// Tab (module) -> sidebar it shows and the tool opened first
const STAT_MODULES = {
    descriptive:  'mean',
    manipulation: 'zscore',
    probability:  'pdf',
    correlation:  'pearson',
    hypothesis:   'onesamplet',
    regression:   'simplelinear'
};

const interfaceRoot = document.getElementById('interfaceRoot');
let currentStat = null;

// Each plotting tool keeps its own Chart.js instance in a module-level variable; this is the single place that knows them all
function destroyAllCharts() {
    const holders = [
        [() => currentChart, () => { currentChart = null; }],
        [() => histogramChart, () => { histogramChart = null; }],
        [() => boxplotChartInstance, () => { boxplotChartInstance = null; }],
        [() => violinChart, () => { violinChart = null; }],
        [() => qqplotChart, () => { qqplotChart = null; }],
        [() => ppplotChart, () => { ppplotChart = null; }],
        [() => stemLeafChart, () => { stemLeafChart = null; }]
    ];
    holders.forEach(([get, clear]) => {
        const chart = get();
        if (chart && typeof chart.destroy === 'function') chart.destroy();
        clear();
    });
}

function switchToStat(statType) {
    const route = STAT_ROUTES[statType] || STAT_ROUTES.mean;
    if (!STAT_ROUTES[statType]) statType = 'mean';
    currentStat = statType;

    // A different tool means different data: close the chart panel and release every Chart.js instance
    const chartArea = document.getElementById('chartDisplayArea');
    if (chartArea) chartArea.classList.remove('show');
    destroyAllCharts();

    const [render, setup] = route;
    setHtml(interfaceRoot, render());
    if (setup) setup();

    document.querySelectorAll('.stat-btn[data-stat]').forEach(b => {
        const on = b.dataset.stat === statType;
        b.classList.toggle('active', on);
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
}

function showModule(moduleName) {
    document.querySelectorAll('.tab').forEach(t => {
        const on = t.dataset.tab === moduleName;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('.action-sidebar').forEach(sb => { sb.hidden = sb.dataset.module !== moduleName; });
    // The one panel below the tab list is the tab panel of whichever tab is selected
    document.getElementById('mainPanel').setAttribute('aria-labelledby', 'tab-' + moduleName);
    switchToStat(STAT_MODULES[moduleName] || 'mean');
}

// One delegated listener for every sidebar button (no per-button wiring to duplicate or forget)
document.querySelector('.main-panel').addEventListener('click', e => {
    const btn = e.target.closest('.stat-btn');
    if (!btn) return;
    if (btn.dataset.action === 'visualize') { visualizeCurrentData(); return; }
    if (btn.dataset.stat) switchToStat(btn.dataset.stat);
});

// Tabs: click, Enter/Space, and arrow-key navigation (WAI-ARIA tabs pattern)
const tabList = document.querySelector('.tab-bar');
tabList.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) showModule(tab.dataset.tab);
});
tabList.addEventListener('keydown', e => {
    const tabsEls = Array.from(tabList.querySelectorAll('.tab'));
    const i = tabsEls.indexOf(document.activeElement);
    if (i < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % tabsEls.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabsEls.length) % tabsEls.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabsEls.length - 1;
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showModule(tabsEls[i].dataset.tab); return; }
    if (next >= 0) { e.preventDefault(); tabsEls[next].focus(); showModule(tabsEls[next].dataset.tab); }
});

function visualizeCurrentData() {
    const textarea = document.querySelector('.data-input-section textarea');
    if (!textarea) {
        alert('Please select a statistical measure and enter data first!');
        return;
    }
    const numbers = parseNumbersFromInput(textarea.value);
    if (numbers.length > 0) visualizeData(numbers, currentStat || 'mean');
    else alert('Please enter numeric data in the active calculator first!');
}

document.getElementById('closeChartBtn').addEventListener('click', () => {
    document.getElementById('chartDisplayArea').classList.remove('show');
    destroyAllCharts();
});

// Expandable metric explanations in the model summary (markup carries data-toggle-metric instead of an inline handler)
document.addEventListener('click', e => {
    const header = e.target.closest('[data-toggle-metric]');
    if (header) toggleMetric(header);
});

switchToStat('mean');
