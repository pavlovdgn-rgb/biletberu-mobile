import type { ReactNode } from 'react';
import { cx } from '../_lib/cx';
import { Icon, type IconName } from '../Icon';
import { Toggle } from '../Toggle';
import s from './SettingsRow.module.css';

export interface SettingsRowProps {
  /** Type: Default — шеврон; Value — значение + шеврон; Toggle — переключатель; Danger — красная строка без шеврона. */
  type?: 'Default' | 'Value' | 'Toggle' | 'Danger';
  /** Label — подпись (Body). */
  label?: ReactNode;
  /** Icon — замена иконки (набор 20px). */
  icon?: IconName;
  /** Значение справа (Type=Value). */
  value?: ReactNode;
  /** Состояние переключателя (Type=Toggle). */
  on?: boolean;
  onToggle?: (on: boolean) => void;
  onClick?: () => void;
  className?: string;
}

/** Settings row — строка списка в профиле и настройках: иконка 20px, подпись, справа шеврон / значение / переключатель. Figma: `266:29941`. */
export function SettingsRow({ type = 'Default', label = 'Город', icon = 'settings', value, on = false, onToggle, onClick, className }: SettingsRowProps) {
  const body = (<>
    <Icon name={icon} size={20} className={s.icon} />
    <span className={cx('ds-body', s.label)}>{label}</span>
    {type === 'Value' && <span className={cx('ds-body', s.value)}>{value}</span>}
    {(type === 'Default' || type === 'Value') && <Icon name="chevron-right" size={20} className={s.chevron} />}
    {type === 'Toggle' && <Toggle key={String(on)} state={on ? 'Active' : 'Disabled'} label={typeof label === 'string' ? label : 'Переключатель'} onChange={onToggle} />}
  </>);
  if (type === 'Toggle') return <div className={cx(s.root, className)}>{body}</div>;
  return <button type="button" className={cx(s.root, s.button, type === 'Danger' && s.danger, className)} onClick={onClick}>{body}</button>;
}
