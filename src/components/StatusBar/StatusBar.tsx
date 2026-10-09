import { NATIVE } from '../_lib/native';
export interface StatusBarProps {
  /** Theme: Light — тёмные элементы на белом, Dark — белые поверх фото. */
  theme?: 'Light' | 'Dark';
  /** Без белой подложки (поверх карты/фото) — тёмный текст на прозрачном фоне. */
  transparent?: boolean;
  /** bread crumbs: Yes — «◀ Назад в приложение» (возврат из банка). */
  breadCrumbs?: 'No' | 'Yes';
  time?: string;
  backLabel?: string;
  className?: string;
}

/** Status bar — системный статус-бар iOS (не токенизируется в Figma; цвета здесь — семантика). Figma: `132:17994`. */
export function StatusBar({ theme = 'Light', breadCrumbs = 'No', time = '9:41', backLabel = 'Билет Беру', transparent, className }: StatusBarProps) {
  // версия /app: настоящий статус-бар телефона — оставляем только системный отступ сверху
  if (NATIVE) return <div className={className} style={{ width: '100%', height: 'max(env(safe-area-inset-top, 0px), var(--spacing-2xl))', background: theme === 'Light' && !transparent ? 'var(--color-background-header)' : 'transparent' }} />;
  const fg = theme === 'Light' ? 'var(--color-text-primary)' : 'var(--color-static-white)';
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 62,
      padding: '21px var(--spacing-2xl) 19px', background: theme === 'Light' && !transparent ? 'var(--color-background-header)' : 'transparent', color: fg }}>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 54 }}>
        <span style={{ fontWeight: 600, fontSize: 17, lineHeight: '22px' }}>{time}</span>
        {breadCrumbs === 'Yes' && <span className="ds-tiny-regular" style={{ marginTop: -4 }}>◀ {backLabel}</span>}
      </span>
      <svg width="78" height="13" viewBox="0 0 78 13" aria-hidden fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="6" width="3" height="6" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" />
        <path d="M31 3.5a9 9 0 0 1 12 0l-1.4 1.4a7 7 0 0 0-9.2 0Zm2.8 2.8a5 5 0 0 1 6.4 0l-1.4 1.4a3 3 0 0 0-3.6 0ZM37 11l-1.6-1.6a2.3 2.3 0 0 1 3.2 0Z" />
        <rect x="50.5" y="0.5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".35" /><rect x="52" y="2" width="21" height="9" rx="2.5" /><rect x="75.5" y="4.5" width="1.5" height="4" rx="0.7" opacity=".4" />
      </svg>
    </div>
  );
}
