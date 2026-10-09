import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Button, ButtonTag, HomeIndicator, Inputs, RangeSlider, StatusBar, TitlePage, Toggle } from '../../components';
import { eventsWord, rub } from '../../data/mock';
import { applyFilters, EMPTY_FILTERS, filtersActive, useStore, type Filters } from '../../data/store';
import { NavBar, useBack } from '../_shell/app';
import { Screen } from '../_shell/Screen';
import { CalendarSheet, dateLabel } from './CalendarSheet';
import { ALL_KINDS, ALL_VENUES, TagSheet } from './TagSheet';

const DATES = ['На этой неделе', 'Завтра', 'На этих выходных', 'Выбрать дату'];
const KINDS = ['Концерт', 'Экскурсия', 'Лекция', 'Шоу', 'Цирк', 'Выставка', 'Театр', 'Семинар', 'Музеи'];
const VENUES = ['Русский музей', 'Мариинский театр', 'Спас на Крови', 'Капелла', 'Эрмитаж'];
const MIN_PRICE = 100;
const MAX_PRICE = 1_000_000;

const Group = ({ title, link, onLink, children, top = 'var(--spacing-xl)' }: { title: string; link?: boolean; onLink?: () => void; children: ReactNode; top?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', paddingTop: top }}>
    <TitlePage version="Secondary" title={title} textButtonLabel={link ? 'Все' : ''} onRight={onLink} />
    <div style={{ padding: '0 var(--spacing-2xl) var(--spacing-2xl)' }}>{children}</div>
  </div>
);
const Tags = ({ items, on, toggle, label = (t) => t }: { items: string[]; on: (t: string) => boolean; toggle: (t: string) => void; label?: (t: string) => string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>{items.map((t) => <ButtonTag key={t} status={on(t) ? 'Active' : 'No active'} onClick={() => toggle(t)}>{label(t)}</ButtonTag>)}</div>
);
const flip = (list: string[], t: string) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]);

/** Filter 1 — фильтры (Figma `178:17767`). Черновик фильтров, счётчик событий на кнопке, «Сбросить», проверка цены. */
export function Filter() {
  const nav = useNavigate();
  const back = useBack('/main');
  const { state, setFilters, toast } = useStore();
  const [f, setF] = useState<Filters>(filtersActive(state.filters) ? state.filters : { ...EMPTY_FILTERS, maxPrice: 1500, discount: true });
  const [priceText, setPriceText] = useState(f.maxPrice === null ? '' : String(f.maxPrice));
  const [ver, setVer] = useState(0);
  const [cal, setCal] = useState(false);
  const [sheet, setSheet] = useState<null | 'kinds' | 'venues'>(null);
  // на экране — базовые теги + выбранные в шторке
  const shown = (base: string[], sel: string[]) => [...base, ...sel.filter((t) => !base.includes(t))];
  const custom = !!f.date && /^\d{4}-/.test(f.date);
  const priceError = f.maxPrice !== null && f.maxPrice < MIN_PRICE ? `Минимум ${rub(MIN_PRICE)}` : null;
  const count = applyFilters(f).length;
  const reset = () => { setF(EMPTY_FILTERS); setPriceText(''); setVer((v) => v + 1); };
  const submit = () => { setFilters(f); toast(`Показываем ${eventsWord(count)}`, 'success'); nav('/main'); };

  return (
    <Screen bg="var(--color-base-white)"
      overlay={(cal && <CalendarSheet value={f.date} onClose={() => setCal(false)} onApply={(v) => { setF({ ...f, date: v }); setCal(false); }} />)
        || (sheet && <TagSheet title={sheet === 'kinds' ? 'Что' : 'Площадка'} items={sheet === 'kinds' ? ALL_KINDS : ALL_VENUES} value={sheet === 'kinds' ? f.kinds : f.venues}
          onClose={() => setSheet(null)} onApply={(sel) => { setF({ ...f, [sheet]: sel }); setSheet(null); }} />)}
      header={<div className="bb-surface-head"><StatusBar /><TitlePage title="Фильтры" textButton="Yes" onLeft={back} onRight={reset} /></div>}
      footer={<div><div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)', background: 'var(--color-base-white)' }}>
        <Button state={count === 0 || priceError ? 'Disabled' : 'Default'} disabled={count === 0 || !!priceError} onClick={submit}>{count === 0 ? 'Ничего не найдено' : `Посмотреть ${eventsWord(count)}`}</Button>
      </div><NavBar active={0} /><HomeIndicator /></div>}>
      <div key={ver} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', paddingTop: 'var(--spacing-xl)' }}>
        <Group title="Дата" top="0"><Tags items={DATES} on={(t) => (t === 'Выбрать дату' ? custom : f.date === t)} label={(t) => (t === 'Выбрать дату' && custom ? dateLabel(f.date!) : t)}
          toggle={(t) => (t === 'Выбрать дату' ? setCal(true) : setF({ ...f, date: f.date === t ? null : t }))} /></Group>
        <Group title="Стоимость">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            <Inputs state={priceError ? 'Error' : 'DefaultFilled'} message={priceError ?? undefined} label="До" inputMode="numeric" maxLength={9}
              value={f.maxPrice === null ? (priceText ? priceText : 'Без ограничений') : f.maxPrice.toLocaleString('ru-RU')}
              onFocus={(e) => { if (f.maxPrice === null) e.target.select(); }}
              onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 7); setPriceText(d); setF({ ...f, maxPrice: d ? Math.min(MAX_PRICE, Number(d)) : null }); }} />
            <RangeSlider showValue={false} value={f.maxPrice} onChange={(v) => { setPriceText(v === null ? '' : String(v)); setF({ ...f, maxPrice: v }); }} />
          </div>
        </Group>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-4xl) var(--spacing-2xl) var(--spacing-2xl)' }}>
          {([['Пушкинская карта', 'pushkin'], ['Со скидкой', 'discount']] as const).map(([t, k]) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="ds-subtitle">{t}</span>
              <Toggle state={f[k] ? 'Active' : 'Disabled'} label={t} onChange={(on) => setF({ ...f, [k]: on })} /></div>
          ))}
        </div>
        <Group title="Что" link onLink={() => setSheet('kinds')}><Tags items={shown(KINDS, f.kinds)} on={(t) => f.kinds.includes(t)} toggle={(t) => setF({ ...f, kinds: flip(f.kinds, t) })} /></Group>
        <Group title="Площадка" link onLink={() => setSheet('venues')}><Tags items={shown(VENUES, f.venues)} on={(t) => f.venues.includes(t)} toggle={(t) => setF({ ...f, venues: flip(f.venues, t) })} /></Group>
      </div>
    </Screen>
  );
}
