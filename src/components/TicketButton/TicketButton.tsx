import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../_lib/cx';
import { Icon } from '../Icon';
import s from './TicketButton.module.css';

export interface TicketButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Категория билета. */
  title?: string;
  /** Тариф. */
  tariff?: string;
  /** Цена. */
  price?: string;
  /** Выбранный билет — оранжевая обводка. */
  selected?: boolean;
  /** Цвет ценовой категории — полоса слева (в Figma — левая обводка `#9C59FF`). CSS-переменная `--illustration-seat-1…5`. */
  categoryColor?: string;
}

/**
 * ticket-button — выбранный билет (сеанс/ценовая категория) в нижней панели заказа. Figma: `132:17145`.
 * Полоса слева — цвет ценовой категории места (как легенда на схеме зала).
 */
export function TicketButton({ title = 'Пенсионеры (граждане РФ и стран ЕАЭС)', tariff = 'Стандартный', price = '1 000 ₽', selected, categoryColor = 'var(--illustration-seat-4)', className, style, ...rest }: TicketButtonProps) {
  return (
    <button type="button" className={cx(s.root, selected && s.selected, className)} style={{ ['--category' as string]: categoryColor, ...style }} {...rest}>
      <span className={s.text}>
        <span className={cx('ds-small', s.title)}>{title}</span>
        <span className={cx('ds-tiny-regular', s.sub)}>{tariff}</span>
        <span className={cx('ds-caption', s.price)}>{price}</span>
      </span>
      <Icon name="x-close" size={20} className={s.close} />
    </button>
  );
}
