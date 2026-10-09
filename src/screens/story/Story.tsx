import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, ButtonIcon, ProgressBar, StatusBar } from '../../components';
import { appUrl } from '../../components/_lib/native';
import { photos } from '../../assets/photos';
import { useStore } from '../../data/store';
import { useClose } from '../_shell/app';

type Slide = { bg: string; event: string; layout: 'top' | 'bottom' | 'split' | 'titleOnly'; title: string; sub?: string; date?: string; place?: string; corner?: [string, string, string, string]; shade: 'bottom' | 'top' | 'both' };
/** Слайды сторис — Figma story_1…story_5 (`184:16181`, `184:16294`, `184:16390`, `184:16478`, `184:16562`), в порядке кружков на главной. */
const SLIDES: Slide[] = [
  { bg: 'storybg-1', event: 'breath', layout: 'bottom', title: 'Музыка внутри', sub: 'Проникновенная лирика,\nяркая шоу-программа', corner: ['29/04', '20:00', 'Большой зал', 'ДК им. Кирова'], shade: 'both' },
  { bg: 'storybg-3', event: 'roofs', layout: 'bottom', title: 'Экскурсия\nпо крышам', sub: 'Романтичная прогулка с видом\nна исторический центр', shade: 'bottom' },
  { bg: 'storybg-0', event: 'weekend', layout: 'split', title: 'Выходные\nбез телефона', sub: 'Умопомрачитальная комедия', date: '29 апреля', place: 'Театр новой комедии', shade: 'both' },
  { bg: 'storybg-4', event: 'dark-date', layout: 'titleOnly', title: 'Свидание\nв темноте', shade: 'top' },
  { bg: 'storybg-2', event: 'master', layout: 'split', title: 'Мастер\nи Маргарита', sub: 'Музыкальный спектакль', date: '29 апреля', place: 'ДК им. Ленина', shade: 'both' },
];
const DURATION = 5000;
const light = { color: 'var(--color-static-white)' } as const;
const center = { textAlign: 'center' as const, whiteSpace: 'pre-line' as const, margin: 0 };

