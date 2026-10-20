'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./load-app');

const app = loadApp();
const close = (actual, expected, tol, msg) =>
    assert.ok(Math.abs(actual - expected) <= tol, `${msg || ''} expected ${expected}, got ${actual}`);

test('normal CDF and quantile match reference values', () => {
    close(app.normCDF(0), 0.5, 1e-15);
    close(app.normCDF(1.96), 0.9750021048517795, 1e-12);
    close(app.normCDF(-3), 0.0013498980316301, 1e-12);
    close(app.normInv(0.975), 1.959963984540054, 1e-12);
    close(app.normInv(0.5), 0, 1e-15);
    close(app.normInv(0.001), -3.090232306167813, 1e-12);
    assert.equal(app.normInv(0), -Infinity);
    assert.equal(app.normInv(1), Infinity);
    assert.ok(Number.isNaN(app.normInv(1.5)));
});

test('normInv inverts normCDF across the whole range', () => {
    for (const p of [1e-9, 1e-5, 0.01, 0.2, 0.5, 0.8, 0.99, 1 - 1e-6]) {
        close(app.normCDF(app.normInv(p)), p, 1e-12 + p * 1e-9, `p=${p}`);
    }
});

test('erf is accurate (the old 7.1.26 approximation was only good to 1.5e-7)', () => {
    close(app.erf(0.5), 0.5204998778130465, 1e-14);
    close(app.erf(1), 0.8427007929497149, 1e-14);
    close(app.erf(-2), -0.9953222650189527, 1e-14);
    close(app.erf(4), 0.9999999845827421, 1e-14);
});

test('t critical values at any df (not only tabulated df)', () => {
    close(app.tCriticalValue(0.025, 1), 12.706204736432095, 1e-9);
    close(app.tCriticalValue(0.025, 10), 2.2281388519649385, 1e-9);
    close(app.tCriticalValue(0.025, 15), 2.131449545559776, 1e-9);   // df 15 is not in any lookup table
    close(app.tCriticalValue(0.05, 27), 1.703288445722127, 1e-9);
    close(app.tCriticalValue(0.005, 14), 2.976842734370834, 1e-9);
    close(app.tCriticalValue(0.025, 1000), 1.9623390808264078, 1e-8);
    close(app.tCriticalValue(0.95, 10), -app.tCriticalValue(0.05, 10), 1e-12);
});

test('F critical values at any df pair', () => {
    close(app.fCriticalValue(0.05, 1, 1), 161.4476387975881, 1e-6);
    close(app.fCriticalValue(0.05, 3, 15), 3.2873821046365115, 1e-8);
    close(app.fCriticalValue(0.05, 5, 20), 2.7108898372096912, 1e-8);
    close(app.fCriticalValue(0.01, 4, 25), 4.177420234645642, 1e-8);
    close(app.fCriticalValue(0.05, 2, 200), 3.0410557911252476, 1e-8);          // beyond the old 120 cap
});

test('chi-square critical values at any df and alpha', () => {
    close(app.chiSquareCriticalValue(0.05, 1), 3.841458820694124, 1e-9);
    close(app.chiSquareCriticalValue(0.05, 15), 24.99579013972863, 1e-8);   // beyond the old df<=10 table
    close(app.chiSquareCriticalValue(0.01, 25), 44.314104896219156, 1e-8);
    close(app.chiSquareCriticalValue(0.10, 12), 18.54934778670325, 1e-8);
    close(app.chiSquareCriticalValue(0.05, 500), 553.1268089342569, 1e-6);
    close(app.chiSquareCriticalValue(0.025, 4), 11.143286781877796, 1e-8);         // alpha not in the old table
});

test('critical values invert their CDFs', () => {
    for (const df of [1, 2, 5, 17, 60]) {
        close(1 - app.chiSquareCDF(app.chiSquareCriticalValue(0.05, df), df), 0.05, 1e-10, `chi2 df=${df}`);
        close(1 - app.tCDF(app.tCriticalValue(0.05, df), df), 0.05, 1e-10, `t df=${df}`);
        close(1 - app.fCDF(app.fCriticalValue(0.05, df, 9), df, 9), 0.05, 1e-10, `F df=${df}`);
    }
});

test('chi-square CDF is stable for large df and large x (old series overflowed)', () => {
    close(app.chiSquareCDF(400, 400), 0.5094034180072367, 1e-10);
    close(app.chiSquareCDF(1000, 3), 1, 1e-12);
    close(app.chiSquareCDF(0, 3), 0, 0);
});

test('studentized range critical values match published values for any k, df and alpha', () => {
    close(app.studentizedRangeCritical(0.05, 3, 10), 3.876776750013158, 1e-6);
    close(app.studentizedRangeCritical(0.05, 4, 20), 3.9582935609454, 1e-6);
    close(app.studentizedRangeCritical(0.01, 5, 12), 5.836308366059152, 1e-6);   // alpha != 0.05
    close(app.studentizedRangeCritical(0.05, 3, 2), 8.330782645637044, 1e-6);    // small df
    close(app.studentizedRangeCritical(0.10, 6, 30), 3.8510030725636, 1e-6);
});

