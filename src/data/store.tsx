import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { EVENTS, MAIN_EVENT_ID, PLACE_GEO, addDaysISO, eventGeo, ruDate, sessionEvent, type Session, SEAT_PRICES, SEAT_ZONES, SERVICE_FEE, eventById, placeById, type EventItem, type Place } from './mock';

/** Единый слой мок-данных: экраны читают состояние и меняют его действиями. Сохраняется в браузере (демо), без бэкенда. */

export type SeatSel = { id: string; row: number; place: number; category: number; label?: string };
export type Ticket = { id: string; orderId: string; eventId: string; /** Сеанс (дата и время показа), если не основной. */ dateISO?: string; time?: string; seatId: string; row: string; place: string; zone: string; price: number; tariff: string; owner: string; code: string; /** Чем платили — куда вернуть деньги. */ pay?: PayMethod; /** Дата покупки. */ bought?: string };
/** Заявка на возврат (одна на несколько билетов): сумма, когда оформлена и до какого числа придут деньги. */
export type Refund = { id: string; dateISO: string; amount: number; until: string; pay?: PayMethod; full?: boolean };
export type RefundedTicket = Ticket & { refund: Refund };
/** Перенос показа организатором: билеты `eventId` на `fromISO` теперь действуют на `toISO`/`time`. */
/** Отзыв пользователя о мероприятии (один на событие; можно изменить или удалить). Фото — data-URL уменьшенных снимков. */
export type MyReview = { eventId: string; rating: number; text: string; photos: string[]; dateISO: string };
export type Moved = { eventId: string; fromISO: string; toISO: string; time: string };
export type Buyer = { surname: string; name: string; birth: string; email: string };
export type Filters = { date: string | null; maxPrice: number | null; pushkin: boolean; discount: boolean; kinds: string[]; venues: string[] };
export type PayMethod = 'sbp' | 'card';

type State = {
  favourites: string[];
  tickets: Ticket[];
  cart: { eventId: string; seats: SeatSel[]; session?: Session } | null;
  buyer: Buyer;
  plans: Record<string, string[]>;
  filters: Filters;
  /** Сколько раз пробовали оплатить картой — первая попытка картой падает (демо ошибки оплаты). */
  cardAttempts: number;
  /** Шторка «Спланировать день» на главной после покупки (событие купленного билета). */
  planPrompt: { eventId: string; dateISO?: string } | null;
  /** Профиль: «Предлагать план после покупки». */
  planPromptEnabled: boolean;
  /** Профиль (вариант «Персональный»): вход, личные данные, интересы, настройки плана дня, уведомления. */
  profile: Profile;
  /** Возвращённые билеты — убраны из `tickets` (не попадают в план дня, ленту дат и счётчики), но видны в «Моих билетах» и истории заказов. */
  refunded: RefundedTicket[];
  /** Показы, перенесённые организатором (демо — кнопка на индексе), ключ `eventId@fromISO`. */
  moved: Record<string, Moved>;
  /** Отзывы пользователя по id мероприятия. */
  myReviews: Record<string, MyReview>;
};
export type Profile = {
  loggedIn: boolean;
  user: { surname: string; name: string; birth: string; email: string; phone: string; city: string };
  interests: string[];
  /** Бюджет на активности, ₽ (null — без ограничения). */
  budget: number | null;
  /** Пешком до мест, м (null — без ограничения). */
  walk: number | null;
  notify: boolean;
  /** Тема оформления: как в системе (по умолчанию) / светлая / тёмная. */
  theme: ThemeChoice;
};
export type ThemeChoice = 'system' | 'light' | 'dark';
export const INTERESTS = ['Театр', 'Концерты', 'Выставки', 'Кофейни', 'Парки', 'Рестораны', 'Бары', 'Экскурсии', 'Дегустации', 'Детям'];

