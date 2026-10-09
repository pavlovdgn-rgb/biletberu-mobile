import { useState } from 'react';
import { Button, Radio } from '../../components';
import { BottomSheet } from '../_shell/BottomSheet';

export type Sort = 'near' | 'far' | 'recent' | 'title' | 'venue';
export const SORTS: Array<{ id: Sort; label: string; hint: string }> = [
  { id: 'near', label: 'Сначала ближайшие', hint: 'по дате мероприятия' },
  { id: 'far', label: 'Сначала дальние', hint: 'по дате мероприятия' },
  { id: 'recent', label: 'Недавно купленные', hint: 'по дате покупки' },
  { id: 'title', label: 'По названию', hint: 'от А до Я' },
  { id: 'venue', label: 'По площадке', hint: 'театры, концертные залы, музеи' },
];

/** Tickets — sort (Figma: Screens → 9. Мои билеты, «Tickets — sort»): шторка сортировки списка билетов. */
export function SortSheet({ value, past, onApply, onClose }: { value: Sort; past: boolean; onApply: (s: Sort) => void; onClose: () => void }) {
  const [sel, setSel] = useState<Sort>(value);
  return (
    <BottomSheet label="Сортировка" style={{ padding: 'var(--spacing-sm) var(--spacing-2xl) var(--spacing-5xl)' }} onClose={onClose}>{(close) => (<>
      <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', padding: 'var(--spacing-2xl) 0 var(--spacing-md)' }}>
        <span className="ds-heading-h2">Сортировка</span>
        <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{past ? 'Прошедшие события' : 'Предстоящие события'}</span>
      </div>
      <div role="radiogroup" aria-label="Сортировка">
        {SORTS.map((s) => (
          <div key={s.id} role="presentation" onClick={() => setSel(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0', cursor: 'pointer' }}>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-subtitle">{s.label}</span><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{s.hint}</span></span>
            <Radio state={sel === s.id ? 'Active' : 'Default'} label={s.label} onClick={() => setSel(s.id)} />
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 'var(--spacing-xl)' }}><Button onClick={() => close(() => { onApply(sel); onClose(); })}>Применить</Button></div>
    </>)}</BottomSheet>
  );
}
