import { useEffect, useRef, useState, type ReactNode } from 'react';
import { hall } from './hallData';

export type Seat = { row: number; place: number; category: number };

export interface HallPlanProps {
  /** Zoom: X1 — весь зал (393×528), X3 — приближение (393×600), кадры 1:1 с Figma. */
  zoom?: 'X1' | 'X3';
  /** Уже проданные места «ряд-место» — рисуются занятыми, не кликаются. */
  occupied?: string[];
  /** Выбранные места «ряд-место». */
  selected?: string[];
  /** Выбранные при открытии (неконтролируемый режим). */
  defaultSelected?: string[];
  /** Живой масштаб (1 — весь зал, `HALL_MAX_SCALE` — кадр X3). Если задан — кадр 393×600, схему можно двигать пальцем/мышью, приближать щипком и колесом. */
  scale?: number;
  /** Масштаб изменён жестом (щипок, колесо). */
  onScaleChange?: (scale: number) => void;
  /** Начальный центр кадра в координатах схемы (по умолчанию — центр зала). */
  center?: [number, number];
  /** Клик по свободному месту. */
  onSeatClick?: (seat: Seat) => void;
  children?: ReactNode;
  className?: string;
}

/** Категории мест: 0 — занято, 1–5 — ценовые категории (цвета легенды на экране выбора мест). */
const FILL = ['var(--color-background-secondary)', 'var(--illustration-seat-1)', 'var(--illustration-seat-2)', 'var(--illustration-seat-3)', 'var(--illustration-seat-4)', 'var(--illustration-seat-5)'];

/** Пикселей схемы на 1px экрана при X1. */
const K = 2306 / 393;
/** Масштаб кадра X3 (`717 999 572 873` в 393×600). */
export const HALL_MAX_SCALE = K / (572 / 393);
/** Центр кадра X3 — места 14 ряда. */
export const HALL_X3_CENTER: [number, number] = [717 + 572 / 2, 999 + 873 / 2];
/** Кадр масштаба 1 в живом режиме: 393×600, схема на 78px от верха (как X1 на экране). */
const BASE = { x: 33.4, y: -78 * K, w: 393 * K, h: 600 * K };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Hall plan — схема зала в SVG, перерисована точь-в-точь по изображению из Figma (`146:5258`): арки, 1151 место в своих координатах и цветах, разделитель, сцена.
 * Цветные места кликабельны; выбранное помечается кольцом, как Map mark.
 */
