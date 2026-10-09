import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { Card } from './Card';

/** Card — карточка мероприятия: Vertical в ленте «Рядом», Horizontal в подборках. Hover — тень, сердце переключается. Figma: `132:17416`. */
const meta = {
  title: 'Components/Карточки/Card',
  component: Card,
  tags: ['autodocs'],
  args: { style: 'Vertical', badge: 'Yes', title: 'Интерактивная экскурсия по одному из главных музеев страны', date: '24 апреля 11-00',
    place: 'Дворцовая площадь', price: 'от 100 - 2 000 ₽', discount: '-20%', rating: '4.5', age: '6+', image: photo('museum'), liked: false, shadow: false },
  argTypes: {
    style: { control: 'inline-radio', options: ['Vertical', 'Horizontal'] }, badge: { control: 'inline-radio', options: ['Yes'] },
    title: { control: 'text' }, date: { control: 'text' }, place: { control: 'text' }, price: { control: 'text' }, discount: { control: 'text' },
    rating: { control: 'text' }, age: { control: 'text' }, image: { control: 'text' }, liked: { control: 'boolean' }, shadow: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};
export const Horizontal: Story = { args: { style: 'Horizontal', title: 'Фестиваль уличного искусства и граффити', date: '2 мая, 16-00', price: 'от 1 000 ₽', image: photo('graffiti') } };
export const Liked: Story = { args: { liked: true } };
/** С тенью Shadow/sm, как в ките (на экранах выключена). */
export const KitShadow: Story = { args: { shadow: true } };
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', alignItems: 'flex-start' }}>
      <Card image={photo('museum')} /><div style={{ width: 361 }}><Card style="Horizontal" image={photo('graffiti')} title="Фестиваль уличного искусства и граффити" /></div>
    </div>
  ),
};
