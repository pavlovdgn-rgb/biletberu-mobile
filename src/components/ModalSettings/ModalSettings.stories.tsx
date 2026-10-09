import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalSettings } from './ModalSettings';
import { TitlePage } from '../TitlePage';
import { RangeSlider } from '../RangeSlider';
import { ButtonTag } from '../ButtonTag';

/** Modal-settings — bottom sheet параметров плана дня. Контент — слот children. Figma: `132:18144`. */
const meta = {
  title: 'Components/Оверлеи и фидбэк/Modal-settings', component: ModalSettings, tags: ['autodocs'],
  args: { subtitle: 'Суббота, 25 Апреля', actionLabel: 'Сохранить' },
  argTypes: { subtitle: { control: 'text' }, actionLabel: { control: 'text' }, onAction: { action: 'save' } },
  parameters: { layout: 'centered' },
  decorators: [(S) => <div style={{ width: 393 }}><S /></div>],
} satisfies Meta<typeof ModalSettings>;
export default meta;
type Story = StoryObj<typeof meta>;
const Filters = () => (
  <div style={{ display: 'grid', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)' }}>
    <TitlePage version="Secondary" title="Бюджет на день" /><RangeSlider />
    <TitlePage version="Secondary" title="Что добавить" /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}><ButtonTag status="Active">Кафе</ButtonTag><ButtonTag>Рестораны</ButtonTag><ButtonTag>Парки</ButtonTag><ButtonTag>Бары</ButtonTag></div>
  </div>
);
export const Default: Story = { render: (a) => <ModalSettings {...a}><Filters /></ModalSettings> };
export const AllVariants: Story = { render: () => <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}><ModalSettings><Filters /></ModalSettings><ModalSettings subtitle="Воскресенье, 26 Апреля" actionLabel="Применить" /></div> };
