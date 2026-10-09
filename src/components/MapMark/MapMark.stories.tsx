import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapMark } from './MapMark';

/** Map mark — отметка выбранного места на схеме зала. Figma: `160:30315`. */
const meta = {
  title: 'Components/Карты и метки/Map mark', component: MapMark, tags: ['autodocs'],
  args: {}, argTypes: { className: { control: 'text' } }, parameters: { layout: 'centered' },
} satisfies Meta<typeof MapMark>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}><MapMark /><MapMark /></div> };
