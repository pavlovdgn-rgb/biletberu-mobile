import type { Meta, StoryObj } from '@storybook/react-vite';
import { TicketButton } from './TicketButton';

/** ticket-button — выбранный билет в нижней панели заказа (категория, тариф, цена, удалить). Figma: `132:17145`. */
const meta = {
  title: 'Components/Действия/ticket-button',
  component: TicketButton,
  tags: ['autodocs'],
  args: { title: 'Пенсионеры (граждане РФ и стран ЕАЭС)', tariff: 'Стандартный', price: '1 000 ₽', selected: false },
  argTypes: { title: { control: 'text' }, tariff: { control: 'text' }, price: { control: 'text' }, selected: { control: 'boolean' }, categoryColor: { control: 'select', options: [1, 2, 3, 4, 5].map((i) => `var(--illustration-seat-${i})`) } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TicketButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true, title: 'Взрослый', price: '2 500 ₽' } };
export const AllVariants: Story = {
  render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}><TicketButton /><TicketButton selected title="Взрослый" price="2 500 ₽" /><TicketButton title="Детский" price="800 ₽" /></div>,
};