test('beta CDF/quantile are exact', () => {
    close(app.betaCDF(0.3, 2, 5), 0.579825, 1e-6);
    close(app.betaCDF(app.betaQuantile(0.9, 2.5, 4), 2.5, 4), 0.9, 1e-12);
});

test('eigenvalues of small symmetric matrices', () => {
    const e = app.computeEigenvalues([[2, 1, 0], [1, 2, 0], [0, 0, 5]]);
    close(e[0], 5, 1e-9); close(e[1], 3, 1e-9); close(e[2], 1, 1e-9);
    const e2 = app.computeEigenvalues([[4, 1], [2, 3]]);
    close(e2[0], 5, 1e-12); close(e2[1], 2, 1e-12);
});

test('inverseMatrix reports a singular matrix instead of returning NaN', () => {
    assert.equal(app.inverseMatrix([[1, 2], [2, 4]]), null);
    const inv = app.inverseMatrix([[4, 7], [2, 6]]);
    close(inv[0][0], 0.6, 1e-12); close(inv[0][1], -0.7, 1e-12);
});

test('eigenvalues of a 4x4 companion matrix with known real roots (1, 2, 3, 4)', () => {
    // x^4 - 10x^3 + 35x^2 - 50x + 24 = (x-1)(x-2)(x-3)(x-4)
    const companion = [[0, 0, 0, -24], [1, 0, 0, 50], [0, 1, 0, -35], [0, 0, 1, 10]];
    const e = app.computeEigenvalues(companion);
    assert.equal(e.length, 4);
    [4, 3, 2, 1].forEach((v, i) => close(e[i], v, 1e-6));
    const d = app.computeEigenvalues([[5, 0, 0, 0], [0, -1, 0, 0], [0, 0, 3, 0], [0, 0, 0, 2]]);
    [5, 3, 2, -1].forEach((v, i) => close(d[i], v, 1e-9));
});

test('MANOVA with 3 dependent variables gives real, strictly decreasing eigenvalues', () => {
    const rows = ['Group, Y1, Y2, Y3',
        'A, 12, 15, 14', 'A, 14, 16, 17', 'A, 13, 14, 13', 'A, 15, 17, 15',
        'B, 18, 20, 19', 'B, 20, 22, 24', 'B, 19, 21, 20', 'B, 21, 24, 22',
        'C, 25, 27, 26', 'C, 27, 29, 28', 'C, 26, 28, 30', 'C, 24, 31, 27',
        'D, 30, 29, 33', 'D, 33, 35, 31', 'D, 31, 32, 36', 'D, 34, 30, 35'];
    const r = app.computeMANOVA(rows.join('\n'), 0.05);
    assert.ok(!r.error, r.message);
    const e = r.eigenvalues;
    assert.equal(e.length, 3);
    e.forEach(v => assert.ok(Number.isFinite(v)));
    assert.ok(e[0] > e[1] && e[1] > e[2] && e[2] > 0, `eigenvalues ${e}`);
    close(r.hotellingTrace, e[0] + e[1] + e[2], 1e-9);
    close(r.roysRoot, e[0], 1e-12);
});

test('studentizedRangeCritical is memoized on (alpha, k, df) without mixing up the keys', () => {
    const a = app.studentizedRangeCritical(0.05, 3, 10);
    assert.equal(app.studentizedRangeCritical(0.05, 3, 10), a);
    assert.notEqual(app.studentizedRangeCritical(0.05, 10, 3), a);
    assert.notEqual(app.studentizedRangeCritical(0.01, 3, 10), a);
    assert.ok(Number.isNaN(app.studentizedRangeCritical(0.05, 1, 10)));
});

test('symmetric and generalized eigenvalues: always real, agree with the general routine', () => {
    const s = app.symmetricEigenvalues([[2, 1, 0], [1, 2, 0], [0, 0, 5]]);
    [5, 3, 1].forEach((v, i) => close(s[i], v, 1e-10));
    // eigenvalues of W^-1 B for symmetric B and SPD W: 2x2 closed form check, B = diag(2, 3), W = diag(1, 3) -> 2, 1
    const g = app.generalizedSymmetricEigenvalues([[2, 0], [0, 3]], [[1, 0], [0, 3]]);
    close(g[0], 2, 1e-12); close(g[1], 1, 1e-12);
    assert.equal(app.generalizedSymmetricEigenvalues([[1, 0], [0, 1]], [[1, 2], [2, 1]]), null, 'indefinite W is rejected');
});

test('computeEigenvalues gives NaN, not wrong real numbers, for a rotation (complex eigenvalues)', () => {
    assert.ok(app.computeEigenvalues([[0, -1], [1, 0]]).every(Number.isNaN));
    assert.ok(app.computeEigenvalues([[0, -1, 0], [1, 0, 0], [0, 0, 2]]).every(Number.isNaN));
});
