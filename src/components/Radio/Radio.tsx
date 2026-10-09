import { cx } from '../_lib/cx';
import s from './Radio.module.css';

export interface RadioProps {
  /** State: Active (выбрано) | Default. */
  state?: 'Active' | 'Default';
  onClick?: () => void;
  label?: string;
  className?: string;
}

/** Radio — радиокнопка (способ оплаты). Figma: `132:17410`. */
export function Radio({ state = 'Active', onClick, label = 'Вариант', className }: RadioProps) {
  return <button type="button" role="radio" aria-checked={state === 'Active'} aria-label={label} onClick={onClick} className={cx(s.root, state === 'Active' && s.Active, className)} />;
}