/** Один слайд: фон, затемнение и тексты. В ленте свайпа рисуются текущий и соседние. */
function SlideView({ s, animate }: { s: Slide; animate: boolean }) {
  const shade = s.shade === 'both' ? 'linear-gradient(180deg, color-mix(in srgb, var(--color-static-black) 55%, transparent) 0%, transparent 32%, transparent 58%, color-mix(in srgb, var(--color-static-black) 85%, transparent) 100%)'
    : s.shade === 'top' ? 'linear-gradient(180deg, color-mix(in srgb, var(--color-static-black) 60%, transparent) 0%, transparent 40%)' : 'linear-gradient(180deg, color-mix(in srgb, var(--color-static-black) 40%, transparent) 0%, transparent 25%, transparent 55%, color-mix(in srgb, var(--color-static-black) 85%, transparent) 100%)';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <img src={photos[s.bg]} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: shade }} />
  <div style={{ pointerEvents: 'none', animation: animate ? 'bbStoryText 500ms ease-out' : undefined }}>
    {s.corner && <div className="ds-lead" style={{ position: 'absolute', top: 150, left: 'var(--spacing-2xl)', right: 'var(--spacing-2xl)', display: 'flex', justifyContent: 'space-between', ...light }}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}><span>{s.corner[0]}</span><span>{s.corner[1]}</span></span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', textAlign: 'right' }}><span>{s.corner[2]}</span><span>{s.corner[3]}</span></span>
    </div>}
    {(s.layout === 'split' || s.layout === 'titleOnly') && <div style={{ position: 'absolute', top: 138, left: 'var(--spacing-2xl)', right: 'var(--spacing-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      <h2 className="ds-display-l" style={{ ...center, color: 'var(--color-static-white)' }}>{s.title}</h2>
      {s.sub && <p className="ds-lead" style={{ ...center, ...light }}>{s.sub}</p>}
    </div>}
    {s.layout === 'split' && <div style={{ position: 'absolute', bottom: 120, left: 'var(--spacing-2xl)', right: 'var(--spacing-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <span className="ds-display" style={{ ...center, ...light }}>{s.date}</span>
      <span className="ds-lead" style={{ ...center, ...light }}>{s.place}</span>
    </div>}
    {s.layout === 'bottom' && <div style={{ position: 'absolute', bottom: 130, left: 'var(--spacing-2xl)', right: 'var(--spacing-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <h2 className="ds-display-l" style={{ ...center, color: 'var(--color-static-white)' }}>{s.title}</h2>
      {s.sub && <p className="ds-lead" style={{ ...center, ...light }}>{s.sub}</p>}
    </div>}
  </div>

    </div>
  );
}

/** Сторис на весь экран: `/story?i=N`. Тап справа/слева — следующий/предыдущий слайд, удержание — пауза, автосмена каждые 5 с, после последнего — закрытие. «Купить билет» → событие. */
export function Story() {
  const nav = useNavigate();
  const back = useClose('/main');
  const [params] = useSearchParams();
  const [i, setI] = useState(() => Math.min(SLIDES.length - 1, Math.max(0, Number(params.get('i') ?? 0) || 0)));
  const [t, setT] = useState(0);
  const [hold, setHold] = useState(false);
  const { state, toggleFavourite, toast } = useStore();
  const s = SLIDES[i];
  const last = useRef(performance.now());
  // свайп: смещение пальца/курсора — сторис едет за ним, отпустили — листаем или возвращаем
  const swipe = useRef<{ x: number; y: number; moved: boolean; axis: 'x' | 'y' | null; t: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [swipedIn, setSwipedIn] = useState(false);
  const swiped = useRef(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });

  const go = (n: number) => { if (n < 0) { setT(0); return; } if (n >= SLIDES.length) { back(); return; } setI(n); setT(0); };
  useEffect(() => {
    let raf = 0;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = now - last.current; last.current = now;
      if (!hold) setT((v) => v + dt / DURATION);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hold, i]);
  useEffect(() => { if (t >= 1) go(i + 1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [t]);

  const liked = state.favourites.includes(s.event);
  const like = () => { const on = toggleFavourite(s.event); toast(on ? 'Добавлено в избранное' : 'Удалено из избранного', on ? 'success' : 'info'); };
  const share = async () => {
    const url = appUrl(`/event?id=${s.event}`);
    setHold(true);
    try { if (navigator.share) await navigator.share({ title: s.title.replace('\n', ' '), url }); else { await navigator.clipboard.writeText(url); toast('Ссылка скопирована', 'success'); } }
    catch (err) { if ((err as Error)?.name !== 'AbortError') toast('Не удалось поделиться', 'error'); }
    setHold(false);
  };

  return (
    <div ref={root} style={{ position: 'relative', height: 'var(--app-height, 100dvh)', overflow: 'hidden', background: 'var(--color-static-black)', userSelect: 'none',
      transform: drag.y ? `translateY(${drag.y * 0.6}px) scale(${1 - Math.min(drag.y, 300) / 3000})` : undefined, transition: drag.y || dragging ? 'none' : 'transform 250ms ease-out', borderRadius: drag.y ? 'var(--radius-2xl)' : undefined }}>
      {/* лента слайдов: текущий + соседи, едет за пальцем */}
      {[i - 1, i, i + 1].filter((n) => n >= 0 && n < SLIDES.length).map((n) => (
        <div key={SLIDES[n].bg} aria-hidden={n !== i} style={{ position: 'absolute', inset: 0, transform: `translateX(calc(${(n - i) * 100}% + ${drag.x}px))`, transition: dragging ? 'none' : 'transform 300ms cubic-bezier(.2,.8,.2,1)' }}>
          <SlideView s={SLIDES[n]} animate={n === i && !swipedIn} />
        </div>
      ))}
      {/* зоны тапа: левая треть — назад, остальное — вперёд; удержание — пауза; свайп влево/вправо — следующая/предыдущая, вниз — закрыть */}
      <div style={{ position: 'absolute', inset: '120px 0 100px', display: 'flex', touchAction: 'none' }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setHold(true); swipe.current = { x: e.clientX, y: e.clientY, moved: false, axis: null, t: performance.now() }; }}
        onPointerMove={(e) => { const sw = swipe.current; if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
          if (!sw.moved && Math.hypot(dx, dy) > 8) { sw.moved = true; sw.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'; setDragging(true); }
          if (!sw.moved) return;
          // у краёв (первая/последняя) — сопротивление
          const edge = (dx > 0 && i === 0) || (dx < 0 && i === SLIDES.length - 1);
          setDrag(sw.axis === 'x' ? { x: edge ? dx * 0.3 : dx, y: 0 } : { x: 0, y: Math.max(0, dy) }); }}
        onPointerUp={(e) => { const sw = swipe.current; swipe.current = null; setHold(false); setDragging(false);
          if (!sw?.moved) {
            setDrag({ x: 0, y: 0 });
            // тап (с захватом указателя клик не доходит до кнопок): левая треть — назад, остальное — вперёд
            if (sw && performance.now() - sw.t < 400) { const r = e.currentTarget.getBoundingClientRect(); setSwipedIn(false); go(e.clientX - r.left < r.width / 3 ? i - 1 : i + 1); }
            swiped.current = true; setTimeout(() => { swiped.current = false; }, 0);
            return;
          }
          swiped.current = true; setTimeout(() => { swiped.current = false; }, 0);
          const dx = e.clientX - sw.x, dy = e.clientY - sw.y, w = root.current?.clientWidth ?? 393;
          if (sw.axis === 'x' && Math.abs(dx) > 50) {
            const n = dx < 0 ? i + 1 : i - 1;
            if (n >= SLIDES.length) { setDrag({ x: 0, y: 0 }); back(); return; }
            if (n < 0) { setDrag({ x: 0, y: 0 }); return; }
            // новый слайд стоит там, где был под пальцем, и доезжает до центра
            setSwipedIn(true); go(n); setDragging(true); setDrag({ x: dx + (dx < 0 ? w : -w), y: 0 });
            requestAnimationFrame(() => requestAnimationFrame(() => { setDragging(false); setDrag({ x: 0, y: 0 }); }));
          } else if (sw.axis === 'y' && dy > 90) back();
          else setDrag({ x: 0, y: 0 }); }}
        onPointerCancel={() => { swipe.current = null; setHold(false); setDragging(false); setDrag({ x: 0, y: 0 }); }}
        onClickCapture={(e) => { if (swiped.current) { e.stopPropagation(); swiped.current = false; } }}>
        <button type="button" aria-label="Предыдущая сторис" onClick={(e) => { if (e.detail === 0) { setSwipedIn(false); go(i - 1); } }} style={{ flex: 1, border: 0, background: 'transparent', cursor: 'pointer' }} />
        <button type="button" aria-label="Следующая сторис" onClick={(e) => { if (e.detail === 0) { setSwipedIn(false); go(i + 1); } }} style={{ flex: 2, border: 0, background: 'transparent', cursor: 'pointer' }} />
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <StatusBar theme="Dark" />
        <ProgressBar segments={SLIDES.length} current={i} progress={Math.min(1, t)} fill="var(--color-static-white)" />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-2xl) var(--spacing-2xl) 0' }}>
          <ButtonIcon icon="x-close" label="Закрыть" onClick={back} />
          <span style={{ display: 'flex', gap: 'var(--spacing-2xl)' }}>
            <ButtonIcon icon="upload" label="Поделиться" onClick={share} />
            <ButtonIcon icon={liked ? 'heart-rounded-fill' : 'heart-rounded'} state={liked ? 'Active' : 'Default'} label="В избранное" onClick={like} />
          </span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}><Button onClick={() => nav(`/event?id=${s.event}`)}>Купить билет</Button></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 34 }}><span style={{ width: 144, height: 5, borderRadius: 'var(--radius-pill)', background: 'var(--color-static-white)' }} /></div>
      </div>
      <style>{'@keyframes bbStoryText{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}'}</style>
    </div>
  );
}
