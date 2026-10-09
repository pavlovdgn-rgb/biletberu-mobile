import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ButtonIcon, ButtonTag, HomeIndicator, Icon, Map, MapHomePoint, MapMarker, MapPin, MapRoute, StatusBar } from '../../components';
import { MAP_GEO, MAP_W, toMap, useRouteMeters, type LatLon } from '../../components/Map';
import { photos } from '../../assets/photos';
import { MAIN_EVENT_ID, PLACE_FILTERS, PLACE_GEO, eventById, placeById, spotsWord, eventGeo } from '../../data/mock';
import { dayPlan, dayStats, itemGeo, placeKey, useStore } from '../../data/store';
import { NavBar, useBack, useOpen } from '../_shell/app';

/** Масштаб полной карты: 1364 — как кадр макета; ступени зума — подписи улиц появляются по мере приближения. */
const W = 1364;
const ZOOMS = [0.35, 0.55, 1, 1.6];
const Z_DEFAULT = 2;
/** Центр карты так, чтобы маршрут встал в свободную часть экрана: левее кнопок зума и выше карточки «Маршрут построен» (px экрана). */
const SHIFT_X = 15, SHIFT_Y = 40;
const shiftCenter = ([lat, lon]: LatLon, z: number): LatLon => {
  const k = (W * z * 2.2) / MAP_W, kx = MAP_W / ((MAP_GEO.maxlon - MAP_GEO.minlon) * Math.cos(((MAP_GEO.minlat + MAP_GEO.maxlat) / 2) * Math.PI / 180));
  return [lat - SHIFT_Y / k / kx, lon + (SHIFT_X / k) * (MAP_GEO.maxlon - MAP_GEO.minlon) / MAP_W];
};
const ROUTE_LABEL: Record<string, string> = { nook: 'Кофейня', theatre: 'Театр', peacock: 'Ресторан' };

