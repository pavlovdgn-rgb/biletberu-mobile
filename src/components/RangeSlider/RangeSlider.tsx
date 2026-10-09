import { useMemo, useState, type CSSProperties } from 'react';
import { cx } from '../_lib/cx';
import s from './RangeSlider.module.css';

/** Шаг цены внутри отрезка между подписями. */
const stepFor = (from: number) => (from < 1000 ? 50 : from < 3000 ? 100 : from < 10000 ? 500 : 1000);
const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/ /g, ' ');

export interface RangeSliderProps {
  /** Phase: min | middle | max — стартовое положение (как варианты в Figma). */
  phase?: 'min' | 'middle' | 'max';
  /** Опорные значения шкалы (подписи). Последняя подпись «∞» — без ограничения. */
  marks?: number[];
  /** Сколько промежуточных положений между соседними подписями. */
  stepsBetween?: number;
  /** Показывать подсказку с ценой над ползунком. */
  showValue?: boolean;
  /** Управляемая цена (null — без ограничения): ползунок встаёт на ближайшее положение. */
  value?: number | null;
  /** Цена (null — без ограничения). */
  onChange?: (value: number | null) => void;
  className?: string;
}

/**
 * Range slider — шкала «Стоимость» в фильтрах. Figma: `132:17252`.
 * Между подписанными значениями — промежуточные положения с «круглым» шагом (50 / 100 / 500 / 1 000 ₽), над ползунком — текущая цена.
 */
export function RangeSlider({ phase = 'middle', marks = [500, 1000, 3000, 10000], stepsBetween = 10, showValue = true, value, onChange, className }: RangeSliderProps) {
  // Позиции: отрезки между marks + последний отрезок 10 000 → ∞
  const values = useMemo(() => {
    const out: Array<number | null> = [];
    const pts = [...marks, marks[marks.length - 1] * 2];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], st = stepFor(a);
      for (let k = 0; k < stepsBetween; k++) out.push(Math.round((a + ((b - a) * k) / stepsBetween) / st) * st);
    }
    out.push(null);
    return out;
  }, [marks, stepsBetween]);
  const max = values.length - 1;
  const start = phase === 'min' ? 0 : phase === 'max' ? max : stepsBetween * 2 - Math.round(stepsBetween * 0.75);
  const [inner, setV] = useState(start);
  const nearest = (x: number | null) => (x === null ? max : values.reduce<number>((b, y, i) => (y !== null && Math.abs(y - x) < Math.abs((values[b] ?? Infinity) - x) ? i : b), 0));
  const v = value !== undefined ? nearest(value) : inner;
  const val = value !== undefined ? value : values[v];
  const label = val === null ? 'Без ограничений' : `до ${fmt(val)} ₽`;
  const pct = (v / max) * 100;
  return (
    <div className={cx(s.root, className)}>
      <div className={s.track} style={showValue ? undefined : { paddingTop: 0 }}>
        {showValue && <span className={cx('ds-caption', s.bubble)} style={{ left: `calc(${pct}% + ${10 - (pct / 100) * 20}px)` }}>{label}</span>}
        <input type="range" className={s.range} min={0} max={max} step={1} value={v} aria-label="Стоимость" aria-valuetext={label}
          style={{ '--p': `${pct}%` } as CSSProperties}
          onChange={(e) => { const n = Number(e.target.value); setV(n); onChange?.(values[n]); }} />
      </div>
      <div className={s.labels}>
        {[...marks.map(fmt), '∞'].map((l, i) => (
          <button key={l} type="button" className={cx('ds-body', s.mark)} onClick={() => { const n = i * stepsBetween; setV(n); onChange?.(values[n]); }}>{l}</button>
        ))}
      </div>
    </div>
  );
}
