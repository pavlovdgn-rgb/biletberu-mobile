/** Avatar — аватар пользователя или персоны. Size: xs 32 · sm 40 · lg 96 (круг, личные данные профиля). Figma: `132:17971`. */
export interface AvatarProps { size?: 'xs' | 'sm' | 'lg'; src?: string; alt?: string; /** Без фото — первая буква имени на подложке. */ name?: string; className?: string }

export function Avatar({ size = 'sm', src, alt = '', name, className }: AvatarProps) {
  const d = size === 'xs' ? 32 : size === 'lg' ? 96 : 40;
  return (
    <span className={className} style={{ display: 'inline-block', width: d, height: d, flexShrink: 0, overflow: 'hidden',
      borderRadius: size === 'lg' ? 'var(--radius-pill)' : 'var(--radius-2xl)', background: 'var(--color-background-placeholder)' }}>
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : name && <span className={size === 'lg' ? 'ds-display' : 'ds-subtitle'} aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'var(--color-text-secondary)' }}>{name.trim().charAt(0).toUpperCase()}</span>}
    </span>
  );
}
