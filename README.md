# Wumpus Logic Agent

*A Knowledge-Based Agent navigating a Wumpus World using Propositional Logic and Resolution Refutation.*

---

## Project Structure

```text
wumpus-ai/
├── backend/
│   ├── app.py
│   ├── world.py
│   ├── agent.py
│   ├── kb.py
│   └── resolution.py
└── frontend/
    └── src/
        ├── App.js
        ├── Grid.js
        ├── Dashboard.js
        └── api.js
```

---

## Setup & Run

### Backend

```bash
cd backend
pip install flask flask-cors
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## How It Works

### 1. World Generation

- Grid size **2x2** to **8x8**
- One **Wumpus** placed randomly (never at start)
- **Pits** cover ~20% of cells (minimum 1)
- Agent starts at **(0,0)** — always safe

### 2. Percepts

| Percept | Meaning |
|---------|---------|
| `Breeze` | Adjacent cell has a pit |
| `Stench` | Adjacent cell has a wumpus |
| `Pit` | Agent fell in a pit → **dead** |
| `Wumpus` | Agent walked into wumpus → **dead** |

### 3. Knowledge Base

Clauses stored in **CNF**. Literals: `P_r_c` (pit), `W_r_c` (wumpus), `-P_r_c` (negation).

| Event | Clauses Added |
|-------|---------------|
| Breeze at (r,c) | `P_n1 ∨ P_n2 ∨ …` |
| No Breeze | `¬P_n` for all neighbors |
| Stench at (r,c) | `W_n1 ∨ W_n2 ∨ …` |
| No Stench | `¬W_n` for all neighbors |
| Visited (r,c) | `¬P_r_c` and `¬W_r_c` |

### 4. Resolution Refutation

Before every move the agent asks:
ASK: ¬P_r_c   (no pit?)
ASK: ¬W_r_c   (no wumpus?)

Proof by contradiction — negate the query, resolve until **empty clause** found. Capped at **5,000 steps**.

### 5. Movement Priority

1. Unvisited **neighbor** proven safe
2. Any unvisited **safe cell** on the grid
3. No safe move → agent **halts**

### 6. Win Condition

All non-hazard cells visited → **WIN**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/new_game` | Start game — body: `{"rows":4,"cols":4}` |
| `POST` | `/api/step` | Move agent one step |
| `GET` | `/api/state` | Get current world + agent state |

---

## UI Controls

| Control | Description |
|---------|-------------|
| Rows / Cols | Grid size (2–8) |
| Speed (ms) | Auto-step delay |
| **New Game** | Generate new world |
| **Step** | Single agent move |
| **▶ Auto** | Run continuously |
| **⏸ Pause** | Stop auto-run |
| **Reveal** | Show pits and wumpus |

---

## Grid Colors

| Color | Meaning |
|-------|---------|
| 🟡 Yellow | Agent position |
| 🟢 Green | Visited + safe |
| 🟩 Light Green | Inferred safe |
| ⬛ Gray | Unknown |
| 🔴 Red | Hazard (revealed) |

---

## Dashboard Metrics

- **Inference Steps** — total resolution steps used
- **Agent Position** — current `(row, col)`
- **Cells Visited** — out of total grid cells
- **Safe Cells** — proven safe by KB
- **Current Percepts** — live sensor readings
- **KB Logic Panel** — clauses added this step

---

## Limitations

- *No arrow mechanic* — wumpus cannot be eliminated
- *Halts on uncertainty* — never takes unproven risks
- *5,000 step cap* per resolution query
- *Max 8×8 grid* to keep inference tractable
