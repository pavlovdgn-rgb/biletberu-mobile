import { useState, type CSSProperties, type ReactNode } from 'react';

const OUT_MS = 240;

/** Шторка снизу: затемнение плавно проявляется, панель выезжает; закрытие — обратная анимация, потом колбэк.
 *  `children` — функция, получает `close(after?)`: закрыть с анимацией и затем выполнить действие (по умолчанию `onClose`). */
export function BottomSheet({ label, onClose, top, style, children }: { label: string; onClose: () => void; top?: number; style?: CSSProperties; children: (close: (after?: () => void) => void) => ReactNode }) {
  const [closing, setClosing] = useState(false);
  const close = (after?: () => void) => { if (closing) return; setClosing(true); setTimeout(after ?? onClose, OUT_MS); };
  return (
    <div className={closing ? 'bb-dim--out' : 'bb-dim'} style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--color-static-black) 60%, transparent)' }}>
      <div onClick={() => close()} style={{ position: 'absolute', inset: 0 }} />
      <div role="dialog" aria-label={label} className={closing ? 'bb-sheet--out' : 'bb-sheet'}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top, display: 'flex', flexDirection: 'column', background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', ...style }}>
        {children(close)}
      </div>
    </div>
  );
}
