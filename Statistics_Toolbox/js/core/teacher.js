// AI Teacher classroom, drawn in a cartoon style (bold outlines, flat bright colours, a big round head with huge expressive eyes, bouncy
// squash-and-stretch movement) on a canvas: nothing is downloaded and nothing is sent anywhere. The character is an original one.
// The player (play / pause / replay / voice / step dots) is js/core/tutor.js; the lessons are js/core/teacher-lessons.js.
//
// She is a small skeleton, not a recorded clip, so her movement follows what she is saying:
//   * arms are two-bone limbs solved by inverse kinematics: her hand (or pointer stick) really reaches the line she is chalking;
//   * she walks along the board to stand beside the line, bobbing as she goes, and returns to the middle;
//   * mouth opens and closes with the speech, eyes blink and look at the board or the class, her body squashes and stretches as she talks;
//   * poses: greet (waves), explain (arms wide), write (chalk), point (pointer stick), count, ask (hand out to a student), celebrate (jumps,
//     arms up, sparkles), oops (hands on cheeks, sweat drop), think (hand on chin, question mark);
//   * the students bounce, one puts a hand up when she asks, and they all cheer when the answer arrives.

const TEACHER_W = 640, TEACHER_H = 360;
const TEACHER_ASPECT = TEACHER_H / TEACHER_W;
const TEACHER_FEET = 276, TEACHER_REST_X = 520;
const TEACHER_BOARD = { x: 24, y: 34, w: 400, h: 176 };
const TEACHER_INK = '#2d2438';                   // outline colour of every shape
const teacherClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const teacherSmooth = (cur, target, dt, rate) => cur + (target - cur) * (1 - Math.exp(-dt * rate));
const teacherRoundRect = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
// fill + outline in one go
const teacherShape = (c, fill, w) => { if (fill) { c.fillStyle = fill; c.fill(); } c.lineWidth = w || 2.6; c.strokeStyle = TEACHER_INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); };

// two-bone inverse kinematics: elbow position for a shoulder (sx, sy), a wanted hand (tx, ty) and bone lengths a, b. bend picks which way the elbow points.
function teacherIK(sx, sy, tx, ty, a, b, bend) {
    const dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 0.001;
    const reach = teacherClamp(d, Math.abs(a - b) + 0.5, a + b - 0.5), base = Math.atan2(dy, dx);
    const cosA = teacherClamp((a * a + reach * reach - b * b) / (2 * a * reach), -1, 1), ang = Math.acos(cosA) * bend;
    return { ex: sx + a * Math.cos(base + ang), ey: sy + a * Math.sin(base + ang), hx: sx + reach * Math.cos(base), hy: sy + reach * Math.sin(base) };
}

// Chalk lines wrapped to the board width.
function teacherLayoutBoard(ctx, lines) {
    const out = [], maxW = 262;       // the text keeps to the left part of the board, so she can stand beside it without hiding it
    lines.forEach((text, i) => {
        const head = i === 0;
        ctx.font = head ? '800 19px Inter, system-ui, sans-serif' : '700 15px Inter, system-ui, sans-serif';
        const words = String(text).split(/\s+/), rows = [];
        let row = '';
        words.forEach(w => { const t = row ? row + ' ' + w : w; if (row && ctx.measureText(t).width > maxW) { rows.push(row); row = w; } else row = t; });
        if (row) rows.push(row);
        rows.forEach(r => out.push({ text: r, head }));
    });
    return out.slice(0, 7);
}

function teacherStar(ctx, x, y, r, rot, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.3 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); teacherShape(ctx, col, 1.6); ctx.restore();
}

