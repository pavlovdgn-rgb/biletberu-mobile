import { cx } from '../_lib/cx';
import { Icon } from '../Icon';

export interface RateProps {
  /** Size: Lg — звезда 16 + Note; Sm — звезда 12 + Caption. */
  size?: 'Lg' | 'Sm';
  value?: string;
  /** На тёмной подложке (поверх фото в Card) — белый текст на `color/text/primary`. */
  onDark?: boolean;
  className?: string;
}

/** Rate — рейтинг со звездой «★ 4.5». Figma: `132:17588`. */
export function Rate({ size = 'Lg', value = '4.5', onDark, className }: RateProps) {
  const lg = size === 'Lg';
  return (
    <span className={cx(lg ? 'ds-note' : 'ds-caption', className)} style={{ display: 'inline-flex', alignItems: 'center', gap: lg ? 'var(--spacing-sm)' : 'var(--spacing-xs)',
      padding: onDark ? (lg ? 'var(--spacing-2xs) var(--spacing-xs)' : 'var(--spacing-2xs) var(--spacing-xs) var(--spacing-2xs) var(--spacing-xs)') : 'var(--spacing-2xs) var(--spacing-xs) var(--spacing-2xs) 0',
      borderRadius: 'var(--radius-sm)', background: onDark ? 'var(--color-static-black)' : 'transparent',
      color: onDark ? 'var(--color-static-white)' : 'var(--color-text-primary)' }}>
      <Icon name="star-fill-small" size={lg ? 16 : 12} style={{ color: 'var(--color-primary-orange)' }} />{value}
    </span>
  );
}
