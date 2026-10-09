import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../_lib/cx';
import { Icon, type IconName } from '../Icon';
import { Spinner } from '../Spinner';
import s from './Button.module.css';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  /** Type: Primary — главное действие экрана («Купить билет»), Secondary, Tertiary — второстепенные. */
  type?: 'Primary' | 'Secondary' | 'Tertiary';
  /** Size: Lg — 52 px, Sm — 36 px. */
  size?: 'Lg' | 'Sm';
  /** State: Disabled — недоступна. Hover/pressed — нативно. */
  state?: 'Default' | 'Disabled';
  /** Content: None — только текст, Icon — текст + иконка справа, Loader — текст + спиннер. */
  content?: 'None' | 'Icon' | 'Loader';
  /** Подпись кнопки. */
  children?: ReactNode;
  /** Вторая строка (цена «от 1000 ₽»), в Figma скрыта по умолчанию. */
  subtitle?: ReactNode;
  /** Иконка для Content=Icon (по умолчанию chevron-right). */
  icon?: IconName;
  htmlType?: 'button' | 'submit' | 'reset';
}

/** Button — основная кнопка. Figma: `132:16869`. */
export function Button({ type = 'Primary', size = 'Lg', state = 'Default', content = 'None', children = 'Сохранить', subtitle, icon = 'chevron-right', htmlType = 'button', className, ...rest }: ButtonProps) {
  const disabled = state === 'Disabled';
  const iconColor = type === 'Primary' ? (disabled ? 'Dark' : 'Light') : 'Dark';
  return (
    <button
      type={htmlType}
      disabled={disabled}
      className={cx(s.root, s[type], s[size], disabled && s.Disabled, content === 'Icon' && s.withIcon, className)}
      {...rest}
    >
      <span className={s.container}>
        <span className={size === 'Lg' ? 'ds-heading-h3' : 'ds-price'}>{children}</span>
        {subtitle && <span className={cx('ds-subtitle', s.sub)}>{subtitle}</span>}
        {content === 'Icon' && <Icon name={icon} size={size === 'Lg' ? 24 : 16} />}
        {content === 'Loader' && <Spinner size={size === 'Lg' ? 24 : 16} color={iconColor} />}
      </span>
    </button>
  );
}