function teacherDrawRoom(ctx, now) {
    // wall (cheerful yellow) with a stripe, wooden floor
    ctx.fillStyle = '#fff1b8'; ctx.fillRect(0, 0, TEACHER_W, 236);
    ctx.fillStyle = '#ffe28a'; ctx.fillRect(0, 196, TEACHER_W, 40);
    ctx.fillStyle = '#f0b868'; ctx.fillRect(0, 232, TEACHER_W, TEACHER_H - 232);
    ctx.fillStyle = TEACHER_INK; ctx.fillRect(0, 230, TEACHER_W, 3);
    ctx.strokeStyle = 'rgba(120,70,20,.22)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const y = 244 + i * 20; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TEACHER_W, y); ctx.stroke(); }
    // window with a smiling sun and a cloud
    const wx = 448, wy = 34, ww = 78, wh = 112;
    teacherRoundRect(ctx, wx, wy, ww, wh, 8); teacherShape(ctx, '#9be0ff', 3);
    ctx.save(); teacherRoundRect(ctx, wx, wy, ww, wh, 8); ctx.clip();
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(wx + 54, wy + 30, 15, 0, Math.PI * 2); teacherShape(ctx, '#ffd23f', 2);
    ctx.fillStyle = TEACHER_INK; ctx.beginPath(); ctx.arc(wx + 49, wy + 27, 1.8, 0, Math.PI * 2); ctx.arc(wx + 59, wy + 27, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(wx + 54, wy + 32, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(wx + 20, wy + 56, 9, 0, Math.PI * 2); ctx.arc(wx + 32, wy + 52, 11, 0, Math.PI * 2); ctx.arc(wx + 44, wy + 57, 8, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#6fcf6a'; ctx.fillRect(wx, wy + wh - 22, ww, 22);
    ctx.restore();
    ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    // wall clock showing the real time
    const cx = 566, cy = 54, d = new Date(now);
    ctx.beginPath(); ctx.arc(cx, cy, 21, 0, Math.PI * 2); teacherShape(ctx, '#fff', 3);
    for (let i = 0; i < 12; i += 3) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * 15, cy - Math.cos(a) * 15); ctx.lineTo(cx + Math.sin(a) * 18, cy - Math.cos(a) * 18); ctx.lineWidth = 2; ctx.strokeStyle = TEACHER_INK; ctx.stroke(); }
    const hA = ((d.getHours() % 12) + d.getMinutes() / 60) * Math.PI / 6, mA = d.getMinutes() * Math.PI / 30;
    ctx.lineCap = 'round'; ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(hA) * 9, cy - Math.cos(hA) * 9); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(mA) * 14, cy - Math.cos(mA) * 14); ctx.stroke();
    // maths poster: pi and sigma
    teacherRoundRect(ctx, 580, 92, 52, 66, 5); teacherShape(ctx, '#c7b6ff', 2.4);
    ctx.font = '800 26px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = TEACHER_INK; ctx.fillText('π', 606, 114); ctx.fillText('Σ', 606, 142);
    // ceiling lamps
    [100, 310, 520].forEach(x => { ctx.fillStyle = '#fff'; teacherRoundRect(ctx, x - 40, 5, 80, 9, 4); teacherShape(ctx, '#fff', 2); });
}

