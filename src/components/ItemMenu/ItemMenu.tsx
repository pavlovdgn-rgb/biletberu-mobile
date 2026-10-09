import { cx } from '../_lib/cx';
import { Icon, type IconName } from '../Icon';

export interface ItemMenuProps {
  /** Active: Yes — текущий раздел (оранжевый, залитая иконка). */
  active?: 'Yes' | 'No';
  label?: string;
  icon?: IconName;
  iconActive?: IconName;
  onClick?: () => void;
  className?: string;
}

/** Item_menu — пункт нижнего меню. Figma: `132:17976`. */
export function ItemMenu({ active = 'Yes', label = 'Главная', icon = 'home', iconActive = 'home-fill', onClick, className }: ItemMenuProps) {
  const on = active === 'Yes';
  return (
    <button type="button" onClick={onClick} aria-current={on ? 'page' : undefined} className={className}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: 0, background: 'transparent', padding: 0, cursor: 'pointer',
        color: on ? 'var(--color-primary-orange)' : 'var(--color-text-secondary)', transition: 'color var(--motion-duration) var(--motion-ease)' }}>
      <Icon name={on ? iconActive : icon} size={20} />
      <span className={cx('ds-tiny-regular')}>{label}</span>
    </button>
  );
}
