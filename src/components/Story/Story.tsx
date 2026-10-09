import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../_lib/cx';
import s from './Story.module.css';

export interface StoryProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** State: Default — просмотрена, Active — новая (оранжевая обводка). */
  state?: 'Default' | 'Active';
  title?: string;
  src?: string;
}

/** Story — карточка сторис на главной. Figma: `132:17951`. */
export function Story({ state = 'Default', title = 'ТОП-выходные', src, className, ...rest }: StoryProps) {
  return (
    <button type="button" className={cx(s.root, s[state], className)} {...rest}>
      {src && <img className={s.img} src={src} alt="" />}
      <span className={cx('ds-note', s.text)}>{title}</span>
    </button>
  );
}
