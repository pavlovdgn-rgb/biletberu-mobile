import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar } from './Bar';

/** bar — нижнее меню приложения; клик переключает раздел. Figma: `132:17983`. */
const meta = {
  title: 'Components/Навигация/bar', component: Bar, tags: ['autodocs'],
  args: { active: 0 },
  argTypes: { active: { control: 'inline-radio', options: [0, 1, 2, 3] } },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof Bar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Home: Story = {};
export const WhereToGo: Story = { args: { active: 1 } };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>{[0, 1, 2, 3].map((i) => <Bar key={i} active={i} />)}</div> };
