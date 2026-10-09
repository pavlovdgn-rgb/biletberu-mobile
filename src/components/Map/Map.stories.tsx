import type { Meta, StoryObj } from '@storybook/react-vite';
import { photos } from '../../assets/photos';
import { Map } from './Map';
import { MapMarker } from '../MapMarker';
import { MapHomePoint } from '../MapHomePoint';

/** Map — карта из Figma 1:1; Size=Large — продолжение города вокруг центра. Перетаскивайте карту мышью. Figma: `146:4760`. */
const meta = {
  title: 'Components/Карты и метки/Map', component: Map, tags: ['autodocs'],
  args: { designation: 'Yes', metro: 'Yes', zoom: 'X1', size: 'Default', height: 400, scale: 758 },
  argTypes: {
    designation: { control: 'inline-radio', options: ['No', 'Yes'] }, metro: { control: 'inline-radio', options: ['No', 'Yes'] },
    zoom: { control: 'inline-radio', options: ['X1'] }, size: { control: 'inline-radio', options: ['Default', 'Large'] },
    height: { control: { type: 'number', min: 160, max: 800 } }, scale: { control: { type: 'number', min: 393, max: 2154 } },
  },
  parameters: { layout: 'padded' }, decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof Map>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
/** Large — карта вдвое шире и выше: исторический центр и новые районы вокруг. */
export const Large: Story = { args: { size: 'Large', height: 600 } };
export const Plain: Story = { args: { designation: 'No', metro: 'No' } };
/** С метками плана дня. */
export const WithMarkers: Story = {
  args: { designation: 'No', metro: 'Yes', height: 520 },
  render: (a) => (
    <Map {...a}>
      <MapHomePoint style={{ position: 'absolute', left: -89, top: -89 }} />
      <MapMarker order={1} label="Бар Mozz" image={photos['hcard-4']} style={{ position: 'absolute', left: 60, top: -160 }} />
      <MapMarker order={2} label="Прогулка на катере" image={photos['hcard-2']} style={{ position: 'absolute', left: -150, top: 90 }} />
    </Map>
  ),
};
/** Все 6 вариантов: Default и Large. */
export const AllVariants: Story = {
  decorators: [(S) => <S />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 600px)', gap: 'var(--spacing-xl)' }}>
      {(['Default', 'Large'] as const).flatMap((w) => ([['No', 'No'], ['No', 'Yes'], ['Yes', 'Yes']] as const).map(([d, m]) => (
        <div key={w + d + m}><span className="ds-caption">Size={w}, Designation={d}, Метро={m}</span><Map size={w} designation={d} metro={m} height={300} scale={600} /></div>)))}
    </div>
  ),
};
