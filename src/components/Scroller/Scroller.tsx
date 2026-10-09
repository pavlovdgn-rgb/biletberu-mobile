/** Scroller — полоса прокрутки (скролл-пикер даты). Figma: `132:18280`. */
export function Scroller({ height = 249, thumb = 0.98, className }: { height?: number; thumb?: number; className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-flex', width: 10, height, padding: 'var(--spacing-2xs)', borderRadius: 'var(--radius-xs)', background: 'var(--color-base-white)' }}>
      <span style={{ width: 6, height: `${thumb * 100}%`, borderRadius: 'var(--radius-xs)', background: 'var(--color-text-disabled)' }} />
    </span>
  );
}