export const EMPTY_FILTERS: Filters = { date: null, maxPrice: null, pushkin: false, discount: false, kinds: [], venues: [] };
const SEED: State = {
  // первый запуск — чистое приложение: ни билетов, ни избранного, ни планов
  favourites: [],
  tickets: [],
  cart: null,
  buyer: { surname: '', name: '', birth: '', email: '' },
  /** План дня — только активности, которые пользователь добавил сам (карта/список на странице мероприятия или «Куда пойдём»). */
  plans: {},
  filters: EMPTY_FILTERS,
  cardAttempts: 0,
  planPrompt: null,
  planPromptEnabled: true,
  profile: {
    loggedIn: true,
    user: { surname: 'Константинов', name: 'Александр', birth: '12.10.1992', email: 'konstantinov@mail.ru', phone: '+7 912 345-67-89', city: 'Санкт-Петербург' },
    interests: ['Театр', 'Концерты', 'Кофейни', 'Парки'],
    budget: 3000, walk: 1000, notify: false, theme: 'system',
  },
  refunded: [],
  moved: {},
  myReviews: {},
};
const KEY = 'bilet-beru-demo-v3'; // v3: пустой старт — старые демо-данные (v2) не подхватываем
const load = (): State => { try { const raw = localStorage.getItem(KEY); if (!raw) return SEED; const st = { ...SEED, ...JSON.parse(raw) }; return { ...st, profile: { ...SEED.profile, ...st.profile } }; } catch { return SEED; } };

/** Имитация сети: задержка ответа «сервера». */
export const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));

/** Тост; `action` — кнопка в тосте (например «Отменить» после добавления в план). */
export type Toast = { id: number; text: string; kind: 'info' | 'success' | 'error'; action?: { label: string; onClick: () => void } };

