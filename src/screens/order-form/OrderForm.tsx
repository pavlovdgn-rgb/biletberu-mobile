import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AgeBadge, Button, HomeIndicator, Icon, Inputs, StatusBar, TitlePage } from '../../components';
import { MAIN_EVENT_ID, eventById, rub, ticketsWord, weekday, type EventItem } from '../../data/mock';
import { cartTotals, useStore, type Buyer, cartEvent } from '../../data/store';
import { NavBar, useBack } from '../_shell/app';
import { Screen } from '../_shell/Screen';

const FIELDS: Array<[keyof Buyer, string]> = [['surname', 'Фамилия'], ['name', 'Имя'], ['birth', 'Дата рождения'], ['email', 'E-mail']];
const FILLED: Buyer = { surname: 'Константинов', name: 'Александр', birth: '12.10.1992', email: 'konstantinov@mail.ru' };
const DEMO_SEATS = [{ id: '16-16', row: 16, place: 16, category: 4 }, { id: '16-17', row: 16, place: 17, category: 4 }];
const card = { background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' } as const;
const NAME_RE = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё' -]*$/;

/** Бейдж «25 апреля, сб. 18:00» — выходной день красным. */
export const WhenBadge = ({ e }: { e: EventItem }) => { const w = weekday(e.dateISO); return <AgeBadge size="lg">{e.date},&nbsp;<span style={w.weekend ? { color: 'var(--color-system-error)' } : undefined}>{w.wd}.</span>&nbsp;{e.time}</AgeBadge>; };
/** «12101992» → «12.10.1992». */
const maskDate = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 8); return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('.'); };
const age = (birth: Date, on = new Date(2026, 3, 23)) => on.getFullYear() - birth.getFullYear() - (on < new Date(on.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);

export function validate(k: keyof Buyer, v: string, e?: EventItem): string | null {
  const t = v.trim();
  if (!t) return 'Заполните поле';
  if (k === 'surname' || k === 'name') return t.length > 40 ? 'Не длиннее 40 символов' : NAME_RE.test(t) ? null : 'Только буквы, дефис и пробел';
  if (k === 'birth') {
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(t); if (!m) return 'Формат дд.мм.гггг';
    const [d, mo, y] = [+m[1], +m[2], +m[3]]; const dt = new Date(y, mo - 1, d);
    if (dt.getDate() !== d || dt.getMonth() !== mo - 1 || y < 1900) return 'Такой даты нет';
    if (dt > new Date(2026, 3, 23)) return 'Дата из будущего';
    const min = parseInt(e?.age ?? '0', 10);
    if (min && age(dt) < min) return `Мероприятие ${e!.age} — покупателю должно быть ${min} лет`;
    return null;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) ? (t.length > 80 ? 'Слишком длинный адрес' : null) : 'Проверьте e-mail: пример name@mail.ru';
}

/** placing an order_form (Figma `179:17059`); state="filled" — placing an order_form-field (`179:17345`).
 *  Данные покупателя с проверкой (буквы, дата и возраст для 18+, e-mail); «Далее» активна, когда всё заполнено; итог — из корзины. */
export function OrderForm({ state }: { state?: 'filled' }) {
  const nav = useNavigate();
  const back = useBack('/seats');
  const store = useStore();
  const cart = store.state.cart;
  useEffect(() => { if (!cart || cart.seats.length === 0) store.setSeats(MAIN_EVENT_ID, DEMO_SEATS); }, [cart, store]);
  const e = cartEvent(cart) ?? eventById(MAIN_EVENT_ID)!;
  const seats = cart?.seats.length ? cart.seats : DEMO_SEATS;
  const totals = cartTotals(seats);
  const [form, setForm] = useState<Buyer>(state === 'filled' ? FILLED : store.state.buyer);
  const [touched, setTouched] = useState<Partial<Record<keyof Buyer, boolean>>>({});
  const [open, setOpen] = useState(false);
  const errors = Object.fromEntries(FIELDS.map(([k]) => [k, validate(k, form[k], e)])) as Record<keyof Buyer, string | null>;
  const allFilled = FIELDS.every(([k]) => form[k].trim());
  const next = () => {
    setTouched({ surname: true, name: true, birth: true, email: true });
    if (FIELDS.some(([k]) => errors[k])) { store.toast('Проверьте данные покупателя', 'error'); return; }
    store.saveBuyer({ ...form, surname: form.surname.trim(), name: form.name.trim(), email: form.email.trim() });
    nav('/payment');
  };

  return (
    <Screen
      header={<div className="bb-surface-head"><StatusBar /><TitlePage title="Оформление заказа" rounded onLeft={back} /></div>}
      footer={<div style={{ background: 'var(--color-base-white)', borderTop: '1px solid var(--color-background-disabled)', paddingTop: 'var(--spacing-xl)' }}>
        {open && <div className="ds-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', padding: '0 var(--spacing-2xl) var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>{ticketsWord(seats.length)}</span><span>{rub(totals.tickets)}</span></span>
          <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Сервисный сбор</span><span>{rub(totals.fee)}</span></span>
        </div>}
        <button type="button" className="ds-body" aria-expanded={open} onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)', width: '100%', border: 0, padding: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
          Итоговая стоимость {rub(totals.total)} <Icon name={open ? 'chevron-up' : 'chevron-down'} size={24} />
        </button>
        <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}><Button state={allFilled ? 'Default' : 'Disabled'} disabled={!allFilled} onClick={next}>Далее</Button></div>
        <NavBar active={0} /><HomeIndicator />
      </div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)' }}>
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl)' }}>
          <span className="ds-heading-h3">{e.title}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Icon name="marker-pin-small" size={16} /><span className="ds-body">{e.place}</span></span>
            <span className="ds-body" style={{ paddingLeft: 'var(--spacing-4xl)', color: 'var(--color-text-secondary)' }}>{e.address}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xl)' }}>
            <AgeBadge size="lg">{e.age}</AgeBadge>
            <WhenBadge e={e} />
          </div>
        </section>
        <form noValidate onSubmit={(ev) => { ev.preventDefault(); if (allFilled) next(); }} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl) var(--spacing-2xl) var(--spacing-3xl)' }}>
          <TitlePage version="Secondary" title={<span className="ds-heading-h3">Введите данные покупателя</span>} textButtonLabel="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {FIELDS.map(([k, label]) => {
              const err = touched[k] ? errors[k] : null;
              return <Inputs key={k} state={err ? 'Error' : state === 'filled' ? 'DefaultFilled' : 'Default'} message={err ?? undefined} label={label} value={form[k]}
                inputMode={k === 'birth' ? 'numeric' : k === 'email' ? 'email' : 'text'} autoComplete={k === 'surname' ? 'family-name' : k === 'name' ? 'given-name' : k === 'birth' ? 'bday' : 'email'}
                maxLength={k === 'birth' ? 10 : k === 'email' ? 80 : 41} placeholder={k === 'birth' ? 'дд.мм.гггг' : undefined}
                onChange={(ev) => setForm({ ...form, [k]: k === 'birth' ? maskDate(ev.target.value) : ev.target.value })}
                onBlur={() => setTouched({ ...touched, [k]: true })} />;
            })}
          </div>
          <button type="submit" hidden />
        </form>
      </div>
    </Screen>
  );
}
export function OrderFormFilled() { return <OrderForm state="filled" />; }
