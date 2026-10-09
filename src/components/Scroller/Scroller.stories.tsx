import type { Meta, StoryObj } from '@storybook/react-vite';
import { Scroller } from './Scroller';

/** Scroller — полоса прокрутки в скролл-пикере. Figma: `132:18280`. */
const meta = {
  title: 'Components/Оверлеи и фидбэк/Scroller', component: Scroller, tags: ['autodocs'],
  args: { height: 249, thumb: 0.98 },
  argTypes: { height: { control: { type: 'number', min: 40, max: 400 } }, thumb: { control: { type: 'range', min: 0.1, max: 1, step: 0.05 } } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Scroller>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Short: Story = { args: { height: 120, thumb: 0.4 } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}><Scroller /><Scroller height={120} thumb={0.4} /></div> };
