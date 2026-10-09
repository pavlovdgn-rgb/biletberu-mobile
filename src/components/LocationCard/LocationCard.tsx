import { cx } from '../_lib/cx';
import { Icon, type IconName } from '../Icon';
import { Image } from '../Image';
import { PriceTag } from '../PriceTag';
import { ButtonIcon } from '../ButtonIcon';
import { Bulb } from '../Bulb';
import s from './LocationCard.module.css';

export interface LocationCardProps {
  /** Photo: Yes — с фото 60×60, No — компактная строка плана с номером точки. */
  photo?: 'Yes' | 'No';
  /** Button: Yes — с кнопкой действия («+» или удалить). */
  button?: 'No' | 'Yes';
  /** Drag: Yes — ручка перетаскивания в редакторе плана. */
  drag?: 'No' | 'Yes';
  name?: string;
  subtitle?: string;
  time?: string;
  price?: string;
  order?: number;
  /** Категория места (Photo=No): «Кафе», «Театр». */
  category?: string;
  /** Расстояние (Photo=No), необязательно. */
  distance?: string;
  image?: string;
  /** Отметка «в избранном» на фото. */
  favourite?: boolean;
  /** Кнопка-корзина вместо «+» без ручки перетаскивания (место уже добавлено — его можно убрать). */
  remove?: boolean;
  /** Иконка кнопки (Button=Yes) — замена иконки в инстансе, как в Figma: например `heart-rounded-fill` в «Избранном» (убрать из избранного). */
  actionIcon?: IconName;
  actionLabel?: string;
  /** Адрес с иконкой метки под названием (места в «Избранном»). */
  address?: string;
  onAction?: () => void;
  className?: string;
}

/** Location_card — карточка места или активности: рядом с событием, в плане дня, в избранном. Figma: `132:17461`. */
export function LocationCard({ photo = 'Yes', button = 'No', drag = 'No', name = 'Выходные без телефона: Моменты без лайков',
  subtitle = '25 апреля • 18:00', time = '20 мин. до театра', price = '500 ₽', order = 1, category = 'Кафе', distance, image, favourite, remove, actionIcon, actionLabel, address, onAction, className }: LocationCardProps) {
  if (photo === 'No') {
    return (
      <div className={cx(s.root, s.noPhoto, className)}>
        <Bulb size="Lg">{order}</Bulb>
        <div className={s.info}>
          <span className={cx('ds-subtitle', s.oneLine)}>{name}</span>
          <span className={s.metaRow}>
            <span className={cx('ds-body', s.meta)}><Icon name="clock-small" size={16} style={{ color: 'var(--color-primary-orange)' }} />{time}</span>
            {distance && <span className={cx('ds-body', s.meta)}><Icon name="marker-pin-small" size={16} />{distance}</span>}
          </span>
        </div>
        {category && <PriceTag tone="neutral">{category}</PriceTag>}
      </div>
    );
  }
  return (
    <div className={cx(s.root, drag === 'Yes' && s.drag, className)}>
      <span className={s.lead}>
        {/* ручка: тянуть сразу, без удержания; увеличенная зона касания */}
        {drag === 'Yes' && <span data-handle style={{ display: 'inline-flex', padding: '12px 6px', margin: '-12px -6px', touchAction: 'none', cursor: 'grab' }}><Icon name="Drag tool" size={16} className={s.handle} label="Перетащить" /></span>}
        <span className={s.photo}>
          <Image size="xs" src={image} />
          {favourite && <Icon name="heart-rounded-fill" size={12} className={s.badgeHeart} />}
        </span>
      </span>
      <div className={s.info}>
        <span className={cx('ds-price', s.name)}>{name}</span>
        {address ? (
          <span className={cx('ds-body', s.meta, s.secondary)}><Icon name="marker-pin-small" size={16} style={{ color: 'var(--color-primary-orange)' }} />{address}</span>
        ) : button === 'Yes' && !actionIcon ? (
          <span className={s.metaRow}>
            <span className={cx('ds-body', s.meta)}><Icon name="clock-small" size={16} style={{ color: 'var(--color-primary-orange)' }} />{time}</span>
            {distance && <span className={cx('ds-body', s.meta)}><Icon name="marker-pin-small" size={16} style={{ color: 'var(--color-primary-orange)' }} />{distance}</span>}
          </span>
        ) : (
          <span className={cx('ds-body', s.secondary)}>{subtitle}</span>
        )}
      </div>
      {button === 'Yes'
        ? actionIcon ? <ButtonIcon icon={actionIcon} label={actionLabel ?? 'Действие'} style={{ color: 'var(--color-text-secondary)' }} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAction?.(); }} />
        : (drag === 'Yes' || remove
          ? <ButtonIcon icon="trash" label="Удалить" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAction?.(); }} />
          : <ButtonIcon icon="plus" accent label="Добавить в план" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAction?.(); }} />)
        : <PriceTag tone="neutral">{price}</PriceTag>}
    </div>
  );
}
