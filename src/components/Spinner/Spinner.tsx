import type { CSSProperties } from 'react';
import { cx } from '../_lib/cx';
import s from './Spinner.module.css';

export interface SpinnerProps {
  /** Size: 16 | 24 | 108 (как в Figma). Кадры поворота (0/30/45…-Brand) в коде заменены CSS-анимацией. */
  size?: 16 | 24 | 108;
  /** Color: Brand — оранжевый, Light — на тёмном/оранжевом фоне, Dark — на светлом. */
  color?: 'Brand' | 'Light' | 'Dark';
  className?: string;
}

/** Spinner — индикатор загрузки. Figma: `132:18231`. */
export function Spinner({ size = 24, color = 'Brand', className }: SpinnerProps) {
  const ring = size === 108 ? 10 : size === 24 ? 3 : 2;
  return (
    <span
      role="progressbar"
      aria-label="Загрузка"
      className={cx(s.root, s[color], className)}
      style={{ width: size, height: size, '--ring': `${ring}px` } as CSSProperties}
    />
  );
}
