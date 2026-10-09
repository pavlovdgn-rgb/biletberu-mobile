import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgeBadge, Bar, Button, HomeIndicator, Icon, Inputs, StatusBar, TicketButton, TitlePage } from '../components';
import { Phone } from './Phone';

/** Экран «Оформление заказа» — копия макетов placing an order_form / form-field (Figma `179:17059`, `179:17345`). «Далее» активна, когда заполнены все поля; стрелка у суммы раскрывает билеты. */
const meta = { title: 'Sandboxes/Оформление заказа', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

const FIELDS = ['Фамилия', 'Имя', 'Дата рождения', 'E-mail'];
const FILLED = ['Константинов', 'Александр', '12.10.1992', 'konstantinov@mail.ru'];
const card = { background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' } as const;

function OrderForm({ initial }: { initial: string[] }) {
  const [vals, setVals] = useState(initial);
  const [open, setOpen] = useState(false);
  const ready = vals.every((v) => v.trim() !== '');
  return (
    <Phone
      header={<div><StatusBar /><TitlePage title="Оформление заказа" rounded /></div>}
      footer={<div style={{ background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)', paddingTop: 'var(--spacing-xl)' }}>
        <button type="button" onClick={() => setOpen(!open)} className="ds-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', margin: '0 auto', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
          Итоговая стоимость 5 100 ₽ <Icon name="chevron-down" size={24} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--motion-duration) var(--motion-ease)' }} />
        </button>
        {open && <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl) var(--spacing-2xl) 0', overflowX: 'auto' }}><TicketButton title="Взрослый" price="2 550 ₽" /><TicketButton title="Взрослый" price="2 550 ₽" /></div>}
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}><Button state={ready ? 'Default' : 'Disabled'}>Далее</Button></div>
        <Bar /><HomeIndicator />
      </div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)' }}>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h3">Спектакль «Выходные без телефона: Моменты без лайков»</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="marker-pin-small" size={16} /><span className="ds-body">Санкт-Петербургский театр новой комедии</span></span>
            <span className="ds-body" style={{ paddingLeft: 'var(--spacing-4xl)', color: 'var(--color-text-secondary)' }}>Большая Морская улица, 14 к.2,</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
            <AgeBadge size="lg">18+</AgeBadge>
            <AgeBadge size="lg">25 апреля,&nbsp;<span style={{ color: 'var(--color-system-error)' }}>сб.</span>&nbsp;18:00</AgeBadge>
          </div>
        </section>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl) var(--spacing-2xl) var(--spacing-3xl)' }}>
          <TitlePage version="Secondary" title={<span className="ds-heading-h3">Введите данные покупателя</span>} textButtonLabel="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {FIELDS.map((f, i) => <Inputs key={f} state="Default" label={f} value={vals[i]} onChange={(e) => setVals(vals.map((v, j) => (j === i ? e.target.value : v)))} />)}
          </div>
        </section>
      </div>
    </Phone>
  );
}

/** placing an order_form — поля пустые, «Далее» неактивна. */
export const Empty: Story = { name: 'placing an order_form', render: () => <OrderForm initial={['', '', '', '']} /> };
/** placing an order_form-field — поля заполнены, «Далее» активна. */
export const Filled: Story = { name: 'placing an order_form-field', render: () => <OrderForm initial={FILLED} /> };
