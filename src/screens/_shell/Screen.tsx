import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useScrollMemory } from './app';

/** Оболочка мобильного экрана: ширина по контейнеру (до 430), шапка и низ закреплены, середина прокручивается по вертикали. */
export function Screen({ header, footer, overlay, children, bg = 'var(--color-background-base)', onScroll }: { header?: ReactNode; footer?: ReactNode; overlay?: ReactNode; children: ReactNode; bg?: string; onScroll?: (top: number) => void }) {
  const hdr = useRef<HTMLDivElement>(null);
  const [hh, setHh] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const mem = useScrollMemory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { mem.restore(body.current); onScroll?.(body.current?.scrollTop ?? 0); }, []);
  useLayoutEffect(() => { const el = hdr.current; if (!el) return; const ro = new ResizeObserver(() => setHh((p) => Math.max(p, el.offsetHeight))); ro.observe(el); setHh(el.offsetHeight); return () => ro.disconnect(); }, []);
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 430, height: 'var(--app-height, 100dvh)', margin: '0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: bg }}>
      {header && <div ref={hdr} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>{header}</div>}
      <div ref={body} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', paddingTop: hh }} onScroll={(e) => { mem.save(e.currentTarget.scrollTop); onScroll?.(e.currentTarget.scrollTop); }}>{children}</div>
      {footer}
      {overlay && <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}><div style={{ display: 'contents', pointerEvents: 'auto' }}>{overlay}</div></div>}
    </div>
  );
}

/** Горизонтальная лента (карусели) — прокрутка только внутри ленты. */
export const Rail = ({ children, gap = 'var(--spacing-md)', pad = 'var(--spacing-2xl)' }: { children: ReactNode; gap?: string; pad?: string }) => (
  <div style={{ display: 'flex', gap, overflowX: 'auto', padding: `0 ${pad}`, scrollbarWidth: 'none' }}>{children}</div>
);

/** Затемнение под модалками и шторками (`color/text/primary` 60%). */
export const Dim = ({ children }: { children?: ReactNode }) => (
  <div className="bb-dim" style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--color-static-black) 60%, transparent)' }}>{children}</div>
);
