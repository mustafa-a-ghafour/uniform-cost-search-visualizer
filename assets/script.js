/**
 * Uniform Cost Search (UCS) Visualizer - Adventure Time Edition
 * Pure Vanilla JavaScript implementation of ucs.py
 */

// 1. Graph presets & definitions
const PRESET_GRAPHS = {
  graph1: {
    key: 'graph1',
    name: 'Graph 1 (Multi-Branch: S ➔ G)',
    startNode: 'S',
    goalNode: 'G',
    data: {
      'S': [['A', 40], ['B', 70]],
      'A': [['C', 60], ['D', 100]],
      'B': [['D', 30], ['E', 80]],
      'C': [['F', 40]],
      'D': [['E', 20], ['G', 90]],
      'E': [['G', 60]],
      'F': [['G', 30]],
      'G': []
    },
    positions: {
      'S': { x: 90, y: 180 },
      'A': { x: 270, y: 105 },
      'B': { x: 270, y: 255 },
      'C': { x: 470, y: 95 },
      'D': { x: 470, y: 235 },
      'F': { x: 670, y: 95 },
      'E': { x: 670, y: 235 },
      'G': { x: 870, y: 180 }
    },
    curvatures: {
      'B-E': -55,
      'D-G': 25
    },
    badgePositions: {
      'S-A': 0.50,
      'S-B': 0.50,
      'A-C': 0.50,
      'A-D': 0.40,
      'B-D': 0.45,
      'B-E': 0.50,
      'C-F': 0.50,
      'D-E': 0.50,
      'D-G': 0.45,
      'E-G': 0.55,
      'F-G': 0.50
    }
  },

  graph2: {
    key: 'graph2',
    name: 'Graph 2 (Assignment: S ➔ M)',
    startNode: 'S',
    goalNode: 'M',
    data: {
      'S': [['A', 100], ['B', 50], ['C', 200]],
      'A': [['B', 80], ['D', 150], ['E', 250]],
      'B': [['D', 120], ['E', 60], ['F', 200]],
      'C': [['B', 90], ['F', 70], ['G', 250]],
      'D': [['E', 40], ['G', 180], ['H', 130]],
      'E': [['F', 30], ['H', 90], ['I', 220]],
      'F': [['G', 110], ['H', 50], ['I', 100]],
      'G': [['I', 60], ['J', 190]],
      'H': [['I', 40], ['J', 120], ['K', 230]],
      'I': [['J', 70], ['K', 80]],
      'J': [['K', 100], ['L', 200]],
      'K': [['L', 50], ['M', 170]],
      'L': [['M', 90]],
      'M': []
    },
    positions: {
      'S': { x: 55, y: 180 },
      'A': { x: 175, y: 70 },
      'B': { x: 175, y: 180 },
      'C': { x: 175, y: 290 },
      'D': { x: 325, y: 70 },
      'E': { x: 325, y: 180 },
      'F': { x: 325, y: 290 },
      'G': { x: 485, y: 75 },
      'H': { x: 485, y: 180 },
      'I': { x: 485, y: 290 },
      'J': { x: 645, y: 125 },
      'K': { x: 645, y: 245 },
      'L': { x: 780, y: 180 },
      'M': { x: 890, y: 180 }
    },
    curvatures: {
      'C-G': 85,
      'F-G': 55,
      'G-I': 80,
      'A-E': -28,
      'B-D': 20,
      'H-K': 24,
      'I-J': -24,
      'K-M': -42,
      'D-H': -22,
      'E-I': -18,
      'F-H': 18,
      'A-B': 30,
      'C-B': -30,
      'D-E': -30,
      'E-F': -30,
      'H-I': 30,
      'J-K': 30
    },
    badgePositions: {
      'A-B': 0.38,
      'A-E': 0.72,
      'B-D': 0.38,
      'B-E': 0.38,
      'C-B': 0.38,
      'C-G': 0.65,
      'D-G': 0.35,
      'D-E': 0.35,
      'E-F': 0.35,
      'E-I': 0.72,
      'F-H': 0.30,
      'F-G': 0.30,
      'E-H': 0.60,
      'H-K': 0.68,
      'I-J': 0.32,
      'I-K': 0.62,
      'K-M': 0.48,
      'G-I': 0.50
    }
  }
};

let currentGraphKey = 'graph1';
let activeGraphData = PRESET_GRAPHS.graph1.data;
let nodePositions = JSON.parse(JSON.stringify(PRESET_GRAPHS.graph1.positions));
let activeCurvatures = PRESET_GRAPHS.graph1.curvatures;
let activeBadgePositions = PRESET_GRAPHS.graph1.badgePositions;
let activeStartNode = 'S';
let activeGoalNode = 'G';

// Auto-layout generator for any arbitrary custom graph
function generateAutoLayout(customGraph, startNode, goalNode) {
  const nodes = Object.keys(customGraph);

  // Check if matches Graph 1 (Assignment: 14 nodes S to M)
  if (nodes.length === 14 && customGraph['S'] && customGraph['M'] && PRESET_GRAPHS.graph1) {
    if (startNode === 'S' && goalNode === 'M') {
      return JSON.parse(JSON.stringify(PRESET_GRAPHS.graph1.positions));
    }
  }

  // Check if matches Graph 2 (Multi-Branch: 8 nodes S to G)
  if (nodes.length === 8 && customGraph['S'] && customGraph['G'] && customGraph['F'] && PRESET_GRAPHS.graph2) {
    if (startNode === 'S' && goalNode === 'G') {
      return JSON.parse(JSON.stringify(PRESET_GRAPHS.graph2.positions));
    }
  }

  // 1. Forward BFS from startNode
  const forwardDist = {};
  if (startNode in customGraph) {
    const queue = [startNode];
    forwardDist[startNode] = 0;
    while (queue.length > 0) {
      const u = queue.shift();
      const d = forwardDist[u];
      for (const [v] of (customGraph[u] || [])) {
        if (forwardDist[v] === undefined) {
          forwardDist[v] = d + 1;
          queue.push(v);
        }
      }
    }
  }

  // 2. Backward BFS from goalNode
  const revGraph = {};
  for (const n of nodes) revGraph[n] = [];
  for (const u of nodes) {
    for (const [v] of (customGraph[u] || [])) {
      if (!revGraph[v]) revGraph[v] = [];
      revGraph[v].push(u);
    }
  }

  const backwardDist = {};
  if (goalNode in revGraph) {
    const queue = [goalNode];
    backwardDist[goalNode] = 0;
    while (queue.length > 0) {
      const u = queue.shift();
      const d = backwardDist[u];
      for (const pred of revGraph[u]) {
        if (backwardDist[pred] === undefined) {
          backwardDist[pred] = d + 1;
          queue.push(pred);
        }
      }
    }
  }

  // 3. Determine base rank for each node
  const ranks = {};
  const fwdVals = Object.values(forwardDist);
  const maxFwd = fwdVals.length > 0 ? Math.max(1, ...fwdVals) : 1;
  const goalRank = forwardDist[goalNode] !== undefined ? forwardDist[goalNode] : maxFwd + 1;

  for (const n of nodes) {
    if (n === startNode) {
      ranks[n] = 0;
    } else if (n === goalNode) {
      ranks[n] = goalRank;
    } else if (forwardDist[n] !== undefined) {
      ranks[n] = forwardDist[n];
    } else if (backwardDist[n] !== undefined) {
      ranks[n] = Math.max(1, goalRank - backwardDist[n]);
    } else {
      ranks[n] = 1;
    }
  }

  // Ensure goalNode is at the max rank
  const allRankVals = Object.values(ranks);
  const highestRank = Math.max(...allRankVals);
  if (ranks[goalNode] !== undefined) {
    ranks[goalNode] = Math.max(ranks[goalNode], highestRank);
  }

  // 4. Group nodes by rank
  const rankGroups = {};
  for (const n of nodes) {
    const r = ranks[n];
    if (!rankGroups[r]) rankGroups[r] = [];
    rankGroups[r].push(n);
  }

  const sortedRanks = Object.keys(rankGroups).map(Number).sort((a, b) => a - b);

  // 5. Partition columns so no column exceeds 3 nodes (avoids any vertical stacking)
  const columns = [];
  const MAX_PER_COL = 3;

  for (const r of sortedRanks) {
    const group = rankGroups[r];
    if (r === 0) {
      // Start node alone in col 0
      columns.push(group);
      continue;
    }
    if (group.includes(goalNode) && group.length > 1) {
      const others = group.filter(n => n !== goalNode);
      for (let i = 0; i < others.length; i += MAX_PER_COL) {
        columns.push(others.slice(i, i + MAX_PER_COL));
      }
      columns.push([goalNode]);
      continue;
    }

    for (let i = 0; i < group.length; i += MAX_PER_COL) {
      columns.push(group.slice(i, i + MAX_PER_COL));
    }
  }

  const totalCols = columns.length;
  const xMin = 90;
  const xMax = 870;
  const xStep = totalCols > 1 ? (xMax - xMin) / (totalCols - 1) : 0;

  const positions = {};
  const yMin = 85;
  const yMax = 275;

  columns.forEach((colNodes, colIdx) => {
    const x = totalCols > 1 ? Math.round(xMin + colIdx * xStep) : 480;
    const count = colNodes.length;
    colNodes.forEach((nodeName, rowIdx) => {
      let y;
      if (count === 1) {
        y = 180;
      } else if (count === 2) {
        y = rowIdx === 0 ? 125 : 235;
      } else {
        y = Math.round(yMin + (rowIdx / (count - 1)) * (yMax - yMin));
      }
      positions[nodeName] = { x, y };
    });
  });

  return positions;
}

