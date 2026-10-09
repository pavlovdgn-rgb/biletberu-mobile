import { useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { AgeBadge, Button, HomeIndicator, Icon, StatusBar, TextButtons, TitlePage } from '../../components';
import { rub, type EventItem } from '../../data/mock';
import { TODAY, ticketEvent, useStore, type RefundedTicket, type Ticket as TicketT } from '../../data/store';
import { RefundStatus, useRefundEntry } from '../refund/Refund';
import { RATING_WORDS, StarsInput } from '../review/ReviewForm';
import { EmptyState, NavBar, useBack } from '../_shell/app';
import { Screen } from '../_shell/Screen';
import { BARS } from './barcode';

const Cell = ({ k, v }: { k: string; v: string }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-lg)', padding: 'var(--spacing-xl) var(--spacing-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-background-base)' }}>
    <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{k}</span><span className="ds-subtitle">{v}</span>
  </div>
);
const Meta = ({ k, v }: { k: string; v: string }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>{k}</span><span className="ds-note">{v}</span></div>
);

function TicketCard({ t, e }: { t: TicketT; e: EventItem }) {
  const returned = 'refund' in t;
  return (
    <div style={{ flex: '0 0 100%', scrollSnapAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-2xl) 0 var(--spacing-xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)' }}>
        {/* возвращённый билет: код скрыт — по нему не пройти */}
        {returned && <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)', borderRadius: 'var(--radius-2xl)', background: 'color-mix(in srgb, var(--color-base-white) 94%, transparent)' }}>
          <span className="ds-heading-h3">Билет возвращён</span><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Штрихкод больше не действует</span></div>}
        <svg width="192" height="76" viewBox="0 0 192 76" aria-label={`Штрихкод ${t.code}`}>{BARS.map(([x, w]) => <rect key={x} x={x} y={0} width={w} height={76} fill="var(--color-text-primary)" />)}</svg>
        <span className="ds-tiny">{t.code}</span>
      </div>
      <div style={{ margin: '0 var(--spacing-3xl)', borderTop: '1px dashed var(--color-text-disabled)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', padding: 'var(--spacing-2xl) var(--spacing-2xl) 0', borderRadius: 'var(--radius-xl)', background: 'var(--color-base-white)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-3xl)', borderBottom: '1px solid var(--color-background-disabled)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}><span className="ds-heading-h2">{e.title}</span><AgeBadge size="lg">{e.age}</AgeBadge></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>Владелец билета</span><span className="ds-note">{t.owner}</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-3xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="calendar-small" size={16} /><span className="ds-note">{e.date} 2026 в {e.time}</span></span>
            <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{e.place}</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}><Cell k="Тип" v={t.zone} /><Cell k="Ряд" v={t.row} /><Cell k="Место" v={t.place} /></div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}><Meta k="Стоимость" v={rub(t.price)} /><Meta k="Тариф" v={t.tariff} /><span style={{ flex: 1 }} /></div>
        </div>
      </div>
    </div>
  );
}

