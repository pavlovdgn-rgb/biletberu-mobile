import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '../Icon';
import { TextButtons } from './TextButtons';

/** Text-buttons — текстовая кнопка или «таблетка»: «Все», «Открыть карту», «Удалить». Figma: `132:17098`. */
const meta = {
  title: 'Components/Действия/Text-buttons',
  component: TextButtons,
  tags: ['autodocs'],
  args: { color: 'Gray', fill: 'Yes', size: 'Lg', iconLeft: 'No', iconRight: 'No', children: 'Все места рядом' },
  argTypes: {
    color: { control: 'inline-radio', options: ['White', 'Gray'] },
    fill: { control: 'inline-radio', options: ['Yes', 'No'] },
    size: { control: 'inline-radio', options: ['Lg', 'M'] },
    iconLeft: { control: 'inline-radio', options: ['Yes', 'No'] },
    iconRight: { control: 'inline-radio', options: ['Yes', 'No'] },
    iconLeftName: { control: 'select', options: iconNames },
    iconRightName: { control: 'select', options: iconNames },
    children: { control: 'text' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TextButtons>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GrayPill: Story = {};
export const WhiteWithIcon: Story = { args: { color: 'White', iconLeft: 'Yes', size: 'M', children: 'Открыть карту' } };
/** Fill=No — ссылка «Все» в шапке секции. */
export const Link: Story = { args: { fill: 'No', iconRight: 'Yes', children: 'Все' } };
export const Delete: Story = { args: { fill: 'No', iconLeft: 'Yes', children: 'Удалить' } };

/** Все 9 вариантов кита. */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
      <TextButtons /><TextButtons color="White" /><TextButtons iconLeft="Yes" /><TextButtons color="White" iconLeft="Yes" />
      <TextButtons color="White" size="M" iconLeft="Yes">Открыть карту</TextButtons><TextButtons color="White" size="M">Открыть карту</TextButtons>
      <TextButtons fill="No">Все</TextButtons><TextButtons fill="No" iconLeft="Yes">Удалить</TextButtons><TextButtons fill="No" iconRight="Yes">Все</TextButtons>
    </div>
  ),
};
