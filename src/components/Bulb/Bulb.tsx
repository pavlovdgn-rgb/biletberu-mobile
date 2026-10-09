import { cx } from '../_lib/cx';

export interface BulbProps {
  /** Color: Gray | Orange. */
  color?: 'Gray' | 'Orange';
  /** Size: Lg 32 · M 24 · Sm 16. */
  size?: 'Lg' | 'M' | 'Sm';
  children?: string | number;
  className?: string;
  style?: import('react').CSSProperties;
}

/** bulb — кружок с номером: порядок точки в плане дня, метка на карте. Figma: `132:17601`. */
export function Bulb({ color = 'Gray', size = 'Lg', children = 1, className, style }: BulbProps) {
  const d = size === 'Lg' ? 32 : size === 'M' ? 24 : 16;
  const ts = size === 'Lg' ? 'ds-heading-h2' : size === 'M' ? 'ds-caption' : 'ds-tiny';
  return (
    <span className={cx(ts, className)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: d, height: d, flexShrink: 0,
      borderRadius: 'var(--radius-2xl)', background: color === 'Orange' ? 'var(--color-primary-orange)' : 'var(--color-background-disabled)',
      color: color === 'Orange' ? 'var(--color-static-white)' : 'var(--color-text-primary)', ...style }}>{children}</span>
  );
}