export function HallPlan({ zoom = 'X1', scale, onScaleChange, center, occupied = [], selected, defaultSelected = [], onSeatClick, children, className }: HallPlanProps) {
  const [inner, setInner] = useState<string[]>(defaultSelected);
  const sel = selected ?? inner;
  const live = scale !== undefined;
  const x1 = zoom === 'X1';

  // Живой режим: показываемый масштаб плавно догоняет `scale` (кнопки), жесты меняют его сразу
  const [shown, setShown] = useState(scale ?? 1);
  const [c, setC] = useState<[number, number]>(center ?? [BASE.x + BASE.w / 2, BASE.y + BASE.h / 2]);
  const gesture = useRef(false);
  useEffect(() => {
    if (scale === undefined) return;
    if (gesture.current) { gesture.current = false; setShown(scale); return; }
    const from = shown, t0 = performance.now();
    let raf = 0;
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 220), e = 1 - (1 - k) ** 3; setShown(from + (scale - from) * e); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);
  const vw = BASE.w / shown, vh = BASE.h / shown;
  const cx = clamp(c[0], BASE.x + vw / 2, BASE.x + BASE.w - vw / 2), cy = clamp(c[1], BASE.y + vh / 2, BASE.y + BASE.h - vh / 2);

  const box = useRef<HTMLDivElement>(null);
  const ptrs = useRef(new Map<number, [number, number]>());
  const moved = useRef(false);
  const toHall = (px: number, py: number): [number, number] => { const r = box.current!.getBoundingClientRect(); return [cx - vw / 2 + ((px - r.left) / r.width) * vw, cy - vh / 2 + ((py - r.top) / r.height) * vh]; };
  const zoomAt = (next: number, px: number, py: number) => {
    const s2 = clamp(next, 1, HALL_MAX_SCALE * 1.25); const [hx, hy] = toHall(px, py);
    setC([hx + (cx - hx) * (shown / s2), hy + (cy - hy) * (shown / s2)]);
    gesture.current = true; setShown(s2); onScaleChange?.(s2);
  };
  // Колесо/трекпад — непассивный слушатель, чтобы не прокручивать страницу
  const wheel = useRef(zoomAt); wheel.current = zoomAt;
  const shownRef = useRef(shown); shownRef.current = shown;
  useEffect(() => {
    const el = box.current; if (!live || !el) return;
    const on = (e: WheelEvent) => { e.preventDefault(); wheel.current(shownRef.current * Math.exp(-e.deltaY * 0.004), e.clientX, e.clientY); };
    el.addEventListener('wheel', on, { passive: false });
    return () => el.removeEventListener('wheel', on);
  }, [live]);
  const down = (e: React.PointerEvent) => { ptrs.current.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.current.size === 1) moved.current = false; };
  const move = (e: React.PointerEvent) => {
    const prev = ptrs.current.get(e.pointerId); if (!prev) return;
    const others = [...ptrs.current].filter(([id]) => id !== e.pointerId);
    ptrs.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (others.length === 1) { // щипок
      const o = others[0][1], d0 = Math.hypot(prev[0] - o[0], prev[1] - o[1]), d1 = Math.hypot(e.clientX - o[0], e.clientY - o[1]);
      if (d0 > 0) zoomAt(shown * (d1 / d0), (e.clientX + o[0]) / 2, (e.clientY + o[1]) / 2);
      moved.current = true; return;
    }
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1];
    if (!moved.current && Math.hypot(dx, dy) < 4) { ptrs.current.set(e.pointerId, prev); return; }
    if (!moved.current) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    moved.current = true;
    const r = box.current!.getBoundingClientRect();
    setC([cx - (dx / r.width) * vw, cy - (dy / r.height) * vh]);
  };
  const up = (e: React.PointerEvent) => { ptrs.current.delete(e.pointerId); };

  // X1: картинка 2373×2400 вписана cover в 393×409 со сдвигом 58; X3: картинка 1631×1650 со смещением −493/−687
  const viewBox = live ? `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}` : x1 ? '33.4 0 2306 2400' : '717 999 572 873';
  return (
    <div ref={box} className={className} onPointerDown={live ? down : undefined} onPointerMove={live ? move : undefined} onPointerUp={live ? up : undefined} onPointerCancel={live ? up : undefined}
      style={{ position: 'relative', width: 393, height: live || !x1 ? 600 : 528, overflow: 'hidden', background: live ? 'var(--color-background-base)' : 'var(--color-base-white)', flexShrink: 0, touchAction: live ? 'none' : undefined, cursor: live && shown > 1.01 ? 'grab' : undefined }}>
      <svg viewBox={viewBox} preserveAspectRatio="none" role="img" aria-label="Схема зала"
        style={x1 && !live ? { position: 'absolute', left: 0, top: 58, width: 393, height: 409 } : { position: 'absolute', inset: 0, width: 393, height: 600 }}>
        <rect x={0} y={0} width={hall.w} height={hall.h} fill="var(--color-background-base)" />
        <path d={hall.outer} fill="var(--color-base-white)" />
        <path d={hall.hole} fill="var(--color-background-base)" />
        <path d={hall.inner} fill="var(--color-base-white)" />
        <rect x={hall.divider[0]} y={hall.divider[1]} width={hall.divider[2] - hall.divider[0]} height={hall.divider[3] - hall.divider[1]} fill="var(--color-background-secondary)" />
        <path d={hall.stage.arc} fill="none" stroke="var(--color-background-placeholder)" strokeWidth={5} />
        <text x={hall.stage.text[0]} y={hall.stage.text[1]} textAnchor="middle" fontSize={56} fontFamily="var(--typography-font-family)" fill="var(--color-text-primary)">Сцена</text>
        {hall.seats.map(([x, y, cat, row, place]) => {
          const id = `${row}-${place}`; const sold = occupied.includes(id); const on = !sold && sel.includes(id); const free = cat > 0 && !sold;
          return (
            <g key={id} style={{ cursor: free ? 'pointer' : 'default' }}
              onClick={free ? () => { if (moved.current) return; if (!selected) setInner(on ? sel.filter((s) => s !== id) : [...sel, id]); onSeatClick?.({ row, place, category: cat }); } : undefined}>
              <title>{`${row} ряд, ${place} место`}</title>
              {on ? <>
                <circle cx={x} cy={y} r={36} fill="var(--illustration-map-mark-halo)" />
                <circle cx={x} cy={y} r={23} fill={FILL[cat]} />
                <circle cx={x} cy={y} r={9} fill="var(--illustration-map-mark-halo)" />
              </> : <circle cx={x} cy={y} r={hall.r} fill={FILL[sold ? 0 : cat]} />}
            </g>
          );
        })}
      </svg>
      {children}
    </div>
  );
}
