import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../_lib/cx';
import { Icon } from '../Icon';
import s from './Select.module.css';

export interface SelectProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** State: Default (плейсхолдер) | PressedFilled (открыт, выбрано) | Disabled | Error. */
  state?: 'Default' | 'PressedFilled' | 'Disabled' | 'Error';
  /** Icon: Yes — иконка слева. */
  icon?: 'No' | 'Yes';
  placeholder?: string;
  value?: string;
  message?: string;
}

/** Select — выпадающий выбор (документ, город). Figma: `132:17203`. */
export function Select({ state = 'Default', icon = 'No', placeholder = 'Документ', value = 'Паспорт РФ', message = 'Выберите значение', className, ...rest }: SelectProps) {
  return (
    <div className={cx(s.root, s[state], className)}>
      <button type="button" className={s.box} disabled={state === 'Disabled'} aria-expanded={state === 'PressedFilled'} {...rest}>
        {icon === 'Yes' && <Icon name="settings" size={20} />}
        <span className={cx('ds-body', s.text)}>{state === 'Default' ? placeholder : value}</span>
        <Icon name="chevron-down" size={20} className={s.chevron} />
      </button>
      {state === 'Error' && <span className={cx('ds-caption', s.message)}>{message}</span>}
    </div>
  );
}
