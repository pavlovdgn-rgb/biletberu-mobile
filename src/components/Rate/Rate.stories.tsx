import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rate } from './Rate';

/** Rate — рейтинг мероприятия; onDark — поверх фото карточки. Figma: `132:17588`. */
const meta = {
  title: 'Components/Бейджи/Rate', component: Rate, tags: ['autodocs'],
  args: { size: 'Lg', value: '4.5', onDark: false },
  argTypes: { size: { control: 'inline-radio', options: ['Lg', 'Sm'] }, value: { control: 'text' }, onDark: { control: 'boolean' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Rate>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Large: Story = {};
export const Small: Story = { args: { size: 'Sm' } };
export const OnPhoto: Story = { args: { onDark: true } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}><Rate /><Rate size="Sm" /><Rate onDark /><Rate size="Sm" onDark /></div> };