// Balanced Python dictionary extractor
function balancedDictExtract(codeStr) {
  const clean = codeStr.replace(/#.*$/gm, '').trim();
  const m = clean.match(/(?:graph|adj|edges|network|tree)\s*=\s*(\{[\s\S]*?\n\})/i);
  if (m) return m[1];

  const dicts = [];
  let i = 0;
  const n = clean.length;
  while (i < n) {
    if (clean[i] === '{') {
      const start = i;
      let depth = 1;
      i++;
      let inStr = null;
      while (i < n && depth > 0) {
        const c = clean[i];
        if (inStr) {
          if (c === '\\') {
            i += 2;
            continue;
          } else if (c === inStr) {
            inStr = null;
          }
        } else {
          if (c === "'" || c === '"') {
            inStr = c;
          } else if (c === '{') {
            depth++;
          } else if (c === '}') {
            depth--;
          }
        }
        i++;
      }
      if (depth === 0) {
        dicts.push(clean.substring(start, i));
      }
      continue;
    }
    i++;
  }

  if (dicts.length === 0) {
    throw new Error('Could not find a valid Python dictionary { ... } in the input.');
  }

  dicts.sort((a, b) => b.length - a.length);
  return dicts[0];
}

// Robust Python dictionary parser
function parsePythonGraph(codeStr) {
  if (!codeStr || !codeStr.trim()) {
    throw new Error('Please enter a Python dictionary.');
  }

  const rawDict = balancedDictExtract(codeStr);
  let s = rawDict;

  // Patterns for edges:
  // ('Node', cost) -> ["Node", cost]
  s = s.replace(/\(\s*(['"][^,'"\)]+['"])\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g, '[$1, $2]');
  // (cost, 'Node') -> ["Node", cost]
  s = s.replace(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(['"][^,'"\)]+['"])\s*\)/g, '[$2, $1]');
  // unquoted (Node, cost) -> ["Node", cost]
  s = s.replace(/\(\s*([a-zA-Z_]\w*)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g, '["$1", $2]');
  // unquoted (cost, Node) -> ["Node", cost]
  s = s.replace(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*([a-zA-Z_]\w*)\s*\)/g, '["$2", $1]');

  s = s.replace(/'/g, '"');
  // Unquoted keys: { S: ... } -> { "S": ... }
  s = s.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":');
  // Trailing commas
  s = s.replace(/,\s*([}\]])/g, '$1');

  let parsed;
  try {
    parsed = JSON.parse(s);
  } catch (err) {
    throw new Error('Python syntax error: Unable to parse dictionary. Please check your commas, braces, and quotes.');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Input must be a Python dictionary: { "Node": [("Neighbor", cost), ...] }');
  }

  const normalized = {};
  for (const node in parsed) {
    const nodeStr = String(node).trim();
    normalized[nodeStr] = [];
    const edges = parsed[node];
    if (edges && typeof edges === 'object' && !Array.isArray(edges)) {
      // Dict of dicts: 'S': {'A': 100, 'B': 50}
      for (const target in edges) {
        const cost = Number(edges[target]);
        if (!isNaN(cost)) {
          normalized[nodeStr].push([String(target).trim(), cost]);
        }
      }
    } else if (Array.isArray(edges)) {
      for (const e of edges) {
        if (Array.isArray(e) && e.length >= 2) {
          if (typeof e[0] === 'number' && typeof e[1] !== 'number') {
            normalized[nodeStr].push([String(e[1]).trim(), Number(e[0])]);
          } else {
            normalized[nodeStr].push([String(e[0]).trim(), Number(e[1])]);
          }
        } else if (e && typeof e === 'object') {
          for (const target in e) {
            normalized[nodeStr].push([String(target).trim(), Number(e[target])]);
          }
        }
      }
    }
  }

  // Ensure any sink node exists in normalized keys
  for (const u in normalized) {
    for (const [v] of normalized[u]) {
      if (!(v in normalized)) {
        normalized[v] = [];
      }
    }
  }

  if (Object.keys(normalized).length === 0) {
    throw new Error('Graph dictionary cannot be empty.');
  }

  return normalized;
}

// Auto-detect Start and Goal nodes with smart fallback
function autoDetectEndpoints(graph, reqStart = '', reqGoal = '') {
  const nodes = Object.keys(graph);
  const lookup = {};
  nodes.forEach(n => { lookup[n.toLowerCase()] = n; });

  const inDeg = {};
  const outDeg = {};
  nodes.forEach(n => {
    inDeg[n] = 0;
    outDeg[n] = (graph[n] || []).length;
  });
  for (const u in graph) {
    for (const [v] of (graph[u] || [])) {
      inDeg[v] = (inDeg[v] || 0) + 1;
    }
  }

  // 1. Start node detection
  let startNode = null;
  const cleanStart = (reqStart || '').trim().toLowerCase();
  if (cleanStart && lookup[cleanStart]) {
    startNode = lookup[cleanStart];
  } else if (lookup['s']) {
    startNode = lookup['s'];
  } else {
    const candidates = nodes.filter(n => inDeg[n] === 0);
    startNode = candidates.length > 0 ? candidates[0] : nodes[0];
  }

  // 2. Goal node detection
  let goalNode = null;
  const cleanGoal = (reqGoal || '').trim().toLowerCase();

  // Special check: If graph is Graph 1 (has M with out_degree 0) and req_goal is 'G'
  if (lookup['m'] && outDeg[lookup['m']] === 0 && lookup['g'] && outDeg[lookup['g']] > 0 && cleanGoal === 'g') {
    goalNode = lookup['m'];
  } else if (cleanGoal && lookup[cleanGoal]) {
    goalNode = lookup[cleanGoal];
  } else if (lookup['g']) {
    goalNode = lookup['g'];
  } else if (lookup['m']) {
    goalNode = lookup['m'];
  } else {
    const candidates = nodes.filter(n => outDeg[n] === 0 && n !== startNode);
    goalNode = candidates.length > 0 ? candidates[0] : nodes[nodes.length - 1];
  }

  return [startNode, goalNode];
}

// Helper: Reconstruct path from start to node u using parent dict
function tracePath(parentMap, node) {
  if (!node) return [];
  const path = [];
  let curr = node;
  while (curr !== null && curr !== undefined) {
    path.push(curr);
    curr = parentMap[curr];
  }
  path.reverse();
  return path;
}

