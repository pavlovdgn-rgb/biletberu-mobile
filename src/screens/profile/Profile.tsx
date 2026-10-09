import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Avatar, Button, ButtonIcon, ButtonTag, HomeIndicator, Icon, Inputs, Radio, SettingsRow, StatusBar, Tabs, TitlePage } from '../../components';
import { photos } from '../../assets/photos';
import { PROMO_CODES, rub } from '../../data/mock';
import { INTERESTS, useStore, type ThemeChoice } from '../../data/store';
import { NavBar, useBack } from '../_shell/app';
import { BottomSheet } from '../_shell/BottomSheet';
import { Screen } from '../_shell/Screen';

const plural = (n: number, one: string, few: string, many: string) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many; };
const Card = ({ children, pad = 'var(--spacing-xs) 0' }: { children: ReactNode; pad?: string }) => (
  <section style={{ margin: '0 var(--spacing-2xl)', padding: pad, borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)' }}>{children}</section>
);
const BUDGETS: Array<number | null> = [1000, 3000, 5000, 10000, null];
const WALKS: Array<number | null> = [500, 1000, 2000, null];
const budgetLabel = (v: number | null) => (v === null ? 'без ограничений' : `до ${rub(v)}`);
const walkLabel = (v: number | null) => (v === null ? 'без ограничений' : v < 1000 ? `до ${v} м` : `до ${v / 1000} км`);

/** Шторка выбора значения (бюджет, расстояние): радио-список + «Готово». */
function OptionSheet<T>({ title, hint, options, value, label, onApply, onClose }: { title: string; hint: string; options: T[]; value: T; label: (v: T) => string; onApply: (v: T) => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  return (
    <BottomSheet label={title} style={{ padding: 'var(--spacing-sm) var(--spacing-2xl) var(--spacing-5xl)' }} onClose={onClose}>{(close) => (<>
      <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', padding: 'var(--spacing-2xl) 0 var(--spacing-md)' }}>
        <span className="ds-heading-h2">{title}</span>
        <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{hint}</span>
      </div>
      <div role="radiogroup" aria-label={title}>
        {options.map((o) => (
          <div key={String(o)} role="presentation" onClick={() => setSel(o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-xl) 0', cursor: 'pointer' }}>
            <span className="ds-subtitle">{label(o)}</span><Radio state={sel === o ? 'Active' : 'Default'} label={label(o)} onClick={() => setSel(o)} />
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 'var(--spacing-xl)' }}><Button onClick={() => close(() => { onApply(sel); onClose(); })}>Готово</Button></div>
    </>)}</BottomSheet>
  );
}

const THEMES: Array<[ThemeChoice, string, string]> = [
  ['system', 'Системная', 'Тема меняется вместе с настройкой телефона'],
  ['light', 'Светлая', 'Светлая всегда, независимо от настройки телефона'],
  ['dark', 'Тёмная', 'Тёмная всегда, независимо от настройки телефона'],
];
/** Оформление — тема приложения (Figma: Sandbox, «Тема оформления — переключатель в профиле», вариант Б `420:23140`):
 *  три сегмента, выбор применяется сразу. */
function Appearance() {
  const { state, updateProfile } = useStore();
  const cur = THEMES.findIndex(([v]) => v === (state.profile.theme ?? 'system'));
  return (
    <Card pad="var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl)">
      <div className="ds-heading-h3" style={{ padding: 'var(--spacing-md) 0 var(--spacing-xl)' }}>Оформление</div>
      <Tabs tabs={THEMES.map(([, l]) => l)} active={cur} onChange={(i) => updateProfile({ theme: THEMES[i][0] })} />
      <p className="ds-caption" style={{ margin: 'var(--spacing-md) 0 0', color: 'var(--color-text-secondary)' }}>{THEMES[cur][2]}</p>
    </Card>
  );
}

/** Диалог подтверждения (Figma: Profile — logout `278:16872`): затемнение, белая карточка, Primary + Tertiary. */
function Confirm({ title, text, action, onConfirm, onClose }: { title: string; text: string; action: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="bb-dim" role="dialog" aria-label={title} onClick={onClose} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-2xl)', background: 'color-mix(in srgb, var(--color-static-black) 60%, transparent)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl) var(--spacing-2xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-base-white)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
        <span className="ds-heading-h2">{title}</span>
        <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{text}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-md)' }}>
          <Button onClick={onConfirm}>{action}</Button>
          <Button type="Tertiary" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    </div>
  );
}

/** Profile — профиль, вариант «Персональный» (Figma `277:16501`): статистика, интересы, настройки плана дня, покупки, поддержка, выход.
 *  Без входа — Profile — guest (`277:16552`). Вход — аватар на главной. */
export function Profile() {
  const nav = useNavigate();
  const back = useBack('/main');
  const { state, toast, updateProfile, setPlanPromptEnabled } = useStore();
  const { profile: p } = state;
  const [editInterests, setEditInterests] = useState(false);
  const [sheet, setSheet] = useState<'budget' | 'walk' | null>(null);
  const [logout, setLogout] = useState(false);
  const plans = Object.values(state.plans).filter((ids) => ids.length > 0).length;
  const toggleInterest = (t: string) => updateProfile({ interests: p.interests.includes(t) ? p.interests.filter((x) => x !== t) : [...p.interests, t] });

  const header = <div className="bb-surface-head" style={{ background: 'var(--color-base-white)' }}><StatusBar /><TitlePage title="Профиль" iconLeft="Yes" onLeft={back}
    iconRight={p.loggedIn ? 'Yes' : 'No'} iconRightName="settings" onRight={() => nav('/profile/data')} /></div>;
  const footer = <div><NavBar active={0} /><HomeIndicator /></div>;

  if (!p.loggedIn) return (
    <Screen header={header} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0 var(--spacing-4xl)' }}>
        <Card pad="var(--spacing-4xl) var(--spacing-2xl) var(--spacing-2xl)">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-pill)', background: 'var(--color-primary-orange-10)', color: 'var(--color-primary-orange)' }}><Icon name="user" size={24} /></span>
            <span className="ds-heading-h2">Войдите в профиль</span>
            <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Билеты, избранное и планы дня сохранятся и будут доступны на любом устройстве</span>
            <div style={{ width: '100%', paddingTop: 'var(--spacing-md)' }}><Button onClick={() => { updateProfile({ loggedIn: true }); toast('Вы вошли в профиль', 'success'); }}>Войти по номеру телефона</Button></div>
          </div>
        </Card>
        <Appearance />
        <Card>
          <SettingsRow type="Value" icon="marker-pin" label="Город" value={p.user.city} onClick={() => toast('Пока доступен только Санкт-Петербург')} />
          <SettingsRow icon="message-chat" label="Поддержка" onClick={() => toast('Поддержка: support@biletberu.ru')} />
          <SettingsRow icon="info-circle" label="О приложении" onClick={() => toast('Билет Беру · демо-версия')} />
        </Card>
      </div>
    </Screen>
  );

  return (
    <Screen header={header} footer={footer}
      overlay={(sheet === 'budget' && <OptionSheet title="Бюджет на активности" hint="Сколько готовы потратить на одно место в плане дня" options={BUDGETS} value={p.budget} label={budgetLabel} onApply={(v) => updateProfile({ budget: v })} onClose={() => setSheet(null)} />)
        || (sheet === 'walk' && <OptionSheet title="Пешком до мест" hint="Как далеко от площадки подбирать места" options={WALKS} value={p.walk} label={walkLabel} onApply={(v) => updateProfile({ walk: v })} onClose={() => setSheet(null)} />)
        || (logout && <Confirm title="Выйти из аккаунта?" text="Билеты и планы останутся в аккаунте — войдите снова, чтобы их увидеть" action="Выйти" onClose={() => setLogout(false)} onConfirm={() => { setLogout(false); updateProfile({ loggedIn: false }); toast('Вы вышли из аккаунта'); }} />)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-4xl)' }}>
        {/* шапка профиля: аватар, имя, город и баллы, статистика */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-2xl) var(--spacing-2xl)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)', background: 'var(--color-base-white)' }}>
          <button type="button" onClick={() => nav('/profile/data')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', border: 0, padding: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}>
            <Avatar size="sm" src={photos.avatar} />
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-heading-h2">{p.user.name}</span><span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>{p.user.city} · 100 баллов</span></span>
            <Icon name="chevron-right" size={20} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            {([[state.tickets.length, plural(state.tickets.length, 'билет', 'билета', 'билетов'), '/tickets'], [plans, plural(plans, 'план дня', 'плана дня', 'планов дня'), '/plan'], [state.favourites.length, 'в избранном', '/favourites']] as const).map(([n, l, to]) => (
              <button key={to} type="button" onClick={() => nav(to)} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', alignItems: 'flex-start', padding: 'var(--spacing-xl)', border: 0, borderRadius: 'var(--radius-md)', background: 'var(--color-background-base)', cursor: 'pointer', color: 'inherit' }}>
                <span className="ds-heading-h2">{n}</span><span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>{l}</span>
              </button>
            ))}
          </div>
        </div>
        <Card pad="var(--spacing-2xl)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="ds-heading-h3">Мои интересы</span>
            <button type="button" className="ds-note" onClick={() => setEditInterests(!editInterests)} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-primary-orange)' }}>{editInterests ? 'Готово' : 'Изменить'}</button>
          </div>
          <p className="ds-caption" style={{ margin: 'var(--spacing-md) 0 var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>{editInterests ? 'Нажимайте на теги, чтобы включить или выключить' : 'По ним подбираем афишу и места рядом для плана дня'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            {(editInterests ? INTERESTS : INTERESTS.filter((t) => p.interests.includes(t) || INTERESTS.indexOf(t) < 8)).map((t) => (
              <ButtonTag key={t} status={p.interests.includes(t) ? 'Active' : 'No active'} onClick={editInterests ? () => toggleInterest(t) : () => setEditInterests(true)}>{t}</ButtonTag>
            ))}
          </div>
        </Card>
        <Card>
          <div className="ds-heading-h3" style={{ padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-xs)' }}>План дня</div>
          <SettingsRow type="Value" icon="credit-card" label="Бюджет на активности" value={budgetLabel(p.budget)} onClick={() => setSheet('budget')} />
          <SettingsRow type="Value" icon="navigation-pointer" label="Пешком до мест" value={walkLabel(p.walk)} onClick={() => setSheet('walk')} />
          <SettingsRow type="Toggle" icon="route" label="Предлагать план после покупки" on={state.planPromptEnabled} onToggle={setPlanPromptEnabled} />
        </Card>
        <Appearance />
        <Card>
          <SettingsRow icon="ticket" label="История заказов и возврат" onClick={() => nav('/orders')} />
          <SettingsRow icon="gift" label="Промокоды и сертификаты" onClick={() => toast(`Промокоды: ${Object.keys(PROMO_CODES).join(', ')}`)} />
          <SettingsRow type="Toggle" icon="bell" label="Уведомления" on={p.notify} onToggle={(on) => { updateProfile({ notify: on }); toast(on ? 'Напомним о событиях и планах' : 'Уведомления выключены'); }} />
          <SettingsRow icon="message-chat" label="Поддержка" onClick={() => toast('Поддержка: support@biletberu.ru')} />
          <SettingsRow type="Danger" icon="log-out" label="Выйти из аккаунта" onClick={() => setLogout(true)} />
        </Card>
      </div>
    </Screen>
  );
}

