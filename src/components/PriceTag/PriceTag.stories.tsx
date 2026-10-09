import type { Meta, StoryObj } from '@storybook/react-vite';
import { PriceTag } from './PriceTag';

/** Price tag — бейдж скидки «-20%»; neutral — цена в Location_card. Figma: `132:17586`. */
const meta = {
  title: 'Components/Бейджи/Price tag', component: PriceTag, tags: ['autodocs'],
  args: { children: '-20%', tone: 'accent' },
  argTypes: { children: { control: 'text' }, tone: { control: 'inline-radio', options: ['accent', 'neutral'] } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PriceTag>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Discount: Story = {};
export const Price: Story = { args: { tone: 'neutral', children: '500 ₽' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}><PriceTag /><PriceTag>-50%</PriceTag><PriceTag tone="neutral">500 ₽</PriceTag><PriceTag tone="neutral">Бесплатно</PriceTag></div> };
