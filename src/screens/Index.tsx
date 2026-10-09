import { Link, useNavigate } from 'react-router';
import { Button, Icon } from '../components';
import { useStore } from '../data/store';
import { screens } from './registry';

/** Навигационная страница-индекс: плитки всех экранов из реестра. */
export function ScreensIndex() {
  const { resetDemo, demoMoveNearest, demoPastTicket, toast } = useStore();
  const nav = useNavigate();
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--spacing-5xl) var(--spacing-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4xl)' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <span className="ds-display">Билет Беру — экраны</span>
        <span className="ds-lead" style={{ color: 'var(--color-text-secondary)' }}>Кликабельное приложение на мок-данных: навигация, покупка билета, план дня, избранное. Данные демо хранятся в браузере.</span>
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-md)' }}>
          <Button size="Sm" style={{ width: 'auto' }} onClick={() => nav('/main')}>Открыть приложение</Button>
          <Button type="Tertiary" size="Sm" style={{ width: 'auto' }} onClick={resetDemo}>Сбросить демо-данные</Button>
          <Button type="Tertiary" size="Sm" style={{ width: 'auto' }} onClick={() => { if (!demoMoveNearest()) toast('Сначала купите билет — перенесём ближайшее событие', 'info'); nav('/tickets'); }}>Демо: организатор перенёс событие</Button>
          <Button type="Tertiary" size="Sm" style={{ width: 'auto' }} onClick={() => { demoPastTicket(); nav('/tickets?tab=past'); }}>Демо: билет на прошедшее событие</Button>
        </span>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-xl)' }}>
        {screens.map((s) => (
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)' }}>
            <Link to={s.link ?? s.route} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="ds-heading-h3">{s.name}</span><Icon name="chevron-right" /></span>
              <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{s.description}</span>
              <span className="ds-caption" style={{ color: 'var(--color-text-disabled)' }}>{s.route} · Figma {s.figma}</span>
            </Link>
            {s.states && <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>{s.states.map((st) => (
              <Link key={st.id} to={st.route} className="ds-caption" style={{ color: 'var(--color-primary-orange)', textDecoration: 'none', padding: 'var(--spacing-2xs) var(--spacing-md)', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-orange-10)' }}>{st.name}</Link>))}</span>}
          </div>
        ))}
      </div>
      <footer className="ds-body" style={{ display: 'flex', gap: 'var(--spacing-2xl)' }}>
        <Link to="/showcase" style={{ color: 'var(--color-primary-orange)' }}>Витрина ДС</Link>
        <a href="http://localhost:6006" style={{ color: 'var(--color-primary-orange)' }}>Storybook (npm run storybook)</a>
      </footer>
    </main>
  );
}
