/** Pin — точка-отметка даты, на которую куплен билет (`color/accent/violet`). Figma: `132:17395`. */
export function Pin({ className }: { className?: string }) {
  return <span className={className} style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--color-accent-violet)' }} />;
}
