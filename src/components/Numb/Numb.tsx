import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../_lib/cx';
import { Icon } from '../Icon';
import s from './Numb.module.css';

export interface NumbProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** State: Default | Active (выбранная дата). */
  state?: 'Default' | 'Active';
  /** Weekend: Yes — выходной, красный текст. */
  weekend?: 'No' | 'Yes';
  /** Ticket: Yes — на дату куплен билет (иконка билета `color/accent/violet` под плашкой, вне её). */
  ticket?: 'No' | 'Yes';
  day?: number | string;
  weekday?: string;
  /** Компактная ячейка ленты Datepicker (42×60). */
  compact?: boolean;
}

/** numb — ячейка даты в ленте календаря. Figma: `132:17296`. */
export function Numb({ state = 'Default', weekend = 'No', ticket = 'No', day = 1, weekday = 'вс', compact, className, ...rest }: NumbProps) {
  return (
    <button type="button" aria-pressed={state === 'Active'} className={cx(s.root, s[state], weekend === 'Yes' && s.weekend, compact && s.compact, className)} {...rest}>
      <span className={cx('ds-heading-h2', s.day)}>{day}</span>
      <span className={cx('ds-caption', s.wd)}>{weekday}</span>
      {ticket === 'Yes' && <Icon name="ticket-fill" size={12} className={s.ticket} label="Есть билет" />}
    </button>
  );
}
