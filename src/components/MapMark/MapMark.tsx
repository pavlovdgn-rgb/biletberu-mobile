import type { CSSProperties } from 'react';

/** Map mark — отметка выбранного места на схеме зала. Цвета иллюстрационные (в ДС не токенизированы). Figma: `160:30315`. */
export function MapMark({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, ...style }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%',
        background: 'var(--illustration-map-mark)', boxShadow: '0 0 0 9px var(--illustration-map-mark-halo)' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--illustration-map-mark-halo)' }} />
      </span>
    </span>
  );
}
