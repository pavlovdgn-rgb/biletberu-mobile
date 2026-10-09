import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, Card, HomeIndicator, Radio, StatusBar, TextButtons, TitlePage } from '../../components';
import { BottomSheet } from '../_shell/BottomSheet';
import { photos } from '../../assets/photos';
import { eventById, eventsWord, rub, whenLabel, type EventItem } from '../../data/mock';
import { personById, venueById } from '../../data/people';
import { useStore } from '../../data/store';
import { EmptyState, NavBar, useBack } from '../_shell/app';
import { Screen } from '../_shell/Screen';

type SortId = 'near' | 'far' | 'cheap' | 'rating' | 'title';
const when = (e: EventItem) => e.dateISO + e.time;
const SORTS: Array<{ id: SortId; label: string; hint: string; fn: (a: EventItem, b: EventItem) => number }> = [
  { id: 'near', label: 'Сначала ближайшие', hint: 'по дате мероприятия', fn: (a, b) => when(a).localeCompare(when(b)) },
  { id: 'far', label: 'Сначала дальние', hint: 'по дате мероприятия', fn: (a, b) => when(b).localeCompare(when(a)) },
  { id: 'cheap', label: 'Сначала дешевле', hint: 'по цене билета', fn: (a, b) => a.priceFrom - b.priceFrom },
  { id: 'rating', label: 'По рейтингу', hint: 'сначала с высокой оценкой', fn: (a, b) => Number(b.rating || 0) - Number(a.rating || 0) },
  { id: 'title', label: 'По названию', hint: 'от А до Я', fn: (a, b) => a.title.localeCompare(b.title, 'ru') },
];
/** Шторка сортировки афиши — как в «Моих билетах» (радио + «Применить»). */
function SortSheet({ value, onApply, onClose }: { value: SortId; onApply: (s: SortId) => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  return (
    <BottomSheet label="Сортировка" style={{ padding: 'var(--spacing-sm) var(--spacing-2xl) var(--spacing-5xl)' }} onClose={onClose}>{(close) => (<>
      <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
      <span className="ds-heading-h2" style={{ padding: 'var(--spacing-2xl) 0 var(--spacing-md)' }}>Сортировка</span>
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

/** Filter_result 3/4 (Figma `185:17924`, `185:18677`) — `/events?venue=` или `/events?person=`: вся афиша площадки или персоны списком.
 *  Открывается по «Все» на странице площадки или персоны; ближайшие — первыми. */
export function EventsList() {
  const nav = useNavigate();
  const back = useBack('/main');
  const [params] = useSearchParams();
  const { state, toggleFavourite, toast } = useStore();
  const v = venueById(params.get('venue')), p = personById(params.get('person'));
  const title = v?.name ?? p?.name ?? 'Афиша';
  const [sort, setSort] = useState<SortId>('near');
  const [sheet, setSheet] = useState(false);
  const list = (v?.events ?? p?.events ?? []).map(eventById).filter((e): e is EventItem => !!e).sort(SORTS.find((x) => x.id === sort)!.fn);
  const like = (e: EventItem) => { const on = toggleFavourite(e.id); toast(on ? 'Добавлено в избранное' : 'Удалено из избранного', on ? 'success' : 'info'); };
  return (
    <Screen bg="var(--color-base-white)" header={<div className="bb-surface-head"><StatusBar /><TitlePage title={title} iconLeft="Yes" onLeft={back} /></div>}
      overlay={sheet && <SortSheet value={sort} onApply={setSort} onClose={() => setSheet(false)} />}
      footer={<div><NavBar active={0} /><HomeIndicator /></div>}>
      {list.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-2xl) var(--spacing-2xl)' }}>
          {/* сортировка с подписью — как в «Моих билетах» */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
            <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{eventsWord(list.length)}</span>
            <TextButtons fill="No" iconLeft="Yes" iconLeftName="sort" onClick={() => setSheet(true)}>{SORTS.find((x) => x.id === sort)!.label}</TextButtons>
          </div>
          {list.map((e) => <Card key={e.id} style="Horizontal" age={e.age} title={e.title} date={whenLabel(e).replace(',', '')} place={`${e.address},`} price={`от ${rub(e.priceFrom).replace(' ₽', '₽')}`}
            discount={e.discount ?? ''} rating={e.rating} image={photos[e.image]} liked={state.favourites.includes(e.id)} onLikeChange={() => like(e)} onClick={() => nav(`/event?id=${e.id}`)} />)}
        </div>
      ) : <EmptyState icon="calendar" title="Пока нет событий" text="Новые даты появятся здесь" />}
    </Screen>
  );
}
