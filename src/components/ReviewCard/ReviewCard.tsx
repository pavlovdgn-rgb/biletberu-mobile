import { useState } from 'react';
import { cx } from '../_lib/cx';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';
import { Image } from '../Image';
import s from './ReviewCard.module.css';

export interface ReviewCardProps {
  /** Size: Lg — карточка в ленте отзывов, Sm — тёмная полупрозрачная поверх фото. */
  size?: 'Lg' | 'Sm';
  /** Photo: Yes — с превью фото. */
  photo?: 'Yes' | 'No';
  name?: string;
  date?: string;
  rating?: number;
  text?: string;
  avatar?: string;
  photos?: string[];
  /** Подпись «ещё N фото» на третьем превью (по умолчанию «+29», как в ките; '' — без подписи). */
  more?: string;
  /** Нажали превью фото (индекс). */
  onPhoto?: (i: number) => void;
  /** Во всю ширину контейнера (лента всех отзывов). */
  fluid?: boolean;
  className?: string;
}

/** review-card — отзыв о мероприятии. Figma: `132:17514`. */
export function ReviewCard({ size = 'Lg', photo = 'No', name = 'Наталья', date = '21 марта 2026', rating = 5,
  text = 'Хочу поделиться впечатлениями о спектакле «Выходные без телефона», на который мы с мужем сходили в прошлую субботу. Честно говоря, шли без особых ожиданий. Но то, что мы пережили за эти два часа, сложно описать словами.',
  avatar, photos = [], more = '+29', onPhoto, fluid, className }: ReviewCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <article className={cx(s.root, s[size], className)} style={fluid ? { width: '100%' } : undefined}>
      <div className={s.head}>
        <Avatar size="sm" src={avatar} name={name} />
        <div className={s.who}>
          <div className={s.line}><span className={cx('ds-note', s.name)}>{name}</span><span className={cx('ds-caption', s.date)}>{date}</span></div>
          <span className={s.stars} aria-label={`Оценка ${rating} из 5`}>
            {Array.from({ length: 5 }, (_, i) => <Icon key={i} name={i < rating ? 'star-fill-small' : 'star-small'} size={16} />)}
          </span>
        </div>
      </div>
      {photo === 'Yes' && size === 'Lg' && (
        <div className={s.photos}>
          {photos.slice(0, 3).map((src, i) => (
            <button key={i} type="button" aria-label={`Фото ${i + 1}`} onClick={() => onPhoto?.(i)} style={{ padding: 0, border: 0, background: 'transparent', cursor: onPhoto ? 'pointer' : 'default', display: 'inline-flex' }}>
              <Image size="xxxs" src={src} count={i === 2 && more ? more : undefined} />
            </button>))}
        </div>
      )}
      <div className={s.body}>
        <p className={cx('ds-body', s.text)} style={open ? { margin: 0, display: 'block', whiteSpace: 'pre-line' } : { margin: 0 }}>{text}</p>
        {size === 'Lg' && <button type="button" className={cx('ds-body', s.more)} onClick={() => setOpen(!open)}>{open ? 'Свернуть' : 'Читать полностью'}</button>}
      </div>
    </article>
  );
}
