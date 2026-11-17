// Midnight Noodle Cart — the world: customers, pots, steam and floats.
// The cart serves whoever is hungriest: a pot cooks the dish of the
// neediest waiting customer (or the prioritized one), and a done dish
// left sitting too long burns. updateWorld returns the events the run
// scored on this frame.
import { VIEW, SEATS, POTS, DISHES, DISH_KINDS, TUNING } from './config.js';
import { pick, range, rangeInt } from './random.js';

const CUSTOMER_KINDS = [
  { name: 'worker', color: '#4361ee', skin: '#e8b98a', hat: 'helmet' },
  { name: 'student', color: '#ff5d8f', skin: '#f2c9a0', hat: 'none' },
  { name: 'driver', color: '#ffd60a', skin: '#c98d5f', hat: 'cap' },
  { name: 'grandma', color: '#7b2fbe', skin: '#e8b98a', hat: 'shawl' },
];

export function patienceForDay(day) {
  return Math.max(TUNING.patienceMin, TUNING.patienceBase + (day - 1) * TUNING.patiencePerDay);
}

export function arrivalInterval(day) {
  return Math.max(TUNING.arrivalMin, TUNING.arrivalStart * Math.pow(TUNING.arrivalPerDay, day - 1));
}

export function createWorld(rng) {
  const stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({ x: rng() * VIEW.w, y: rng() * 260, r: range(rng, 0.6, 1.8), p: rng() * 6.28 });
  }
  return {
    stars,
    customers: [null, null, null], // one per seat
    pots: POTS.map(() => ({ state: 'empty', dish: null, seat: -1, progress: 0, doneFor: 0 })),
    spawnIn: TUNING.arrivalFirst,
    floats: [],
    particles: [],
  };
}

function addParticles(world, x, y, color, n, speed) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283;
    const v = range(Math.random, speed * 0.3, speed);
    world.particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 40,
      life: range(Math.random, 0.35, 0.8),
      max: 0.8,
      color,
      size: range(Math.random, 2, 5),
    });
  }
}

function addFloat(world, x, y, text, color) {
  world.floats.push({ x, y, text, color, life: 1.1, max: 1.1 });
}

function spawnCustomer(world, state, rng) {
  const free = [0, 1, 2].filter((i) => !world.customers[i]);
  if (!free.length) return;
  const seat = pick(rng, free);
  const kind = pick(rng, CUSTOMER_KINDS);
  const roll = rng();
  const dish = roll < 0.45 ? 'mie' : roll < 0.75 ? 'bakso' : 'teh';
  const patienceMax = patienceForDay(state.day);
  world.customers[seat] = {
    kind,
    dish,
    patience: patienceMax,
    patienceMax,
    assignedPot: -1,
  };
}

// The neediest unassigned customer: the prioritized seat first, then the
// one whose patience bar is emptiest.
export function neediestCustomer(world, state) {
  let best = -1;
  let bestRatio = 2;
  for (let i = 0; i < 3; i++) {
    const c = world.customers[i];
    if (!c || c.assignedPot >= 0) continue;
    if (state.prioritySeat === i) return i;
    const ratio = c.patience / c.patienceMax;
    if (ratio < bestRatio) {
      bestRatio = ratio;
      best = i;
    }
  }
  return best;
}

// Click an empty pot: it starts cooking for the neediest customer.
export function startPot(world, state, potIdx) {
  const pot = world.pots[potIdx];
  if (pot.state !== 'empty') return null;
  const seat = neediestCustomer(world, state);
  if (seat < 0) return null;
  const c = world.customers[seat];
  pot.state = 'cooking';
  pot.dish = c.dish;
  pot.seat = seat;
  pot.progress = 0;
  pot.doneFor = 0;
  c.assignedPot = potIdx;
  if (state.prioritySeat === seat) state.prioritySeat = -1;
  return { dish: c.dish, seat };
}

// Click a done pot: serve its customer. Returns the serve for scoring.
export function servePot(world, state, potIdx) {
  const pot = world.pots[potIdx];
  if (pot.state !== 'done') return null;
  const seat = pot.seat;
  const c = world.customers[seat];
  const dish = pot.dish;
  world.pots[potIdx] = { state: 'empty', dish: null, seat: -1, progress: 0, doneFor: 0 };
  if (c) world.customers[seat] = null;
  return { dish, seat };
}

// Click a burnt pot: throw it away.
export function clearPot(world, potIdx) {
  const pot = world.pots[potIdx];
  if (pot.state !== 'burnt') return false;
  world.pots[potIdx] = { state: 'empty', dish: null, seat: -1, progress: 0, doneFor: 0 };
  return true;
}

export function updateWorld(world, state, dt, rng) {
  const events = [];

  // New customers walk in.
  world.spawnIn -= dt;
  if (world.spawnIn <= 0) {
    spawnCustomer(world, state, rng);
    world.spawnIn = arrivalInterval(state.day) * range(rng, 0.85, 1.2);
  }

  // Patience drains; the impatient walk out.
  for (let i = 0; i < 3; i++) {
    const c = world.customers[i];
    if (!c) continue;
    c.patience -= dt;
    if (c.patience <= 0) {
      if (c.assignedPot >= 0) {
        world.pots[c.assignedPot] = { state: 'empty', dish: null, seat: -1, progress: 0, doneFor: 0 };
      }
      world.customers[i] = null;
      events.push({ type: 'walkout', seat: i, x: SEATS[i].x, y: SEATS[i].y - 60 });
    }
  }

  // Pots cook, finish, then burn if ignored.
  for (let i = 0; i < 3; i++) {
    const pot = world.pots[i];
    if (pot.state === 'cooking') {
      pot.progress += dt / DISHES[pot.dish].cook;
      if (rng() < dt * 6) {
        world.particles.push({
          x: POTS[i].x + range(rng, -12, 12), y: POTS[i].y - 26,
          vx: range(rng, -6, 6), vy: range(rng, -46, -28),
          life: range(rng, 0.5, 0.9), max: 0.9, color: 'rgba(230,230,255,0.7)', size: range(rng, 3, 6),
        });
      }
      if (pot.progress >= 1) {
        pot.state = 'done';
        pot.doneFor = 0;
        events.push({ type: 'done', pot: i, dish: pot.dish, x: POTS[i].x, y: POTS[i].y - 40 });
      }
    } else if (pot.state === 'done') {
      pot.doneFor += dt;
      if (pot.doneFor > TUNING.burnAfter) {
        pot.state = 'burnt';
        events.push({ type: 'burnt', pot: i, x: POTS[i].x, y: POTS[i].y - 40 });
      }
    }
  }

  // Particles and floating texts.
  for (const pt of world.particles) {
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy -= 20 * dt;
    pt.life -= dt;
  }
  world.particles = world.particles.filter((pt) => pt.life > 0);
  for (const f of world.floats) {
    f.y -= 42 * dt;
    f.life -= dt;
  }
  world.floats = world.floats.filter((f) => f.life > 0);

  return events;
}

export function burst(world, x, y, color, n, speed) {
  addParticles(world, x, y, color, n, speed);
}

export function floatText(world, x, y, text, color) {
  addFloat(world, x, y, text, color);
}

export { DISHES, DISH_KINDS };
