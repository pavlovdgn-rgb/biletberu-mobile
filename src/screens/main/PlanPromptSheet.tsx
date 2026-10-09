import { useState } from 'react';
import { Button, ButtonIcon, HomeIndicator, TextButtons } from '../../components';
import { photos } from '../../assets/photos';
import { eventById, placeById, sessionEvent, weekday } from '../../data/mock';

/** Места рядом для превью: id → подпись «когда · сколько идти». */
const NEARBY: Array<[string, string, string]> = [['nook', 'Кофейня Nook & Bean', 'до начала · 6 мин'], ['boat', 'Прогулка на катере', 'после · 3 мин'], ['peacock', 'Ресторан Алый павлин', 'ужин · 15 мин']];

/** Main — plan day prompt (Figma `286:16867`): шторка после покупки — «Спланировать день» на дату билета. */
export function PlanPromptSheet({ eventId, dateISO, onPlan, onClose }: { eventId: string; /** Дата купленного сеанса. */ dateISO?: string; onPlan: (dateISO: string) => void; onClose: () => void }) {
  const base = eventById(eventId);
  const e = base && sessionEvent(base, { dateISO });
  const [closing, setClosing] = useState(false);
  if (!e) return null;
  const w = weekday(e.dateISO);
  const wd = w.wd.charAt(0).toUpperCase() + w.wd.slice(1);
  const p0 = e.place.replace('Санкт-Петербургский ', '');
  const placeShort = p0.charAt(0).toUpperCase() + p0.slice(1);
  const close = (then: () => void) => { setClosing(true); setTimeout(then, 220); };
  return (
    <div className={closing ? 'bb-dim--out' : 'bb-dim'} style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--color-static-black) 60%, transparent)' }}>
      <div onClick={() => close(onClose)} style={{ position: 'absolute', inset: 0 }} />
      <div role="dialog" aria-label="Спланировать день" className={closing ? 'bb-sheet--out' : 'bb-sheet'} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', padding: 'var(--spacing-md) var(--spacing-2xl) 0', background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
        <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span className="ds-heading-h2">Билет у вас! Спланируем день?</span>
            <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Маршрут соберём на {e.date} — дату вашего билета</span>
          </span>
          <ButtonIcon size="M" icon="x-close" label="Закрыть" onClick={() => close(onClose)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-xl) var(--spacing-md) var(--spacing-md)', borderRadius: 'var(--radius-lg)', background: 'var(--color-background-base)' }}>
          <img src={photos[e.id === 'weekend' ? 'marker-1' : e.image]} alt="" style={{ width: 48, height: 48, flexShrink: 0, objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
          <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xs)' }}>
            <span className="ds-note" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title.replace(/^Спектакль «|»$/g, '')}</span>
            <span className="ds-caption" style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wd}, {e.date} · {e.time} · {placeShort}</span>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <span className="ds-heading-h3">{e.kind === 'Театр' ? 'Рядом с театром' : 'Рядом с площадкой'}</span>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            {NEARBY.map(([id, name, hint]) => (
              <span key={id} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <img src={photos[placeById(id)!.image]} alt="" style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                <span className="ds-small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span className="ds-caption" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{hint}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-3xl)' }}>
          <Button onClick={() => close(() => onPlan(e.dateISO))}>Спланировать день</Button>
          <TextButtons fill="No" onClick={() => close(onClose)}>Не сейчас</TextButtons>
        </div>
        <div style={{ margin: '0 calc(-1 * var(--spacing-2xl))' }}><HomeIndicator /></div>
      </div>
    </div>
  );
}
