import { useState } from 'react';
import { cx } from '../_lib/cx';
import { Icon } from '../Icon';
import { Image } from '../Image';
import { Rate } from '../Rate';
import { AgeBadge } from '../AgeBadge';
import { PriceTag } from '../PriceTag';
import s from './Card.module.css';

export interface CardProps {
  /** Style: Vertical — лента «Рядом», Horizontal — подборки и результаты поиска. */
  style?: 'Vertical' | 'Horizontal';
  /** Badge: в ките только Yes (бейдж скидки). */
  badge?: 'Yes';
  title?: string;
  date?: string;
  place?: string;
  price?: string;
  discount?: string;
  rating?: string;
  age?: string;
  image?: string;
  liked?: boolean;
  /** Сердце «В избранное» (в Figma — видимость слоя `20px/heart-rounded`): No — скрыть, например в «Моих билетах». */
  heart?: 'Yes' | 'No';
  /** Тень Shadow/sm (как в ките). На экранах «Билет Беру» выключена. */
  shadow?: boolean;
  /** Приглушить фото (событие, по которому оформлен возврат). */
  muted?: boolean;
  onClick?: () => void;
  /** Нажали сердце (новое значение). Если задан — `liked` управляет сердцем снаружи. */
  onLikeChange?: (liked: boolean) => void;
  className?: string;
}

/** Card — карточка мероприятия. Figma: `132:17416`. */
export function Card({ style = 'Vertical', title = 'Интерактивная экскурсия по одному из главных музеев страны для детей', date = '24 декабря 11-00',
  place = 'Дворцовая площадь', price = 'от 100 - 2 000 ₽', discount = '-20%', rating = '4.5', age = '6+', image, liked = false, heart: showHeart = 'Yes', shadow = false, muted = false, onClick, onLikeChange, className }: CardProps) {
  const [inner, setLike] = useState(liked);
  const like = onLikeChange ? liked : inner;
  const heart = (cls: string) => (
    <button type="button" aria-pressed={like} aria-label="В избранное" className={cx(cls, like && s.liked)}
      onClick={(e) => { e.stopPropagation(); setLike(!like); onLikeChange?.(!like); }}>
      <Icon name={like ? 'heart-rounded-fill' : 'heart-rounded'} size={20} />
    </button>
  );
  if (style === 'Horizontal') {
    return (
      <article className={cx(s.root, s.Horizontal, shadow && s.shadow, className)} onClick={onClick}>
        <div className={s.hMedia}>
          <Image size="m" src={image} shade className={s.hImg} style={muted ? { opacity: 0.45 } : undefined} />
          <AgeBadge className={s.ageTL}>{age}</AgeBadge>
          {rating && <Rate size="Sm" value={rating} onDark className={s.hRate} />}
        </div>
        <div className={s.info}>
          <div className={s.hTop}>
            <span className={cx('ds-heading-h3', s.title)}>{title}</span>
            <div className={s.meta}>
              <span className="ds-body">{date}</span>
              <span className={cx('ds-body', s.secondary)}>{place}</span>
            </div>
          </div>
          <div className={s.hPrice}>
            <span className={s.hPriceL}><span className="ds-note">{price}</span>{discount && <PriceTag>{discount}</PriceTag>}</span>
            {showHeart === 'Yes' && heart(s.heart)}
          </div>
        </div>
      </article>
    );
  }
  return (
    <article className={cx(s.root, s.Vertical, shadow && s.shadow, className)} onClick={onClick}>
      <div className={s.media}>
        <Image size="lg" src={image} shade className={s.vImg} />
        <AgeBadge className={s.vAge}>{age}</AgeBadge>
        {rating && <Rate value={rating} onDark className={s.rateBL} />}
        {heart(s.like)}
      </div>
      <div className={s.details}>
        <div className={s.desc}>
          <span className={cx('ds-heading-h3', s.title)}>{title}</span>
          <div className={s.meta}>
            <span className="ds-body">{date}</span>
            <span className={cx('ds-body', s.secondary)}>{place}</span>
          </div>
        </div>
        <div className={s.priceRow}><span className="ds-note">{price}</span>{discount && <PriceTag>{discount}</PriceTag>}</div>
      </div>
    </article>
  );
}
