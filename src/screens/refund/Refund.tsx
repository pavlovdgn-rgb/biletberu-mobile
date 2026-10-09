import { Fragment, useState, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';
import { AgeBadge, Button, Checkbox, HomeIndicator, Icon, ModalConfirmation, StatusBar, TextButtons, TitlePage } from '../../components';
import { SERVICE_FEE, addDaysISO, ruDate, rub, type EventItem } from '../../data/mock';
import { REFUND_RULES, TODAY, dayPlan, daysUntil, refundQuote, refundTo, refundUntil, ticketEvent, useStore, type Moved, type PayMethod, type RefundedTicket, type Ticket } from '../../data/store';
import { WhenBadge } from '../order-form/OrderForm';
import { EmptyState, NavBar, useBack } from '../_shell/app';
import { BottomSheet } from '../_shell/BottomSheet';
import { Dim, Screen } from '../_shell/Screen';

/** Возврат билетов (Figma: Screens → 7. Мои билеты, «Refund — …»; сценарий — песочница `379:15640`).
 *  Входы: «Вернуть билеты» на экране билета, «История заказов и возврат» в профиле, плашка о переносе показа в «Моих билетах».
 *  Меньше 3 дней до события — шторка с правилами вместо экрана возврата. */

const card = { background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' } as const;
const plural = (n: number, one: string, few: string, many: string) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many; };
export const ticketsWord = (n: number) => `${n} ${plural(n, 'билет', 'билета', 'билетов')}`;
const daysWord = (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')}`;
const seatOf = (t: Ticket) => `${t.zone}, ряд ${t.row}, место ${t.place}`;

/** Метка статуса заказа/события: «Возврат · до 11 апреля» — фиолетовая, остальные — серые. */
export function StatusTag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'refund' }) {
  return <span className="ds-small" style={{ flexShrink: 0, padding: 'var(--spacing-2xs) var(--spacing-md)', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap',
    background: tone === 'refund' ? 'var(--color-accent-violet-10)' : 'var(--color-background-base)', color: tone === 'refund' ? 'var(--color-accent-violet)' : 'var(--color-text-secondary)' }}>{children}</span>;
}

/** Плашка статуса возврата — на экране билета вместо кнопок. */
export function RefundStatus({ list }: { list: RefundedTicket[] }) {
  const r = list[0].refund, amount = [...new Map(list.map((t) => [t.refund.id, t.refund])).values()].reduce((a, x) => a + x.amount, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-violet-10)' }}>
      <span className="ds-subtitle">Возврат оформлен {ruDate(r.dateISO)}</span>
      <span className="ds-body">Заявка № {r.id} · {ticketsWord(list.length)} · {rub(amount)}<br />Деньги придут {refundTo(r.pay)} {refundUntil(r)}</span>
    </div>
  );
}

/** 2Г — вернуть уже нельзя: правила возврата и что делать дальше. */
export function NoRefundSheet({ days, onClose }: { days: number; onClose: () => void }) {
  return (
    <BottomSheet label="Возврат недоступен" style={{ padding: 'var(--spacing-sm) var(--spacing-2xl) var(--spacing-5xl)' }} onClose={onClose}>{(close) => (<>
      <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', padding: 'var(--spacing-2xl) 0 var(--spacing-xl)' }}>
        <span className="ds-heading-h2">Вернуть билеты уже нельзя</span>
        <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{days <= 0 ? 'Событие сегодня' : `До события ${daysWord(days)}`} — по закону деньги не возвращаются меньше чем за 3 дня</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-xs) var(--spacing-xl)', borderRadius: 'var(--radius-lg)', background: 'var(--color-background-base)' }}>
        {REFUND_RULES.map((r) => { const now = r.pct === 0; return (
          <span key={r.label} className={now ? 'ds-subtitle' : 'ds-body'} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md) 0', color: now ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
            <span>{r.label}</span><span style={{ color: now ? 'var(--color-system-error)' : 'var(--color-text-primary)' }}>{now ? 'не возвращается' : `${r.pct}%`}</span>
          </span>); })}
      </div>
      <span className="ds-body" style={{ padding: 'var(--spacing-xl) 0' }}>Если организатор отменит или перенесёт событие — вернём всё, в любой момент.</span>
      <Button onClick={() => close()}>Понятно</Button>
    </>)}</BottomSheet>
  );
}

