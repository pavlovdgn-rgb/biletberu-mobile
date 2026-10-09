import { useRef, useState } from 'react';
import { photos } from '../../assets/photos';

/** Обложка мероприятия: фото листаются свайпом (палец или мышь), счётчик «N фото из M». */
export function HeroGallery({ images, height = 384 }: { images: string[]; height?: number }) {
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number; axis: 'x' | 'y' | null } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const n = images.length;
  const end = () => {
    const w = box.current?.clientWidth ?? 393;
    if (Math.abs(dx) > w * 0.18) setI((v) => Math.max(0, Math.min(n - 1, v + (dx < 0 ? 1 : -1))));
    setDx(0); start.current = null;
  };
  return (
    <div ref={box} style={{ position: 'relative', height, overflow: 'hidden', touchAction: 'pan-y', cursor: n > 1 ? 'grab' : undefined, userSelect: 'none' }}
      onPointerDown={(e) => { if (n > 1) start.current = { x: e.clientX, y: e.clientY, axis: null }; }}
      onPointerMove={(e) => { const s = start.current; if (!s) return; const mx = e.clientX - s.x, my = e.clientY - s.y;
        if (!s.axis && Math.hypot(mx, my) > 6) { s.axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'; if (s.axis === 'x') e.currentTarget.setPointerCapture(e.pointerId); }
        if (s.axis === 'x') setDx((i === 0 && mx > 0) || (i === n - 1 && mx < 0) ? mx * 0.3 : mx); }}
      onPointerUp={end} onPointerCancel={end} onDragStart={(e) => e.preventDefault()}>
      <div style={{ display: 'flex', height: '100%', transform: `translateX(calc(${-i * 100}% + ${dx}px))`, transition: dx ? 'none' : 'transform 300ms cubic-bezier(.25,.8,.25,1)' }}>
        {images.map((src, k) => <img key={k} src={photos[src]} alt="" draggable={false} style={{ flex: '0 0 100%', width: '100%', height: '100%', objectFit: 'cover' }} />)}
      </div>
      {n > 1 && <span className="ds-caption" style={{ position: 'absolute', right: 'var(--spacing-2xl)', top: height - 63, padding: 'var(--spacing-xs) var(--spacing-md)', borderRadius: 'var(--radius-sm)', background: 'var(--color-static-black-80)', color: 'var(--color-static-white)' }}>{i + 1} фото из {n}</span>}
    </div>
  );
}
