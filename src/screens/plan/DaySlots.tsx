import { useState } from 'react';
import { ButtonTag, Icon, LocationCard, Map, MapHomePoint, MapMarker, MapPin, Tabs } from '../../components';
import { photos } from '../../assets/photos';
import { PLACE_FILTERS, PLACE_GEO, type NearPlace } from '../../data/mock';
import { dayPlan, type PlanItem } from '../../data/store';
import { BottomSheet } from '../_shell/BottomSheet';

/** Каркас дня «До начала / событие / После» (Figma: песочница, «„Куда пойдём" — итоговый сценарий» `477:31993`).
 *  План дня — упорядоченный список: места до метки события — «до начала», после — «после». */
export type Slot = 'before' | 'after';
/** До начала — кафе; после — всё остальное (ужин, бар, прогулка, досуг). */
export const slotOf = (category: string): Slot => (category === 'Кафе' ? 'before' : 'after');
export const SLOT_LABEL: Record<Slot, string> = { before: 'до начала', after: 'после' };

/** Разложить план дня по слотам: места до события, события, места после. */
export function splitDay(items: PlanItem[]) {
  const first = items.findIndex((p) => p.kind === 'event');
  const events = items.filter((p) => p.kind === 'event');
  const before = first < 0 ? [] : items.slice(0, first).filter((p) => p.kind === 'activity');
  const after = (first < 0 ? items : items.slice(first)).filter((p) => p.kind === 'activity');
  return { before, events, after };
}
/** Порядок плана для стора: места до, метки событий, места после. */
export const planOrder = (st: Parameters<typeof dayPlan>[0], date: string, before: string[], after: string[]) =>
  [...before, ...dayPlan(st, date).events.map((e) => e.id), ...after];

/** Метка места на карте выбора: фото с подписью; избранное — сердечко, в плане — галочка, выбранная — крупнее. */
export function PickMarker({ name, image, fav, inPlan, selected }: { name: string; image?: string; fav?: boolean; inPlan?: boolean; selected?: boolean }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', transform: selected ? 'scale(1.25)' : undefined, zIndex: selected ? 2 : undefined, transition: 'transform var(--motion-duration) var(--motion-ease)' }}>
      <MapMarker size="Lg" bulb="No" label={name} image={image} style={{ width: 65 }} />
      {(fav || inPlan) && <span style={{ position: 'absolute', top: -6, right: 6, display: 'inline-flex', padding: 3, borderRadius: 'var(--radius-pill)', background: inPlan ? 'var(--color-primary-orange)' : 'var(--color-static-white)', color: inPlan ? 'var(--color-static-white)' : 'var(--color-primary-orange)', boxShadow: 'var(--shadow-sm)' }}>
        <Icon name={inPlan ? 'Essentials/check' : 'heart-rounded-fill'} size={12} /></span>}
    </span>
  );
}

const Label = ({ children }: { children: string }) => <span className="ds-caption" style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{children}</span>;

/** Пустой слот: пунктирная карточка с «＋» — тап открывает подборку под этот момент дня. */
function EmptySlot({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', width: '100%', padding: 'var(--spacing-xl) var(--spacing-2xl)', border: '1.5px dashed var(--color-background-placeholder)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
      <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-pill)', background: 'var(--color-primary-orange-10)', color: 'var(--color-primary-orange)' }}><Icon name="plus" size={20} /></span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xs)' }}><span className="ds-subtitle">{title}</span><span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>{text}</span></span>
    </button>
  );
}

/** День по порядку: подпись слота прижата к своим карточкам (6 px), между группами — 20 px. */
export function DaySlots({ items, eventTime, onSlot, onPlace, onEvent, fresh }: {
  items: PlanItem[]; eventTime: string; fresh?: string | null;
  /** Тап по пустому слоту или по месту в слоте (замена). */
  onSlot: (slot: Slot, replaceId?: string) => void;
  onPlace?: (p: PlanItem) => void;
  onEvent: (p: PlanItem) => void;
}) {
  const { before, events, after } = splitDay(items);
  const group = (label: string, body: React.ReactNode) => <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}><Label>{label}</Label>{body}</div>;
  const places = (list: PlanItem[], slot: Slot) => list.map((p) => (
    <div key={p.id} style={{ borderRadius: 'var(--radius-md)', animation: fresh === p.id ? 'bbFresh 1.6s ease-out' : undefined }}>
      {/* тап по месту — заменить его (шторка слота), стрелка — что карточка нажимается */}
      <div role="button" tabIndex={0} aria-label={`${p.name} — заменить`} onClick={() => (onPlace ? onPlace(p) : onSlot(slot, p.id))} style={{ cursor: 'pointer' }}>
        <LocationCard button="Yes" actionIcon="chevron-right" actionLabel="Заменить" name={p.name} subtitle={p.time} time={p.time} image={photos[p.image]} onAction={() => (onPlace ? onPlace(p) : onSlot(slot, p.id))} />
      </div>
    </div>
  ));
  return (
    <div id="plan-points" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)' }}>
      {group('До начала', before.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>{places(before, 'before')}</div>
        : <EmptySlot title="Добавить место до начала" text={`Например, кофе или прогулка${eventTime ? ` — начало в ${eventTime}` : ''}`} onClick={() => onSlot('before')} />)}
      {group(`${eventTime} · событие`, <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>{events.map((p) => <div key={p.id} role="link" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => onEvent(p)}><LocationCard photo="No" order={1} name={p.name} time={p.time} category={p.category} /></div>)}</div>)}
      {group('После', after.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>{places(after, 'after')}</div>
        : <EmptySlot title="Добавить место после" text="Например, ужин, бар или прогулка по набережной" onClick={() => onSlot('after')} />)}
    </div>
  );
}

