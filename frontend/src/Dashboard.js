import React from 'react';

function Badge({ label, color }) {
  return (
    <span style={{ ...styles.badge, background: color }}>
      {label}
    </span>
  );
}

function MetricCard({ title, value, sub }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      {sub && <div style={styles.cardSub}>{sub}</div>}
    </div>
  );
}

function Dashboard({ agent, world }) {
  if (!agent || !world) return null;

  const { pos, visited, safe, total_inference_steps, current_percepts, status } = agent;
  const percept_colors = { Breeze: '#60a5fa', Stench: '#a78bfa', Pit: '#f87171', Wumpus: '#fb923c' };

  const statusText = status === 'alive' ? 'Agent Navigating' : status === 'win' ? ' Goal Reached!' : ' Agent Dead';
  const statusColor = status === 'alive' ? '#4ade80' : status === 'win' ? '#facc15' : '#f87171';

  return (
    <div style={styles.dashboard}>
      <div style={styles.statusBar}>
        <span style={{ color: statusColor, fontWeight: 700, fontSize: 18 }}>{statusText}</span>
      </div>

      <div style={styles.metrics}>
        <MetricCard title="Inference Steps" value={total_inference_steps} sub="Resolution Refutation total" />
        <MetricCard title="Agent Position" value={`(${pos[0]}, ${pos[1]})`} sub="row, col" />
        <MetricCard title="Cells Visited" value={visited.length} sub={`of ${world.rows * world.cols} total`} />
        <MetricCard title="Safe Cells Found" value={safe.length} sub="proven by KB" />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Current Percepts</div>
        <div style={styles.percepts}>
          {current_percepts.length === 0
            ? <span style={{ color: '#6b7280', fontSize: 14 }}>None — cell is clear</span>
            : current_percepts.map(p => (
                <Badge key={p} label={p} color={percept_colors[p] || '#6b7280'} />
              ))
          }
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>KB Logic (last percepts → clauses)</div>
        <div style={styles.kbBox}>
          {current_percepts.includes('Breeze') &&
            <div style={styles.kbLine}>B<sub>{pos[0]},{pos[1]}</sub> → ∃ adjacent Pit (Disjunction added to KB)</div>}
          {current_percepts.includes('Stench') &&
            <div style={styles.kbLine}>S<sub>{pos[0]},{pos[1]}</sub> → ∃ adjacent Wumpus (Disjunction added to KB)</div>}
          {!current_percepts.includes('Breeze') &&
            <div style={styles.kbLine}>¬B<sub>{pos[0]},{pos[1]}</sub> → All adjacent cells: ¬Pit (unit clauses)</div>}
          {!current_percepts.includes('Stench') &&
            <div style={styles.kbLine}>¬S<sub>{pos[0]},{pos[1]}</sub> → All adjacent cells: ¬Wumpus (unit clauses)</div>}
          <div style={styles.kbLine}>Resolution: ASK KB ¬P<sub>r,c</sub> ∧ ¬W<sub>r,c</sub> before each move</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: { display: 'flex', flexDirection: 'column', gap: 20 },
  statusBar: { padding: '10px 0', borderBottom: '1px solid #374151' },
  metrics: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  card: {
    background: '#1f2937', borderRadius: 10, padding: '14px 16px',
    border: '1px solid #374151',
  },
  cardTitle: { color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  cardValue: { color: '#f9fafb', fontSize: 26, fontWeight: 800, fontFamily: 'monospace' },
  cardSub: { color: '#6b7280', fontSize: 11, marginTop: 4 },
  section: { display: 'flex', flexDirection: 'column', gap: 10 },
  sectionTitle: { color: '#d1d5db', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  percepts: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  badge: { padding: '6px 14px', borderRadius: 20, color: '#fff', fontWeight: 700, fontSize: 13 },
  kbBox: {
    background: '#111827', borderRadius: 8, padding: 14, border: '1px solid #374151',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  kbLine: { color: '#86efac', fontFamily: 'monospace', fontSize: 13 },
};

export default Dashboard;