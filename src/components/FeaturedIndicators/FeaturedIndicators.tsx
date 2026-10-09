export interface FeaturedIndicatorsProps {
  /** Size: Small — активная точка 6 px, Long — активная «таблетка». */
  size?: 'Small' | 'Long';
  count?: number;
  active?: number;
  className?: string;
}

/** Featured Indicators — точки-пагинация карусели баннеров. Figma: `132:17611`. */
export function FeaturedIndicators({ size = 'Long', count = 6, active = 0, className }: FeaturedIndicatorsProps) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-md)' }} aria-label={`Слайд ${active + 1} из ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ height: 6, width: i === active && size === 'Long' ? 21 : 6, borderRadius: 'var(--radius-pill)',
          background: i === active ? 'var(--color-primary-orange)' : 'var(--color-background-placeholder)',
          transition: 'width var(--motion-duration) var(--motion-ease), background-color var(--motion-duration) var(--motion-ease)' }} />
      ))}
    </span>
  );
}
