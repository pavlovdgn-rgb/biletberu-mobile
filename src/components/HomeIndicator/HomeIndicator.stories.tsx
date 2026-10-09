import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeIndicator } from './HomeIndicator';

/** Home Indicator — системная полоска iOS. Figma: `132:18045`. */
const meta = {
  title: 'Components/Навигация/Home Indicator', component: HomeIndicator, tags: ['autodocs'],
  args: { transparent: false }, argTypes: { transparent: { control: 'boolean' } },
  parameters: { layout: 'padded' }, decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof HomeIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Transparent: Story = { args: { transparent: true } };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}><HomeIndicator /><HomeIndicator transparent /></div> };
