import type { CSSProperties } from 'react';
import { Icon } from '../Icon';

export interface MapHomePointProps {
  /** Radius: Yes — радиус пешей доступности вокруг площадки. */
  radius?: 'No' | 'Yes';
  distance?: string;
  style?: CSSProperties;
  className?: string;
}

/** Map home point — площадка события на карте («дом»), с радиусом или без. Figma: `146:5286`. */
export function MapHomePoint({ radius = 'Yes', distance = '1 км', style, className }: MapHomePointProps) {
  const pin = (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 'var(--radius-pill)',
      background: 'var(--color-text-primary)', color: 'var(--color-base-white)', boxShadow: 'var(--shadow-md)' }}><Icon name="home-fill" size={20} /></span>
  );
  if (radius === 'No') return <span className={className} style={style}>{pin}</span>;
  return (
    <span className={className} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 178, height: 178, borderRadius: '50%',
      background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary-orange) 6%, transparent) 0%, color-mix(in srgb, var(--color-primary-orange) 20%, transparent) 100%)', ...style }}>
      {pin}
      <span className="ds-caption" style={{ position: 'absolute', top: 'var(--spacing-xl)', padding: 'var(--spacing-2xs) var(--spacing-xs)', borderRadius: 'var(--radius-pill)', background: 'var(--color-text-primary)', color: 'var(--color-base-white)' }}>{distance}</span>
    </span>
  );
}
