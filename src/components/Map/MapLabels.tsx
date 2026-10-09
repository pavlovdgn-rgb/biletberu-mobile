import { memo, useMemo } from 'react';
import { MAP_H, MAP_W, METRO, STREETS, WATERS } from './geo';

/** Минимальный масштаб (px экрана на единицу карты), с которого видны подписи ранга: 1 — проспекты, 2 — крупные улицы, 3 — улицы, 4 — переулки. */
const MIN_K: Record<number, number> = { 1: 0.3, 2: 0.42, 3: 0.6, 4: 0.9 };
const FONT = 11; // px на экране — постоянный при любом зуме, как в настоящих картах
const CHAR = 0.56; // ширина символа в долях кегля (Onest)

type Placed = { id: string; d: string; name: string; rank: number };

function pathLen(pts: number[][]) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
/** Точка и направление на расстоянии s вдоль ломаной. */
function along(pts: number[][], s: number): [number, number] { let acc = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + l >= s) { const t = (s - acc) / l; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; } acc += l; } return pts[pts.length - 1] as [number, number]; }
/** Участок ломаной [a, b] по длине. */
function slice(pts: number[][], a: number, b: number) { const out: number[][] = [along(pts, a)]; let acc = 0; for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc > a && acc < b) out.push(pts[i]); } out.push(along(pts, b)); return out; }

/** Слой подписей карты: улицы вдоль линии (не вверх ногами), реки, метро. Состав зависит от масштаба, кегль на экране постоянный, подписи не пересекаются. */
/** Прямоугольник, занятый меткой (в единицах карты): подписи карты его обходят. */
export type Obstacle = { x0: number; y0: number; x1: number; y1: number };

