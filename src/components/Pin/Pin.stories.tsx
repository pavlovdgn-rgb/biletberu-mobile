import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pin } from './Pin';

/** Pin — точка-отметка даты с билетом (`color/accent/violet`). В numb заменена иконкой билета; оставлена в ките. Figma: `132:17395`. */
const meta = { title: 'Components/Ввод/Pin', component: Pin, tags: ['autodocs'], args: {}, argTypes: { className: { control: 'text' } }, parameters: { layout: 'centered' } } satisfies Meta<typeof Pin>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}><Pin /><Pin /><Pin /></div> };
