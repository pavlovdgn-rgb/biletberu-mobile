import { useState } from 'react';
import { Button, ButtonIcon, Numb } from '../../components';
import { BottomSheet } from '../_shell/BottomSheet';
import { TODAY } from '../../data/store';

const MONTHS = [{ name: 'Апрель', gen: 'апреля', y: 2026, m: 3 }, { name: 'Май', gen: 'мая', y: 2026, m: 4 }];
const WD = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
/** «2026-04-25» → «25 апреля». */
export const dateLabel = (v: string) => { const [, m, d] = v.split('-').map(Number); return `${d} ${MONTHS.find((x) => x.m === m - 1)?.gen ?? ''}`; };

/** Шторка выбора даты для фильтра: месяц сеткой из ячеек `numb` (выходные красным, прошедшие дни недоступны). */
export function CalendarSheet({ value, onApply, onClose, ticketDays = [], actionLabel = (v) => `Выбрать ${dateLabel(v)}` }: { value: string | null; onApply: (v: string) => void; onClose: () => void;
  /** Дни с купленными билетами (ISO) — фиолетовая отметка под ячейкой. */ ticketDays?: string[]; /** Подпись кнопки для выбранного дня. */ actionLabel?: (v: string) => string }) {
  const [mi, setMi] = useState(value && value.slice(5, 7) === '05' ? 1 : 0);
  const [sel, setSel] = useState<string | null>(value && /^\d{4}-/.test(value) ? value : null);
  const M = MONTHS[mi];
  const first = (new Date(M.y, M.m, 1).getDay() + 6) % 7;
  const days = new Date(M.y, M.m + 1, 0).getDate();
  const cells: Array<number | null> = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <BottomSheet label="Выбор даты" style={{ gap: 'var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-2xl) var(--spacing-5xl)' }} onClose={onClose}>{(close) => (<>
        <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="ds-heading-h2">Выберите дату</span>
          <ButtonIcon size="M" icon="x-close" label="Закрыть" onClick={() => close()} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ButtonIcon size="M" fill="transparent" icon="chevron-left" label="Предыдущий месяц" state={mi === 0 ? 'Disabled' : 'Default'} onClick={() => setMi(0)} />
          <span className="ds-subtitle">{M.name} {M.y}</span>
          <ButtonIcon size="M" fill="transparent" icon="chevron-right" label="Следующий месяц" state={mi === MONTHS.length - 1 ? 'Disabled' : 'Default'} onClick={() => setMi(1)} />
        </div>
        <div role="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 42px)', justifyContent: 'space-between', rowGap: 'var(--spacing-md)' }}>
          {cells.map((d, n) => {
            if (!d) return <span key={`e${n}`} />;
            const v = iso(M.y, M.m, d); const wd = WD[n % 7]; const past = v < TODAY;
            return <Numb key={v} day={d} weekday={wd} weekend={n % 7 >= 5 ? 'Yes' : 'No'} state={sel === v ? 'Active' : 'Default'} ticket={ticketDays.includes(v) ? 'Yes' : 'No'} disabled={past}
              style={past ? { opacity: 0.35, cursor: 'default' } : undefined} onClick={() => setSel(v)} aria-label={`${d} ${M.gen}`} />;
          })}
        </div>
        <Button state={sel ? 'Default' : 'Disabled'} disabled={!sel} onClick={() => sel && close(() => onApply(sel))}>{sel ? actionLabel(sel) : 'Выберите день'}</Button>
      </>)}</BottomSheet>
  );
}
