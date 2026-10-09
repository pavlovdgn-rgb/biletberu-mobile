import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../_lib/cx';
import { Icon, type IconName } from '../Icon';
import s from './TextButtons.module.css';

export interface TextButtonsProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Color: White | Gray — цвет подложки (для Fill=Yes) . */
  color?: 'White' | 'Gray';
  /** Fill: Yes — «таблетка» с подложкой, No — текстовая ссылка («Все», «Удалить»). */
  fill?: 'Yes' | 'No';
  /** Size: Lg — 36 px, M — 32 px. */
  size?: 'Lg' | 'M';
  /** Icon left: Yes | No. */
  iconLeft?: 'Yes' | 'No';
  /** Icon right: Yes | No. */
  iconRight?: 'Yes' | 'No';
  iconLeftName?: IconName;
  iconRightName?: IconName;
  /** Красная ссылка (удаление): цвет `color/system/error`. */
  danger?: boolean;
  children?: ReactNode;
}

/** Text-buttons — текстовая кнопка или «таблетка»: «Все», «Открыть карту», фильтры. Figma: `132:17098`. */
export function TextButtons({ color = 'Gray', fill = 'Yes', size = 'Lg', iconLeft = 'No', iconRight = 'No', iconLeftName, iconRightName = 'chevron-right', danger, children = 'Все места рядом', className, style, ...rest }: TextButtonsProps) {
  const isFill = fill === 'Yes';
  const leftName = iconLeftName ?? (isFill ? 'maximize' : 'trash');
  return (
    <button type="button" className={cx(s.root, isFill ? s.fill : s.plain, s[color], s[size], className)} style={danger ? { color: 'var(--color-system-error)', ...style } : style} {...rest}>
      {iconLeft === 'Yes' && <Icon name={leftName} size={isFill ? 20 : 16} />}
      <span className="ds-note">{children}</span>
      {iconRight === 'Yes' && <Icon name={iconRightName} size={16} />}
    </button>
  );
}
