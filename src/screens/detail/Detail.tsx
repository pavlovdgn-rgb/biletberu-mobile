import { useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { Button, ButtonIcon, Card, HomeIndicator, Icon, PriceTag, StatusBar, TitlePage } from '../../components';
import { photos } from '../../assets/photos';
import { MAIN_EVENT_ID, eventById, placeById, priceLabel, whenLabel, type EventItem } from '../../data/mock';
import { ACTIVITIES, PERSONS, VENUES, personById, venueById } from '../../data/people';
import { ticketEvent, useStore } from '../../data/store';
import { EmptyState, NavBar, useClose } from '../_shell/app';
import { Rail, Screen } from '../_shell/Screen';

const white = { background: 'var(--color-base-white)' } as const;
const clamp = (n: number) => ({ display: '-webkit-box', WebkitLineClamp: n, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' });

/** Действия шапки: закрыть, поделиться, в избранное (ключ избранного — `kind:id`). */
function useDetailActions(favKey: string, title: string) {
  const { state, toggleFavourite, toast } = useStore();
  const liked = state.favourites.includes(favKey);
  const like = () => { const on = toggleFavourite(favKey); toast(on ? 'Добавлено в избранное' : 'Удалено из избранного', on ? 'success' : 'info'); };
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title, url }); else { await navigator.clipboard.writeText(url); toast('Ссылка скопирована', 'success'); } }
    catch (err) { if ((err as Error)?.name !== 'AbortError') toast('Не удалось поделиться', 'error'); }
  };
  return { liked, like, share };
}

const HeroButtons = ({ onClose, onShare, onLike, liked }: { onClose: () => void; onShare: () => void; onLike: () => void; liked: boolean }) => (
  <div style={{ position: 'absolute', left: 'var(--spacing-2xl)', right: 'var(--spacing-2xl)', display: 'flex', justifyContent: 'space-between', zIndex: 1 }}>
    <ButtonIcon icon="x-close" label="Закрыть" onClick={onClose} />
    <span style={{ display: 'flex', gap: 'var(--spacing-2xl)' }}>
      <ButtonIcon icon="upload" label="Поделиться" onClick={onShare} />
      <ButtonIcon icon={liked ? 'heart-rounded-fill' : 'heart-rounded'} state={liked ? 'Active' : 'Default'} label="В избранное" onClick={onLike} />
    </span>
  </div>
);

/** Страница с обложкой 332 px и белым листом поверх (Person_page / Place_page). Пока видна обложка — кнопки поверх фото;
 *  после прокрутки за обложку — белая шапка со статус-баром, заголовком и теми же кнопками (кнопки не теряются на фоне текста). */
