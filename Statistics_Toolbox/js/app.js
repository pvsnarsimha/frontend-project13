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
    probcalc: [renderProbCalcInterface, setupProbCalcLogic],
    groupeddata: [renderGroupedDataInterface, setupGroupedDataLogic],
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
    twoproportionz: [renderTwoProportionZInterface, setupTwoProportionZLogic],
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

// After the user picks a tool from the sidebar the old content is gone, so focus would be left on a button that no longer
// leads anywhere meaningful for a screen reader. Move it to the new tool's title (a heading, also given its role by
// makeAccessible in ui/forms.js); a screen reader then reads the tool's name and the keyboard user can Tab straight into
// its first input. Not done for module tabs (arrow keys must keep focus on the tab list) or for the initial render.
function focusToolTitle() {
    const title = interfaceRoot.querySelector('.interface-title');
    if (!title) return;
    title.tabIndex = -1;       // set here as well: the accessibility pass in ui/forms.js runs a moment later (MutationObserver)
    title.focus();
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
    if (btn.dataset.stat) { switchToStat(btn.dataset.stat); focusToolTitle(); }
});

// Raw data / summary statistics switch (see inputModeItem in core/toolkit.js): show the input group that matches the select
function applyInputMode(select) {
    const iface = select.closest('.stat-interface');
    if (!iface) return;
    const name = select.dataset.modeGroup;
    iface.querySelectorAll('[data-mode]').forEach(group => {
        if ((group.dataset.modeGroup || '') !== (name || '')) return;       // a named switch only moves its own blocks
        group.style.display = group.dataset.mode === select.value ? '' : 'none';
    });
}
document.addEventListener('change', e => {
    const select = e.target.closest && e.target.closest('[data-mode-select]');
    if (select) applyInputMode(select);
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
        notifyUser('Please select a statistical measure and enter data first.');
        return;
    }
    const numbers = parseNumbersFromInput(textarea.value);
    if (numbers.length > 0) visualizeData(numbers, currentStat || 'mean');
    else notifyUser('Please enter numeric data in the active calculator first.');
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

// Deep link: Statistics.html#tool=pearson opens that tool (the "Which tool should I use?" page links this way)
function openToolFromHash() {
    if (typeof location === 'undefined') return;
    const m = /^#tool=([A-Za-z0-9]+)$/.exec(location.hash);
    if (!m || !STAT_ROUTES[m[1]]) return;
    const btn = document.querySelector('.stat-btn[data-stat="' + m[1] + '"]');
    const sidebar = btn && btn.closest('.action-sidebar');
    if (!sidebar) return;
    showModule(sidebar.dataset.module);
    switchToStat(m[1]);
}
openToolFromHash();
window.addEventListener('hashchange', openToolFromHash);
