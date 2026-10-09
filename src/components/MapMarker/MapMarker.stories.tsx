import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { MapMarker } from './MapMarker';

/** Map marker — метка места на карте. Figma: `146:5263`. */
const meta = {
  title: 'Components/Карты и метки/Map marker', component: MapMarker, tags: ['autodocs'],
  args: { text: 'Yes', size: 'Lg', bulb: 'Yes', label: 'Прогулка на катере', order: 1, image: photo('boat', 96, 96) },
  argTypes: { text: { control: 'inline-radio', options: ['No', 'Yes'] }, size: { control: 'inline-radio', options: ['Sm', 'Lg', 'Xl'] }, bulb: { control: 'inline-radio', options: ['No', 'Yes'] }, label: { control: 'text' }, order: { control: 'number' }, image: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MapMarker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Small: Story = { args: { text: 'No', bulb: 'No', size: 'Sm' } };
export const AllVariants: Story = {
  render: () => <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
    <MapMarker text="No" bulb="No" size="Sm" image={photo('m1', 96, 96)} /><MapMarker text="No" bulb="No" image={photo('m2', 96, 96)} /><MapMarker bulb="No" image={photo('m3', 96, 96)} /><MapMarker image={photo('m4', 96, 96)} /><MapMarker size="Xl" image={photo('m5', 96, 96)} />
  </div>,
};
