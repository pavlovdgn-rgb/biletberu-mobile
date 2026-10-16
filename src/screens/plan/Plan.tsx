import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, ButtonIcon, ButtonTag, DatepickerRange, HomeIndicator, Icon, LocationCard, Map, MapHomePoint, MapMarker, MapPin, MapRoute, useRouteMeters, StatusBar, TextButtons } from '../../components';
import { photos } from '../../assets/photos';
import { MORE_PLACES } from '../../data/places-more';
import { PLACES, PLACE_FILTERS, PLACE_GEO, placesWord, weekday, eventGeo, placesNear, MAIN_EVENT_ID } from '../../data/mock';
import { TODAY, dayPlan, ticketEvent, dayStats, itemGeo, placeKey, useStore } from '../../data/store';
import { EmptyState, NavBar, useOpen } from '../_shell/app';
import { Screen } from '../_shell/Screen';
import { EditPlanSheet } from './EditPlanSheet';
import { DaySlots, SLOT_LABEL, SlotSheet, planOrder, slotOf, splitDay, type Slot } from './DaySlots';
import { ROUTES, RoutesSheet } from './RoutesSheet';

import { NO_PLACE_FILTER, PlaceFilterSheet, matchPlace, placeFilterActive, type PlaceFilter } from './PlaceFilterSheet';

const white = { background: 'var(--color-base-white)' } as const;
const MONTHS_GEN = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
/** «2026-05-02» → «Мая». */
const plural = (n: number, one: string, few: string, many: string) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many; };
const monthGen = (iso: string) => MONTHS_GEN[Number(iso.slice(5, 7)) - 1];
const WD_FULL: Record<string, string> = { пн: 'Понедельник', вт: 'Вторник', ср: 'Среда', чт: 'Четверг', пт: 'Пятница', сб: 'Суббота', вс: 'Воскресенье' };
const SHORT: Record<string, string> = { nook: 'Кофейня', theatre: 'Театр', peacock: 'Ресторан', mozz: 'Бар', willow: 'Ресторан', square: 'Кофейня', boat: 'Катер', garden: 'Сад', platform: 'ТЦ', russian: 'Ресторан', ...Object.fromEntries(MORE_PLACES.map((p) => [p.id, p.short])) };
/** ~1 ч 40 мин на активность — как в макете (3 активности • 5 ч. 0 мин.). */

/** plan created — план дня (Figma `180:18117`); state="add" — Add to the plan_0 (`181:17178`), шторка «Все интересные места».
 *  В плане — событие по билету и только те активности, которые пользователь добавил сам (карта, список на странице мероприятия, шторка «Добавить»). */
