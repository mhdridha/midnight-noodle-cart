// Kilat Courier — keyboard and mouse input. Keys fire edge-triggered
// actions (lane change, pause, restart) through a small queue the game
// loop drains; held keys are readable as a live set. Clicks land in
// logical canvas coordinates, so menu buttons work at any window size.
import { VIEW } from './config.js';

const pressed = new Set();
const queue = [];
let mouse = { x: 0, y: 0, clicked: false };
let canvas = null;

export function bindInput(canvasEl) {
  canvas = canvasEl;
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (!e.repeat) {
      pressed.add(e.key);
      queue.push(e.key);
    }
  });
  window.addEventListener('keyup', (e) => pressed.delete(e.key));
  window.addEventListener('blur', () => pressed.clear());
  canvasEl.addEventListener('pointerdown', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * VIEW.w;
    mouse.y = ((e.clientY - rect.top) / rect.height) * VIEW.h;
    mouse.clicked = true;
  });
}

export function drainKeys() {
  const out = queue.splice(0, queue.length);
  return out;
}

export function keyHeld(key) {
  return pressed.has(key);
}

export function takeClick() {
  if (!mouse.clicked) return null;
  mouse.clicked = false;
  return { x: mouse.x, y: mouse.y };
}

export function inRect(p, r) {
  return p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
