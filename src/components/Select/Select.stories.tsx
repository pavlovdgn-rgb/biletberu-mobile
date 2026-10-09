import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

/** Select — выбор значения (документ, город). Figma: `132:17203`. */
const meta = {
  title: 'Components/Ввод/Select',
  component: Select,
  tags: ['autodocs'],
  args: { state: 'Default', icon: 'No', placeholder: 'Документ', value: 'Паспорт РФ' },
  argTypes: {
    state: { control: 'inline-radio', options: ['Default', 'PressedFilled', 'Disabled', 'Error'] },
    icon: { control: 'inline-radio', options: ['No', 'Yes'] },
    placeholder: { control: 'text' }, value: { control: 'text' }, message: { control: 'text' },
  },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 361 }}><S /></div>],
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pressed: Story = { args: { state: 'PressedFilled' } };
export const WithIcon: Story = { args: { icon: 'Yes', state: 'PressedFilled' } };
export const Error: Story = { args: { state: 'Error' } };
export const Disabled: Story = { args: { state: 'Disabled' } };
/** Матрица State × Icon (8 вариантов). */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 361px)', gap: 'var(--spacing-md)' }}>
      {(['Default', 'PressedFilled', 'Error', 'Disabled'] as const).flatMap((s) => (['No', 'Yes'] as const).map((i) => <Select key={s + i} state={s} icon={i} />))}
    </div>
  ),
};
