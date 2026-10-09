import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgeBadge } from './AgeBadge';

/** Age badge — возрастное ограничение на подложке `color/background/overlay`. Figma: `132:17595`. */
const meta = {
  title: 'Components/Бейджи/Age badge', component: AgeBadge, tags: ['autodocs'],
  args: { size: 'sm', children: '12+' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'lg'] }, children: { control: 'select', options: ['0+', '6+', '12+', '16+', '18+'] } },
  parameters: { layout: 'centered', backgrounds: { value: 'dark' } },
} satisfies Meta<typeof AgeBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Small: Story = {};
export const Large: Story = { args: { size: 'lg', children: '18+' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>{['0+', '6+', '12+', '16+', '18+'].map((a) => <AgeBadge key={a}>{a}</AgeBadge>)}<AgeBadge size="lg">18+</AgeBadge></div> };
