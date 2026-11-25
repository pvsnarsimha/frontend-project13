// AI Teacher classroom: an animated maths teacher at a chalkboard, drawn on a canvas (nothing is downloaded, nothing is sent anywhere).
// The player (play / pause / replay / step dots / voice) is js/core/tutor.js; the lessons are js/core/teacher-lessons.js.
//
// The teacher is a small skeleton, not a pre-recorded clip, so her movement follows what she is saying:
//   * arms are two-bone limbs solved by inverse kinematics, so her hand really reaches the spot she is chalking or pointing at;
//   * she walks along the board to stand next to the line she is writing (legs swing while she moves), then returns to the middle;
//   * her mouth opens and closes while the line is being spoken, she blinks, breathes, turns her eyes and head to the board or the class;
//   * poses: greet (waves), explain (open hands), write (chalking at the board), point (at the lines), count (raised fingers), ask (hand out to a student);
//   * in the "ask" scene a student in the second row puts a hand up.

const TEACHER_W = 640, TEACHER_H = 360;
const TEACHER_ASPECT = TEACHER_H / TEACHER_W;
const TEACHER_FEET = 272, TEACHER_K = 0.95, TEACHER_REST_X = 520;
const TEACHER_BOARD = { x: 24, y: 34, w: 400, h: 176 };
const teacherClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const teacherSmooth = (cur, target, dt, rate) => cur + (target - cur) * (1 - Math.exp(-dt * rate));
const teacherRoundRect = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };

// two-bone inverse kinematics: elbow position for a shoulder (sx, sy), a wanted hand (tx, ty) and bone lengths a, b. bend picks which way the elbow points.
function teacherIK(sx, sy, tx, ty, a, b, bend) {
    let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 0.001;
    const reach = teacherClamp(d, Math.abs(a - b) + 0.5, a + b - 0.5), base = Math.atan2(dy, dx);
    const cosA = teacherClamp((a * a + reach * reach - b * b) / (2 * a * reach), -1, 1), ang = Math.acos(cosA) * bend;
    return { ex: sx + a * Math.cos(base + ang), ey: sy + a * Math.sin(base + ang), hx: sx + reach * Math.cos(base), hy: sy + reach * Math.sin(base) };
}

// Chalk lines wrapped to the board width, with the position of every character so the "hand" can follow the chalk.
function teacherLayoutBoard(ctx, lines) {
    const out = [], maxW = TEACHER_BOARD.w - 36;
    lines.forEach((text, i) => {
        const head = i === 0;
        ctx.font = head ? '800 19px Inter, system-ui, sans-serif' : '600 15px Inter, system-ui, sans-serif';
        const words = String(text).split(/\s+/), rows = [];
        let row = '';
        words.forEach(w => { const t = row ? row + ' ' + w : w; if (row && ctx.measureText(t).width > maxW) { rows.push(row); row = w; } else row = t; });
        if (row) rows.push(row);
        rows.forEach(r => out.push({ text: r, head }));
    });
    return out.slice(0, 7);
}

