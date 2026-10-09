export interface ProgressBarProps { segments?: number; current?: number; progress?: number; /** Цвет заполнения (по умолчанию оранжевый; в сторис — белый). */ fill?: string; className?: string }

/** Progress_bar — сегменты прогресса сторис. Figma: `132:18225`. */
export function ProgressBar({ segments = 5, current = 0, progress = 1, fill = 'var(--color-primary-orange)', className }: ProgressBarProps) {
  return (
    <div className={className} role="progressbar" aria-valuenow={current + 1} aria-valuemax={segments}
      style={{ display: 'flex', gap: 'var(--spacing-xl)', width: '100%', padding: '1px var(--spacing-2xl)' }}>
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} style={{ flex: 1, height: 2, borderRadius: 'var(--radius-pill)', overflow: 'hidden',
          background: i < current ? fill : 'color-mix(in srgb, var(--color-static-white) 50%, transparent)' }}>
          {i === current && <span style={{ display: 'block', height: '100%', width: `${progress * 100}%`, background: fill }} />}
        </span>
      ))}
    </div>
  );
}
