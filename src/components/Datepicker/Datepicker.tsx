import { useEffect, useRef, useState } from 'react';
import { cx } from '../_lib/cx';
import { Numb } from '../Numb';
import s from './Datepicker.module.css';

const WD = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export interface DatepickerProps {
  /** State: 1 — лента дат; 2 — лента с отметками купленных билетов. */
  state?: '1' | '2';
  month?: string;
  /** Число дней в ленте. */
  days?: number;
  /** День недели первого числа (0 = пн). */
  firstWeekday?: number;
  /** Дни с билетами (для State=2). */
  ticketDays?: number[];
  /** Первое число ленты. */
  startDay?: number;
  defaultSelected?: number;
  /** Выбранный день извне (например, из шторки календаря); null — ничего не выбрано. Без него лента управляет выбором сама. */
  value?: number | null;
  onSelect?: (day: number) => void;
  className?: string;
}

/** Datepicker — горизонтальная лента дат на главной. Figma: `132:17322`. */
export function Datepicker({ state = '1', month = 'АПРЕЛЬ', days = 30, firstWeekday = 2, ticketDays = [4, 11, 25], startDay = 1, defaultSelected = 1, value, onSelect, className }: DatepickerProps) {
  const [inner, setSel] = useState(defaultSelected);
  const sel = value === undefined ? inner : value;
  // выбранный извне день (из календаря) прокручиваем в видимую часть ленты
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => { if (value) row.current?.querySelector(`[data-day="${value}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }, [value]);
  return (
    <div className={cx(s.root, className)}>
      <span className={cx('ds-caption', s.month)}>{month}</span>
      <div className={cx(s.row, state === '2' && ticketDays.length > 0 && s.tickets)} role="listbox" aria-label={month} ref={row}>
        {Array.from({ length: days - startDay + 1 }, (_, i) => {
          const d = startDay + i; const wd = (firstWeekday + i) % 7;
          return (
            <Numb key={d} data-day={d} compact day={d} weekday={WD[wd]} weekend={wd >= 5 ? 'Yes' : 'No'} state={d === sel ? 'Active' : 'Default'}
              ticket={state === '2' && ticketDays.includes(d) ? 'Yes' : 'No'} onClick={() => { setSel(d); onSelect?.(d); }} />
          );
        })}
      </div>
    </div>
  );
}

const MONTHS = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'];
const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export interface DatepickerRangeProps {
  /** State: 1 — лента дат; 2 — с отметками купленных билетов. */
  state?: '1' | '2';
  /** Первый день ленты (ISO). */
  from: string;
  /** Сколько дней показать — лента идёт через границу месяцев. */
  length?: number;
  /** Выбранный день (ISO); null — ничего не выбрано. */
  value: string | null;
  onSelect?: (iso: string) => void;
  /** Дни с билетами (ISO) — для State=2. */
  ticketDates?: string[];
  className?: string;
}

/** Datepicker в режиме «от сегодня»: лента на несколько месяцев, подпись месяца меняется при прокрутке (как в макете — над лентой),
 *  выбранный день при открытии и при смене прокручивается в начало видимой части. Figma: `132:17322`. */
export function DatepickerRange({ state = '1', from, length = 60, value, onSelect, ticketDates = [], className }: DatepickerRangeProps) {
  const row = useRef<HTMLDivElement>(null);
  const dates = Array.from({ length }, (_, i) => addDays(from, i));
  const [month, setMonth] = useState(MONTHS[Number(from.slice(5, 7)) - 1]);
  const syncMonth = () => {
    const el = row.current; if (!el) return;
    // месяц — по первой видимой ячейке
    const left = el.getBoundingClientRect().left;
    const first = [...el.children].find((c) => c.getBoundingClientRect().right > left + 8) as HTMLElement | undefined;
    const iso = first?.dataset.date; if (iso) setMonth(MONTHS[Number(iso.slice(5, 7)) - 1]);
  };
  useEffect(() => {
    const el = row.current; if (!el || !value) return;
    const cell = el.querySelector<HTMLElement>(`[data-date="${value}"]`); if (!cell) return;
    const target = cell.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft - 46; // предыдущий день виден слева
    el.scrollTo({ left: Math.max(0, target), behavior: el.dataset.ready ? 'smooth' : 'auto' });
    el.dataset.ready = '1';
  }, [value]);
  return (
    <div className={cx(s.root, className)}>
      <span className={cx('ds-caption', s.month)}>{month}</span>
      <div ref={row} onScroll={syncMonth} className={cx(s.row, state === '2' && ticketDates.length > 0 && s.tickets)} role="listbox" aria-label={month}>
        {dates.map((iso) => {
          const d = new Date(`${iso}T12:00:00`), wd = (d.getDay() + 6) % 7;
          return (
            <Numb key={iso} data-date={iso} compact day={d.getDate()} weekday={WD[wd]} weekend={wd >= 5 ? 'Yes' : 'No'} state={iso === value ? 'Active' : 'Default'}
              ticket={state === '2' && ticketDates.includes(iso) ? 'Yes' : 'No'} onClick={() => onSelect?.(iso)} />
          );
        })}
      </div>
    </div>
  );
}
