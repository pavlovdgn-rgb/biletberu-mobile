import { cx } from '../_lib/cx';

export interface PriceTagProps {
  children?: string;
  /** accent — оранжевый бейдж скидки (как в ките); neutral — серая цена (оверрайд в Location_card). */
  tone?: 'accent' | 'neutral';
  className?: string;
}

/** Price tag — бейдж скидки или цены «-20%». Figma: `132:17586`. */
export function PriceTag({ children = '-20%', tone = 'accent', className }: PriceTagProps) {
  const accent = tone === 'accent';
  return (
    <span className={cx('ds-caption', className)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap',
      padding: accent ? 'var(--spacing-2xs) var(--spacing-xs)' : 'var(--spacing-2xs) var(--spacing-md)', borderRadius: 'var(--radius-sm)',
      background: accent ? 'var(--color-primary-orange)' : 'var(--color-background-disabled)',
      color: accent ? 'var(--color-static-white)' : 'var(--color-text-primary)' }}>{children}</span>
  );
}
