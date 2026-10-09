import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './Toggle';

/** Toggle — переключатель («Пушкинская карта», «Со скидкой»). Клик анимирует ручку. Figma: `132:17399`. */
const meta = {
  title: 'Components/Переключатели/Toggle', component: Toggle, tags: ['autodocs'],
  args: { state: 'Active', label: 'Со скидкой' },
  argTypes: { state: { control: 'inline-radio', options: ['Active', 'Disabled'] }, label: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Active: Story = {};
export const Off: Story = { args: { state: 'Disabled' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}><Toggle /><Toggle state="Disabled" /></div> };
