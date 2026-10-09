import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '../Icon';
import { TitlePage } from './TitlePage';

/** Title_page — шапка экрана (Main) или секции (Secondary). Figma: `132:18078`. */
const meta = {
  title: 'Components/Навигация/Title_page', component: TitlePage, tags: ['autodocs'],
  args: { version: 'Main', iconLeft: 'Yes', iconRight: 'No', textButton: 'No', subtitle: 'No', title: 'Фильтры', subtitleText: '25 апреля 18-00' },
  argTypes: {
    version: { control: 'inline-radio', options: ['Main', 'Secondary'] }, iconLeft: { control: 'inline-radio', options: ['Yes', 'No'] },
    iconRight: { control: 'inline-radio', options: ['Yes', 'No'] }, textButton: { control: 'inline-radio', options: ['Yes', 'No'] },
    subtitle: { control: 'inline-radio', options: ['Yes', 'No'] }, title: { control: 'text' }, subtitleText: { control: 'text' },
    textButtonLabel: { control: 'text' }, iconLeftName: { control: 'select', options: iconNames }, iconRightName: { control: 'select', options: iconNames },
  },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ maxWidth: 393 }}><S /></div>],
} satisfies Meta<typeof TitlePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Main: Story = {};
export const WithReset: Story = { args: { textButton: 'Yes' } };
export const WithFilter: Story = { args: { iconRight: 'Yes', title: 'Результаты' } };
export const WithSubtitle: Story = { args: { subtitle: 'Yes', title: 'Выходные без телефона' } };
export const Secondary: Story = { args: { version: 'Secondary', title: 'Подборки событий' } };
/** 6 вариантов кита. */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <TitlePage textButton="Yes" /><TitlePage iconRight="Yes" title="Результаты" /><TitlePage title="Оформление заказа" /><TitlePage iconLeft="No" title="Избранное" />
      <TitlePage subtitle="Yes" title="Выходные без телефона" /><TitlePage version="Secondary" title="Подборки событий" />
    </div>
  ),
};
