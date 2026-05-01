import React from 'react';

function cellKey(r, c) { return `${r},${c}`; }

function Grid({ world, agent, reveal }) {
  if (!world || !agent) return null;

  const { rows, cols, wumpus_pos, pit_positions } = world;
  const { pos, visited, safe, current_percepts, status } = agent;

  const visitedSet = new Set(visited.map(([r, c]) => cellKey(r, c)));
  const safeSet = new Set(safe.map(([r, c]) => cellKey(r, c)));
  const pitSet = new Set(pit_positions.map(([r, c]) => cellKey(r, c)));
  const wumpusKey = wumpus_pos ? cellKey(wumpus_pos[0], wumpus_pos[1]) : null;
  const agentKey = cellKey(pos[0], pos[1]);

  function getCellStyle(r, c) {
    const key = cellKey(r, c);
    const isAgent = key === agentKey;
    const isVisited = visitedSet.has(key);
    const isSafe = safeSet.has(key);
    const isPit = pitSet.has(key);
    const isWumpus = key === wumpusKey;

    if (isAgent) return styles.cellAgent;
    if (reveal && isPit) return styles.cellPit;
    if (reveal && isWumpus) return styles.cellWumpus;
    if (isVisited) return styles.cellVisited;
    if (isSafe) return styles.cellSafe;
    return styles.cellUnknown;
  }

  function getCellLabel(r, c) {
    const key = cellKey(r, c);
    const isPit = pitSet.has(key);
    const isWumpus = key === wumpusKey;
    const isAgent = key === agentKey;

    if (isAgent) {
      if (status === 'dead') return 'dead';
      if (status === 'win') return 'victory';
      return 'Agent';
    }
    if (reveal && isPit) return 'pit';
    if (reveal && isWumpus) return 'Wumpus';
    return `${r},${c}`;
  }

  const cellSize = Math.min(80, Math.floor(480 / Math.max(rows, cols)));

  return (
    <div style={styles.gridWrapper}>
      <div style={{ ...styles.grid, gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <div
              key={cellKey(r, c)}
              style={{ ...styles.cell, ...getCellStyle(r, c), width: cellSize, height: cellSize, fontSize: cellSize > 50 ? 22 : 14 }}
            >
              <span style={styles.cellLabel}>{getCellLabel(r, c)}</span>
            </div>
          ))
        )}
      </div>
      <div style={styles.legend}>
        <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#4ade80' }} /> Safe/Visited</span>
        <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#86efac' }} /> Inferred Safe</span>
        <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#374151' }} /> Unknown</span>
        <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#f87171' }} /> Hazard (revealed)</span>
      </div>
    </div>
  );
}

const styles = {
  gridWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  grid: { display: 'grid', gap: 4 },
  cell: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, fontWeight: 700, cursor: 'default',
    border: '2px solid rgba(255,255,255,0.08)',
    transition: 'background 0.4s',
    fontFamily: 'monospace',
  },
  cellAgent:   { background: '#facc15', color: '#1a1a2e', border: '2px solid #fbbf24' },
  cellVisited: { background: '#4ade80', color: '#14532d' },
  cellSafe:    { background: '#86efac', color: '#14532d' },
  cellUnknown: { background: '#374151', color: '#9ca3af' },
  cellPit:     { background: '#f87171', color: '#fff' },
  cellWumpus:  { background: '#ef4444', color: '#fff' },
  cellLabel:   { fontSize: 'inherit', userSelect: 'none' },
  legend: { display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 12 },
  dot: { width: 12, height: 12, borderRadius: '50%', display: 'inline-block' },
};

export default Grid;