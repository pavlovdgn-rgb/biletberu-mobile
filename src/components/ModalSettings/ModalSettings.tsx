import type { ReactNode } from 'react';
import { Button } from '../Button';

export interface ModalSettingsProps {
  subtitle?: string;
  children?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Modal-settings — bottom sheet с настройками (параметры плана дня, фильтры). Figma: `132:18144`. */
export function ModalSettings({ subtitle = 'Суббота, 25 Апреля', children, actionLabel = 'Сохранить', onAction, className }: ModalSettingsProps) {
  return (
    <section role="dialog" className={className} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 393,
      borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', background: 'var(--color-base-white)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-sm) 0' }}>
        <span style={{ width: 37, height: 5, borderRadius: 'var(--radius-pill)', background: 'var(--color-background-placeholder)' }} />
      </div>
      <div style={{ padding: 'var(--spacing-md) var(--spacing-2xl) var(--spacing-xl)' }}>
        <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xs)' }}>{children}</div>
      <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl)' }}><Button onClick={onAction}>{actionLabel}</Button></div>
    </section>
  );
}
