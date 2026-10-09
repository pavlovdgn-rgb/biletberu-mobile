import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import s from './Map.module.css';
import { GEO, MAP_H, MAP_W, METERS_PER_UNIT, toMap, type LatLon } from './geo';
import { MapLabels, type Obstacle } from './MapLabels';
import { loadRoads, pathLength, routePath, roadsReady } from './route';

/** Сколько px экрана занимает вся карта по ширине при scale = 1 px (scale — «ширина исходной карты» из макетов, 758 по умолчанию). */
const SPAN = 2.2;

export interface MapProps {
  /** Designation: Yes — подписи улиц и рек (появляются по мере приближения, как в настоящих картах). */
  designation?: 'No' | 'Yes';
  /** Метро: Yes — станции метро. */
  metro?: 'No' | 'Yes';
  /** Zoom: в ките только X1. */
  zoom?: 'X1';
  /** Size: Default | Large — в коде одна карта центра Петербурга (OSM), размер задаёт `scale`. */
  size?: 'Default' | 'Large';
  /** Высота окна карты, px. */
  height?: number | string;
  /** Масштаб: 758 — как в макетах экранов; больше — крупнее. */
  scale?: number;
  /** Точка, на которой карта открывается по центру (по умолчанию — театр). */
  center?: LatLon;
  /** Точка, к которой карта плавно переезжает при изменении (например, центр найденных по фильтру мест). */
  focus?: LatLon;
  /** Устарело: начальная прокрутка в px (кадры старой иллюстрации). */
  start?: [number, number];
  /** Метки: `MapPin` (по координатам) или элементы с позицией относительно центра карты. */
  children?: ReactNode;
  className?: string;
}

const MapCtx = createContext<{ k: number; register?: (id: string, o: Obstacle | null) => void }>({ k: 1 });
/** Масштаб текущей карты (px экрана на единицу карты). */
export const useMapScale = () => useContext(MapCtx).k;