function CoverPage({ image, favKey, title, children }: { image: string; favKey: string; title: string; children: ReactNode }) {
  const back = useClose('/main');
  const a = useDetailActions(favKey, title);
  const [stuck, setStuck] = useState(false);
  const overlay = (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, background: stuck ? 'var(--color-base-white)' : 'transparent', borderBottom: `1px solid ${stuck ? 'var(--color-background-disabled)' : 'transparent'}`,
      transition: 'background-color var(--motion-duration) var(--motion-ease), border-color var(--motion-duration) var(--motion-ease)' }}>
      <StatusBar theme={stuck ? 'Light' : 'Dark'} transparent />
      {stuck ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl) var(--spacing-xl)' }}>
          <ButtonIcon icon="x-close" label="Закрыть" onClick={back} />
          <span className="ds-heading-h3" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          <ButtonIcon icon="upload" label="Поделиться" onClick={a.share} />
          <ButtonIcon icon={a.liked ? 'heart-rounded-fill' : 'heart-rounded'} state={a.liked ? 'Active' : 'Default'} label="В избранное" onClick={a.like} />
        </div>
      ) : <div style={{ position: 'relative', height: 36 }}><HeroButtons onClose={back} onShare={a.share} onLike={a.like} liked={a.liked} /></div>}
    </div>
  );
  return (
    <Screen onScroll={(t) => setStuck(t > 250)} overlay={overlay} footer={<div><NavBar active={0} /><HomeIndicator /></div>}>
      <img src={photos[image]} alt="" style={{ display: 'block', width: '100%', height: 332, objectFit: 'cover' }} />
      <div style={{ position: 'relative', marginTop: -22, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>{children}</div>
    </Screen>
  );
}
const Sheet = ({ children, pad = 'var(--spacing-4xl) var(--spacing-2xl) var(--spacing-3xl)', gap = 'var(--spacing-md)' }: { children: ReactNode; pad?: string; gap?: string }) => (
  <section style={{ ...white, borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column', gap, padding: pad }}>{children}</section>
);
function EventsRail({ title, ids, link }: { title: string; ids: string[]; link?: () => void }) {
  const nav = useNavigate();
  const { state, toggleFavourite, toast } = useStore();
  const list = ids.map(eventById).filter((e): e is EventItem => !!e);
  return (
    <section style={{ ...white, borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-2xl) 0 var(--spacing-3xl)' }}>
      <TitlePage version="Secondary" title={title} textButtonLabel={link ? 'Все' : ''} onRight={link} />
      {list.length ? <Rail gap="var(--spacing-2xl)">{list.map((e) => (
        <Card key={e.id} title={e.title} date={whenLabel(e).replace(',', '')} place={`${e.address},`} price={priceLabel(e)} discount={e.discount ?? ''} age={e.age} rating={e.rating} image={photos[e.image]}
          liked={state.favourites.includes(e.id)} onLikeChange={() => { const on = toggleFavourite(e.id); toast(on ? 'Добавлено в избранное' : 'Удалено из избранного', on ? 'success' : 'info'); }} onClick={() => nav(`/event?id=${e.id}`)} />))}</Rail>
        : <EmptyState icon="calendar" title="Пока нет событий" text="Новые даты появятся здесь" />}
    </section>
  );
}
function Bio({ text }: { text: string }) {
  const [more, setMore] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
      <p className="ds-body" style={{ margin: 0, whiteSpace: 'pre-line', ...(more ? {} : clamp(6)) }}>{text}</p>
      <button type="button" className="ds-note" onClick={() => setMore(!more)} style={{ alignSelf: 'flex-start', border: 0, padding: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-primary-orange)' }}>{more ? 'Свернуть' : 'Читать далее'}</button>
    </div>
  );
}
const NotFound = ({ what }: { what: string }) => {
  const nav = useNavigate();
  return <Screen header={<div style={white}><StatusBar /></div>} footer={<div><NavBar active={0} /><HomeIndicator /></div>}><EmptyState tone="error" icon="info-circle" title={`${what} не найдена`} action="На главную" onAction={() => nav('/main')} /></Screen>;
};

/** Person_page (Figma `185:16181`, `185:16590`, `185:16949`) — `/person?id=`: фото, биография («Читать далее»), события с персоной. */
export function Person() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const p = personById(params.get('id') ?? PERSONS[0].id);
  if (!p) return <NotFound what="Персона" />;
  return (
    <CoverPage image={p.image} favKey={`person:${p.id}`} title={p.name}>
      <Sheet>
        <span className="ds-heading-h2">{p.name}</span>
        <span className="ds-subtitle" style={{ padding: 'var(--spacing-xl) 0 var(--spacing-xs)' }}>Биография</span>
        <Bio text={p.bio} />
      </Sheet>
      <EventsRail title="События с персоной" ids={p.events} link={() => nav(`/events?person=${p.id}`)} />
    </CoverPage>
  );
}

/** Place_page (Figma `185:17558`) — `/venue?id=`: фото, адрес, часы, описание, афиша площадки. */
export function Venue() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const v = venueById(params.get('id') ?? VENUES[0].id);
  if (!v) return <NotFound what="Площадка" />;
  return (
    <CoverPage image={v.image} favKey={`venue:${v.id}`} title={v.name}>
      <Sheet gap="var(--spacing-xl)">
        <span className="ds-heading-h2">{v.name}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <span className="ds-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="marker-pin-small" size={16} />{v.address}</span>
          <span className="ds-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="clock-small" size={16} />{v.hours}</span>
        </div>
        <p className="ds-body" style={{ margin: 0, whiteSpace: 'pre-line' }}>{v.about}</p>
      </Sheet>
      <EventsRail title="Афиша" ids={v.events} link={() => nav(`/events?venue=${v.id}`)} />
    </CoverPage>
  );
}

/** Activity_page (Figma `183:19381`) — `/activity?id=`: шторка поверх предыдущего экрана — фото, теги, часы, описание; «Добавить в план». */
export function Activity() {
  const back = useClose('/plan');
  const [params] = useSearchParams();
  const id = params.get('id') ?? 'nook';
  const place = placeById(id);
  const info = ACTIVITIES[id];
  const store = useStore();
  const a = useDetailActions(`place:${id}`, place?.name ?? '');
  if (id === 'theatre') return <Navigate to="/event" replace />;
  if (!place || !info) return <NotFound what="Активность" />;
  // День плана: из «Куда пойдём» (?date=), иначе — дата мероприятия, рядом с которым открыли активность (?event=)
  const ev = eventById(params.get('event') ?? MAIN_EVENT_ID) ?? eventById(MAIN_EVENT_ID)!;
  const date = params.get('date') ?? ev.dateISO;
  const inPlan = (store.state.plans[date] ?? []).includes(id);
  const hasTicket = store.state.tickets.some((t) => ticketEvent(t)?.dateISO === date);
  const dayText = `${Number(date.slice(8))} ${date.slice(5, 7) === '05' ? 'мая' : 'апреля'}`;
  const togglePlan = () => {
    const prev = store.state.plans[date] ?? [];
    const undo = { label: 'Отменить', onClick: () => store.setPlan(date, prev) };
    if (inPlan) { store.removeFromPlan(date, id); store.toast(`Убрано из плана на ${dayText}`, 'info', undo); return; }
    store.addToPlan(date, id);
    store.toast(hasTicket ? `Добавлено в план на ${dayText}` : `Добавлено в план на ${dayText} — он появится в «Куда пойдём» после покупки билета`, 'success', undo);
  };
  return (
    <div style={{ position: 'relative', height: 'var(--app-height, 100dvh)', overflow: 'hidden', background: 'color-mix(in srgb, var(--color-static-black) 60%, transparent)' }}>
      <StatusBar theme="Dark" />
      <div style={{ position: 'absolute', top: 62, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', overflow: 'hidden', ...white }}>
        <div style={{ position: 'absolute', top: 18, left: 0, right: 0, zIndex: 2 }}><HeroButtons onClose={back} onShare={a.share} onLike={a.like} liked={a.liked} /></div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <img src={photos[info.hero]} alt="" style={{ display: 'block', width: '100%', height: 414, objectFit: 'cover' }} />
          <div style={{ position: 'relative', marginTop: -20, ...white, borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-3xl) var(--spacing-2xl) 120px' }}>
            <span className="ds-heading-h2">{place.name}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>{info.tags.map((t) => <PriceTag key={t} tone="neutral">{t}</PriceTag>)}</div>
            <span className="ds-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="clock-small" size={16} />{info.hours}</span>
            <p className="ds-body" style={{ margin: 0, whiteSpace: 'pre-line' }}>{info.about}</p>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, ...white, borderTop: '1px solid var(--color-background-disabled)' }}>
          <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}>
            <Button type={inPlan ? 'Tertiary' : 'Primary'} onClick={togglePlan}>{inPlan ? 'Убрать из плана дня' : 'Добавить в план дня'}</Button>
          </div>
          <HomeIndicator />
        </div>
      </div>
      <style>{'@keyframes bbSheetUp{from{transform:translateY(60px);opacity:.4}to{transform:none;opacity:1}}'}</style>
    </div>
  );
}
