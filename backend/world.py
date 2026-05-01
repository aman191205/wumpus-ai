import random

class WumpusWorld:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.grid = [[{'pit': False, 'wumpus': False} for _ in range(cols)] for _ in range(rows)]
        self.agent_pos = (0, 0)
        self.wumpus_pos = None
        self.pit_positions = []
        self._place_hazards()

    def _place_hazards(self):
        all_cells = [(r, c) for r in range(self.rows) for c in range(self.cols) if (r, c) != (0, 0)]
        random.shuffle(all_cells)

        # Place wumpus
        self.wumpus_pos = all_cells[0]
        r, c = self.wumpus_pos
        self.grid[r][c]['wumpus'] = True

        # Place pits (~20% of remaining cells, at least 1)
        pit_count = max(1, int(len(all_cells) * 0.2))
        for r, c in all_cells[1:1 + pit_count]:
            self.grid[r][c]['pit'] = True
            self.pit_positions.append((r, c))

    def get_adjacent(self, row, col):
        neighbors = []
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = row + dr, col + dc
            if 0 <= nr < self.rows and 0 <= nc < self.cols:
                neighbors.append((nr, nc))
        return neighbors

    def get_percepts(self, row, col):
        percepts = []
        for nr, nc in self.get_adjacent(row, col):
            if self.grid[nr][nc]['pit']:
                percepts.append('Breeze')
                break
        for nr, nc in self.get_adjacent(row, col):
            if self.grid[nr][nc]['wumpus']:
                percepts.append('Stench')
                break
        if self.grid[row][col]['pit']:
            percepts.append('Pit')
        if self.grid[row][col]['wumpus']:
            percepts.append('Wumpus')
        return list(set(percepts))

    def get_state(self):
        return {
            'rows': self.rows,
            'cols': self.cols,
            'agent_pos': list(self.agent_pos),
            'wumpus_pos': list(self.wumpus_pos),
            'pit_positions': [list(p) for p in self.pit_positions],
        }