// 2. Pre-generate all execution steps matching ucs.py
function generateUCSSteps(startNode, goalNode) {
  const steps = [];
  const cloneFrontier = (f) => f.map(item => ({ cost: item[0], node: item[1] }));
  const cloneSet = (s) => Array.from(s);
  const cloneObj = (o) => ({ ...o });

  let FRONTIER = [[0, startNode]];
  let EXPLORED = new Set();
  let COST = { [startNode]: 0 };
  let PARENT = { [startNode]: null };

  // Step 0: Ready State - Standing on algorithm definition (Line 1) with NO animation
  steps.push({
    type: 'READY',
    codeLine: 1,
    codeLineSequence: [1],
    lineDisplay: 'Line 1',
    actionTitle: 'READY',
    codeSnippet: 'def uniform_cost_search(s, goal):',
    evalText: `s = '${startNode}', goal = '${goalNode}'`,
    traceExplanation: `Algorithm ready. Standing at uniform_cost_search() function definition. Press Play or Next to start search.`,
    u: null,
    cost: null,
    activeEdge: null,
    currentPath: [],
    currentPathCost: 0,
    FRONTIER: [],
    EXPLORED: [],
    COST: { [startNode]: 0 },
    PARENT: {},
    finalPath: null,
    message: `Ready: Standing on uniform_cost_search('${startNode}', '${goalNode}'). Press Play or Next to begin.`
  });

  // Step 1: Init - Executed only when user starts (Play / Next)
  steps.push({
    type: 'INIT',
    codeLine: 2,
    codeLineSequence: [2, 3, 4, 5],
    lineDisplay: 'Lines 2-5',
    actionTitle: 'INITIALIZE',
    codeSnippet: 'FRONTIER = [(0, s)]; EXPLORED = set(); COST = {s: 0}; PARENT = {s: None}',
    evalText: `s = '${startNode}', goal = '${goalNode}', COST['${startNode}'] = 0`,
    traceExplanation: `Initialized priority queue FRONTIER with start node '${startNode}' at cost 0. Created empty EXPLORED set, COST, and PARENT dictionaries.`,
    u: null,
    cost: null,
    activeEdge: null,
    currentPath: [startNode],
    currentPathCost: 0,
    FRONTIER: cloneFrontier(FRONTIER),
    EXPLORED: cloneSet(EXPLORED),
    COST: cloneObj(COST),
    PARENT: cloneObj(PARENT),
    finalPath: null,
    message: `Initialized: Added start node '${startNode}' with cost 0 into FRONTIER.`
  });

  while (FRONTIER.length > 0) {
    FRONTIER.sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1]));
    const [current_cost, u] = FRONTIER.shift();

    const pathSoFar = tracePath(PARENT, u);

    // ExtractMin
    steps.push({
      type: 'EXTRACT_MIN',
      codeLine: 7,
      codeLineSequence: [6, 7],
      lineDisplay: 'Line 7',
      actionTitle: 'EXTRACT MIN',
      codeSnippet: 'current_cost, u = ExtractMin(FRONTIER)',
      evalText: `u = '${u}', current_cost = ${current_cost}, remaining_in_queue = ${FRONTIER.length}`,
      traceExplanation: `Sorted FRONTIER priority queue and extracted the node with the lowest cost: '${u}' (cost = ${current_cost}).`,
      u: u,
      cost: current_cost,
      activeEdge: null,
      currentPath: pathSoFar,
      currentPathCost: current_cost,
      FRONTIER: cloneFrontier(FRONTIER),
      EXPLORED: cloneSet(EXPLORED),
      COST: cloneObj(COST),
      PARENT: cloneObj(PARENT),
      finalPath: null,
      message: `ExtractMin: Popped node '${u}' with cost ${current_cost}. Current path: ${pathSoFar.join(' ➔ ')}.`
    });

    if (u === goalNode) {
      steps.push({
        type: 'GOAL_REACHED',
        codeLine: 9,
        codeLineSequence: [8, 9],
        lineDisplay: 'Line 9',
        actionTitle: 'RETURN PATH',
        codeSnippet: 'return BuildPath(PARENT, u), COST[u]',
        evalText: `u == goal ('${goalNode}'), total_cost = ${COST[u]}`,
        traceExplanation: `Goal node '${goalNode}' reached! Reconstructing optimal path by traversing PARENT pointers backwards from '${u}' to '${startNode}'. Total cost is ${COST[u]}.`,
        u: u,
        cost: current_cost,
        activeEdge: null,
        currentPath: pathSoFar,
        currentPathCost: current_cost,
        FRONTIER: cloneFrontier(FRONTIER),
        EXPLORED: cloneSet(EXPLORED),
        COST: cloneObj(COST),
        PARENT: cloneObj(PARENT),
        finalPath: pathSoFar,
        totalCost: COST[u],
        message: `Goal reached! Optimal path found: ${pathSoFar.join(' ➔ ')} (Total Cost: ${COST[u]}).`
      });
      break;
    }

    EXPLORED.add(u);
    steps.push({
      type: 'EXPLORED_ADD',
      codeLine: 10,
      codeLineSequence: [10],
      lineDisplay: 'Line 10',
      actionTitle: 'ADD EXPLORED',
      codeSnippet: 'EXPLORED.add(u)',
      evalText: `u = '${u}', len(EXPLORED) = ${EXPLORED.size}`,
      traceExplanation: `Node '${u}' added to EXPLORED set. It is now closed and its neighbors will be explored.`,
      u: u,
      cost: current_cost,
      activeEdge: null,
      currentPath: pathSoFar,
      currentPathCost: current_cost,
      FRONTIER: cloneFrontier(FRONTIER),
      EXPLORED: cloneSet(EXPLORED),
      COST: cloneObj(COST),
      PARENT: cloneObj(PARENT),
      finalPath: null,
      message: `Added node '${u}' to EXPLORED.`
    });

    const neighbors = activeGraphData[u] || [];
    for (const [v, edge_cost] of neighbors) {
      if (EXPLORED.has(v)) {
        steps.push({
          type: 'SKIP_EXPLORED',
          codeLine: 13,
          codeLineSequence: [11, 12, 13],
          lineDisplay: 'Line 13',
          actionTitle: 'SKIP VISITED',
          codeSnippet: 'if v in EXPLORED: continue',
          evalText: `v = '${v}', '${v}' in EXPLORED is True`,
          traceExplanation: `Neighbor '${v}' of '${u}' is already in the EXPLORED set. The continue statement skips evaluating this edge.`,
          u: u,
          cost: current_cost,
          activeEdge: { from: u, to: v, cost: edge_cost },
          currentPath: pathSoFar,
          currentPathCost: current_cost,
          FRONTIER: cloneFrontier(FRONTIER),
          EXPLORED: cloneSet(EXPLORED),
          COST: cloneObj(COST),
          PARENT: cloneObj(PARENT),
          finalPath: null,
          message: `Checking edge (${u} ➔ ${v}, cost ${edge_cost}): Node '${v}' is already in EXPLORED (skipped).`
        });
        continue;
      }

      const new_cost = COST[u] + edge_cost;

      if (!(v in COST) || new_cost < COST[v]) {
        const oldCost = COST[v];
        COST[v] = new_cost;
        PARENT[v] = u;

        let found = false;
        for (let i = 0; i < FRONTIER.length; i++) {
          if (FRONTIER[i][1] === v) {
            FRONTIER[i] = [new_cost, v];
            found = true;
            break;
          }
        }
        if (!found) {
          FRONTIER.push([new_cost, v]);
        }

        const neighborPath = tracePath(PARENT, v);

        steps.push({
          type: 'UPDATE_FRONTIER',
          codeLine: 18,
          codeLineSequence: [14, 15, 16, 17, 18],
          lineDisplay: 'Lines 15-18',
          actionTitle: 'RELAX EDGE',
          codeSnippet: 'COST[v] = new_cost; PARENT[v] = u; UpdatePriorityQueue(FRONTIER, v, new_cost)',
          evalText: `v = '${v}', new_cost = ${COST[u]} + ${edge_cost} = ${new_cost}${oldCost !== undefined ? ` (cheaper than ${oldCost})` : ''}`,
          traceExplanation: `Found shorter path to '${v}'! Executed COST['${v}'] = ${new_cost} (Line 16) and PARENT['${v}'] = '${u}' (Line 17), then updated FRONTIER priority queue (Line 18).`,
          u: u,
          cost: current_cost,
          activeEdge: { from: u, to: v, cost: edge_cost },
          currentPath: neighborPath,
          currentPathCost: new_cost,
          FRONTIER: cloneFrontier(FRONTIER),
          EXPLORED: cloneSet(EXPLORED),
          COST: cloneObj(COST),
          PARENT: cloneObj(PARENT),
          updatedNode: v,
          finalPath: null,
          message: `Neighbor '${v}': New cost = ${COST[u]} + ${edge_cost} = ${new_cost}${oldCost !== undefined ? ` (cheaper than ${oldCost})` : ''}. Added to FRONTIER.`
        });
      } else {
        steps.push({
          type: 'NOT_CHEAPER',
          codeLine: 15,
          codeLineSequence: [14, 15],
          lineDisplay: 'Line 15',
          actionTitle: 'CHECK COST',
          codeSnippet: 'if v not in COST or new_cost < COST[v]:  # False',
          evalText: `v = '${v}', new_cost = ${new_cost} >= current_cost = ${COST[v]}`,
          traceExplanation: `Path to '${v}' through '${u}' has cost ${new_cost}, which is not cheaper than recorded cost ${COST[v]}. No update made.`,
          u: u,
          cost: current_cost,
          activeEdge: { from: u, to: v, cost: edge_cost },
          currentPath: pathSoFar,
          currentPathCost: current_cost,
          FRONTIER: cloneFrontier(FRONTIER),
          EXPLORED: cloneSet(EXPLORED),
          COST: cloneObj(COST),
          PARENT: cloneObj(PARENT),
          finalPath: null,
          message: `Neighbor '${v}': New cost (${new_cost}) >= current cost (${COST[v]}). No update.`
        });
      }
    }
  }

  // Handle unreachable goal
  if (steps[steps.length - 1].type !== 'GOAL_REACHED') {
    steps.push({
      type: 'UNREACHABLE',
      codeLine: 19,
      codeLineSequence: [19],
      lineDisplay: 'Line 19',
      actionTitle: 'UNREACHABLE',
      codeSnippet: 'return [], float("inf")',
      evalText: `Goal '${goalNode}' was never reached. FRONTIER is empty.`,
      traceExplanation: `Priority queue FRONTIER exhausted. No valid path exists from start node '${startNode}' to goal node '${goalNode}'.`,
      u: null,
      cost: null,
      activeEdge: null,
      currentPath: [],
      currentPathCost: 0,
      FRONTIER: [],
      EXPLORED: cloneSet(EXPLORED),
      COST: cloneObj(COST),
      PARENT: cloneObj(PARENT),
      finalPath: null,
      message: `Search finished: Goal '${goalNode}' is unreachable from '${startNode}'.`
    });
  }

  return steps;
}

let steps = generateUCSSteps(activeStartNode, activeGoalNode);
let currentStepIndex = 0;
let isPlaying = false;
let playInterval = null;
let stepDuration = 900; // ms
let isSoundEnabled = true;

// 3. Audio Synthesizer (Pure Web Audio API)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSoundTone(freq, type = 'sine', duration = 0.12, gainLevel = 0.1) {
  if (!isSoundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // safe fallback
  }
}

function playStepSound(type) {
  if (type === 'EXTRACT_MIN') {
    playSoundTone(520, 'triangle', 0.14, 0.15);
  } else if (type === 'UPDATE_FRONTIER') {
    playSoundTone(680, 'sine', 0.1, 0.1);
  } else if (type === 'EXPLORED_ADD') {
    playSoundTone(400, 'sine', 0.12, 0.1);
  } else if (type === 'GOAL_REACHED') {
    setTimeout(() => playSoundTone(523.25, 'triangle', 0.25, 0.2), 0);
    setTimeout(() => playSoundTone(659.25, 'triangle', 0.25, 0.2), 110);
    setTimeout(() => playSoundTone(783.99, 'triangle', 0.25, 0.2), 220);
    setTimeout(() => playSoundTone(1046.50, 'triangle', 0.45, 0.25), 330);
  }
}

// 4. SVG Graph Construction
const svg = document.getElementById('graph-svg');
const edgesLayer = document.getElementById('edges-layer');
const nodesLayer = document.getElementById('nodes-layer');

