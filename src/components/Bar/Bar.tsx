import { useState } from 'react';
import { ItemMenu } from '../ItemMenu';
import type { IconName } from '../Icon';

const ITEMS: Array<{ label: string; icon: IconName; iconActive: IconName }> = [
  { label: 'Главная', icon: 'home', iconActive: 'home-fill' },
  { label: 'Куда пойдём', icon: 'marker-pin-02', iconActive: 'marker-pin-02-fill' },
  { label: 'Избранное', icon: 'heart-rounded', iconActive: 'heart-rounded-fill' },
  { label: 'Мои билеты', icon: 'ticket', iconActive: 'ticket-fill' },
];

export interface BarProps { active?: number; onChange?: (i: number) => void; className?: string }

/** bar — нижнее меню (таббар): Главная, Куда пойдём, Избранное, Мои билеты. Figma: `132:17983`. */
export function Bar({ active = 0, onChange, className }: BarProps) {
  const [cur, setCur] = useState(active);
  return (
    <nav className={className} aria-label="Основное меню" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
      padding: 'var(--spacing-xl) var(--spacing-2xl)', background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)' }}>
      {ITEMS.map((it, i) => <ItemMenu key={it.label} {...it} active={i === cur ? 'Yes' : 'No'} onClick={() => { setCur(i); onChange?.(i); }} />)}
    </nav>
  );
}
