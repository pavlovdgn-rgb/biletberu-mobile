import { cx } from '../_lib/cx';
import { Image } from '../Image';
import { AgeBadge } from '../AgeBadge';

export interface BannerImageProps { title?: string; date?: string; age?: string; image?: string; className?: string; onClick?: () => void }

/** Banner_image — баннер-подборка на главной: фото, заголовок H1 и дата белым. Figma: `132:17455`. */
export function BannerImage({ title = 'Выходные без телефона', date = '25 апреля 18-00', age = '12+', image, className, onClick }: BannerImageProps) {
  return (
    <article className={className} onClick={onClick} style={{ position: 'relative', width: 351, borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
      <Image size="xl" src={image} shade />
      {age && <span style={{ position: 'absolute', top: 'var(--spacing-2xl)', left: 'var(--spacing-2xl)' }}><AgeBadge>{age}</AgeBadge></span>}
      <div style={{ position: 'absolute', left: 'var(--spacing-2xl)', right: 'var(--spacing-2xl)', bottom: 'var(--spacing-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', color: 'var(--color-static-white)' }}>
        <span className={cx('ds-heading-h1')}>{title}</span>
        <span className="ds-body">{date}</span>
      </div>
    </article>
  );
}
