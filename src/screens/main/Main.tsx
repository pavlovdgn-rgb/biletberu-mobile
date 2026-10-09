import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BannerImage, ButtonTag, Card, DatepickerRange, HomeIndicator, Icon, LocationAndProfile, Search, StatusBar, Story as StoryCard, TextButtons, TitlePage } from '../../components';
import { photos } from '../../assets/photos';
import { BANNER_IDS, CATEGORIES, CATEGORY_MATCH, COLLECTION_IDS, EVENTS, INTEREST_IDS, STORIES, eventById, eventsWord, priceLabel, rub, weekday, whenLabel, type EventItem } from '../../data/mock';
import { TODAY, applyFilters, ticketEvent, filtersActive, useStore } from '../../data/store';
import { BannerCarousel } from '../_shell/BannerCarousel';
import { CalendarSheet, dateLabel } from '../filter/CalendarSheet';
import { SearchPanel, norm } from './SearchPanel';
import { VENUES } from '../../data/people';
import { PlanPromptSheet } from './PlanPromptSheet';
import { EmptyState, Loading, NavBar, useFirstLoad, useOpen } from '../_shell/app';
import { Rail, Screen } from '../_shell/Screen';

const section = { background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' } as const;
/** Сторис → подборка событий. */
const STORY_MATCH: Array<(e: EventItem) => boolean> = [CATEGORY_MATCH['Концерты'], CATEGORY_MATCH['Выставки'], (e) => e.dateISO >= '2026-04-25' && e.dateISO <= '2026-04-26', (e) => /двоих|Двое/.test(e.title), CATEGORY_MATCH['Театры']];

/** Main 1 — главная (Figma `178:16210`). Поиск, сторис, баннеры, теги и дата фильтруют события; карточки ведут в событие, сердце — в избранное. */
export function Main() {
  const nav = useNavigate();
  const openModal = useOpen();
  const { state, toggleFavourite, toast, resetFilters, dismissPlanPrompt } = useStore();
  const ready = useFirstLoad('main');
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [story, setStory] = useState<number | null>(null);
  // выбранный день: из ленты дат или из шторки календаря (ISO, может быть и май)
  const [day, setDay] = useState<string | null>(null);
  const [cal, setCal] = useState(false);
  // «Все» у подборки — показать её целиком в режиме результатов
  const [pick, setPick] = useState<{ title: string; ids: string[] } | null>(null);
  const filtered = filtersActive(state.filters);

  const mode = query.trim() ? `«${query.trim()}»` : story !== null ? STORIES[story].replace('- ', '-') : pick ? pick.title : tag ?? (day ? dateLabel(day) : filtered ? 'По фильтрам' : null);
  const results = useMemo(() => {
    let list = filtered ? applyFilters(state.filters) : EVENTS;
    if (query.trim().length) { const q = norm(query); list = list.filter((e) => norm(`${e.title} ${e.place} ${e.address} ${e.kind}`).includes(q)); }
    if (story !== null) list = list.filter(STORY_MATCH[story]);
    if (tag) list = list.filter(CATEGORY_MATCH[tag]);
    if (day) list = list.filter((e) => e.dateISO === day);
    if (pick) list = pick.ids.map((id) => list.find((e) => e.id === id)).filter((e): e is EventItem => !!e);
    return list;
  }, [filtered, state.filters, query, story, tag, day, pick]);
  // Пустой день в ленте дат: предлагаем ближайшие даты, где есть события
  const onlyDay = !!day && !query.trim() && story === null && !tag && !pick && !filtered;
  const DayEmpty = () => {
    const iso = day ?? '';
    const dist = (d: string) => Math.abs(Date.parse(d) - Date.parse(iso));
    const past = iso < TODAY;
    const dates = [...new Set(EVENTS.map((e) => e.dateISO).filter((d) => d >= TODAY))].sort((a, b) => dist(a) - dist(b) || a.localeCompare(b)).slice(0, 4).sort();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-pill)', background: 'var(--color-background-base)', color: 'var(--color-text-secondary)' }}><Icon name="calendar" size={24} /></span>
        <span className="ds-heading-h3">{past ? `${dateLabel(iso)} уже прошло` : `На ${dateLabel(iso)} событий нет`}</span>
        <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Выберите другую дату — ближайшие с событиями:</span>
        <span style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--spacing-md)' }}>
          {dates.map((d) => { const n = EVENTS.filter((e) => e.dateISO === d).length; return <ButtonTag key={d} onClick={() => setDay(d)}>{`${dateLabel(d)} · ${eventsWord(n)}`}</ButtonTag>; })}
        </span>
        <TextButtons fill="No" onClick={clearAll}>Показать всю афишу</TextButtons>
      </div>
    );
  };
  // Search — nothing found (Figma Screens → 2): похожие запросы и ближайшие события на выходных, а не тупик
  const QueryEmpty = () => {
    const words = norm(query).split(/\s+/).filter((w) => w.length >= 3);
    const pool = [...new Set([...VENUES.map((v) => v.name), ...EVENTS.map((e) => e.kind), 'Балет', 'Эрмитаж', 'Стендап', 'Джаз'])];
    // «Ермитаж» → «Эрмитаж»: совпадение по трём буквам подряд из любого слова запроса
    const like = pool.filter((p) => words.some((w) => { const n = norm(p); for (let i = 0; i + 3 <= w.length; i++) if (n.includes(w.slice(i, i + 3))) return true; return false; })).slice(0, 4);
    const weekend = EVENTS.filter((e) => e.dateISO >= TODAY && weekday(e.dateISO).weekend).sort((a, b) => a.dateISO.localeCompare(b.dateISO)).slice(0, 2);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl) var(--spacing-2xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-2xl) 0', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-pill)', background: 'var(--color-background-base)', color: 'var(--color-text-secondary)' }}><Icon name="search" size={24} /></span>
          <span className="ds-heading-h3">По «{query.trim()}» ничего нет</span>
          <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Попробуйте короче или другими словами</span>
        </div>
        {like.length > 0 && <><span className="ds-heading-h3">Возможно, вы искали</span>
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>{like.map((l) => <ButtonTag key={l} onClick={() => setQuery(l)}>{l}</ButtonTag>)}</span></>}
        <span className="ds-heading-h3">Ближайшие на выходных</span>
        {weekend.map(hcard)}
        {filtered && <TextButtons fill="No" onClick={clearAll}>Сбросить фильтры</TextButtons>}
      </div>
    );
  };
  const clearAll = () => { setQuery(''); setTag(null); setStory(null); setDay(null); setPick(null); resetFilters(); };

  const open = (e: EventItem) => nav(`/event?id=${e.id}`);
  const like = (e: EventItem) => { const on = toggleFavourite(e.id); toast(on ? 'Добавлено в избранное' : 'Удалено из избранного', on ? 'success' : 'info'); };
  const liked = (id: string) => state.favourites.includes(id);
  const hcard = (e: EventItem) => <Card key={e.id} style="Horizontal" age={e.age} title={e.title} date={whenLabel(e)} place={e.address} price={`от ${rub(e.priceFrom).replace(' ₽', '₽')}`} discount={e.discount ?? ''} rating={e.rating} image={photos[e.image]} liked={liked(e.id)} onLikeChange={() => like(e)} onClick={() => open(e)} />;

  return (
    <Screen onScroll={(t) => setCollapsed(t > 24)}
      overlay={(searching && <SearchPanel initial={query} onCancel={() => setSearching(false)}
        onSubmit={(q) => { setQuery(q); setTag(null); setStory(null); setPick(null); setSearching(false); }}
        onCategory={(c) => { setQuery(''); setTag(c); setSearching(false); }}
        onEvent={(id) => { setSearching(false); nav(`/event?id=${id}`); }}
        onVenue={(id) => { setSearching(false); openModal(`/venue?id=${id}`); }}
        onPerson={(id) => { setSearching(false); openModal(`/person?id=${id}`); }} />)
        || (cal && <CalendarSheet value={day} ticketDays={[...new Set(state.tickets.map((t) => ticketEvent(t)?.dateISO).filter((d): d is string => !!d))]}
        actionLabel={(v) => `Показать события ${dateLabel(v)}`} onClose={() => setCal(false)} onApply={(v) => { setDay(v); setCal(false); }} />)
        || (state.planPrompt && <PlanPromptSheet eventId={state.planPrompt.eventId} dateISO={state.planPrompt.dateISO} onClose={dismissPlanPrompt} onPlan={(d) => { dismissPlanPrompt(); nav(`/plan?date=${d}`); }} />)}
      header={<div className="bb-surface-head">
        <StatusBar />
        <div style={{ background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)', paddingBottom: 'var(--spacing-3xl)', paddingTop: collapsed ? 'var(--spacing-md)' : 0, transition: 'padding-top 220ms var(--motion-ease)' }}>
          <div style={{ display: 'grid', gridTemplateRows: collapsed ? '0fr' : '1fr', opacity: collapsed ? 0 : 1, transition: 'grid-template-rows 220ms var(--motion-ease), opacity 160ms var(--motion-ease)' }}>
            <div style={{ overflow: 'hidden' }}><LocationAndProfile city={state.profile.user.city} avatar={photos.avatar} onProfile={() => nav('/profile')} /></div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', padding: '0 var(--spacing-2xl)' }}>
            {/* тап по строке — экран поиска поверх главной (недавние, популярное, подсказки) */}
            <Search value={query} maxLength={60} readOnly onFocus={(e) => { e.currentTarget.blur(); setSearching(true); }} onClick={() => setSearching(true)} state={query ? 'Active' : 'Default'} onClear={() => setQuery('')} />
            <button type="button" aria-label="Фильтры" onClick={() => nav('/filter')} style={{ position: 'relative', width: 40, height: 40, flexShrink: 0, border: 0, borderRadius: 'var(--radius-lg)', background: 'var(--color-background-base)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              <Icon name="settings" />
              {filtered && <span aria-label="Фильтры включены" style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--color-primary-orange)' }} />}
            </button>
          </div>
        </div>
      </div>}
      footer={<div><NavBar active={0} /><HomeIndicator /></div>}>
      {!ready ? <Loading /> : mode ? (
        <section style={{ ...section, marginTop: 'var(--spacing-xl)', minHeight: '100%', padding: 'var(--spacing-2xl) 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', padding: '0 var(--spacing-2xl) var(--spacing-xl)' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xs)', minWidth: 0 }}>
              <span className="ds-heading-h2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mode}</span>
              <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Найдено {eventsWord(results.length)}</span>
            </span>
            <TextButtons onClick={clearAll}>Сбросить</TextButtons>
          </div>
          {results.length
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)' }}>{results.map(hcard)}</div>
            : onlyDay ? <DayEmpty /> : query.trim() ? <QueryEmpty /> : <EmptyState title="Ничего не найдено" text="Попробуйте изменить запрос или сбросить фильтры" action="Сбросить всё" onAction={clearAll} />}
        </section>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)' }}>
          <section style={{ ...section, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', padding: 'var(--spacing-4xl) 0 var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)' }}>
              <Rail>{STORIES.map((t, i) => <StoryCard key={t} title={t} src={photos[`story-${i}`]} onClick={() => openModal(`/story?i=${i}`)} />)}</Rail>
              <BannerCarousel>{BANNER_IDS.map((id) => { const e = eventById(id)!; return <BannerImage key={id} title={id === 'culture' ? 'Культурная подборка' : id === 'weekend' ? 'Выходные  без телефона' : e.title} date={id === 'culture' ? 'с 20-26 апреля' : `${e.date} ${e.time.replace(':', '-')}`} age={id === 'culture' ? undefined : e.age} image={photos[e.image]} onClick={() => open(e)} />; })}</BannerCarousel>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md) var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-2xl)' }}>
              {CATEGORIES.map((t) => <ButtonTag key={t} status={tag === t ? 'Active' : 'No active'} onClick={() => setTag(tag === t ? null : t)}>{t}</ButtonTag>)}
            </div>
          </section>
          <section style={{ ...section, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-5xl) 0 var(--spacing-3xl)' }}>
            {/* лента дат от сегодняшнего дня (как в «Куда пойдём»; сегодня выделено, пока день не выбран) + «Календарь» справа от месяца → шторка с месяцем (Figma: Main 1, Main — calendar) */}
            <div style={{ position: 'relative', padding: '0 0 var(--spacing-xl) var(--spacing-2xl)' }}>
              <DatepickerRange from={TODAY} length={70} value={day ?? TODAY} onSelect={setDay} />
              <TextButtons fill="No" iconLeft="Yes" iconLeftName="calendar" onClick={() => setCal(true)} style={{ position: 'absolute', top: -4, right: 'var(--spacing-2xl)' }}>Календарь</TextButtons>
            </div>
            <TitlePage version="Secondary" title="По вашим интересам" onRight={() => setTag('Экскурсии')} />
            <Rail gap="var(--spacing-2xl)">{INTEREST_IDS.map((id) => { const e = eventById(id)!; return (
              <Card key={id} title={e.title} date={whenLabel(e)} place={e.address} price={priceLabel(e)} age={e.age} rating={e.rating} image={photos[e.image]} liked={liked(id)} onLikeChange={() => like(e)} onClick={() => open(e)} />); })}</Rail>
          </section>
          <section style={{ ...section, display: 'flex', flexDirection: 'column', padding: 'var(--spacing-2xl) 0 var(--spacing-3xl)' }}>
            <TitlePage version="Secondary" title="Подборки событий" onRight={() => setPick({ title: 'Подборки событий', ids: COLLECTION_IDS })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xs) var(--spacing-2xl) 0' }}>
              {COLLECTION_IDS.map((id) => hcard(eventById(id)!))}
            </div>
          </section>
        </div>
      )}
    </Screen>
  );
}
