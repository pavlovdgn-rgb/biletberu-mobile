import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../_lib/cx';
import { Icon, type IconName } from '../Icon';
import s from './ButtonIcon.module.css';

export interface ButtonIconProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** State: Default | Disabled | Active (выбрано, например избранное). */
  state?: 'Default' | 'Disabled' | 'Active';
  /** Fill: Color — серая подложка, transparent — белая (внутри белых панелей), White — белая с тенью `Shadow/sm` поверх карты или фото. */
  fill?: 'Color' | 'transparent' | 'White';
  /** Size: L — 36 px, M — 32 px (круглая, закрыть модалку). */
  size?: 'L' | 'M';
  /** Иконка из набора 20px. */
  icon?: IconName;
  /** Оранжевая подложка 10% + оранжевая иконка («+» в Location_card, токен `color/primary/orange-10`). */
  accent?: boolean;
  /** Подпись для скринридера. */
  label?: string;
}

/** Button icon — круглая кнопка-иконка: назад, избранное, поделиться, закрыть. Figma: `132:17124`. */
export function ButtonIcon({ state = 'Default', fill = 'Color', size = 'L', icon, accent, label = 'Действие', className, ...rest }: ButtonIconProps) {
  const name: IconName = icon ?? (state === 'Active' ? 'heart-rounded-fill' : size === 'M' ? 'x-close' : 'chevron-left');
  return (
    <button type="button" aria-label={label} disabled={state === 'Disabled'}
      className={cx(s.root, s[fill], s[size], s[state], accent && s.accent, className)} {...rest}>
      <Icon name={name} size={20} />
    </button>
  );
}