export function Plan({ state }: { state?: 'add' }) {
  const nav = useNavigate();
  const open = useOpen();
  const store = useStore();
  const { tickets } = store.state;
  const ticketDates = [...new Set(tickets.map((t) => ticketEvent(t)?.dateISO).filter((d): d is string => !!d))].sort();
  const [params] = useSearchParams();
  const fromLink = params.get('date');
  // по умолчанию — ближайший день с билетом, иначе сегодня; лента дат идёт от сегодня на два месяца вперёд
  const [date, setDate] = useState(fromLink ?? ticketDates.find((d) => d >= TODAY) ?? TODAY);
  const stripFrom = date < TODAY ? date : TODAY;
  const dayNum = Number(date.slice(8));
  const [sheet, setSheet] = useState(state === 'add');
  const [edit, setEdit] = useState(false);
  const [backToEdit, setBackToEdit] = useState(false);
  // Как в макете: при открытии ни один тег не выбран (показаны все места)
  const [filter, setFilter] = useState<string | null>(null);
  // стартовые бюджет и расстояние — из профиля («План дня»)
  const [pf, setPf] = useState<PlaceFilter>(() => ({ ...NO_PLACE_FILTER, maxPrice: store.state.profile.budget, maxMeters: store.state.profile.walk }));
  const [pfOpen, setPfOpen] = useState(false);
  const [routes, setRoutes] = useState(false);
  // подсветка только что добавленной точки плана
  const [fresh, setFresh] = useState<string | null>(null);
  const hasTicket = ticketDates.includes(date);
  // В плане — только события по билетам и активности, которые пользователь добавил сам
  const { activities, items } = dayPlan(store.state, date);
  const inPlan = (id: string) => activities.some((p) => p.id === id);
  const w = weekday(date);
  const eventId = items.find((p) => p.kind === 'event')?.eventId;
  // итог дня — по реальному пешему маршруту (по улицам)
  const stats = dayStats(items, useRouteMeters(items.map(itemGeo).filter((g): g is [number, number] => !!g)));
  const venueAt = eventId ? eventGeo(eventId) : null;
  /** «Взять маршрут»: места до события, событие, места после — порядок плана дня. */
  const takeRoute = (ids: string[], title: string) => {
    const before = ROUTES.find((r) => r.title === title)!.steps.findIndex(([id]) => id === 'theatre');
    store.setPlan(date, [...ids.slice(0, before), ...(eventId ? [`event:${eventId}`] : []), ...ids.slice(before)]);
    store.toast(`Маршрут «${title}» в плане`, 'success');
  };

  // «Собрать день» и слоты: свежий стор — через ref (тосты с «Изменить»/«Отменить» срабатывают позже)
  const live = useRef(store.state); live.current = store.state;
  const [slotSheet, setSlotSheet] = useState<{ slot: Slot; replace?: string } | null>(null);
  const [variant, setVariant] = useState<{ k: number } | null>(null);
  const eventTime = (() => { const t = tickets.find((x) => ticketEvent(x)?.dateISO === date); return t ? ticketEvent(t)!.time : ''; })();
  const candidates = venueAt ? placesNear(venueAt, eventId === MAIN_EVENT_ID).sort((a, b) => a.meters - b.meters) : [];
  const favs = store.state.favourites;
  const isFav = (id: string) => favs.includes(`place:${id}`);
  const favNear = candidates.filter((p) => isFav(p.id) && !inPlan(p.id) && p.meters <= (store.state.profile.walk ?? 2000));
  const slots = () => { const d = splitDay(dayPlan(live.current, date).items); return { b: d.before.map((p) => p.id), a: d.after.map((p) => p.id) }; };
  const save = (b: string[], a: string[]) => store.setPlan(date, planOrder(live.current, date, b, a));
  /** Поставить место в слот (или заменить им другое место). */
  const putInSlot = (id: string, slot: Slot, replace?: string) => {
    const { b, a } = slots(); const nb = b.filter((x) => x !== id), na = a.filter((x) => x !== id);
    if (replace) { const i = nb.indexOf(replace), j = na.indexOf(replace); if (i >= 0) nb[i] = id; else if (j >= 0) na[j] = id; else (slot === 'before' ? nb : na).push(id); }
    else (slot === 'before' ? nb : na).push(id);
    save(nb, na); setVariant(null); setFresh(id); setTimeout(() => setFresh(null), 1600);
  };
  const nameOf = (id: string) => PLACES.find((p) => p.id === id)?.name ?? 'Место';
  /** ＋ у избранного: место встаёт в слот по типу; «Изменить» в тосте — в другой слот. */
  const addFav = (p: { id: string; category: string }) => {
    const slot = slotOf(p.category), other: Slot = slot === 'before' ? 'after' : 'before';
    putInSlot(p.id, slot);
    store.toast(`${nameOf(p.id)} — ${SLOT_LABEL[slot]}`, 'success', { label: 'Изменить', onClick: () => { putInSlot(p.id, other); store.toast(`${nameOf(p.id)} — ${SLOT_LABEL[other]}`, 'success'); } });
  };
  /** «Собрать день»: кафе до начала и ужин/бар/прогулка после — сначала избранное, потом ближайшее, в рамках бюджета и расстояния из профиля. */
  const assemble = (k: number) => {
    const ok = candidates.filter(matchPlace(pf));
    const pick = (slot: Slot) => { const l = ok.filter((p) => slotOf(p.category) === slot).sort((x, y) => Number(isFav(y.id)) - Number(isFav(x.id))); return l.length ? l[k % l.length] : null; };
    const b = pick('before'), a = pick('after');
    if (!b && !a) { store.toast('Рядом пока нет подходящих мест — выберите сами', 'info'); return; }
    const prev = live.current.plans[date] ?? [];
    save(b ? [b.id] : [], a ? [a.id] : []); setVariant({ k });
    store.toast(k === 0 ? 'День собран' : 'Другой вариант', 'success', { label: 'Отменить', onClick: () => { store.setPlan(date, prev); setVariant(null); } });
  };
  const slotEl = slotSheet && (
    <SlotSheet slot={slotSheet.slot} eventTime={eventTime} venue={venueAt} candidates={candidates} favourites={favs} inPlan={inPlan} replacing={slotSheet.replace}
      onClose={() => setSlotSheet(null)}
      onPick={(id) => { putInSlot(id, slotSheet.slot, slotSheet.replace); store.toast(`${nameOf(id)} — ${SLOT_LABEL[slotSheet.slot]}`, 'success'); }}
      onRemove={() => { const id = slotSheet.replace!; const prev = live.current.plans[date] ?? []; store.removeFromPlan(date, id); setVariant(null); store.toast(`${nameOf(id)} — убрано из плана`, 'info', { label: 'Отменить', onClick: () => store.setPlan(date, prev) }); }} />
  );
  const [sheetOut, setSheetOut] = useState(false);
  // закрытие с анимацией: шторка уезжает вниз, затемнение гаснет, затем снимаем
  const closeSheet = (after?: () => void) => { setSheetOut(true); setTimeout(() => { setSheet(false); setSheetOut(false); if (state === 'add') nav('/plan', { replace: true }); after?.(); }, 240); };
  const confirmSheet = () => closeSheet(() => { if (backToEdit) { setBackToEdit(false); setEdit(true); } else if (activities.length) store.toast(`В плане ${placesWord(activities.length)}`, 'success'); });
  const toggle = (id: string) => {
    if (!hasTicket) { store.toast('Сначала выберите день с билетом', 'error'); return; }
    const prev = store.state.plans[date] ?? [];
    const undo = { label: 'Отменить', onClick: () => store.setPlan(date, prev) };
    const name = PLACES.find((p) => p.id === id)?.name ?? 'Место';
    if (inPlan(id)) { store.removeFromPlan(date, id); store.toast(`${name} — убрано из плана`, 'info', undo); }
    else if (activities.length >= 8) store.toast('В плане дня не больше 8 активностей', 'error');
    else {
      const add = () => { store.addToPlan(date, id); store.toast(`${name} — в плане`, 'success', undo); setFresh(id); setTimeout(() => setFresh(null), 1600); };
      // первое место: список под картой исчезнет — сначала плавно поднимаемся к точкам плана, потом добавляем (без рывка)
      const pts = document.getElementById('plan-points');
      if (!activities.length && pts) { pts.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(add, 450); } else add();
    }
  };

  const header = (
    <div className="bb-surface-head" style={{ background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 var(--spacing-2xl) var(--spacing-xl)', minHeight: 48 }}>
        <span className="ds-heading-h2" style={{ flex: 1, textAlign: 'center' }}>Куда пойдём</span>
      </div>
      <div style={{ padding: '0 0 var(--spacing-4xl) var(--spacing-2xl)' }}><DatepickerRange state="2" from={stripFrom} length={70} value={date} ticketDates={ticketDates} onSelect={setDate} /></div>
    </div>
  );
  const SHEET_ORDER = ['mozz', 'platform', 'willow', 'square', 'boat', 'garden', 'nook', 'peacock', 'russian', ...MORE_PLACES.map((p) => p.id)];
  const list = SHEET_ORDER.map((id) => PLACES.find((p) => p.id === id)!).filter(PLACE_FILTERS[filter ?? 'Все']).filter(matchPlace(pf));
  const sheetEl = sheet && (
    <div className={sheetOut ? 'bb-dim--out' : 'bb-dim'} style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--color-static-black) 60%, transparent)' }}>
      <div className={sheetOut ? 'bb-sheet--out' : 'bb-sheet'} style={{ position: 'absolute', left: 0, right: 0, top: 92, bottom: 0, display: 'flex', flexDirection: 'column', ...white, borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 5px' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
        <div style={{ padding: '0 var(--spacing-2xl) var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--spacing-md)' }}><span className="ds-heading-h2">Все интересные места</span><ButtonIcon size="M" icon="x-close" label="Закрыть" onClick={() => closeSheet()} /></div>
          <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>(найдено {list.length})</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <button type="button" aria-label="Фильтр мест" onClick={() => setPfOpen(true)} style={{ position: 'relative', flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: 'var(--spacing-md) var(--spacing-2xl)', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-md)', background: 'var(--color-static-black)', color: 'var(--color-static-white)' }}><Icon name="settings" />
            {placeFilterActive(pf) && <span style={{ position: 'absolute', top: 6, right: 10, width: 8, height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--color-primary-orange)' }} />}</button>
          {Object.keys(PLACE_FILTERS).map((f) => <ButtonTag key={f} status={filter === f ? 'Active' : 'No active'} onClick={() => setFilter(filter === f ? null : f)}>{f}</ButtonTag>)}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl) 180px' }}>
          {list.length ? list.map((p) => <div key={p.id} role="link" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => open(`/activity?id=${p.id}&date=${date}`)}><LocationCard button="Yes" remove={inPlan(p.id)} name={p.name} time={p.time} image={photos[p.image]} favourite={store.state.favourites.includes(`place:${p.id}`)} onAction={() => toggle(p.id)} /></div>)
            : <EmptyState title="Ничего не найдено" text="Попробуйте другую категорию или ослабьте фильтр" action={placeFilterActive(pf) ? 'Сбросить фильтр' : undefined} onAction={() => setPf(NO_PLACE_FILTER)} />}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)', ...white }}><Button onClick={confirmSheet}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>Добавить
            {activities.length > 0 && <span aria-label={`Выбрано: ${activities.length}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {activities.slice(0, 3).map((p, i) => <img key={p.id} src={photos[p.image]} alt="" style={{ width: 20, height: 20, marginLeft: i ? -6 : 0, borderRadius: 'var(--radius-pill)', objectFit: 'cover', border: '1px solid var(--color-primary-orange)' }} />)}
              {activities.length > 3 && <span style={{ marginLeft: "var(--spacing-xs)" }}>+{activities.length - 3}</span>}
            </span>}
          </span>
        </Button></div><NavBar active={1} /><HomeIndicator />
      </div>
      {pfOpen && <PlaceFilterSheet value={pf} onClose={() => setPfOpen(false)} onApply={(f) => { setPf(f); setPfOpen(false); }} />}
    </div>
  );

  return (
    <Screen header={header} footer={<div><NavBar active={1} /><HomeIndicator /></div>} overlay={slotEl || sheetEl || (routes && <RoutesSheet onTake={takeRoute} onClose={() => setRoutes(false)} />) || (edit && <EditPlanSheet key={date + activities.length} date={date} title={`${WD_FULL[w.wd]}, ${dayNum} ${monthGen(date)}`} items={items} onClose={() => setEdit(false)} onAdd={() => { setEdit(false); setBackToEdit(true); setSheet(true); }} />)}>
      <div style={{ ...white, borderRadius: 'var(--radius-2xl)', marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-3xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', minHeight: '60%' }}>
        {!hasTicket ? (
          <EmptyState icon="ticket" title={`На ${dayNum} ${monthGen(date).toLowerCase()} нет билетов`} text="План дня собирается вокруг купленного события. Выберите день с отметкой билета или купите билет" action="Выбрать мероприятие" onAction={() => nav('/main')} />
        ) : <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4xl)', padding: '0 var(--spacing-2xl)' }}>
            {/* плашка дня: пусто — «Собрать день»; собран — итог (места, время, пешком) и «Изменить» */}
            <div style={{ display: 'flex', alignItems: activities.length ? 'center' : 'flex-start', flexDirection: activities.length ? 'row' : 'column', justifyContent: 'space-between', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-violet)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xs)' }}>
                <span className="ds-heading-h3" style={{ color: 'var(--color-static-white)' }}>{WD_FULL[w.wd]}, {dayNum} {monthGen(date)}</span>
                {activities.length ? (
                  <span className="ds-body" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-xs) var(--spacing-md)', color: 'var(--color-static-white)' }}>
                    {([['marker-pin-small', `${items.length} ${plural(items.length, 'место', 'места', 'мест')}`], ['clock-small', stats.short], ['navigation-pointer-small', stats.km]] as const).map(([ic, t]) => (
                      <span key={ic} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-xs)', whiteSpace: 'nowrap' }}><Icon name={ic} size={16} />{t}</span>
                    ))}
                  </span>
                ) : <span className="ds-body" style={{ color: 'var(--color-static-white)' }}>Соберём день вокруг события</span>}
              </div>
              {activities.length > 0 ? <TextButtons color="White" onClick={() => setEdit(true)}>Изменить</TextButtons>
                : <TextButtons color="White" size="M" onClick={() => assemble(0)}>Собрать день</TextButtons>}
            </div>
            {/* день по порядку: «До начала» / событие / «После» (песочница `477:31993`) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
              <DaySlots items={items} eventTime={eventTime} fresh={fresh} onSlot={(slot, replace) => setSlotSheet({ slot, replace })}
                onEvent={(p) => nav(`/event?id=${p.eventId}`)} />
              {variant && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>Тап по месту — заменить его</span>
                <Button type="Secondary" size="Sm" onClick={() => assemble(variant.k + 1)}>Другой вариант</Button>
              </div>}
            </div>
            {/* избранное рядом с площадкой — под рукой; ＋ ставит место в подходящий слот */}
            {favNear.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}><Icon name="heart-rounded-fill" size={20} style={{ color: 'var(--color-primary-orange)' }} /><span className="ds-heading-h3">Из избранного рядом · {favNear.length}</span></span>
              {favNear.map((p) => <div key={p.id} role="link" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => open(`/activity?id=${p.id}&date=${date}`)}>
                <LocationCard button="Yes" name={p.name} time={p.time} image={photos[p.image]} favourite onAction={() => addFav(p)} /></div>)}
            </div>}
          </div>
          {/* площадка за пределами карты и план пуст — мест рядом нет, честно об этом говорим */}
          {!venueAt && !activities.length && <EmptyState icon="marker-pin" title="Рядом с этой площадкой мест пока нет" text="Мы добавляем кафе и прогулки по районам. Пока можно спланировать день вокруг события в центре города" />}
          {/* план собран — маршрут дня на карте */}
          {activities.length > 0 && <div id="plan-map" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', padding: '0 var(--spacing-2xl)' }}><Icon name="marker-pin" size={24} /><span className="ds-heading-h2">Маршрут дня</span></div>
            <div style={{ position: 'relative', height: 254, isolation: 'isolate' }}>
              <Map designation="No" metro="Yes" height={254} center={venueAt ?? PLACE_GEO.theatre}>
                <MapRoute points={items.map(itemGeo).filter((g): g is [number, number] => !!g)} />
                {items.map((p, i) => { const g = itemGeo(p); return g && <MapPin key={p.id} at={g}>{p.kind === 'event' ? <MapHomePoint radius="No" /> : <MapMarker label={SHORT[placeKey(p)] ?? p.category} order={i + 1} image={photos[p.image]} />}</MapPin>; })}
              </Map>
              <TextButtons color="White" size="M" iconLeft="Yes" style={{ position: 'absolute', left: 16, top: 10, zIndex: 2 }} onClick={() => nav(`/map?route=${date}`)}>Открыть карту</TextButtons>
            </div>
          </div>}
          {venueAt && <div style={{ padding: '0 var(--spacing-2xl) var(--spacing-4xl)' }}><TextButtons fill="No" iconRight="Yes" onClick={() => setSheet(true)}>Все места рядом</TextButtons></div>}
          {activities.length > 0 && <>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl) 0 var(--spacing-5xl)' }}>
              <TextButtons fill="No" iconLeft="Yes" iconLeftName="trash" danger onClick={() => { store.deletePlan(date); store.toast('Активности убраны из плана'); }}>Очистить план</TextButtons>
            </div>
          </>}
        </>}
      </div>
    </Screen>
  );
}
const FRESH_CSS = '@keyframes bbFresh{0%{box-shadow:0 0 0 3px var(--color-primary-orange)}100%{box-shadow:0 0 0 3px transparent}}';
if (typeof document !== 'undefined' && !document.getElementById('bb-fresh')) { const st = document.createElement('style'); st.id = 'bb-fresh'; st.textContent = FRESH_CSS; document.head.appendChild(st); }
export function PlanAdd() { return <Plan state="add" />; }