function getEdgeGeometry(fromNode, toNode) {
  const p1 = nodePositions[fromNode];
  const p2 = nodePositions[toNode];
  if (!p1 || !p2) return { d: '', midX: 0, midY: 0 };

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  let curvature = 0;
  const edgeKey = `${fromNode}-${toNode}`;
  if (activeCurvatures && activeCurvatures[edgeKey] !== undefined) {
    curvature = activeCurvatures[edgeKey];
  } else if (Math.abs(dx) < 25) {
    curvature = dy > 0 ? 35 : -35;
  } else if (dx < -30) {
    // Backward edge
    curvature = -45;
  } else if (dist > 450) {
    curvature = dy >= 0 ? 55 : -55;
  }

  // Bezier control point M
  let mx, my;
  if (curvature === 0) {
    mx = (p1.x + p2.x) / 2;
    my = (p1.y + p2.y) / 2;
  } else {
    mx = (p1.x + p2.x) / 2 + (dy / dist) * curvature;
    my = (p1.y + p2.y) / 2 - (dx / dist) * curvature;
  }

  // Node radius is 17px. Trim endpoints so arrowheads dock cleanly on perimeter without piercing circle
  const R = 18.5;
  const ux = mx - p1.x;
  const uy = my - p1.y;
  const ulen = Math.sqrt(ux * ux + uy * uy) || 1;
  const startX = p1.x + (ux / ulen) * R;
  const startY = p1.y + (uy / ulen) * R;

  const vx = p2.x - mx;
  const vy = p2.y - my;
  const vlen = Math.sqrt(vx * vx + vy * vy) || 1;
  const endX = p2.x - (vx / vlen) * (R + 4);
  const endY = p2.y - (vy / vlen) * (R + 4);

  // Exact curve point at parameter t for placing weight badge (staggered to avoid crossings)
  let t = 0.5;
  if (activeBadgePositions && activeBadgePositions[edgeKey] !== undefined) {
    t = activeBadgePositions[edgeKey];
  }
  const midX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * mx + t * t * endX;
  const midY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * my + t * t * endY;

  return {
    d: `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
    midX: Math.round(midX),
    midY: Math.round(midY)
  };
}

function renderInitialGraph() {
  edgesLayer.innerHTML = '';
  nodesLayer.innerHTML = '';

  // Edges
  for (const u in activeGraphData) {
    for (const [v, edge_cost] of (activeGraphData[u] || [])) {
      const geom = getEdgeGeometry(u, v);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('id', `edge-${u}-${v}`);
      path.setAttribute('class', 'edge-line');
      path.setAttribute('d', geom.d);
      path.setAttribute('marker-end', 'url(#arrow-default)');
      edgesLayer.appendChild(path);

      // Weight badge with dynamic width based on digits
      const costStr = String(edge_cost);
      const badgeW = costStr.length >= 3 ? 32 : 26;
      const badgeH = 16;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `weight-${u}-${v}`);
      g.setAttribute('class', 'edge-weight-group');
      g.setAttribute('transform', `translate(${geom.midX}, ${geom.midY})`);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('class', 'weight-rect');
      rect.setAttribute('x', String(-badgeW / 2));
      rect.setAttribute('y', String(-badgeH / 2));
      rect.setAttribute('width', String(badgeW));
      rect.setAttribute('height', String(badgeH));

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'weight-text');
      text.textContent = edge_cost;

      g.appendChild(rect);
      g.appendChild(text);
      edgesLayer.appendChild(g);
    }
  }

  // Nodes
  for (const nodeName in nodePositions) {
    const pos = nodePositions[nodeName];
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', `node-group-${nodeName}`);
    g.setAttribute('class', `graph-node ${nodeName === activeStartNode ? 'start' : ''} ${nodeName === activeGoalNode ? 'goal' : ''}`);
    g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'node-base-circle');
    circle.setAttribute('r', '17');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('class', 'node-label-text');
    label.setAttribute('y', '-2');
    label.textContent = nodeName;

    const costSub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    costSub.setAttribute('id', `node-cost-${nodeName}`);
    costSub.setAttribute('class', 'node-cost-sub');
    costSub.setAttribute('y', '24');
    costSub.textContent = nodeName === activeStartNode ? '0' : '∞';

    g.appendChild(circle);
    g.appendChild(label);
    g.appendChild(costSub);

    nodesLayer.appendChild(g);
  }
}

function updateEdgePositions() {
  for (const u in activeGraphData) {
    for (const [v, edge_cost] of (activeGraphData[u] || [])) {
      const path = document.getElementById(`edge-${u}-${v}`);
      const g = document.getElementById(`weight-${u}-${v}`);
      if (path && g) {
        const geom = getEdgeGeometry(u, v);
        path.setAttribute('d', geom.d);
        g.setAttribute('transform', `translate(${geom.midX}, ${geom.midY})`);
      }
    }
  }
}

// 5. DOM Elements & Update Logic
const stepNumber = document.getElementById('step-number');
const stepMessage = document.getElementById('step-message');
const currentNodeVal = document.getElementById('current-node-val');
const timelineSlider = document.getElementById('timeline-slider');

const currentCapsuleSlot = document.getElementById('current-capsule-slot');
const frontierItems = document.getElementById('frontier-items');
const exploredItems = document.getElementById('explored-items');
const frontierCount = document.getElementById('frontier-count');
const exploredCount = document.getElementById('explored-count');

const costTable = document.getElementById('cost-table');
const parentTable = document.getElementById('parent-table');
const stepPathSequence = document.getElementById('step-path-sequence');
const activePathCost = document.getElementById('active-path-cost');

const finalResultBanner = document.getElementById('final-result-banner');
const resultPathNodes = document.getElementById('result-path-nodes');
const resultCostVal = document.getElementById('result-cost-val');
const resultNodesCount = document.getElementById('result-nodes-count');

// Trace Inspector Elements
const traceLinePill = document.getElementById('trace-line-pill');
const traceActionPill = document.getElementById('trace-action-pill');
const traceCodeSnippet = document.getElementById('trace-code-snippet');
const traceEvalValues = document.getElementById('trace-eval-values');
const traceExplanationText = document.getElementById('trace-explanation-text');
const liveLineIndicator = document.getElementById('live-line-indicator');

let lineAnimTimeouts = [];

function highlightPythonLine(sequence, primaryLine, finalDisplay) {
  // Clear any pending animations
  lineAnimTimeouts.forEach(t => clearTimeout(t));
  lineAnimTimeouts = [];

  document.querySelectorAll('.code-line').forEach(el => {
    el.classList.remove('active-line', 'active-block');
  });

  const lines = Array.isArray(sequence) ? sequence : [sequence || primaryLine];
  if (!lines || lines.length === 0) return;

  if (lines.length === 1) {
    const el = document.getElementById(`code-l${lines[0]}`);
    if (el) el.classList.add('active-line');
    if (liveLineIndicator) liveLineIndicator.textContent = `Executing: Line ${lines[0]}`;
    return;
  }

  // Smooth micro-cascade animation across lines in the step
  const delay = Math.max(65, Math.min(150, Math.floor(stepDuration / (lines.length + 1))));

  lines.forEach((lineNum, idx) => {
    const timeout = setTimeout(() => {
      lines.forEach((l, i) => {
        const item = document.getElementById(`code-l${l}`);
        if (!item) return;
        if (i < idx) {
          item.classList.remove('active-line');
          item.classList.add('active-block');
        } else if (i === idx) {
          item.classList.remove('active-block');
          item.classList.add('active-line');
        } else {
          item.classList.remove('active-line', 'active-block');
        }
      });

      if (liveLineIndicator) {
        liveLineIndicator.textContent = `Executing: Line ${lineNum}`;
      }

      // When the last line is reached, display the full step summary
      if (idx === lines.length - 1) {
        if (liveLineIndicator && finalDisplay) {
          liveLineIndicator.textContent = `Executing: ${finalDisplay}`;
        }
      }
    }, idx * delay);

    lineAnimTimeouts.push(timeout);
  });
}

function createSimpleCapsule(node, cost, extraClass = '') {
  const div = document.createElement('div');
  div.className = `capsule ${extraClass}`;
  div.innerHTML = `
    <span class="cap-left">${node}</span>
    <span class="cap-right">${cost}</span>
  `;
  return div;
}

function renderStep(index) {
  if (index < 0 || index >= steps.length) return;
  currentStepIndex = index;
  const s = steps[index];

  // Play Sound
  playStepSound(s.type);

  // 1. Counter & Message
  stepNumber.textContent = `Step ${index + 1} / ${steps.length}`;
  stepMessage.textContent = s.message;
  timelineSlider.value = index;

  // 1.1 Live Python Execution Trace Inspector Update with Smooth Line Cascade
  const displayLine = s.lineDisplay || `Line ${s.codeLine}`;
  if (s.codeLineSequence || s.codeLine) {
    highlightPythonLine(s.codeLineSequence, s.codeLine, displayLine);
  }
  if (traceLinePill) traceLinePill.textContent = displayLine;
  if (traceActionPill) traceActionPill.textContent = s.actionTitle || s.type;
  if (traceCodeSnippet) traceCodeSnippet.innerHTML = formatSnippetWithFnButtons(s.codeSnippet || '');
  if (traceEvalValues) traceEvalValues.textContent = s.evalText || '—';
  if (traceExplanationText) traceExplanationText.textContent = s.traceExplanation || s.message;

  // 2. Current Node Badge
  if (s.u) {
    currentNodeVal.textContent = `${s.u} (${s.cost !== null ? s.cost : s.COST[s.u]})`;
  } else {
    currentNodeVal.textContent = '—';
  }

  // 3. Current Extracted Node Slot
  currentCapsuleSlot.innerHTML = '';
  if (s.u) {
    currentCapsuleSlot.appendChild(createSimpleCapsule(s.u, s.cost, 'min-candidate'));
  } else {
    currentCapsuleSlot.innerHTML = '<span class="empty-text">None</span>';
  }

  // 4. FRONTIER Cup (Priority Queue visualization with ranked slots)
  frontierCount.textContent = s.FRONTIER.length;
  frontierItems.innerHTML = '';
  if (s.FRONTIER.length === 0) {
    frontierItems.innerHTML = '<span class="empty-text">Queue Empty</span>';
  } else {
    s.FRONTIER.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `pq-item-row ${idx === 0 ? 'top-priority-row' : ''}`;

      const rankBadge = document.createElement('span');
      rankBadge.className = `pq-rank-badge ${idx === 0 ? 'rank-min' : ''}`;
      rankBadge.textContent = idx === 0 ? '#1 Min' : `#${idx + 1}`;
      if (idx === 0) rankBadge.title = 'Queue Head (Minimum Cost) - Next to Extract';

      const cap = createSimpleCapsule(item.node, item.cost, idx === 0 ? 'min-candidate' : '');

      row.appendChild(rankBadge);
      row.appendChild(cap);
      frontierItems.appendChild(row);
    });
    frontierItems.scrollTop = 0;
  }

  // 5. EXPLORED as a Set Vault (Unique Visited Collection)
  exploredCount.textContent = s.EXPLORED.length;
  exploredItems.innerHTML = '';
  if (s.EXPLORED.length === 0) {
    exploredItems.innerHTML = '<span class="empty-text">Set Empty</span>';
  } else {
    s.EXPLORED.forEach((node, idx) => {
      const c = s.COST[node] !== undefined ? s.COST[node] : '—';
      const isLatest = idx === s.EXPLORED.length - 1;
      const cap = createSimpleCapsule(node, c, `explored-cap ${isLatest ? 'latest-explored' : ''}`);
      exploredItems.appendChild(cap);
    });
    // Auto-scroll so the newest explored node is always in view
    setTimeout(() => {
      exploredItems.scrollTop = exploredItems.scrollHeight;
    }, 10);
  }

  // 6. Step-by-Step Path So Far Display
  stepPathSequence.innerHTML = '';
  const currentPathList = s.finalPath || s.currentPath || [];
  if (currentPathList.length === 0) {
    stepPathSequence.innerHTML = '<span class="empty-text">None</span>';
  } else {
    currentPathList.forEach((node, i) => {
      const nodeSpan = document.createElement('span');
      nodeSpan.className = 'node-step-tag';
      nodeSpan.textContent = node;
      stepPathSequence.appendChild(nodeSpan);

      if (i < currentPathList.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'path-arrow';
        arrow.textContent = '➔';
        stepPathSequence.appendChild(arrow);
      }
    });
  }
  activePathCost.textContent = s.totalCost !== undefined ? s.totalCost : (s.currentPathCost || 0);

  // 7. Graph Nodes Highlighting (STATIC: color change only, NO scaling or movement)
  for (const n in nodePositions) {
    const grp = document.getElementById(`node-group-${n}`);
    const costSub = document.getElementById(`node-cost-${n}`);
    if (!grp) continue;

    grp.classList.remove('current-node', 'in-frontier', 'explored', 'in-path');
    costSub.textContent = n in s.COST ? s.COST[n] : '∞';

    if (s.finalPath && s.finalPath.includes(n)) {
      grp.classList.add('in-path');
    } else if (s.u === n) {
      // Current node turns Jake-yellow statically in its exact place
      grp.classList.add('current-node');
    } else if (s.EXPLORED.includes(n)) {
      grp.classList.add('explored');
    } else if (s.FRONTIER.some(f => f.node === n)) {
      grp.classList.add('in-frontier');
    }
  }

  // 8. Graph Edges Highlighting (Step-by-step active path or final path)
  const highlightedEdges = new Set();
  const pathToTrace = s.finalPath || s.currentPath;
  if (pathToTrace && pathToTrace.length > 1) {
    for (let i = 0; i < pathToTrace.length - 1; i++) {
      highlightedEdges.add(`${pathToTrace[i]}-${pathToTrace[i + 1]}`);
    }
  }

  for (const u in activeGraphData) {
    for (const [v, edge_cost] of (activeGraphData[u] || [])) {
      const p = document.getElementById(`edge-${u}-${v}`);
      const w = document.getElementById(`weight-${u}-${v}`);
      if (!p || !w) continue;

      p.classList.remove('active', 'in-path');
      w.classList.remove('active', 'in-path');
      p.setAttribute('marker-end', 'url(#arrow-default)');

      const edgeKey = `${u}-${v}`;
      if (s.finalPath && highlightedEdges.has(edgeKey)) {
        p.classList.add('in-path');
        w.classList.add('in-path');
        p.setAttribute('marker-end', 'url(#arrow-path)');
      } else if (!s.finalPath && highlightedEdges.has(edgeKey)) {
        p.classList.add('active');
        w.classList.add('active');
        p.setAttribute('marker-end', 'url(#arrow-active)');
      } else if (s.activeEdge && s.activeEdge.from === u && s.activeEdge.to === v) {
        p.classList.add('active');
        w.classList.add('active');
        p.setAttribute('marker-end', 'url(#arrow-active)');
      }
    }
  }

  // 9. COST & PARENT dictionaries
  costTable.innerHTML = '';
  for (const k in s.COST) {
    const chip = document.createElement('span');
    chip.className = `dict-chip ${k === s.updatedNode ? 'updated' : ''}`;
    chip.textContent = `${k}:${s.COST[k]}`;
    costTable.appendChild(chip);
  }

  parentTable.innerHTML = '';
  for (const k in s.PARENT) {
    const chip = document.createElement('span');
    chip.className = `dict-chip ${k === s.updatedNode ? 'updated' : ''}`;
    chip.textContent = `${k}➔${s.PARENT[k] === null ? 'None' : s.PARENT[k]}`;
    parentTable.appendChild(chip);
  }

  // 10. Goal Reached Celebration
  if (s.type === 'GOAL_REACHED') {
    finalResultBanner.classList.remove('hidden');
    resultCostVal.textContent = s.totalCost;
    resultNodesCount.textContent = s.finalPath.length;

    resultPathNodes.innerHTML = '';
    s.finalPath.forEach((node, idx) => {
      const tag = document.createElement('span');
      tag.className = 'celeb-node-tag';
      tag.textContent = node;
      resultPathNodes.appendChild(tag);

      if (idx < s.finalPath.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'celeb-arrow-sep';
        arrow.textContent = '➔';
        resultPathNodes.appendChild(arrow);
      }
    });

    pause();
  } else {
    finalResultBanner.classList.add('hidden');
  }
}

