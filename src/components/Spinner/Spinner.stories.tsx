import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

/** Spinner — индикатор загрузки (экран «Оформление заказа» и Button Content=Loader). Кадры поворота кита заменены CSS-анимацией. Figma: `132:18231`. */
const meta = {
  title: 'Components/Оверлеи и фидбэк/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: { size: 24, color: 'Brand' },
  argTypes: { size: { control: 'inline-radio', options: [16, 24, 108] }, color: { control: 'inline-radio', options: ['Brand', 'Light', 'Dark'] } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {};
export const Large: Story = { args: { size: 108 } };
export const Light: Story = { args: { color: 'Light' }, parameters: { backgrounds: { value: 'dark' } } };
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', alignItems: 'center' }}>
      {([16, 24, 108] as const).map((s) => <Spinner key={s} size={s} />)}<Spinner color="Dark" />
      <span style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-orange)' }}><Spinner color="Light" /></span>
    </div>
  ),
};