function teacherDrawBoard(ctx, lines, p) {
    const B = TEACHER_BOARD;
    teacherRoundRect(ctx, B.x - 8, B.y - 8, B.w + 16, B.h + 16, 9); teacherShape(ctx, '#c98b4b', 3);
    ctx.fillStyle = '#2f8f6b'; ctx.fillRect(B.x, B.y, B.w, B.h);
    ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 2; ctx.strokeRect(B.x, B.y, B.w, B.h);
    ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.beginPath(); ctx.ellipse(B.x + 130, B.y + 80, 160, 55, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b9763a'; ctx.fillRect(B.x - 6, B.y + B.h + 2, B.w + 12, 8); ctx.strokeRect(B.x - 6, B.y + B.h + 2, B.w + 12, 8);
    ctx.fillStyle = '#fff'; ctx.fillRect(B.x + 40, B.y + B.h - 3, 18, 5); ctx.fillStyle = '#ffe14a'; ctx.fillRect(B.x + 64, B.y + B.h - 3, 12, 5);
    ctx.font = '800 10px Inter, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillText('SMART CLASSROOM', B.x + B.w - 10, B.y + 8);

    const rows = teacherLayoutBoard(ctx, lines);
    const total = rows.reduce((a, r, i) => a + (i === 0 ? 0 : r.text.length), 0);
    let typed = Math.ceil(total * teacherClamp(p * 1.15, 0, 1)), pen = null, y = B.y + 34, right = B.x + 60;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    rows.forEach((r, i) => {
        const lh = r.head ? 30 : 23;
        ctx.font = (r.head ? '800 19px' : '700 15px') + ' Inter, system-ui, sans-serif';
        const n = i === 0 ? r.text.length : teacherClamp(typed, 0, r.text.length);
        if (i > 0) typed -= n;
        const s = r.text.slice(0, n);
        ctx.fillStyle = r.head ? '#ffe98a' : '#fffdf5'; ctx.fillText(s, B.x + 18, y);
        if (i === 0 || n > 0) { pen = { x: B.x + 18 + ctx.measureText(s).width + 3, y }; right = Math.max(right, pen.x); }
        if (i === 0 && rows.length > 1) { ctx.fillStyle = 'rgba(255,233,138,.7)'; ctx.fillRect(B.x + 18, y + 13, Math.min(ctx.measureText(r.text).width, B.w - 36), 2); }
        y += lh;
    });
    pen = pen || { x: B.x + 30, y: B.y + 40 }; pen.right = right;
    return pen;
}

function teacherDrawStudents(ctx, tt, raise, pace, cheer) {
    const kids = [{ x: 62, h: '#3b2a1e', c: '#ff8fab', hair: 'bob' }, { x: 186, h: '#1f2937', c: '#7bdff2', hair: 'spike' }, { x: 316, h: '#8a4b1f', c: '#b8f2a1', hair: 'bun' }, { x: 442, h: '#2b2438', c: '#ffd166', hair: 'cap' }, { x: 574, h: '#5b3a1e', c: '#c3a6ff', hair: 'bob' }];
    kids.forEach((s, i) => {
        const bounce = cheer ? Math.abs(Math.sin(tt / 170 + i)) * 12 : Math.sin(tt / 900 + i * 1.7) * 1.6, y = 322 - bounce;
        const up = i === raise ? teacherClamp(pace, 0, 1) : (cheer ? 1 : 0);
        ctx.beginPath(); teacherRoundRect(ctx, s.x - 30, y - 12, 60, 52, 20); teacherShape(ctx, s.c, 2.6);                    // shirt
        ctx.beginPath(); ctx.arc(s.x, y - 32, 21, 0, Math.PI * 2); teacherShape(ctx, s.h, 2.6);                                 // head (back view)
        if (s.hair === 'spike') { ctx.beginPath(); ctx.moveTo(s.x - 12, y - 48); ctx.lineTo(s.x - 6, y - 62); ctx.lineTo(s.x, y - 49); ctx.lineTo(s.x + 6, y - 63); ctx.lineTo(s.x + 12, y - 48); teacherShape(ctx, s.h, 2.2); }
        if (s.hair === 'bun') { ctx.beginPath(); ctx.arc(s.x, y - 58, 8, 0, Math.PI * 2); teacherShape(ctx, s.h, 2.2); }
        if (s.hair === 'cap') { ctx.beginPath(); ctx.arc(s.x, y - 36, 21, Math.PI, 0); ctx.closePath(); teacherShape(ctx, '#ef476f', 2.2); ctx.fillStyle = TEACHER_INK; ctx.fillRect(s.x - 8, y - 38, 16, 3); }
        ctx.beginPath(); ctx.ellipse(s.x - 22, y - 30, 4.5, 6, 0, 0, Math.PI * 2); ctx.ellipse(s.x + 22, y - 30, 4.5, 6, 0, 0, Math.PI * 2); teacherShape(ctx, '#ffd9b3', 2);   // ears
        if (up > 0) {      // raised arm and mitten
            const hx = s.x + 24, hy = y - 8 - 66 * up + Math.sin(tt / 120) * 3 * up;
            ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s.x + 26, y); ctx.lineTo(hx, hy); ctx.stroke();
            ctx.strokeStyle = s.c; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(s.x + 26, y); ctx.lineTo(hx, hy); ctx.stroke();
            ctx.beginPath(); ctx.arc(hx, hy - 3, 7, 0, Math.PI * 2); teacherShape(ctx, '#ffd9b3', 2.2);
            if (i === raise && !cheer) { ctx.font = '900 20px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ef476f'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeText('!', hx + 18, hy - 12); ctx.fillText('!', hx + 18, hy - 12); }
        }
    });
    // desks
    ctx.fillStyle = '#a8662a'; ctx.fillRect(0, 350, TEACHER_W, 12);
    ctx.fillStyle = '#d98a3d'; ctx.fillRect(0, 342, TEACHER_W, 9); ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 2.4; ctx.strokeRect(-2, 342, TEACHER_W + 4, 20);
}

// ---- the teacher ----
function teacherDrawTube(ctx, pts, w, col) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = w + 5; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
}

