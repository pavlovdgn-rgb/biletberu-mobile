import { useState } from 'react';
import { cx } from '../_lib/cx';
import s from './Toggle.module.css';

export interface ToggleProps {
  /** State: Active — включено, Disabled — выключено (в Figma так названо «выкл»). */
  state?: 'Active' | 'Disabled';
  onChange?: (on: boolean) => void;
  label?: string;
  className?: string;
}

/** Toggle — переключатель (Пушкинская карта, Со скидкой). Figma: `132:17399`. */
export function Toggle({ state = 'Active', onChange, label = 'Переключатель', className }: ToggleProps) {
  const [on, setOn] = useState(state === 'Active');
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={cx(s.root, on && s.Active, className)}
      onClick={() => { setOn(!on); onChange?.(!on); }} />
  );
}