export const MapLabels = memo(function MapLabels({ k, streets = true, metro = true, obstacles = [] }: { k: number; streets?: boolean; metro?: boolean; obstacles?: Obstacle[] }) {
  const fs = FONT / k; // кегль в единицах карты
  const placed = useMemo(() => {
    const cell = fs * 1.2, grid = new Set<string>();
    const free = (pts: number[][]) => pts.every(([x, y]) => !grid.has(`${Math.floor(x / cell)}:${Math.floor(y / cell)}`));
    const take = (pts: number[][]) => pts.forEach(([x, y]) => { const cx = Math.floor(x / cell), cy = Math.floor(y / cell); grid.add(`${cx}:${cy}`); grid.add(`${cx + 1}:${cy}`); grid.add(`${cx - 1}:${cy}`); });
    // метро и реки занимают место первыми
    // метро: значок и название занимают место первыми
    // метки мест (фото + подпись) важнее подписей карты: их область занята заранее
    for (const o of obstacles) for (let x = o.x0; x <= o.x1; x += cell * 0.9) for (let y = o.y0; y <= o.y1; y += cell * 0.9) grid.add(`${Math.floor(x / cell)}:${Math.floor(y / cell)}`);
    // метро: значок всегда; название — только если не налезает на метку или другую подпись
    const metroOut = metro ? METRO.map((m) => {
      const nameW = m.name.length * CHAR * fs + fs * 1.4;
      const row = (dir: 1 | -1, dy: number) => Array.from({ length: Math.ceil(nameW / (fs * 0.7)) + 1 }, (_, i) => [m.x + dir * (fs * 0.6 + i * fs * 0.7), m.y + dy]);
      // справа, слева, под или над значком — где свободно
      const opts: Array<{ side: 'right' | 'left' | 'below' | 'above'; pts: number[][] }> = [
        { side: 'right', pts: row(1, 0) }, { side: 'left', pts: row(-1, 0) },
        { side: 'below', pts: row(1, fs * 1.6).map(([x, y]) => [x - nameW / 2, y]) }, { side: 'above', pts: row(1, -fs * 1.6).map(([x, y]) => [x - nameW / 2, y]) },
      ];
      const pick = k >= 0.45 ? opts.find((o) => free(o.pts)) : undefined;
      take(pick ? [[m.x, m.y], ...pick.pts] : [[m.x, m.y]]);
      return { ...m, named: !!pick, side: pick?.side ?? 'right' };
    }) : [];
    const waterOut = WATERS.filter((w) => w.area > 60000 || k >= 0.6).filter((w, i, a) => a.findIndex((x) => x.name === w.name) === i)
      .filter((w) => { const half = (w.name.length * CHAR * fs * 1.3) / 2; const box = [[w.x - half, w.y], [w.x, w.y], [w.x + half, w.y]]; if (!free(box)) return false; take(box); return true; });
    const out: Placed[] = [];
    if (streets) {
      const cand = STREETS.filter((s) => k >= (MIN_K[s.rank] ?? 9)).sort((a, b) => a.rank - b.rank || b.len - a.len);
      for (const s of cand) {
        const textLen = s.name.length * CHAR * fs + fs;
        const L = pathLen(s.pts);
        if (L < textLen * 1.15) continue;
        // подписи вдоль улицы с шагом ~ 420 px экрана; если место занято — пробуем сдвинуть вдоль линии
        const step = 420 / k, n = Math.max(1, Math.floor(L / step));
        for (let j = 0; j < n; j++) {
          const base = (L / n) * (j + 0.5);
          for (const shift of [0, -0.25, 0.25, -0.4, 0.4]) {
            const c = base + shift * (L / n);
            if (c - textLen / 2 < 0 || c + textLen / 2 > L) continue;
            let seg = slice(s.pts, c - textLen / 2, c + textLen / 2);
            const samples = Array.from({ length: Math.ceil(textLen / (fs * 0.7)) + 1 }, (_, i) => along(seg, Math.min(textLen, i * fs * 0.7)));
            if (!free(samples)) continue;
            take(samples);
            if (seg[seg.length - 1][0] < seg[0][0]) seg = [...seg].reverse(); // читаем слева направо
            out.push({ id: `l${out.length}`, d: 'M' + seg.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L'), name: s.name, rank: s.rank });
            break;
          }
        }
      }
    }
    return { streets: out, waters: streets ? waterOut : [], metro: metroOut };
  }, [k, fs, streets, metro, obstacles]);

  const halo = { paintOrder: 'stroke' as const, stroke: 'var(--map-label-halo)', strokeWidth: fs * 0.32, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }} aria-hidden>
      <defs>{placed.streets.map((p) => <path key={p.id} id={`ml-${p.id}`} d={p.d} />)}</defs>
      {placed.streets.map((p) => (
        <text key={p.id} fontSize={fs} fontFamily="var(--typography-font-family)" fontWeight={p.rank === 1 ? 600 : 500} fill="var(--map-label)" dy={fs * 0.35} style={halo}>
          <textPath href={`#ml-${p.id}`} startOffset="50%" textAnchor="middle">{p.name}</textPath>
        </text>
      ))}
      {placed.waters.map((w) => (
        <text key={w.name} x={w.x} y={w.y} fontSize={fs * 1.05} fontStyle="italic" fontFamily="var(--typography-font-family)" textAnchor="middle" fill="var(--illustration-map-water-label)" style={halo}>{w.name}</text>
      ))}
      {placed.metro.map((m) => (
        <g key={m.name} transform={`translate(${m.x} ${m.y})`}>
          <circle r={fs * 0.85} fill="var(--illustration-metro-line)" stroke="var(--map-label-halo)" strokeWidth={fs * 0.15} />
          <text fontSize={fs * 1.05} fontWeight={700} textAnchor="middle" dy={fs * 0.38} fill="var(--color-static-white)" fontFamily="var(--typography-font-family)">М</text>
          {m.named && <text x={m.side === 'right' ? fs * 1.2 : m.side === 'left' ? -fs * 1.2 : 0} y={m.side === 'below' ? fs * 1.6 : m.side === 'above' ? -fs * 1.6 : 0} textAnchor={m.side === 'right' ? 'start' : m.side === 'left' ? 'end' : 'middle'} dy={fs * 0.38} fontSize={fs} fontWeight={500} fontFamily="var(--typography-font-family)" fill="var(--color-text-primary)" style={halo}>{m.name}</text>}
        </g>
      ))}
    </svg>
  );
});
