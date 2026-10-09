import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalConfirmation } from './ModalConfirmation';

/** Modal-confirmation — подтверждение места и тарифа на схеме зала. Figma: `132:18134`. */
const meta = {
  title: 'Components/Оверлеи и фидбэк/Modal-confirmation', component: ModalConfirmation, tags: ['autodocs'],
  args: { title: 'Выберите тариф', subtitle: '14 ряд, 2 место', option: 'Базовый', actionLabel: '2 500 ₽', linkLabel: 'Другие тарифы' },
  argTypes: { title: { control: 'text' }, subtitle: { control: 'text' }, option: { control: 'text' }, actionLabel: { control: 'text' }, linkLabel: { control: 'text' }, onClose: { action: 'close' }, onConfirm: { action: 'confirm' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ModalConfirmation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Premium: Story = { args: { option: 'Премиум', actionLabel: '4 000 ₽', subtitle: '3 ряд, 12 место' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}><ModalConfirmation /><ModalConfirmation option="Льготный" actionLabel="1 000 ₽" /></div> };
