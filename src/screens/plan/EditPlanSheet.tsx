import { useEffect, useRef, useState } from 'react';
import { ButtonIcon, Button, HomeIndicator, Icon, LocationCard } from '../../components';
import { photos } from '../../assets/photos';
import { eventById } from '../../data/mock';
import { ACTIVITIES, PLACE_DIST } from '../../data/people';
import { placeKey, ticketEvent, useStore, type PlanItem } from '../../data/store';
import { BottomSheet } from '../_shell/BottomSheet';

/** Editing the plan 3 (Figma `181:20793`): «Настройка плана» — точки плана карточками с ручкой перетаскивания и корзиной,
 *  «Добавить» — шторка мест рядом. Изменения — черновик; применяются по «Сохранить изменения», крестик — отмена. */
export function EditPlanSheet({ date, title, items, onAdd, onClose }: { date: string; title: string; items: PlanItem[]; onAdd: () => void; onClose: () => void }) {
  const store = useStore();
  const [draft, setDraft] = useState(items);
  const [drag, setDrag] = useState<{ id: string; dy: number } | null>(null);
  const rows = useRef<Record<string, HTMLDivElement | null>>({});
  const startY = useRef(0);

  const remove = (p: PlanItem) => {
    if (p.kind === 'event') { store.toast('Событие по билету остаётся в плане — его можно только переставить'); return; }
    setDraft(draft.filter((x) => x.id !== p.id));
  };
  // Перетаскивание: сразу — за ручку ⋮⋮ (или мышью), на тач-экране по карточке — после удержания 300 мс;
  // обычный свайп по карточке прокручивает список (как в iOS)
  const hold = useRef<{ t: number; x: number; y: number; id: string; el: HTMLElement; pid: number } | null>(null);
  const dragging = useRef(false);
  const begin = (id: string, y: number, el: HTMLElement, pid: number) => {
    startY.current = y; dragging.current = true; setDrag({ id, dy: 0 });
    try { el.setPointerCapture(pid); } catch { /* указатель уже отпущен */ }
    navigator.vibrate?.(10);
  };
  const onDown = (e: React.PointerEvent, id: string) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const el = e.currentTarget as HTMLElement;
    const onHandle = !!(e.target as HTMLElement).closest('[data-handle]');
    if (e.pointerType === 'mouse' || onHandle) { begin(id, e.clientY, el, e.pointerId); return; }
    const t = window.setTimeout(() => { const h = hold.current; hold.current = null; if (h) begin(h.id, h.y, h.el, h.pid); }, 300);
    hold.current = { t, x: e.clientX, y: e.clientY, id, el, pid: e.pointerId };
  };
  const cancelHold = () => { if (hold.current) { clearTimeout(hold.current.t); hold.current = null; } };
  const end = () => { cancelHold(); dragging.current = false; setDrag(null); };
  // во время перетаскивания страница не должна прокручиваться (iOS: только непассивный touchmove)
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = list.current; if (!el) return;
    // на тач-экране двигаем карточку по touchmove: после удержания браузер может отдать указатель прокрутке (pointercancel)
    const stop = (ev: TouchEvent) => { if (dragging.current) { ev.preventDefault(); moveRef.current(ev.touches[0].clientY); } };
    const up = () => { if (dragging.current) endRef.current(); };
    el.addEventListener('touchmove', stop, { passive: false });
    el.addEventListener('touchend', up); el.addEventListener('touchcancel', up);
    return () => { el.removeEventListener('touchmove', stop); el.removeEventListener('touchend', up); el.removeEventListener('touchcancel', up); };
  }, []);
  const onMove = (e: React.PointerEvent) => {
    const hl = hold.current;
    if (hl && Math.hypot(e.clientX - hl.x, e.clientY - hl.y) > 8) cancelHold(); // палец поехал до удержания — это прокрутка
    if (e.pointerType !== 'touch') moveTo(e.clientY);
  };
  const moveTo = (y: number) => {
    if (!drag) return;
    const dy = y - startY.current;
    const i = draft.findIndex((x) => x.id === drag.id);
    const el = rows.current[drag.id]; if (!el) return;
    const h = el.offsetHeight + 12;
    // перешли середину соседа — меняем местами
    if (dy > h / 2 && i < draft.length - 1) { const n = [...draft]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; setDraft(n); startY.current += h; setDrag({ id: drag.id, dy: dy - h }); return; }
    if (dy < -h / 2 && i > 0) { const n = [...draft]; [n[i], n[i - 1]] = [n[i - 1], n[i]]; setDraft(n); startY.current -= h; setDrag({ id: drag.id, dy: dy + h }); return; }
    setDrag({ id: drag.id, dy });
  };
  const moveRef = useRef(moveTo); moveRef.current = moveTo;
  const endRef = useRef(end); endRef.current = end;
  const save = () => {
    store.setPlan(date, draft.map((p) => p.id));
    store.toast('План сохранён', 'success');
    onClose();
  };
  const acts = draft.filter((p) => p.kind === 'activity').length;
  // есть ли изменения: состав или порядок точек отличается от исходного
  const changed = draft.map((p) => p.id).join('|') !== items.map((p) => p.id).join('|');

  return (
    <BottomSheet label="Настройка плана" style={{ top: 123 }} onClose={onClose}>{(close) => (<>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 5px' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', margin: '0 var(--spacing-2xl)', padding: 'var(--spacing-xl) 0 var(--spacing-2xl)', borderBottom: '1px solid var(--color-background-disabled)' }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-heading-h2">Настройка плана</span><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{title}</span></span>
          <ButtonIcon size="M" icon="x-close" label="Закрыть без сохранения" onClick={() => close()} />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-5xl) var(--spacing-2xl) var(--spacing-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="ds-heading-h3" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="marker-pin" size={20} />Активности ({draft.length})</span>
            <button type="button" className="ds-note" onClick={() => close(onAdd)} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) var(--spacing-xl)', border: 0, borderRadius: 'var(--radius-lg)', background: 'var(--color-background-base)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>Добавить <Icon name="plus" size={20} /></button>
          </div>
          {draft.length > 1 && <div className="ds-body" style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', background: 'var(--color-background-base)', color: 'var(--color-text-secondary)' }}>Удерживайте и перетаскивайте карточки для изменения порядка</div>}
          <div ref={list} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }} onPointerMove={onMove} onPointerUp={end} onPointerCancel={() => { if (!dragging.current) end(); }}>
            {draft.map((p) => {
              const on = drag?.id === p.id;
              // время мероприятия — из купленного сеанса
              const ev = p.kind === 'event' ? store.state.tickets.map(ticketEvent).find((e) => e?.id === p.eventId && e?.dateISO === date) ?? eventById(p.eventId) : null;
              const hours = ev ? `${ev.time} · 120 мин.` : ACTIVITIES[p.id]?.hours ?? p.time;
              return (
                <div key={p.id} ref={(el) => { rows.current[p.id] = el; }} onPointerDown={(e) => onDown(e, p.id)} onDragStart={(e) => e.preventDefault()}
                  style={{ position: 'relative', zIndex: on ? 2 : 1, touchAction: on ? 'none' : 'pan-y', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', cursor: on ? 'grabbing' : 'grab', transform: on ? `translateY(${drag!.dy}px) scale(1.02)` : 'none', boxShadow: on ? 'var(--shadow-md)' : 'none', borderRadius: 'var(--radius-xl)', transition: on ? 'box-shadow 120ms' : 'transform 180ms var(--motion-ease)' }}>
                  {/* событие по билету — опора дня: его можно переставить, но не удалить, поэтому вместо корзины метка «Билет» */}
                  {p.kind === 'event'
                    ? <LocationCard button="No" drag="Yes" name={p.name} subtitle={hours} price="Билет" image={photos[placeKey(p) === 'theatre' ? 'marker-1' : p.image]} />
                    : <LocationCard button="Yes" drag="Yes" name={p.name} time={hours} distance={PLACE_DIST[placeKey(p)]} image={photos[p.image]} onAction={() => remove(p)} />}
                </div>
              );
            })}
          </div>
          {acts === 0 && <span className="ds-body" style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>Активностей нет — нажмите «Добавить», чтобы выбрать места рядом</span>}
        </div>
        {/* панель с кнопкой — под списком (не поверх): последняя карточка не перекрывается; перетаскиваемая карточка уходит под панель */}
        <div style={{ position: 'relative', flexShrink: 0, zIndex: 3, background: 'var(--color-base-white)', boxShadow: '0 -1px 0 var(--color-background-disabled)' }}>
          <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}><Button state={changed ? 'Default' : 'Disabled'} disabled={!changed} onClick={() => close(save)}>Сохранить изменения</Button></div>
          <HomeIndicator />
        </div>
      </>)}</BottomSheet>
  );
}
