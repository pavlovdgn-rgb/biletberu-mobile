import type { ReactNode } from 'react';
import { cx } from '../_lib/cx';

/** Age badge — светлая плашка на `color/background/overlay`: возраст «12+» (sm) или дата события (lg, как на экране заказа). Figma: `132:17595`. */
export function AgeBadge({ size = 'sm', children = '12+', className }: { size?: 'sm' | 'lg'; children?: ReactNode; className?: string }) {
  const lg = size === 'lg';
  return (
    <span className={cx(lg ? 'ds-note' : 'ds-tiny-regular', className)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap',
      padding: lg ? 'var(--spacing-2xs) var(--spacing-xs)' : '0 var(--spacing-2xs)', borderRadius: lg ? 'var(--radius-sm)' : 'var(--radius-xs)',
      background: 'var(--color-background-overlay)', color: 'var(--color-text-primary)' }}>{children}</span>
  );
}
