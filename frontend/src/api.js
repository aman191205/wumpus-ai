const BASE = 'https://wumpus-ai-production.up.railway.app/api';

export async function newGame(rows, cols) {
  const res = await fetch(`${BASE}/new_game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows, cols }),
  });
  return res.json();
}

export async function stepGame() {
  const res = await fetch(`${BASE}/step`, { method: 'POST' });
  return res.json();
}

export async function getState() {
  const res = await fetch(`${BASE}/state`);
  return res.json();
}