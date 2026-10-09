import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { ReviewCard } from './ReviewCard';

/** review-card — отзыв: Lg в ленте отзывов, Sm — тёмная поверх фото. Figma: `132:17514`. */
const meta = {
  title: 'Components/Карточки/review-card',
  component: ReviewCard,
  tags: ['autodocs'],
  args: { size: 'Lg', photo: 'No', name: 'Наталья', date: '21 марта 2026', rating: 5, avatar: photo('natalia', 80, 80), photos: [photo('r1', 72, 72), photo('r2', 72, 72), photo('r3', 72, 72)] },
  argTypes: {
    size: { control: 'inline-radio', options: ['Lg', 'Sm'] }, photo: { control: 'inline-radio', options: ['Yes', 'No'] },
    name: { control: 'text' }, date: { control: 'text' }, rating: { control: { type: 'range', min: 1, max: 5 } }, text: { control: 'text' },
    avatar: { control: 'text' }, photos: { control: 'object' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ReviewCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Large: Story = {};
export const WithPhotos: Story = { args: { photo: 'Yes' } };
export const SmallOnPhoto: Story = { args: { size: 'Sm' }, parameters: { backgrounds: { value: 'dark' } } };
export const AllVariants: Story = {
  render: (a) => (
    <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
      <ReviewCard {...a} /><ReviewCard {...a} photo="Yes" />
      <div style={{ padding: 'var(--spacing-2xl)', background: 'var(--color-text-secondary)', borderRadius: 'var(--radius-md)' }}><ReviewCard {...a} size="Sm" /></div>
    </div>
  ),
};
