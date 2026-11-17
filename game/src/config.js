// Midnight Noodle Cart — tuning, dishes, colours and layout. One file
// owns every number the game runs on, so a balance change is one edit.
export const VIEW = { w: 1280, h: 720 };

export const COLORS = {
  skyTop: '#0b1030',
  skyBottom: '#1c1445',
  buildingFar: '#141a38',
  buildingNear: '#1d2347',
  windowLit: '#ffd166',
  windowDim: '#2c3358',
  neonPink: '#ff5d8f',
  neonCyan: '#2ec4b6',
  road: '#232338',
  sidewalk: '#2e2e4a',
  curb: '#3a3a5c',
  cartWood: '#6b4226',
  cartAwning: '#e63946',
  cartCounter: '#8a5a33',
  hudBg: 'rgba(8, 10, 28, 0.88)',
  text: '#f4f1de',
  textDim: '#9a97b5',
  heart: '#ff5d73',
  coin: '#ffb703',
  patienceOk: '#2ec4b6',
  patienceLow: '#ff5d73',
};

export const DISHES = {
  mie: { name: 'Mie Ayam', cook: 4, price: 15, color: '#ffb703', short: 'MIE' },
  bakso: { name: 'Bakso', cook: 6, price: 20, color: '#e63946', short: 'BAKSO' },
  teh: { name: 'Es Teh', cook: 2, price: 8, color: '#2ec4b6', short: 'TEH' },
};
export const DISH_KINDS = ['mie', 'bakso', 'teh'];

// Three stools (customers) and three pots (cooking), lined up on the cart.
export const SEATS = [
  { x: 420, y: 300 },
  { x: 640, y: 300 },
  { x: 860, y: 300 },
];
export const POTS = [
  { x: 420, y: 395 },
  { x: 640, y: 395 },
  { x: 860, y: 395 },
];

export const TUNING = {
  hearts: 3, // walk-outs before the night ends
  dayLength: 75, // seconds per day
  patienceBase: 26, // seconds a customer waits on day 1
  patiencePerDay: -1.5, // shorter patience each later day (min 16)
  patienceMin: 16,
  arrivalFirst: 2, // first customer arrives 2s in
  arrivalStart: 7, // seconds between arrivals on day 1
  arrivalPerDay: 0.9, // arrivals get 10% closer each day
  arrivalMin: 3.5,
  burnAfter: 5, // seconds a done dish sits before it burns
  comboCap: 10, // highest streak counted for the coin bonus
  rushAt: 5, // streak that triggers RUSH (double coins)
  rushTime: 15, // seconds RUSH lasts
  maxStreakBonus: 2, // coin multiplier caps at x2 (1 + streak*0.1)
};
