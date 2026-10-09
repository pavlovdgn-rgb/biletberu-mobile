import { ButtonIcon } from '../ButtonIcon';

export interface ActionMenuProps {
  /** Text: Yes — с заголовком и счётчиком (сторис, фото отзыва), No — только кнопки. */
  text?: 'No' | 'Yes';
  title?: string;
  counter?: string;
  liked?: boolean;
  onBack?: () => void;
  onShare?: () => void;
  onLike?: () => void;
  className?: string;
}

/** Action menu — строка действий поверх контента: назад/закрыть, избранное, поделиться. Figma: `132:18196`. */
export function ActionMenu({ text = 'No', title = 'Выходные без телефона', counter = '1/4', liked, onBack, onShare, onLike, className }: ActionMenuProps) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', width: '100%', minHeight: 36, padding: '0 var(--spacing-2xl)' }}>
      <ButtonIcon icon={text === 'Yes' ? '24px-close' : 'chevron-left'} label="Назад" onClick={onBack} />
      {text === 'Yes' && (
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="ds-heading-h3" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{title}</span>
          <span className="ds-caption">{counter}</span>
        </span>
      )}
      <span style={{ display: 'flex', gap: 'var(--spacing-2xl)' }}>
        <ButtonIcon icon="upload" label="Поделиться" onClick={onShare} />
        <ButtonIcon icon={liked ? 'heart-rounded-fill' : 'heart-rounded'} state={liked ? 'Active' : 'Default'} label="В избранное" onClick={onLike} />
      </span>
    </div>
  );
}
