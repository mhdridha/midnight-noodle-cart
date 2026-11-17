// Midnight Noodle Cart — game loop, states and scoring. The loop owns
// one state object; the world moves it, the renderer draws it, the audio
// module hears it. Title -> playing -> day done -> playing -> over.
import { VIEW, SEATS, POTS, DISHES, TUNING } from './config.js';
import { mulberry32 } from './random.js';
import * as audio from './audio.js';
import { bindInput, drainKeys, takeClick, inRect } from './input.js';
import { createWorld, updateWorld, startPot, servePot, clearPot, burst, floatText } from './world.js';
import { drawWorld, drawHUD, drawTitle, drawDayDone, drawGameOver, BTN_START, BTN_NEXT, BTN_RESTART } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.w;
canvas.height = VIEW.h;

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.w, window.innerHeight / VIEW.h);
  canvas.style.width = Math.floor(VIEW.w * scale) + 'px';
  canvas.style.height = Math.floor(VIEW.h * scale) + 'px';
}
window.addEventListener('resize', fitCanvas);
fitCanvas();
bindInput(canvas);

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = parseInt(params.get('seed') || '1', 10) || 1;

function loadBest() {
  try {
    return parseInt(localStorage.getItem('noodle-best') || '0', 10) || 0;
  } catch (e) {
    return 0;
  }
}

function freshState() {
  return {
    mode: 'title',
    now: 0,
    elapsed: 0, // time inside the current day
    day: 1,
    dayLeft: TUNING.dayLength,
    coins: 0,
    served: 0,
    walkouts: 0,
    streak: 0,
    bestStreak: 0,
    hearts: TUNING.hearts,
    rushUntil: 0,
    prioritySeat: -1,
    best: loadBest(),
    newBest: false,
  };
}

const state = freshState();
let world = createWorld(mulberry32(seed));
const g = { state, world, now: 0 };

function saveBest() {
  try {
    localStorage.setItem('noodle-best', String(state.best));
  } catch (e) {
    /* best score is a nicety, never fatal */
  }
}

function startDay() {
  world = createWorld(mulberry32((Math.random() * 1e9) | 0));
  g.world = world;
  state.elapsed = 0;
  state.dayLeft = TUNING.dayLength;
  state.prioritySeat = -1;
  state.mode = 'playing';
  audio.unlockAudio();
}

function startRun() {
  const best = state.best;
  const fresh = freshState();
  fresh.best = best;
  Object.assign(state, fresh);
  startDay();
}

function endRun() {
  state.mode = 'over';
  audio.sfxGameOver();
  if (state.coins > state.best) {
    state.best = Math.floor(state.coins);
    state.newBest = true;
    saveBest();
  }
}

function applyEvents(events) {
  for (const ev of events) {
    if (ev.type === 'done') {
      audio.sfxDing();
    } else if (ev.type === 'burnt') {
      audio.sfxBurn();
      floatText(world, ev.x, ev.y - 10, 'BURNT!', '#ff5d73');
    } else if (ev.type === 'walkout') {
      state.hearts -= 1;
      state.walkouts += 1;
      state.streak = 0;
      audio.sfxWalkout();
      burst(world, ev.x, ev.y, '#ff5d73', 14, 200);
      floatText(world, ev.x, ev.y - 10, 'WALKED OUT!', '#ff5d73');
      if (state.hearts <= 0) endRun();
    }
  }
}

function serveFromPot(potIdx) {
  const served = servePot(world, state, potIdx);
  if (!served) return;
  const dish = DISHES[served.dish];
  state.streak += 1;
  if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  const mult = Math.min(TUNING.maxStreakBonus, 1 + Math.min(state.streak, TUNING.comboCap) * 0.1);
  const rush = state.now < state.rushUntil ? 2 : 1;
  const gain = Math.round(dish.price * mult * rush);
  state.coins += gain;
  state.served += 1;
  audio.sfxCoin();
  burst(world, POTS[potIdx].x, POTS[potIdx].y - 30, dish.color, 16, 200);
  floatText(world, POTS[potIdx].x, POTS[potIdx].y - 50, '+Rp ' + gain, '#ffb703');
  if (state.streak === TUNING.rushAt) {
    state.rushUntil = state.now + TUNING.rushTime;
    audio.sfxRush();
    floatText(world, VIEW.w / 2, 300, 'RUSH ×2!', '#ffb703');
  }
}

