import { useLocation, useNavigate } from 'react-router';
import { Button, HomeIndicator, Icon, Image, StatusBar, TitlePage } from '../../components';
import { photos } from '../../assets/photos';
import { MAIN_EVENT_ID, SERVICE_FEE, eventGeo, placesNear, rub, ruDate } from '../../data/mock';
import { planPlaces, ticketEvent, useStore } from '../../data/store';

/** Done — оплата прошла успешно (Figma `180:16409`). Итог — из только что оплаченного заказа (или последнего в «Моих билетах»). */
export function Done() {
  const nav = useNavigate();
  const loc = useLocation();
  const { state } = useStore();
  const last = state.tickets.filter((t) => t.orderId === state.tickets[0]?.orderId);
  const paid = (loc.state as { count?: number; total?: number } | null) ?? { count: last.length, total: last.reduce((a, t) => a + t.price + SERVICE_FEE, 0) };
  // предложение спланировать день — внутри экрана, не шторкой (Figma: Done — plan prompt `444:42326`); план уже есть (перенесён из «без билета») — плашка
  const ev = last[0] && ticketEvent(last[0]);
  const inPlan = ev ? planPlaces(state.plans[ev.dateISO]).length : 0;
  const geo = ev && eventGeo(ev.id);
  const near = geo ? placesNear(geo, ev!.id === MAIN_EVENT_ID).sort((a, b) => a.meters - b.meters).slice(0, 3) : [];
  const prompt = !!ev && inPlan === 0 && state.planPromptEnabled && near.length > 0;
  return (
    <div style={{ width: '100%', maxWidth: 430, height: 'var(--app-height, 100dvh)', overflowY: 'auto', margin: '0 auto', display: 'flex', flexDirection: 'column', background: 'var(--color-background-base)' }}>
      <StatusBar /><TitlePage title="Оплата заказа" onLeft={() => nav('/main')} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--spacing-5xl)', marginTop: 'var(--spacing-xl)', padding: `${prompt || inPlan ? 'var(--spacing-5xl)' : '96px'} var(--spacing-2xl) var(--spacing-5xl)`, background: 'var(--color-base-white)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-5xl)', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', borderRadius: 'var(--radius-pill)', background: 'var(--color-base-white)', boxShadow: '0 0 60px 30px color-mix(in srgb, var(--illustration-success-check) 12%, transparent)' }}><svg width="104" height="104" viewBox="0 0 104 104" aria-hidden fill="var(--illustration-success-check)">
              <path d="M45.2 20.7C52.1 19.2 59.3 20.1 65.6 23C66.6 23.5 67.1 24.7 66.6 25.7C66.1 26.8 64.9 27.2 63.9 26.7C58.4 24.1 52.1 23.4 46.1 24.7C40.1 26 34.7 29.2 30.7 33.9C26.7 38.6 24.4 44.4 24.1 50.6C23.8 56.7 25.5 62.8 29 67.8C32.4 72.9 37.5 76.7 43.3 78.6C49.1 80.5 55.4 80.4 61.2 78.4C67 76.4 72 72.5 75.4 67.3C78.7 62.2 80.3 56.1 79.9 50C79.8 48.9 80.6 47.9 81.8 47.8C82.9 47.7 83.8 48.6 83.9 49.7C84.4 56.7 82.6 63.7 78.7 69.6C74.9 75.4 69.2 79.9 62.6 82.2C55.9 84.5 48.7 84.6 42 82.4C35.4 80.2 29.6 75.9 25.6 70.1C21.6 64.3 19.7 57.4 20 50.3C20.4 43.3 23.1 36.6 27.6 31.3C32.2 25.9 38.4 22.2 45.2 20.7Z" />
              <path d="M74.2 34.4C75 33.6 76.4 33.6 77.2 34.4C78 35.2 78 36.4 77.2 37.2L53.9 59.5C53 60.3 51.7 60.3 50.9 59.5L41 50.1C40.2 49.3 40.2 48 41 47.2C41.8 46.4 43.2 46.4 44 47.2L52.4 55.2L74.2 34.4Z" />
            </svg></span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
              <span className="ds-heading-h1">Оплата прошла успешно!</span>
              <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Ваши билеты готовы к использованию</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            <div style={{ padding: 'var(--spacing-4xl) var(--spacing-2xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-background-base)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--spacing-2xl)', borderBottom: '1px solid var(--color-background-disabled)' }}><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Количество билетов</span><span className="ds-subtitle">{paid.count}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--spacing-2xl)' }}><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Сумма оплаты</span><span className="ds-subtitle">{rub(paid.total ?? 0)}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-sm)' }}>
              <Icon name="info-circle" size={20} />
              <span className="ds-body">Билеты сохранены в приложении, вы можете увидеть их разделе «Билеты»</span>
            </div>
            {/* 15.10: главное действие экрана покупки — доступ к билету; план дня — вторым слоем ниже */}
            <Button content="Icon" onClick={() => {
              // экран успеха заменяем списком «Мои билеты», поверх — билеты купленного события: «назад» с билета ведёт в список, а не к оплате
              nav('/tickets', { replace: true, state: { tab: true } });
              if (last[0]) nav(`/ticket?event=${last[0].eventId}`);
            }}>Посмотреть билеты</Button>
          </div>
          {ev && inPlan > 0 && (
            <button type="button" onClick={() => nav(`/plan?date=${ev.dateISO}`, { replace: true, state: { tab: true } })} style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start', padding: 'var(--spacing-xl) var(--spacing-2xl)', border: 0, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-violet-10)', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
              <Icon name="route" size={20} style={{ color: 'var(--color-accent-violet)' }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <span className="ds-body">{inPlan} {inPlan === 1 ? 'место уже в плане' : inPlan < 5 ? 'места уже в плане' : 'мест уже в плане'} на {ruDate(ev.dateISO)}</span>
                <span className="ds-note" style={{ color: 'var(--color-accent-violet)' }}>Открыть план дня</span>
              </span>
            </button>
          )}
          {prompt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-background-base)' }}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <span className="ds-heading-h3">Спланируем {ruDate(ev!.dateISO)}?</span>
                <span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>Кафе и прогулки рядом — до и после события</span>
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                {near.map((p) => (
                  <span key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', minWidth: 0 }}>
                    <Image size="sm" src={photos[p.image]} style={{ width: '100%', height: 80 }} />
                    <span className="ds-caption" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <span className="ds-caption" style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.time}</span>
                  </span>
                ))}
              </div>
              <Button type="Tertiary" onClick={() => nav(`/plan?date=${ev!.dateISO}`, { replace: true, state: { tab: true } })}>Спланировать день</Button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4xl)' }}>
          <button type="button" className="ds-note" onClick={() => nav('/main', { replace: true })} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Вернуться на главную</button>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}
