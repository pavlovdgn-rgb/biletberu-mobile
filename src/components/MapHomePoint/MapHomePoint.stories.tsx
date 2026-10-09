import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapHomePoint } from './MapHomePoint';

/** Map home point — площадка события на карте, с радиусом доступности. Figma: `146:5286`. */
const meta = {
  title: 'Components/Карты и метки/Map home point', component: MapHomePoint, tags: ['autodocs'],
  args: { radius: 'Yes', distance: '1 км' },
  argTypes: { radius: { control: 'inline-radio', options: ['No', 'Yes'] }, distance: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MapHomePoint>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithRadius: Story = {};
export const Point: Story = { args: { radius: 'No' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}><MapHomePoint /><MapHomePoint radius="No" /></div> };
