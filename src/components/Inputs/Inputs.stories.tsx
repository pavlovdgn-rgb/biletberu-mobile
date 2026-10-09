import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inputs } from './Inputs';

/** Inputs — поле формы персональных данных при покупке билета. Figma: `132:17170`. */
const meta = {
  title: 'Components/Ввод/Inputs',
  component: Inputs,
  tags: ['autodocs'],
  args: { state: 'DefaultFilled', label: 'Фамилия', message: 'Заполните поле' },
  argTypes: {
    state: { control: 'inline-radio', options: ['Default', 'DefaultFilled', 'PressedFilled', 'Error', 'Disabled'] },
    icon: { control: 'inline-radio', options: ['No'] },
    label: { control: 'text' }, message: { control: 'text' }, defaultValue: { control: 'text' },
  },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 361 }}><S /></div>],
} satisfies Meta<typeof Inputs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { state: 'Default', label: 'Имя' } };
export const Filled: Story = {};
export const Pressed: Story = { args: { state: 'PressedFilled', label: 'Телефон', defaultValue: '+7 900 000-00-00' } };
export const Error: Story = { args: { state: 'Error', label: 'Почта', defaultValue: 'ivanov@', message: 'Проверьте адрес почты' } };
export const Disabled: Story = { args: { state: 'Disabled' } };
export const AllVariants: Story = {
  render: () => <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>{(['Default', 'DefaultFilled', 'PressedFilled', 'Error', 'Disabled'] as const).map((s) => <Inputs key={s} state={s} />)}</div>,
};