/** Метка на карте по координатам: центр метки — в точке (или низ, если anchor="bottom"). Не масштабируется при зуме. */
export function MapPin({ at, anchor = 'center', children, style }: { at: LatLon; anchor?: 'center' | 'bottom'; children: ReactNode; style?: CSSProperties }) {
  const { k, register } = useContext(MapCtx);
  const [x, y] = toMap(at);
  const id = useId();
  const el = useRef<HTMLDivElement>(null);
  // сообщаем карте занятую меткой область — подписи улиц и метро её обойдут
  useLayoutEffect(() => {
    const n = el.current; if (!register || !n) return;
    const w = n.offsetWidth / k, h = n.offsetHeight / k, pad = 4 / k;
    const top = anchor === 'bottom' ? y - h : y - h / 2;
    register(id, { x0: x - w / 2 - pad, y0: top - pad, x1: x + w / 2 + pad, y1: top + h + pad });
    return () => register(id, null);
  }, [register, id, x, y, k, anchor]);
  return <div ref={el} style={{ position: 'absolute', left: x * k, top: y * k, transform: anchor === 'bottom' ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)', zIndex: 1, ...style }}>{children}</div>;
}

/** Маршрут по точкам: пунктир цвета бренда с белой подложкой, как на макете Full map 1.
 *  Линия идёт по дорогам карты (граф улиц и дорожек OSM, `route.ts`), а не напрямую через кварталы и парки;
 *  пока граф грузится — временно по прямой. */
export function MapRoute({ points }: { points: LatLon[] }) {
  const { k } = useContext(MapCtx);
  const [, ready] = useState(!!roadsReady());
  useEffect(() => { if (!roadsReady()) loadRoads().then(() => ready(true)); }, []);
  const key = points.map((p) => p.join(',')).join(';');
  const path = useMemo(() => routePath(points.map((p) => toMap(p)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  , [key, roadsReady()]);
  if (points.length < 2) return null;
  const d = 'M' + path.map(([x, y]) => `${(x * k).toFixed(1)},${(y * k).toFixed(1)}`).join(' L');
  return (
    <svg width={MAP_W * k} height={MAP_H * k} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }} aria-hidden>
      <path d={d} fill="none" stroke="var(--map-label-halo)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="var(--color-primary-orange)" strokeWidth={2.5} strokeDasharray="8 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Map — векторная карта исторического центра Петербурга по данным OpenStreetMap в стиле кита (Figma `146:4760`).
 *  Пан пальцем/мышью; подписи улиц и рек появляются по мере приближения, кегль на экране постоянный. */
export function Map({ designation = 'Yes', metro = 'Yes', height = 320, scale = 758, center = GEO.theatre, focus, start, children, className }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const w = scale * SPAN, k = w / MAP_W, h = MAP_H * k;
  const prev = useRef<{ k: number; cx: number; cy: number } | null>(null);
  const [, force] = useState(0);
  const [pins, setPins] = useState<Record<string, Obstacle>>({});
  const register = useCallback((id: string, o: Obstacle | null) => setPins((p) => {
    if (!o) { if (!(id in p)) return p; const n = { ...p }; delete n[id]; return n; }
    const q = p[id]; if (q && q.x0 === o.x0 && q.y0 === o.y0 && q.x1 === o.x1 && q.y1 === o.y1) return p;
    return { ...p, [id]: o };
  }), []);
  const obstacles = useMemo(() => Object.values(pins), [pins]);
  // открытие — по центру точки; смена масштаба — держим ту же точку в центре окна
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const p = prev.current;
    if (p && p.k !== k) { const f = k / p.k; el.scrollLeft = p.cx * f - el.clientWidth / 2; el.scrollTop = p.cy * f - el.clientHeight / 2; }
    else if (!p) {
      if (start) { el.scrollLeft = start[0]; el.scrollTop = start[1]; }
      // у южного края данных OSM нет (пустая полоса) — центр не ниже 59.928, метки остаются на своих местах
      else { const [x, y] = toMap([Math.max(center[0], 59.928), center[1]]); el.scrollLeft = x * k - el.clientWidth / 2; el.scrollTop = y * k - el.clientHeight / 2; }
    }
    prev.current = { k, cx: el.scrollLeft + el.clientWidth / 2, cy: el.scrollTop + el.clientHeight / 2 };
    force((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, height]);
  // переезд к точке focus — после смены масштаба (тот же кадр), плавно
  const fx = focus?.[0], fy = focus?.[1];
  useEffect(() => {
    const el = ref.current; if (!el || fx === undefined || fy === undefined) return;
    const [x, y] = toMap([fx, fy]);
    el.scrollTo({ left: x * k - el.clientWidth / 2, top: y * k - el.clientHeight / 2, behavior: 'smooth' });
  }, [fx, fy, k]);
  useEffect(() => { const el = ref.current; if (!el) return; const on = () => { if (prev.current) { prev.current.cx = el.scrollLeft + el.clientWidth / 2; prev.current.cy = el.scrollTop + el.clientHeight / 2; } }; el.addEventListener('scroll', on); return () => el.removeEventListener('scroll', on); }, []);
  return (
    <div className={className} style={{ position: 'relative', width: '100%', height }}>
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'auto', scrollbarWidth: 'none', background: 'var(--illustration-map-land)', cursor: 'grab' }}
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest('button')) return; const el = ref.current!; const sx = e.clientX, sy = e.clientY, l = el.scrollLeft, t = el.scrollTop;
        const move = (ev: PointerEvent) => { el.scrollLeft = l - (ev.clientX - sx); el.scrollTop = t - (ev.clientY - sy); };
        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); }}>
      <MapCtx.Provider value={{ k, register }}>
        <div style={{ position: 'relative', width: w, height: h }}>
          {/* подложка — фоном: в тёмной теме CSS подменяет её на тёмную версию (map-dark.svg), загружается только нужная */}
          <div role="img" aria-label="Карта" className={s.tiles} style={{ width: w, height: h }} />
          <MapLabels k={k} streets={designation === 'Yes'} metro={metro === 'Yes'} obstacles={obstacles} />
          {children}
        </div>
      </MapCtx.Provider>
    </div>
      <span className="ds-tiny-regular" style={{ position: 'absolute', right: 4, bottom: 2, padding: '0 var(--spacing-xs)', borderRadius: 'var(--radius-xs)', background: 'color-mix(in srgb, var(--color-base-white) 70%, transparent)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>© OpenStreetMap</span>
    </div>
  );
}

/** Длина пешего маршрута через точки, м — по дорогам (граф грузится лениво; до загрузки — по прямой). */
export function useRouteMeters(points: LatLon[]): number {
  const [, ready] = useState(!!roadsReady());
  useEffect(() => { if (!roadsReady()) loadRoads().then(() => ready(true)); }, []);
  const key = points.map((p) => p.join(',')).join(';');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => Math.round(pathLength(routePath(points.map((p) => toMap(p)))) * METERS_PER_UNIT), [key, roadsReady()]);
}
