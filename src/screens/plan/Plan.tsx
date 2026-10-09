import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, ButtonIcon, ButtonTag, DatepickerRange, HomeIndicator, Icon, LocationCard, Map, MapHomePoint, MapMarker, MapPin, MapRoute, useRouteMeters, StatusBar, TextButtons } from '../../components';
import { photos } from '../../assets/photos';
import { MORE_PLACES } from '../../data/places-more';
import { PLACES, PLACE_FILTERS, PLACE_GEO, placesWord, weekday, eventGeo, placesNear, MAIN_EVENT_ID } from '../../data/mock';
import { TODAY, dayPlan, ticketEvent, dayStats, itemGeo, placeKey, useStore, type PlanItem } from '../../data/store';
import { EmptyState, NavBar, useOpen } from '../_shell/app';
import { Screen } from '../_shell/Screen';
import { EditPlanSheet } from './EditPlanSheet';
import { ROUTES, RoutesSheet } from './RoutesSheet';

/** Кнопка «Готовые маршруты» в пустом плане — выключена до следующей итерации (решение 2026-10-07). */
const ROUTES_ENABLED = false;
import { NO_PLACE_FILTER, PlaceFilterSheet, matchPlace, placeFilterActive, type PlaceFilter } from './PlaceFilterSheet';

