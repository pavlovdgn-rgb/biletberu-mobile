import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, Card, HomeIndicator, Image, PriceTag, StatusBar, Tabs, TextButtons, TitlePage } from '../../components';
import { photos } from '../../assets/photos';
import { type EventItem } from '../../data/mock';
import { TODAY, refundUntil, ticketEvent, useStore, type RefundedTicket, type Ticket } from '../../data/store';
import { MovedBanner } from '../refund/Refund';
import { EmptyState, NavBar } from '../_shell/app';
import { Screen } from '../_shell/Screen';
import { SORTS, SortSheet, type Sort } from './SortSheet';

/** Купленные билеты, сгруппированные по событию. `order` — когда куплено (меньше — новее: свежие заказы в начале списка). */
export type Bought = { e: EventItem; tickets: Ticket[]; /** Возвращённые билеты этого показа. */ refunded: RefundedTicket[]; order: number };

const plural = (n: number, one: string, few: string, many: string) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many; };
const MONTHS = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
const dayMs = 86400000;
const daysTo = (iso: string) => Math.round((Date.parse(`${iso}T12:00:00`) - Date.parse(`${TODAY}T12:00:00`)) / dayMs);
/** «Сегодня», «Завтра», «Через 3 дня» — для меток ближайших событий. */
export const untilLabel = (iso: string) => { const d = daysTo(iso); return d === 0 ? 'Сегодня' : d === 1 ? 'Завтра' : `Через ${d} ${plural(d, 'день', 'дня', 'дней')}`; };
/** «2 билета · Партер» — сколько и где. */
const seatsLabel = (ts: Ticket[]) => `${ts.length} ${plural(ts.length, 'билет', 'билета', 'билетов')} · ${[...new Set(ts.map((t) => t.zone))].join(', ')}`;
/** Группа в списке «Предстоящие»: сегодня, эта неделя (до воскресенья), дальше — по месяцам. */
const groupOf = (iso: string, past: boolean) => {
  const d = daysTo(iso);
  if (!past && d === 0) return 'Сегодня';
  const wd = (new Date(`${TODAY}T12:00:00`).getDay() + 6) % 7; // пн = 0
  if (!past && d <= 6 - wd) return 'На этой неделе';
  return `В ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
};

export function useBought(): Bought[] {
  const { state } = useStore();
  const map = new Map<string, Bought>();
  [...state.tickets, ...state.refunded].forEach((t, n) => {
    const e = ticketEvent(t); if (!e) return;
    const key = `${e.id}@${e.dateISO}`; // разные сеансы одного мероприятия — разные строки
    const b = map.get(key) ?? { e, tickets: [], refunded: [], order: n }; map.set(key, b);
    if ('refund' in t) b.refunded.push(t as RefundedTicket); else b.tickets.push(t);
  });
  return [...map.values()];
}

const SORT_FN: Record<Sort, (a: Bought, b: Bought) => number> = {
  near: (a, b) => (a.e.dateISO + a.e.time).localeCompare(b.e.dateISO + b.e.time),
  far: (a, b) => (b.e.dateISO + b.e.time).localeCompare(a.e.dateISO + a.e.time),
  recent: (a, b) => a.order - b.order,
  title: (a, b) => a.e.title.localeCompare(b.e.title, 'ru'),
  venue: (a, b) => a.e.place.localeCompare(b.e.place, 'ru') || (a.e.dateISO + a.e.time).localeCompare(b.e.dateISO + b.e.time),
};
/** Ближайшее событие показываем крупно, если до него не больше 3 дней. */
const HERO_DAYS = 3;

/** Мои билеты — список купленных (Figma: Screens → 9. Мои билеты, «Tickets — list»). Вкладки «Предстоящие / Прошедшие», сортировка шторкой,
 *  группы по времени; ближайшее событие (≤ 3 дней) — крупной карточкой. Тап — билеты события на весь экран (`/ticket?event=`). */
export function Tickets() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const all = useBought();
  const { state } = useStore();
  const tab = params.get('tab') === 'past' ? 1 : 0;
  const sort = (SORTS.find((s) => s.id === params.get('sort'))?.id ?? (tab ? 'far' : 'near')) as Sort;
  const [sheet, setSheet] = useState(false);
  const set = (p: Record<string, string | null>) => { const n = new URLSearchParams(params); for (const [k, v] of Object.entries(p)) { if (v === null) n.delete(k); else n.set(k, v); } setParams(n, { replace: true }); };

  const list = all.filter((b) => (tab ? b.e.dateISO < TODAY : b.e.dateISO >= TODAY)).sort(SORT_FN[sort]);
  const open = (b: Bought) => nav(`/ticket?event=${b.e.id}&date=${b.e.dateISO}`);
  const hero = !tab && sort === 'near' && list[0] && list[0].tickets.length > 0 && daysTo(list[0].e.dateISO) <= HERO_DAYS ? list[0] : null;
  const rest = hero ? list.slice(1) : list;
  // группы — только для сортировки по дате, иначе группы рвали бы порядок
  const grouped = sort === 'near' || sort === 'far';
  const count = list.reduce((n, b) => n + b.tickets.length, 0);
  const moved = tab ? [] : Object.entries(state.moved);

  const card = (b: Bought) => {
    const d = daysTo(b.e.dateISO);
    // возврат: событие остаётся в списке со статусом, пока идут деньги; частичный — пишем, сколько вернули
    const all = !b.tickets.length, r = b.refunded[0]?.refund;
    const price = all ? (tab ? 'Возвращён' : `Возврат · деньги ${refundUntil(r)}`) : `${seatsLabel(b.tickets)}${b.refunded.length ? ` · ${b.refunded.length} возвращ.` : ''}`;
    // прошедшее событие: напоминаем оценить или показываем свою оценку
    const rated = state.myReviews[b.e.id];
    const pastLabel = rated ? `Ваша оценка: ${rated.rating} из 5` : 'Оцените событие';
    return <Card key={`${b.e.id}@${b.e.dateISO}`} style="Horizontal" heart="No" rating="" age={b.e.age} title={b.e.title} date={`${b.e.date}, ${b.e.time.replace(':', '-')}`} place={b.e.address}
      price={tab && !all ? pastLabel : price} discount={!tab && !all && d <= 7 ? untilLabel(b.e.dateISO) : ''} muted={all} image={photos[b.e.image]} onClick={() => open(b)} />;
  };
  const rows: React.ReactNode[] = [];
  let last = '';
  for (const b of rest) {
    const g = grouped ? groupOf(b.e.dateISO, !!tab) : '';
    if (g && g !== last) { rows.push(<span key={`g-${g}`} className="ds-heading-h3" style={{ paddingTop: rows.length ? 'var(--spacing-md)' : 0 }}>{g}</span>); last = g; }
    rows.push(card(b));
  }

  return (
    <Screen bg="var(--color-base-white)" header={<div className="bb-surface-head"><StatusBar /><TitlePage title="Мои билеты" iconLeft="No" /></div>} footer={<div><NavBar active={3} /><HomeIndicator /></div>}
      overlay={sheet && <SortSheet value={sort} past={!!tab} onApply={(s) => set({ sort: s })} onClose={() => setSheet(false)} />}>
      {!all.length ? (
        <EmptyState icon="ticket" title="Здесь появятся ваши билеты" text="Купите билет — он сохранится в приложении и будет доступен без интернета" action="Выбрать мероприятие" onAction={() => nav('/main')} />
      ) : (<>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-2xl)' }}><Tabs tabs={['Предстоящие', 'Прошедшие']} active={tab} onChange={(i) => set({ tab: i ? 'past' : null, sort: null })} /></div>
        {!list.length ? (
          <EmptyState icon="ticket" title={tab ? 'Прошедших событий пока нет' : 'Предстоящих событий нет'} text={tab ? 'Здесь будут билеты на события, которые уже прошли' : 'Все купленные события уже прошли — загляните в афишу'}
            action={tab ? undefined : 'Выбрать мероприятие'} onAction={tab ? undefined : () => nav('/main')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-2xl) var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
              <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{list.length} {plural(list.length, 'событие', 'события', 'событий')} · {count} {plural(count, 'билет', 'билета', 'билетов')}</span>
              <TextButtons fill="No" iconLeft="Yes" iconLeftName="sort" onClick={() => setSheet(true)}>{SORTS.find((s) => s.id === sort)!.label}</TextButtons>
            </div>
            {moved.map(([k, m]) => <MovedBanner key={k} k={k} m={m} />)}
            {hero && (
              <div role="link" tabIndex={0} onClick={() => open(hero)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-background-base)', cursor: 'pointer' }}>
                <Image size="xl" fluid src={photos[hero.e.image]} style={{ height: 180 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', alignItems: 'flex-start' }}>
                  <PriceTag>{untilLabel(hero.e.dateISO)}</PriceTag>
                  <span className="ds-heading-h2">{hero.e.title}</span>
                  <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{hero.e.date}, {hero.e.time} · {hero.e.address}</span>
                  <span className="ds-body">{seatsLabel(hero.tickets)}{hero.tickets.length === 1 ? `, ряд ${hero.tickets[0].row}, место ${hero.tickets[0].place}` : ''}</span>
                </div>
                <Button onClick={(ev) => { ev.stopPropagation(); open(hero); }}>{hero.tickets.length > 1 ? 'Показать билеты' : 'Показать билет'}</Button>
              </div>
            )}
            {hero && rows.length > 0 && !grouped && <span className="ds-heading-h3" style={{ paddingTop: 'var(--spacing-md)' }}>Дальше</span>}
            {rows}
          </div>
        )}
      </>)}
    </Screen>
  );
}
