import { Icon } from '../Icon';
import { Toggle } from '../Toggle';

export interface PaymentMethodProps {
  /** Type: Default — строка (промокод), Bonus — списание баллов с переключателем. */
  type?: 'Default' | 'Bonus';
  label?: string;
  points?: string;
  description?: string;
  /** Bonus: баллы списываются (переключатель). */
  active?: boolean;
  /** Bonus: переключили списание баллов. */
  onToggle?: (on: boolean) => void;
  /** Default: нажали строку. */
  onClick?: () => void;
  className?: string;
}

/** Payment method — строка способа оплаты / промокода / бонусов. Figma: `132:18284`. */
export function PaymentMethod({ type = 'Default', label, points = '100', description = 'Баллов можно списать за этот заказ', active = false, onToggle, onClick, className }: PaymentMethodProps) {
  const box = { display: 'flex', flexDirection: 'column' as const, gap: 'var(--spacing-sm)', width: '100%', padding: 'var(--spacing-2xl)',
    borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-background-disabled)', background: 'transparent' };
  if (type === 'Bonus') {
    return (
      <div className={className} style={box}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="ds-note">{label ?? 'Списать баллы'}</span><Toggle key={String(active)} state={active ? 'Active' : 'Disabled'} label="Списать баллы" onChange={onToggle} />
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <span className="ds-caption" style={{ padding: 'var(--spacing-2xs) var(--spacing-md)', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-orange)', color: 'var(--color-static-white)' }}>{points}</span>
          <span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>{description}</span>
        </span>
      </div>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} style={{ ...box, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
      <span className="ds-note">{label ?? 'Применить промокод'}</span><Icon name="plus" size={20} />
    </button>
  );
}