/** Вход в возврат с экрана билета: экран возврата или — меньше 3 дней — шторка с правилами. */
export function useRefundEntry() {
  const nav = useNavigate();
  const [sheet, setSheet] = useState<number | null>(null);
  const open = (e: EventItem) => { const d = daysUntil(e.dateISO); if (d < 3) setSheet(d); else nav(`/refund?event=${e.id}&date=${e.dateISO}`); };
  return { open, sheet: sheet !== null && <NoRefundSheet days={sheet} onClose={() => setSheet(null)} /> };
}

type DoneState = { count: number; amount: number; until: string; pay?: PayMethod; planDeleted: boolean; title: string };

/** 2Б + 2В — экран возврата: какие билеты, сумма с расшифровкой, куда и когда придут деньги, удалить ли план дня; подтверждение модалкой.
 *  `?full=1` — показ перенесли/отменили: возвращаем всё со сбором. */
export function Refund() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const back = useBack('/tickets');
  const store = useStore();
  const { state } = store;
  const eventId = params.get('event'), date = params.get('date'), full = params.get('full') === '1';
  const live = state.tickets.filter((t) => t.eventId === eventId && ticketEvent(t)?.dateISO === date);
  // пока оформляется возврат, билеты уже ушли из стора — держим снимок, чтобы экран не закрылся раньше «Заявка принята»
  const [snap] = useState(live);
  const list = live.length ? live : snap;
  const [sel, setSel] = useState<string[]>(() => list.map((t) => t.id));
  const [dropPlan, setDropPlan] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!live.length && !busy) return <Navigate to="/tickets" replace />;
  const e = ticketEvent(list[0])!;
  const chosen = list.filter((t) => sel.includes(t.id));
  const q = refundQuote(chosen, e.dateISO, full);
  // план дня удаляем, только если возвращаются все билеты дня (других событий с билетами на эту дату нет)
  const plan = dayPlan(state, e.dateISO);
  const allOfDay = state.tickets.filter((t) => ticketEvent(t)?.dateISO === e.dateISO).every((t) => sel.includes(t.id));
  const offerPlan = plan.activities.length > 0 && allOfDay;
  const until = ruDate(addDaysISO(TODAY, 10));
  const toggle = (id: string, on: boolean) => setSel((s) => (on ? [...s, id] : s.filter((x) => x !== id)));
  const submit = async () => {
    setConfirm(false); setBusy(true);
    const r = await store.refund(sel, { full, deletePlan: offerPlan && dropPlan ? e.dateISO : undefined });
    const done: DoneState = { ...r, title: e.title };
    nav('/refund/done', { replace: true, state: done });
  };
  const row = (k: ReactNode, v: string, strong = false) => (
    <span className={strong ? 'ds-heading-h3' : 'ds-body'} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-md)', color: strong ? undefined : 'var(--color-text-secondary)' }}><span>{k}</span><span style={{ color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{v}</span></span>
  );

  return (
    <Screen header={<div className="bb-surface-head" style={{ background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}><StatusBar /><TitlePage title="Возврат билетов" iconLeft="Yes" onLeft={back} /></div>}
      footer={<div style={{ background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)', paddingTop: 'var(--spacing-xl)' }}>
        <div className="ds-body" style={{ textAlign: 'center' }}>К возврату {rub(q.amount)}</div>
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}>
          <Button state={chosen.length && !busy ? 'Default' : 'Disabled'} disabled={!chosen.length || busy} content={busy ? 'Loader' : 'None'} aria-busy={busy} onClick={() => setConfirm(true)}>{busy ? 'Оформляем…' : `Вернуть ${rub(q.amount)}`}</Button>
        </div>
        <NavBar active={3} /><HomeIndicator />
      </div>}
      overlay={confirm && <Dim><div onClick={() => setConfirm(false)} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={(ev) => ev.stopPropagation()} style={{ animation: 'bbScreenIn 200ms var(--motion-ease)' }}>
          <ModalConfirmation title={`Вернуть ${ticketsWord(chosen.length)}?`} subtitle={`Деньги придут ${refundTo(chosen[0]?.pay)} до ${until}`} option={rub(q.amount)} actionLabel="Вернуть"
            linkLabel="Не возвращать" linkIcon="No" onClose={() => setConfirm(false)} onLink={() => setConfirm(false)} onConfirm={submit} />
        </div>
      </div></Dim>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0 var(--spacing-4xl)' }}>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h3">{e.title}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="marker-pin-small" size={16} /><span className="ds-body">{e.place}</span></span>
            <span className="ds-body" style={{ paddingLeft: 'var(--spacing-4xl)', color: 'var(--color-text-secondary)' }}>{e.address}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xl)' }}><AgeBadge size="lg">{e.age}</AgeBadge><WhenBadge e={e} /></div>
        </section>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h2">Какие билеты вернуть</span>
          {list.map((t) => (
            <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', cursor: 'pointer' }}>
              <Checkbox active={sel.includes(t.id) ? 'Yes' : 'No'} label={seatOf(t)} onChange={(on) => toggle(t.id, on)} />
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-subtitle">{seatOf(t)}</span><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{t.tariff} тариф</span></span>
              <span className="ds-price">{rub(t.price)}</span>
            </label>
          ))}
        </section>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h2">Сумма возврата</span>
          {row(ticketsWord(chosen.length), rub(q.tickets))}
          {full ? row('Сервисный сбор — вернём, показ перенесли', rub(q.fee))
            : <>{row(`Удержание — до события ${daysWord(q.days)}`, q.hold ? `−${rub(q.hold)}` : rub(0))}{row('Сервисный сбор — не возвращается', rub(q.fee))}</>}
          <span style={{ height: 1, background: 'var(--color-background-disabled)' }} />
          {row('К возврату', rub(q.amount), true)}
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', background: 'var(--color-background-base)' }}>
            <Icon name="credit-card" size={20} /><span className="ds-note">Придут {refundTo(chosen[0]?.pay ?? list[0].pay)} до {until} — срок зависит от банка</span>
          </span>
        </section>
        {offerPlan && (
          <section style={{ ...card, padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', cursor: 'pointer' }}>
              <Checkbox active={dropPlan ? 'Yes' : 'No'} label="Удалить план дня" onChange={setDropPlan} />
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <span className="ds-subtitle">Удалить план дня на {ruDate(e.dateISO)}</span>
                <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{plan.activities.length} {plural(plan.activities.length, 'место', 'места', 'мест')} вокруг площадки — без события план не нужен</span>
              </span>
            </label>
          </section>
        )}
      </div>
    </Screen>
  );
}

/** 3А — заявка на возврат принята. */
export function RefundDone() {
  const nav = useNavigate();
  const loc = useLocation();
  const d = loc.state as DoneState | null;
  if (!d) return <Navigate to="/tickets" replace />;
  return (
    <div style={{ width: '100%', maxWidth: 430, minHeight: 'var(--app-height, 100dvh)', margin: '0 auto', display: 'flex', flexDirection: 'column', background: 'var(--color-background-base)' }}>
      <StatusBar /><TitlePage title="Возврат билетов" onLeft={() => nav('/tickets', { replace: true })} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--spacing-5xl)', marginTop: 'var(--spacing-xl)', padding: '96px var(--spacing-2xl) var(--spacing-5xl)', background: 'var(--color-base-white)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-5xl)', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', borderRadius: 'var(--radius-pill)', background: 'var(--color-base-white)', boxShadow: '0 0 60px 30px color-mix(in srgb, var(--illustration-success-check) 12%, transparent)' }}><svg width="104" height="104" viewBox="0 0 104 104" aria-hidden fill="var(--illustration-success-check)">
              <path d="M45.2 20.7C52.1 19.2 59.3 20.1 65.6 23C66.6 23.5 67.1 24.7 66.6 25.7C66.1 26.8 64.9 27.2 63.9 26.7C58.4 24.1 52.1 23.4 46.1 24.7C40.1 26 34.7 29.2 30.7 33.9C26.7 38.6 24.4 44.4 24.1 50.6C23.8 56.7 25.5 62.8 29 67.8C32.4 72.9 37.5 76.7 43.3 78.6C49.1 80.5 55.4 80.4 61.2 78.4C67 76.4 72 72.5 75.4 67.3C78.7 62.2 80.3 56.1 79.9 50C79.8 48.9 80.6 47.9 81.8 47.8C82.9 47.7 83.8 48.6 83.9 49.7C84.4 56.7 82.6 63.7 78.7 69.6C74.9 75.4 69.2 79.9 62.6 82.2C55.9 84.5 48.7 84.6 42 82.4C35.4 80.2 29.6 75.9 25.6 70.1C21.6 64.3 19.7 57.4 20 50.3C20.4 43.3 23.1 36.6 27.6 31.3C32.2 25.9 38.4 22.2 45.2 20.7Z" />
              <path d="M74.2 34.4C75 33.6 76.4 33.6 77.2 34.4C78 35.2 78 36.4 77.2 37.2L53.9 59.5C53 60.3 51.7 60.3 50.9 59.5L41 50.1C40.2 49.3 40.2 48 41 47.2C41.8 46.4 43.2 46.4 44 47.2L52.4 55.2L74.2 34.4Z" />
            </svg></span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
              <span className="ds-heading-h1">Заявка на возврат принята</span>
              <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Билеты аннулированы, деньги уже в пути</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            <div style={{ padding: 'var(--spacing-4xl) var(--spacing-2xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-background-base)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--spacing-2xl)', borderBottom: '1px solid var(--color-background-disabled)' }}><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Вернули билетов</span><span className="ds-subtitle">{d.count}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--spacing-2xl)' }}><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Сумма возврата</span><span className="ds-subtitle">{rub(d.amount)}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-2xl)' }}>
              <Icon name="info-circle" size={20} />
              <span className="ds-body">Деньги придут {refundTo(d.pay)} {refundUntil(d)}.{d.planDeleted ? ' План дня удалён.' : ''} Статус — в «Моих билетах» и в профиле, в истории заказов</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4xl)' }}>
          <Button content="Icon" onClick={() => nav('/tickets', { replace: true, state: { tab: true } })}>К моим билетам</Button>
          <button type="button" className="ds-note" onClick={() => nav('/main', { replace: true, state: { tab: true } })} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Найти другое событие</button>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}