/** Profile — personal data (Figma `277:16570`): фото, ФИО, дата рождения, e-mail; телефон — логин (Disabled); удаление аккаунта; «Сохранить». */
export function ProfileData() {
  const back = useBack('/profile');
  const { state, toast, updateUser, updateProfile } = useStore();
  const u = state.profile.user;
  const [f, setF] = useState({ surname: u.surname, name: u.name, birth: u.birth, email: u.email });
  const [del, setDel] = useState(false);
  const changePhoto = () => toast('Загрузка фото появится в следующей версии');
  const field = (k: keyof typeof f, label: string, type = 'text') => (
    <Inputs key={k} state="Default" label={label} type={type} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
  );
  const valid = f.name.trim() && f.surname.trim() && /.+@.+\..+/.test(f.email);
  return (
    <Screen header={<div style={{ background: 'var(--color-background-header)' }}><StatusBar /><TitlePage title="Личные данные" iconLeft="Yes" onLeft={back} /></div>}
      footer={<div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl) 0', background: 'var(--color-base-white)' }}>
        <Button state={valid ? 'Default' : 'Disabled'} disabled={!valid} onClick={() => { updateUser(f); toast('Данные сохранены', 'success'); back(); }}>Сохранить</Button><HomeIndicator /></div>}
      overlay={del && <Confirm title="Удалить аккаунт?" text="Билеты, избранное и планы будут удалены без возможности восстановления" action="Удалить" onClose={() => setDel(false)}
        onConfirm={() => { setDel(false); updateProfile({ loggedIn: false }); toast('Аккаунт удалён'); back(); }} />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl) 0 var(--spacing-4xl)' }}>
        <Card pad="var(--spacing-2xl)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            {/* вариант «В»: крупное фото по центру, камера на фото — сменить; имя под фото */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <button type="button" aria-label="Сменить фото" onClick={changePhoto} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex', borderRadius: 'var(--radius-pill)' }}><Avatar size="lg" src={photos["avatar-lg"]} /></button>
                <ButtonIcon fill="White" icon="camera" label="Сменить фото" onClick={changePhoto} style={{ position: 'absolute', right: -6, bottom: -6 }} />
              </span>
              <span className="ds-heading-h2">{[f.name, f.surname].filter(Boolean).join(' ') || 'Без имени'}</span>
            </div>
            {field('surname', 'Фамилия')}
            {field('name', 'Имя')}
            {field('birth', 'Дата рождения')}
            {field('email', 'E-mail', 'email')}
            <Inputs state="Disabled" label="Телефон" value={u.phone} readOnly />
            <span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>Телефон — логин аккаунта, сменить его можно через поддержку</span>
          </div>
        </Card>
        <Card><SettingsRow type="Danger" icon="trash" label="Удалить аккаунт" onClick={() => setDel(true)} /></Card>
      </div>
    </Screen>
  );
}
