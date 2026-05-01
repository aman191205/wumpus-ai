from kb import KnowledgeBase
from resolution import resolution_refutation

class Agent:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.pos = (0, 0)
        self.kb = KnowledgeBase()
        self.visited = set()
        self.safe = set()
        self.confirmed_pits = set()
        self.confirmed_wumpus = set()
        self.total_inference_steps = 0
        self.current_percepts = []
        self.status = 'alive'  # alive, dead, win

        # Agent starts at (0,0) — known safe
        self.safe.add((0, 0))
        self.visited.add((0, 0))
        self.kb.tell_no_hazard(0, 0)

    def get_adjacent(self, row, col):
        neighbors = []
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = row + dr, col + dc
            if 0 <= nr < self.rows and 0 <= nc < self.cols:
                neighbors.append((nr, nc))
        return neighbors

    def process_percepts(self, percepts, world):
        """Update KB based on percepts at current position."""
        self.current_percepts = percepts
        row, col = self.pos
        neighbors = self.get_adjacent(row, col)

        if 'Pit' in percepts or 'Wumpus' in percepts:
            self.status = 'dead'
            return

        if 'Breeze' in percepts:
            self.kb.tell_breeze(row, col, neighbors)
        else:
            self.kb.tell_no_breeze(row, col, neighbors)

        if 'Stench' in percepts:
            self.kb.tell_stench(row, col, neighbors)
        else:
            self.kb.tell_no_stench(row, col, neighbors)

    def check_cell_safe(self, row, col):
        """Use resolution to check if cell is safe (no pit AND no wumpus)."""
        kb_clauses = self.kb.get_clauses()

        proved_no_pit, steps1 = resolution_refutation(kb_clauses, f'-P_{row}_{col}')
        proved_no_wumpus, steps2 = resolution_refutation(kb_clauses, f'-W_{row}_{col}')
        self.total_inference_steps += steps1 + steps2

        return proved_no_pit and proved_no_wumpus

    def choose_next_move(self):
        """Choose the next safe unvisited cell, or revisit a safe cell."""
        row, col = self.pos
        neighbors = self.get_adjacent(row, col)

        # Priority 1: unvisited neighbors proven safe
        for nr, nc in neighbors:
            if (nr, nc) not in self.visited:
                if (nr, nc) in self.safe or self.check_cell_safe(nr, nc):
                    self.safe.add((nr, nc))
                    return (nr, nc)

        # Priority 2: any known safe unvisited cell
        for r in range(self.rows):
            for c in range(self.cols):
                if (r, c) not in self.visited and (r, c) in self.safe:
                    return (r, c)

        # No safe move found
        return None

    def move_to(self, pos, world):
        """Move agent to pos and process percepts."""
        self.pos = pos
        self.visited.add(pos)
        self.kb.tell_no_hazard(pos[0], pos[1])
        self.safe.add(pos)
        percepts = world.get_percepts(pos[0], pos[1])
        self.process_percepts(percepts, world)

    def get_state(self):
        return {
            'pos': list(self.pos),
            'visited': [list(v) for v in self.visited],
            'safe': [list(s) for s in self.safe],
            'confirmed_pits': [list(p) for p in self.confirmed_pits],
            'confirmed_wumpus': [list(w) for w in self.confirmed_wumpus],
            'total_inference_steps': self.total_inference_steps,
            'current_percepts': self.current_percepts,
            'status': self.status,
        }