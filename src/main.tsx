import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import './tokens/index.css';
import './screens/_shell/motion.css';
import './screens/_shell/theme.css';
import { useTheme } from './screens/_shell/theme';
import { Showcase } from './Showcase';
import { ScreensIndex } from './screens/Index';
import { screens } from './screens/registry';
import { StoreProvider } from './data/store';
import './data/reviews'; // отзывы по мероприятиям и рейтинг = средняя оценка
import './data/venues'; // площадки всех мероприятий (в общий VENUES)
import './data/persons-more'; // персоны спектаклей, концертов, лекций
import { Device } from './screens/_shell/Device';
import { BASENAME, NATIVE } from './components/_lib/native';
import { installDragScroll } from './screens/_shell/dragScroll';
import { MODAL_PATHS, ModalLayer, RouteFade, Toaster, type ModalState } from './screens/_shell/app';

const routes = screens.flatMap((s) => [{ path: s.route, el: <s.component /> }, ...(s.states ?? []).map((st) => ({ path: st.route, el: <st.component /> }))]);

/** Экраны приложения — внутри корпуса iPhone (на компьютере), с переходами и тостами.
 *  Модальные экраны (персона, площадка, активность, сторис, галерея) рисуются поверх экрана-фона — он не размонтируется и сохраняет прокрутку. */
function AppFrame() {
  const loc = useLocation();
  const bg = (loc.state as ModalState | null)?.background;
  const modal = bg && MODAL_PATHS.some((p) => loc.pathname.startsWith(p));
  const base = modal ? bg : loc;
  const { theme } = useTheme();
  // версия /app на телефоне: тема и на всей странице (фон под системными полосками, цвет строки браузера)
  useEffect(() => {
    if (!NATIVE) return;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0d0d0e' : '#ffffff');
  }, [theme]);
  return (
    <Device>
      <div data-theme={theme} style={{ position: 'relative', background: 'var(--color-background-base)', width: '100%', maxWidth: 430, height: 'var(--app-height, 100dvh)', margin: '0 auto', overflow: 'hidden' }}>
        <RouteFade location={base}>
          <Routes location={base}>
            {routes.map((r) => <Route key={r.path} path={r.path} element={r.el} />)}
            <Route path="*" element={<Navigate to="/main" replace />} />
          </Routes>
        </RouteFade>
        {modal && (
          <ModalLayer key={loc.key}>
            <Routes>{routes.filter((r) => MODAL_PATHS.includes(r.path)).map((r) => <Route key={r.path} path={r.path} element={r.el} />)}</Routes>
          </ModalLayer>
        )}
        <Toaster />
      </div>
    </Device>
  );
}

installDragScroll();

// Опубликованная версия (Vercel, GitHub Pages) — только приложение без корпуса: любой адрес вне /app/… ведёт в /app/… (главная — /app/main).
// Индекс экранов и корпус iPhone остаются в локальной разработке (npm run dev).
if (import.meta.env.PROD && !NATIVE) {
  const base = import.meta.env.BASE_URL, rest = window.location.pathname.slice(base.length).replace(/^\/+/, '');
  window.location.replace(`${base}app/${rest && rest !== 'showcase' ? rest : 'main'}${window.location.search}${window.location.hash}`);
}

if (!import.meta.env.PROD || NATIVE) createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter basename={BASENAME}>
        <Routes>
          {/* /app — версия для телефона: сразу приложение, без индекса экранов */}
          <Route path="/" element={NATIVE ? <Navigate to="/main" replace /> : <ScreensIndex />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="*" element={<AppFrame />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
