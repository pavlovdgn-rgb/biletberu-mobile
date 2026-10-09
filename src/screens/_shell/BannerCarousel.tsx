import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { FeaturedIndicators } from '../../components';

const GAP = 12; // var(--spacing-xl)
const PAD = 21;
const EASE = 'cubic-bezier(.25,.8,.25,1)';

/** Карусель баннеров главной: свайп пальцем/мышью + автосмена каждые `interval` мс.
 *  Без нативной прокрутки: лента сдвигается transform'ом с одной CSS-анимацией — браузеру нечего «доводить» снапом,
 *  поэтому картинки не дёргаются (ни в Safari, ни при перетаскивании мышью). Вертикальная прокрутка страницы не блокируется (touch-action: pan-y). */
export function BannerCarousel({ children, interval = 5000 }: { children: ReactNode[]; interval?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [hold, setHold] = useState(false);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dur, setDur] = useState(500);
  const [m, setM] = useState({ view: 393, item: 351 });
  const drag = useRef<{ id: number; x: number; y: number; t: number; axis: 'x' | 'y' | null } | null>(null);
  const moved = useRef(false);
  const count = children.length;

  // ширина окна и баннера — для центрирования
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const read = () => { const first = el.querySelector<HTMLElement>('[data-slide]'); setM({ view: el.clientWidth, item: first?.offsetWidth ?? el.clientWidth - PAD * 2 }); };
    read();
    const ro = new ResizeObserver(read); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const total = PAD * 2 + count * m.item + (count - 1) * GAP;
  /** Сдвиг ленты для слайда i: баннер по центру, но без пустоты у краёв (как снап по центру у прокрутки). */
  const offsetOf = (i: number) => Math.min(0, Math.max(m.view - total, m.view / 2 - (PAD + i * (m.item + GAP) + m.item / 2)));
  const go = (i: number, ms = 500) => { setDur(ms); setSlide(Math.max(0, Math.min(count - 1, i))); };

  useEffect(() => {
    if (hold || count < 2) return;
    const id = window.setTimeout(() => go((slide + 1) % count, slide + 1 === count ? 800 : 600), interval);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide, hold, count, interval]);

  const end = (e: React.PointerEvent) => {
    const d = drag.current; drag.current = null; setHold(false);
    if (!d) return;
    setDragging(false); setDx(0);
    if (d.axis !== 'x') return;
    const shift = e.clientX - d.x, fast = Math.abs(shift) / Math.max(1, performance.now() - d.t) > 0.4;
    const step = Math.abs(shift) > m.item * 0.25 || (fast && Math.abs(shift) > 30) ? (shift < 0 ? 1 : -1) : 0;
    go(slide + step, 380);
  };

  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const edge = (slide === 0 && dx > 0) || (slide === count - 1 && dx < 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', width: '100%' }}>
      <div ref={box} aria-roledescription="карусель"
        onPointerDown={(e) => { if (e.button !== 0) return; setHold(true); moved.current = false; drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), axis: null }; }}
        onPointerMove={(e) => {
          const d = drag.current; if (!d || d.id !== e.pointerId) return;
          const sx = e.clientX - d.x, sy = e.clientY - d.y;
          if (!d.axis && Math.hypot(sx, sy) > 6) {
            d.axis = Math.abs(sx) > Math.abs(sy) ? 'x' : 'y';
            if (d.axis === 'x') { moved.current = true; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); }
          }
          if (d.axis === 'x') setDx(sx);
        }}
        onPointerUp={end} onPointerCancel={end}
        onClickCapture={(e) => { if (moved.current) { e.stopPropagation(); e.preventDefault(); moved.current = false; } }}
        onDragStart={(e) => e.preventDefault()}
        style={{ width: '100%', overflow: 'hidden', touchAction: 'pan-y', cursor: 'grab', userSelect: 'none' }}>
        <div style={{ display: 'flex', gap: GAP, padding: `0 ${PAD}px`, width: 'max-content', willChange: 'transform',
          transform: `translate3d(${offsetOf(slide) + (edge ? dx * 0.35 : dx)}px, 0, 0)`, transition: dragging || reduce ? 'none' : `transform ${dur}ms ${EASE}` }}>
          {children.map((c, i) => <div key={i} data-slide aria-hidden={i !== slide} style={{ flexShrink: 0 }}>{c}</div>)}
        </div>
      </div>
      <FeaturedIndicators count={count} active={slide} />
    </div>
  );
}
