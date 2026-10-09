import type { CSSProperties } from 'react';

/** Metro station — значок станции метро с подписью. Цвет линии — иллюстрационный (в ДС не токенизирован). Figma: `146:5298`. */
export function MetroStation({ name = 'Адмиралтейская', compact, style, className }: { name?: string; compact?: boolean; style?: CSSProperties; className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xs)', ...style }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: compact ? 24 : 36, height: compact ? 24 : 36, borderRadius: '50%',
        background: 'var(--illustration-metro-line)', color: 'var(--color-static-white)', fontWeight: 600, fontSize: compact ? 13 : 19 }}>М</span>
      <span className={compact ? 'ds-small' : 'ds-heading-h1'} style={{ color: 'var(--color-text-primary)', textShadow: '0 0 3px var(--map-label-halo), 0 0 3px var(--map-label-halo)' }}>{name}</span>
    </span>
  );
}
