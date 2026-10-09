import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AgeBadge, Button, HomeIndicator, Icon, PaymentMethod, Radio, StatusBar, TitlePage } from '../../components';
import { BONUS_POINTS, CERTIFICATES, MAIN_EVENT_ID, PROMO_CODES, rub, ticketsWord } from '../../data/mock';
import { cartTotals, useStore, type PayMethod, cartEvent } from '../../data/store';
import sbpLogo from '../../assets/sbp.png';
import { WhenBadge } from '../order-form/OrderForm';
import { EmptyState, NavBar, useBack } from '../_shell/app';
import { Screen } from '../_shell/Screen';

const card = { background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--spacing-xl)' };
const Line = ({ l, r, strong, accent }: { l: string; r: string; strong?: boolean; accent?: boolean }) => (
  <div className={strong ? 'ds-heading-h3' : 'ds-body'} style={{ display: 'flex', justifyContent: 'space-between', color: strong ? 'var(--color-text-primary)' : accent ? 'var(--color-system-success)' : 'var(--color-text-secondary)' }}><span>{l}</span><span>{r}</span></div>
);
const PayRow = ({ active, label, icon, onClick }: { active?: boolean; label: string; icon: ReactNode; onClick: () => void }) => (
  <div role="radio" aria-checked={active} tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onClick(); }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', minHeight: 32, cursor: 'pointer' }}>
    <Radio state={active ? 'Active' : 'Default'} label={label} /><span className="ds-note" style={{ flex: 1 }}>{label}</span>{icon}
  </div>
);

