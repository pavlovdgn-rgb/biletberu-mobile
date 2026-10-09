/** Пешеходный маршрут по дорогам карты: граф улиц и дорожек из OSM (`osm/roads.json`, собран `execution/osm_roads_graph.py`),
 *  кратчайший путь между точками — Дейкстра. Граф грузится лениво — только когда на экране есть маршрут. */
type Graph = { nodes: number[][]; adj: Array<Array<[number, number, number]>>; mids: number[][]; };
type Pt = [number, number];

let graph: Graph | null = null;
let loading: Promise<Graph> | null = null;

export function loadRoads(): Promise<Graph> {
  if (graph) return Promise.resolve(graph);
  loading ??= import('./osm/roads.json').then((m) => {
    const data = m.default as unknown as { nodes: number[][]; edges: Array<[number, number, number, number[]]> };
    const adj: Graph['adj'] = data.nodes.map(() => []);
    const mids: number[][] = [];
    data.edges.forEach(([a, b, len, mid], i) => { adj[a].push([b, len, i]); adj[b].push([a, len, i]); mids.push(mid); });
    graph = { nodes: data.nodes, adj, mids };
    return graph;
  });
  return loading;
}
export const roadsReady = () => graph;

const nearest = (g: Graph, [x, y]: Pt) => {
  let best = 0, bd = Infinity;
  for (let i = 0; i < g.nodes.length; i++) { const dx = g.nodes[i][0] - x, dy = g.nodes[i][1] - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
  return best;
};

/** Кратчайший путь по дорогам от a до b (единицы карты). Начало и конец — от точки до ближайшего перекрёстка дороги. */
export function roadPath(g: Graph, a: Pt, b: Pt): Pt[] {
  const s = nearest(g, a), t = nearest(g, b);
  if (s === t) return [a, b];
  const n = g.nodes.length, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), via = new Int32Array(n).fill(-1);
  // бинарная куча (расстояние, узел)
  const heap: Array<[number, number]> = [];
  const push = (d: number, v: number) => { heap.push([d, v]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop()!; if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  // эвристика A*: расстояние по прямой до цели
  const [tx, ty] = g.nodes[t];
  const h = (v: number) => Math.hypot(g.nodes[v][0] - tx, g.nodes[v][1] - ty);
  dist[s] = 0; push(h(s), s);
  while (heap.length) {
    const [, u] = pop();
    if (u === t) break;
    for (const [v, len, e] of g.adj[u]) {
      const nd = dist[u] + len;
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; via[v] = e; push(nd + h(v), v); }
    }
  }
  if (prev[t] === -1) return [a, b];
  // собираем путь: узлы + промежуточная геометрия рёбер в нужном направлении
  const chain: number[] = []; for (let v = t; v !== -1; v = prev[v]) chain.push(v); chain.reverse();
  const out: Pt[] = [a, g.nodes[chain[0]] as Pt];
  for (let i = 1; i < chain.length; i++) {
    const u = chain[i - 1], v = chain[i], m = g.mids[via[v]];
    const seg: Pt[] = []; for (let k = 0; k < m.length; k += 2) seg.push([m[k], m[k + 1]]);
    if (u > v) seg.reverse(); // в файле геометрия ребра — от меньшего номера узла к большему
    out.push(...seg, g.nodes[v] as Pt);
  }
  out.push(b);
  return out;
}

/** Полный пеший путь через все точки (единицы карты): по дорогам, если граф загружен, иначе по прямой. */
export function routePath(points: Pt[]): Pt[] {
  const g = graph;
  if (!g || points.length < 2) return points;
  const out: Pt[] = [];
  for (let i = 1; i < points.length; i++) { const seg = roadPath(g, points[i - 1], points[i]); out.push(...(i > 1 ? seg.slice(1) : seg)); }
  return out;
}
export const pathLength = (pts: Pt[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
