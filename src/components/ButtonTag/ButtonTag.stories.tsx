import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonTag } from './ButtonTag';

/** Button-Tag — тег-фильтр категорий; Legend — ценовая категория с цветной точкой на схеме зала. Figma: `132:17137`. */
const meta = {
  title: 'Components/Действия/Button-Tag',
  component: ButtonTag,
  tags: ['autodocs'],
  args: { legend: 'No', status: 'No active', children: 'Экскурсии' },
  argTypes: {
    legend: { control: 'inline-radio', options: ['No', 'Yes'] },
    status: { control: 'inline-radio', options: ['No active', 'Active'] },
    legendColor: { control: 'select', options: ['var(--color-primary-orange)', 'var(--color-accent-violet)', 'var(--color-system-success)', 'var(--color-system-warning)'] },
    children: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ButtonTag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NoActive: Story = {};
export const Active: Story = { args: { status: 'Active', children: 'Театры' } };
export const Legend: Story = { args: { legend: 'Yes', children: 'Партер · 2 500 ₽' } };

/** Живой выбор категории — переход цвета 180 ms. */
export const AllVariants: Story = {
  render: () => {
    const cats = ['Все', 'Экскурсии', 'Театры', 'Концерты', 'Детям'];
    const [cur, setCur] = useState(1);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        {cats.map((c, i) => <ButtonTag key={c} status={i === cur ? 'Active' : 'No active'} onClick={() => setCur(i)}>{c}</ButtonTag>)}
        <ButtonTag legend="Yes">Партер</ButtonTag><ButtonTag legend="Yes" legendColor="var(--color-accent-violet)">Амфитеатр</ButtonTag>
      </div>
    );
  },
};
