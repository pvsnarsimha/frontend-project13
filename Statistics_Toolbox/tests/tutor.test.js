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