function useStoreValue() {
  const [s, set] = useState<State>(load);
  const cur = useRef(s); cur.current = s;
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* приватный режим — живём без сохранения */ } }, [s]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const toast = useCallback((text: string, kind: Toast['kind'] = 'info', action?: Toast['action']) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-1), { id, text, kind, action }]);
    // с кнопкой — дольше, чтобы успеть нажать «Отменить»
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 4000 : 2600);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const actions = useMemo(() => ({
    toggleFavourite(id: string) { const on = !cur.current.favourites.includes(id); set((st) => ({ ...st, favourites: on ? [id, ...st.favourites.filter((x) => x !== id)] : st.favourites.filter((x) => x !== id) })); return on; },
    /** Начать заказ на сеанс: новый сеанс — пустая корзина. */
    startCart(eventId: string, session?: Session) { set((st) => (st.cart?.eventId === eventId && st.cart.session?.dateISO === session?.dateISO && st.cart.session?.time === session?.time ? st : { ...st, cart: { eventId, seats: [], session } })); },
    setSeats(eventId: string, seats: SeatSel[]) { set((st) => ({ ...st, cart: { eventId, seats, session: st.cart?.eventId === eventId ? st.cart.session : undefined } })); },
    saveBuyer(buyer: Buyer) { set((st) => ({ ...st, buyer })); },
    setFilters(filters: Filters) { set((st) => ({ ...st, filters })); },
    resetFilters() { set((st) => ({ ...st, filters: EMPTY_FILTERS })); },
    /** Оплата: 1.2 с «сеть»; первая попытка картой отклоняется банком. Успех — билеты в «Мои билеты», корзина очищается. */
    async pay(method: PayMethod, total: number): Promise<{ ok: true; count: number; total: number } | { ok: false; error: string }> {
      await wait(1200);
      const now = cur.current;
      if (!now.cart || now.cart.seats.length === 0) return { ok: false, error: 'Корзина пуста — выберите места заново' };
      if (method === 'card' && now.cardAttempts === 0) { set((st) => ({ ...st, cardAttempts: st.cardAttempts + 1 })); return { ok: false, error: 'Банк отклонил платёж. Попробуйте ещё раз или оплатите через СБП' }; }
      const orderId = `o-${Date.now()}`; const b = now.buyer;
      const owner = `${b.surname} ${b.name}`.trim() || 'Покупатель';
      const fresh: Ticket[] = now.cart.seats.map((x, i) => ({
        id: `t-${Date.now()}-${i}`, orderId, eventId: now.cart!.eventId, ...(now.cart!.session ?? {}), seatId: x.id, row: String(x.row), place: String(x.place),
        zone: SEAT_ZONES[x.category - 1], price: SEAT_PRICES[x.category - 1], tariff: 'Базовый', owner, pay: method, bought: TODAY,
        code: String(Math.floor(1e11 + Math.random() * 9e11)).split('').join(' '),
      }));
      set((st) => ({ ...st, tickets: [...fresh, ...st.tickets], cart: null, cardAttempts: method === 'card' ? st.cardAttempts + 1 : st.cardAttempts, planPrompt: st.planPromptEnabled ? { eventId: now.cart!.eventId, dateISO: now.cart!.session?.dateISO } : null }));
      return { ok: true, count: fresh.length, total };
    },
    addToPlan(date: string, placeId: string) { set((st) => ({ ...st, plans: { ...st.plans, [date]: [...(st.plans[date] ?? []).filter((x) => x !== placeId), placeId] } })); },
    removeFromPlan(date: string, placeId: string) { set((st) => ({ ...st, plans: { ...st.plans, [date]: (st.plans[date] ?? []).filter((x) => x !== placeId) } })); },
    /** Сохранить порядок и состав плана дня (активности + метки событий `event:<id>`). */
    setPlan(date: string, ids: string[]) { set((st) => ({ ...st, plans: { ...st.plans, [date]: ids } })); },
    deletePlan(date: string) { set((st) => { const plans = { ...st.plans }; delete plans[date]; return { ...st, plans }; }); },
    dismissPlanPrompt() { set((st) => ({ ...st, planPrompt: null })); },
    setPlanPromptEnabled(on: boolean) { set((st) => ({ ...st, planPromptEnabled: on })); },
    updateProfile(patch: Partial<Profile>) { set((st) => ({ ...st, profile: { ...st.profile, ...patch } })); },
    updateUser(patch: Partial<Profile['user']>) { set((st) => ({ ...st, profile: { ...st.profile, user: { ...st.profile.user, ...patch } } })); },
    /** Возврат билетов: 1 с «сеть»; сумма — по правилам (`refundQuote`), при переносе/отмене — всё со сбором. Можно сразу удалить план дня. */
    async refund(ids: string[], opts: { full?: boolean; deletePlan?: string } = {}): Promise<{ id: string; count: number; amount: number; until: string; pay?: PayMethod; planDeleted: boolean }> {
      await wait(1000);
      const now = cur.current;
      const list = now.tickets.filter((t) => ids.includes(t.id));
      const e = list[0] && ticketEvent(list[0]);
      const q = refundQuote(list, e?.dateISO ?? TODAY, opts.full);
      const r: Refund = { id: `R-${String(Date.now()).slice(-5)}`, dateISO: TODAY, amount: q.amount, until: addDaysISO(TODAY, 10), pay: list[0]?.pay, full: opts.full };
      const key = e && `${e.id}@${e.dateISO}`;
      set((st) => {
        const plans = { ...st.plans }; if (opts.deletePlan) delete plans[opts.deletePlan];
        const moved = { ...st.moved }; if (key) delete moved[key];
        return { ...st, plans, moved, tickets: st.tickets.filter((t) => !ids.includes(t.id)), refunded: [...list.map((t) => ({ ...t, refund: r })), ...st.refunded] };
      });
      return { id: r.id, count: list.length, amount: r.amount, until: r.until, pay: r.pay, planDeleted: !!opts.deletePlan };
    },
    /** Демо: организатор перенёс ближайшее купленное событие на 2 недели вперёд. */
    demoMoveNearest() {
      const groups = cur.current.tickets.map((t) => ticketEvent(t)).filter((e): e is EventItem => !!e && e.dateISO >= TODAY).sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time));
      const e = groups[0]; if (!e) return false;
      set((st) => ({ ...st, moved: { ...st.moved, [`${e.id}@${e.dateISO}`]: { eventId: e.id, fromISO: e.dateISO, toISO: addDaysISO(e.dateISO, 14), time: '19:00' } } }));
      return true;
    },
    /** Остаться на новую дату: билеты переходят на новый сеанс, план дня — тоже. */
    acceptMove(key: string) {
      set((st) => {
        const m = st.moved[key]; if (!m) return st;
        const moved = { ...st.moved }; delete moved[key];
        const plans = { ...st.plans }; if (plans[m.fromISO] && !plans[m.toISO]) { plans[m.toISO] = plans[m.fromISO]; delete plans[m.fromISO]; }
        return { ...st, moved, plans, tickets: st.tickets.map((t) => (t.eventId === m.eventId && ticketEvent(t)?.dateISO === m.fromISO ? { ...t, dateISO: m.toISO, time: m.time } : t)) };
      });
    },
    /** Опубликовать или обновить свой отзыв (0,8 с «сеть»). */
    async saveReview(r: Omit<MyReview, 'dateISO'>) { await wait(800); set((st) => ({ ...st, myReviews: { ...st.myReviews, [r.eventId]: { ...r, dateISO: TODAY } } })); },
    deleteReview(eventId: string) { set((st) => { const myReviews = { ...st.myReviews }; delete myReviews[eventId]; return { ...st, myReviews }; }); },
    /** Демо: билет на прошедшее событие (28 марта) — чтобы оценить его из «Прошедших». */
    demoPastTicket() {
      if (cur.current.tickets.some((t) => t.id === 'demo-past')) return;
      const t: Ticket = { id: 'demo-past', orderId: 'o-1774000031577', eventId: 'jazz-water', dateISO: '2026-03-28', time: '21:00', seatId: 'demo', row: '3', place: '12', zone: 'Партер', price: 1500, tariff: 'Базовый', owner: `${cur.current.profile.user.surname} ${cur.current.profile.user.name}`, code: '4 8 1 5 1 6 2 3 4 2 0 8', pay: 'card', bought: '2026-03-20' };
      set((st) => ({ ...st, tickets: [...st.tickets, t] }));
    },
    resetDemo() { set(SEED); try { localStorage.removeItem(KEY); } catch { /* ignore */ } },
  }), []);

  return { state: s, toasts, toast, dismissToast, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) { const v = useStoreValue(); return <Ctx.Provider value={v}>{children}</Ctx.Provider>; }