// 6. Controls
const btnPlay = document.getElementById('btn-play');
const playText = document.getElementById('play-text');
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const btnReset = document.getElementById('btn-reset');
const speedRange = document.getElementById('speed-range');
const speedLabel = document.getElementById('speed-label');
const btnSound = document.getElementById('btn-sound');
const soundLabel = document.getElementById('sound-label');
const startModal = document.getElementById('start-modal');
const btnModalStart = document.getElementById('btn-modal-start');

function next() {
  if (currentStepIndex < steps.length - 1) {
    renderStep(currentStepIndex + 1);
  } else {
    pause();
  }
}

function prev() {
  if (currentStepIndex > 0) {
    renderStep(currentStepIndex - 1);
  }
}

function reset() {
  pause();
  renderStep(0);
}

function play() {
  if (currentStepIndex >= steps.length - 1) {
    renderStep(0);
  }
  isPlaying = true;
  playText.textContent = 'Pause';
  btnPlay.classList.add('playing');

  if (playInterval) clearInterval(playInterval);
  playInterval = setInterval(() => {
    if (currentStepIndex < steps.length - 1) {
      next();
    } else {
      pause();
    }
  }, stepDuration);
}

function pause() {
  isPlaying = false;
  playText.textContent = 'Play';
  btnPlay.classList.remove('playing');

  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
}

function togglePlay() {
  if (isPlaying) pause();
  else play();
}

btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', () => { pause(); next(); });
btnPrev.addEventListener('click', () => { pause(); prev(); });
btnReset.addEventListener('click', reset);

speedRange.addEventListener('input', (e) => {
  stepDuration = parseInt(e.target.value, 10);
  speedLabel.textContent = `${(stepDuration / 1000).toFixed(1)}s`;
  if (isPlaying) {
    pause();
    play();
  }
});

timelineSlider.max = steps.length - 1;
timelineSlider.addEventListener('input', (e) => {
  pause();
  renderStep(parseInt(e.target.value, 10));
});

btnSound.addEventListener('click', () => {
  isSoundEnabled = !isSoundEnabled;
  soundLabel.textContent = isSoundEnabled ? 'Sound: ON' : 'Sound: OFF';
  if (isSoundEnabled) {
    playSoundTone(440, 'triangle', 0.1, 0.1);
  }
});

btnModalStart.addEventListener('click', () => {
  startModal.classList.add('hidden');
  getAudioContext();
  playSoundTone(440, 'triangle', 0.15, 0.1);
});

// Graph Switcher & Customizer Logic
function loadGraph(graphMode, customConfig = null) {
  pause();

  let targetData;
  let targetPositions;
  let targetCurvatures = {};
  let targetBadgePositions = {};
  let targetStart;
  let targetGoal;
  let labelName;

  if (graphMode === 'custom') {
    targetData = customConfig.data;
    targetStart = customConfig.startNode;
    targetGoal = customConfig.goalNode;
    targetPositions = generateAutoLayout(targetData, targetStart, targetGoal);
    targetBadgePositions = {};

    // Auto-calculate smart curvatures for custom graphs
    targetCurvatures = {};
    for (const u in targetData) {
      const p1 = targetPositions[u];
      if (!p1) continue;
      for (const [v] of (targetData[u] || [])) {
        const p2 = targetPositions[v];
        if (!p2) continue;
        const edgeKey = `${u}-${v}`;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        if (Math.abs(dx) < 35) {
          // In same vertical column
          targetCurvatures[edgeKey] = dy > 0 ? 35 : -35;
        } else if (dx < -30) {
          // Backward edge
          targetCurvatures[edgeKey] = -45;
        } else if (Math.abs(dx) > 380) {
          // Long range jump
          targetCurvatures[edgeKey] = dy >= 0 ? 35 : -35;
        }
      }
    }

    labelName = `Custom (${targetStart} ➔ ${targetGoal})`;
    currentGraphKey = 'custom';
  } else {
    const preset = PRESET_GRAPHS[graphMode];
    if (!preset) return;
    targetData = preset.data;
    targetPositions = preset.positions;
    targetCurvatures = preset.curvatures;
    targetBadgePositions = preset.badgePositions || {};
    targetStart = preset.startNode;
    targetGoal = preset.goalNode;
    labelName = preset.name;
    currentGraphKey = graphMode;
  }

  // Update active state
  activeGraphData = targetData;
  nodePositions = JSON.parse(JSON.stringify(targetPositions));
  activeCurvatures = targetCurvatures;
  activeBadgePositions = targetBadgePositions;
  activeStartNode = targetStart;
  activeGoalNode = targetGoal;

  // Re-generate execution steps
  steps = generateUCSSteps(activeStartNode, activeGoalNode);

  // Update slider
  timelineSlider.max = steps.length - 1;
  timelineSlider.value = 0;

  // Update Header and Canvas titles
  const activeBadge = document.getElementById('active-graph-badge');
  if (activeBadge) activeBadge.textContent = labelName;
  const headerTitle = document.getElementById('header-graph-title');
  if (headerTitle) headerTitle.textContent = labelName;
  const canvasTitle = document.getElementById('canvas-graph-title');
  if (canvasTitle) canvasTitle.textContent = `Uniform Cost Search — ${labelName}`;

  // Update canvas legend dynamic badges
  const legStart = document.querySelector('.leg-start');
  if (legStart) legStart.textContent = `${activeStartNode}: Start`;
  const legGoal = document.querySelector('.leg-goal');
  if (legGoal) legGoal.textContent = `${activeGoalNode}: Goal`;

  // Update active card styling in modal
  document.querySelectorAll('.graph-select-card').forEach(c => c.classList.remove('active-card'));
  const activeCard = document.getElementById(`card-mode-${graphMode}`);
  if (activeCard) activeCard.classList.add('active-card');

  // Hide celebration banner
  if (finalResultBanner) finalResultBanner.classList.add('hidden');

  // Re-render Graph SVG
  renderInitialGraph();

  // Reset to Step 0 (Ready state on Line 1)
  renderStep(0);

  // Close modal
  startModal.classList.add('hidden');
}

