import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

/** Progress_bar — прогресс сторис. Figma: `132:18225`. */
const meta = {
  title: 'Components/Оверлеи и фидбэк/Progress_bar', component: ProgressBar, tags: ['autodocs'],
  args: { segments: 5, current: 1, progress: 0.5 },
  argTypes: { segments: { control: { type: 'number', min: 1, max: 10 } }, current: { control: { type: 'number', min: 0, max: 9 } }, progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } } },
  parameters: { layout: 'padded', backgrounds: { value: 'dark' } },
  decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof ProgressBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const First: Story = { args: { current: 0, progress: 0.2 } };
/** Живое проигрывание сторис. */
export const AllVariants: Story = {
  render: () => {
    const [t, setT] = useState(0);
    useEffect(() => { const id = setInterval(() => setT((x) => (x + 0.05) % 5), 150); return () => clearInterval(id); }, []);
    return <ProgressBar current={Math.floor(t)} progress={t % 1} />;
  },
};
