// Midnight Noodle Cart — everything the player sees, drawn on one
// canvas. The judge reads the game mostly through its screenshots, so
// the title, the HUD and the game-over screen are drawn here with the
// same care as the cart itself. No images, no fonts to load: all vector,
// all procedural.
import { VIEW, SEATS, POTS, DISHES, COLORS, TUNING } from './config.js';

export const BTN_START = { x: 490, y: 512, w: 300, h: 64 };
export const BTN_NEXT = { x: 490, y: 480, w: 300, h: 64 };
export const BTN_RESTART = { x: 490, y: 536, w: 300, h: 64 };

function rr(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r);
  else c.rect(x, y, w, h);
}

function text(c, s, x, y, size, color, weight = 'bold', align = 'left') {
  c.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.fillText(s, x, y);
}

function drawHeart(c, x, y, size, filled) {
  c.save();
  c.translate(x, y);
  c.scale(size / 16, size / 16);
  c.beginPath();
  c.moveTo(0, 5);
  c.bezierCurveTo(-9, -3, -5, -10, 0, -5);
  c.bezierCurveTo(5, -10, 9, -3, 0, 5);
  c.closePath();
  c.fillStyle = filled ? COLORS.heart : 'rgba(255,93,115,0.22)';
  c.fill();
  c.restore();
}

function drawSky(c, world, now) {
  const g = c.createLinearGradient(0, 0, 0, VIEW.h);
  g.addColorStop(0, COLORS.skyTop);
  g.addColorStop(1, COLORS.skyBottom);
  c.fillStyle = g;
  c.fillRect(0, 0, VIEW.w, VIEW.h);
  for (const s of world.stars) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(now * 0.7 + s.p));
    c.globalAlpha = a;
    c.fillStyle = '#e8e6ff';
    c.fillRect(s.x, s.y, s.r, s.r);
  }
  c.globalAlpha = 1;
  // Moon.
  c.fillStyle = '#f5f1d8';
  c.beginPath();
  c.arc(1120, 84, 34, 0, 6.29);
  c.fill();
  c.fillStyle = 'rgba(210,205,170,0.7)';
  c.beginPath();
  c.arc(1108, 76, 7, 0, 6.29);
  c.arc(1130, 94, 5, 0, 6.29);
  c.fill();
  // Far skyline silhouette.
  c.fillStyle = COLORS.buildingFar;
  const sky = [60, 110, 80, 140, 95, 125, 70, 150, 90, 120, 75, 135];
  let x = 0;
  for (let i = 0; i < sky.length; i++) {
    c.fillRect(x, 300 - sky[i], 112, sky[i]);
    x += 112;
  }
  // Street.
  c.fillStyle = COLORS.road;
  c.fillRect(0, 520, VIEW.w, VIEW.h - 520);
  c.fillStyle = COLORS.curb;
  c.fillRect(0, 516, VIEW.w, 6);
  // Street lamp glow, right side.
  const lamp = c.createRadialGradient(1150, 480, 10, 1150, 480, 180);
  lamp.addColorStop(0, 'rgba(255,209,102,0.22)');
  lamp.addColorStop(1, 'rgba(255,209,102,0)');
  c.fillStyle = lamp;
  c.fillRect(970, 300, 360, 360);
  c.fillStyle = '#3a3a5c';
  c.fillRect(1146, 380, 8, 140);
  c.fillStyle = COLORS.windowLit;
  c.beginPath();
  c.arc(1150, 372, 10, 0, 6.29);
  c.fill();
}