// Modal & Selector Elements
const btnOpenGraphSelector = document.getElementById('btn-open-graph-selector');
const btnModalClose = document.getElementById('btn-modal-close');
const btnLoadGraph1 = document.getElementById('btn-load-graph1');
const btnLoadGraph2 = document.getElementById('btn-load-graph2');
const btnToggleCustom = document.getElementById('btn-toggle-custom');
const customGraphDrawer = document.getElementById('custom-graph-drawer');
const btnApplyCustomGraph = document.getElementById('btn-apply-custom-graph');
const btnTplG1 = document.getElementById('btn-tpl-g1');
const btnTplG2 = document.getElementById('btn-tpl-g2');
const customGraphCode = document.getElementById('custom-graph-code');
const customStartNode = document.getElementById('custom-start-node');
const customGoalNode = document.getElementById('custom-goal-node');
const customGraphError = document.getElementById('custom-graph-error');

if (btnOpenGraphSelector) {
  btnOpenGraphSelector.addEventListener('click', () => {
    pause();
    startModal.classList.remove('hidden');
  });
}

if (btnModalClose) {
  btnModalClose.addEventListener('click', () => {
    startModal.classList.add('hidden');
  });
}

if (btnLoadGraph1) {
  btnLoadGraph1.addEventListener('click', () => {
    loadGraph('graph1');
  });
}

if (btnLoadGraph2) {
  btnLoadGraph2.addEventListener('click', () => {
    loadGraph('graph2');
  });
}

if (btnToggleCustom && customGraphDrawer) {
  btnToggleCustom.addEventListener('click', () => {
    customGraphDrawer.classList.toggle('hidden');
    if (!customGraphDrawer.classList.contains('hidden')) {
      customGraphDrawer.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

const G1_TEMPLATE = `graph = {
    'S': [('A', 40), ('B', 70)],
    'A': [('C', 60), ('D', 100)],
    'B': [('D', 30), ('E', 80)],
    'C': [('F', 40)],
    'D': [('E', 20), ('G', 90)],
    'E': [('G', 60)],
    'F': [('G', 30)],
    'G': []
}`;

const G2_TEMPLATE = `graph = {
    'S': [('A', 100), ('B', 50), ('C', 200)],
    'A': [('B', 80), ('D', 150), ('E', 250)],
    'B': [('D', 120), ('E', 60), ('F', 200)],
    'C': [('B', 90), ('F', 70), ('G', 250)],
    'D': [('E', 40), ('G', 180), ('H', 130)],
    'E': [('F', 30), ('H', 90), ('I', 220)],
    'F': [('G', 110), ('H', 50), ('I', 100)],
    'G': [('I', 60), ('J', 190)],
    'H': [('I', 40), ('J', 120), ('K', 230)],
    'I': [('J', 70), ('K', 80)],
    'J': [('K', 100), ('L', 200)],
    'K': [('L', 50), ('M', 170)],
    'L': [('M', 90)],
    'M': []
}`;

if (btnTplG1 && customGraphCode) {
  btnTplG1.addEventListener('click', () => {
    customGraphCode.value = G1_TEMPLATE;
    if (customStartNode) customStartNode.value = 'S';
    if (customGoalNode) customGoalNode.value = 'G';
    if (customGraphError) customGraphError.classList.add('hidden');
  });
}

if (btnTplG2 && customGraphCode) {
  btnTplG2.addEventListener('click', () => {
    customGraphCode.value = G2_TEMPLATE;
    if (customStartNode) customStartNode.value = 'S';
    if (customGoalNode) customGoalNode.value = 'M';
    if (customGraphError) customGraphError.classList.add('hidden');
  });
}

if (btnApplyCustomGraph) {
  btnApplyCustomGraph.addEventListener('click', () => {
    if (customGraphError) customGraphError.classList.add('hidden');
    try {
      const code = customGraphCode.value;
      const parsedData = parsePythonGraph(code);

      // Auto-detect Start and Goal nodes with smart fallback
      const [sNode, gNode] = autoDetectEndpoints(
        parsedData,
        customStartNode ? customStartNode.value : '',
        customGoalNode ? customGoalNode.value : ''
      );

      if (customStartNode) customStartNode.value = sNode;
      if (customGoalNode) customGoalNode.value = gNode;

      loadGraph('custom', {
        data: parsedData,
        startNode: sNode,
        goalNode: gNode
      });
    } catch (err) {
      if (customGraphError) {
        customGraphError.textContent = err.message;
        customGraphError.classList.remove('hidden');
      } else {
        alert(err.message);
      }
    }
  });
}

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  // If Presentation Slides Modal is open
  if (typeof slidesOverlay !== 'undefined' && slidesOverlay && !slidesOverlay.classList.contains('hidden')) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        closeSlides();
      }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.code === 'Space' || e.key === 'PageDown' || e.key === 'Enter') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      toggleSlideFullscreen();
    }
    return;
  }

  if (introScreen && !introScreen.classList.contains('hidden')) {
    if (e.key === 'Enter' || e.code === 'Space' || e.key === 'Escape') {
      e.preventDefault();
      launchFromIntro();
    }
    return;
  }

  if (functionModal && !functionModal.classList.contains('hidden')) {
    if (e.key === 'Escape') {
      closeFunctionModal();
      return;
    }
  }

  if (startModal && !startModal.classList.contains('hidden')) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      startModal.classList.add('hidden');
      getAudioContext();
    }
    return;
  }

  if (e.code === 'Space') {
    e.preventDefault();
    togglePlay();
  } else if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
    next();
  } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
    prev();
  } else if (e.key.toLowerCase() === 'r') {
    reset();
  }
});

// ==========================================================================
// 6.5 Function Code Inspector Modal (Faithfully loaded from ucs.py)
// ==========================================================================

const UCS_FUNCTIONS_DATA = {
  ExtractMin: {
    name: 'ExtractMin(FRONTIER)',
    signature: 'def ExtractMin(FRONTIER):',
    fileRef: 'ucs.py (Lines 1-6)',
    desc: 'Extracts and returns the element with the lowest path cost from the FRONTIER priority queue.',
    rawCode: [
      '# Extract Minimum Cost Node',
      'def ExtractMin(FRONTIER):',
      '',
      '    FRONTIER.sort()',
      '',
      '    return FRONTIER.pop(0)'
    ],
    startLine: 1,
    explanation: [
      {
        title: 'Role in Uniform Cost Search (UCS):',
        text: 'FRONTIER stores elements as tuples (cost, node). Calling FRONTIER.sort() sorts the list in ascending order by cost (the 1st element of the tuple). Then FRONTIER.pop(0) removes and returns the first element, guaranteeing that UCS always expands the least cumulative cost node first.'
      },
      {
        title: 'Time & Space Complexity:',
        text: 'In ucs.py, sort() takes O(N log N) and pop(0) takes O(N) where N is the current size of FRONTIER. This guarantees optimal path discovery.'
      }
    ]
  },

  BuildPath: {
    name: 'BuildPath(PARENT, u)',
    signature: 'def BuildPath(PARENT, u):',
    fileRef: 'ucs.py (Lines 9-20)',
    desc: 'Backtracks through the PARENT dictionary to reconstruct the optimal sequence of nodes from Start to Goal.',
    rawCode: [
      '# Build Path Function',
      'def BuildPath(PARENT, u):',
      '',
      '    PATH = []',
      '',
      '    while u is not None:',
      '        PATH.append(u)',
      '        u = PARENT[u]',
      '',
      '    PATH.reverse()',
      '',
      '    return PATH'
    ],
    startLine: 9,
    explanation: [
      {
        title: 'How It Works in UCS:',
        text: 'Whenever the goal node is first popped from FRONTIER, its optimal path is locked. BuildPath traverses backwards from u = goal along PARENT[u] until reaching None (the start node). It reverses the gathered list to return the correct Start ➔ Goal order.'
      },
      {
        title: 'Guaranteed Optimality:',
        text: 'Because edge costs are non-negative and UCS always expands the lowest cost frontier node, the path traced through PARENT is mathematically guaranteed to be the shortest/cheapest route.'
      }
    ]
  },

  UpdatePriorityQueue: {
    name: 'UpdatePriorityQueue(FRONTIER, v, new_cost)',
    signature: '# Priority Queue Relaxation Logic (ucs.py Lines 52-63)',
    fileRef: 'ucs.py (Lines 52-63)',
    desc: 'Updates the cost of node v in FRONTIER if already present with a higher cost, or appends (new_cost, v).',
    rawCode: [
      '# Priority Queue relaxation logic from ucs.py (Lines 52-63)',
      '# Executed when: v not in COST or new_cost < COST[v]',
      'found = False',
      '',
      'for i in range(len(FRONTIER)):',
      '',
      '    if FRONTIER[i][1] == v:',
      '',
      '        FRONTIER[i] = (new_cost, v)',
      '        found = True',
      '        break',
      '',
      'if not found:',
      '    FRONTIER.append((new_cost, v))'
    ],
    startLine: 52,
    explanation: [
      {
        title: 'Priority Queue Relaxation:',
        text: 'When a new edge offers a cheaper path to neighbor node v (new_cost < COST[v]), the algorithm searches FRONTIER. If v is already in the queue, its cost tuple is updated to (new_cost, v). If v is not yet in FRONTIER, it is appended.'
      }
    ]
  },

  uniform_cost_search: {
    name: 'uniform_cost_search(s, goal)',
    signature: 'def uniform_cost_search(s, goal):',
    fileRef: 'ucs.py (Lines 24-66)',
    desc: 'The complete Uniform Cost Search algorithm function implementation from ucs.py.',
    rawCode: [
      '# Uniform Cost Search',
      'def uniform_cost_search(s, goal):',
      '',
      '    FRONTIER = [(0, s)]',
      '    EXPLORED = set()',
      '    COST = {s: 0}',
      '    PARENT = {s: None}',
      '',
      '    while FRONTIER:',
      '',
      '        current_cost, u = ExtractMin(FRONTIER)',
      '',
      '        if u == goal:',
      '            return BuildPath(PARENT, u), COST[u]',
      '',
      '        EXPLORED.add(u)',
      '',
      '        for v, edge_cost in graph[u]:',
      '',
      '            if v in EXPLORED:',
      '                continue',
      '',
      '            new_cost = COST[u] + edge_cost',
      '',
      '            if v not in COST or new_cost < COST[v]:',
      '',
      '                COST[v] = new_cost',
      '                PARENT[v] = u',
      '',
      '                found = False',
      '',
      '                for i in range(len(FRONTIER)):',
      '',
      '                    if FRONTIER[i][1] == v:',
      '',
      '                        FRONTIER[i] = (new_cost, v)',
      '                        found = True',
      '                        break',
      '',
      '                if not found:',
      '                    FRONTIER.append((new_cost, v))',
      '',
      '    return [], float(\'inf\')'
    ],
    startLine: 24,
    explanation: [
      {
        title: 'Algorithm Overview:',
        text: 'Uniform Cost Search is Dijkstra\'s algorithm formulated for search problems. It systematically explores paths in order of increasing total cost g(n), making it complete and optimal.'
      }
    ]
  }
};