function teacherDrawRoom(ctx, t, now) {
    // wall and floor
    let g = ctx.createLinearGradient(0, 0, 0, 230); g.addColorStop(0, '#f1ecd9'); g.addColorStop(1, '#e2dcc4');
    ctx.fillStyle = g; ctx.fillRect(0, 0, TEACHER_W, 236);
    g = ctx.createLinearGradient(0, 226, 0, TEACHER_H); g.addColorStop(0, '#c99a66'); g.addColorStop(1, '#a87644');
    ctx.fillStyle = g; ctx.fillRect(0, 226, TEACHER_W, TEACHER_H - 226);
    ctx.fillStyle = '#8e6236'; ctx.fillRect(0, 226, TEACHER_W, 5);                       // skirting board
    ctx.strokeStyle = 'rgba(90,60,30,.18)'; ctx.lineWidth = 1;                           // floor boards
    for (let i = 0; i < 6; i++) { const y = 236 + i * 22; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TEACHER_W, y); ctx.stroke(); }
    // ceiling lights
    [90, 300, 510].forEach(x => { ctx.fillStyle = '#f8fafc'; ctx.fillRect(x - 46, 6, 92, 7); ctx.fillStyle = 'rgba(255,255,230,.55)'; ctx.fillRect(x - 40, 13, 80, 4); });
    // window with daylight
    const wx = 448, wy = 34, ww = 74, wh = 120;
    ctx.fillStyle = '#8b6a43'; ctx.fillRect(wx - 5, wy - 5, ww + 10, wh + 10);
    g = ctx.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#9fd3f5'); g.addColorStop(1, '#e3f3ff'); ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = '#7fb069'; ctx.fillRect(wx, wy + wh - 22, ww, 22);                  // trees outside
    ctx.fillStyle = '#6a9a57'; ctx.beginPath(); ctx.arc(wx + 22, wy + wh - 22, 18, 0, Math.PI * 2); ctx.arc(wx + 52, wy + wh - 20, 15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8b6a43'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,248,214,.22)'; ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx + ww, wy + wh); ctx.lineTo(wx + ww + 120, 236); ctx.lineTo(wx + 50, 236); ctx.closePath(); ctx.fill();   // light beam
    // wall clock (the real time)
    const cx = 556, cy = 56, d = new Date(now);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 19, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#334155'; ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * 15, cy - Math.cos(a) * 15); ctx.lineTo(cx + Math.sin(a) * 17, cy - Math.cos(a) * 17); ctx.lineWidth = 1.2; ctx.stroke(); }
    const hA = ((d.getHours() % 12) + d.getMinutes() / 60) * Math.PI / 6, mA = d.getMinutes() * Math.PI / 30;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(hA) * 9, cy - Math.cos(hA) * 9); ctx.stroke();
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(mA) * 14, cy - Math.cos(mA) * 14); ctx.stroke();
    // notice board with sheets
    ctx.fillStyle = '#b08a5a'; ctx.fillRect(588, 84, 46, 70); ctx.fillStyle = '#d7b98a'; ctx.fillRect(591, 87, 40, 64);
    [['#fde68a', 594, 91], ['#bfdbfe', 610, 94], ['#fecaca', 596, 118], ['#bbf7d0', 612, 122]].forEach(([col, x, y]) => { ctx.fillStyle = col; ctx.fillRect(x, y, 15, 22); });
}

function teacherDrawBoard(ctx, lines, p, scene, tt) {
    const B = TEACHER_BOARD;
    ctx.fillStyle = '#8a5a2b'; teacherRoundRect(ctx, B.x - 7, B.y - 7, B.w + 14, B.h + 14, 6); ctx.fill();
    const g = ctx.createLinearGradient(B.x, B.y, B.x + B.w, B.y + B.h); g.addColorStop(0, '#24584a'); g.addColorStop(1, '#173f35');
    ctx.fillStyle = g; ctx.fillRect(B.x, B.y, B.w, B.h);
    ctx.fillStyle = 'rgba(255,255,255,.045)'; ctx.beginPath(); ctx.ellipse(B.x + 120, B.y + 90, 150, 60, -0.3, 0, Math.PI * 2); ctx.fill();     // chalk dust
    ctx.fillStyle = '#6b4520'; ctx.fillRect(B.x - 4, B.y + B.h, B.w + 8, 7);                                                                 // chalk tray
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(B.x + 40, B.y + B.h - 2, 16, 3); ctx.fillStyle = '#fde68a'; ctx.fillRect(B.x + 60, B.y + B.h - 2, 11, 3);
    ctx.font = '700 10px Inter, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fillText('SMART CLASSROOM', B.x + B.w - 10, B.y + 8);

    const rows = teacherLayoutBoard(ctx, lines);
    const total = rows.reduce((a, r, i) => a + (i === 0 ? 0 : r.text.length), 0);
    let typed = Math.ceil(total * teacherClamp(p * 1.15, 0, 1)), pen = null, y = B.y + 34;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    rows.forEach((r, i) => {
        const size = r.head ? 19 : 15, lh = r.head ? 30 : 23;
        ctx.font = (r.head ? '800 ' : '600 ') + size + 'px Inter, system-ui, sans-serif';
        const n = i === 0 ? r.text.length : teacherClamp(typed, 0, r.text.length);
        if (i > 0) typed -= n;
        const s = r.text.slice(0, n);
        ctx.fillStyle = r.head ? '#fde68a' : '#f1f5f9'; ctx.fillText(s, B.x + 18, y);
        if (i === 0 || n > 0) pen = { x: B.x + 18 + ctx.measureText(s).width + 3, y };
        if (i === 0 && rows.length > 1) { ctx.fillStyle = 'rgba(253,230,138,.55)'; ctx.fillRect(B.x + 18, y + 13, Math.min(ctx.measureText(r.text).width, B.w - 36), 1.5); }
        y += lh;
    });
    return pen || { x: B.x + 30, y: B.y + 40 };
}

