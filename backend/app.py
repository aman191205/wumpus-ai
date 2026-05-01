from flask import Flask, request, jsonify
from flask_cors import CORS
from world import WumpusWorld
from agent import Agent

app = Flask(__name__)
CORS(app)

# Global session state
world = None
agent = None

@app.route('/api/new_game', methods=['POST'])
def new_game():
    global world, agent
    data = request.json
    rows = int(data.get('rows', 4))
    cols = int(data.get('cols', 4))
    rows = max(2, min(rows, 8))
    cols = max(2, min(cols, 8))

    world = WumpusWorld(rows, cols)
    agent = Agent(rows, cols)

    # Process initial percepts at (0,0)
    percepts = world.get_percepts(0, 0)
    agent.process_percepts(percepts, world)

    return jsonify({
        'world': world.get_state(),
        'agent': agent.get_state(),
    })

@app.route('/api/step', methods=['POST'])
def step():
    global world, agent
    if world is None or agent is None:
        return jsonify({'error': 'No game in progress'}), 400

    if agent.status != 'alive':
        return jsonify({'world': world.get_state(), 'agent': agent.get_state(), 'moved': False})

    next_pos = agent.choose_next_move()
    if next_pos is None:
        return jsonify({'world': world.get_state(), 'agent': agent.get_state(), 'moved': False})

    agent.move_to(next_pos, world)

    # Check win: all non-hazard cells visited
    all_cells = {(r, c) for r in range(world.rows) for c in range(world.cols)}
    hazards = set(world.pit_positions) | {world.wumpus_pos}
    safe_cells = all_cells - hazards
    if safe_cells.issubset(agent.visited):
        agent.status = 'win'

    return jsonify({
        'world': world.get_state(),
        'agent': agent.get_state(),
        'moved': True,
        'moved_to': list(next_pos),
    })

@app.route('/api/state', methods=['GET'])
def state():
    if world is None or agent is None:
        return jsonify({'error': 'No game in progress'}), 400
    return jsonify({'world': world.get_state(), 'agent': agent.get_state()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)