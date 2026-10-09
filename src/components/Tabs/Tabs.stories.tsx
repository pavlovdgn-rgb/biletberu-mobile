import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';

/** Tabs — сегменты «План дня / Карта»; активная вкладка плавно меняет подложку и тень. Figma: `132:18119`. */
const meta = {
  title: 'Components/Навигация/Tabs', component: Tabs, tags: ['autodocs'],
  args: { tabs: ['План дня', 'Карта'], active: 0 },
  argTypes: { tabs: { control: 'object' }, active: { control: 'number' } },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 361 }}><S /></div>],
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PlanDay: Story = {};
export const Map: Story = { args: { active: 1 } };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}><Tabs /><Tabs active={1} /><Tabs tabs={['События', 'Места', 'Маршруты']} /></div> };
