import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../_lib/cx';
import s from './ButtonTag.module.css';

export interface ButtonTagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Legend: Yes — с цветной точкой (ценовая категория на схеме зала). */
  legend?: 'No' | 'Yes';
  /** Status: No active | Active (выбран). */
  status?: 'No active' | 'Active';
  /** Цвет точки легенды — CSS-переменная токена. */
  legendColor?: string;
  children?: ReactNode;
}

/** Button-Tag — тег-фильтр: категории, чипсы. Figma: `132:17137`. */
export function ButtonTag({ legend = 'No', status = 'No active', legendColor = 'var(--color-primary-orange)', children = 'Экскурсии', className, ...rest }: ButtonTagProps) {
  const active = status === 'Active';
  return (
    <button type="button" aria-pressed={active} className={cx(s.root, active && s.active, legend === 'Yes' && !active && s.legend, className)} {...rest}>
      {legend === 'Yes' && <span className={s.dot} style={{ background: legendColor }} />}
      <span className={legend === 'Yes' ? 'ds-note' : 'ds-body'}>{children}</span>
    </button>
  );
}
