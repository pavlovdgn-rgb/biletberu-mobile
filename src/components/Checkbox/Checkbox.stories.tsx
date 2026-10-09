import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

/** Checkbox — флажок (согласие с условиями). Figma: `132:17404`. */
const meta = {
  title: 'Components/Переключатели/Checkbox', component: Checkbox, tags: ['autodocs'],
  args: { active: 'Yes', label: 'Согласен с условиями' },
  argTypes: { active: { control: 'inline-radio', options: ['Yes', 'No'] }, label: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Checked: Story = {};
export const Unchecked: Story = { args: { active: 'No' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}><Checkbox /><Checkbox active="No" /></div> };