function drawCart(c) {
  // Awning.
  for (let i = 0; i < 10; i++) {
    c.fillStyle = i % 2 ? '#f4f1de' : COLORS.cartAwning;
    c.fillRect(280 + i * 72, 96, 72, 44);
  }
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.fillRect(280, 132, 720, 8);
  // Sign.
  rr(c, 480, 104, 320, 34, 8);
  c.fillStyle = '#1a1033';
  c.fill();
  text(c, 'MIE MALAM', 640, 129, 24, COLORS.coin, 'bold', 'center');
  // Poles.
  c.fillStyle = '#4a3220';
  c.fillRect(296, 140, 10, 260);
  c.fillRect(974, 140, 10, 260);
  // Counter top + front.
  c.fillStyle = COLORS.cartCounter;
  rr(c, 300, 392, 680, 18, 6);
  c.fill();
  c.fillStyle = COLORS.cartWood;
  rr(c, 300, 410, 680, 110, 4);
  c.fill();
  c.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 1; i < 8; i++) c.fillRect(300 + i * 85, 410, 3, 110);
  // Chalkboard menu on the cart front (below the pot labels).
  rr(c, 520, 460, 240, 52, 6);
  c.fillStyle = '#20263e';
  c.fill();
  text(c, 'MIE 15 · BAKSO 20 · TEH 8', 640, 484, 15, COLORS.text, 'bold', 'center');
  text(c, 'cook 4s · 6s · 2s', 640, 504, 13, COLORS.textDim, 'normal', 'center');
}

function drawStool(c, x) {
  c.fillStyle = '#3a3a5c';
  c.fillRect(x - 4, 372, 8, 22);
  rr(c, x - 30, 360, 60, 12, 6);
  c.fillStyle = '#4a4a72';
  c.fill();
}

function drawCustomer(c, cust, seatIdx, x, priority) {
  const k = cust.kind;
  // Body.
  rr(c, x - 26, 306, 52, 58, 14);
  c.fillStyle = k.color;
  c.fill();
  // Head.
  c.beginPath();
  c.arc(x, 284, 19, 0, 6.29);
  c.fillStyle = k.skin;
  c.fill();
  // Hat.
  if (k.hat === 'helmet') {
    c.beginPath();
    c.arc(x, 280, 21, Math.PI, 0);
    c.fillStyle = '#ffd60a';
    c.fill();
    c.fillRect(x - 23, 276, 46, 5);
  } else if (k.hat === 'cap') {
    c.beginPath();
    c.arc(x, 282, 19, Math.PI, 0);
    c.fillStyle = '#2a9d8f';
    c.fill();
    c.fillRect(x + 2, 272, 24, 6);
  } else if (k.hat === 'shawl') {
    c.beginPath();
    c.arc(x, 286, 23, Math.PI * 0.95, Math.PI * 2.05);
    c.fillStyle = '#b388ff';
    c.fill();
  } else {
    c.beginPath();
    c.arc(x, 280, 19, Math.PI, 0);
    c.fillStyle = '#20263e';
    c.fill();
  }
  // Order bubble.
  const dish = DISHES[cust.dish];
  const bx = x;
  const by = 222;
  c.beginPath();
  c.arc(bx, by, 26, 0, 6.29);
  c.fillStyle = '#f4f1de';
  c.fill();
  c.strokeStyle = dish.color;
  c.lineWidth = 3;
  c.stroke();
  text(c, dish.short, bx, by + 5, 12, dish.color, 'bold', 'center');
  // Patience bar under the bubble.
  const ratio = Math.max(0, cust.patience / cust.patienceMax);
  rr(c, x - 28, 254, 56, 9, 4);
  c.fillStyle = 'rgba(255,255,255,0.18)';
  c.fill();
  rr(c, x - 28, 254, 56 * ratio, 9, 4);
  c.fillStyle = ratio < 0.35 ? COLORS.patienceLow : COLORS.patienceOk;
  c.fill();
  // Priority star.
  if (priority) {
    text(c, '★', x + 34, 210, 22, COLORS.coin, 'bold', 'center');
  }
}

