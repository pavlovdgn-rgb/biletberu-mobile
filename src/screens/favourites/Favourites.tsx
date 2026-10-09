import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ButtonTag, Card, HomeIndicator, LocationCard, StatusBar, Tabs, TitlePage } from '../../components';
import { photos } from '../../assets/photos';
import { PLACE_FILTERS, eventById, placeById, rub, whenLabel, type EventItem } from '../../data/mock';
import { PLACE_ADDRESS, personById, venueById } from '../../data/people';
import { useStore } from '../../data/store';
import { EmptyState, NavBar, useOpen } from '../_shell/app';
import { Screen } from '../_shell/Screen';

const TABS = ['События', 'Площадки', 'Персоны', 'Места'];
const EMPTY: Record<string, string> = { 'Площадки': 'Сохраняйте театры и музеи, чтобы следить за их афишей', 'Персоны': 'Подписывайтесь на актёров и музыкантов — подскажем, когда у них концерт', 'Места': 'Сохраняйте кафе и прогулки рядом с событиями для плана дня' };

/** favourites 1 — избранное (Figma `186:16181`). События из избранного (сердце убирает), остальные вкладки — пустые состояния. */
export function Favourites() {
  const nav = useNavigate();
  const open = useOpen();
  const { state, toggleFavourite, toast } = useStore();
  const [tab, setTab] = useState(0);
  const [placeCat, setPlaceCat] = useState('Все');
  const events = state.favourites.map(eventById).filter((e): e is EventItem => !!e);
  const unlike = (e: EventItem) => { toggleFavourite(e.id); toast('Удалено из избранного'); };

  return (
    <Screen bg="var(--color-base-white)" header={<div className="bb-surface-head"><StatusBar /><TitlePage title="Избранное" iconLeft="No" /></div>} footer={<div><NavBar active={2} /><HomeIndicator /></div>}>
      <div style={{ padding: 'var(--spacing-md) var(--spacing-2xl)' }}><Tabs tabs={TABS} active={tab} onChange={setTab} /></div>
      {tab === 0 && events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl)' }}>
          {events.map((e) => <Card key={e.id} style="Horizontal" age={e.age} title={e.title} date={whenLabel(e).replace(',', '')} place={e.address} price={`от ${rub(e.priceFrom).replace(' ₽', '₽')}`} discount={e.discount ?? ''} rating={e.rating}
            image={photos[e.image]} liked onLikeChange={() => unlike(e)} onClick={() => nav(`/event?id=${e.id}`)} />)}
        </div>
      )}
      {tab === 0 && events.length === 0 && <EmptyState icon="heart-rounded" title="В избранном пока пусто" text="Нажимайте на сердце в карточках событий — они появятся здесь" action="Смотреть афишу" onAction={() => nav('/main')} />}
      {tab > 0 && (() => {
        const prefix = ['', 'venue:', 'person:', 'place:'][tab];
        const ids = state.favourites.filter((f) => f.startsWith(prefix)).map((f) => f.slice(prefix.length));
        if (!ids.length) return <EmptyState icon="heart-rounded" title="Пока ничего нет" text={EMPTY[TABS[tab]]} />;
        // сердце на карточке убирает из избранного (Figma: favourites 2–4, Location_card с кнопкой-сердцем)
        const unfav = (id: string, what: string) => { toggleFavourite(prefix + id); toast(`${what} — убрано из избранного`); };
        const card = (key: string, img: string, title: string, to: string, extra: { subtitle?: string; address?: string }) => (
          <div key={key} role="link" tabIndex={0} onClick={() => open(to)} style={{ cursor: 'pointer' }}>
            <LocationCard button="Yes" name={title} image={photos[img]} {...extra} actionIcon="heart-rounded-fill" actionLabel="Убрать из избранного" onAction={() => unfav(key, title)} />
          </div>
        );
        const places = tab === 3 ? ids.map(placeById).filter((p): p is NonNullable<typeof p> => !!p) : [];
        // фильтр — только категории, которые есть среди избранных мест
        const cats = ['Все', ...Object.keys(PLACE_FILTERS).filter((f) => f !== 'Все' && places.some(PLACE_FILTERS[f]))];
        const shown = places.filter(PLACE_FILTERS[cats.includes(placeCat) ? placeCat : 'Все']);
        return (<>
          {tab === 3 && cats.length > 2 && (
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', overflowX: 'auto', scrollbarWidth: 'none', padding: 'var(--spacing-md) var(--spacing-2xl) 0' }}>
              {cats.map((c) => <ButtonTag key={c} status={(cats.includes(placeCat) ? placeCat : 'Все') === c ? 'Active' : 'No active'} onClick={() => setPlaceCat(c)}>{c}</ButtonTag>)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl)' }}>
            {tab === 1 && ids.map((id) => { const v = venueById(id); return v && card(id, v.thumb, v.name, `/venue?id=${id}`, { subtitle: v.address }); })}
            {tab === 2 && ids.map((id) => { const p = personById(id); return p && card(id, p.avatar, p.name, `/person?id=${id}`, { subtitle: p.role }); })}
            {tab === 3 && shown.map((pl) => card(pl.id, pl.image, pl.name, `/activity?id=${pl.id}`, { address: PLACE_ADDRESS[pl.id] ?? pl.time }))}
          </div>
        </>);
      })()}
    </Screen>
  );
}