function teacherDrawStudents(ctx, tt, raise, pace) {
    const base = [{ x: 70, c: '#e5e7eb', h: '#2b1b12', s: '#d9a273' }, { x: 190, c: '#bfdbfe', h: '#111827', s: '#c68642' }, { x: 320, c: '#f1f5f9', h: '#5b3a1e', s: '#e0ac69' }, { x: 440, c: '#e5e7eb', h: '#1f2937', s: '#d9a273' }, { x: 565, c: '#bfdbfe', h: '#3f2a14', s: '#c68642' }];
    base.forEach((s, i) => {
        const bob = Math.sin(tt / 900 + i * 1.7) * 1.2, y = 318 + bob;
        const up = i === raise ? teacherClamp(pace, 0, 1) : 0;
        // shoulders and head seen from behind
        ctx.fillStyle = s.c; teacherRoundRect(ctx, s.x - 30, y - 14, 60, 52, 18); ctx.fill();
        ctx.fillStyle = s.s; ctx.fillRect(s.x - 5, y - 20, 10, 9);
        ctx.fillStyle = s.h; ctx.beginPath(); ctx.ellipse(s.x, y - 33, 17, 19, 0, 0, Math.PI * 2); ctx.fill();
        if (up > 0) {      // raised arm
            ctx.strokeStyle = s.c; ctx.lineWidth = 9; ctx.lineCap = 'round';
            const hx = s.x + 22, hy = y - 14 - 62 * up + Math.sin(tt / 140) * 2 * up;
            ctx.beginPath(); ctx.moveTo(s.x + 24, y - 6); ctx.lineTo(hx, hy); ctx.stroke();
            ctx.fillStyle = s.s; ctx.beginPath(); ctx.arc(hx, hy - 3, 5.5, 0, Math.PI * 2); ctx.fill();
        }
    });
    // desks
    ctx.fillStyle = '#9a6a3a'; ctx.fillRect(0, 346, TEACHER_W, 14);
    ctx.fillStyle = '#b68450'; ctx.fillRect(0, 340, TEACHER_W, 8);
}

// ---- the teacher ----
function teacherDrawLimb(ctx, pts, w, col, edge) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = edge; ctx.lineWidth = w + 1.6; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
}