/** Поле кода (промокод / сертификат): строка как в макете раскрывается в поле ввода внутри той же рамки, «Применить» — текстовая кнопка справа. */
function CodeField({ label, placeholder, applied, onApply, onRemove }: { label: string; placeholder: string; applied: string | null; onApply: (code: string) => string | null; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const row = (border: string, children: ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', minHeight: 56, padding: '0 var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', border: `1px solid ${border}` }}>{children}</div>
  );
  const textBtn = (text: string, onClick: () => void, disabled = false, tone = 'var(--color-primary-orange)') => (
    <button type="button" className="ds-note" disabled={disabled} onClick={onClick} style={{ flexShrink: 0, border: 0, padding: 0, background: 'transparent', cursor: disabled ? 'default' : 'pointer', color: disabled ? 'var(--color-text-disabled)' : tone }}>{text}</button>
  );
  if (applied) return row('var(--color-system-success)', <>
    <Icon name="Essentials/check" size={20} style={{ color: 'var(--color-system-success)' }} />
    <span className="ds-note" style={{ flex: 1 }}>{applied}</span>
    {textBtn('Убрать', onRemove, false, 'var(--color-text-secondary)')}
  </>);
  if (!open) return <PaymentMethod label={label} onClick={() => setOpen(true)} />;
  const apply = () => { const e = onApply(code.trim().toUpperCase()); setErr(e); if (!e) { setOpen(false); setCode(''); } };
  const close = () => { setOpen(false); setCode(''); setErr(null); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
      {row(err ? 'var(--color-system-error)' : 'var(--color-primary-orange)', <>
        <input className="ds-note" aria-label={placeholder} aria-invalid={!!err} placeholder={placeholder} value={code} maxLength={20} autoFocus autoCapitalize="characters"
          onChange={(e) => { setCode(e.target.value); setErr(null); }} onKeyDown={(e) => { if (e.key === 'Enter' && code.trim()) apply(); if (e.key === 'Escape') close(); }}
          style={{ flex: 1, minWidth: 0, border: 0, outline: 0, padding: 0, background: 'transparent', color: 'var(--color-text-primary)', textTransform: 'uppercase' }} />
        {code ? textBtn('Применить', apply) : <button type="button" aria-label="Закрыть" onClick={close} style={{ display: 'inline-flex', border: 0, padding: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><Icon name="x-close" size={20} /></button>}
      </>)}
      {err && <span className="ds-caption" style={{ paddingLeft: 'var(--spacing-2xl)', color: 'var(--color-system-error)' }}>{err}</span>}
    </div>
  );
}

/** order — выбор способа оплаты (Figma `179:17646`). СБП/карта, промокод, сертификат, баллы; «К оплате» — загрузка, успех → «Оплата прошла», отказ банка — ошибка. */
export function Payment() {
  const nav = useNavigate();
  const back = useBack('/order-form');
  const store = useStore();
  const cart = store.state.cart;
  const [params] = useSearchParams();
  const demo = params.has('demo');
  useEffect(() => { if (demo && !cart?.seats.length) store.setSeats(MAIN_EVENT_ID, [{ id: '16-16', row: 16, place: 16, category: 4 }, { id: '16-17', row: 16, place: 17, category: 4 }]); }, [demo, cart, store]);
  const [method, setMethod] = useState<PayMethod>('sbp');
  const [promo, setPromo] = useState<string | null>(null);
  const [cert, setCert] = useState<string | null>(null);
  const [bonus, setBonus] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const e = cartEvent(cart);

  const header = <div className="bb-surface-head"><StatusBar /><TitlePage title="Оформление заказа" rounded onLeft={back} /></div>;
  if (!cart || !cart.seats.length || !e) return (
    <Screen header={header} footer={<div><NavBar active={0} /><HomeIndicator /></div>}>
      <div style={{ ...card, marginTop: 'var(--spacing-xl)' }}><EmptyState icon="ticket" title="Корзина пуста" text="Выберите мероприятие и места, чтобы перейти к оплате" action="Выбрать мероприятие" onAction={() => nav('/main')} /></div>
    </Screen>
  );

  const t = cartTotals(cart.seats);
  const promoOff = promo ? Math.round(t.tickets * PROMO_CODES[promo]) : 0;
  const bonusOff = bonus ? BONUS_POINTS : 0;
  const certOff = cert ? Math.min(CERTIFICATES[cert], t.total - promoOff - bonusOff) : 0;
  const total = Math.max(0, t.total - promoOff - bonusOff - certOff);

  const pay = async () => {
    if (busy) return;
    if (!navigator.onLine) { setError('Нет соединения с интернетом. Проверьте сеть и попробуйте снова'); return; }
    setBusy(true); setError(null);
    const r = await store.pay(total === 0 ? 'sbp' : method, total);
    setBusy(false);
    if (r.ok) nav('/done', { replace: true, state: { count: r.count, total } });
    else { setError(r.error); store.toast(r.error, 'error'); }
  };

  return (
    <Screen header={header}
      footer={<div style={{ background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)', paddingTop: 'var(--spacing-xl)' }}>
        <div className="ds-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)' }}>Итоговая стоимость {rub(total)} <Icon name="chevron-down" size={24} /></div>
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}><Button content={busy ? 'Loader' : 'None'} disabled={busy} aria-busy={busy} onClick={pay}>{busy ? 'Оплачиваем…' : total === 0 ? 'Оформить бесплатно' : 'К оплате'}</Button></div>
        <NavBar active={0} /><HomeIndicator />
      </div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0' }}>
        <section style={{ ...card, padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h3">{e.title}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="marker-pin-small" size={16} /><span className="ds-body">{e.place}</span></span>
            <span className="ds-body" style={{ paddingLeft: 'var(--spacing-4xl)', color: 'var(--color-text-secondary)' }}>{e.address}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xl)' }}><AgeBadge size="lg">{e.age}</AgeBadge><WhenBadge e={e} /></div>
        </section>
        <section style={{ ...card, padding: 'var(--spacing-2xl) var(--spacing-2xl) var(--spacing-3xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', paddingBottom: 'var(--spacing-xl)' }}>
            <div style={{ margin: '0 calc(-1 * var(--spacing-2xl))' }}><TitlePage version="Secondary" title={<span className="ds-heading-h3">Способ оплаты</span>} textButtonLabel="" /></div>
            <div role="radiogroup" aria-label="Способ оплаты" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <PayRow active={method === 'sbp'} onClick={() => { setMethod('sbp'); setError(null); }} label="СБП (Оплата по QR-коду)" icon={<img src={sbpLogo} alt="СБП" width={21} height={32} style={{ display: 'block' }} />} />
              <PayRow active={method === 'card'} onClick={() => { setMethod('card'); setError(null); }} label="Банковская карта" icon={<Icon name="credit-card" size={24} />} />
            </div>
          </div>
          <CodeField label="Применить промокод" placeholder="Промокод" applied={promo} onRemove={() => setPromo(null)}
            onApply={(c) => (!c ? 'Введите промокод' : PROMO_CODES[c] ? (setPromo(c), store.toast(`Промокод применён: −${Math.round(PROMO_CODES[c] * 100)}%`, 'success'), null) : 'Промокод не найден или истёк')} />
          <CodeField label="Использовать сертификат" placeholder="Номер сертификата" applied={cert} onRemove={() => setCert(null)}
            onApply={(c) => (!c ? 'Введите номер' : CERTIFICATES[c] ? (setCert(c), null) : 'Сертификат не найден')} />
          <PaymentMethod type="Bonus" label="Бонусные баллы" points={String(BONUS_POINTS)} description="можно списать" active={bonus} onToggle={setBonus} />
          {error && <div role="alert" className="ds-body" style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl) var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', background: 'color-mix(in srgb, var(--color-system-error) 10%, transparent)', color: 'var(--color-system-error)' }}><Icon name="info-circle" size={20} />{error}</div>}
        </section>
        <section style={{ ...card, padding: 'var(--spacing-4xl) var(--spacing-2xl) var(--spacing-3xl)' }}>
          <span className="ds-heading-h3">Билеты</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', paddingBottom: 'var(--spacing-2xl)', borderBottom: '1px solid var(--color-background-disabled)' }}>
            <Line l={ticketsWord(cart.seats.length)} r={rub(t.tickets)} /><Line l="Сервисный сбор" r={rub(t.fee)} />
            {promoOff > 0 && <Line accent l={`Промокод ${promo}`} r={`−${rub(promoOff)}`} />}
            {bonusOff > 0 && <Line accent l="Бонусные баллы" r={`−${rub(bonusOff)}`} />}
            {certOff > 0 && <Line accent l="Сертификат" r={`−${rub(certOff)}`} />}
          </div>
          <Line l="Итого" r={rub(total)} strong />
        </section>
      </div>
    </Screen>
  );
}
