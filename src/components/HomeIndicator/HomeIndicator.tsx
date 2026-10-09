import { NATIVE } from '../_lib/native';
/** Home Indicator — системная полоска iOS внизу экрана. Figma: `132:18045`. */
export function HomeIndicator({ transparent, className }: { transparent?: boolean; className?: string }) {
  // версия /app: полоска Home — системная, оставляем только отступ снизу
  if (NATIVE) return <div className={className} style={{ width: '100%', height: 'env(safe-area-inset-bottom, 0px)', background: transparent ? 'transparent' : 'var(--color-base-white)' }} />;
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 34,
      background: transparent ? 'transparent' : 'var(--color-base-white)' }}>
      <span style={{ width: 144, height: 5, borderRadius: 100, background: 'var(--color-text-primary)' }} />
    </div>
  );
}
