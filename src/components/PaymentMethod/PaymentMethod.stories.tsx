import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaymentMethod } from './PaymentMethod';

/** Payment method — промокод или списание баллов на экране оплаты. Figma: `132:18284`. */
const meta = {
  title: 'Components/Оплата/Payment method', component: PaymentMethod, tags: ['autodocs'],
  args: { type: 'Default' },
  argTypes: { type: { control: 'inline-radio', options: ['Default', 'Bonus'] }, label: { control: 'text' }, points: { control: 'text' }, description: { control: 'text' } },
  parameters: { layout: 'padded' }, decorators: [(S) => <div style={{ maxWidth: 361 }}><S /></div>],
} satisfies Meta<typeof PaymentMethod>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Promo: Story = {};
export const Bonus: Story = { args: { type: 'Bonus' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}><PaymentMethod /><PaymentMethod type="Bonus" /></div> };
