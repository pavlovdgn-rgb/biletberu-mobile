import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { Image } from './Image';

/** Image_* — изображения фиксированных размеров; без src — плейсхолдер `color/background/placeholder`. Figma: `132:17958`–`132:17970`. */
const meta = {
  title: 'Components/Медиа/Image_*', component: Image, tags: ['autodocs'],
  args: { size: 'sm', src: photo('img'), shade: false, fluid: false },
  argTypes: { size: { control: 'select', options: ['xxxs', 'xxs', 'xs', 'sm', 'm', 'lg', 'xl', 'xxl'] }, src: { control: 'text' }, shade: { control: 'boolean' }, fluid: { control: 'boolean' }, count: { control: 'text' }, alt: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Placeholder: Story = { args: { src: undefined, size: 'lg' } };
export const WithCount: Story = { args: { size: 'xxxs', count: '+29' } };
export const AllVariants: Story = {
  render: () => <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>{(['xxxs', 'xxs', 'xs', 'sm', 'm', 'lg', 'xl'] as const).map((s) => <Image key={s} size={s} src={photo(s)} shade={['sm', 'm', 'lg', 'xl'].includes(s)} />)}</div>,
};