export function useStore() { const v = useContext(Ctx); if (!v) throw new Error('useStore вне StoreProvider'); return v; }

/** Правила возврата (закон о культуре): больше 10 дней — 100%, 5–10 — 50%, 3–5 — 30%, меньше 3 — не возвращается. Сервисный сбор не возвращается.
 *  `full` — показ отменили или перенесли: возвращаем всё вместе со сбором. */
export const REFUND_RULES: Array<{ label: string; pct: number }> = [{ label: 'Больше 10 дней', pct: 100 }, { label: '5–10 дней', pct: 50 }, { label: '3–5 дней', pct: 30 }, { label: 'Меньше 3 дней', pct: 0 }];
export const daysUntil = (iso: string) => Math.round((Date.parse(`${iso}T12:00:00`) - Date.parse(`${TODAY}T12:00:00`)) / 86400000);
export const refundPct = (days: number) => (days > 10 ? 100 : days >= 5 ? 50 : days >= 3 ? 30 : 0);
export function refundQuote(list: Pick<Ticket, 'price'>[], dateISO: string, full = false) {
  const days = daysUntil(dateISO), pct = full ? 100 : refundPct(days);
  const tickets = list.reduce((a, t) => a + t.price, 0), fee = list.length * SERVICE_FEE;
  const amount = full ? tickets + fee : Math.round((tickets * pct) / 100);
  return { days, pct, tickets, fee, hold: full ? 0 : tickets - amount, amount };
}
/** «на карту •• 4242» / «на счёт, с которого платили по СБП» — куда придут деньги. */
export const refundTo = (pay?: PayMethod) => (pay === 'sbp' ? 'на счёт, с которого платили по СБП' : 'на карту •• 4242');
export const refundUntil = (r: Pick<Refund, 'until'>) => `до ${ruDate(r.until)}`;

/** Сумма корзины: билеты + сервисный сбор за каждый. */
export const cartTotals = (seats: SeatSel[]) => {
  const tickets = seats.reduce((a, x) => a + SEAT_PRICES[x.category - 1], 0);
  const fee = seats.length * SERVICE_FEE;
  return { tickets, fee, total: tickets + fee };
};

/** Фильтры → список событий. */
export function applyFilters(f: Filters, list: EventItem[] = EVENTS) {
  return list.filter((e) =>
    (f.maxPrice === null || e.priceFrom <= f.maxPrice) && (!f.pushkin || !!e.pushkin) && (!f.discount || !!e.discount)
    && (f.kinds.length === 0 || f.kinds.includes(e.kind)) && (f.venues.length === 0 || f.venues.includes(e.place))
    && (!f.date || (/^\d{4}-/.test(f.date) ? e.dateISO === f.date : DATE_MATCH[f.date]?.(e.dateISO) !== false)));
}
/** «Сегодня» в демо — 1 апреля 2026, как в ленте дат макетов (главная, «Куда пойдём»). */
export const TODAY = '2026-04-01';
const inRange = (d: string, a: string, b: string) => d >= a && d <= b;
const DATE_MATCH: Record<string, (d: string) => boolean> = {
  'На этой неделе': (d) => inRange(d, '2026-04-20', '2026-04-26'), 'Завтра': (d) => d === '2026-04-24', 'На этих выходных': (d) => inRange(d, '2026-04-25', '2026-04-26'), 'Выбрать дату': () => true,
};
export const filtersActive = (f: Filters) => JSON.stringify(f) !== JSON.stringify(EMPTY_FILTERS);

