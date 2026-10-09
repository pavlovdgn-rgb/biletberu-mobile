import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useNavigationType, type Location } from 'react-router';
import { Bar, Button, Icon, Spinner, type IconName } from '../../components';
import { useStore } from '../../data/store';

/** Вкладки таббара → маршруты. «Куда пойдём» ведёт в план, если есть билет, иначе в пустое состояние. */
export function NavBar({ active }: { active: number }) {
  const nav = useNavigate();
  const { state } = useStore();
  const { pathname } = useLocation();
  const go = (i: number) => {
    const root = [`/main`, state.tickets.length ? '/plan' : '/no-ticket', '/favourites', '/tickets'][i];
    // активная вкладка: уже в корне раздела — ничего; на вложенном экране (билет, мероприятие) — в корень, как в iOS
    if (i === active && pathname === root) return;
    // вкладки таббара переключаются мгновенно, как в iOS — без анимации появления экрана (иначе экран вместе с таббаром «прыгает»)
    nav(root, { state: { tab: true } });
  };
  return <Bar active={active} onChange={go} />;
}

/** «Назад»: по истории, а если пришли по прямой ссылке — на запасной экран. */
export function useBack(fallback = '/main') {
  const nav = useNavigate();
  const loc = useLocation();
  return () => (loc.key !== 'default' && window.history.length > 1 ? nav(-1) : nav(fallback, { replace: true }));
}

/** Тосты поверх экрана (над таббаром). */
export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div aria-live="polite" style={{ position: 'absolute', left: 0, right: 0, top: 58, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', padding: '0 var(--spacing-2xl)', pointerEvents: 'none' }}>
      {toasts.map((t) => (
        <div key={t.id} role="status" className="ds-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', maxWidth: '100%', padding: 'var(--spacing-xl) var(--spacing-2xl)', borderRadius: 'var(--radius-lg)',
          background: t.kind === 'error' ? 'var(--color-system-error)' : 'var(--color-background-inverse)', color: 'var(--color-static-white)', boxShadow: 'var(--shadow-md)', animation: 'bbToast 220ms var(--motion-ease)' }}>
          <Icon name={t.kind === 'success' ? 'Essentials/check' : 'info-circle'} size={20} />
          <span>{t.text}</span>
          {t.action && <button type="button" className="ds-note" onClick={() => { t.action!.onClick(); dismissToast(t.id); }}
            style={{ pointerEvents: 'auto', marginLeft: 'var(--spacing-md)', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-primary-orange)', whiteSpace: 'nowrap' }}>{t.action.label}</button>}
        </div>
      ))}
    </div>
  );
}

/** Загрузка экрана. */
export const Loading = ({ label = 'Загружаем…' }: { label?: string }) => (
  <div style={{ flex: 1, minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
    <Spinner size={24} /><span className="ds-body">{label}</span>
  </div>
);

/** Пусто / ничего не найдено / ошибка — одна раскладка. */
export function EmptyState({ icon = 'search', title, text, action, onAction, tone = 'neutral' }: { icon?: IconName; title: string; text?: ReactNode; action?: string; onAction?: () => void; tone?: 'neutral' | 'error' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-5xl) var(--spacing-2xl)', textAlign: 'center' }}>
      <span style={{ display: 'inline-flex', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-pill)', background: tone === 'error' ? 'color-mix(in srgb, var(--color-system-error) 10%, transparent)' : 'var(--color-background-base)', color: tone === 'error' ? 'var(--color-system-error)' : 'var(--color-text-secondary)' }}>
        <Icon name={icon} size={24} />
      </span>
      <span className="ds-heading-h3">{title}</span>
      {text && <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{text}</span>}
      {action && <Button size="Sm" style={{ width: 'auto' }} onClick={onAction}>{action}</Button>}
    </div>
  );
}

/** Имитация первой загрузки данных экрана (один раз за сессию на ключ). */
const loaded = new Set<string>();
export function useFirstLoad(key: string, ms = 500) {
  const [ready, setReady] = useState(loaded.has(key));
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => { loaded.add(key); setReady(true); }, ms);
    return () => clearTimeout(t);
  }, [key, ms, ready]);
  return ready;
}

