import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Keyboard } from './Keyboard';
import { Inputs } from '../Inputs';

/** Keyboard — системная цифровая клавиатура iOS (ввод телефона и кода). Figma: `132:18047`. */
const meta = {
  title: 'Components/Навигация/Keyboard', component: Keyboard, tags: ['autodocs'],
  args: {}, argTypes: { onKey: { action: 'key' }, onDone: { action: 'done' } },
  parameters: { layout: 'padded' }, decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof Keyboard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
/** Живой ввод номера. */
export const AllVariants: Story = {
  render: () => {
    const [v, setV] = useState('+7 ');
    return <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}><Inputs key={v} state="PressedFilled" label="Телефон" defaultValue={v} readOnly />
      <Keyboard onKey={(k) => setV((x) => (k === '⌫' ? x.slice(0, -1) : x + k))} /></div>;
  },
};