/** Точка плана дня: событие по билету (якорь дня) или добавленная пользователем активность. */
export type PlanItem = Place & { kind: 'event' | 'activity'; eventId?: string };
/** План дня на дату: события по билетам (якорь дня) + активности, добавленные пользователем, в сохранённом порядке.
 *  В `plans[date]` лежат id активностей и (после перестановки) метки событий `event:<id>`; события без метки идут первыми. Сами по себе активности не появляются. */
export function dayPlan(st: { tickets: Ticket[]; plans: Record<string, string[]> }, date: string): { events: PlanItem[]; activities: PlanItem[]; items: PlanItem[] } {
  const ids = [...new Set(st.tickets.filter((t) => ticketEvent(t)?.dateISO === date).map((t) => t.eventId))];
  const events = ids.map((id): PlanItem => {
    const e = ticketEvent(st.tickets.find((t) => t.eventId === id && ticketEvent(t)?.dateISO === date)!)!;
    return { ...(id === MAIN_EVENT_ID ? placeById('theatre')! : { name: e.title, time: `${e.time} · ${e.place}`, category: e.kind, image: e.image }), id: `event:${id}`, kind: 'event', eventId: id };
  });
  const order = st.plans[date] ?? [];
  const activities = order.filter((id) => !id.startsWith('event:') && id !== 'theatre').map(placeById).filter((p): p is Place => !!p).map((p): PlanItem => ({ ...p, kind: 'activity' }));
  const placed = order.map((id) => events.find((e) => e.id === id) ?? activities.find((a) => a.id === id)).filter((x): x is PlanItem => !!x);
  const items = [...events.filter((e) => !order.includes(e.id)), ...placed];
  return { events, activities, items };
}

/** Ключ точки плана для карты/подписей: главное событие = место 'theatre'. */
export const placeKey = (p: PlanItem) => (p.kind === 'event' && p.eventId === MAIN_EVENT_ID ? 'theatre' : p.id);
/** Координаты точки плана: место — из PLACE_GEO, мероприятие — его площадка (`eventGeo`). */
export const itemGeo = (p: PlanItem): [number, number] | undefined => PLACE_GEO[placeKey(p)] ?? (p.kind === 'event' ? eventGeo(p.eventId) ?? undefined : undefined);

/** Сколько обычно проводят в месте, мин — по категории. Мероприятие — 2 часа. */
const STAY: Record<string, number> = { 'Кафе': 40, 'Ресторан': 90, 'Бары': 60, 'Дегустации': 90, 'Парки': 45, 'Досуг': 60, 'ТЦ': 60 };
const WALK_M_PER_MIN = 75; // ~4,5 км/ч
/** Итог дня: пешком по маршруту (м) + время на места и мероприятие. */
export function dayStats(items: PlanItem[], walkMeters: number) {
  const stay = items.reduce((s, p) => s + (p.kind === 'event' ? 120 : STAY[p.category] ?? 45), 0);
  const total = stay + Math.round(walkMeters / WALK_M_PER_MIN);
  const h = Math.floor(total / 60), m = total % 60;
  return {
    km: walkMeters < 1000 ? `${Math.round(walkMeters / 10) * 10} м` : `${(Math.round(walkMeters / 100) / 10).toLocaleString('ru-RU')} км`,
    time: h ? (m ? `${h} ч. ${m} мин.` : `${h} ч.`) : `${m} мин.`,
    /** Коротко, до получаса — для плашки дня: «6,5 ч», «45 мин». */
    short: total < 60 ? `${Math.max(15, Math.round(total / 15) * 15)} мин` : `${(Math.round(total / 30) / 2).toLocaleString('ru-RU')} ч`,
  };
}

/** Мероприятие билета с датой и временем его сеанса. */
export const ticketEvent = (t: Pick<Ticket, 'eventId' | 'dateISO' | 'time'>) => { const e = eventById(t.eventId); return e && sessionEvent(e, t); };
/** Мероприятие в корзине — с выбранным сеансом. */
export const cartEvent = (cart: State['cart']) => { const e = cart && eventById(cart.eventId); return e ? sessionEvent(e, cart!.session) : undefined; };