/** Полная карта на весь экран. `/map?id=` — места рядом с событием (Full map 2), `/map?route=ДАТА` — маршрут плана дня (Full map 1). Пан пальцем, зум кнопками, метка → страница активности. */
export function FullMap({ routeDate }: { routeDate?: string }) {
  const openModal = useOpen();
  const back = useBack('/main');
  const [params] = useSearchParams();
  const route = params.get('route') ?? routeDate;
  const e = eventById(params.get('id') ?? MAIN_EVENT_ID) ?? eventById(MAIN_EVENT_ID)!;
  const { state, toast } = useStore();
  // маршрут дня: открываем по центру его точек и в самом крупном масштабе, где видны все (а не всегда на театре)
  const routeGeo = route ? dayPlan(state, route).items.map(itemGeo).filter((g): g is [number, number] => !!g) : [];
  const routeCenter: LatLon | undefined = routeGeo.length
    ? [(Math.min(...routeGeo.map((g) => g[0])) + Math.max(...routeGeo.map((g) => g[0]))) / 2, (Math.min(...routeGeo.map((g) => g[1])) + Math.max(...routeGeo.map((g) => g[1]))) / 2] : undefined;
  const [zi, setZi] = useState(() => {
    if (routeGeo.length < 2) return Z_DEFAULT;
    const pts = routeGeo.map((g) => toMap(g));
    const bw = Math.max(...pts.map((q) => q[0])) - Math.min(...pts.map((q) => q[0])), bh = Math.max(...pts.map((q) => q[1])) - Math.min(...pts.map((q) => q[1]));
    // свободная часть экрана: без шапки сверху и карточки «Маршрут построен» снизу, с полями под метки
    const vw = Math.min(window.innerWidth, 430) - 170, vh = (window.innerHeight || 852) - 440;
    const fit = ZOOMS.map((zz) => (W * zz * 2.2) / MAP_W).findLastIndex((kk) => bw * kk <= vw && bh * kk <= vh);
    return Math.max(0, Math.min(Z_DEFAULT, fit));
  });
  // колесо/трекпад тоже меняют ступень зума
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = box.current; if (!el) return; let t = 0; const on = (ev: WheelEvent) => { if (!ev.ctrlKey && Math.abs(ev.deltaY) < 30) return; ev.preventDefault(); const now = performance.now(); if (now - t < 250) return; t = now; setZi((v) => Math.max(0, Math.min(ZOOMS.length - 1, v + (ev.deltaY < 0 ? 1 : -1)))); }; el.addEventListener('wheel', on, { passive: false }); return () => el.removeEventListener('wheel', on); }, []);
  const [filter, setFilter] = useState('Все');
  const z = ZOOMS[zi];

  const zoom = (
    <div style={{ position: 'absolute', right: 'var(--spacing-xl)', top: 378, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-background-disabled)', zIndex: 2 }}>
      <ButtonIcon fill="transparent" icon="plus" label="Приблизить" state={zi === ZOOMS.length - 1 ? 'Disabled' : 'Default'} onClick={() => setZi(Math.min(ZOOMS.length - 1, zi + 1))} />
      <ButtonIcon fill="transparent" icon="minus" label="Отдалить" state={zi === 0 ? 'Disabled' : 'Default'} onClick={() => setZi(Math.max(0, zi - 1))} />
    </div>
  );
  const open = (id: string) => openModal(route ? `/activity?id=${id}&date=${route}` : `/activity?id=${id}&event=${e.id}`);

  // маршрут дня и его итог (по улицам) — хуки до ветвления
  const routeItems = route ? dayPlan(state, route).items : [];
  const stats = dayStats(routeItems, useRouteMeters(routeItems.map(itemGeo).filter((g): g is [number, number] => !!g)));

  if (route) {
    const items = routeItems;
    const share = async () => {
      const text = `Мой план дня: ${items.map((p, i) => `${i + 1}. ${p.name}`).join(' → ')}`;
      try { if (navigator.share) await navigator.share({ title: 'План дня', text }); else { await navigator.clipboard.writeText(text); toast('Маршрут скопирован', 'success'); } }
      catch (err) { if ((err as Error)?.name !== 'AbortError') toast('Не удалось поделиться', 'error'); }
    };
    return (
      <div ref={box} style={{ position: 'relative', height: 'var(--app-height, 100dvh)', overflow: 'hidden', background: 'var(--illustration-map-land)' }}>
        <Map designation="Yes" metro="Yes" height="100%" scale={W * z} center={routeCenter ? shiftCenter(routeCenter, z) : PLACE_GEO.theatre}>
          <MapRoute points={items.map(itemGeo).filter((g): g is [number, number] => !!g)} />
          {/* мероприятие — домик (Map home point), места — метки с номером по порядку */}
          {items.map((p, i) => { const g = itemGeo(p); return g && <MapPin key={p.id} at={g}>{p.kind === 'event' ? <MapHomePoint radius="No" /> : <button type="button" aria-label={p.name} onClick={() => open(p.id)} style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}>
            <MapMarker size="Xl" label={ROUTE_LABEL[placeKey(p)] ?? p.name} order={i + 1} image={photos[p.image]} />
          </button>}</MapPin>; })}
        </Map>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, pointerEvents: 'none' }}>
          <StatusBar transparent />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 var(--spacing-2xl)', pointerEvents: 'auto' }}>
            <ButtonIcon fill="White" icon="chevron-left" label="Назад" onClick={back} /><ButtonIcon fill="White" icon="upload" label="Поделиться" onClick={share} />
          </div>
        </div>
        {zoom}
        <div style={{ position: 'absolute', left: 'var(--spacing-2xl)', right: 'var(--spacing-2xl)', bottom: 34, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl) var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', background: 'var(--color-base-white)', boxShadow: 'var(--shadow-md)' }}>
          {items.length ? <>
            <span className="ds-heading-h3">Маршрут построен</span>
            <span className="ds-body" style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}><Icon name="marker-pin-small" size={16} style={{ color: 'var(--color-primary-orange)' }} />{spotsWord(items.length)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}><Icon name="navigation-pointer-small" size={16} style={{ color: 'var(--color-primary-orange)' }} />{stats.km}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}><Icon name="clock-small" size={16} style={{ color: 'var(--color-primary-orange)' }} />{stats.time}</span>
            </span>
            <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{items.map((p, i) => `${i + 1}. ${placeKey(p) === 'theatre' ? 'Театр Комедии' : p.name}`).join(' → ')}</span>
          </> : <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>В плане пока нет мест — добавьте их в «Куда пойдём»</span>}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: 'none' }}><HomeIndicator transparent /></div>
      </div>
    );
  }

  // места вокруг площадки мероприятия
  const venueAt = eventGeo(e.id) ?? PLACE_GEO.theatre;
  const shown = Object.keys(PLACE_GEO).filter((id) => id !== 'theatre').map((id) => placeById(id)!).filter(PLACE_FILTERS[filter]);
  // при выборе категории карта показывает все найденные места: центр их рамки и самый крупный масштаб, при котором они помещаются
  const geo = shown.map((p) => PLACE_GEO[p.id]);
  const focus: LatLon | undefined = filter === 'Все' || !geo.length ? undefined
    : [(Math.min(...geo.map((g) => g[0])) + Math.max(...geo.map((g) => g[0]))) / 2, (Math.min(...geo.map((g) => g[1])) + Math.max(...geo.map((g) => g[1]))) / 2];
  const pickFilter = (f: string) => {
    setFilter(f);
    const pts = Object.keys(PLACE_GEO).filter((id) => id !== 'theatre' && PLACE_FILTERS[f](placeById(id)!)).map((id) => toMap(PLACE_GEO[id]));
    if (f === 'Все' || !pts.length) return;
    const bw = Math.max(...pts.map((q) => q[0])) - Math.min(...pts.map((q) => q[0])), bh = Math.max(...pts.map((q) => q[1])) - Math.min(...pts.map((q) => q[1]));
    const vw = (box.current?.clientWidth ?? 393) - 110, vh = (box.current?.clientHeight ?? 852) - 360; // поля под метки, чипсы и таббар
    const fit = ZOOMS.map((zz) => (W * zz * 2.2) / MAP_W).findLastIndex((kk) => bw * kk <= vw && bh * kk <= vh);
    setZi(Math.max(0, Math.min(Z_DEFAULT, fit)));
  };
  return (
    <div ref={box} style={{ position: 'relative', height: 'var(--app-height, 100dvh)', overflow: 'hidden', background: 'var(--illustration-map-land)' }}>
      <Map designation="Yes" metro="Yes" height="100%" scale={W * z} center={venueAt} focus={focus}>
        <MapPin at={venueAt}><MapHomePoint radius="No" /></MapPin>
        {shown.map((p) => <MapPin key={p.id} at={PLACE_GEO[p.id]}><button type="button" aria-label={p.name} onClick={() => open(p.id)} style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}>
          <MapMarker size="Lg" bulb="No" label={p.name} image={photos[p.image]} style={{ width: 65 }} />
        </button></MapPin>)}
      </Map>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
        <StatusBar transparent />
        <div style={{ padding: '0 var(--spacing-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', height: 48, padding: '0 var(--spacing-2xl) 0 var(--spacing-xs)', borderRadius: 'var(--radius-pill)', background: 'var(--color-base-white)', boxShadow: 'var(--shadow-md)' }}>
            <ButtonIcon fill="transparent" icon="chevron-left" label="Назад" onClick={back} />
            <span className="ds-heading-h3" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title.replace(/^Спектакль «|»$/g, '')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl) var(--spacing-2xl) 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {Object.keys(PLACE_FILTERS).map((f) => <ButtonTag key={f} status={filter === f ? 'Active' : 'No active'} onClick={() => pickFilter(f)}>{f}</ButtonTag>)}
        </div>
        {shown.length === 0 && <div className="ds-body" style={{ margin: 'var(--spacing-xl) var(--spacing-2xl) 0', padding: 'var(--spacing-xl) var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', background: 'var(--color-base-white)', boxShadow: 'var(--shadow-md)' }}>Рядом нет мест в категории «{filter}»</div>}
      </div>
      {zoom}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2 }}><NavBar active={0} /><HomeIndicator /></div>
    </div>
  );
}
export function FullMapRoute() { return <FullMap routeDate="2026-04-25" />; }
