import { ButtonIcon } from '../ButtonIcon';
import { Button } from '../Button';
import { TextButtons } from '../TextButtons';

export interface ModalConfirmationProps {
  title?: string;
  subtitle?: string;
  option?: string;
  actionLabel?: string;
  linkLabel?: string;
  /** Шеврон у ссылки снизу: Yes | No. */
  linkIcon?: 'Yes' | 'No';
  onClose?: () => void;
  onConfirm?: () => void;
  onLink?: () => void;
  className?: string;
}

/** Modal-confirmation — модалка подтверждения выбора (тариф места на схеме зала). Figma: `132:18134`. */
export function ModalConfirmation({ title = 'Выберите тариф', subtitle = '14 ряд, 2 место', option = 'Базовый', actionLabel = '2 500 ₽',
  linkLabel = 'Другие тарифы', linkIcon = 'Yes', onClose, onConfirm, onLink, className }: ModalConfirmationProps) {
  return (
    <div role="dialog" aria-label={title} className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-5xl)', width: 333,
      padding: 'var(--spacing-5xl) var(--spacing-3xl) var(--spacing-4xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4xl)', width: '100%' }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          <span className="ds-heading-h3">{title}</span>
          <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</span>
          <ButtonIcon size="M" icon="x-close" label="Закрыть" onClick={onClose} style={{ position: 'absolute', top: -8, right: 0 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-4xl)' }}>
          <span className="ds-heading-h1">{option}</span>
          <Button size="Sm" style={{ width: 175 }} onClick={onConfirm}>{actionLabel}</Button>
        </div>
      </div>
      <TextButtons fill="No" iconRight={linkIcon} onClick={onLink}>{linkLabel}</TextButtons>
    </div>
  );
}
