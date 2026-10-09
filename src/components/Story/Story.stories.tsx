import type { Meta, StoryObj } from '@storybook/react-vite';
import { photo } from '../_lib/demo';
import { Story as StoryCard } from './Story';

/** Story — карточка сторис на главной; Active — непросмотренная. Figma: `132:17951`. */
const meta = {
  title: 'Components/Медиа/Story', component: StoryCard, tags: ['autodocs'],
  args: { state: 'Default', title: 'ТОП-выходные', src: photo('weekend', 200, 168) },
  argTypes: { state: { control: 'inline-radio', options: ['Default', 'Active'] }, title: { control: 'text' }, src: { control: 'text' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StoryCard>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const Active: S = { args: { state: 'Active', title: 'Аншлаг' } };
export const AllVariants: S = {
  render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>{['ТОП-концерты', 'Аншлаг', 'ТОП-выходные', 'Для двоих', 'Премьеры'].map((t, i) => <StoryCard key={t} title={t} state={i < 2 ? 'Active' : 'Default'} src={photo(t, 200, 168)} />)}</div>,
};
