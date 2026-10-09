import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { LocationAndProfile } from './LocationAndProfile';

/** Location and Profile — шапка главной: город и профиль. Figma: `132:18113`. */
const meta = {
  title: 'Components/Навигация/Location and Profile', component: LocationAndProfile, tags: ['autodocs'],
  args: { city: 'Санкт-Петербург', avatar: photo('vlad', 64, 64) },
  argTypes: { city: { control: 'text' }, avatar: { control: 'text' } },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof LocationAndProfile>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Moscow: Story = { args: { city: 'Москва' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}><LocationAndProfile /><LocationAndProfile city="Москва" avatar={photo('vlad', 64, 64)} /></div> };
