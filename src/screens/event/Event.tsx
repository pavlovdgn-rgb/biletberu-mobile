import { useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ActionMenu, AgeBadge, ButtonIcon, Button, HomeIndicator, Icon, Image, Map, MapHomePoint, MapMarker, MapPin, ReviewCard, StatusBar, TextButtons, TitlePage, type IconName } from '../../components';
import { appUrl } from '../../components/_lib/native';
import { photoSrc, photos } from '../../assets/photos';
import { Rail, Screen } from '../_shell/Screen';
import { MAIN_EVENT_ID, PLACE_GEO, eventById, eventGeo, placesNear, rub } from '../../data/mock';
import { ACTIVITIES } from '../../data/people';
import { useStore } from '../../data/store';
import { venueOf } from '../../data/venues';
import { HeroGallery } from './HeroGallery';
import { PERSONS } from '../../data/people';
import { reviewsWord, useReviews } from '../../data/reviews';
import { ABOUT } from '../../data/about';
import { EmptyState, Loading, NavBar, useBack, useFirstLoad, useOpen } from '../_shell/app';

const CAST: Array<[string, string, string]> = [['Екатерина Берцлер', 'Актриса', 'bertsler'], ['Юрий Георгиев', 'Актёр', 'georgiev'], ['Марина Вознесенская', 'Актриса', 'voznesenskaya']];
const tap = { cursor: 'pointer' } as const;

