import type { Meta, StoryObj } from '@storybook/react-vite';
import { Numb } from './Numb';

/** numb — ячейка даты: выбранная, выходной, дата с купленным билетом (иконка `color/accent/violet`). Figma: `132:17296`. */
const meta = {
  title: 'Components/Ввод/numb',
  component: Numb,
  tags: ['autodocs'],
  args: { state: 'Default', weekend: 'No', ticket: 'No', day: 1, weekday: 'ср' },
  argTypes: {
    state: { control: 'inline-radio', options: ['Default', 'Active'] },
    weekend: { control: 'inline-radio', options: ['No', 'Yes'] },
    ticket: { control: 'inline-radio', options: ['No', 'Yes'] },
    day: { control: 'number' }, weekday: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Numb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = { args: { state: 'Active' } };
export const Weekend: Story = { args: { weekend: 'Yes', day: 4, weekday: 'сб' } };
export const WithTicket: Story = { args: { ticket: 'Yes', day: 11, weekday: 'пт' } };
/** Все 7 вариантов кита. */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
      <Numb /><Numb weekend="Yes" weekday="сб" /><Numb ticket="Yes" /><Numb weekend="Yes" ticket="Yes" weekday="вс" />
      <Numb state="Active" /><Numb state="Active" ticket="Yes" /><Numb state="Active" weekend="Yes" ticket="Yes" weekday="вс" />
    </div>
  ),
};
