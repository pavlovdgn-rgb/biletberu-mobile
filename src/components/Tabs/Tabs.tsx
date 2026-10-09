import { useState } from 'react';
import { cx } from '../_lib/cx';

export interface TabsProps { tabs?: string[]; active?: number; onChange?: (i: number) => void; className?: string }

/** Tabs — сегментный переключатель вкладок («План дня / Карта»). Figma: `132:18119`. */
export function Tabs({ tabs = ['План дня', 'Карта'], active = 0, onChange, className }: TabsProps) {
  const [cur, setCur] = useState(active);
  return (
    <div role="tablist" className={className} style={{ display: 'flex', gap: 'var(--spacing-xs)', overflowX: 'auto', scrollbarWidth: 'none', width: '100%', padding: 'var(--spacing-xs)',
      borderRadius: 'var(--radius-md)', background: 'var(--color-background-base)' }}>
      {tabs.map((t, i) => {
        const on = i === cur;
        return (
          <button key={t} role="tab" aria-selected={on} type="button" className={cx('ds-price')} onClick={() => { setCur(i); onChange?.(i); }}
            // вкладки равной ширины на всю строку (как в Figma после выравнивания, 4 × 85 px)
            style={{ flex: '1 1 0', minWidth: 0, whiteSpace: 'nowrap', minHeight: 36, padding: 'var(--spacing-md) var(--spacing-md)', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-lg)',
              background: on ? 'var(--color-base-white)' : 'transparent', boxShadow: on ? 'var(--shadow-md)' : 'none',
              color: on ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              transition: 'background-color var(--motion-duration) var(--motion-ease), box-shadow var(--motion-duration) var(--motion-ease), color var(--motion-duration) var(--motion-ease)' }}>{t}</button>
        );
      })}
    </div>
  );
}
