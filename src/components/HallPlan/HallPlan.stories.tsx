import type { Meta, StoryObj } from '@storybook/react-vite';
import { HallPlan } from './HallPlan';

/** Hall plan — схема зала в SVG, точь-в-точь по Figma (`146:5258`). Клик по цветному месту выбирает его (кольцо Map mark), серые — заняты. */
const meta = {
  title: 'Components/Карты и метки/Hall plan', component: HallPlan, tags: ['autodocs'],
  args: { zoom: 'X1', defaultSelected: [] },
  argTypes: { zoom: { control: 'inline-radio', options: ['X1', 'X3'] }, defaultSelected: { control: 'object' }, selected: { control: 'object' }, onSeatClick: { action: 'seat' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof HallPlan>;
export default meta;
type Story = StoryObj<typeof meta>;
export const X1: Story = {};
export const X3: Story = { args: { zoom: 'X3' } };
/** X3 с выбранными местами, как на экране «placing an order_2 3». */
export const X3WithSelection: Story = { args: { zoom: 'X3', defaultSelected: ['14-2', '14-3'] } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}><HallPlan /><HallPlan zoom="X3" /></div> };