/** Шторка слота: подборка под момент дня — сначала избранное, потом остальное рядом; «Список / На карте». */
export function SlotSheet({ slot, eventTime, venue, candidates, favourites, inPlan, replacing, onPick, onRemove, onDetails, onClose }: {
  slot: Slot; eventTime: string; venue: [number, number] | null; candidates: NearPlace[]; favourites: string[]; inPlan: (id: string) => boolean;
  replacing?: string; onPick: (id: string) => void; onRemove?: () => void; onDetails?: (id: string) => void; onClose: () => void;
}) {
  const [view, setView] = useState(0);
  // в слот можно поставить любое место — тип не навязываем; сузить — чипсами
  const [cat, setCat] = useState('Все');
  const all = candidates.filter((p) => !inPlan(p.id) || p.id === replacing);
  const cats = ['Все', ...Object.keys(PLACE_FILTERS).filter((c) => c !== 'Все' && all.some(PLACE_FILTERS[c]))];
  const list = all.filter(PLACE_FILTERS[cat] ?? (() => true));
  const fav = list.filter((p) => favourites.includes(`place:${p.id}`)), rest = list.filter((p) => !favourites.includes(`place:${p.id}`));
  const end = `${String((+eventTime.slice(0, 2) + 2) % 24).padStart(2, '0')}:${eventTime.slice(3, 5)}`;
  const title = slot === 'before' ? 'До начала' : 'После события';
  const sub = slot === 'before' ? `Начало в ${eventTime} — места в пешей доступности от площадки` : `Событие закончится около ${end} — места рядом с площадкой`;
  const card = (p: NearPlace, close: (after?: () => void) => void) => (
    <LocationCard key={p.id} button="Yes" remove={p.id === replacing} name={p.name} time={p.time} image={photos[p.image]} favourite={favourites.includes(`place:${p.id}`)}
      onAction={() => close(() => (p.id === replacing ? onRemove?.() : onPick(p.id)))} />
  );
  const section = (icon: 'heart-rounded-fill' | 'marker-pin', label: string, items: NearPlace[], close: (after?: () => void) => void) => items.length > 0 && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}><Icon name={icon} size={20} style={{ color: icon === 'heart-rounded-fill' ? 'var(--color-primary-orange)' : undefined }} /><span className="ds-heading-h3">{label}</span></span>
      {items.map((p) => card(p, close))}
    </div>
  );
  return (
    <BottomSheet label={title} top={92} style={{ padding: 'var(--spacing-sm) var(--spacing-2xl) 0' }} onClose={onClose}>{(close) => (<>
      <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', padding: 'var(--spacing-2xl) 0 var(--spacing-xl)' }}>
        <span className="ds-heading-h2">{title}</span>
        <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{sub}</span>
      </div>
      <Tabs tabs={['Список', 'На карте']} active={view} onChange={setView} />
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', margin: 'var(--spacing-xl) calc(-1 * var(--spacing-2xl)) 0', padding: '0 var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
        {cats.map((c) => <ButtonTag key={c} status={cat === c ? 'Active' : 'No active'} onClick={() => setCat(c)}>{c}</ButtonTag>)}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)', padding: 'var(--spacing-2xl) 0 var(--spacing-5xl)' }}>
        {view === 0 ? (list.length ? <>
          {section('heart-rounded-fill', 'Из избранного', fav, close)}
          {section('marker-pin', 'Рядом', rest, close)}
        </> : <span className="ds-body" style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--spacing-4xl) 0' }}>Рядом подходящих мест пока нет</span>)
          : <div style={{ position: 'relative', height: 420, borderRadius: 'var(--radius-md)', overflow: 'hidden', isolation: 'isolate', flexShrink: 0 }}>
            <Map designation="No" metro="Yes" height={420} scale={500} center={venue ?? PLACE_GEO.theatre}>
              {venue && <MapPin at={venue}><MapHomePoint radius="No" /></MapPin>}
              {list.map((p) => PLACE_GEO[p.id] && <MapPin key={p.id} at={PLACE_GEO[p.id]}><button type="button" aria-label={p.name} onClick={() => close(() => onDetails?.(p.id))} style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}>
                <PickMarker name={p.name} image={photos[p.image]} fav={favourites.includes(`place:${p.id}`)} /></button></MapPin>)}
            </Map>
          </div>}
      </div>
    </>)}</BottomSheet>
  );
}
