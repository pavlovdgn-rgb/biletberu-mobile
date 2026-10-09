import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';

/** Radio — выбор одного варианта (способ оплаты). Figma: `132:17410`. */
const meta = {
  title: 'Components/Переключатели/Radio', component: Radio, tags: ['autodocs'],
  args: { state: 'Active', label: 'СБП' },
  argTypes: { state: { control: 'inline-radio', options: ['Active', 'Default'] }, label: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Radio>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Active: Story = {};
export const Default: Story = { args: { state: 'Default' } };
/** Группа: живое переключение. */
export const AllVariants: Story = {
  render: () => {
    const [cur, setCur] = useState(0);
    return <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>{['СБП', 'Банковская карта', 'SberPay'].map((m, i) => (
      <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }} className="ds-body"><Radio state={i === cur ? 'Active' : 'Default'} label={m} onClick={() => setCur(i)} />{m}</label>))}</div>;
  },
};