function teacherDrawFigure(ctx, st, tt) {
    const skin = '#ffd9b3', hair = '#2b2233', blouse = '#ff7a59', skirt = '#4b6cb7', A = 38, B = 36, SX = 26, SY = -104;
    // legs (short and bouncy) and big round shoes
    const sw = Math.sin(st.walk) * st.walkAmt * 0.9;
    [[-1, sw], [1, -sw]].forEach(([side, swing]) => {
        const x = side * 11 + swing * 9, lift = Math.max(0, Math.sin(st.walk + (side > 0 ? Math.PI : 0))) * st.walkAmt * 7;
        teacherDrawTube(ctx, [[side * 11, -42], [x, -9 - lift]], 11, skin);
        ctx.beginPath(); ctx.ellipse(x + side * 3, -5 - lift, 14, 8, 0, 0, Math.PI * 2); teacherShape(ctx, '#7a4a2b', 2.6);
    });
    // skirt and blouse
    ctx.beginPath(); ctx.moveTo(-23, -72); ctx.lineTo(23, -72); ctx.lineTo(33, -34); ctx.lineTo(-33, -34); ctx.closePath(); teacherShape(ctx, skirt, 2.8);
    ctx.save(); ctx.translate(0, SY + 6); ctx.rotate(st.lean * 0.05); ctx.translate(0, -(SY + 6));
    teacherRoundRect(ctx, -26, -118, 52, 50, 16); teacherShape(ctx, blouse, 2.8);
    // collar, bow tie, name badge
    ctx.beginPath(); ctx.moveTo(-8, -118); ctx.lineTo(0, -108); ctx.lineTo(-15, -106); ctx.closePath(); teacherShape(ctx, '#fff', 2);
    ctx.beginPath(); ctx.moveTo(8, -118); ctx.lineTo(0, -108); ctx.lineTo(15, -106); ctx.closePath(); teacherShape(ctx, '#fff', 2);
    ctx.beginPath(); ctx.moveTo(0, -111); ctx.lineTo(-12, -117); ctx.lineTo(-12, -105); ctx.closePath(); teacherShape(ctx, '#ffd23f', 2);
    ctx.beginPath(); ctx.moveTo(0, -111); ctx.lineTo(12, -117); ctx.lineTo(12, -105); ctx.closePath(); teacherShape(ctx, '#ffd23f', 2);
    teacherRoundRect(ctx, 6, -97, 17, 12, 3); teacherShape(ctx, '#fff', 1.8);
    ctx.fillStyle = TEACHER_INK; ctx.font = '900 8px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AI', 14.5, -91);
    ctx.restore();

    // head: big and round, with a bob that follows her speech
    const hx = st.look * 3, hy = -148 + st.bob;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(st.look * 0.05 + st.tilt);
    ctx.beginPath(); ctx.ellipse(0, -2, 39, 35, 0, 0, Math.PI * 2); teacherShape(ctx, hair, 3);                                         // hair behind the head
    ctx.beginPath(); ctx.ellipse(0, 3, 33, 29, 0, 0, Math.PI * 2); teacherShape(ctx, skin, 3);                                           // face
    ctx.beginPath(); ctx.ellipse(-33, 4, 5, 7, 0, 0, Math.PI * 2); ctx.ellipse(33, 4, 5, 7, 0, 0, Math.PI * 2); teacherShape(ctx, skin, 2.4);   // ears
    // fringe (scalloped) over the forehead
    ctx.beginPath(); ctx.moveTo(-36, -2); ctx.bezierCurveTo(-40, -34, 40, -34, 36, -2);
    ctx.quadraticCurveTo(30, -12, 24, -14); ctx.quadraticCurveTo(18, -4, 11, -15); ctx.quadraticCurveTo(4, -5, -4, -16); ctx.quadraticCurveTo(-11, -5, -18, -15); ctx.quadraticCurveTo(-26, -6, -30, -14); ctx.quadraticCurveTo(-34, -8, -36, -2);
    teacherShape(ctx, hair, 3);
    ctx.beginPath(); ctx.arc(0, -35, 8, 0, Math.PI * 2); teacherShape(ctx, hair, 2.6);                                                      // bun
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -24); ctx.quadraticCurveTo(-6, -30, 8, -26); ctx.stroke();
    // rosy cheeks
    ctx.fillStyle = 'rgba(255,107,129,.5)'; ctx.beginPath(); ctx.ellipse(-22, 12, 6.5, 4.2, 0, 0, Math.PI * 2); ctx.ellipse(22, 12, 6.5, 4.2, 0, 0, Math.PI * 2); ctx.fill();
    // big eyes behind round glasses
    const look = st.look, open = st.blink;
    [-12.5, 12.5].forEach(ex => {
        ctx.beginPath(); ctx.ellipse(ex, 0, 10, 11.5 * open + 0.4, 0, 0, Math.PI * 2); teacherShape(ctx, '#fff', 2);
        if (open > 0.3) {
            ctx.save(); ctx.beginPath(); ctx.ellipse(ex, 0, 10, 11.5 * open, 0, 0, Math.PI * 2); ctx.clip();
            ctx.fillStyle = '#4a3b5c'; ctx.beginPath(); ctx.arc(ex + look * 3.4, st.gazeY, 6.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex + look * 3.4, st.gazeY, 3.4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + look * 3.4 + 2, st.gazeY - 2.4, 1.9, 0, Math.PI * 2); ctx.arc(ex + look * 3.4 - 1.6, st.gazeY + 2, 1, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        ctx.beginPath(); ctx.arc(ex, 0, 14, 0, Math.PI * 2); ctx.strokeStyle = '#7d4dd8'; ctx.lineWidth = 2.6; ctx.stroke();                // glasses
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ex, 0, 10.5, 3.7, 4.4); ctx.stroke();
    });
    ctx.strokeStyle = '#7d4dd8'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-1.5, -1); ctx.lineTo(1.5, -1); ctx.stroke();
    // eyebrows (raise when excited; slope down-in when worried)
    ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 3; ctx.lineCap = 'round';
    [-1, 1].forEach(s => { const x = s * 12.5, y = -18 - st.brow * 3.5, tilt = st.worry * 4; ctx.beginPath(); ctx.moveTo(x - 7, y + tilt * s * -1 + 1.5); ctx.quadraticCurveTo(x, y - 3.5, x + 7, y - tilt * s * -1 + 1.5); ctx.stroke(); });
    // nose and mouth
    ctx.strokeStyle = 'rgba(160,90,60,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(look * 1.6, 8); ctx.quadraticCurveTo(look * 1.6 + 3, 11, look * 1.6, 12); ctx.stroke();
    const m = st.mouth, sm = st.smile, mx = look * 1.6, my = 19;
    if (m > 0.07) {
        const hgt = 3 + m * 13, wid = 8 + sm * 3;
        ctx.beginPath(); ctx.moveTo(mx - wid, my - 1); ctx.quadraticCurveTo(mx, my + 1.5, mx + wid, my - 1); ctx.quadraticCurveTo(mx + wid * 0.7, my + hgt + 2, mx, my + hgt + 2); ctx.quadraticCurveTo(mx - wid * 0.7, my + hgt + 2, mx - wid, my - 1); ctx.closePath();
        teacherShape(ctx, '#8b2535', 2.6);
        ctx.save(); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(mx - wid, my - 2, wid * 2, 3.6); ctx.fillStyle = '#ff7a8a'; ctx.beginPath(); ctx.ellipse(mx, my + hgt + 1, wid * 0.7, hgt * 0.45, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else {
        ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(mx - 8, my - sm * 1.2); ctx.quadraticCurveTo(mx, my + 3 + sm * 6, mx + 8, my - sm * 1.2); ctx.stroke();
    }
    ctx.restore();

    // arms: shoulder -> elbow -> hand by IK, mitten hands, pointer stick or chalk
    [-1, 1].forEach(side => {
        const hand = side < 0 ? st.handL : st.handR, shx = side * SX, shy = SY + 4, ik = teacherIK(shx, shy, shx + hand.x, shy + hand.y, A, B, side < 0 ? -1 : 1);
        teacherDrawTube(ctx, [[shx, shy], [ik.ex, ik.ey], [ik.hx, ik.hy]], 11, blouse);
        if (side < 0 && st.stick > 0) {            // pointer stick (or chalk) continues the forearm's direction
            const a = Math.atan2(ik.hy - ik.ey, ik.hx - ik.ex), L = st.stick, tx = ik.hx + Math.cos(a) * L, ty = ik.hy + Math.sin(a) * L;
            ctx.lineCap = 'round'; ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = L > 20 ? 5.4 : 6; ctx.beginPath(); ctx.moveTo(ik.hx, ik.hy); ctx.lineTo(tx, ty); ctx.stroke();
            ctx.strokeStyle = L > 20 ? '#e8a23c' : '#fff'; ctx.lineWidth = L > 20 ? 2.6 : 3; ctx.beginPath(); ctx.moveTo(ik.hx, ik.hy); ctx.lineTo(tx, ty); ctx.stroke();
            if (L > 20) { ctx.fillStyle = '#ef476f'; ctx.beginPath(); ctx.arc(tx, ty, 3.4, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.beginPath(); ctx.arc(ik.hx, ik.hy, 8, 0, Math.PI * 2); teacherShape(ctx, skin, 2.6);
        ctx.strokeStyle = 'rgba(160,90,60,.55)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(ik.hx - 3, ik.hy - 1); ctx.lineTo(ik.hx + 2, ik.hy + 4); ctx.stroke();       // thumb line
    });
}

// little cartoon effects around her head
function teacherDrawFx(ctx, fx, tt, now, x, y) {
    if (fx === 'sparkle') for (let i = 0; i < 5; i++) { const a = now / 600 + i * 1.26, r = 50 + (i % 2) * 18; teacherStar(ctx, x + Math.cos(a) * r, y - 26 + Math.sin(a) * r * 0.55, 7 + (i % 3) * 2, now / 400 + i, ['#ffd23f', '#ff7a8a', '#7bdff2'][i % 3]); }
    else if (fx === 'sweat') { const t = (now / 700) % 1; ctx.beginPath(); ctx.moveTo(x + 44, y - 42 + t * 12); ctx.quadraticCurveTo(x + 52, y - 28 + t * 12, x + 44, y - 22 + t * 12); ctx.quadraticCurveTo(x + 36, y - 28 + t * 12, x + 44, y - 42 + t * 12); teacherShape(ctx, '#7bdff2', 2); }
    else if (fx === 'think') { ctx.font = '900 30px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const bob = Math.sin(now / 260) * 3; ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 5; ctx.strokeText('?', x + 46, y - 46 + bob); ctx.fillStyle = '#ffd23f'; ctx.fillText('?', x + 46, y - 46 + bob); }
    else if (fx === 'bang') { ctx.font = '900 28px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const bob = Math.sin(now / 200) * 3; ctx.strokeStyle = TEACHER_INK; ctx.lineWidth = 5; ctx.strokeText('!', x + 46, y - 48 + bob); ctx.fillStyle = '#ff7a8a'; ctx.fillText('!', x + 46, y - 48 + bob); }
}

// What each pose asks of her hands (relative to her shoulders, y down, in her own units), her feet and her face.
function teacherPoseTargets(pose, now, pen, restX) {
    const w = Math.sin(now / 200), s = Math.sin(now / 480), c = Math.cos(now / 380);
    switch (pose) {
        case 'greet': return { L: [-20, 66], R: [40 + w * 13, -46 + Math.abs(w) * 6], x: restX, look: 0, smile: 1, brow: 1, worry: 0, lean: 0 };
        case 'explain': return { L: [-54 + c * 5, 18 + s * 8], R: [54 + s * 5, 14 + c * 8], x: restX - 20, look: 0.2, smile: 0.6, brow: 0.5, worry: 0, lean: s };
        case 'write': return { board: true, reach: 12, x: pen ? pen.x + 80 : 380, look: -1, smile: 0.2, brow: 0, worry: 0, lean: -1, jiggle: 1 };
        case 'point': return { board: true, reach: 44, x: pen ? pen.x + 90 : 380, look: -0.7, smile: 0.3, brow: 0.3, worry: 0, lean: -0.5, jiggle: 0.3 };
        case 'count': return { L: [-20, 62], R: [30 + s * 3, -34 + Math.abs(c) * 8], x: restX - 10, look: 0, smile: 0.5, brow: 0.6, worry: 0, lean: 0.3 };
        case 'ask': return { L: [-22, 62], R: [66, 6 + s * 5], x: restX - 30, look: 0.9, smile: 0.9, brow: 0.8, worry: 0, lean: 0.4 };
        case 'celebrate': return { L: [-38, -62 + Math.abs(w) * 8], R: [38, -62 + Math.abs(c) * 8], x: restX - 10, look: 0, smile: 1, brow: 1.3, worry: 0, lean: 0, jump: 1 };
        case 'oops': return { L: [-4, -22], R: [4, -22], x: restX - 10, look: 0, smile: -0.5, brow: 0.4, worry: 1, lean: 0 };
        case 'think': return { L: [-26, 20], R: [-26, -14], x: restX - 10, look: 0.5, smile: 0.1, brow: 0.6, worry: 0.4, lean: 0.4 };
        default: return { L: [-20, 66], R: [20, 66], x: restX, look: 0, smile: 0.4, brow: 0, worry: 0, lean: 0 };
    }
}

// The scene definition handed to the player. `scenes` come from teacherTopicLesson / teacherTabLesson / teacherSolveLesson.
function teacherLessonDef(key, title, hint, scenes) {
    const rig = { x: TEACHER_REST_X, handL: { x: -20, y: 66 }, handR: { x: 20, y: 66 }, look: 0, gazeY: 0, mouth: 0, smile: 0.4, brow: 0, worry: 0, lean: 0, walk: 0, walkAmt: 0, blink: 1, bob: 0, tilt: 0, stick: 0, last: 0, y: 0 };
    scenes.forEach(s => { s.board = s.board && s.board.length ? s.board : [title]; });

    function draw(ctx, W, H, at) {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()), scene = scenes[at.scene], tt = at.t || 0;
        const dt = Math.min(0.1, Math.max(0.001, (now - rig.last) / 1000)), snap = !rig.last || now - rig.last > 400; rig.last = now;
        ctx.save(); ctx.scale(W / TEACHER_W, H / TEACHER_H);
        teacherDrawRoom(ctx, Date.now());
        const pen = teacherDrawBoard(ctx, scene.board, teacherClamp(at.p, 0, 1));
        const tg = teacherPoseTargets(scene.pose, now, pen, TEACHER_REST_X);
        // her stand: walk to the chalk, or back to the middle
        const wantX = teacherClamp(tg.board ? (pen.right || pen.x) + 66 : tg.x, 240, 585), r = snap ? 1 : 1 - Math.exp(-dt * 2.6), dx = (wantX - rig.x) * r;
        rig.x += dx; const speed = Math.abs(dx) / dt;
        rig.walkAmt = snap ? 0 : teacherSmooth(rig.walkAmt, teacherClamp(speed / 55, 0, 1.2), dt, 10); rig.walk += dt * 11 * (0.4 + rig.walkAmt);
        // hands: toward the board point (world -> her units), or the pose's resting place
        const SXW = 26, SYW = -100, shoulderWorld = { x: rig.x - SXW, y: TEACHER_FEET + SYW }, rate = snap ? 1000 : 8;
        let tl = tg.L, trgt = tg.R, stick = 0;
        if (tg.board) {
            const pt = pen || { x: 80, y: 80 }, jig = tg.jiggle ? Math.sin(now / 65) * 2.6 * tg.jiggle : 0, dxp = pt.x - shoulderWorld.x, dyp = pt.y - shoulderWorld.y, d = Math.hypot(dxp, dyp) || 1;
            const hx = pt.x - dxp / d * tg.reach, hy = pt.y - dyp / d * tg.reach;
            tl = [hx - shoulderWorld.x + jig, hy - shoulderWorld.y + Math.cos(now / 80) * 1.8 * tg.jiggle]; trgt = [34, 60]; stick = tg.reach;
        }
        rig.handL.x = teacherSmooth(rig.handL.x, tl[0], dt, rate); rig.handL.y = teacherSmooth(rig.handL.y, tl[1], dt, rate);
        rig.handR.x = teacherSmooth(rig.handR.x, trgt[0], dt, rate); rig.handR.y = teacherSmooth(rig.handR.y, trgt[1], dt, rate);
        rig.stick = teacherSmooth(rig.stick, stick, dt, 9);
        const lookT = scene.look === 'board' || tg.board ? -1 : (tg.look || 0);
        rig.look = teacherSmooth(rig.look, lookT, dt, snap ? 1000 : 6);
        rig.smile = teacherSmooth(rig.smile, tg.smile, dt, 5); rig.brow = teacherSmooth(rig.brow, tg.brow, dt, 6); rig.worry = teacherSmooth(rig.worry, tg.worry, dt, 6); rig.lean = teacherSmooth(rig.lean, tg.lean, dt, 5);
        rig.gazeY = scene.look === 'class' ? 1 : 0;
        // mouth follows the speech; her head bobs and tilts while she talks
        const talk = at.speaking ? 0.3 + 0.7 * Math.abs(Math.sin(now / 100) * Math.sin(now / 317 + 1.3) + 0.35 * Math.sin(now / 45)) : 0;
        rig.mouth = teacherSmooth(rig.mouth, teacherClamp(talk, 0, 1), dt, 30);
        rig.bob = Math.sin(now / 430) * 1.2 + (at.speaking ? Math.sin(now / 150) * 1.6 : 0); rig.tilt = Math.sin(now / 1100) * 0.035 + (at.speaking ? Math.sin(now / 520) * 0.03 : 0);
        const bp = (now % 3200) / 3200; rig.blink = bp > 0.96 ? 1 - Math.sin((bp - 0.96) / 0.04 * Math.PI) * 0.97 : 1;
        // body: squash and stretch while talking, a hop when she celebrates or walks
        const squash = 1 + (at.speaking ? Math.sin(now / 150) * 0.022 : Math.sin(now / 700) * 0.008), hop = tg.jump ? Math.abs(Math.sin(now / 190)) * 16 : Math.abs(Math.sin(rig.walk)) * rig.walkAmt * 3;
        // the teacher stands in front of the board
        ctx.save(); ctx.translate(rig.x, TEACHER_FEET - hop); ctx.scale(2 - squash, squash);
        ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 2 + hop, 38 - hop * 0.6, 7, 0, 0, Math.PI * 2); ctx.fill();
        teacherDrawFigure(ctx, rig, now);
        teacherDrawFx(ctx, scene.fx, tt, now, 0, -148);
        ctx.restore();
        // the students sit in front of her: one raises a hand when she asks, all cheer at the answer
        const asks = typeof scene.student === 'number', cheer = scene.pose === 'celebrate';
        teacherDrawStudents(ctx, now, asks ? scene.student : -1, asks ? tt / 800 : 0, cheer);
        ctx.restore();
    }
    return { key, title, hint, aspect: TEACHER_ASPECT, pitch: 1.12, description: `${title}. A cartoon maths teacher explains this at a chalkboard with a spoken narration and a caption.`, scenes, draw };
}

// ---- mounting in the page ----
let teacherMode = 'topic';       // 'topic' | 'tab' | 'solve': which class the card plays
let teacherForcePlay = false;    // the "My problem" button asked for a class to start playing as soon as the answer is on the page
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

// The student's problem as it is on the page right now: what was typed, the answer, and the tool's own worked solution.
function teacherReadProblem(statId) {
    const info = teacherPageInfo(statId), root = document.getElementById('interfaceRoot');
    const label = el => {
        let l = el.id && root.querySelector('label[for="' + el.id + '"]');
        if (!l) { const g = el.closest('.form-group, .input-group, .field, div'); l = g && g.querySelector('label'); }
        return l ? l.textContent : (el.getAttribute('aria-label') || el.placeholder || el.name || '');
    };
    info.inputs = Array.from(root.querySelectorAll('textarea, input, select')).filter(el => !el.closest('#' + TEACHER_AREA) && !el.closest('.fb-strip') && !el.hasAttribute('data-mode-select') && el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'button' && el.offsetParent !== null)
        .map(el => ({ label: label(el), value: el.tagName === 'SELECT' ? (el.options[el.selectedIndex] || {}).text || '' : el.value }));
    const val = root.querySelector('.result-value');
    if (val) { const c = val.cloneNode(true); c.querySelectorAll('.answer-prefix, .sr-only').forEach(n => n.remove()); info.answer = c.textContent.trim(); info.error = val.classList.contains('is-error') || /^(⚠️?\s*)?(error|invalid|no data)/i.test(info.answer); }
    const sol = root.querySelector('.solution'), plain = root.querySelector('.calculation-steps');
    info.steps = sol ? Array.from(sol.querySelectorAll('.step')).map(s => ({
        title: (s.querySelector('.step-title') || {}).textContent || '', val: (s.querySelector('.step-val') || {}).textContent || '',
        lines: Array.from(s.querySelectorAll('.step-body .ln')).map(n => n.textContent)
    })) : [];
    const src = plain || sol;
    info.rawLines = src ? String(src.innerText || src.textContent || '').split(/\n+/) : [];
    info.firstLine = info.rawLines[0] || '';
    return info;
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
        let scenes = null, topicTitle = teacherClean(info.title);
        if (teacherMode === 'solve') scenes = teacherSolveLesson(teacherReadProblem(statId));
        if (!scenes) { if (teacherMode === 'solve') teacherMode = 'topic'; scenes = teacherMode === 'tab' ? teacherTabLesson(info) : teacherTopicLesson(info); }
        const dock = document.createElement('div'); dock.className = 'teacher-dock'; dock.setAttribute('role', 'group'); dock.setAttribute('aria-label', 'AI Teacher class');
        const mk = (label, mode2, onclick) => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'teacher-tab' + (teacherMode === mode2 ? ' on' : ''); b.textContent = label; b.setAttribute('aria-pressed', String(teacherMode === mode2));
            b.onclick = onclick || (() => mountTeacherClass(statId, mode2)); return b;
        };
        dock.append(Object.assign(document.createElement('span'), { className: 'teacher-badge', textContent: '🎓 AI Teacher' }),
            mk('Teach this topic', 'topic'), mk('Solve my problem', 'solve', () => teacherSolveMyProblem(statId)), mk('About this tab', 'tab'));
        area.appendChild(dock);
        const titles = { tab: `🎓 ${tab.name}: class overview`, solve: `🎓 Solving your problem: ${topicTitle}`, topic: `🎓 AI Teacher: ${topicTitle}` };
        const hints = { tab: 'Your AI maths teacher introduces this whole tab. Press Play.', solve: 'Your AI maths teacher solves the problem you entered, step by step, using the tool’s own working. Press Play.',
            topic: 'Your AI maths teacher teaches this topic at the board. Press Solve my problem to see her work through the numbers you typed.' };
        return mountTutorCard(TEACHER_AREA, teacherLessonDef('teacher', titles[teacherMode], hints[teacherMode], scenes));
    } catch (e) { return null; }       // a stub DOM (unit tests) or a page without the interface: no class, no harm
}

// "Solve my problem": press the tool's own Calculate if there is no answer yet, then the teacher solves what is on the page and starts playing.
function teacherSolveMyProblem(statId) {
    const val = document.querySelector('#interfaceRoot .result-value'), has = val && val.textContent.replace(/Answer:/i, '').trim() && val.textContent.trim() !== '—';
    if (!has) {
        const go = document.querySelector('#interfaceRoot .primary-btn');
        if (go) { teacherForcePlay = true; go.click(); return; }       // the click handler below does the rest
    }
    teacherPlaySolution(statId, true);
}

function teacherPlaySolution(statId, play) {
    const ctl = mountTeacherClass(statId, 'solve');
    if (ctl && play && typeof ctl.play === 'function') {
        ctl.play();
        try { const a = document.getElementById(TEACHER_AREA); if (a && a.scrollIntoView) a.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* ignore */ }
    }
    return ctl;
}

// After the student presses Calculate, the teacher solves that problem. It starts by itself (a click is the permission the browser's
// speech needs) except under browser automation, so the test suites are not slowed down by a full class after every calculation.
function teacherAfterCalculate() {
    clearTimeout(teacherRefreshTimer);       // a refresh queued by typing must not replace the problem the teacher is about to solve
    setTimeout(() => {
        if (typeof currentStat !== 'string') return;
        const auto = teacherForcePlay || !(typeof navigator !== 'undefined' && navigator.webdriver);
        const play = auto; teacherForcePlay = false;
        teacherPlaySolution(currentStat, play);
    }, 450);
}

// Typing new numbers updates the lesson (not while it is playing).
let teacherRefreshTimer = 0;
function teacherScheduleRefresh() {
    clearTimeout(teacherRefreshTimer);
    teacherRefreshTimer = setTimeout(() => {
        const ctl = typeof tutorCards !== 'undefined' ? tutorCards.get('teacher') : null;
        if (ctl && ctl.state.playing) { teacherScheduleRefresh(); return; }
        if (typeof currentStat === 'string') mountTeacherClass(currentStat, teacherMode === 'solve' ? 'topic' : teacherMode);
    }, 700);
}