function update(dt) {
  state.now += dt;
  if (state.mode !== 'playing') return;

  state.elapsed += dt;
  state.dayLeft -= dt;
  if (state.dayLeft <= 0) {
    state.mode = 'daydone';
    audio.sfxDayClear();
    return;
  }

  const events = updateWorld(world, state, dt, Math.random);
  applyEvents(events);
}

function handleInput() {
  const keys = drainKeys();
  for (const k of keys) {
    if (k === 'm' || k === 'M') {
      audio.toggleMute();
      continue;
    }
    if (state.mode === 'title') {
      if (k === 'Enter' || k === ' ') {
        audio.unlockAudio();
        audio.sfxClick();
        startRun();
      }
      continue;
    }
    if (state.mode === 'daydone') {
      if (k === 'Enter' || k === ' ') {
        audio.sfxClick();
        state.day += 1;
        startDay();
      }
      continue;
    }
    if (state.mode === 'over') {
      if (k === 'r' || k === 'R' || k === 'Enter' || k === ' ') {
        audio.sfxClick();
        startRun();
      }
    }
  }

  const click = takeClick();
  if (!click) return;
  audio.unlockAudio();
  if (state.mode === 'title') {
    if (inRect(click, BTN_START)) {
      audio.sfxClick();
      startRun();
    }
    return;
  }
  if (state.mode === 'daydone') {
    if (inRect(click, BTN_NEXT)) {
      audio.sfxClick();
      state.day += 1;
      startDay();
    }
    return;
  }
  if (state.mode === 'over') {
    if (inRect(click, BTN_RESTART)) {
      audio.sfxClick();
      startRun();
    }
    return;
  }
  if (state.mode === 'playing') {
    // Pots first: click a pot to cook / serve / clear.
    for (let i = 0; i < 3; i++) {
      const p = POTS[i];
      if (Math.abs(click.x - p.x) < 52 && Math.abs(click.y - p.y) < 46) {
        const pot = world.pots[i];
        if (pot.state === 'empty') {
          if (startPot(world, state, i)) audio.sfxStartCook();
        } else if (pot.state === 'done') {
          serveFromPot(i);
        } else if (pot.state === 'burnt') {
          if (clearPot(world, i)) audio.sfxClick();
        }
        return;
      }
    }
    // Then customers: click one to serve them first.
    for (let i = 0; i < 3; i++) {
      const s = SEATS[i];
      if (world.customers[i] && Math.abs(click.x - s.x) < 60 && Math.abs(click.y - s.y) < 90) {
        state.prioritySeat = state.prioritySeat === i ? -1 : i;
        audio.sfxClick();
        return;
      }
    }
  }
}

function render() {
  g.now = state.now;
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  drawWorld(ctx, g);
  if (state.mode === 'playing' || state.mode === 'daydone') drawHUD(ctx, state);
  if (state.mode === 'title') drawTitle(ctx, state);
  if (state.mode === 'daydone') drawDayDone(ctx, state);
  if (state.mode === 'over') drawGameOver(ctx, state);
}

if (shot) {
  stageShot(g, shot, seed);
}

let last = performance.now();
function frame(t) {
  const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
  last = t;
  handleInput();
  if (!shot) update(dt);
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Keep the canvas honest about where the night stands for screen readers.
const statusEl = document.getElementById('status');
if (statusEl) {
  setInterval(() => {
    if (state.mode === 'playing') {
      statusEl.textContent =
        'Day ' + state.day + ', coins Rp ' + Math.floor(state.coins) + ', served ' + state.served +
        ', hearts ' + state.hearts + ' of ' + TUNING.hearts + '.';
    }
  }, 1000);
}
