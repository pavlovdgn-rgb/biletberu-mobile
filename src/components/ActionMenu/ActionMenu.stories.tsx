import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionMenu } from './ActionMenu';

/** Action menu — действия поверх карточки события и сторис. Figma: `132:18196`. */
const meta = {
  title: 'Components/Оверлеи и фидбэк/Action menu', component: ActionMenu, tags: ['autodocs'],
  args: { text: 'No', title: 'Выходные без телефона', counter: '1/4', liked: false },
  argTypes: { text: { control: 'inline-radio', options: ['No', 'Yes'] }, title: { control: 'text' }, counter: { control: 'text' }, liked: { control: 'boolean' }, onBack: { action: 'back' } },
  parameters: { layout: 'padded', backgrounds: { value: 'dark' } },
  decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof ActionMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NoText: Story = {};
export const WithText: Story = { args: { text: 'Yes' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}><ActionMenu /><ActionMenu liked /><ActionMenu text="Yes" /></div> };
