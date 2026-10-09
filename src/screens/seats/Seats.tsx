import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { HALL_MAX_SCALE, HALL_X3_CENTER, Button, ButtonIcon, ButtonTag, HallPlan, HomeIndicator, ModalConfirmation, StatusBar, TicketButton, TitlePage, type Seat } from '../../components';
import { MAIN_EVENT_ID, MAX_SEATS, SEAT_PRICES, SEAT_ZONES, eventById, rub } from '../../data/mock';
import { useStore, type SeatSel, cartEvent, ticketEvent } from '../../data/store';
import { EmptyState, useBack } from '../_shell/app';
import { Dim } from '../_shell/Screen';

/** Подписи мест как в макете (места под отметками на экране placing an order_2 3). */
const LABEL: Record<string, string> = { '16-16': '14 ряд, 2 место', '16-17': '14 ряд, 3 место' };
export const seatLabel = (x: { id: string; row: number; place: number }) => LABEL[x.id] ?? `${x.row} ряд, ${x.place} место`;
const DEMO: SeatSel[] = [{ id: '16-16', row: 16, place: 16, category: 4 }, { id: '16-17', row: 16, place: 17, category: 4 }];

/** placing an order_2 1 (Figma `179:16622`); state="confirm" — 2 2 (`179:16736`), state="selected" — 2 3 (`179:16905`).
 *  Клик по свободному месту → тариф → место в корзине; проданные места недоступны; не больше 6 билетов; «Купить билеты» → оформление. */
export function Seats({ state }: { state?: 'confirm' | 'selected' }) {
  const nav = useNavigate();
  const back = useBack('/event');
  const [params] = useSearchParams();
  const id = params.get('id') ?? MAIN_EVENT_ID;
  const store = useStore();
  // сеанс из корзины (выбран на шаге «Выберите дату»)
  const e = store.state.cart?.eventId === id ? cartEvent(store.state.cart) : eventById(id);
  const sold = store.state.tickets.filter((t) => t.eventId === id && ticketEvent(t)?.dateISO === e?.dateISO).map((t) => t.seatId);
  const fromCart = store.state.cart?.eventId === id ? store.state.cart.seats : [];
  const [seats, setSeats] = useState<SeatSel[]>(state === 'selected' ? DEMO.filter((x) => !sold.includes(x.id)) : fromCart);
  const [pending, setPending] = useState<SeatSel | null>(state === 'confirm' ? { id: '16-16', row: 16, place: 16, category: 4 } : null);
  const [scale, setScale] = useState(seats.length ? HALL_MAX_SCALE : 1);
  const selected = seats.length > 0;
  const ids = seats.map((x) => x.id);

  if (!e) return <div style={{ height: 'var(--app-height, 100dvh)', background: 'var(--color-base-white)' }}><StatusBar /><EmptyState tone="error" icon="info-circle" title="Событие не найдено" action="На главную" onAction={() => nav('/main')} /></div>;

  const click = (seat: Seat) => {
    const sid = `${seat.row}-${seat.place}`;
    if (ids.includes(sid)) { setSeats(seats.filter((x) => x.id !== sid)); return; }
    if (seats.length >= MAX_SEATS) { store.toast(`В одном заказе не больше ${MAX_SEATS} билетов`, 'error'); return; }
    setPending({ id: sid, ...seat });
  };
  const confirm = () => { if (!pending) return; setSeats([...seats, pending]); setPending(null); };
  const buy = () => { store.setSeats(id, seats); nav(`/order-form?id=${id}`); };
  const close = () => { if (seats.length) store.setSeats(id, seats); back(); };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 430, height: 'var(--app-height, 100dvh)', margin: '0 auto', overflow: 'hidden', background: 'var(--color-background-base)' }}>
      <div style={{ position: 'absolute', left: '50%', marginLeft: -196.5, top: 166 }}>
        <HallPlan scale={scale} onScaleChange={setScale} center={selected ? HALL_X3_CENTER : undefined} occupied={sold} selected={ids} onSeatClick={click} />
      </div>
      <div className="bb-surface-head" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <StatusBar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', paddingBottom: 'var(--spacing-3xl)', background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}>
          <div style={{ paddingBottom: 'var(--spacing-xl)' }}><TitlePage subtitle="Yes" title={e.title} subtitleText={`${e.date} ${e.time}`} onLeft={close} /></div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', paddingLeft: 'var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {SEAT_PRICES.map((p, i) => <ButtonTag key={p} legend="Yes" legendColor={i === 0 ? 'var(--color-system-error)' : `var(--illustration-seat-${i + 1})`}>{rub(p)}</ButtonTag>)}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 'var(--spacing-xl)', top: selected ? 380 : 400, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-background-disabled)' }}>
        <ButtonIcon fill="transparent" icon="plus" label="Приблизить" state={scale >= HALL_MAX_SCALE - 0.01 ? 'Disabled' : 'Default'} onClick={() => setScale(Math.min(HALL_MAX_SCALE, scale * 1.6))} />
        <ButtonIcon fill="transparent" icon="minus" label="Отдалить" state={scale <= 1.01 ? 'Disabled' : 'Default'} onClick={() => setScale(Math.max(1, scale / 1.6))} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 'var(--spacing-xl)', background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)' }}>
        {selected
          ? <div style={{ display: 'flex', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {seats.map((x) => <TicketButton key={x.id} title={seatLabel(x)} tariff={SEAT_ZONES[x.category - 1]} price={rub(SEAT_PRICES[x.category - 1])} categoryColor={`var(--illustration-seat-${x.category})`} onClick={() => setSeats(seats.filter((y) => y.id !== x.id))} />)}
            </div>
          : <div className="ds-caption" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Для оформления заказа выберите места</div>}
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}><Button state={selected ? 'Default' : 'Disabled'} disabled={!selected} onClick={buy}>Купить билеты</Button></div>
        <HomeIndicator />
      </div>
      {pending && <Dim><div onClick={() => setPending(null)} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={(ev) => ev.stopPropagation()} style={{ animation: 'bbScreenIn 200ms var(--motion-ease)' }}>
          <ModalConfirmation subtitle={seatLabel(pending)} actionLabel={rub(SEAT_PRICES[pending.category - 1])} linkLabel="Выбрать другой билет" onClose={() => setPending(null)} onLink={() => setPending(null)} onConfirm={confirm} />
        </div>
      </div></Dim>}
    </div>
  );
}
export function SeatsConfirm() { return <Seats state="confirm" />; }
export function SeatsSelected() { return <Seats state="selected" />; }
