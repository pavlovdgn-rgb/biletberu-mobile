import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, iconNames } from './Icon';

/** Icon — набор `20px` из Figma (49 иконок), цвет — currentColor на токенах. Figma: фрейм `132:17814`. */
const meta = {
  title: 'Components/Медиа/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'ticket', size: 20 },
  argTypes: { name: { control: 'select', options: iconNames }, size: { control: { type: 'number', min: 12, max: 64 } }, label: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Accent: Story = { args: { name: 'heart-rounded-fill', size: 32 }, render: (a) => <span style={{ color: 'var(--color-primary-orange)' }}><Icon {...a} /></span> };
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 110px)', gap: 'var(--spacing-md)' }}>
      {iconNames.map((n) => <span key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xs)' }}><Icon name={n} size={24} /><span className="ds-tiny-regular">{n}</span></span>)}
    </div>
  ),
};
