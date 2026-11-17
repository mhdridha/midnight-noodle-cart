// Midnight Noodle Cart — staged states for screenshots (?shot=start|play|end).
// A shot freezes the game in one deterministic frame, so the three
// screenshots show the title, a mid-run moment and the game-over screen
// exactly as a player sees them, with no interaction needed.
import { SEATS, POTS } from './config.js';

function customer(kind, dish, patience, patienceMax, assignedPot = -1) {
  const kinds = {
    worker: { name: 'worker', color: '#4361ee', skin: '#e8b98a', hat: 'helmet' },
    student: { name: 'student', color: '#ff5d8f', skin: '#f2c9a0', hat: 'none' },
    driver: { name: 'driver', color: '#ffd60a', skin: '#c98d5f', hat: 'cap' },
    grandma: { name: 'grandma', color: '#7b2fbe', skin: '#e8b98a', hat: 'shawl' },
  };
  return { kind: kinds[kind], dish, patience, patienceMax, assignedPot };
}

function pot(state, dish, seat, progress, doneFor = 0) {
  return { state, dish, seat, progress, doneFor };
}

export function stageShot(g, which, seed) {
  const { state, world } = g;
  void seed;
  world.customers = [null, null, null];
  world.pots = [pot('empty'), pot('empty'), pot('empty')];
  world.particles = [];
  world.floats = [];
  state.now = 1.2;

  if (which === 'start') {
    state.mode = 'title';
    state.best = 1250;
    // Empty cart behind the title: the recipe cards read cleanly.
    world.customers = [null, null, null];
    world.pots = [pot('empty'), pot('empty'), pot('empty')];
    return;
  }

  if (which === 'play') {
    state.mode = 'playing';
    state.elapsed = 43;
    state.day = 2;
    state.dayLeft = 32;
    state.coins = 480;
    state.served = 14;
    state.streak = 5;
    state.bestStreak = 7;
    state.hearts = 3;
    state.best = 860;
    state.rushUntil = state.now + 9;
    state.prioritySeat = 0;
    world.customers = [
      customer('driver', 'bakso', 6, 24, 1),
      customer('grandma', 'mie', 15, 24),
      customer('worker', 'teh', 21, 24),
    ];
    world.pots = [
      pot('done', 'mie', 1, 1, 1.2),
      pot('cooking', 'bakso', 0, 0.55),
      pot('burnt', 'teh', 2, 1, 6),
    ];
    world.particles = [
      { x: 640, y: 360, vx: -4, vy: -36, life: 0.7, max: 0.9, color: 'rgba(230,230,255,0.7)', size: 5 },
      { x: 648, y: 350, vx: 5, vy: -30, life: 0.5, max: 0.9, color: 'rgba(230,230,255,0.7)', size: 4 },
      { x: 636, y: 355, vx: 0, vy: -40, life: 0.6, max: 0.9, color: 'rgba(230,230,255,0.7)', size: 3 },
    ];
    world.floats = [{ x: 640, y: 330, text: '+Rp 30', color: '#ffb703', life: 0.9, max: 1.1 }];
    return;
  }

  // 'end' (and anything else): the game-over screen.
  state.mode = 'over';
  state.day = 3;
  state.coins = 860;
  state.served = 23;
  state.walkouts = 2;
  state.bestStreak = 8;
  state.hearts = 0;
  state.best = 860;
  state.newBest = true;
  world.customers = [customer('worker', 'mie', 18, 26), null, null];
  void SEATS;
  void POTS;
}
