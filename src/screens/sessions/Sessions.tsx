import { Fragment } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AgeBadge, Button, HomeIndicator, Icon, StatusBar, TitlePage } from '../../components';
import { MAIN_EVENT_ID, eventById, rub, sessionEvent, sessionsOf, weekday } from '../../data/mock';
import { TODAY, useStore } from '../../data/store';
import { NavBar, useBack } from '../_shell/app';
import { Screen } from '../_shell/Screen';
import { WhenBadge } from '../order-form/OrderForm';

const card = { background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' } as const;
// в макете «Апрель», но «Мая» — приводим к одному падежу
const MONTH = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

/** placing an order_1 2 (Figma `179:16210`): «Выберите дату» — сеансы мероприятия; кнопка с ценой → схема зала на выбранный сеанс.
 *  Шаг между «Купить билет» и выбором мест. */
export function Sessions() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const back = useBack('/event');
  const { startCart } = useStore();
  const e = eventById(params.get('id') ?? MAIN_EVENT_ID) ?? eventById(MAIN_EVENT_ID)!;
  const sessions = sessionsOf(e).filter((s) => s.dateISO >= TODAY);
  const pick = (s: (typeof sessions)[number]) => { startCart(e.id, s); nav(`/seats?id=${e.id}`); };

  return (
    <Screen header={<div className="bb-surface-head" style={{ background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}><StatusBar /><TitlePage title="Оформление заказа" iconLeft="Yes" onLeft={back} /></div>}
      footer={<div><NavBar active={0} /><HomeIndicator /></div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0 var(--spacing-4xl)' }}>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h3">{e.title}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="marker-pin-small" size={16} /><span className="ds-body">{e.place}</span></span>
            <span className="ds-body" style={{ paddingLeft: 'var(--spacing-4xl)', color: 'var(--color-text-secondary)' }}>{e.address}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xl)' }}><AgeBadge size="lg">{e.age}</AgeBadge><WhenBadge e={e} /></div>
        </section>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', padding: 'var(--spacing-4xl) var(--spacing-2xl) var(--spacing-xl)' }}>
          <span className="ds-heading-h2" style={{ paddingBottom: 'var(--spacing-xl)' }}>Выберите дату</span>
          {sessions.map((s, i) => {
            const se = sessionEvent(e, s), w = weekday(s.dateISO);
            return (
              <Fragment key={s.dateISO}>
                {i > 0 && <span style={{ height: 1, background: 'var(--color-background-disabled)', margin: 'var(--spacing-xl) 0' }} />}
                <div style={{ display: 'flex', gap: 'var(--spacing-2xl)' }}>
                  <div style={{ width: 68, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                    <span className="ds-display">{+s.dateISO.slice(8)}</span>
                    <span className="ds-note">{MONTH[+s.dateISO.slice(5, 7) - 1]}</span>
                    <span className="ds-note" style={{ color: w.weekend ? 'var(--color-system-error)' : 'var(--color-text-secondary)' }}>{w.wd}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    <span className="ds-heading-h3">{se.time.replace(':', '-')}</span>
                    <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{e.place}</span>
                    <div style={{ paddingTop: 'var(--spacing-md)' }}><Button size="Sm" onClick={() => pick(s)} aria-label={`${se.date}, ${se.time} — от ${rub(e.priceFrom)}`}>от {rub(e.priceFrom)}</Button></div>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </section>
      </div>
    </Screen>
  );
}
