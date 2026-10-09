import { useState } from 'react';
import { cx } from '../_lib/cx';
import { Icon } from '../Icon';
import s from './Checkbox.module.css';

export interface CheckboxProps {
  /** Active: Yes | No. */
  active?: 'Yes' | 'No';
  onChange?: (v: boolean) => void;
  label?: string;
  className?: string;
}

/** Checkbox — флажок (согласие, выбор опции). Figma: `132:17404`. */
export function Checkbox({ active = 'Yes', onChange, label = 'Флажок', className }: CheckboxProps) {
  const [v, setV] = useState(active === 'Yes');
  return (
    <button type="button" role="checkbox" aria-checked={v} aria-label={label} className={cx(s.root, v && s.Yes, className)}
      onClick={() => { setV(!v); onChange?.(!v); }}>
      {v && <Icon name="Essentials/check" size={18} />}
    </button>
  );
}
