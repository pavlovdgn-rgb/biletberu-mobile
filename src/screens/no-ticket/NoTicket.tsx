import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, ButtonIcon, DatepickerRange, HomeIndicator, Icon, StatusBar } from '../../components';
import { TODAY, useStore } from '../../data/store';
import { NavBar } from '../_shell/app';
import { Screen } from '../_shell/Screen';

/** No ticket — «Куда пойдём?» без купленных билетов (Figma `180:16711`). Пустое состояние фичи: «Выбрать мероприятие» → главная. */
export function NoTicket() {
  const nav = useNavigate();
  const { toast } = useStore();
  // лента от сегодняшнего дня, сегодня выбрано
  const [date, setDate] = useState(TODAY);
  return (
    <Screen
      header={<div className="bb-surface-head" style={{ background: 'var(--color-base-white)', paddingBottom: 'calc(var(--spacing-5xl) + var(--spacing-sm))', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}>
        <StatusBar />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 var(--spacing-2xl) var(--spacing-xl) var(--spacing-5xl)' }}><span className="ds-heading-h2" style={{ flex: 1, textAlign: 'center' }}>Куда пойдём</span><ButtonIcon icon="map" label="Карта" onClick={() => toast('Купите билет — и мы покажем места рядом на карте')} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', paddingLeft: 'var(--spacing-2xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-md) 0 var(--spacing-2xl)' }}>
            <span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>Выберите дни для планирования выходных</span>
          </div>
          <DatepickerRange from={TODAY} length={70} value={date} onSelect={setDate} />
        </div>
      </div>}
      footer={<div><NavBar active={1} /><HomeIndicator /></div>}>
      <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)', minHeight: '100%', background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) 18px var(--spacing-sm)' }}><Icon name="ticket" size={24} /><span className="ds-heading-h3">Купленные билеты</span></div>
        <p className="ds-body" style={{ margin: 0, padding: '0 var(--spacing-2xl) 0 50px', color: 'var(--color-text-secondary)' }}>Нет купленных билетов, купите билет, чтобы спланировать свой досуг</p>
        <div style={{ padding: 'var(--spacing-2xl) 50px 0' }}><Button size="Sm" style={{ width: 'auto' }} onClick={() => nav('/main')}>Выбрать мероприятие</Button></div>
      </div>
    </Screen>
  );
}
