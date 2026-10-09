import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ButtonIcon, ButtonTag, HALL_MAX_SCALE, HALL_X3_CENTER, HallPlan, HomeIndicator, ModalConfirmation, StatusBar, TicketButton, TitlePage, type Seat } from '../components';

/** Покупка билета — копии экранов placing an order_2 1 / 2 / 3 (Figma `179:16622`, `179:16736`, `179:16905`). Клик по схеме → выбор тарифа → места выбраны; «+/−», щипок и колесо масштабируют схему, перетаскивание двигает её. */
const meta = { title: 'Sandboxes/Покупка билета', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

const PRICES = ['1 000 ₽', '1 500 ₽', '2 000 ₽', '2 500 ₽', '3 500 ₽'];
const ZONES = ['', 'Балкон', 'Ложа', 'Бельэтаж', 'Амфитеатр', 'Партер'];
/** Подписи мест как в макете (места под отметками на экране placing an order_2 3). */
const LABEL: Record<string, string> = { '16-16': '14 ряд, 2 место', '16-17': '14 ряд, 3 место' };
const label = (s: Seat) => LABEL[`${s.row}-${s.place}`] ?? `${s.row} ряд, ${s.place} место`;
type Step = 'choose' | 'confirm' | 'selected';

function SeatScreen({ initial }: { initial: Step }) {
  const [step, setStep] = useState<Step>(initial);
  const [scale, setScale] = useState(initial === 'selected' ? HALL_MAX_SCALE : 1);
  const [seats, setSeats] = useState<Seat[]>(initial === 'selected' ? [{ row: 16, place: 16, category: 4 }, { row: 16, place: 17, category: 4 }] : []);
  const [pending, setPending] = useState<Seat>({ row: 16, place: 16, category: 4 });
  const selected = seats.length > 0;
  const ids = seats.map((x) => `${x.row}-${x.place}`);
  const click = (seat: Seat) => { const id = `${seat.row}-${seat.place}`;
    if (ids.includes(id)) { setSeats(seats.filter((x) => `${x.row}-${x.place}` !== id)); return; }
    setPending(seat); setStep('confirm'); };
  return (
    <div style={{ position: 'relative', width: 393, height: 852, overflow: 'hidden', borderRadius: 'var(--radius-2xl)', background: 'var(--color-background-base)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ position: 'absolute', left: 0, top: 166 }}>
        <HallPlan scale={scale} onScaleChange={setScale} center={initial === 'selected' ? HALL_X3_CENTER : undefined} selected={ids} onSeatClick={click} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <StatusBar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', paddingBottom: 'var(--spacing-3xl)', background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}>
          <div style={{ paddingBottom: 'var(--spacing-xl)' }}><TitlePage subtitle="Yes" title="Спектакль «Выходные без телефона: Моменты без лайков»" subtitleText="25 апреля 18:00" /></div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', paddingLeft: 'var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {PRICES.map((p, i) => <ButtonTag key={p} legend="Yes" legendColor={i === 0 ? 'var(--color-system-error)' : `var(--illustration-seat-${i + 1})`}>{p}</ButtonTag>)}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 327, top: selected ? 380 : 400, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-background-disabled)' }}>
        <ButtonIcon fill="transparent" icon="plus" label="Приблизить" state={scale >= HALL_MAX_SCALE - 0.01 ? 'Disabled' : 'Default'} onClick={() => setScale(Math.min(HALL_MAX_SCALE, scale * 1.6))} />
        <ButtonIcon fill="transparent" icon="minus" label="Отдалить" state={scale <= 1.01 ? 'Disabled' : 'Default'} onClick={() => setScale(Math.max(1, scale / 1.6))} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 'var(--spacing-xl)', background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)' }}>
        {selected
          ? <div style={{ display: 'flex', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {seats.map((x) => <TicketButton key={`${x.row}-${x.place}`} title={label(x)} tariff={ZONES[x.category]} price={PRICES[x.category - 1]} categoryColor={`var(--illustration-seat-${x.category})`}
                onClick={() => setSeats(seats.filter((y) => y !== x))} />)}
            </div>
          : <div className="ds-caption" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Для оформления заказа выберите места</div>}
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}><Button state={selected ? 'Default' : 'Disabled'}>Купить билеты</Button></div>
        <HomeIndicator />
      </div>
      {step === 'confirm' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--color-text-primary) 60%, transparent)' }} onClick={() => setStep(selected ? 'selected' : 'choose')}>
          <div onClick={(e) => e.stopPropagation()} style={{ animation: 'bbPop var(--motion-duration) var(--motion-ease)' }}>
            <ModalConfirmation subtitle={label(pending)} actionLabel={PRICES[pending.category - 1]} linkLabel="Выбрать другой билет" onClose={() => setStep(selected ? 'selected' : 'choose')}
              onConfirm={() => { setSeats([...seats, pending]); setStep('selected'); }} />
          </div>
          <style>{'@keyframes bbPop{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}'}</style>
        </div>
      )}
    </div>
  );
}

/** placing an order_2 1 — выбор мест. Клик по цветному месту открывает выбор тарифа. */
export const Choose: Story = { name: 'placing an order_2 1', render: () => <SeatScreen initial="choose" /> };
/** placing an order_2 2 — модалка тарифа. */
export const Confirm: Story = { name: 'placing an order_2 2', render: () => <SeatScreen initial="confirm" /> };
/** placing an order_2 3 — места выбраны (X3, отметки, билеты). */
export const Selected: Story = { name: 'placing an order_2 3', render: () => <SeatScreen initial="selected" /> };
