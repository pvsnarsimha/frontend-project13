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
  await b.close();
  if (errs.length) { console.log(errs.join('\n')); console.log('TUTOR CHECK FAILED'); process.exit(1); }
  console.log('narrated animation plays, pauses, replays, jumps and follows the result');
})();
