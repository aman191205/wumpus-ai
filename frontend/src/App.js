import React, { useState, useRef } from 'react';
import Grid from './Grid';
import Dashboard from './Dashboard';
import { newGame, stepGame } from './api';

export default function App() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [gameState, setGameState] = useState(null);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef(null);

  function addLog(msg) {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 40));
  }

  async function handleNewGame() {
    stopAuto();
    const data = await newGame(rows, cols);
    setGameState(data);
    setReveal(false);
    addLog(`New game started: ${rows}×${cols} grid`);
  }

  async function handleStep() {
    if (!gameState) return;
    const data = await stepGame();
    setGameState(data);
    if (data.moved) {
      addLog(`Agent moved to (${data.moved_to[0]}, ${data.moved_to[1]}) | Percepts: ${data.agent.current_percepts.join(', ') || 'None'} | Steps: ${data.agent.total_inference_steps}`);
    } else {
      addLog(`No safe move found. Agent ${data.agent.status}.`);
      stopAuto();
    }
    if (data.agent.status !== 'alive') {
      stopAuto();
      setReveal(true);
      addLog(`Game over: ${data.agent.status.toUpperCase()}`);
    }
  }

  function startAuto() {
    if (running || !gameState) return;
    setRunning(true);
    intervalRef.current = setInterval(async () => {
      const data = await stepGame();
      setGameState(data);
      if (data.moved) {
        addLog(`→ (${data.moved_to[0]},${data.moved_to[1]}) | ${data.agent.current_percepts.join(', ') || 'Clear'}`);
      }
      if (!data.moved || data.agent.status !== 'alive') {
        stopAuto();
        setReveal(true);
        addLog(`Auto-run ended: ${data.agent.status}`);
      }
    }, speed);
  }

  function stopAuto() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Wumpus Logic Agent</h1>
        <p style={styles.subtitle}>Knowledge-Based Agent · Propositional Logic · Resolution Refutation</p>
      </header>

      <div style={styles.controls}>
        <label style={styles.label}>Rows
          <input style={styles.input} type="number" min={2} max={8} value={rows}
            onChange={e => setRows(Number(e.target.value))} />
        </label>
        <label style={styles.label}>Cols
          <input style={styles.input} type="number" min={2} max={8} value={cols}
            onChange={e => setCols(Number(e.target.value))} />
        </label>
        <label style={styles.label}>Speed (ms)
          <input style={styles.input} type="number" min={100} max={2000} step={100} value={speed}
            onChange={e => setSpeed(Number(e.target.value))} />
        </label>
        <button style={styles.btn} onClick={handleNewGame}>New Game</button>
        <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={handleStep} disabled={!gameState || running}>Step</button>
        {!running
          ? <button style={{ ...styles.btn, ...styles.btnGreen }} onClick={startAuto} disabled={!gameState}>▶ Auto</button>
          : <button style={{ ...styles.btn, ...styles.btnRed }} onClick={stopAuto}>⏸ Pause</button>
        }
        <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => setReveal(r => !r)} disabled={!gameState}>
          {reveal ? ' Hide' : ' Reveal'}
        </button>
      </div>

      {gameState ? (
        <div style={styles.main}>
          <div style={styles.gridPanel}>
            <Grid world={gameState.world} agent={gameState.agent} reveal={reveal} />
          </div>
          <div style={styles.sidePanel}>
            <Dashboard agent={gameState.agent} world={gameState.world} />
            <div style={styles.logBox}>
              <div style={styles.logTitle}>Agent Log</div>
              {log.map((l, i) => <div key={i} style={styles.logLine}>{l}</div>)}
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.empty}>Configure grid and click <strong>New Game</strong> to start.</div>
      )}
    </div>
  );
}

const styles = {
  app: { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Courier New', monospace", padding: '24px 32px' },
  header: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1, color: '#f9fafb' },
  subtitle: { color: '#64748b', fontSize: 14, marginTop: 6 },
  controls: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 28 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, color: '#9ca3af', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' },
  input: { background: '#1e293b', border: '1px solid #374151', borderRadius: 8, color: '#f1f5f9', padding: '8px 12px', width: 72, fontSize: 15, outline: 'none' },
  btn: { padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14, background: '#3b82f6', color: '#fff', transition: 'opacity 0.2s' },
  btnSecondary: { background: '#6366f1' },
  btnGreen: { background: '#22c55e' },
  btnRed: { background: '#ef4444' },
  btnGhost: { background: '#374151' },
  main: { display: 'flex', gap: 28, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' },
  gridPanel: { flex: '0 0 auto' },
  sidePanel: { flex: '1 1 320px', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 },
  logBox: { background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 14, maxHeight: 200, overflowY: 'auto' },
  logTitle: { color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 },
  logLine: { color: '#86efac', fontSize: 12, padding: '2px 0', borderBottom: '1px solid #1f2937' },
  empty: { textAlign: 'center', color: '#4b5563', marginTop: 60, fontSize: 18 },
};