import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '../Icon';
import { Button } from './Button';

/** Button — основная кнопка. Primary — главное действие экрана («Купить билет», «Далее»). Figma: `132:16869`. Hover/pressed — нативно (затемнение, сжатие). */
const meta = {
  title: 'Components/Действия/Button',
  component: Button,
  tags: ['autodocs'],
  args: { type: 'Primary', size: 'Lg', state: 'Default', content: 'None', children: 'Купить билет' },
  argTypes: {
    type: { control: 'inline-radio', options: ['Primary', 'Secondary', 'Tertiary'] },
    size: { control: 'inline-radio', options: ['Lg', 'Sm'] },
    state: { control: 'inline-radio', options: ['Default', 'Disabled'] },
    content: { control: 'inline-radio', options: ['None', 'Icon', 'Loader'] },
    children: { control: 'text' },
    subtitle: { control: 'text' },
    icon: { control: 'select', options: iconNames },
    htmlType: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
  },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 361 }}><S /></div>],
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { type: 'Secondary', children: 'Отмена' } };
export const Tertiary: Story = { args: { type: 'Tertiary', children: 'Спланировать день' } };
/** Content=Icon — Primary с иконкой справа на `color/primary/orange-90`. */
export const WithIcon: Story = { args: { content: 'Icon', children: 'Далее' } };
export const Loader: Story = { args: { content: 'Loader', children: 'Оплата' } };
/** Primary Disabled — серый (`background/disabled` + `text/disabled`), Secondary/Tertiary — прозрачность 50%. */
export const Disabled: Story = { args: { state: 'Disabled', children: 'Далее' } };
export const Small: Story = { args: { size: 'Sm', children: 'Выбрать' } };
export const WithPrice: Story = { args: { children: 'Купить билет', subtitle: 'от 1000 ₽' } };

/** Матрица Type × Content × State × Size — все 36 вариантов. */
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  decorators: [(S) => <S />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 260px)', gap: 'var(--spacing-xl)' }}>
      {(['Lg', 'Sm'] as const).flatMap((size) => (['Default', 'Disabled'] as const).flatMap((state) => (['None', 'Icon', 'Loader'] as const).flatMap((content) =>
        (['Primary', 'Secondary', 'Tertiary'] as const).map((type) => (
          <Button key={`${size}${state}${content}${type}`} type={type} size={size} state={state} content={content}>{type} · {content}</Button>
        )))))}
    </div>
  ),
};
