'use strict';
// The narrated hypothesis-test animation: the spoken lines must come from the real result and agree with the verdict
// (the drawing and the player are covered by tests/e2e/tutor.js in a real browser).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./load-app');

const app = loadApp();
const spec = over => Object.assign({ dist: 't', df: 9, stat: 3.1, alternative: 'two.sided', alpha: 0.05, statLabel: 't', critical: { lower: -2.262, upper: 2.262 } }, over);
const scenes = s => app.hypothesisTutorScenes(s, app.buildTestChart(s));

test('a statistic inside the rejection region is narrated as "reject H0"', () => {
    const sc = scenes(spec());
    assert.equal(sc.length, 5);
    assert.deepEqual(Array.from(sc.map(s => s.id)), ['curve', 'region', 'drop', 'pvalue', 'verdict']);
    assert.match(sc[4].line, /t-value fell in the shaded tail, so we reject H₀/);
    assert.equal(sc[4].reject, true);
    assert.match(sc[2].line, /t = 3\.1/);
});

test('a statistic outside the region is narrated as "fail to reject", and never claims H0 is proved', () => {
    const sc = scenes(spec({ stat: 0.8 }));
    assert.match(sc[4].line, /fell outside the shaded region, so we fail to reject H₀/);
    assert.match(sc[4].line, /not the same as proving H₀ true/);
    assert.match(sc[3].line, /not smaller than α = 0\.05/);
});

test('the region line states alpha, the split between tails and the real cut-offs', () => {
    assert.match(scenes(spec())[1].line, /α = 0\.05.*5%.*2\.5% in each tail.*-2\.262 and 2\.262/);
    const one = scenes(spec({ alternative: 'greater', critical: { lower: null, upper: 1.833 } }))[1].line;
    assert.match(one, /upper tail/); assert.match(one, /1\.833/);
});

test('the p-value in the narration matches the t distribution (two-sided, df 9, t = 3.1 -> 0.0127, checked by numeric integration)', () => {
    assert.match(scenes(spec())[3].line, /p-value, 0\.0127/);
    assert.match(scenes(spec({ stat: 9 }))[3].line, /less than 0\.0001/);
});

test('speech text spells symbols out so voices do not stumble', () => {
    assert.equal(app.speakable('we reject H₀ since α = 0.05'), 'we reject H zero since alpha equals 0.05');
    assert.match(app.speakable('cut-offs −2.262 and 2.262'), /minus 2\.262/);
});

test('binomial charts get no animation (no continuous curve to animate)', () => {
    assert.equal(app.hypothesisTutorDef({ kind: 'binomial' }), null);
});