/** Файл .ics для «В календарь». */
function downloadIcs(e: EventItem) {
  const start = `${e.dateISO.replace(/-/g, '')}T${e.time.replace(':', '')}00`;
  const end = `${e.dateISO.replace(/-/g, '')}T${String(Number(e.time.slice(0, 2)) + 2).padStart(2, '0')}${e.time.slice(3)}00`;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bilet Beru//RU', 'BEGIN:VEVENT', `UID:${e.id}-${start}@bilet-beru`, `DTSTART;TZID=Europe/Moscow:${start}`, `DTEND;TZID=Europe/Moscow:${end}`, `SUMMARY:${e.title}`, `LOCATION:${e.place}, ${e.address}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = `${e.id}.ics`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Ticket — билеты события на весь экран (Figma `180:16493`): открываются из списка «Мои билеты» (`/ticket?event=<id>`), несколько билетов листаются свайпом;
 *  «В календарь» (.ics), «Поделиться»; «назад» — к списку. Без `event` — все билеты (старые ссылки). */
export function Ticket() {
  const nav = useNavigate();
  const { state, toast } = useStore();
  const [params] = useSearchParams();
  const back = useBack('/tickets');
  const only = params.get('event'), onDate = params.get('date');
  const { open: openRefund, sheet } = useRefundEntry();
  const list = [...state.tickets, ...state.refunded].map((t) => ({ t, e: ticketEvent(t) })).filter(({ t, e }) => (!only || t.eventId === only) && (!onDate || e?.dateISO === onDate)).filter((x): x is { t: TicketT; e: EventItem } => !!x.e);
  const active = list.filter(({ t }) => !('refund' in t));
  const returned = list.map(({ t }) => t).filter((t): t is RefundedTicket => 'refund' in t);
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const cur = list[Math.min(i, list.length - 1)];
  const goTo = (n: number) => { const el = track.current; if (el) el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' }); };
  // Перетаскивание мышью как свайп: тянем билет курсором, отпускаем — доводим до ближайшего (или следующего при рывке)
  const drag = useRef<{ x: number; left: number; t: number } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !track.current) return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft, t: performance.now() };
    track.current.style.scrollSnapType = 'none'; track.current.style.cursor = 'grabbing';
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => { const d = drag.current, el = track.current; if (d && el) el.scrollLeft = d.left - (e.clientX - d.x); };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current, el = track.current; if (!d || !el) return; drag.current = null;
    const dx = e.clientX - d.x, w = el.clientWidth, fast = Math.abs(dx) / (performance.now() - d.t) > 0.4;
    const base = Math.round(d.left / w);
    let n = Math.abs(dx) > w * 0.2 || (fast && Math.abs(dx) > 30) ? base + (dx < 0 ? 1 : -1) : base;
    n = Math.max(0, Math.min(list.length - 1, n));
    el.style.cursor = 'grab'; el.scrollTo({ left: n * w, behavior: 'smooth' });
    setTimeout(() => { if (track.current) track.current.style.scrollSnapType = 'x mandatory'; }, 400);
  };
  const share = async () => {
    if (!cur) return;
    const text = `${cur.e.title} — ${cur.e.date} в ${cur.e.time}, ${cur.e.place}`;
    try { if (navigator.share) await navigator.share({ title: 'Мой билет', text }); else { await navigator.clipboard.writeText(text); toast('Данные билета скопированы', 'success'); } }
    catch (err) { if ((err as Error)?.name !== 'AbortError') toast('Не удалось поделиться', 'error'); }
  };

  return (
    // событие без билетов (например, после сброса данных) — обратно к списку
    only && !list.length ? <Navigate to="/tickets" replace /> :
    <Screen header={<div><StatusBar /><TitlePage title={list.length > 1 ? `Билеты · ${list.length}` : 'Билет'} iconLeft="Yes" onLeft={back} /></div>} footer={<div><NavBar active={3} /><HomeIndicator /></div>} overlay={sheet}>
      {!list.length ? (
        <div style={{ margin: 'var(--spacing-xl) var(--spacing-2xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)' }}>
          <EmptyState icon="ticket" title="Здесь появятся ваши билеты" text="Купите билет — он сохранится в приложении и будет доступен без интернета" action="Выбрать мероприятие" onAction={() => nav('/main')} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)', padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            <div ref={track} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onDragStart={(e) => e.preventDefault()} onScroll={(ev) => setI(Math.round(ev.currentTarget.scrollLeft / ev.currentTarget.clientWidth))}
              style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', cursor: list.length > 1 ? 'grab' : undefined, userSelect: 'none' }}>
              {list.map(({ t, e }) => <TicketCard key={t.id} t={t} e={e} />)}
            </div>
            {list.length > 1 && <div role="tablist" aria-label="Билеты" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)' }}>
              {list.map(({ t }, n) => <button key={t.id} type="button" role="tab" aria-selected={n === i} aria-label={`Билет ${n + 1}`} onClick={() => goTo(n)}
                style={{ width: n === i ? 24 : 8, height: 8, padding: 0, border: 0, cursor: 'pointer', borderRadius: 'var(--radius-sm)', background: n === i ? 'var(--color-primary-orange)' : 'var(--color-text-disabled)', transition: 'width var(--motion-duration) var(--motion-ease)' }} />)}
            </div>}
          </div>
          {active.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-5xl)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignSelf: 'stretch' }}>
              <Button type="Tertiary" size="Sm" content="Icon" icon="calendar-small" onClick={() => { downloadIcs(cur.e); toast('Событие добавлено в календарь', 'success'); }}>В календарь</Button>
              <Button type="Tertiary" size="Sm" content="Icon" icon="upload-small" onClick={share}>Поделиться</Button>
            </div>
            {/* тихий вход в возврат: решение «не пойду» принимают, глядя на билет */}
            {cur.e.dateISO >= TODAY && <TextButtons fill="No" onClick={() => openRefund(active[0].e)}>{active.length > 1 ? 'Вернуть билеты' : 'Вернуть билет'}</TextButtons>}
            {/* прошедшее событие — сразу оценить: тап по звезде открывает отзыв с этой оценкой */}
            {cur.e.dateISO < TODAY && (() => { const mine = state.myReviews[cur.e.id]; return (
              <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-3xl) var(--spacing-2xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)' }}>
                <span className="ds-heading-h3" style={{ textAlign: 'center' }}>{mine ? `Ваша оценка — ${RATING_WORDS[mine.rating].toLowerCase()}` : 'Как вам мероприятие?'}</span>
                <StarsInput size={32} value={mine?.rating ?? 0} onChange={(n) => nav(`/review?event=${cur.e.id}${mine ? '' : `&rating=${n}`}`)} />
                {mine && <TextButtons fill="No" onClick={() => nav(`/review?event=${cur.e.id}`)}>Изменить отзыв</TextButtons>}
              </div>); })()}
          </div>}
          {returned.length > 0 && <RefundStatus list={returned} />}
        </div>
      )}
    </Screen>
  );
}
