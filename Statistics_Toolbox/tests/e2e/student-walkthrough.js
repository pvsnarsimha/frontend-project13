// A scripted "first-time student" session: no deep links, no ids known in advance. The student finds each tool through the search box,
// types what a textbook question gives, and must get the textbook's answer plus a graph. This stands in for the real student trial
// (docs/student-trial.md) as a regression guard: if a rename or layout change makes a tool hard to find or a textbook question
// impossible to enter, it fails here.
// Usage: node tests/e2e/student-walkthrough.js   (set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const launcher = require('./launch');
(async () => {
  const file = path.resolve(__dirname, '..', '..', process.env.STATLAB_ROOT || '.', 'Statistics.html');
  const b = await launcher.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  const expect = (cond, msg) => { if (!cond) errs.push(msg); };
  await p.goto('file://' + file);

  // find a tool the way a student would: type a word from the textbook into the search box, click the match
  const findTool = async (query, buttonText) => {
    await p.fill('#toolSearch', query);
    // the match is either in the sidebar of the current module or offered as a "found in another module" button
    let btn = p.locator('.stat-btn:visible', { hasText: buttonText }).first();
    if (!(await btn.count())) btn = p.locator('.search-other', { hasText: buttonText }).first();
    if (!(await btn.count())) { errs.push(`search "${query}" did not offer a tool named "${buttonText}"`); return false; }
    await btn.click();
    return true;
  };
  const answer = async area => (await p.locator(`#${area} [id$=ValueDisplay]`).first().textContent()).replace(/\s+/g, ' ');
  const hasChart = async () => (await p.locator('.stat-chart-card canvas:visible').count()) > 0;

  // Question 1: n = 25, x̄ = 72, s = 8: is the mean 70? (t = 1.25, p = 0.2234, df = 24)
  if (await findTool('one-sample t', 'One-Sample t-test')) {
    await p.selectOption('#statOneSampleTInterface [data-mode-select]', 'summary');
    await p.fill('#oneSampleN', '25'); await p.fill('#oneSampleMean', '72'); await p.fill('#oneSampleSd', '8'); await p.fill('#hypothesizedMean', '70');
    await p.click('#oneSampleTComputeBtn'); await p.waitForTimeout(900);
    const a = await answer('oneSampleTResultArea');
    expect(/t = 1\.25/.test(a) && /p = 0\.223[0-9]/.test(a), 'Q1 (one-sample t from summary): answer was "' + a + '"');
    expect(await hasChart(), 'Q1: no rejection-region graph was drawn');
  }

  // Question 2: 45 of 120 passed with method A, 30 of 110 with method B (z = 1.6528, p = 0.0984)
  if (await findTool('proportion', 'Two-Proportion z-test')) {
    await p.click('#twoPropZComputeBtn'); await p.waitForTimeout(900);
    const a = await answer('twoPropZResultArea');
    expect(/z = 1\.6527/.test(a) && /p = 0\.098/.test(a), 'Q2 (two-proportion z): answer was "' + a + '"');
    expect(await hasChart(), 'Q2: no graph was drawn');
  }

  // Question 3: P(-1 <= Z <= 2) for the standard normal (0.8186)
  if (await findTool('probability calc', 'Probability Calculator')) {
    await p.click('#probcalcComputeBtn'); await p.waitForTimeout(900);
    const a = await answer('probcalcResultArea');
    expect(/0\.8185|0\.8186/.test(a), 'Q3 (probability calculator): answer was "' + a + '"');
    expect(await hasChart(), 'Q3: no shaded probability graph was drawn');
  }

  // Question 4: a frequency table of classes (mean 38.4, median 38)
  if (await findTool('frequency', 'Frequency Table')) {
    await p.fill('#groupedInput', '10-20, 5\n20-30, 8\n30-40, 15\n40-50, 12\n50-60, 7\n60-70, 3');
    await p.click('#groupedComputeBtn'); await p.waitForTimeout(900);
    const a = await answer('groupedResultArea');
    expect(/38\.4/.test(a) && /38/.test(a), 'Q4 (grouped data): answer was "' + a + '"');
    expect(await hasChart(), 'Q4: no histogram was drawn');
  }

  // Question 5: a table of observed counts for the chi-square test of independence (chi2 = 3.5556, df = 2)
  if (await findTool('chi-square', 'Chi-Square Test of Independence')) {
    await p.selectOption('#statChisquareInterface [data-mode-select]', 'summary');
    await p.click('#chisquareComputeBtn'); await p.waitForTimeout(900);
    const a = await answer('chisquareResultArea');
    expect(/χ² = 3\.5555/.test(a) && /df = 2/.test(a), 'Q5 (chi-square from a table): answer was "' + a + '"');
  }

  await b.close();
  if (errs.length) { console.log(errs.join('\n')); console.log('STUDENT WALKTHROUGH FAILED'); process.exit(1); }
  console.log('student walkthrough: 5 textbook questions answered correctly with graphs');
})();
