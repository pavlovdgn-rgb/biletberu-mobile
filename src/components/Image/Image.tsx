import type { ReactNode } from 'react';
import { cx } from '../_lib/cx';
import s from './Image.module.css';

export type ImageSize = 'xxxs' | 'xxs' | 'xs' | 'sm' | 'm' | 'lg' | 'xl' | 'xxl';

export interface ImageProps {
  /** Размер — набор Image_* из Figma: xxxs 36 · xxs 48 · xs 60 · sm 100×84 · m 112×140 · lg 263×160 · xl 351×206 · xxl 393×332. */
  size?: ImageSize;
  src?: string;
  alt?: string;
  /** Затемнение снизу для текста поверх (как градиент в Image_sm/m/lg/xl). */
  shade?: boolean;
  /** Растянуть по ширине контейнера. */
  fluid?: boolean;
  /** Счётчик «+29» поверх (Image_xxxs в отзывах). */
  count?: string;
  children?: ReactNode;
  className?: string;
  style?: import('react').CSSProperties;
}

/** Image_* — изображение фиксированного размера; без src — плейсхолдер `color/background/placeholder`. Figma: `132:17958`–`132:17970`. */
export function Image({ size = 'xs', src, alt = '', shade, fluid, count, children, className, style }: ImageProps) {
  return (
    <span className={cx(s.root, s[size], shade && s.shade, fluid && s.fluid, className)} style={style}>
      {src && <img src={src} alt={alt} loading="lazy" />}
      {count && <span className={cx('ds-heading-h2', s.count)}>{count}</span>}
      {children && <span className={s.overlay}>{children}</span>}
    </span>
  );
}
