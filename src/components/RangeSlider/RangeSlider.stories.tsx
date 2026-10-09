import type { Meta, StoryObj } from '@storybook/react-vite';
import { RangeSlider } from './RangeSlider';

/** Range slider — шкала «Стоимость»: 10 промежуточных положений между подписями (шаг 50/100/500/1 000 ₽), подсказка с ценой, клик по подписи — переход к ней. Figma: `132:17252`. */
const meta = {
  title: 'Components/Ввод/Range slider',
  component: RangeSlider,
  tags: ['autodocs'],
  args: { phase: 'middle', marks: [500, 1000, 3000, 10000], stepsBetween: 10, showValue: true },
  argTypes: { phase: { control: 'inline-radio', options: ['min', 'middle', 'max'] }, marks: { control: 'object' }, stepsBetween: { control: { type: 'range', min: 1, max: 20 } }, showValue: { control: 'boolean' }, onChange: { action: 'price' } },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 361 }}><S /></div>],
} satisfies Meta<typeof RangeSlider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Middle: Story = {};
export const Min: Story = { args: { phase: 'min' } };
export const Max: Story = { args: { phase: 'max' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}><RangeSlider phase="min" /><RangeSlider /><RangeSlider phase="max" /></div> };