const Section = ({ children, pad = 'var(--spacing-2xl) var(--spacing-2xl) var(--spacing-3xl)', gap = 'var(--spacing-xl)' }: { children: ReactNode; pad?: string; gap?: string }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap, padding: pad, background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' }}>{children}</section>
);
const Row = ({ icon, children }: { icon: IconName; children: ReactNode }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name={icon} size={16} /><span className="ds-body">{children}</span></span>
);
const clamp = (n: number) => ({ display: '-webkit-box', WebkitLineClamp: n, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', margin: 0 });

/** Event_page 1 — карточка события (Figma `178:18849`). Событие — из `?id=` (по умолчанию главное); избранное, «Поделиться», «Купить билет» → выбор мест. */
export function Event() {
  const nav = useNavigate();
  const open = useOpen();
  const back = useBack('/main');
  const [params] = useSearchParams();
  const id = params.get('id') ?? MAIN_EVENT_ID;
  const e = eventById(id);
  const { list: revs, avg, photos: allPhotos, uniquePhotos: revPhotos, mine } = useReviews(e?.id);
  const { state, toggleFavourite, toast } = useStore();
  const ready = useFirstLoad(`event-${id}`, 400);
  const [stuck, setStuck] = useState(false);
  const [more, setMore] = useState(false);
  if (!e) return (
    <Screen header={<div style={{ background: 'var(--color-background-header)' }}><StatusBar /><ActionMenu onBack={back} /></div>} footer={<div><NavBar active={0} /><HomeIndicator /></div>}>
      <EmptyState tone="error" icon="info-circle" title="Событие не найдено" text="Возможно, оно уже прошло или ссылка устарела" action="На главную" onAction={() => nav('/main')} />
    </Screen>
  );
  const liked = state.favourites.includes(e.id);
  const like = () => { const on = toggleFavourite(e.id); toast(on ? 'Добавлено в избранное' : 'Удалено из избранного', on ? 'success' : 'info'); };
  const share = async () => {
    const url = appUrl(`/event?id=${e.id}`);
    try { if (navigator.share) await navigator.share({ title: e.title, url }); else { await navigator.clipboard.writeText(url); toast('Ссылка скопирована', 'success'); } }
    catch (err) { if ((err as Error)?.name !== 'AbortError') toast('Не удалось поделиться — попробуйте ещё раз', 'error'); }
  };
  // «Купить билет» → выбор даты (сеанса) → схема зала
  const buy = () => nav(`/sessions?id=${e.id}`);
  const main = e.id === MAIN_EVENT_ID;
  // отзывы этого мероприятия: число, средняя оценка, фото
  const venue = venueOf(e);
  // точка площадки на карте и места вокруг неё
  const here = eventGeo(e.id);
  const near = here ? placesNear(here, main) : [];
  // фото обложки: своя, затем снимки по жанру и площадка (без обложек других мероприятий); количество у каждого своё
  const gallery = (() => {
    if (main) return ['event-cover', 'gal-stage', 'gallery-0', 'gallery-1', 'gal-foyer', 'gallery-2', 'gallery-3'];
    const k = `${e.kind} ${e.title}`.toLowerCase();
    const genre = /балет/.test(k) ? ['gal-ballet', 'gal-foyer'] : /опер|классич|орган|хор|камерн|романс|рахманинов/.test(k) ? ['gal-orchestra', 'gal-foyer']
      : /театр|спектакл|мюзикл/.test(k) ? ['gal-stage', 'gal-foyer'] : /концерт|рок|джаз|электрон|фестив|dj/.test(k) ? ['gal-crowd']
      : /музе|выстав|ван гог/.test(k) ? ['gal-museum'] : /лекци|квиз/.test(k) ? ['gal-lecture'] : /экскурс|прогулк|квест|крыш/.test(k) ? ['gal-tour'] : [];
    let h = 0; for (const c of e.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const all = [...new Set([e.image, ...genre, venue.image])].filter((x) => photos[x]);
    return all.slice(0, 1 + (h % all.length));
  })();
  // главный спектакль — состав из макета; остальные — персоны, у которых это мероприятие в афише
  const cast: Array<[string, string, string, string]> = main ? CAST.map(([n, r, pid], i) => [n, r, pid, `cast-${i}`])
    : PERSONS.filter((p) => p.events.includes(e.id)).map((p) => [p.name, p.role, p.id, p.avatar]);
  const overlay = (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, background: stuck ? 'var(--color-base-white)' : 'transparent',
      borderBottom: `1px solid ${stuck ? 'var(--color-background-disabled)' : 'transparent'}`, transition: 'background-color var(--motion-duration) var(--motion-ease), border-color var(--motion-duration) var(--motion-ease)' }}>
      <StatusBar theme={stuck ? 'Light' : 'Dark'} />
      {stuck ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl) var(--spacing-xl)' }}>
          <ButtonIcon icon="chevron-left" label="Назад" onClick={back} />
          <span className="ds-heading-h3" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
          {/* те же 16 px между кнопками, что в шапке над фото (ActionMenu) */}
          <span style={{ display: 'flex', gap: 'var(--spacing-2xl)' }}><ButtonIcon icon="upload" label="Поделиться" onClick={share} /><ButtonIcon icon={liked ? 'heart-rounded-fill' : 'heart-rounded'} state={liked ? 'Active' : 'Default'} label="В избранное" onClick={like} /></span>
        </div>
      ) : <ActionMenu onBack={back} onShare={share} onLike={like} liked={liked} />}
    </div>
  );
  return (
    <Screen onScroll={(t) => setStuck(t > 300)} overlay={overlay} footer={<div>
      <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)', background: 'var(--color-base-white)' }}><Button subtitle={`от ${rub(e.priceFrom)}`} onClick={buy}>Купить билет</Button></div>
      <NavBar active={0} /><HomeIndicator />
    </div>}>
      {!ready ? <div style={{ paddingTop: 120 }}><Loading /></div> : <>
      <HeroGallery images={gallery} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', marginTop: -23, position: 'relative', paddingBottom: 'var(--spacing-xl)' }}>
        <Section pad="var(--spacing-4xl) var(--spacing-2xl) var(--spacing-3xl)" gap="var(--spacing-md)">
          <span className="ds-heading-h2">{e.title} <AgeBadge size="lg">{e.age}</AgeBadge></span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              {revs.length ? <>
                <span className="ds-price" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="star-fill-small" size={16} style={{ color: 'var(--color-primary-orange)' }} />{avg}</span>
                <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{reviewsWord(revs.length)}</span>
              </> : <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Пока нет отзывов</span>}
            </span>
            <Row icon="calendar-small">{`${e.date}, ${e.time.replace(':', '-')}`}</Row>
            <Row icon="clock-small">120 мин.</Row>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <Row icon="marker-pin-small">{e.place}</Row>
              <span className="ds-body" style={{ paddingLeft: 'var(--spacing-4xl)', color: 'var(--color-text-secondary)' }}>{main ? <>Большая Морская улица, 14 к.2,<br />метро Адмиралтейская (3 мин. пешком)</> : e.address}</span>
            </div>
          </div>
        </Section>
        <Section gap="0">
          <div style={{ margin: '0 calc(-1 * var(--spacing-2xl))' }}><TitlePage version="Secondary" title="О мероприятии" textButtonLabel="" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <p className="ds-body" style={more ? { margin: 0, whiteSpace: 'pre-line' } : { ...clamp(6), whiteSpace: 'pre-line' }}>{ABOUT[e.id] ?? `${e.title} — ${e.kind.toLowerCase()} на площадке «${e.place}».`}</p>
            <button type="button" className="ds-note" onClick={() => setMore(!more)} style={{ alignSelf: 'flex-start', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-primary-orange)' }}>{more ? 'Свернуть' : 'Читать далее'}</button>
          </div>
        </Section>
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ margin: '0 calc(-1 * var(--spacing-2xl))' }}><TitlePage version="Secondary" title={<>Отзывы <span style={{ color: 'var(--color-text-secondary)' }}>{revs.length}</span></>} textButtonLabel={revs.length ? undefined : ''} onRight={() => revs.length && nav(`/reviews?id=${e.id}`)} /></div>
            {revs.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
              <span style={{ display: 'flex', gap: 1, color: 'var(--color-primary-orange)' }}>{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name={i < Math.round(Number(avg)) ? 'star-fill' : 'star'} size={20} />)}</span>
              <span className="ds-heading-h3">{avg}</span>
            </span>}
          </div>
          {revPhotos.length > 0 && <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>{revPhotos.slice(0, 4).map((ph, i) => <button key={i} type="button" aria-label={`Фото отзыва ${i + 1}`} onClick={() => open(`/gallery?id=${e.id}&i=${allPhotos.findIndex((x) => x.src === ph.src)}`)} style={{ width: 'calc((100% - 3 * var(--spacing-md)) / 4)', height: 80, padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}><Image size="sm" src={photoSrc(ph.src)} style={{ width: '100%', height: 80 }} /></button>)}</div>}
          {revs.length > 0 ? <div style={{ margin: '0 calc(-1 * var(--spacing-2xl))' }}><Rail gap="var(--spacing-xl)">{revs.slice(0, 5).map((r) => <div key={r.id} role="link" tabIndex={0} onClick={() => nav(`/reviews?id=${e.id}&first=${r.id}`)} style={{ cursor: 'pointer', display: 'flex' }}><ReviewCard name={r.name} date={r.date} rating={r.rating} text={r.text} avatar={r.avatar ? photoSrc(r.avatar) : undefined} /></div>)}</Rail></div> : <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Отзывов пока нет. Были на мероприятии? Расскажите о нём первым</span>}
          <Button type="Secondary" size="Sm" onClick={() => nav(`/review?event=${e.id}`)}>{mine ? 'Изменить отзыв' : 'Написать отзыв'}</Button>
        </Section>
        {/* места рядом — вокруг площадки мероприятия; площадка за пределами карты — блока нет (мест там в приложении пока нет) */}
        {here && <Section pad="var(--spacing-2xl) 0 var(--spacing-3xl)">
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', padding: '0 var(--spacing-2xl) var(--spacing-xl)' }}>
            <Icon name="marker-pin" size={24} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-heading-h2">Интересные места рядом</span><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{main ? 'Большая Морская улица, 14 к.2' : e.address}</span></span>
          </div>
          <div style={{ position: 'relative', height: 254, isolation: 'isolate' }}>
            <Map height={254} designation="No" scale={400} center={here}>
              <MapPin at={here}><MapHomePoint /></MapPin>
              {near.slice(0, 18).map((p) => <MapPin key={p.id} at={PLACE_GEO[p.id]}><button type="button" aria-label={p.name} onClick={() => open(`/activity?id=${p.id}&event=${e.id}`)} style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}><MapMarker text="No" bulb="No" image={photos[p.image]} style={{ width: 36 }} /></button></MapPin>)}
            </Map>
            <TextButtons color="White" size="M" iconLeft="Yes" style={{ position: 'absolute', left: 16, top: 10, zIndex: 2 }} onClick={() => nav(`/map?id=${e.id}`)}>Открыть карту</TextButtons>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', padding: 'var(--spacing-xl) var(--spacing-2xl) 0' }}>
            {near.slice(0, 2).map((p) => (
              <div key={p.id} role="link" tabIndex={0} onClick={() => open(`/activity?id=${p.id}&event=${e.id}`)} style={{ display: 'flex', gap: 'var(--spacing-xl)', ...tap }}>
                <Image size="xxs" src={photos[p.image]} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', minWidth: 0 }}><span className="ds-price">{p.name}</span><p className="ds-body" style={{ ...clamp(2), color: 'var(--color-text-secondary)' }}>{p.time} · {ACTIVITIES[p.id]?.about.split('\n')[0] ?? p.category}</p></div>
              </div>
            ))}
            <span><TextButtons onClick={() => nav(`/map?id=${e.id}`)}>Все места рядом</TextButtons></span>
          </div>
        </Section>}
        <Section pad="var(--spacing-2xl) 0 var(--spacing-3xl)">
          <TitlePage version="Secondary" title="Площадка" textButtonLabel="" />
          <div role="link" tabIndex={0} onClick={() => open(`/venue?id=${venue.id}`)} style={{ display: 'flex', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)', ...tap }}>
            <Image size="xxs" src={photos[venue.id === 'new-comedy' ? 'nearby-2' : venue.thumb]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-price">{venue.id === 'new-comedy' ? <>Санкт-Петербургский театр<br />новой комедии</> : venue.fullName}</span><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{venue.address}</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', padding: 'var(--spacing-xl) var(--spacing-2xl) 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <span className="ds-subtitle">{venue.featuresTitle}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>{venue.features.map(([ic, t]) => <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}><Icon name={ic} size={16} /><span className="ds-body">{t}</span></span>)}</div>
            </div>
            <p className="ds-body" style={{ margin: 0, paddingTop: 'var(--spacing-xl)', whiteSpace: 'pre-line', color: 'var(--color-text-secondary)' }}>{venue.tips}</p>
          </div>
        </Section>
        {/* персоны — только те, кто участвует; нет (планетарий, выставка) — блока нет */}
        {cast.length > 0 && <Section pad="var(--spacing-2xl) 0 var(--spacing-3xl)">
          <TitlePage version="Secondary" title="Персоны" textButtonLabel="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)' }}>
            {cast.map(([n, r, pid, img]) => (
              <div key={n} role="link" tabIndex={0} onClick={() => open(`/person?id=${pid}`)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', ...tap }}>
                <Image size="xs" src={photos[img]} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}><span className="ds-price">{n}</span><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{r}</span></div>
              </div>
            ))}
          </div>
        </Section>}
      </div>
      </>}
    </Screen>
  );
}
