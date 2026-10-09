import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetroStation } from './MetroStation';

/** Metro station — станция метро на карте. Figma: `146:5298`. */
const meta = {
  title: 'Components/Карты и метки/Metro station', component: MetroStation, tags: ['autodocs'],
  args: { name: 'Адмиралтейская', compact: false },
  argTypes: { name: { control: 'text' }, compact: { control: 'boolean' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MetroStation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Compact: Story = { args: { compact: true } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', alignItems: 'center' }}><MetroStation /><MetroStation compact name="Невский проспект" /></div> };
