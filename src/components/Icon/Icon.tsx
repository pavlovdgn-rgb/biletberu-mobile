import type { CSSProperties } from 'react';
import icons from './icons.json';

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];

export interface IconProps {
  /** Имя иконки из набора `20px/*` в Figma (Foundations, фрейм `132:17814`). */
  name: IconName;
  /** Размер в px. По умолчанию — родной размер иконки (20, 16 или 24). */
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Подпись для скринридера; без неё иконка декоративная. */
  label?: string;
}

/** Icon — набор `20px` из Figma. Цвет — через `color` (currentColor), только токенами `--color-*`. */
export function Icon({ name, size, className, style, label }: IconProps) {
  const [viewBox, body] = icons[name] as [string, string];
  const native = Number(viewBox.split(' ')[2]);
  const s = size ?? native;
  return (
    <svg
      viewBox={viewBox}
      width={s}
      height={s}
      className={className}
      style={{ flexShrink: 0, display: 'block', ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
