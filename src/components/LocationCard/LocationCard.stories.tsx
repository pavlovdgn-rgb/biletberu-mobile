import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { LocationCard } from './LocationCard';

/** Location_card — место или активность рядом с событием: в списке «Добавить в план», в плане дня (Drag), в избранном. Figma: `132:17461`. */
const meta = {
  title: 'Components/Карточки/Location_card',
  component: LocationCard,
  tags: ['autodocs'],
  args: { photo: 'Yes', button: 'No', drag: 'No', name: 'Выходные без телефона: Моменты без лайков', subtitle: '25 апреля • 18:00', time: '20 мин. до театра', price: '500 ₽', order: 1, image: photo('bar', 120, 120), favourite: false },
  argTypes: {
    photo: { control: 'inline-radio', options: ['Yes', 'No'] }, button: { control: 'inline-radio', options: ['No', 'Yes'] }, drag: { control: 'inline-radio', options: ['No', 'Yes'] },
    name: { control: 'text' }, subtitle: { control: 'text' }, category: { control: 'text' }, distance: { control: 'text' }, time: { control: 'text' }, price: { control: 'text' },
    order: { control: 'number' }, image: { control: 'text' }, favourite: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 361 }}><S /></div>],
} satisfies Meta<typeof LocationCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Button=Yes — «+» добавить в план (подложка `color/primary/orange-10`). */
export const AddToPlan: Story = { args: { button: 'Yes', name: 'Бар Mozz' } };
export const DragInPlan: Story = { args: { button: 'Yes', drag: 'Yes', name: 'Кофейня Чёрный квадрат', time: '10 мин. до театра' } };
export const NoPhoto: Story = { args: { photo: 'No', name: 'Кофейня Nook & Bean', time: '6 мин. до театра', category: 'Кафе', order: 1 } };
export const Favourite: Story = { args: { button: 'Yes', favourite: true, name: 'Прогулка на катере', time: '3 мин. до театра' } };
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <LocationCard image={photo('bar', 120, 120)} /><LocationCard button="Yes" name="Бар Mozz" image={photo('mozz', 120, 120)} />
      <LocationCard button="Yes" drag="Yes" name="Кофейня Чёрный квадрат" image={photo('coffee', 120, 120)} /><LocationCard photo="No" name="Кофейня Nook & Bean" time="6 мин. до театра" category="Кафе" />
    </div>
  ),
};