const white = { background: 'var(--color-base-white)' } as const;
const MONTHS_GEN = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
/** «2026-05-02» → «Мая». */
const plural = (n: number, one: string, few: string, many: string) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many; };
const monthGen = (iso: string) => MONTHS_GEN[Number(iso.slice(5, 7)) - 1];
const WD_FULL: Record<string, string> = { пн: 'Понедельник', вт: 'Вторник', ср: 'Среда', чт: 'Четверг', пт: 'Пятница', сб: 'Суббота', вс: 'Воскресенье' };
const SHORT: Record<string, string> = { nook: 'Кофейня', theatre: 'Театр', peacock: 'Ресторан', mozz: 'Бар', willow: 'Ресторан', square: 'Кофейня', boat: 'Катер', garden: 'Сад', platform: 'ТЦ', russian: 'Ресторан', ...Object.fromEntries(MORE_PLACES.map((p) => [p.id, p.short])) };
/** Рекомендация по порядку точек плана. */
const advice = (items: PlanItem[]) => items.map((p, i) => { const name = p.kind === 'event' ? 'вашего события' : p.name; return i === 0 ? `Начните с ${p.kind === 'event' ? name : `места «${name}»`}` : i === items.length - 1 ? `Завершите день: ${p.kind === 'event' ? 'ваше событие' : p.name}` : `Затем — ${p.kind === 'event' ? 'ваше событие' : p.name}`; }).join('. ') + '. Все места — в пешей доступности от площадки.';
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
  // «Места рядом» под картой: категория и места, ближние — первыми
  const [nearCat, setNearCat] = useState('Все');
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
  // места рядом — вокруг площадки мероприятия этого дня (за пределами карты — мест нет)
  const venueAt = eventId ? eventGeo(eventId) : null;
  const near = venueAt ? placesNear(venueAt, eventId === MAIN_EVENT_ID).filter(PLACE_FILTERS[nearCat]).filter(matchPlace(pf)) : [];
  /** «Взять маршрут»: места до события, событие, места после — порядок плана дня. */
  const takeRoute = (ids: string[], title: string) => {
    const before = ROUTES.find((r) => r.title === title)!.steps.findIndex(([id]) => id === 'theatre');
    store.setPlan(date, [...ids.slice(0, before), ...(eventId ? [`event:${eventId}`] : []), ...ids.slice(before)]);
    store.toast(`Маршрут «${title}» в плане`, 'success');
  };

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
    <Screen header={header} footer={<div><NavBar active={1} /><HomeIndicator /></div>} overlay={sheetEl || (routes && <RoutesSheet onTake={takeRoute} onClose={() => setRoutes(false)} />) || (edit && <EditPlanSheet key={date + activities.length} date={date} title={`${WD_FULL[w.wd]}, ${dayNum} ${monthGen(date)}`} items={items} onClose={() => setEdit(false)} onAdd={() => { setEdit(false); setBackToEdit(true); setSheet(true); }} />)}>
      <div style={{ ...white, borderRadius: 'var(--radius-2xl)', marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-3xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', minHeight: '60%' }}>
        {!hasTicket ? (
          <EmptyState icon="ticket" title={`На ${dayNum} ${monthGen(date).toLowerCase()} нет билетов`} text="План дня собирается вокруг купленного события. Выберите день с отметкой билета или купите билет" action="Выбрать мероприятие" onAction={() => nav('/main')} />
        ) : <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-violet)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xs)' }}>
                <span className="ds-heading-h3" style={{ color: 'var(--color-static-white)' }}>{WD_FULL[w.wd]}, {dayNum} {monthGen(date)}</span>
                {/* плашка дня — фиолетовая, цвет отметки билета в календаре (вариант Ф1, песочница `353:13369`) */}
                {/* итог дня с иконками — как в карточке «Маршрут построен» (песочница `348:26831`): места, время, пешком */}
                {activities.length ? (
                  <span className="ds-body" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-xs) var(--spacing-md)', color: 'var(--color-static-white)' }}>
                    {([['marker-pin-small', `${items.length} ${plural(items.length, 'место', 'места', 'мест')}`], ['clock-small', stats.short], ['navigation-pointer-small', stats.km]] as const).map(([ic, t]) => (
                      <span key={ic} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-xs)', whiteSpace: 'nowrap' }}><Icon name={ic} size={16} />{t}</span>
                    ))}
                  </span>
                ) : <span className="ds-body" style={{ color: 'var(--color-static-white)' }}>Пока только событие</span>}
              </div>
              {activities.length > 0 && <TextButtons color="White" onClick={() => setEdit(true)}>Изменить</TextButtons>}
            </div>
            {activities.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-2xl) var(--spacing-2xl) 0', borderRadius: 'var(--radius-md)', background: 'var(--color-background-base)' }}>
              <span className="ds-heading-h3" style={{ paddingBottom: 'var(--spacing-md)' }}>Наши рекомендации:</span>
              <p className="ds-body" style={{ margin: 0, padding: '0 var(--spacing-2xs) var(--spacing-2xl)', color: 'var(--color-text-secondary)' }}>{advice(items)}</p>
            </div>}
            <div id="plan-points" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {items.map((p, i) => <div key={p.id} role="link" tabIndex={0} style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)', animation: fresh === p.id ? 'bbFresh 1.6s ease-out' : undefined }} onClick={() => (p.kind === 'event' ? nav(`/event?id=${p.eventId}`) : open(`/activity?id=${p.id}&date=${date}`))}><LocationCard photo="No" order={i + 1} name={p.name} time={p.time} category={p.category} /></div>)}
            </div>
            {/* «Готовые маршруты» (RoutesSheet) — отложено до следующей итерации прототипа: включить, вернув кнопку */}
            {ROUTES_ENABLED && !activities.length && <Button type="Secondary" content="Icon" icon="route" onClick={() => setRoutes(true)}>Готовые маршруты</Button>}
            {/* план собран: длинный список мест убираем (вариант Б), добавление — через шторку «Все интересные места» */}
            {activities.length > 0 && <Button type="Secondary" content="Icon" icon="plus" onClick={() => setSheet(true)}>Добавить место</Button>}
          </div>
          {/* площадка за пределами карты и план пуст — карты и мест рядом нет, честно об этом говорим */}
          {!venueAt && !activities.length ? <EmptyState icon="marker-pin" title="Рядом с этой площадкой мест пока нет" text="Мы добавляем кафе и прогулки по районам. Пока можно спланировать день вокруг события в центре города" /> :
          <div id="plan-map" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', padding: '0 var(--spacing-2xl) var(--spacing-xl)' }}><Icon name="marker-pin" size={24} /><span className="ds-heading-h2">{activities.length ? 'Маршрут на карте' : 'Места рядом'}</span></div>
            <div style={{ position: 'relative', height: 254, isolation: 'isolate' }}>
              {activities.length ? (
                <Map designation="No" metro="Yes" height={254} center={venueAt ?? PLACE_GEO.theatre}>
                  <MapRoute points={items.map(itemGeo).filter((g): g is [number, number] => !!g)} />
                  {/* мероприятие (куда куплен билет) — домик, как в макете; места — метки с номером */}
                  {items.map((p, i) => { const g = itemGeo(p); return g && <MapPin key={p.id} at={g}>{p.kind === 'event' ? <MapHomePoint radius="No" /> : <MapMarker label={SHORT[placeKey(p)] ?? p.category} order={i + 1} image={photos[p.image]} />}</MapPin>; })}
                </Map>
              ) : (
                // пустой план: сразу видно, что рядом с площадкой (вариант Б), метка — страница места
                <Map designation="No" metro="Yes" height={254} scale={400} center={venueAt ?? PLACE_GEO.theatre}>
                  {venueAt && <MapPin at={venueAt}><MapHomePoint /></MapPin>}
                  {near.map((p) => <MapPin key={p.id} at={PLACE_GEO[p.id]}><button type="button" aria-label={p.name} onClick={() => open(`/activity?id=${p.id}&date=${date}`)} style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}><MapMarker text="No" bulb="No" image={photos[p.image]} style={{ width: 36 }} /></button></MapPin>)}
                </Map>
              )}
              <TextButtons color="White" size="M" iconLeft="Yes" style={{ position: 'absolute', left: 16, top: 10, zIndex: 2 }} onClick={() => nav(activities.length ? `/map?route=${date}` : `/map?id=${eventId}`)}>Открыть карту</TextButtons>
            </div>
          </div>}
          {!activities.length && venueAt && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: '0 var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {Object.keys(PLACE_FILTERS).map((f) => <ButtonTag key={f} status={nearCat === f ? 'Active' : 'No active'} onClick={() => setNearCat(f)}>{f}</ButtonTag>)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)' }}>
              {near.length ? near.map((p) => <div key={p.id} role="link" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => open(`/activity?id=${p.id}&date=${date}`)}>
                <LocationCard button="Yes" remove={inPlan(p.id)} name={p.name} time={p.time} image={photos[p.image]} favourite={store.state.favourites.includes(`place:${p.id}`)} onAction={() => toggle(p.id)} /></div>)
                : <EmptyState title="Ничего не найдено" text="Попробуйте другую категорию" />}
            </div>
          </div>}
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
