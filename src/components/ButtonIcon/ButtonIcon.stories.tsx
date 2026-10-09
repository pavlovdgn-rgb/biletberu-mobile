import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '../Icon';
import { ButtonIcon } from './ButtonIcon';

/** Button icon — круглая кнопка-иконка: назад, избранное, поделиться, закрыть. Figma: `132:17124`. */
const meta = {
  title: 'Components/Действия/Button icon',
  component: ButtonIcon,
  tags: ['autodocs'],
  args: { state: 'Default', fill: 'Color', size: 'L', icon: 'chevron-left', label: 'Назад' },
  argTypes: {
    state: { control: 'inline-radio', options: ['Default', 'Disabled', 'Active'] },
    fill: { control: 'inline-radio', options: ['Color', 'transparent', 'White'] },
    size: { control: 'inline-radio', options: ['L', 'M'] },
    icon: { control: 'select', options: iconNames },
    accent: { control: 'boolean' },
    label: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ButtonIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { state: 'Disabled' } };
/** Active — в избранном. */
export const Active: Story = { args: { state: 'Active', icon: 'heart-rounded-fill', label: 'В избранном' } };
export const CloseM: Story = { args: { size: 'M', icon: 'x-close', label: 'Закрыть' } };
export const Transparent: Story = { args: { fill: 'transparent' } };
/** Белая с тенью — поверх карты или фото (полная карта: назад, поделиться). */
export const White: Story = { args: { fill: 'White' }, decorators: [(S) => <div style={{ padding: 16, background: 'var(--illustration-map-land)' }}><S /></div>] };
/** «+» в Location_card — подложка `color/primary/orange-10`. */
export const AddAccent: Story = { args: { icon: 'plus', accent: true, label: 'Добавить в план' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
      <ButtonIcon /><ButtonIcon state="Disabled" /><ButtonIcon state="Active" /><ButtonIcon size="M" /><ButtonIcon fill="transparent" /><ButtonIcon fill="transparent" state="Disabled" /><ButtonIcon icon="plus" accent />
    </div>
  ),
};