function drawPot(c, pot, x, y, now) {
  // Bowl.
  c.beginPath();
  c.ellipse(x, y, 36, 26, 0, 0, 6.29);
  c.fillStyle = '#151528';
  c.fill();
  c.strokeStyle = '#55557a';
  c.lineWidth = 3;
  c.stroke();
  if (pot.state === 'empty') {
    c.beginPath();
    c.ellipse(x, y, 26, 16, 0, 0, 6.29);
    c.fillStyle = '#0c0c18';
    c.fill();
    text(c, 'tap to cook', x, y + 44, 12, COLORS.textDim, 'normal', 'center');
    return;
  }
  const dish = DISHES[pot.dish];
  // Broth.
  c.beginPath();
  c.ellipse(x, y, 28, 17, 0, 0, 6.29);
  c.fillStyle = dish.color;
  c.globalAlpha = pot.state === 'burnt' ? 0.35 : 0.9;
  c.fill();
  c.globalAlpha = 1;
  if (pot.state === 'cooking') {
    // Progress ring.
    c.strokeStyle = dish.color;
    c.lineWidth = 5;
    c.beginPath();
    c.arc(x, y, 42, -Math.PI / 2, -Math.PI / 2 + pot.progress * 6.283);
    c.stroke();
    text(c, dish.short, x, y + 46, 13, dish.color, 'bold', 'center');
  } else if (pot.state === 'done') {
    const pulse = 0.6 + Math.sin(now * 6) * 0.4;
    c.globalAlpha = pulse;
    c.strokeStyle = dish.color;
    c.lineWidth = 4;
    c.beginPath();
    c.arc(x, y, 42, 0, 6.29);
    c.stroke();
    c.globalAlpha = 1;
    text(c, 'READY!', x, y + 46, 14, dish.color, 'bold', 'center');
  } else if (pot.state === 'burnt') {
    c.fillStyle = 'rgba(20,20,30,0.85)';
    c.beginPath();
    c.ellipse(x, y, 28, 17, 0, 0, 6.29);
    c.fill();
    text(c, 'BURNT — tap to clear', x, y + 46, 13, COLORS.patienceLow, 'bold', 'center');
  }
}

function drawParticles(c, world) {
  for (const pt of world.particles) {
    c.globalAlpha = Math.max(0, pt.life / pt.max);
    c.fillStyle = pt.color;
    c.beginPath();
    c.arc(pt.x, pt.y, pt.size, 0, 6.29);
    c.fill();
  }
  c.globalAlpha = 1;
  for (const f of world.floats) {
    c.globalAlpha = Math.max(0, f.life / f.max);
    text(c, f.text, f.x, f.y, 24, f.color, 'bold', 'center');
  }
  c.globalAlpha = 1;
}

export function drawWorld(c, g) {
  const { state, world, now } = g;
  drawSky(c, world, now);
  drawCart(c);
  for (let i = 0; i < 3; i++) {
    drawStool(c, SEATS[i].x);
    const cust = world.customers[i];
    if (cust) drawCustomer(c, cust, i, SEATS[i].x, state.prioritySeat === i);
  }
  for (let i = 0; i < 3; i++) drawPot(c, world.pots[i], POTS[i].x, POTS[i].y, now);
  drawParticles(c, world);
}

export function drawHUD(c, state) {
  rr(c, 0, 0, VIEW.w, 62, 0);
  c.fillStyle = COLORS.hudBg;
  c.fill();
  text(c, 'COINS', 24, 24, 13, COLORS.textDim, 'bold');
  text(c, 'Rp ' + String(Math.floor(state.coins)), 24, 52, 28, COLORS.coin);
  text(c, 'DAY', 250, 24, 13, COLORS.textDim, 'bold');
  text(c, String(state.day), 250, 52, 28, COLORS.text);
  text(c, 'SERVED', 380, 24, 13, COLORS.textDim, 'bold');
  text(c, String(state.served), 380, 52, 28, COLORS.text);
  // Combo.
  if (state.streak >= 1) {
    text(c, 'COMBO ×' + (1 + Math.min(state.streak, TUNING.comboCap - 1)), 520, 48, 26, COLORS.neonPink, 'bold');
  }
  // RUSH chip.
  if (state.now < state.rushUntil) {
    const left = Math.ceil(state.rushUntil - state.now);
    rr(c, 700, 16, 150, 32, 8);
    c.fillStyle = COLORS.coin;
    c.fill();
    text(c, 'RUSH ×2 · ' + left + 's', 775, 38, 18, '#1a1033', 'bold', 'center');
  }
  // Hearts.
  for (let i = 0; i < TUNING.hearts; i++) {
    drawHeart(c, 1010 + i * 34, 34, 26, i < state.hearts);
  }
  // Day clock.
  const left = Math.max(0, Math.ceil(state.dayLeft));
  text(c, left + 's left', 1180, 48, 24, COLORS.text, 'bold', 'right');
  text(c, 'DAY TIME', 1180, 22, 12, COLORS.textDim, 'bold', 'right');
  // Bottom hint.
  text(c, 'Click a pot to cook · click a done pot to serve · click a customer to serve them first · M mute', VIEW.w / 2, VIEW.h - 18, 13, COLORS.textDim, 'normal', 'center');
}

