import { useRef, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { Button, HomeIndicator, Icon, Image, StatusBar, TextButtons, TitlePage } from '../../components';
import { photoSrc, photos } from '../../assets/photos';
import { eventById } from '../../data/mock';
import { useStore } from '../../data/store';
import { NavBar, useBack } from '../_shell/app';
import { Screen } from '../_shell/Screen';

/** Write review (Figma: Screens → 4. Карточка события и отзывы, «Review — write»). `/review?event=<id>[&rating=N]`:
 *  оценка звёздами, текст (от 20 символов), до 5 фото; «Опубликовать» — отзыв первым в ленте события. Свой отзыв можно изменить или удалить. */

export const RATING_WORDS = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'];
const MIN = 20, MAX = 1000, MAX_PHOTOS = 5;
const card = { background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' } as const;

/** Снимок → уменьшенный JPEG data-URL (≤ 720 px), чтобы отзыв с фото помещался в хранилище браузера. */
const shrink = (file: File) => new Promise<string>((ok, fail) => {
  const url = URL.createObjectURL(file), img = new window.Image();
  img.onload = () => {
    const k = Math.min(1, 720 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.72));
  };
  img.onerror = () => { URL.revokeObjectURL(url); fail(new Error('bad image')); };
  img.src = url;
});

/** Пять звёзд для оценки: `size` 40 на форме, 32 — в строке «Как вам?» на билете. */
export function StarsInput({ value, onChange, size = 40 }: { value: number; onChange: (n: number) => void; size?: number }) {
  return (
    <span role="radiogroup" aria-label="Оценка" style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} из 5 — ${RATING_WORDS[n]}`} onClick={() => onChange(n)}
          style={{ display: 'inline-flex', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', color: n <= value ? 'var(--color-primary-orange)' : 'var(--color-text-disabled)', transition: 'transform var(--motion-duration) var(--motion-ease)' }}>
          <Icon name={n <= value ? 'star-fill' : 'star'} size={size} />
        </button>))}
    </span>
  );
}

export function ReviewForm() {
  const [params] = useSearchParams();
  const e = eventById(params.get('event') ?? '');
  const back = useBack(e ? `/event?id=${e.id}` : '/main');
  const { state, saveReview, deleteReview, toast } = useStore();
  const mine = e ? state.myReviews[e.id] : undefined;
  const [rating, setRating] = useState(mine?.rating ?? (Number(params.get('rating')) || 0));
  const [text, setText] = useState(mine?.text ?? '');
  const [pics, setPics] = useState<string[]>(mine?.photos ?? []);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  if (!e) return <Navigate to="/main" replace />;
  const left = MIN - text.trim().length;
  const ready = rating > 0 && left <= 0 && !busy;
  const changed = !mine || mine.rating !== rating || mine.text !== text || mine.photos.join() !== pics.join();
  const user = state.profile.user;

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - pics.length;
    try { const out = await Promise.all([...files].slice(0, room).map(shrink)); setPics((p) => [...p, ...out]); }
    catch { toast('Не удалось загрузить фото', 'error'); }
    if (files.length > room) toast(`Можно добавить до ${MAX_PHOTOS} фото`);
  };
  const publish = async () => {
    setBusy(true);
    await saveReview({ eventId: e.id, rating, text: text.trim(), photos: pics });
    toast(mine ? 'Отзыв обновлён' : 'Спасибо! Отзыв опубликован', 'success');
    back();
  };

  return (
    <Screen header={<div className="bb-surface-head" style={{ background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}><StatusBar /><TitlePage title={mine ? 'Ваш отзыв' : 'Отзыв'} iconLeft="Yes" onLeft={back} /></div>}
      footer={<div style={{ background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)' }}>
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}>
          <Button state={ready && changed ? 'Default' : 'Disabled'} disabled={!ready || !changed} content={busy ? 'Loader' : 'None'} aria-busy={busy} onClick={publish}>{busy ? 'Публикуем…' : mine ? 'Сохранить' : 'Опубликовать'}</Button>
        </div>
        <NavBar active={0} /><HomeIndicator />
      </div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0 var(--spacing-4xl)' }}>
        <section style={{ ...card, display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl)' }}>
          <Image size="xxs" src={photos[e.image]} />
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span className="ds-subtitle">{e.title}</span>
            <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{e.place}</span>
          </span>
        </section>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h2">Как вам?</span>
          <StarsInput value={rating} onChange={setRating} />
          <span className="ds-body" style={{ minHeight: 20, color: rating ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{rating ? RATING_WORDS[rating] : 'Нажмите на звезду'}</span>
        </section>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h2">Расскажите подробнее</span>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <textarea className="ds-body" value={text} maxLength={MAX} rows={6} placeholder="Что понравилось, что нет — это поможет другим зрителям" aria-label="Текст отзыва"
              onChange={(ev) => setText(ev.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'none', padding: 'var(--spacing-xl) var(--spacing-2xl)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', outline: 0,
                background: 'var(--color-background-base)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }}
              onFocus={(ev) => { ev.currentTarget.style.borderColor = 'var(--color-primary-orange)'; }} onBlur={(ev) => { ev.currentTarget.style.borderColor = 'transparent'; }} />
            <span className="ds-caption" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 var(--spacing-2xl)', color: 'var(--color-text-secondary)' }}>
              <span>{left > 0 ? `Ещё ${left} симв. — минимум ${MIN}` : ' '}</span><span>{text.length}/{MAX}</span>
            </span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            {pics.map((src, i) => (
              <span key={i} style={{ position: 'relative', display: 'inline-flex' }}>
                <Image size="sm" src={photoSrc(src)} style={{ width: 72, height: 72 }} />
                <button type="button" aria-label={`Убрать фото ${i + 1}`} onClick={() => setPics((p) => p.filter((_, k) => k !== i))}
                  style={{ position: 'absolute', top: 4, right: 4, display: 'inline-flex', padding: 2, border: 0, borderRadius: 'var(--radius-pill)', background: 'var(--color-base-white)', color: 'var(--color-text-primary)', cursor: 'pointer' }}><Icon name="close-16px" size={16} /></button>
              </span>))}
            {pics.length < MAX_PHOTOS && (
              <button type="button" onClick={() => file.current?.click()} style={{ width: 72, height: 72, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2xs)', border: 0, borderRadius: 'var(--radius-sm)', background: 'var(--color-background-base)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <Icon name="camera" size={20} /><span className="ds-caption">Фото</span>
              </button>)}
            <input ref={file} type="file" accept="image/*" multiple hidden onChange={(ev) => { void addPhotos(ev.target.files); ev.target.value = ''; }} />
          </div>
          <span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>Опубликуем от имени «{user.name} {user.surname.slice(0, 1)}.» — как в профиле</span>
        </section>
        {mine && <span style={{ display: 'flex', justifyContent: 'center' }}><TextButtons fill="No" danger onClick={() => { deleteReview(e.id); toast('Отзыв удалён'); back(); }}>Удалить отзыв</TextButtons></span>}
      </div>
    </Screen>
  );
}
