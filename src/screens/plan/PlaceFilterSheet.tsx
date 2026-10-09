import { useState } from 'react';
import { Button, ButtonIcon, ButtonTag, HomeIndicator, Inputs, RangeSlider, TitlePage } from '../../components';
import { PLACES } from '../../data/mock';
import { PLACE_METERS, PLACE_PRICE } from '../../data/people';
import { BottomSheet } from '../_shell/BottomSheet';

export type PlaceFilter = { maxPrice: number | null; maxMeters: number | null; cats: string[] };
export const NO_PLACE_FILTER: PlaceFilter = { maxPrice: null, maxMeters: null, cats: [] };
const CATS: Record<string, (c: string) => boolean> = { 'Кафе': (c) => c === 'Кафе', 'Рестораны': (c) => c === 'Ресторан', 'Парки': (c) => c === 'Парки', 'Бары': (c) => c === 'Бары', 'Дегустации': (c) => c === 'Дегустации', 'Досуг': (c) => c === 'Досуг', 'Торговые центры': (c) => c === 'ТЦ' };
export const matchPlace = (f: PlaceFilter) => (p: { id: string; category: string; meters?: number }) =>
  (f.maxPrice === null || (PLACE_PRICE[p.id] ?? 0) <= f.maxPrice) && (f.maxMeters === null || (p.meters ?? PLACE_METERS[p.id] ?? 0) <= f.maxMeters)
  && (f.cats.length === 0 || f.cats.some((c) => CATS[c](p.category)));
export const placeFilterActive = (f: PlaceFilter) => f.maxPrice !== null || f.maxMeters !== null || f.cats.length > 0;
const placesLabel = (n: number) => (n === 0 ? 'Ничего не найдено' : `Показать ${n} ${n % 10 === 1 && n % 100 !== 11 ? 'место' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'места' : 'мест'}`);

/** Plan — places filter (Figma `257:16317`): фильтр шторки «Все интересные места» — средний чек, расстояние до площадки, категории. */
export function PlaceFilterSheet({ value, onApply, onClose }: { value: PlaceFilter; onApply: (f: PlaceFilter) => void; onClose: () => void }) {
  const [f, setF] = useState<PlaceFilter>(value);
  const count = PLACES.filter((p) => p.id !== 'theatre').filter(matchPlace(f)).length;
  const num = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 6); return d ? Number(d) : null; };
  return (
    <BottomSheet label="Фильтр мест" style={{ top: 123 }} onClose={onClose}>{(close) => (<>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 5px' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-md)' }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}><span className="ds-heading-h2">Фильтр мест</span><span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Все интересные места рядом с площадкой</span></span>
          <ButtonIcon size="M" icon="x-close" label="Закрыть" onClick={() => close()} />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 120 }}>
          <TitlePage version="Secondary" title="Цена, ₽" textButtonLabel={f.maxPrice !== null ? 'Сбросить' : ''} onRight={() => setF({ ...f, maxPrice: null })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl) var(--spacing-4xl)' }}>
            <Inputs state="DefaultFilled" label="До" inputMode="numeric" value={f.maxPrice === null ? 'Без ограничений' : f.maxPrice.toLocaleString('ru-RU')} onChange={(e) => setF({ ...f, maxPrice: num(e.target.value) })} />
            <RangeSlider showValue={false} value={f.maxPrice} onChange={(v) => setF({ ...f, maxPrice: v })} />
          </div>
          <TitlePage version="Secondary" title="Расстояние до мероприятия, м" textButtonLabel={f.maxMeters !== null ? 'Сбросить' : ''} onRight={() => setF({ ...f, maxMeters: null })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl) var(--spacing-4xl)' }}>
            <Inputs state="DefaultFilled" label="До" inputMode="numeric" value={f.maxMeters === null ? 'Без ограничений' : f.maxMeters.toLocaleString('ru-RU')} onChange={(e) => setF({ ...f, maxMeters: num(e.target.value) })} />
            <RangeSlider showValue={false} marks={[200, 500, 1000, 2000]} value={f.maxMeters} onChange={(v) => setF({ ...f, maxMeters: v })} />
          </div>
          <TitlePage version="Secondary" title="Категории" textButtonLabel="" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', padding: '0 var(--spacing-2xl)' }}>
            <ButtonTag status={f.cats.length === 0 ? 'Active' : 'No active'} onClick={() => setF({ ...f, cats: [] })}>Все</ButtonTag>
            {Object.keys(CATS).map((c) => <ButtonTag key={c} status={f.cats.includes(c) ? 'Active' : 'No active'} onClick={() => setF({ ...f, cats: f.cats.includes(c) ? f.cats.filter((x) => x !== c) : [...f.cats, c] })}>{c}</ButtonTag>)}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--color-base-white)' }}>
          <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl)' }}><Button state={count ? 'Default' : 'Disabled'} disabled={!count} onClick={() => close(() => onApply(f))}>{placesLabel(count)}</Button></div>
          <HomeIndicator />
        </div>
      </>)}</BottomSheet>
  );
}
