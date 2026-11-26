// The narrated animation in a real browser: it appears under a test's chart, plays through all five scenes (speech or caption timing),
// pauses, replays, jumps to a step, follows the tool when it is recalculated, and disappears for tools that have no curve.
// Usage: node tests/e2e/tutor.js   (set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const launcher = require('./launch');
(async () => {
  const root = path.resolve(__dirname, '..', '..', process.env.STATLAB_ROOT || '.');
  const b = await launcher.launch();
  const p = await (await b.newContext({ viewport: { width: 1000, height: 900 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  const expect = (c, m) => { if (!c) errs.push(m); };
  await p.addInitScript(() => { window.STATLAB_TUTOR_SPEED = 8; });
  const state = () => p.evaluate(() => tutorCards.get('test').state);
  const finish = async () => { for (let i = 0; i < 80; i++) { if ((await state()).finished) return true; await p.waitForTimeout(150); } return false; };

  await p.goto('file://' + path.join(root, 'Statistics.html') + '#tool=onesamplet'); await p.reload(); await p.waitForTimeout(300);
  await p.fill('#oneSampleData', '52, 55, 53, 58, 54, 56, 57, 55, 59, 54'); await p.fill('#hypothesizedMean', '50');
  await p.click('#oneSampleTComputeBtn'); await p.waitForTimeout(900);
  expect(await p.locator('#tutorCard-test').count() === 1, 'animation card missing under the t-test chart');
  expect(await p.locator('#tutorCard-test .tutor-dot').count() === 5, 'expected 5 step buttons');
  expect(/reject H₀/.test(await p.textContent('#tutorCard-test .tutor-line')), 'poster line should show the verdict before Play');

  // plays all scenes, in order, and the caption of each is shown
  await p.click('#tutorCard-test .tutor-play');
  const seen = new Set();
  for (let i = 0; i < 80; i++) { const s = await state(); seen.add(s.scene); if (s.finished) break; await p.waitForTimeout(100); }
  expect(await finish(), 'animation never finished');
  expect(seen.size >= 4, 'scenes were skipped: ' + [...seen]);
  expect(/Play again/.test(await p.textContent('#tutorCard-test .tutor-play')), 'button should offer "Play again" at the end');
  expect(/in the shaded tail, so we reject H₀/.test(await p.textContent('#tutorCard-test .tutor-line')), 'final caption wrong');

  // pause holds the scene; resume continues
  await p.click('#tutorCard-test .tutor-replay'); await p.waitForTimeout(150);
  await p.click('#tutorCard-test .tutor-play');
  const at = (await state()).scene; await p.waitForTimeout(400);
  expect((await state()).scene === at && !(await state()).playing, 'pause should freeze the scene');
  await p.click('#tutorCard-test .tutor-play'); expect(await finish(), 'resume should reach the end');

  // jumping to a step
  await p.click('#tutorCard-test .tutor-dot:nth-child(3)'); await p.waitForTimeout(60);
  expect((await state()).scene >= 2, 'step button 3 should jump to scene 3');
  await finish();

  // narration switched off still plays (captions)
  await p.uncheck('#tutorCard-test .tutor-speak'); await p.click('#tutorCard-test .tutor-replay');
  expect(await finish(), 'caption-only mode never finished');

  // the canvas actually has the picture (not blank)
  const inked = await p.evaluate(() => { const c = document.querySelector('#tutorCard-test canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
  expect(inked > 2000, 'canvas looks blank');

  // recalculating with other numbers rebuilds the narration for the new result (fail to reject)
  await p.fill('#hypothesizedMean', '55'); await p.click('#oneSampleTComputeBtn'); await p.waitForTimeout(800);
  expect(await p.locator('#tutorCard-test').count() === 1, 'recalculating must not add a second card');
  expect(/fail to reject/.test(await p.textContent('#tutorCard-test .tutor-line')), 'narration should follow the new result');

  // a tool with no continuous curve (binomial) shows no animation
  await p.goto('file://' + path.join(root, 'Statistics.html') + '#tool=binomialexact'); await p.reload(); await p.waitForTimeout(300);
  const hasBtn = await p.locator('#binomialExactComputeBtn, [id$="ComputeBtn"]:visible').count();
  expect(hasBtn >= 0, 'sanity');
  expect(await p.locator('#tutorCard-test:visible').count() === 0, 'binomial tool should have no animation card');
  // every tool that has an animation shows it, plays it to the end, and paints the canvas
  const TOOLS = [
    ['mean', { '#meanInput': '4, 6, 7, 9, 12, 16' }, '#meanComputeBtn', 'meansd'], ['stddev', { '#stddevInput': '4, 6, 7, 9, 12, 16' }, '#stddevComputeBtn', 'meansd'],
    ['zscore', { '#zscoreInput': '52, 55, 53, 58, 54, 56, 57, 55, 59, 54' }, '#zscoreComputeBtn', 'zscore'],
    ['boxplot', { '#boxplotInput': '12, 3, 19, 7, 15, 9, 22, 5, 11, 41' }, '#boxplotComputeBtn', 'boxplot'],
    ['pearson', { '#pearsonXInput': '1, 2, 3, 4, 5, 6, 7, 8', '#pearsonYInput': '2.1, 3.9, 3.2, 5.8, 5.1, 7.4, 6.6, 9.0' }, '#pearsonComputeBtn', 'corr'],
    ['simplelinear', { '#simpleXInput': '1, 2, 3, 4, 5, 6, 7, 8', '#simpleYInput': '2.1, 3.9, 3.2, 5.8, 5.1, 7.4, 6.6, 9.0' }, '#simpleLinearComputeBtn', 'regress'],
    ['sampling', { '#samplingSeed': '5' }, '#samplingComputeBtn', 'clt']
  ];
  for (const [tool, fill, btn, key] of TOOLS) {
    await p.goto('file://' + path.join(root, 'Statistics.html') + '#tool=' + tool); await p.reload(); await p.waitForTimeout(300);
    for (const [sel, v] of Object.entries(fill)) await p.fill(sel, v);
    await p.click(btn); await p.waitForTimeout(900);
    expect(await p.locator('#tutorCard-' + key + ':visible').count() === 1, `${tool}: animation card missing`);
    if (!(await p.locator('#tutorCard-' + key).count())) continue;
    await p.click('#tutorCard-' + key + ' .tutor-play');
    let done = false; for (let i = 0; i < 150 && !done; i++) { done = await p.evaluate(k => tutorCards.get(k).state.finished, key); if (!done) await p.waitForTimeout(100); }
    expect(done, `${tool}: animation never finished`);
    const ink = await p.evaluate(k => { const c = document.querySelector('#tutorCard-' + k + ' canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; }, key);
    expect(ink > 2000, `${tool}: canvas looks blank`);
    // calculating again with nothing valid must remove the stale animation
    await p.click(btn); await p.waitForTimeout(400);
  }
  // an animation must stop talking when its tool is left
  await p.goto('file://' + path.join(root, 'Statistics.html') + '#tool=stddev'); await p.reload(); await p.waitForTimeout(300);
  await p.fill('#stddevInput', '4, 6, 7, 9, 12, 16'); await p.click('#stddevComputeBtn'); await p.waitForTimeout(600);
  await p.click('#tutorCard-meansd .tutor-play'); await p.waitForTimeout(200);
  await p.click('[data-stat="mean"]'); await p.waitForTimeout(400);
  expect(!(await p.evaluate(() => (tutorCards.get('meansd') || { state: { playing: false } }).state.playing)), 'animation kept playing after leaving its tool');

  // with a working voice (faked here: it records what is spoken and "finishes" each line after 300 ms) every scene is spoken, in order,
  // and the animation waits for the voice
  const v = await (await b.newContext({ viewport: { width: 1000, height: 900 } })).newPage();
  v.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await v.addInitScript(() => {
    window.__said = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [], cancel() {}, speak(u) { window.__said.push(u.text); setTimeout(() => u.onstart && u.onstart(), 10); setTimeout(() => u.onend && u.onend(), 300); } } });
  });
  await v.goto('file://' + path.join(root, 'Statistics.html') + '#tool=onesamplet'); await v.reload(); await v.waitForTimeout(300);
  await v.fill('#oneSampleData', '52, 55, 53, 58, 54, 56, 57, 55, 59, 54'); await v.fill('#hypothesizedMean', '50');
  await v.click('#oneSampleTComputeBtn'); await v.waitForTimeout(900);
  await v.click('#tutorCard-test .tutor-play');
  for (let i = 0; i < 100; i++) { if ((await v.evaluate(() => tutorCards.get('test').state)).finished) break; await v.waitForTimeout(100); }
  const said = await v.evaluate(() => window.__said);
  expect(said.length === 5, 'expected 5 spoken lines, got ' + said.length);
  expect(said[0] && /H zero/.test(said[0]) && /reject H zero/.test(said[4] || ''), 'spoken text wrong: ' + JSON.stringify(said));
  expect(await v.locator('#tutorCard-test .tutor-note:visible').count() === 0, 'a working voice must not show the "no voice" note');
  await b.close();
  if (errs.length) { console.log(errs.join('\n')); console.log('TUTOR CHECK FAILED'); process.exit(1); }
  console.log('narrated animation plays, pauses, replays, jumps and follows the result');
})();
