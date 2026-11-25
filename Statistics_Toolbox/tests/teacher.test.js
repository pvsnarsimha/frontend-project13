'use strict';
// The AI teacher's lessons: spoken numbers come from the student's own data, every tab has a class, and nothing says "undefined" or "NaN"
// (the drawing, the walking and the voice are covered by tests/e2e/teacher.js in a real browser).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./load-app');

const app = loadApp();
const topic = over => Object.assign({ moduleKey: 'descriptive', toolId: 'mean', title: '📐 Arithmetic Mean (Average)', formula: '📌 μ = (Σ xᵢ) / n', desc: 'Sum of all data points divided by the total count.', nums: [], topics: [] }, over);
const lines = sc => Array.from(sc).map(s => s.line + ' ' + s.board.join(' '));

test('a topic class has a greeting, a formula, a worked example, a question and a wrap-up', () => {
    const sc = app.teacherTopicLesson(topic());
    assert.deepEqual(Array.from(sc.map(s => s.id)), ['hello', 'why', 'formula', 'method', 'data', 'ask', 'bye']);
    assert.match(sc[0].line, /Good morning, class! .*Descriptive Statistics.*Arithmetic Mean/);
    assert.equal(sc[0].board[0], 'Arithmetic Mean (Average)', 'emoji are cleaned off the board');
    assert.equal(sc.find(s => s.id === 'ask').student, 2, 'a student raises a hand when she asks');
});

test('with the student\'s numbers the teacher works the topic through on THEIR data', () => {
    const sc = app.teacherTopicLesson(topic({ nums: [12, 45.5, 78, 99, 23, 51] }));
    const d = sc.find(s => s.id === 'data');
    assert.match(d.line, /6 values, from 12 up to 99/);
    assert.match(d.line, /mean is 51\.417/);
    assert.match(d.line, /the mean is 51\.417: that is 308\.5 divided by 6/);
    assert.ok(d.board.includes('mean = 51.417'));
});

test('topic-specific statistics are right: median, range, sample variance, SD', () => {
    const nums = [2, 4, 4, 4, 5, 5, 7, 9];
    const one = (id, re) => assert.match(app.teacherTopicLesson(topic({ toolId: id, nums })).find(s => s.id === 'data').line, re, id);
    one('median', /median is 4\.5/); one('range', /range is 7: that is 9 minus 2/);
    one('variance', /sample variance is 4\.5714/); one('stddev', /standard deviation is 2\.1381: that is the square root/);
    one('mode', /mode is 4: that is it appears 3 times/);
});

test('without numbers the teacher asks the student to type some', () => {
    const d = app.teacherTopicLesson(topic()).find(s => s.id === 'data');
    assert.match(d.line, /Type your own numbers into the box below/);
});

test('geometric / harmonic means are skipped (not mis-stated) when a value is not positive', () => {
    const d = app.teacherTopicLesson(topic({ toolId: 'geometric', nums: [3, -1, 4] })).find(s => s.id === 'data');
    assert.doesNotMatch(d.line, /geometric mean is/);
    assert.match(app.teacherTopicLesson(topic({ toolId: 'geometric', nums: [2, 8] })).find(s => s.id === 'data').line, /geometric mean is 4:/);
});

test('every tab has an overview class, and the hypothesis class teaches the four steps and the p < alpha rule', () => {
    for (const key of ['descriptive', 'manipulation', 'probability', 'correlation', 'hypothesis', 'regression']) {
        const sc = app.teacherTabLesson({ moduleKey: key, topics: ['Alpha', 'Beta', 'Gamma'] });
        assert.ok(sc.length >= 5, key);
        assert.match(sc[0].line, /Welcome to /);
        assert.match(sc.find(s => s.id === 'tour').line, /3 topics/);
    }
    const h = app.teacherTabLesson({ moduleKey: 'hypothesis', topics: [] });
    assert.match(h.find(s => s.id === 'method').line, /smaller than alpha we reject the null hypothesis/);
    assert.match(h.find(s => s.id === 'ask').line, /does not prove H₀ true|Failing to reject/);
});

test('hand-written notes exist for the main topics and are used in the "what to watch" scene', () => {
    assert.match(app.teacherTopicLesson(topic({ toolId: 'anova', moduleKey: 'hypothesis' })).find(s => s.id === 'ask').line, /Tukey/);
    assert.match(app.teacherTopicLesson(topic({ toolId: 'variance' })).find(s => s.id === 'ask').line, /n minus 1/);
});

test('no lesson text says undefined / NaN / [object', () => {
    for (const key of ['descriptive', 'hypothesis']) for (const nums of [[], [1, 2, 3, 4, 5]]) {
        for (const l of lines(app.teacherTopicLesson(topic({ moduleKey: key, nums })))) assert.doesNotMatch(l, /undefined|NaN|\[object|Infinity/);
    }
    for (const l of lines(app.teacherTabLesson({ moduleKey: 'probability', topics: [] }))) assert.doesNotMatch(l, /undefined|NaN/);
});

test('the board shows at most one short heading and the scenes are long enough to speak', () => {
    for (const s of app.teacherTopicLesson(topic({ nums: [1, 2, 3] }))) { assert.ok(s.board.length >= 2 && s.board.length <= 6, s.id); assert.ok(s.ms >= 2000, s.id); assert.ok(['greet', 'explain', 'write', 'point', 'count', 'ask'].includes(s.pose), s.id); }
});
