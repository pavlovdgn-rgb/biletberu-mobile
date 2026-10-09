import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '../Icon';
import { ItemMenu } from './ItemMenu';

/** Item_menu — пункт нижнего меню. Figma: `132:17976`. */
const meta = {
  title: 'Components/Навигация/Item_menu', component: ItemMenu, tags: ['autodocs'],
  args: { active: 'Yes', label: 'Главная', icon: 'home', iconActive: 'home-fill' },
  argTypes: { active: { control: 'inline-radio', options: ['Yes', 'No'] }, label: { control: 'text' }, icon: { control: 'select', options: iconNames }, iconActive: { control: 'select', options: iconNames } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ItemMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Active: Story = {};
export const Inactive: Story = { args: { active: 'No', label: 'Избранное', icon: 'heart-rounded', iconActive: 'heart-rounded-fill' } };
export const AllVariants: Story = { render: () => <div style={{ display: 'flex', gap: 'var(--spacing-5xl)' }}><ItemMenu /><ItemMenu active="No" /></div> };
