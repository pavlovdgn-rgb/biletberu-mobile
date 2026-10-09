import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bulb } from './Bulb';

/** bulb — номер точки в плане дня и на карте. Figma: `132:17601`. */
const meta = {
  title: 'Components/Бейджи/bulb', component: Bulb, tags: ['autodocs'],
  args: { color: 'Gray', size: 'Lg', children: 1 },
  argTypes: { color: { control: 'inline-radio', options: ['Gray', 'Orange'] }, size: { control: 'inline-radio', options: ['Lg', 'M', 'Sm'] }, children: { control: 'number' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Bulb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Gray: Story = {};
export const Orange: Story = { args: { color: 'Orange' } };
export const AllVariants: Story = {
  render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>{(['Gray', 'Orange'] as const).flatMap((c) => (['Lg', 'M', 'Sm'] as const).map((s) => <Bulb key={c + s} color={c} size={s} />))}</div>,
};
