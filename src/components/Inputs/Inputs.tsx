import { useId, useState, type InputHTMLAttributes } from 'react';
import { cx } from '../_lib/cx';
import s from './Inputs.module.css';

export interface InputsProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** State: Default — пусто (подпись внутри поля), DefaultFilled — заполнено, PressedFilled — в фокусе, Error, Disabled. Подпись «всплывает» живьём при вводе. */
  state?: 'Default' | 'DefaultFilled' | 'PressedFilled' | 'Error' | 'Disabled';
  /** Icon: в ките только No. */
  icon?: 'No';
  /** Подпись поля. */
  label?: string;
  /** Текст ошибки для State=Error. */
  message?: string;
}

/** Inputs — поле ввода формы (персональные данные заказа). Figma: `132:17170`. */
export function Inputs({ state = 'DefaultFilled', label = 'Фамилия', message = 'Заполните поле', className, defaultValue, value, onChange, onFocus, onBlur, ...rest }: InputsProps) {
  const id = useId();
  const [inner, setInner] = useState(String(defaultValue ?? (state === 'Default' ? '' : 'Иванов')));
  const [focus, setFocus] = useState(false);
  const val = value !== undefined ? String(value) : inner;
  const floated = val !== '' || focus;
  const shown = state === 'Default' ? (focus ? 'PressedFilled' : val ? 'DefaultFilled' : 'Default') : state;
  return (
    <div className={cx(s.root, s[shown], className)}>
      <label className={s.box} htmlFor={id}>
        <span className={cx(floated ? 'ds-caption' : 'ds-body', s.label)}>{label}</span>
        <input id={id} className={cx('ds-body', s.input, !floated && s.hidden)} disabled={state === 'Disabled'} aria-invalid={state === 'Error'} value={val}
          onChange={(e) => { setInner(e.target.value); onChange?.(e); }} onFocus={(e) => { setFocus(true); onFocus?.(e); }} onBlur={(e) => { setFocus(false); onBlur?.(e); }} {...rest} />
      </label>
      {state === 'Error' && <span className={cx('ds-caption', s.message)}>{message}</span>}
    </div>
  );
}
