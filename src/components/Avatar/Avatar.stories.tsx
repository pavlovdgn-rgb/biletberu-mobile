import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { Avatar } from './Avatar';

/** Avatar — аватар пользователя или персоны. Figma: `132:17971`. */
const meta = {
  title: 'Components/Медиа/Avatar', component: Avatar, tags: ['autodocs'],
  args: { size: 'sm', src: photo('avatar', 80, 80) },
  argTypes: { size: { control: 'inline-radio', options: ['xs', 'sm', 'lg'] }, src: { control: 'text' }, alt: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Small: Story = {};
export const ExtraSmall: Story = { args: { size: 'xs' } };
export const Placeholder: Story = { args: { src: undefined } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}><Avatar size="xs" src={photo('a1', 64, 64)} /><Avatar src={photo('a2', 80, 80)} /><Avatar size="lg" src={photo('a3', 192, 192)} /><Avatar /></div> };
