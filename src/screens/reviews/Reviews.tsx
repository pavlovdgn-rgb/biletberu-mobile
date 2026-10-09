import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ButtonIcon, HomeIndicator, Icon, ReviewCard, StatusBar, TitlePage } from '../../components';
import { photoSrc } from '../../assets/photos';
import { MAIN_EVENT_ID } from '../../data/mock';
import { reviewsWord, useReviews } from '../../data/reviews';
import { useStore } from '../../data/store';
import { NavBar, useBack, useClose, useOpen } from '../_shell/app';
import { Screen } from '../_shell/Screen';

/** Comment_page (Figma `184:16645`) — `/gallery?i=N`: фото отзывов на весь экран, счётчик, карточка отзыва поверх, превью внизу.
 *  Свайп влево/вправо или превью — другое фото; крестик — закрыть. */
export function Gallery() {
  const close = useClose('/event');
  const [params] = useSearchParams();
  const REVIEW_PHOTOS = useReviews(params.get('id') ?? MAIN_EVENT_ID).photos;
  const [i, setI] = useState(() => Math.min(REVIEW_PHOTOS.length - 1, Math.max(0, Number(params.get('i')) || 0)));
  const start = useRef<number | null>(null);
  const cur = REVIEW_PHOTOS[i];
  const go = (n: number) => setI(Math.min(REVIEW_PHOTOS.length - 1, Math.max(0, n)));
  // Плашка отзыва видна 2 с после открытия и после смены фото, затем плавно исчезает; тап по фото — показать снова
  const [card, setCard] = useState(true);
  const [ping, setPing] = useState(0);
  useEffect(() => { setCard(true); const t = setTimeout(() => setCard(false), 2000); return () => clearTimeout(t); }, [i, ping]);
  return (
    <div style={{ position: 'relative', height: 'var(--app-height, 100dvh)', overflow: 'hidden', background: 'var(--color-static-black)', userSelect: 'none', touchAction: 'pan-y' }}
      onPointerDown={(e) => { start.current = e.clientX; }}
      onPointerUp={(e) => { if (start.current === null) return; const dx = e.clientX - start.current; start.current = null; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); else if ((e.target as HTMLElement).tagName === 'IMG' && !(e.target as HTMLElement).closest('button')) setPing((v) => v + 1); }}>
      {REVIEW_PHOTOS.map((p, n) => <img key={n} src={photoSrc(p.src)} alt={`Фото ${n + 1} из ${REVIEW_PHOTOS.length}`} draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: n === i ? 1 : 0, transition: 'opacity 400ms ease-in-out' }} />)}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <StatusBar theme="Dark" />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 68, padding: '0 var(--spacing-2xl)' }}>
          <ButtonIcon icon="x-close" label="Закрыть" onClick={close} />
          <span className="ds-heading-h2" style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', color: 'var(--color-static-white)', pointerEvents: 'none' }}>{i + 1}/{REVIEW_PHOTOS.length}</span>
        </div>
        <div aria-hidden={!card} style={{ padding: '0 var(--spacing-2xl)', opacity: card ? 1 : 0, transform: card ? 'none' : 'translateY(-8px)', pointerEvents: card ? 'auto' : 'none', transition: 'opacity 400ms ease, transform 400ms ease' }}>
          <ReviewCard size="Sm" name={cur.review.name} date={cur.review.date} rating={cur.review.rating} text={cur.review.text} avatar={cur.review.avatar ? photoSrc(cur.review.avatar) : undefined} fluid />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <div role="tablist" aria-label="Фото отзывов" style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {REVIEW_PHOTOS.map((p, n) => (
            <button key={n} type="button" role="tab" aria-selected={n === i} aria-label={`Фото ${n + 1}`} onClick={() => go(n)}
              style={{ flexShrink: 0, width: 60, height: 60, padding: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${n === i ? 'var(--color-static-white)' : 'transparent'}`, background: 'transparent', transition: 'border-color var(--motion-duration) var(--motion-ease)' }}>
              <img src={photoSrc(p.src)} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 34 }}><span style={{ width: 144, height: 5, borderRadius: 'var(--radius-pill)', background: 'var(--color-base-white)' }} /></div>
      </div>
    </div>
  );
}

/** All comment_page (Figma `184:16779`) — `/reviews`: рейтинг, все отзывы с фото, сортировка (новые / по оценке). */
export function AllReviews() {
  const back = useBack('/event');
  const open = useOpen();
  const { toast } = useStore();
  const [params] = useSearchParams();
  const eventId = params.get('id') ?? MAIN_EVENT_ID;
  const { list: REVIEWS, photos: REVIEW_PHOTOS, avg } = useReviews(eventId);
  const [sort, setSort] = useState<'date' | 'rating'>('date');
  // Отзыв, на который нажали на странице события, — первым (пока не сменили сортировку)
  const [first, setFirst] = useState(params.get('first'));
  const sorted = [...REVIEWS].sort((a, b) => (sort === 'date' ? b.dateISO.localeCompare(a.dateISO) : b.rating - a.rating || b.dateISO.localeCompare(a.dateISO)));
  const list = first ? [...sorted.filter((r) => r.id === first), ...sorted.filter((r) => r.id !== first)] : sorted;
  const photoIndex = (src: string) => REVIEW_PHOTOS.findIndex((p) => p.src === src);
  return (
    <Screen header={<div><StatusBar /><TitlePage title="Отзывы" iconRight="Yes" iconRightName="sort" rounded onLeft={back}
      onRight={() => { const next = sort === 'date' ? 'rating' : 'date'; setSort(next); setFirst(null); toast(next === 'date' ? 'Сначала новые' : 'Сначала с высокой оценкой'); }} /></div>}
      footer={<div><NavBar active={0} /><HomeIndicator /></div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0' }}>
        <div className="ds-heading-h2" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl) var(--spacing-2xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)' }}>
          <Icon name="star-fill" size={20} style={{ color: 'var(--color-primary-orange)' }} />{avg}<span style={{ color: 'var(--color-text-secondary)' }}>{reviewsWord(REVIEWS.length)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)' }}>
          {list.map((r) => <ReviewCard key={r.id} fluid name={r.name} date={r.date} rating={r.rating} text={r.text} avatar={r.avatar ? photoSrc(r.avatar) : undefined}
            photo={r.photos.length ? 'Yes' : 'No'} photos={r.photos.map((p) => photoSrc(p))} more="" onPhoto={(n) => open(`/gallery?id=${eventId}&i=${photoIndex(r.photos[n])}`)} />)}
        </div>
      </div>
    </Screen>
  );
}
