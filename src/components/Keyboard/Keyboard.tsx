const KEYS: Array<[string, string]> = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['', ''], ['0', '+'], ['⌫', '']];

/** Keyboard — системная цифровая клавиатура iOS для экранов ввода (в Figma — внешняя библиотека, не токенизируется). Figma: `132:18047`. */
export function Keyboard({ onKey, onDone, className }: { onKey?: (k: string) => void; onDone?: () => void; className?: string }) {
  return (
    <div className={className} style={{ width: '100%', borderRadius: '27px 27px 0 0', overflow: 'hidden', background: 'var(--color-background-disabled)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--spacing-lg) var(--spacing-xl)' }}>
        <button type="button" onClick={onDone} className="ds-heading-h3" style={{ border: 0, background: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer' }}>Готово</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)', padding: '0 var(--spacing-sm) var(--spacing-5xl)' }}>
        {KEYS.map(([d, l], i) => d ? (
          <button key={i} type="button" onClick={() => onKey?.(d)} style={{ height: 47, border: 0, borderRadius: 8.5, cursor: 'pointer',
            background: d === '⌫' ? 'transparent' : 'var(--color-base-white)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 25, lineHeight: '28px' }}>{d}</span>{l && <span className="ds-tiny" style={{ lineHeight: '10px' }}>{l}</span>}
          </button>
        ) : <span key={i} />)}
      </div>
    </div>
  );
}