// ---- the other narrated animations ----
test('mean / SD narration uses the real mean, sum of squares, variance and SD', () => {
    const sc = app.meanSdScenes([4, 6, 7, 9, 12, 16], 'sd');
    assert.equal(sc.scenes.length, 5);
    assert.equal(sc.mean, 9); assert.equal(sc.ss, 96); assert.ok(Math.abs(sc.sd - Math.sqrt(19.2)) < 1e-12);
    assert.match(sc.scenes[1].line, /\(54\) and divide by 6.*mean is 9/);
    assert.match(sc.scenes[3].line, /add up to 96/);
    assert.match(sc.scenes[4].line, /n − 1 = 5.*variance, 19\.2.*s = 4\.3818/);
    assert.equal(app.meanSdScenes([1, 2, 3], 'mean').scenes.length, 2, 'the mean tool stops after the balance point');
});
test('the player refuses data it cannot animate legibly (one value, too many dots)', () => {
    assert.equal(app.meanSdTutorDef([5], 'mean'), null);
    assert.equal(app.meanSdTutorDef(Array.from({ length: 16 }, (_, i) => i), 'sd'), null);
    assert.equal(app.zScoreTutorDef([3, 3, 3]), null, 'no spread: z-scores are undefined');
});
test('z-score narration states the z of the smallest and largest values and the area to their left', () => {
    const def = app.zScoreTutorDef([52, 55, 53, 58, 54, 56, 57, 55, 59, 54]);
    assert.match(def.scenes[1].line, /smallest value, 52, has z = -1\.4\d+.*Only 6\.\d+% of the area lies to its left/);
    assert.match(def.scenes[2].line, /largest value, 59.*z = 1\.6\d+.*now 9\d(\.\d)?%/);
});
test('box plot narration reports the tool\'s own quartiles, fences and outliers', () => {
    const nums = [12, 3, 19, 7, 15, 9, 22, 5, 11, 41], r = app.computeBoxplotWithSteps(nums);
    const def = app.boxplotTutorDef(nums, r);
    assert.match(def.scenes[2].line, new RegExp(`Q1 = ${r.q1}.*median = ${r.median}.*Q3 = ${r.q3}`));
    assert.match(def.scenes[4].line, /One value lies beyond the fences/);
    assert.match(app.boxplotTutorDef([1, 2, 3, 4, 5], app.computeBoxplotWithSteps([1, 2, 3, 4, 5])).scenes[4].line, /no outliers/);
});
test('correlation narration quotes the real r and an honest strength word', () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8], y = [2.1, 3.9, 3.2, 5.8, 5.1, 7.4, 6.6, 9.0];
    const def = app.correlationTutorDef(x, y);
    assert.match(def.scenes[3].line, /r = 0\.9[34]\d*: a very strong positive/);
    assert.equal(app.tutorStrength(-0.45), 'moderate');
    // the demo cloud has exactly the correlation shown on the slider
    for (const r of [-0.9, 0, 0.6, 0.95]) assert.ok(Math.abs(app.tutorPearson(...(p => [p.map(a => a[0]), p.map(a => a[1])])(app.get('tutorDemoCloud').at(r))).r - r) < 1e-9, `demo cloud r = ${r}`);
});
test('regression narration: the pivoting line really does minimise the square area', () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8], y = [2.1, 3.9, 3.2, 5.8, 5.1, 7.4, 6.6, 9.0], def = app.regressionTutorDef(x, y);
    const st = app.tutorPearson(x, y), sse = s => x.reduce((t, xi, i) => t + (y[i] - (st.my + s * (xi - st.mx))) ** 2, 0), b = st.sxy / st.sxx;
    assert.ok(sse(b) < sse(b + 0.05) && sse(b) < sse(b - 0.05) && sse(b) < sse(0));
    assert.match(def.scenes[3].line, /slope 0\.8774.*falls to 4\.2973/);
    assert.equal(app.regressionTutorDef([1, 2], [1, 2]), null);
});
test('sampling tool: sample means centre on mu with spread sigma / sqrt(n), and a seed repeats the run', () => {
    const r = app.computeSamplingDistribution('skewed', 30, 2000, 5), again = app.computeSamplingDistribution('skewed', 30, 2000, 5);
    assert.deepEqual(Array.from(r.means), Array.from(again.means));
    assert.ok(Math.abs(r.meanOfMeans - 1) < 0.03, 'mean of means ' + r.meanOfMeans);
    assert.ok(Math.abs(r.sdOfMeans - 1 / Math.sqrt(30)) < 0.01, 'sd of means ' + r.sdOfMeans);
    for (const k of ['uniform', 'bimodal', 'normal']) { const q = app.computeSamplingDistribution(k, 25, 1500, 1); assert.ok(Math.abs(q.meanOfMeans - 0.5) < 0.02 && Math.abs(q.sdOfMeans - q.theorySd) < 0.01, k); }
    assert.ok(app.computeSamplingDistribution('skewed', 1, 100, null).error);
    assert.ok(app.computeSamplingDistribution('skewed', 30, 10, null).error);
    assert.match(app.cltTutorDef(r).scenes[3].line, /After 2000 samples.*bell shape.*σ \/ √n = 0\.18/);
});
