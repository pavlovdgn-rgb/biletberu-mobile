import type { Meta, StoryObj } from '@storybook/react-vite';
import { Datepicker } from './Datepicker';

/** Datepicker — лента дат на главной; клик выбирает дату (переход цвета). Figma: `132:17322`. */
const meta = {
  title: 'Components/Ввод/Datepicker',
  component: Datepicker,
  tags: ['autodocs'],
  args: { state: '1', month: 'АПРЕЛЬ', days: 30, firstWeekday: 2, ticketDays: [4, 11, 25], defaultSelected: 1 },
  argTypes: {
    state: { control: 'inline-radio', options: ['1', '2'] },
    month: { control: 'text' }, days: { control: { type: 'number', min: 7, max: 31 } },
    firstWeekday: { control: { type: 'number', min: 0, max: 6 } }, ticketDays: { control: 'object' }, defaultSelected: { control: 'number' },
  },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof Datepicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const State1: Story = {};
/** State=2 — с отметками дат, на которые куплены билеты. */
export const State2: Story = { args: { state: '2' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}><Datepicker /><Datepicker state="2" /></div> };