/** 1Г — организатор перенёс показ: плашка в «Моих билетах» — вернуть всё со сбором или пойти в новую дату. */
export function MovedBanner({ m, k }: { m: Moved; k: string }) {
  const nav = useNavigate();
  const { state, acceptMove, toast } = useStore();
  const list = state.tickets.filter((t) => t.eventId === m.eventId && ticketEvent(t)?.dateISO === m.fromISO);
  if (!list.length) return null;
  const e = ticketEvent(list[0])!;
  const q = refundQuote(list, m.fromISO, true);
  const to = `${ruDate(m.toISO)}, ${m.time}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-violet-10)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}><Icon name="info-circle" size={20} /><span className="ds-subtitle">Показ {ruDate(m.fromISO)} перенесли на {ruDate(m.toISO)}</span></span>
      <span className="ds-body">«{e.title}» пройдёт {to}. Билеты действуют на новую дату. Не подходит — вернём {rub(q.amount)} полностью, вместе со сбором.</span>
      <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
        <Button size="Sm" style={{ flex: 1 }} onClick={() => nav(`/refund?event=${e.id}&date=${m.fromISO}&full=1`)}>Вернуть {rub(q.amount)}</Button>
        <TextButtons color="White" fill="Yes" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { acceptMove(k); toast(`Ждём вас ${to}`, 'success'); }}>Иду {ruDate(m.toISO)}</TextButtons>
      </div>
    </div>
  );
}

/** 1В — Профиль → «История заказов и возврат»: заказы со статусами; у предстоящих — «Вернуть билеты». */
export function Orders() {
  const nav = useNavigate();
  const back = useBack('/profile');
  const { state } = useStore();
  const { open, sheet } = useRefundEntry();
  type Row = { id: string; e: EventItem; active: Ticket[]; refunded: RefundedTicket[] };
  const map = new Map<string, Row>();
  for (const t of [...state.tickets, ...state.refunded]) {
    const e = ticketEvent(t); if (!e) continue;
    const key = `${t.orderId}@${e.id}@${e.dateISO}`;
    const r = map.get(key) ?? { id: t.orderId, e, active: [], refunded: [] }; map.set(key, r);
    if ('refund' in t) r.refunded.push(t as RefundedTicket); else r.active.push(t);
  }
  const rows = [...map.values()].sort((a, b) => b.id.localeCompare(a.id));
  const no = (id: string) => id.replace(/\D/g, '').slice(-5) || id;

  return (
    <Screen header={<div className="bb-surface-head" style={{ background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}><StatusBar /><TitlePage title="История заказов" iconLeft="Yes" onLeft={back} /></div>}
      footer={<div><NavBar active={0} /><HomeIndicator /></div>} overlay={sheet}>
      {!rows.length ? (
        <div style={{ ...card, marginTop: 'var(--spacing-xl)' }}><EmptyState icon="ticket" title="Заказов пока нет" text="Здесь будут все покупки и возвраты" action="Выбрать мероприятие" onAction={() => nav('/main')} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0 var(--spacing-4xl)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) var(--spacing-2xl) 0' }}><Icon name="info-circle" size={20} /><span className="ds-note" style={{ color: 'var(--color-text-secondary)' }}>Вернуть билет можно, пока до события больше 3&nbsp;дней</span></span>
          {rows.map((r) => {
            const past = r.e.dateISO < TODAY, all = [...r.active, ...r.refunded];
            const sum = all.reduce((a, t) => a + t.price, 0) + all.length * SERVICE_FEE;
            const back = [...new Map(r.refunded.map((t) => [t.refund.id, t.refund.amount])).values()].reduce((a, x) => a + x, 0);
            const refund = r.refunded[0]?.refund;
            const tag = refund ? (r.active.length ? <StatusTag tone="refund">Частичный возврат</StatusTag> : <StatusTag tone="refund">Возврат · {refundUntil(refund)}</StatusTag>) : <StatusTag>{past ? 'Прошло' : 'Оплачен'}</StatusTag>;
            return (
              <Fragment key={`${r.id}@${r.e.id}@${r.e.dateISO}`}>
                <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}><span className="ds-note" style={{ color: 'var(--color-text-secondary)' }}>Заказ № {no(r.id)} · {ruDate(r.active[0]?.bought ?? r.refunded[0]?.bought ?? TODAY)}</span>{tag}</span>
                  <span className="ds-heading-h3">{r.e.title}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{r.e.date}, {r.e.time} · {r.e.place}</span>
                    <span className="ds-body">{ticketsWord(all.length)} · {rub(sum)}{refund ? ` · вернули ${rub(back)}` : ''}</span>
                  </span>
                  {r.active.length > 0 && !past && <span><Button type="Secondary" size="Sm" style={{ width: 'auto' }} onClick={() => open(r.e)}>Вернуть билеты</Button></span>}
                  {r.refunded.length > 0 && !r.active.length && <span><TextButtons fill="No" onClick={() => nav(`/ticket?event=${r.e.id}&date=${r.e.dateISO}`)}>Детали возврата</TextButtons></span>}
                </section>
              </Fragment>
            );
          })}
        </div>
      )}
    </Screen>
  );
}

export type { DoneState as RefundDoneState };
