import type { InputHTMLAttributes, Ref } from 'react';
import { cx } from '../_lib/cx';
import { Icon } from '../Icon';
import s from './Search.module.css';

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** State: Default | Disabled | Active (введён текст, видна кнопка очистки). */
  state?: 'Default' | 'Disabled' | 'Active';
  onClear?: () => void;
  /** Ссылка на поле (фокус при открытии экрана поиска). */
  ref?: Ref<HTMLInputElement>;
}

/** Search — поле поиска событий. Figma: `132:17155`. */
export function Search({ state = 'Default', placeholder = 'Название события', onClear, className, ref, style, ...rest }: SearchProps) {
  return (
    <label className={cx(s.root, s[state], className)} style={style}>
      <Icon name="search" size={20} />
      <input className={cx('ds-body', s.input)} placeholder={placeholder} disabled={state === 'Disabled'} ref={ref} {...rest} />
      {state === 'Active' && (
        <button type="button" className={s.clear} aria-label="Очистить" onClick={onClear}><Icon name="x-close" size={20} /></button>
      )}
    </label>
  );
}