// Format function names inside snippets with interactive buttons
function formatSnippetWithFnButtons(codeStr) {
  if (!codeStr) return '';
  return codeStr
    .replace(/\bExtractMin\b/g, '<span class="code-fn-btn" data-fn="ExtractMin" title="Click to inspect ExtractMin() from ucs.py">ExtractMin</span>')
    .replace(/\bBuildPath\b/g, '<span class="code-fn-btn" data-fn="BuildPath" title="Click to inspect BuildPath() from ucs.py">BuildPath</span>')
    .replace(/\bUpdatePriorityQueue\b/g, '<span class="code-fn-btn" data-fn="UpdatePriorityQueue" title="Click to inspect UpdatePriorityQueue() from ucs.py">UpdatePriorityQueue</span>')
    .replace(/\buniform_cost_search\b/g, '<span class="code-fn-btn" data-fn="uniform_cost_search" title="Click to inspect uniform_cost_search() from ucs.py">uniform_cost_search</span>');
}

// Light Python Syntax Highlighter for Modal
function highlightPythonSyntax(line) {
  if (!line || line.trim() === '') return '&nbsp;';

  let comment = '';
  let code = line;
  const hashIdx = line.indexOf('#');
  if (hashIdx !== -1) {
    code = line.substring(0, hashIdx);
    comment = line.substring(hashIdx);
  }

  let escapedCode = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  escapedCode = escapedCode.replace(/(['"])(.*?)\1/g, '<span class="py-str">$1$2$1</span>');

  const pyKeywords = ['def', 'return', 'while', 'if', 'else', 'elif', 'for', 'in', 'break', 'continue', 'not', 'and', 'or', 'is', 'None', 'True', 'False'];
  pyKeywords.forEach(kw => {
    const rx = new RegExp(`\\b(${kw})\\b`, 'g');
    escapedCode = escapedCode.replace(rx, '<span class="py-kw">$1</span>');
  });

  const pyBuiltins = ['float', 'set', 'len', 'range', 'print', 'sort', 'pop', 'append', 'reverse'];
  pyBuiltins.forEach(bi => {
    const rx = new RegExp(`\\b(${bi})\\b`, 'g');
    escapedCode = escapedCode.replace(rx, '<span class="py-builtin">$1</span>');
  });

  const pyFns = ['ExtractMin', 'BuildPath', 'UpdatePriorityQueue', 'uniform_cost_search'];
  pyFns.forEach(fn => {
    const rx = new RegExp(`\\b(${fn})\\b`, 'g');
    escapedCode = escapedCode.replace(rx, '<span class="py-fn">$1</span>');
  });

  const pyIds = ['FRONTIER', 'EXPLORED', 'COST', 'PARENT', 'PATH'];
  pyIds.forEach(id => {
    const rx = new RegExp(`\\b(${id})\\b`, 'g');
    escapedCode = escapedCode.replace(rx, '<span class="py-id">$1</span>');
  });

  escapedCode = escapedCode.replace(/\b(\d+)\b/g, '<span class="py-num">$1</span>');

  let escapedComment = '';
  if (comment) {
    escapedComment = `<span class="py-comment">${comment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
  }

  return escapedCode + escapedComment;
}

// Function Modal DOM Elements
const functionModal = document.getElementById('function-modal');
const fnModalTitle = document.getElementById('fn-modal-title');
const fnModalDesc = document.getElementById('fn-modal-desc');
const fnModalFileBadge = document.getElementById('fn-modal-file-badge');
const fnModalFilename = document.getElementById('fn-modal-filename');
const fnModalCodeLines = document.getElementById('fn-modal-code-lines');
const fnModalExplanation = document.getElementById('fn-modal-explanation');
const btnFnModalClose = document.getElementById('btn-fn-modal-close');
const btnFnModalDismiss = document.getElementById('btn-fn-modal-dismiss');
const btnCopyFnCode = document.getElementById('btn-copy-fn-code');
const copyBtnText = document.getElementById('copy-btn-text');
const fnSwitchTabs = document.getElementById('fn-switch-tabs');

let currentActiveModalFn = 'ExtractMin';

function renderFunctionModalContent(fnKey) {
  const data = UCS_FUNCTIONS_DATA[fnKey];
  if (!data) return;

  currentActiveModalFn = fnKey;

  if (fnModalTitle) fnModalTitle.textContent = data.signature || data.name;
  if (fnModalFileBadge) fnModalFileBadge.textContent = data.fileRef;
  if (fnModalFilename) fnModalFilename.textContent = `ucs.py: lines ${data.startLine}-${data.startLine + data.rawCode.length - 1}`;

  // Render code lines
  if (fnModalCodeLines) {
    fnModalCodeLines.innerHTML = '';
    data.rawCode.forEach((line, idx) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'code-line';
      const lineNum = data.startLine + idx;
      lineDiv.innerHTML = `
        <span class="line-ptr"></span>
        <span class="line-num">${lineNum}</span>
        <span class="line-code">${highlightPythonSyntax(line)}</span>
      `;
      fnModalCodeLines.appendChild(lineDiv);
    });
  }
}

function openFunctionModal(fnKey) {
  const targetKey = UCS_FUNCTIONS_DATA[fnKey] ? fnKey : 'ExtractMin';

  // Pause visualizer if currently playing
  if (isPlaying) {
    pause();
  }

  getAudioContext();
  playSoundTone(587.33, 'sine', 0.12, 0.08);

  renderFunctionModalContent(targetKey);

  if (functionModal) {
    functionModal.classList.remove('hidden');
  }
}

function closeFunctionModal() {
  if (functionModal) {
    functionModal.classList.add('hidden');
    playSoundTone(440, 'triangle', 0.08, 0.05);
  }
}

// Global click delegation for interactive function buttons in code and trace
document.addEventListener('click', (e) => {
  const fnBtn = e.target.closest('.code-fn-btn');
  if (fnBtn) {
    const fn = fnBtn.dataset.fn;
    if (fn) {
      e.stopPropagation();
      openFunctionModal(fn);
    }
  }
});

// Modal Tabs
if (fnSwitchTabs) {
  fnSwitchTabs.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.fn-tab-btn');
    if (tabBtn && tabBtn.dataset.tab) {
      playSoundTone(523.25, 'sine', 0.08, 0.05);
      renderFunctionModalContent(tabBtn.dataset.tab);
    }
  });
}

// Modal Close & Dismiss Buttons
if (btnFnModalClose) btnFnModalClose.addEventListener('click', closeFunctionModal);
if (btnFnModalDismiss) btnFnModalDismiss.addEventListener('click', closeFunctionModal);

if (functionModal) {
  functionModal.addEventListener('click', (e) => {
    if (e.target === functionModal) {
      closeFunctionModal();
    }
  });
}

// Copy Code Button
if (btnCopyFnCode) {
  btnCopyFnCode.addEventListener('click', () => {
    const data = UCS_FUNCTIONS_DATA[currentActiveModalFn];
    if (!data) return;
    const textToCopy = data.rawCode.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      if (copyBtnText) copyBtnText.textContent = 'Copied! ✓';
      playSoundTone(659.25, 'sine', 0.12, 0.08);
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy Code';
      }, 2000);
    }).catch(() => {
      if (copyBtnText) copyBtnText.textContent = 'Copied!';
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy Code';
      }, 2000);
    });
  });
}

// Full Screen Intro Cover Handlers
const introScreen = document.getElementById('intro-screen');
const btnStartVisualizer = document.getElementById('btn-start-visualizer');
const btnShowIntro = document.getElementById('btn-show-intro');
const brandHomeTrigger = document.getElementById('brand-home-trigger');

function launchFromIntro() {
  if (introScreen) {
    introScreen.classList.add('hidden');
  }
  getAudioContext();
  playSoundTone(523.25, 'triangle', 0.12, 0.08);
  setTimeout(() => {
    playSoundTone(659.25, 'triangle', 0.14, 0.08);
  }, 90);
}

function showIntroScreen() {
  if (isPlaying) {
    pause();
  }
  if (introScreen) {
    introScreen.classList.remove('hidden');
    getAudioContext();
    playSoundTone(440, 'sine', 0.1, 0.06);
  }
}

if (btnStartVisualizer) {
  btnStartVisualizer.addEventListener('click', launchFromIntro);
}

if (btnShowIntro) {
  btnShowIntro.addEventListener('click', showIntroScreen);
}

if (brandHomeTrigger) {
  brandHomeTrigger.addEventListener('click', showIntroScreen);
}

// ==========================================================================
// 6.6 Full Screen Presentation Slides Deck Controller
// ==========================================================================
const slidesOverlay = document.getElementById('slides-overlay');
const btnShowSlides = document.getElementById('btn-show-slides');
const btnIntroSlides = document.getElementById('btn-intro-slides');
const btnSlidesClose = document.getElementById('btn-slides-close');
const btnSlidePrev = document.getElementById('btn-slide-prev');
const btnSlideNext = document.getElementById('btn-slide-next');
const btnSlideFullscreen = document.getElementById('btn-slide-fullscreen');
const slidesViewport = document.getElementById('slides-viewport');
const slidesProgressFill = document.getElementById('slides-progress-fill');
const slidesCurrentNum = document.getElementById('slides-current-num');
const slideFsIcon = document.getElementById('slide-fs-icon');

let currentSlideIndex = 1;
const totalSlidesCount = 8;

function updateSlideView() {
  const panes = document.querySelectorAll('.slide-pane');
  panes.forEach(pane => {
    const slideNum = parseInt(pane.dataset.slide, 10);
    if (slideNum === currentSlideIndex) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  const dots = document.querySelectorAll('.slide-dot');
  dots.forEach(dot => {
    const dotNum = parseInt(dot.dataset.slide, 10);
    if (dotNum === currentSlideIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  if (slidesProgressFill) {
    const pct = (currentSlideIndex / totalSlidesCount) * 100;
    slidesProgressFill.style.width = `${pct}%`;
  }

  if (slidesCurrentNum) {
    slidesCurrentNum.textContent = currentSlideIndex;
  }

  if (btnSlidePrev) {
    btnSlidePrev.disabled = (currentSlideIndex === 1);
  }

  if (btnSlideNext) {
    if (currentSlideIndex === totalSlidesCount) {
      btnSlideNext.innerHTML = '<span>Launch Visualizer ▶</span>';
      btnSlideNext.title = 'Launch Visualizer directly (→ / Space / Enter)';
    } else {
      btnSlideNext.innerHTML = '<span>Next ▶</span>';
      btnSlideNext.title = 'Next Slide (→ / Space / PgDn)';
    }
  }

  if (slidesViewport) {
    slidesViewport.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function openSlides(slideNum = 1) {
  if (isPlaying) {
    pause();
  }
  currentSlideIndex = Math.max(1, Math.min(totalSlidesCount, slideNum));
  if (slidesOverlay) {
    slidesOverlay.classList.remove('hidden');
    updateSlideView();
  }
}

function closeSlides(exitFullscreen = true) {
  if (slidesOverlay) {
    slidesOverlay.classList.add('hidden');
    if (exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

function launchVisualizerFromSlides() {
  closeSlides(false); // Do not exit fullscreen
  launchFromIntro();
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function nextSlide() {
  if (currentSlideIndex < totalSlidesCount) {
    currentSlideIndex++;
    updateSlideView();
  } else {
    // When on the last slide, pressing right / next directly launches the visualizer!
    launchVisualizerFromSlides();
  }
}

function prevSlide() {
  if (currentSlideIndex > 1) {
    currentSlideIndex--;
    updateSlideView();
  }
}

function goToSlide(n) {
  currentSlideIndex = Math.max(1, Math.min(totalSlidesCount, n));
  updateSlideView();
}

function toggleSlideFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      if (slideFsIcon) slideFsIcon.textContent = '🗗';
    }).catch(() => {});
  } else {
    document.exitFullscreen().then(() => {
      if (slideFsIcon) slideFsIcon.textContent = '⛶';
    }).catch(() => {});
  }
}

if (btnShowSlides) {
  btnShowSlides.addEventListener('click', () => openSlides(1));
}
if (btnIntroSlides) {
  btnIntroSlides.addEventListener('click', () => openSlides(1));
}
if (btnSlidesClose) {
  btnSlidesClose.addEventListener('click', closeSlides);
}
if (btnSlideNext) {
  btnSlideNext.addEventListener('click', nextSlide);
}
if (btnSlidePrev) {
  btnSlidePrev.addEventListener('click', prevSlide);
}
if (btnSlideFullscreen) {
  btnSlideFullscreen.addEventListener('click', toggleSlideFullscreen);
}

const btnFloatExit = document.getElementById('btn-float-exit');
if (btnFloatExit) {
  btnFloatExit.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      closeSlides();
    }
  });
}

const btnSlideLaunchVisualizer = document.getElementById('btn-slide-launch-visualizer');
if (btnSlideLaunchVisualizer) {
  btnSlideLaunchVisualizer.addEventListener('click', launchVisualizerFromSlides);
}

document.addEventListener('fullscreenchange', () => {
  if (slidesOverlay) {
    if (document.fullscreenElement) {
      slidesOverlay.classList.add('is-fullscreen');
      if (slideFsIcon) slideFsIcon.textContent = '🗗';
    } else {
      slidesOverlay.classList.remove('is-fullscreen');
      if (slideFsIcon) slideFsIcon.textContent = '⛶';
    }
  }
});

document.querySelectorAll('.slide-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    const targetSlide = parseInt(dot.dataset.slide, 10);
    if (!isNaN(targetSlide)) {
      goToSlide(targetSlide);
    }
  });
});

// 7. Mobile Screen Compatibility Handler
const mobileBlockerModal = document.getElementById('mobile-blocker-modal');
const btnForceDesktopMode = document.getElementById('btn-force-desktop-mode');

function isRealMobileDevice() {
  const ua = navigator.userAgent || '';
  // Check for mobile phone OS user agents (Android Mobile, iPhone, iPod, etc.)
  const isMobilePhoneUA = /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isDesktopOS = /Windows NT|Macintosh|Mac OS X|Linux x86_64/i.test(ua) && !isMobilePhoneUA;

  // If running on a desktop operating system, it is definitely a PC/Laptop
  if (isDesktopOS) {
    return false;
  }

  // Touch phone check: small width with touch and no fine mouse pointer
  const hasFinePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hasFinePointer && window.innerWidth > 800) {
    return false;
  }

  const isSmallScreen = window.innerWidth <= 768;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  return isMobilePhoneUA || (isSmallScreen && isTouchDevice && !hasFinePointer);
}

function enableDesktopMode() {
  const vp = document.getElementById('app-viewport-meta') || document.querySelector('meta[name="viewport"]');
  if (vp) {
    vp.setAttribute('content', 'width=1200, initial-scale=0.32, minimum-scale=0.2, maximum-scale=3.0, user-scalable=yes');
  }

  document.documentElement.classList.add('desktop-mode-active', 'is-mobile-device');
  document.body.classList.add('desktop-mode-active', 'is-mobile-device');
  document.body.classList.remove('mobile-blocker-active');

  if (mobileBlockerModal) {
    mobileBlockerModal.classList.add('dismissed');
    mobileBlockerModal.classList.remove('is-mobile-detected');
  }

  if (btnSlideFullscreen) {
    btnSlideFullscreen.style.display = 'none';
  }

  try {
    sessionStorage.setItem('ucs_preferred_desktop_mode', 'true');
  } catch (e) {}

  window.dispatchEvent(new Event('resize'));
}

function checkMobileDevice() {
  const isMobile = isRealMobileDevice();

  if (!isMobile) {
    // Standard Desktop / Laptop PC environment
    document.documentElement.classList.remove('desktop-mode-active', 'is-mobile-device');
    document.body.classList.remove('desktop-mode-active', 'is-mobile-device', 'mobile-blocker-active');

    try {
      sessionStorage.removeItem('ucs_preferred_desktop_mode');
    } catch (e) {}

    const vp = document.getElementById('app-viewport-meta') || document.querySelector('meta[name="viewport"]');
    if (vp) {
      vp.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }

    if (mobileBlockerModal) {
      mobileBlockerModal.classList.remove('is-mobile-detected');
      mobileBlockerModal.classList.add('dismissed');
    }

    if (btnSlideFullscreen) {
      btnSlideFullscreen.style.display = '';
    }
    return;
  }

  // Real Mobile Device
  document.documentElement.classList.add('is-mobile-device');
  document.body.classList.add('is-mobile-device');
  if (btnSlideFullscreen) {
    btnSlideFullscreen.style.display = 'none';
  }

  let preferred = false;
  try {
    preferred = sessionStorage.getItem('ucs_preferred_desktop_mode') === 'true';
  } catch (e) {}

  if (preferred) {
    enableDesktopMode();
  } else {
    if (mobileBlockerModal) {
      mobileBlockerModal.classList.add('is-mobile-detected');
      mobileBlockerModal.classList.remove('dismissed');
      document.body.classList.add('mobile-blocker-active');
    }
  }
}

if (btnForceDesktopMode) {
  btnForceDesktopMode.addEventListener('click', enableDesktopMode);
}

window.addEventListener('resize', () => {
  checkMobileDevice();
});

// 8. Initialize
function init() {
  checkMobileDevice();
  loadGraph('graph1');
  if (startModal) {
    startModal.classList.add('hidden');
  }
  if (introScreen) {
    introScreen.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
}