/** Экраны-модалки (персона, площадка, активность, сторис, галерея) открываются поверх текущего экрана: он остаётся смонтированным — с той же прокруткой. */
export const MODAL_PATHS = ['/person', '/venue', '/activity', '/story', '/gallery'];
export type ModalState = { background?: Location };
/** Открыть экран: модальные — поверх текущего (фон запоминается в state), остальные — обычный переход. */
export function useOpen() {
  const nav = useNavigate();
  const loc = useLocation();
  return (to: string, opts?: { replace?: boolean }) => {
    const modal = MODAL_PATHS.some((p) => to.startsWith(p));
    const bg = (loc.state as ModalState | null)?.background ?? loc;
    nav(to, { replace: opts?.replace, state: modal ? { background: bg } : undefined });
  };
}
const ModalCtx = createContext<(() => void) | null>(null);
/** Закрыть модалку (анимация «вниз» и возврат к экрану под ней) или, если экран открыт по прямой ссылке, — «назад». */
export function useClose(fallback = '/main') { const ctx = useContext(ModalCtx); const back = useBack(fallback); return ctx ?? back; }
/** Слой модалки: выезжает снизу (320 мс), при закрытии уезжает вниз (260 мс). */
export function ModalLayer({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const [closing, setClosing] = useState(false);
  const close = () => { if (closing) return; setClosing(true); setTimeout(() => nav(-1), 250); };
  return (
    <ModalCtx.Provider value={close}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, animation: closing ? 'bbModalOut 260ms cubic-bezier(.4,0,1,1) forwards' : 'bbModalIn 320ms cubic-bezier(.2,.8,.2,1)' }}>{children}</div>
      <style>{'@keyframes bbModalIn{from{transform:translateY(100%)}to{transform:none}}@keyframes bbModalOut{from{transform:none}to{transform:translateY(100%)}}'}</style>
    </ModalCtx.Provider>
  );
}

/** Запоминание прокрутки экрана по записи истории: «назад» возвращает на то же место. */
const scrolls = new Map<string, number>();
export function useScrollMemory() {
  const loc = useLocation();
  const key = loc.key;
  return {
    save: (top: number) => scrolls.set(key, top),
    restore: (el: HTMLElement | null) => {
      const top = scrolls.get(key); if (!el || !top) return;
      const tryIt = (n: number) => { el.scrollTop = top; if (Math.abs(el.scrollTop - top) > 2 && n < 10) setTimeout(() => tryIt(n + 1), 60); };
      tryIt(0);
    },
  };
}

/** Плавное появление экрана при переходе вперёд (200 мс); «назад» и переключение вкладок таббара — без анимации. */
export function RouteFade({ children, location }: { children: ReactNode; location?: Location }) {
  const cur = useLocation();
  const loc = location ?? cur;
  const type = useNavigationType();
  // смена параметров на том же экране с replace (вкладки, сортировка) — тот же экран: не пересоздаём и не анимируем
  const prev = useRef<{ path: string; key: string } | null>(null);
  const same = type === 'REPLACE' && prev.current?.path === loc.pathname;
  const key = same ? prev.current!.key : loc.key;
  useEffect(() => { prev.current = { path: loc.pathname, key }; });
  return (
    <div key={key} style={{ height: '100%', animation: type === 'POP' || same || (loc.state as { tab?: boolean } | null)?.tab ? undefined : 'bbScreenIn 200ms var(--motion-ease)' }}>
      {children}
      <style>{'@keyframes bbScreenIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes bbToast{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion: reduce){*{animation-duration:1ms!important}}'}</style>
    </div>
  );
}
