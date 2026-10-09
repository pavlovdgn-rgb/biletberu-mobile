import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ButtonTag, Icon, Image, Search, StatusBar, TextButtons, type IconName } from '../../components';
import { photos } from '../../assets/photos';
import { CATEGORIES, EVENTS } from '../../data/mock';
import { PERSONS, VENUES } from '../../data/people';

/** Поиск (Figma: Screens → 2, «Search — focus», «Search — suggestions»): экран поверх главной.
 *  Пустая строка — недавние запросы, популярное, категории; ввод — подсказки по событиям, площадкам и персонам с подсветкой совпадения. */
const RECENT_KEY = 'bb-search-recent';
const loadRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; } };
const saveRecent = (list: string[]) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch { /* приватный режим */ } };
export const rememberQuery = (q: string) => { const t = q.trim(); if (t.length < 2) return; saveRecent([t, ...loadRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5)); };

export const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');
const POPULAR = ['Стендап', 'Ночь в Эрмитаже', 'Щелкунчик', 'Орган при свечах', 'Квиз', 'Ван Гог'];

/** Текст с выделенным оранжевым совпадением. */
const Hl = ({ text, q }: { text: string; q: string }) => {
  const i = norm(text).indexOf(norm(q.trim()));
  if (!q.trim() || i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<span style={{ color: 'var(--color-primary-orange)' }}>{text.slice(i, i + q.trim().length)}</span>{text.slice(i + q.trim().length)}</>;
};
const Head = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--spacing-md)' }}><span className="ds-heading-h3">{children}</span>{right}</div>
);
const Row = ({ img, icon, title, sub, q, onClick }: { img?: string; icon?: IconName; title: string; sub: string; q: string; onClick: () => void }) => (
  <div role="link" tabIndex={0} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', cursor: 'pointer' }}>
    {img ? <Image size="xxs" src={img} /> : <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'var(--color-background-base)', color: 'var(--color-text-secondary)' }}><Icon name={icon!} size={20} /></span>}
    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
      <span className="ds-price" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><Hl text={title} q={q} /></span>
      <span className="ds-body" style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
    </span>
    {!img && <Icon name="chevron-right" size={20} style={{ color: 'var(--color-text-secondary)' }} />}
  </div>
);
const plural = (n: number, a: string, b: string, c: string) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; };

export function SearchPanel({ initial, onCancel, onSubmit, onCategory, onEvent, onVenue, onPerson }: {
  initial: string; onCancel: () => void; onSubmit: (q: string) => void; onCategory: (c: string) => void;
  onEvent: (id: string) => void; onVenue: (id: string) => void; onPerson: (id: string) => void;
}) {
  const [q, setQ] = useState(initial);
  const [recent, setRecent] = useState(loadRecent);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);
  const t = norm(q.trim());
  const events = t ? EVENTS.filter((e) => norm(`${e.title} ${e.kind}`).includes(t)) : [];
  const venues = t ? VENUES.filter((v) => norm(v.name).includes(t)) : [];
  const persons = t ? PERSONS.filter((p) => norm(p.name).includes(t)) : [];
  const total = events.length + venues.length + persons.length;
  const submit = (s: string) => { rememberQuery(s); onSubmit(s); };

  return (
    <div className="bb-surface-head" style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', background: 'var(--color-base-white)', animation: 'bbScreenIn 160ms var(--motion-ease)' }}>
      <StatusBar />
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) submit(q); }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-2xl)' }}>
        <Search ref={input} state={q ? 'Active' : 'Default'} value={q} maxLength={60} enterKeyHint="search" onChange={(e) => setQ(e.target.value)} onClear={() => { setQ(''); input.current?.focus(); }} style={{ flex: 1 }} />
        <TextButtons fill="No" onClick={onCancel}>Отмена</TextButtons>
      </form>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-2xl) var(--spacing-5xl)' }}>
        {!t ? (<>
          {recent.length > 0 && <>
            <Head right={<TextButtons fill="No" onClick={() => { saveRecent([]); setRecent([]); }}>Очистить</TextButtons>}>Недавние</Head>
            {recent.map((r) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                <Icon name="clock" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <button type="button" className="ds-body" onClick={() => { setQ(r); submit(r); }} style={{ flex: 1, textAlign: 'left', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-primary)' }}>{r}</button>
                <button type="button" aria-label={`Удалить «${r}»`} onClick={() => { const n = recent.filter((x) => x !== r); saveRecent(n); setRecent(n); }} style={{ display: 'inline-flex', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><Icon name="close-16px" size={16} /></button>
              </div>
            ))}
          </>}
          <Head>Популярное сейчас</Head>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>{POPULAR.map((p) => <ButtonTag key={p} onClick={() => { setQ(p); submit(p); }}>{p}</ButtonTag>)}</div>
          <Head>Категории</Head>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>{CATEGORIES.filter((c) => c !== 'Пушкинская карта').map((c) => <ButtonTag key={c} onClick={() => onCategory(c)}>{c}</ButtonTag>)}</div>
        </>) : total === 0 ? (
          <span className="ds-body" style={{ color: 'var(--color-text-secondary)', paddingTop: 'var(--spacing-md)' }}>Подсказок нет — нажмите «Найти» на клавиатуре, покажем похожее</span>
        ) : (<>
          {events.length > 0 && <><Head>События</Head>{events.slice(0, 4).map((e) => <Row key={e.id} img={photos[e.image]} title={e.title} sub={`${e.date}, ${e.time} · ${e.place}`} q={q} onClick={() => { rememberQuery(q); onEvent(e.id); }} />)}</>}
          {venues.length > 0 && <><Head>Площадки</Head>{venues.slice(0, 3).map((v) => <Row key={v.id} icon="marker-pin" title={v.name} sub={`${v.address} · ${v.events.length} ${plural(v.events.length, 'событие', 'события', 'событий')}`} q={q} onClick={() => { rememberQuery(q); onVenue(v.id); }} />)}</>}
          {persons.length > 0 && <><Head>Персоны</Head>{persons.slice(0, 3).map((p) => <Row key={p.id} icon="user" title={p.name} sub={`${p.role} · ${p.events.length} ${plural(p.events.length, 'событие', 'события', 'событий')}`} q={q} onClick={() => { rememberQuery(q); onPerson(p.id); }} />)}</>}
          <span><TextButtons fill="No" onClick={() => submit(q)}>{`Все результаты по «${q.trim()}» (${events.length})`}</TextButtons></span>
        </>)}
      </div>
    </div>
  );
}
