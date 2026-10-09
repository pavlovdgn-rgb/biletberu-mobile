import { useState } from 'react';
import { Button, ButtonIcon, ButtonTag, HomeIndicator, Search, TextButtons } from '../../components';
import { EmptyState } from '../_shell/app';
import { BottomSheet } from '../_shell/BottomSheet';

/** Полные списки тегов фильтра — показываются в шторке по «Все». Первые в списке — те, что видны на экране фильтров. */
export const ALL_KINDS = ['Концерт', 'Экскурсия', 'Лекция', 'Шоу', 'Цирк', 'Выставка', 'Театр', 'Семинар', 'Музеи',
  'Балет', 'Опера', 'Мюзикл', 'Стендап', 'Иммерсивный театр', 'Детский спектакль', 'Джаз', 'Классическая музыка', 'Рок', 'Электронная музыка',
  'Фестиваль', 'Кинопоказ', 'Мастер-класс', 'Квест', 'Спорт', 'Ярмарка'];
export const ALL_VENUES = ['Русский музей', 'Мариинский театр', 'Спас на Крови', 'Капелла', 'Эрмитаж',
  'Театр новой комедии', 'Александринский театр', 'БДТ им. Товстоногова', 'Михайловский театр', 'Филармония', 'Новая Голландия',
  'Дом культуры «Невский»', 'Купол «Звезда»', 'Музей Фаберже', 'Манеж'];

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');

/** Шторка «Все теги»: поиск, множественный выбор, «Сбросить» и «Применить (N)». Выбор — черновик до «Применить». */
export function TagSheet({ title, items, value, onApply, onClose }: { title: string; items: string[]; value: string[]; onApply: (v: string[]) => void; onClose: () => void }) {
  const [sel, setSel] = useState<string[]>(value);
  const [q, setQ] = useState('');
  const list = items.filter((t) => norm(t).includes(norm(q.trim())));
  const flip = (t: string) => setSel(sel.includes(t) ? sel.filter((x) => x !== t) : [...sel, t]);
  return (
    <BottomSheet label={title} style={{ top: 123 }} onClose={onClose}>{(close) => (<>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 5px' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-md)' }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span className="ds-heading-h2">{title}</span>
            <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{sel.length ? `Выбрано: ${sel.length}` : 'Выберите один или несколько'}</span>
          </span>
          <ButtonIcon size="M" icon="x-close" label="Закрыть" onClick={() => close()} />
        </div>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-2xl) var(--spacing-xl)' }}>
          <Search value={q} placeholder="Найти" onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 var(--spacing-2xl) 120px' }}>
          {list.length
            ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>{list.map((t) => <ButtonTag key={t} status={sel.includes(t) ? 'Active' : 'No active'} onClick={() => flip(t)}>{t}</ButtonTag>)}</div>
            : <EmptyState title="Ничего не найдено" text="Попробуйте другое слово" />}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-5xl)', padding: 'var(--spacing-xl) var(--spacing-2xl)' }}>
            <TextButtons fill="No" disabled={!sel.length} onClick={() => setSel([])}>Сбросить</TextButtons>
            <Button onClick={() => close(() => onApply(sel))}>{sel.length ? `Применить (${sel.length})` : 'Применить'}</Button>
          </div>
          <HomeIndicator />
        </div>
      </>)}</BottomSheet>
  );
}
