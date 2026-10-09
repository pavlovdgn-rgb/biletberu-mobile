import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar, Button, ButtonIcon, ButtonTag, Datepicker, HomeIndicator, Icon, LocationCard, Map, MapMarker, MapPin, MapRoute, StatusBar, TextButtons } from '../components';
import { photos } from '../assets/photos';
import { PLACE_GEO } from '../data/mock';
import { Phone } from './Phone';

/** «Куда пойдём?» — копии экранов plan created (`180:18117`) и Add to the plan_0 (`181:17178`). «Изменить» открывает шторку мест, «+» добавляет место в план, «Удалить план» очищает его. */
const meta = { title: 'Sandboxes/План дня', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

type Stop = { name: string; time: string; category: string };
const PLAN: Stop[] = [
  { name: 'Кофейня Nook & Bean', time: '6 мин. до театра', category: 'Кафе' },
  { name: 'Выходные без телефона: Моменты без лайков', time: '3 мин. до метро', category: 'Театр' },
  { name: 'Ресторан Алый павлин и золотой мандарин', time: '15 мин. до театра', category: 'Ресторан' },
];
const PLACES: Array<[string, string, string]> = [
  ['Бар Mozz', '20 мин. до театра', 'Бар'], ['ТЦ  «Платформа»', '15 мин. до театра', 'ТЦ'], ['Ресторан «Плакучая ива»', '15 мин. до театра', 'Ресторан'],
  ['Кофейня Чёрный квадрат', '10 мин. до театра', 'Кафе'], ['Прогулка на катере', '3 мин. до театра', 'Прогулка'], ['Старый сад', '15 мин. до театра', 'Парк'],
  ['Кофейня Nook & Bean', '6 мин. до театра', 'Кафе'], ['Ресторан Алый павлин и золотой мандарин', '15 мин. до театра', 'Ресторан'], ['Ресторан русской кухни', '7 мин. до театра', 'Ресторан'],
];
const FILTERS = ['Все', 'Кафе', 'Рестораны', 'Парки', 'Бары'];
const white = { background: 'var(--color-base-white)' } as const;

function PlanScreen({ sheet: initialSheet }: { sheet: boolean }) {
  const [plan, setPlan] = useState<Stop[]>(PLAN);
  const [sheet, setSheet] = useState(initialSheet);
  const [filter, setFilter] = useState(-1);
  const [added, setAdded] = useState<string[]>([]);
  const header = (
    <div style={{ ...white, borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 var(--spacing-2xl) var(--spacing-xl) var(--spacing-5xl)' }}>
        <span className="ds-heading-h2" style={{ flex: 1, textAlign: 'center' }}>Куда пойдём</span>
        <ButtonIcon icon="map" label="Карта" />
      </div>
      <div style={{ padding: '0 0 var(--spacing-xl) var(--spacing-2xl)' }}><Datepicker state="2" startDay={22} firstWeekday={2} defaultSelected={23} ticketDays={[25]} /></div>
    </div>
  );
  return (
    <div style={{ position: 'relative' }}>
      <Phone header={header} footer={<div><Bar active={1} /><HomeIndicator /></div>}>
        <div style={{ ...white, borderRadius: 'var(--radius-2xl)', marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-3xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-orange)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xs)' }}>
                <span className="ds-heading-h3" style={{ color: 'var(--color-base-white)' }}>Суббота, 25 Апреля</span>
                <span className="ds-body" style={{ color: 'var(--color-background-base)' }}>{plan.length} активности • 5 ч. 0 мин.</span>
              </div>
              <TextButtons onClick={() => setSheet(true)}>Изменить</TextButtons>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-2xl) var(--spacing-2xl) 0', borderRadius: 'var(--radius-md)', background: 'var(--color-background-base)' }}>
              <span className="ds-heading-h3" style={{ paddingBottom: 'var(--spacing-md)' }}>Наши рекомендации:</span>
              <p className="ds-body" style={{ margin: 0, padding: '0 var(--spacing-2xs) var(--spacing-2xl)', color: 'var(--color-text-secondary)' }}>
                Начните вечер с уютной паузы в кофейне. Затем отправляйтесь на спектакль и погрузитесь в атмосферу театра и живых эмоций. После представления завершите вечер ужином в ресторане. Идти всего 10 минут (500 м).
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {plan.map((p, i) => <LocationCard key={p.name + i} photo="No" order={i + 1} name={p.name} time={p.time} category={p.category} />)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', padding: '0 var(--spacing-2xl) var(--spacing-xl)' }}>
              <Icon name="marker-pin" size={24} /><span className="ds-heading-h2">Маршрут на карте</span>
            </div>
            <div style={{ position: 'relative', height: 254 }}>
              <Map designation="No" metro="Yes" height={254} center={PLACE_GEO.theatre}>
                <MapRoute points={[PLACE_GEO.nook, PLACE_GEO.theatre, PLACE_GEO.peacock]} />
                <MapPin at={PLACE_GEO.peacock}><MapMarker label="Ресторан" order={3} image={photos['marker-0']} /></MapPin>
                <MapPin at={PLACE_GEO.theatre}><MapMarker label="Театр" order={2} image={photos['marker-1']} /></MapPin>
                <MapPin at={PLACE_GEO.nook}><MapMarker label="Кофейня" order={1} image={photos['marker-2']} /></MapPin>
              </Map>
              <TextButtons color="White" size="M" iconLeft="Yes" style={{ position: 'absolute', left: 16, top: 10 }}>Открыть карту</TextButtons>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl) 0 var(--spacing-5xl)' }}>
            <TextButtons fill="No" iconLeft="Yes" iconLeftName="trash" danger onClick={() => setPlan([])}>Удалить план</TextButtons>
          </div>
        </div>
      </Phone>
      {sheet && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--radius-2xl)', overflow: 'hidden', background: 'color-mix(in srgb, var(--color-text-primary) 60%, transparent)' }} onClick={() => setSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: 0, right: 0, top: 92, bottom: 0, display: 'flex', flexDirection: 'column', ...white, borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', animation: 'bbUp 260ms var(--motion-ease)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 5px' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
            <div style={{ padding: '0 var(--spacing-2xl) var(--spacing-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--spacing-md)' }}>
                <span className="ds-heading-h2">Все интересные места</span><ButtonIcon size="M" icon="x-close" label="Закрыть" onClick={() => setSheet(false)} />
              </div>
              <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>(найдено 999)</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl)', overflowX: 'auto', scrollbarWidth: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--spacing-md) var(--spacing-2xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-text-primary)', color: 'var(--color-base-white)' }}><Icon name="settings" /></span>
              {FILTERS.map((f, i) => <ButtonTag key={f} status={i === filter ? 'Active' : 'No active'} onClick={() => setFilter(i)}>{f}</ButtonTag>)}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: '0 var(--spacing-2xl) 160px' }}>
              {PLACES.filter(([, , c]) => filter <= 0 || FILTERS[filter].startsWith(c.slice(0, 3))).map(([n, t]) => {
                const on = added.includes(n);
                return <LocationCard key={n} button="Yes" name={n} time={t} image={photos[`place-${PLACES.findIndex((p) => p[0] === n)}`]} favourite={on}
                  onAction={() => { setAdded(on ? added.filter((x) => x !== n) : [...added, n]); }} />;
              })}
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: 0, right: 0, bottom: 94, padding: 'var(--spacing-xl) var(--spacing-2xl)', ...white }}>
            <Button state={added.length ? 'Default' : 'Disabled'} onClick={() => { setPlan([...plan, ...added.map((n) => { const p = PLACES.find((x) => x[0] === n)!; return { name: p[0], time: p[1], category: p[2] }; })]); setAdded([]); setSheet(false); }}>
              {added.length ? `Добавить (${added.length})` : 'Добавить'}
            </Button>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}><Bar active={1} /><HomeIndicator /></div>
          <style>{'@keyframes bbUp{from{transform:translateY(100%)}to{transform:none}}'}</style>
        </div>
      )}
    </div>
  );
}

/** plan created — план дня по билету. */
export const PlanCreated: Story = { name: 'plan created', render: () => <PlanScreen sheet={false} /> };
/** Add to the plan_0 — шторка «Все интересные места». */
export const AddToPlan: Story = { name: 'Add to the plan_0', render: () => <PlanScreen sheet /> };