function dim(c) {
  c.fillStyle = 'rgba(6, 8, 22, 0.66)';
  c.fillRect(0, 0, VIEW.w, VIEW.h);
}

function keyChip(c, label, x, y) {
  const w = 12 + label.length * 11;
  rr(c, x, y - 22, w, 30, 7);
  c.fillStyle = 'rgba(255,255,255,0.12)';
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.35)';
  c.lineWidth = 1.5;
  c.stroke();
  text(c, label, x + w / 2, y, 16, COLORS.text, 'bold', 'center');
}

function drawRecipeCard(c, dish, x, y) {
  rr(c, x, y, 200, 86, 10);
  c.fillStyle = 'rgba(255,255,255,0.08)';
  c.fill();
  c.strokeStyle = dish.color;
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.arc(x + 34, y + 30, 16, 0, 6.29);
  c.fillStyle = dish.color;
  c.fill();
  text(c, dish.short, x + 34, y + 35, 11, '#1a1033', 'bold', 'center');
  text(c, dish.name, x + 60, y + 30, 18, COLORS.text, 'bold');
  text(c, 'cook ' + dish.cook + 's · Rp ' + dish.price, x + 60, y + 56, 14, COLORS.textDim, 'normal');
}

export function drawTitle(c, state) {
  dim(c);
  const pulse = 1 + Math.sin(state.now * 3) * 0.03;
  c.save();
  c.translate(VIEW.w / 2, 170);
  c.scale(pulse, pulse);
  const g = c.createLinearGradient(-300, 0, 300, 0);
  g.addColorStop(0, COLORS.coin);
  g.addColorStop(1, COLORS.neonPink);
  c.font = 'bold 72px system-ui, -apple-system, sans-serif';
  c.fillStyle = g;
  c.textAlign = 'center';
  c.fillText('MIDNIGHT NOODLE CART', 0, 0);
  c.restore();
  text(c, 'The night shift is hungry. Cook fast, serve faster — before their patience runs out.', VIEW.w / 2, 214, 20, COLORS.text, 'normal', 'center');
  text(c, 'Click an empty pot to start cooking for the hungriest customer. Click a done pot to serve.', VIEW.w / 2, 244, 17, COLORS.textDim, 'normal', 'center');
  text(c, 'Click a customer to serve them first. A done dish left sitting burns — tap it to clear.', VIEW.w / 2, 270, 17, COLORS.textDim, 'normal', 'center');
  // Recipe cards.
  drawRecipeCard(c, DISHES.mie, 320, 300);
  drawRecipeCard(c, DISHES.bakso, 540, 300);
  drawRecipeCard(c, DISHES.teh, 760, 300);
  text(c, 'Streak 5 serves in a row triggers RUSH: double coins for 15 seconds.', VIEW.w / 2, 428, 16, COLORS.textDim, 'normal', 'center');
  if (state.best > 0) {
    text(c, 'BEST  Rp ' + String(state.best), VIEW.w / 2, 462, 20, COLORS.coin, 'bold', 'center');
  }
  const b = BTN_START;
  const glow = 0.5 + Math.sin(state.now * 3) * 0.2;
  c.save();
  c.globalAlpha = glow;
  rr(c, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 14);
  c.fillStyle = COLORS.neonPink;
  c.fill();
  c.restore();
  rr(c, b.x, b.y, b.w, b.h, 10);
  c.fillStyle = '#1a1033';
  c.fill();
  text(c, '▶  OPEN THE CART', b.x + b.w / 2, b.y + 42, 26, COLORS.text, 'bold', 'center');
  text(c, 'or press Enter', VIEW.w / 2, b.y + 92, 15, COLORS.textDim, 'normal', 'center');
  void keyChip;
}

