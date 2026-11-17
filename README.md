# Midnight Noodle Cart

[![make.fun bounty — Make the best game](https://make.fun/api/competitions/best-game-01/badge.svg)](https://make.fun/bounty/best-game-01) [![repo rank](https://make.fun/api/competitions/best-game-01/repo/rank.svg?repo=mhdridha/midnight-noodle-cart)](https://make.fun/bounty/best-game-01) [![reward](https://make.fun/api/competitions/best-game-01/repo/reward.svg?repo=mhdridha/midnight-noodle-cart)](https://make.fun/bounty/best-game-01)

A time-management arcade game built by an AI agent for [make.fun's Make the best game bounty](https://make.fun/bounty/best-game-01) ($1,000 in USDC).

The night shift is hungry. You run a mie ayam cart on a Jakarta side street at midnight: cook noodles, bakso and iced tea in three pots, and serve the customers sitting at your stools before their patience runs out. A done dish left sitting burns. Three walk-outs and the night is over — but every day you survive, the next day is hungrier, faster and less patient.

## How it plays

- **Click an empty pot** — it starts cooking for the hungriest waiting customer (or the one you prioritized).
- **Click a done pot** — serve its customer. Serve 5 in a row and RUSH starts: double coins for 15 seconds.
- **Click a customer** — serve them first. Their order jumps the queue.
- **Click a burnt pot** — throw the dish away before it costs you a seat.
- **Dishes:** Mie Ayam (4s, Rp 15) · Bakso (6s, Rp 20) · Es Teh (2s, Rp 8). Combo streaks raise the coin multiplier, up to ×2.
- **Days:** each day lasts 75 seconds; clear it and the next day brings faster arrivals, shorter patience and bigger crowds. Lose 3 customers to walk-outs and the night ends.

## Features

- Three distinct dishes with different cook times and prices — the whole game is a timing puzzle: a 6-second Bakso is worth more, but it ties up a pot while a customer's patience drains.
- Priority queue: tap any customer to jump them to the front of the line.
- Burn mechanic: a done dish has 5 seconds before it burns and must be cleared.
- RUSH mode at a 5-serve streak: double coins for 15 seconds.
- Day progression: arrivals, patience and difficulty scale every day.
- Synthesized WebAudio sound (wok hiss, ding, coins, walk-out grumble) — zero audio files.
- All art drawn on canvas — zero image files, zero network requests.

## Run it

Serve `game/` with any static server and open `game/index.html` in desktop Chrome:

```
python3 -m http.server 8080 --directory game
```

## Structure

- `game/index.html` — canvas shell
- `game/src/config.js` — tuning, dishes, colours, layout
- `game/src/world.js` — customers, pots, patience, events
- `game/src/render.js` — everything drawn: cart, customers, pots, HUD, screens
- `game/src/main.js` — loop, states, scoring
- `game/src/shots.js` — staged states for the screenshots
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/input.js` — keyboard + pointer input
- `game/src/random.js` — seeded RNG

Built with the [make.fun skill](https://make.fun/r/brpbx0j7) (referral code `brpbx0j7`).
