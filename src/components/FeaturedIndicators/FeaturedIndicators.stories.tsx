import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeaturedIndicators } from './FeaturedIndicators';

/** Featured Indicators — пагинация карусели баннеров. Figma: `132:17611`. */
const meta = {
  title: 'Components/Бейджи/Featured Indicators', component: FeaturedIndicators, tags: ['autodocs'],
  args: { size: 'Long', count: 6, active: 0 },
  argTypes: { size: { control: 'inline-radio', options: ['Small', 'Long'] }, count: { control: { type: 'number', min: 2, max: 10 } }, active: { control: { type: 'number', min: 0, max: 9 } } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FeaturedIndicators>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Long: Story = {};
export const Small: Story = { args: { size: 'Small', active: 1 } };
/** Автопрокрутка — анимированный переход активной точки. */
export const AllVariants: Story = {
  render: () => {
    const [i, setI] = useState(0);
    useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % 6), 1200); return () => clearInterval(t); }, []);
    return <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}><FeaturedIndicators active={i} /><FeaturedIndicators size="Small" active={i} /></div>;
  },
};