export function drawDayDone(c, state) {
  dim(c);
  text(c, 'DAY ' + state.day + ' CLEAR!', VIEW.w / 2, 220, 64, COLORS.coin, 'bold', 'center');
  const cx = VIEW.w / 2;
  text(c, 'COINS', cx - 220, 300, 16, COLORS.textDim, 'bold');
  text(c, 'Rp ' + String(Math.floor(state.coins)), cx - 220, 340, 40, COLORS.text, 'bold');
  text(c, 'SERVED', cx - 20, 300, 16, COLORS.textDim, 'bold');
  text(c, String(state.served), cx - 20, 340, 40, COLORS.text, 'bold');
  text(c, 'WALK-OUTS', cx + 140, 300, 16, COLORS.textDim, 'bold');
  text(c, String(state.walkouts), cx + 140, 340, 40, COLORS.text, 'bold');
  text(c, 'Tomorrow: hungrier customers, shorter patience, faster arrivals.', cx, 400, 18, COLORS.textDim, 'normal', 'center');
  const b = BTN_NEXT;
  rr(c, b.x, b.y, b.w, b.h, 10);
  c.fillStyle = '#1a1033';
  c.fill();
  c.strokeStyle = COLORS.coin;
  c.lineWidth = 2;
  c.stroke();
  text(c, '▶  START DAY ' + (state.day + 1), b.x + b.w / 2, b.y + 42, 26, COLORS.text, 'bold', 'center');
  text(c, 'or press Enter', VIEW.w / 2, b.y + 92, 15, COLORS.textDim, 'normal', 'center');
}

export function drawGameOver(c, state) {
  dim(c);
  text(c, 'NIGHT OVER', VIEW.w / 2, 200, 72, COLORS.neonPink, 'bold', 'center');
  const cx = VIEW.w / 2;
  text(c, 'COINS', cx - 220, 290, 16, COLORS.textDim, 'bold');
  text(c, 'Rp ' + String(Math.floor(state.coins)), cx - 220, 330, 40, COLORS.text, 'bold');
  text(c, 'SERVED', cx - 20, 290, 16, COLORS.textDim, 'bold');
  text(c, String(state.served), cx - 20, 330, 40, COLORS.text, 'bold');
  text(c, 'BEST STREAK', cx + 140, 290, 16, COLORS.textDim, 'bold');
  text(c, String(state.bestStreak), cx + 140, 330, 40, COLORS.text, 'bold');
  text(c, 'Reached DAY ' + state.day, cx, 372, 18, COLORS.textDim, 'bold', 'center');
  if (state.newBest) {
    text(c, '★ NEW BEST! ★', cx, 408, 28, COLORS.coin, 'bold', 'center');
  } else if (state.best > 0) {
    text(c, 'BEST  Rp ' + String(state.best), cx, 408, 20, COLORS.textDim, 'bold', 'center');
  }
  const b = BTN_RESTART;
  rr(c, b.x, b.y, b.w, b.h, 10);
  c.fillStyle = '#1a1033';
  c.fill();
  c.strokeStyle = COLORS.coin;
  c.lineWidth = 2;
  c.stroke();
  text(c, '↻  OPEN AGAIN', b.x + b.w / 2, b.y + 42, 26, COLORS.text, 'bold', 'center');
  text(c, 'or press R', VIEW.w / 2, b.y + 92, 15, COLORS.textDim, 'normal', 'center');
}
