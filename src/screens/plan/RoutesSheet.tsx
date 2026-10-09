import { Button, Icon, Image } from '../../components';
import { photos } from '../../assets/photos';
import { placeById } from '../../data/mock';
import { BottomSheet } from '../_shell/BottomSheet';

/** Готовые маршруты вокруг события: места до и после спектакля. «Взять маршрут» кладёт их в план дня — дальше можно поменять порядок или убрать лишнее. */
export const ROUTES: Array<{ id: string; title: string; meta: string; steps: Array<[string, string]> }> = [
  { id: 'dinner', title: 'Кофе, спектакль и ужин', meta: '16:30–22:00 · 1,1 км пешком', steps: [['nook', '16:30'], ['theatre', '18:00'], ['peacock', '20:30']] },
  { id: 'water', title: 'Вечер у воды', meta: '16:00–23:00 · 0,9 км пешком', steps: [['boat', '16:00'], ['theatre', '18:00'], ['mozz', '21:00']] },
  { id: 'slow', title: 'Неспешно, с прогулкой', meta: '15:30–21:30 · 1,4 км пешком', steps: [['garden', '15:30'], ['theatre', '18:00'], ['russian', '20:15']] },
];

/** Plan — routes (Figma: Screens → 8, «Plan — routes»): шторка с готовыми маршрутами. */
export function RoutesSheet({ onTake, onClose }: { onTake: (placeIds: string[], title: string) => void; onClose: () => void }) {
  return (
    <BottomSheet label="Готовые маршруты" style={{ padding: 'var(--spacing-sm) var(--spacing-2xl) var(--spacing-5xl)' }} onClose={onClose}>{(close) => (<>
      <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 37, height: 5, borderRadius: 'var(--radius-xs)', background: 'var(--color-background-placeholder)' }} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', padding: 'var(--spacing-2xl) 0 var(--spacing-xl)' }}>
        <span className="ds-heading-h2">Готовые маршруты</span>
        <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>Выберите — добавим места в план, порядок можно поменять</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', overflowY: 'auto', minHeight: 0 }}>
        {ROUTES.map((r) => (
          <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-background-base)' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <span className="ds-subtitle">{r.title}</span>
              <span className="ds-body" style={{ color: 'var(--color-text-secondary)' }}>{r.steps.length} точки · {r.meta}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              {r.steps.map(([id, tm], i) => (
                <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  {i > 0 && <Icon name="chevron-right" size={20} style={{ color: 'var(--color-text-secondary)' }} />}
                  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <Image size="xxxs" src={photos[id === 'theatre' ? 'marker-1' : placeById(id)!.image]} />
                    <span className="ds-caption" style={{ color: id === 'theatre' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{tm}</span>
                  </span>
                </span>
              ))}
            </span>
            <Button type="Secondary" size="Sm" onClick={() => close(() => { onTake(r.steps.map(([id]) => id).filter((id) => id !== 'theatre'), r.title); onClose(); })}>Взять маршрут</Button>
          </div>
        ))}
      </div>
    </>)}</BottomSheet>
  );
}
