import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from './Search';

/** Search — поиск событий на главной. Фокус подсвечивается оранжевой обводкой. Figma: `132:17155`. */
const meta = {
  title: 'Components/Ввод/Search',
  component: Search,
  tags: ['autodocs'],
  args: { state: 'Default', placeholder: 'Название события' },
  argTypes: { state: { control: 'inline-radio', options: ['Default', 'Disabled', 'Active'] }, placeholder: { control: 'text' }, defaultValue: { control: 'text' } },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 361 }}><S /></div>],
} satisfies Meta<typeof Search>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = { args: { state: 'Active', defaultValue: 'Мастер и Маргарита' } };
export const Disabled: Story = { args: { state: 'Disabled' } };
export const AllVariants: Story = {
  render: () => <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}><Search /><Search state="Active" defaultValue="Мастер и Маргарита" /><Search state="Disabled" /></div>,
};
