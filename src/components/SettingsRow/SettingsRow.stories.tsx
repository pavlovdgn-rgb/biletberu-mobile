import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsRow } from './SettingsRow';

const meta = {
  title: 'Components/Навигация и структура/SettingsRow',
  component: SettingsRow,
  tags: ['autodocs'],
  args: { type: 'Default', label: 'Город', icon: 'settings' },
  argTypes: { type: { control: 'inline-radio', options: ['Default', 'Value', 'Toggle', 'Danger'] } },
  decorators: [(S) => <div style={{ width: 361, background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' }}><S /></div>],
} satisfies Meta<typeof SettingsRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllVariants: Story = {
  render: () => (<>
    <SettingsRow type="Default" icon="ticket" label="История заказов и возврат" />
    <SettingsRow type="Value" icon="credit-card" label="Бюджет на активности" value="до 3 000 ₽" />
    <SettingsRow type="Toggle" icon="bell" label="Уведомления" />
    <SettingsRow type="Danger" icon="log-out" label="Выйти из аккаунта" />
  </>),
};
