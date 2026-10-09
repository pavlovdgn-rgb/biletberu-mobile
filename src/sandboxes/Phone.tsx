import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/** Рамка экрана iPhone 393×852: шапка и низ фиксированы, середина прокручивается по вертикали (без горизонтального скролла). */
export function Phone({ header, footer, children, bg = 'var(--color-background-base)', onScroll }: { header?: ReactNode; footer?: ReactNode; children: ReactNode; bg?: string; onScroll?: (top: number) => void }) {
  const hdr = useRef<HTMLDivElement>(null);
  const [hh, setHh] = useState(0);
  useLayoutEffect(() => { const el = hdr.current; if (!el) return; const ro = new ResizeObserver(() => setHh((p) => Math.max(p, el.offsetHeight))); ro.observe(el); setHh(el.offsetHeight); return () => ro.disconnect(); }, []);
  return (
    <div style={{ position: 'relative', width: 393, height: 852, overflow: 'hidden', borderRadius: 'var(--radius-2xl)', background: bg, boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column' }}>
      {header && <div ref={hdr} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>{header}</div>}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', paddingTop: hh }} onScroll={onScroll ? (e) => onScroll(e.currentTarget.scrollTop) : undefined}>{children}</div>
      {footer}
    </div>
  );
}

/** Горизонтальная лента внутри экрана (карусели) — скролл только внутри ленты. */
export const Rail = ({ children, gap = 'var(--spacing-md)', pad = 'var(--spacing-2xl)' }: { children: ReactNode; gap?: string; pad?: string }) => (
  <div style={{ display: 'flex', gap, overflowX: 'auto', padding: `0 ${pad}`, scrollbarWidth: 'none', scrollSnapType: 'x mandatory', scrollPaddingLeft: pad }}>{children}</div>
);
