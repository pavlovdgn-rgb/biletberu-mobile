import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBar } from './StatusBar';

/** Status bar — системный статус-бар iOS. Figma: `132:17994`. */
const meta = {
  title: 'Components/Навигация/Status bar', component: StatusBar, tags: ['autodocs'],
  args: { theme: 'Light', breadCrumbs: 'No', time: '9:41', backLabel: 'Билет Беру' },
  argTypes: { theme: { control: 'inline-radio', options: ['Light', 'Dark'] }, breadCrumbs: { control: 'inline-radio', options: ['No', 'Yes'] }, time: { control: 'text' }, backLabel: { control: 'text' } },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof StatusBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = {};
export const Dark: Story = { args: { theme: 'Dark' }, parameters: { backgrounds: { value: 'dark' } } };
export const BreadCrumbs: Story = { args: { breadCrumbs: 'Yes' } };
export const AllVariants: Story = {
  render: () => <div style={{ display: 'grid', gap: 'var(--spacing-md)', background: 'var(--color-text-secondary)', padding: 'var(--spacing-md)' }}>
    <StatusBar /><StatusBar breadCrumbs="Yes" /><StatusBar theme="Dark" /><StatusBar theme="Dark" breadCrumbs="Yes" /></div>,
};
