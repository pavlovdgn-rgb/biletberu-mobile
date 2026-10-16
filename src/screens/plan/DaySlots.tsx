import { useState } from 'react';
import { Icon, LocationCard, Map, MapHomePoint, MapMarker, MapPin, Tabs } from '../../components';
import { photos } from '../../assets/photos';
import { PLACE_GEO, type NearPlace } from '../../data/mock';
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
        : <EmptySlot title="Кофе или перекус" text="Кафе в 5–10 минутах от площадки" onClick={() => onSlot('before')} />)}
      {group(`${eventTime} · событие`, <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>{events.map((p) => <div key={p.id} role="link" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => onEvent(p)}><LocationCard photo="No" order={1} name={p.name} time={p.time} category={p.category} /></div>)}</div>)}
      {group('После', after.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>{places(after, 'after')}</div>
        : <EmptySlot title="Ужин или прогулка" text="Рестораны, бары и набережные рядом" onClick={() => onSlot('after')} />)}
    </div>
  );
}

/** Шторка слота: подборка под момент дня — сначала избранное, потом остальное рядом; «Список / На карте». */
export function SlotSheet({ slot, eventTime, venue, candidates, favourites, inPlan, replacing, onPick, onRemove, onClose }: {
  slot: Slot; eventTime: string; venue: [number, number] | null; candidates: NearPlace[]; favourites: string[]; inPlan: (id: string) => boolean;
  replacing?: string; onPick: (id: string) => void; onRemove?: () => void; onClose: () => void;
}) {
  const [view, setView] = useState(0);
  const list = candidates.filter((p) => slotOf(p.category) === slot && (!inPlan(p.id) || p.id === replacing));
  const fav = list.filter((p) => favourites.includes(`place:${p.id}`)), rest = list.filter((p) => !favourites.includes(`place:${p.id}`));
  const end = `${String((+eventTime.slice(0, 2) + 2) % 24).padStart(2, '0')}:${eventTime.slice(3, 5)}`;
  const title = slot === 'before' ? 'До начала' : 'После события';
  const sub = slot === 'before' ? `Кофе или перекус — начало в ${eventTime}, успеете пешком` : `Ужин, бар или прогулка — событие закончится около ${end}`;
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
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)', padding: 'var(--spacing-2xl) 0 var(--spacing-5xl)' }}>
        {view === 0 ? (list.length ? <>
          {section('heart-rounded-fill', 'Из избранного', fav, close)}
          {section('marker-pin', 'Рядом', rest, close)}
        </> : <span className="ds-body" style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--spacing-4xl) 0' }}>Рядом подходящих мест пока нет</span>)
          : <div style={{ position: 'relative', height: 360, borderRadius: 'var(--radius-md)', overflow: 'hidden', isolation: 'isolate', flexShrink: 0 }}>
            <Map designation="No" metro="Yes" height={360} scale={500} center={venue ?? PLACE_GEO.theatre}>
              {venue && <MapPin at={venue}><MapHomePoint radius="No" /></MapPin>}
              {list.map((p) => PLACE_GEO[p.id] && <MapPin key={p.id} at={PLACE_GEO[p.id]}><button type="button" aria-label={`${p.name} — добавить`} onClick={() => close(() => onPick(p.id))} style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}><MapMarker text="No" bulb="No" image={photos[p.image]} style={{ width: 36 }} /></button></MapPin>)}
            </Map>
          </div>}
      </div>
    </>)}</BottomSheet>
  );
}