function teacherDrawFigure(ctx, st, tt) {
    const skin = '#e8b890', skinShade = '#d49c74', blouse = '#cfe3f5', blouseEdge = '#9fbfdc', trouser = '#c9b690', trouserEdge = '#a8966f';
    const A = 44, B = 41, SX = 21, SY = -150;
    // legs
    const sw = Math.sin(st.walk) * st.walkAmt * 0.5;
    [[-1, sw], [1, -sw]].forEach(([side, swing]) => {
        const hx = side * 9, hy = -98, kx = hx + Math.sin(swing) * 24, ky = hy + 47, ax = kx + Math.sin(swing * 0.4) * 8 - side * 1.5, ay = -4 - Math.max(0, Math.sin(swing * 2) * 5);
        teacherDrawLimb(ctx, [[hx, hy], [kx, ky], [ax, ay]], 17, trouser, trouserEdge);
        ctx.fillStyle = '#2f2a2a'; ctx.beginPath(); ctx.ellipse(ax + side * 2, ay + 3, 12, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    });
    // hips and torso (breathing moves the chest a little)
    const br = Math.sin(tt / 700) * 0.9;
    ctx.fillStyle = trouser; teacherRoundRect(ctx, -20, -104, 40, 16, 8); ctx.fill();
    ctx.save(); ctx.translate(0, SY + 2); ctx.rotate(st.lean * 0.05); ctx.translate(0, -(SY + 2));
    const bg = ctx.createLinearGradient(-24, 0, 24, 0); bg.addColorStop(0, '#bcd6ee'); bg.addColorStop(0.5, blouse); bg.addColorStop(1, '#bcd6ee');
    ctx.fillStyle = bg; ctx.strokeStyle = blouseEdge; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-SX - 3, SY + 4); ctx.quadraticCurveTo(0, SY - 6 - br, SX + 3, SY + 4); ctx.lineTo(19, -100); ctx.quadraticCurveTo(0, -96, -19, -100); ctx.closePath(); ctx.fill(); ctx.stroke();
    // collar, lanyard, ID card
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-7, SY - 3); ctx.lineTo(0, SY + 9); ctx.lineTo(-13, SY + 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(7, SY - 3); ctx.lineTo(0, SY + 9); ctx.lineTo(13, SY + 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, SY - 2); ctx.lineTo(-1, -118); ctx.moveTo(8, SY - 2); ctx.lineTo(1, -118); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1; teacherRoundRect(ctx, -8, -118, 16, 20, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2563eb'; ctx.fillRect(-8, -118, 16, 5); ctx.fillStyle = '#475569'; ctx.font = '800 4.6px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AI TEACHER', 0, -106);
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(-5, -102, 10, 1.4);
    ctx.restore();
    // neck
    ctx.fillStyle = skinShade; teacherRoundRect(ctx, -5.5, -163, 11, 14, 4); ctx.fill();
    // head: turns a little towards what she is looking at
    const hx = st.look * 3.2, hy = -176, nod = st.nod;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(st.look * 0.05 + nod * 0.04);
    // hair behind the head + bun
    ctx.fillStyle = '#2b1b14'; ctx.beginPath(); ctx.ellipse(0, -2, 19.5, 21, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-st.look * 3 + 1, -23, 8.5, 0, Math.PI * 2); ctx.fill();
    // face
    const fg = ctx.createLinearGradient(-15, -16, 15, 18); fg.addColorStop(0, '#f2c8a2'); fg.addColorStop(1, skin);
    ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(0, 1, 15, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(-15.2, 2, 2.4, 4, 0, 0, Math.PI * 2); ctx.ellipse(15.2, 2, 2.4, 4, 0, 0, Math.PI * 2); ctx.fill();            // ears
    ctx.fillStyle = '#f6d365'; ctx.beginPath(); ctx.arc(-15.6, 7.5, 1.4, 0, Math.PI * 2); ctx.arc(15.6, 7.5, 1.4, 0, Math.PI * 2); ctx.fill();                          // earrings
    // hair on top: a side parting
    ctx.fillStyle = '#2b1b14'; ctx.beginPath(); ctx.moveTo(-16, -3); ctx.bezierCurveTo(-18, -20, -4, -24, 4, -21); ctx.bezierCurveTo(12, -20, 17, -12, 16, -2); ctx.bezierCurveTo(13, -11, 8, -14, 0, -13); ctx.bezierCurveTo(-8, -12, -13, -9, -16, -3); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-9, -17); ctx.quadraticCurveTo(0, -21, 9, -16); ctx.stroke();
    // cheeks, nose
    ctx.fillStyle = 'rgba(224,122,110,.22)'; ctx.beginPath(); ctx.ellipse(-8.5, 8, 3.8, 2.4, 0, 0, Math.PI * 2); ctx.ellipse(8.5, 8, 3.8, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(160,100,70,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(st.look * 0.8, 2); ctx.quadraticCurveTo(st.look * 0.8 + 1.8, 7, st.look * 0.8 - 0.4, 8); ctx.stroke();
    // eyes (gaze follows st.look; blink closes them)
    const eo = st.look * 1.9, open = st.blink;
    [-6.4, 6.4].forEach(ex => {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex + st.look * 0.5, -1.5, 3.7, 2.7 * open + 0.15, 0, 0, Math.PI * 2); ctx.fill();
        if (open > 0.25) {
            ctx.save(); ctx.beginPath(); ctx.ellipse(ex + st.look * 0.5, -1.5, 3.7, 2.7 * open, 0, 0, Math.PI * 2); ctx.clip();
            ctx.fillStyle = '#4a2e1b'; ctx.beginPath(); ctx.arc(ex + eo, -1.4 + st.gazeY, 2.1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0b0b0b'; ctx.beginPath(); ctx.arc(ex + eo, -1.4 + st.gazeY, 1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(ex + eo + 0.8, -2.2 + st.gazeY, 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        ctx.strokeStyle = '#2b1b14'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(ex + st.look * 0.5, -1.5, 3.8, 2.8 * open + 0.15, 0, Math.PI, Math.PI * 2); ctx.stroke();
    });
    ctx.strokeStyle = '#2b1b14'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    [-1, 1].forEach(s => { const x = s * 6.4 + st.look * 0.5, y = -7.2 - st.brow; ctx.beginPath(); ctx.moveTo(x - 4, y + 1.2 * s * -1 * 0 + 1); ctx.quadraticCurveTo(x, y - 1.4, x + 4, y + 1); ctx.stroke(); });
    // mouth: opens and closes with the speech, smiles when she greets
    const m = st.mouth, sm = st.smile, mx = st.look * 0.6, my = 11.5;
    if (m > 0.06) {
        ctx.fillStyle = '#6b1f2a'; ctx.beginPath(); ctx.ellipse(mx, my + m * 1.6, 4.4 + sm * 0.6, 0.8 + m * 3.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(mx, my + m * 0.5 - 0.2, 3.2, 0.9, 0, 0, Math.PI); ctx.fill();
        ctx.strokeStyle = '#c0545a'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.ellipse(mx, my + m * 1.6, 4.6 + sm * 0.6, 1 + m * 3.7, 0, 0, Math.PI * 2); ctx.stroke();
    } else {
        ctx.strokeStyle = '#c0545a'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(mx - 4.6, my - sm * 0.6); ctx.quadraticCurveTo(mx, my + 1.4 + sm * 2.4, mx + 4.6, my - sm * 0.6); ctx.stroke();
    }
    ctx.restore();

    // arms: shoulder -> elbow -> hand by IK
    [-1, 1].forEach(side => {
        const hand = side < 0 ? st.handL : st.handR, shx = side * SX, ik = teacherIK(shx, SY + 4, shx + hand.x, SY + 4 + hand.y, A, B, side < 0 ? -1 : 1);
        teacherDrawLimb(ctx, [[shx, SY + 5], [ik.ex, ik.ey], [ik.hx, ik.hy]], 11, blouse, blouseEdge);
        ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(ik.hx, ik.hy, 5.4, 0, Math.PI * 2); ctx.fill();
        if (side < 0 && st.chalk) {     // chalk in the board-side hand
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ik.hx - 1, ik.hy + 1); ctx.lineTo(ik.hx - 6, ik.hy - 2); ctx.stroke();
        }
        st['tip' + (side < 0 ? 'L' : 'R')] = { x: ik.hx, y: ik.hy };
    });
}

// What each pose asks of her hands (relative to her shoulders, y down, in her own units), her feet and her face.
function teacherPoseTargets(pose, tt, pen, restX) {
    const w = Math.sin(tt / 230), s = Math.sin(tt / 520), c = Math.cos(tt / 420);
    switch (pose) {
        case 'greet': return { L: [-18 + 0, 78], R: [38 + w * 8, -52 + Math.abs(w) * 6], x: restX, look: 0, smile: 1, brow: 1.2, lean: 0 };
        case 'explain': return { L: [-42 + c * 4, 30 + s * 5], R: [42 + s * 4, 26 + c * 5], x: restX - 20, look: 0.2, smile: 0.5, brow: 0.4, lean: s };
        case 'write': return { board: true, L: null, R: [28, 70], x: pen ? pen.x + 78 : 380, look: -1, smile: 0.1, brow: 0, lean: -1, chalk: true, jiggle: 1 };
        case 'point': return { board: true, L: null, R: [30, 68], x: pen ? pen.x + 84 : 380, look: -0.7, smile: 0.2, brow: 0.2, lean: -0.5, jiggle: 0.35 };
        case 'count': return { L: [-18, 76], R: [30 + s * 3, -4 + Math.abs(c) * 8], x: restX - 10, look: 0, smile: 0.4, brow: 0.5, lean: 0.3 };
        case 'ask': return { L: [-22, 70], R: [60, 8 + s * 4], x: restX - 30, look: 0.9, smile: 0.9, brow: 0.8, lean: 0.4 };
        default: return { L: [-18, 78], R: [18, 78], x: restX, look: 0, smile: 0.3, brow: 0, lean: 0 };
    }
}

// The scene definition handed to the player. `scenes` come from teacherTopicLesson / teacherTabLesson.
function teacherLessonDef(key, title, hint, scenes) {
    const rig = { x: TEACHER_REST_X, handL: { x: -18, y: 78 }, handR: { x: 18, y: 78 }, look: 0, gazeY: 0, mouth: 0, smile: 0.3, brow: 0, lean: 0, walk: 0, walkAmt: 0, blink: 1, nod: 0, stu: 0, last: 0, pen: null, chalk: false };
    scenes.forEach(s => { s.board = s.board && s.board.length ? s.board : [title]; });

    function draw(ctx, W, H, at) {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()), scene = scenes[at.scene], tt = at.t || 0;
        let dt = Math.min(0.1, Math.max(0.001, (now - rig.last) / 1000)); const snap = !rig.last || now - rig.last > 400; rig.last = now;
        ctx.save(); ctx.scale(W / TEACHER_W, H / TEACHER_H);
        teacherDrawRoom(ctx, tt, Date.now());
        const pen = teacherDrawBoard(ctx, scene.board, teacherClamp(at.p * 1.0, 0, 1), at.scene, tt);
        const tg = teacherPoseTargets(scene.pose, now, pen, TEACHER_REST_X);
        // her stand: walk to the chalk, or back to the middle
        const wantX = teacherClamp(tg.x, 250, 575), r = snap ? 1 : 1 - Math.exp(-dt * 2.4), dx = (wantX - rig.x) * r;
        rig.x += dx; const speed = Math.abs(dx) / dt;
        rig.walkAmt = teacherSmooth(rig.walkAmt, teacherClamp(speed / 60, 0, 1.2), dt, 10); if (snap) rig.walkAmt = 0; rig.walk += dt * 9 * (0.4 + rig.walkAmt);
        const rate = snap ? 1000 : 7;
        // hands: toward the board point (world -> her local units), or the pose's resting place
        const k = TEACHER_K, shoulderWorld = { x: rig.x - 21 * k, y: TEACHER_FEET - 146 * k };
        let tl = tg.L, trgt = tg.R;
        if (tg.board) {
            const jig = tg.jiggle ? Math.sin(now / 70) * 2.2 * tg.jiggle : 0, pt = pen || { x: 80, y: 80 };
            tl = [(pt.x - shoulderWorld.x) / k + 2 + jig, (pt.y - shoulderWorld.y) / k + 2 + Math.cos(now / 90) * 1.5 * tg.jiggle];
            trgt = [30, 68];
        }
        rig.handL.x = teacherSmooth(rig.handL.x, tl[0], dt, rate); rig.handL.y = teacherSmooth(rig.handL.y, tl[1], dt, rate);
        rig.handR.x = teacherSmooth(rig.handR.x, trgt[0], dt, rate); rig.handR.y = teacherSmooth(rig.handR.y, trgt[1], dt, rate);
        // keep the hand within what the arm can reach: she steps closer instead of stretching
        rig.look = teacherSmooth(rig.look, scene.look === 'board' || tg.board ? -1 : (tg.look || 0), dt, snap ? 1000 : 5);
        rig.smile = teacherSmooth(rig.smile, tg.smile, dt, 4); rig.brow = teacherSmooth(rig.brow, tg.brow, dt, 5); rig.lean = teacherSmooth(rig.lean, tg.lean, dt, 4);
        rig.nod = Math.sin(now / 900) * 0.6 + (at.speaking ? Math.sin(now / 260) * 0.8 : 0);
        rig.gazeY = scene.look === 'class' ? 0.5 : 0;
        // mouth follows speech
        const talk = at.speaking ? 0.28 + 0.72 * Math.abs(Math.sin(now / 105) * Math.sin(now / 331 + 1.3) + 0.35 * Math.sin(now / 47)) : 0;
        rig.mouth = teacherSmooth(rig.mouth, teacherClamp(talk, 0, 1), dt, 28);
        // blink every ~3.4 seconds
        const bp = (now % 3400) / 3400; rig.blink = bp > 0.965 ? 1 - Math.sin((bp - 0.965) / 0.035 * Math.PI) * 0.95 : 1;
        rig.chalk = !!tg.chalk;
        // the teacher stands in front of the board
        ctx.save(); ctx.translate(rig.x, TEACHER_FEET); ctx.scale(k, k);
        ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(0, 2, 34, 6, 0, 0, Math.PI * 2); ctx.fill();
        teacherDrawFigure(ctx, rig, now);
        ctx.restore();
        // the students sit in front of her (one raises a hand in the "ask" scene)
        const askScene = typeof scene.student === 'number';
        teacherDrawStudents(ctx, tt, askScene ? scene.student : -1, askScene ? tt / 900 : 0);
        ctx.restore();
    }
    return { key, title, hint, aspect: TEACHER_ASPECT, description: `${title}. An animated maths teacher explains this topic at a chalkboard with a spoken narration and a caption.`, scenes, draw };
}

// ---- mounting in the page ----
let teacherMode = 'topic';       // 'topic' or 'tab': which class the card plays
const TEACHER_AREA = 'teacherArea';

function teacherReadNumbers() {
    try {
        const ta = document.querySelector('#interfaceRoot .data-input-section textarea') || document.querySelector('#interfaceRoot textarea');
        if (ta && typeof parseNumbersFromInput === 'function') return parseNumbersFromInput(ta.value || '');
    } catch (e) { /* no data yet */ }
    return [];
}

function teacherPageInfo(statId) {
    const root = document.getElementById('interfaceRoot');
    const text = sel => { const el = root && root.querySelector(sel); return el ? el.textContent : ''; };
    const btn = document.querySelector('.stat-btn[data-stat="' + statId + '"]');
    const side = btn && btn.closest('.action-sidebar');
    const moduleKey = side ? side.dataset.module : 'descriptive';
    const topics = side ? Array.from(side.querySelectorAll('.stat-btn[data-stat]')).map(b => b.textContent) : [];
    return { moduleKey, toolId: statId, title: text('.interface-title') || (btn ? btn.textContent : ''), formula: text('.formula'), desc: text('.formula-card .desc') || text('.desc'), nums: teacherReadNumbers(), topics };
}

function mountTeacherClass(statId, mode) {
    try {
        if (mode) teacherMode = mode;
        const root = document.getElementById('interfaceRoot');
        if (!root || typeof root.querySelector !== 'function') return null;
        const card = root.querySelector('.formula-card');
        if (!card || typeof card.insertAdjacentElement !== 'function') return null;
        let area = document.getElementById(TEACHER_AREA);
        if (area && area.parentNode) area.remove();
        area = document.createElement('div'); area.id = TEACHER_AREA; area.className = 'teacher-area';
        card.insertAdjacentElement('afterend', area);
        const info = teacherPageInfo(statId), tab = TEACHER_TABS[info.moduleKey] || TEACHER_TABS.descriptive;
        const dock = document.createElement('div'); dock.className = 'teacher-dock'; dock.setAttribute('role', 'group'); dock.setAttribute('aria-label', 'AI Teacher class');
        const mk = (label, mode2, extra) => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'teacher-tab' + (teacherMode === mode2 ? ' on' : ''); b.textContent = label; b.setAttribute('aria-pressed', String(teacherMode === mode2));
            b.onclick = () => mountTeacherClass(statId, mode2); return b;
        };
        dock.append(Object.assign(document.createElement('span'), { className: 'teacher-badge', textContent: '🎓 AI Teacher class' }), mk('This topic', 'topic'), mk('About this tab', 'tab'));
        area.appendChild(dock);
        const topicTitle = teacherClean(info.title);
        const scenes = teacherMode === 'tab' ? teacherTabLesson(info) : teacherTopicLesson(info);
        const def = teacherLessonDef('teacher', teacherMode === 'tab' ? `🎓 ${tab.name}: class overview` : `🎓 AI Teacher: ${topicTitle}`,
            teacherMode === 'tab' ? 'Your AI maths teacher introduces this whole tab. Press Play.' : 'Your AI maths teacher teaches this topic at the board, using your own numbers when you have typed some. Press Play.', scenes);
        return mountTutorCard(TEACHER_AREA, def);
    } catch (e) { return null; }       // a stub DOM (unit tests) or a page without the interface: no class, no harm
}

// Typing new numbers updates the lesson (not while it is playing).
let teacherRefreshTimer = 0;
function teacherScheduleRefresh() {
    clearTimeout(teacherRefreshTimer);
    teacherRefreshTimer = setTimeout(() => {
        const ctl = typeof tutorCards !== 'undefined' ? tutorCards.get('teacher') : null;
        if (ctl && ctl.state.playing) { teacherScheduleRefresh(); return; }
        if (typeof currentStat === 'string') mountTeacherClass(currentStat);
    }, 700);
}
