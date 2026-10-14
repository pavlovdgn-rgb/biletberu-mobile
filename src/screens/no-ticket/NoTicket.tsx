import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, ButtonIcon, DatepickerRange, HomeIndicator, Icon, Image, StatusBar } from '../../components';
import { photos } from '../../assets/photos';
import { ruDate } from '../../data/mock';
import { TODAY, useStore, waitingPlans } from '../../data/store';
import { NavBar } from '../_shell/app';
import { Screen } from '../_shell/Screen';

/** No ticket — «Куда пойдём?» без купленных билетов (Figma `180:16711`). Пустое состояние фичи: «Выбрать мероприятие» → главная. */
export function NoTicket() {
  const nav = useNavigate();
  const { state, toast } = useStore();
  const waiting = waitingPlans(state);
  const places = (n: number) => `${n} ${n === 1 ? 'место' : n < 5 ? 'места' : 'мест'}`;
  // лента от сегодняшнего дня, сегодня выбрано
  const [date, setDate] = useState(TODAY);
  return (
    <Screen
      header={<div className="bb-surface-head" style={{ background: 'var(--color-base-white)', paddingBottom: 'calc(var(--spacing-5xl) + var(--spacing-sm))', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}>
        <StatusBar />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 var(--spacing-2xl) var(--spacing-xl) var(--spacing-5xl)' }}><span className="ds-heading-h2" style={{ flex: 1, textAlign: 'center' }}>Куда пойдём</span><ButtonIcon icon="map" label="Карта" onClick={() => toast('Купите билет — и мы покажем места рядом на карте')} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', paddingLeft: 'var(--spacing-2xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-md) 0 var(--spacing-2xl)' }}>
            <span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>Выберите день — соберём план</span>
          </div>
          <DatepickerRange state="2" from={TODAY} length={70} value={date} waitDates={waiting.map((w) => w.date)} onSelect={setDate} />
        </div>
      </div>}
      footer={<div><NavBar active={1} /><HomeIndicator /></div>}>
      <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)', minHeight: '100%', background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0' }}>
        {/* планы без билета (Figma: No ticket — plans without ticket `438:40900`): по строке на мероприятие, главное действие — «Купить билет» */}
        {waiting.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', margin: '0 var(--spacing-2xl) var(--spacing-3xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) 2px 0' }}><Icon name="route" size={24} /><span className="ds-heading-h3">Планы без билета</span></div>
          {waiting.map((w, i) => (
            <div key={w.date} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: i ? 'var(--spacing-xl)' : 0, borderTop: i ? '1px solid var(--color-background-disabled)' : 0 }}>
              <div role="link" tabIndex={0} onClick={() => w.event && nav(`/event?id=${w.event.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', cursor: 'pointer' }}>
                <Image size="xxs" src={photos[w.event?.image ?? 'nearby-2']} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', minWidth: 0 }}>
                  <span className="ds-subtitle" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.event?.title ?? 'План дня'}</span>
                  <span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>{ruDate(w.date)} · {places(w.places.length)} · нет билета</span>
                </span>
              </div>
              <Button size="Sm" onClick={() => nav(w.event ? `/sessions?id=${w.event.id}` : '/main')}>Купить билет</Button>
            </div>
          ))}
        </div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) 18px var(--spacing-sm)' }}><Icon name="ticket" size={24} /><span className="ds-heading-h3">Купленные билеты</span></div>
        <p className="ds-body" style={{ margin: 0, padding: '0 var(--spacing-2xl) 0 50px', color: 'var(--color-text-secondary)' }}>Нет купленных билетов, купите билет, чтобы спланировать свой досуг</p>
        <div style={{ padding: 'var(--spacing-2xl) 50px 0' }}><Button size="Sm" type={waiting.length ? 'Secondary' : 'Primary'} style={{ width: 'auto' }} onClick={() => nav('/main')}>Выбрать мероприятие</Button></div>
      </div>
    </Screen>
  );
}
