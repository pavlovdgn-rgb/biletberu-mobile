import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { BannerImage } from './BannerImage';

/** Banner_image — баннер-подборка в карусели на главной. Figma: `132:17455`. */
const meta = {
  title: 'Components/Карточки/Banner_image', component: BannerImage, tags: ['autodocs'],
  args: { title: 'Выходные без телефона', date: '25 апреля 18-00', age: '16+', image: photo('theatre', 702, 412) },
  argTypes: { title: { control: 'text' }, date: { control: 'text' }, age: { control: 'text' }, image: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BannerImage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NoImage: Story = { args: { image: undefined, title: 'Культурная подборка' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}><BannerImage image={photo('theatre', 702, 412)} /><BannerImage image={photo('concert', 702, 412)} title="Музыка в дыхание" date="30 апреля 20-00" /></div> };
