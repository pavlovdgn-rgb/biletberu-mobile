import { useEffect, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, iconNames } from '../components/Icon';
import { colorTokens, paletteTokens, radiusTokens, spacingTokens, shadowTokens, textStyles } from '../tokens/tokens';

/** Значение CSS-переменной в рантайме — раздел не хардкодит значения, читает их из src/tokens/*.css. */
const useVar = (name: string) => {
  const [v, setV] = useState('');
  useEffect(() => setV(getComputedStyle(document.documentElement).getPropertyValue(name).trim()), [name]);
  return v;
};
const Val = ({ name }: { name: string }) => <code className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>{useVar(name)}</code>;
const Grid = ({ children, min = 220 }: { children: ReactNode; min?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 'var(--spacing-xl)' }}>{children}</div>
);
const Tile = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-base-white)' }}>{children}</div>
);
const Chip = ({ v }: { v: string }) => (
  <div style={{ height: 56, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-background-disabled)', position: 'relative', overflow: 'hidden',
    backgroundImage: 'linear-gradient(45deg, var(--color-background-disabled) 25%, transparent 25%, transparent 75%, var(--color-background-disabled) 75%), linear-gradient(45deg, var(--color-background-disabled) 25%, transparent 25%, transparent 75%, var(--color-background-disabled) 75%)',
    backgroundSize: '12px 12px', backgroundPosition: '0 0, 6px 6px' }}><span style={{ position: 'absolute', inset: 0, background: `var(${v})` }} /></div>
);

/** Foundation — все переменные дизайн-системы: Semantic (имена 1:1 с Figma Variables) и Primitive (палитра в коде), типографика, радиусы, отступы, тени, иконки. */
const meta = { title: 'Foundation/Tokens', parameters: { layout: 'padded' }, tags: ['autodocs'] } satisfies Meta;
export default meta;
type Story = StoryObj;

/** Семантические цвета (коллекция Color в Figma) и примитив, на который каждый ссылается. */
export const SemanticColors: Story = {
  render: () => (
    <Grid>{colorTokens.map(([fig, css, prim]) => (
      <Tile key={css}><Chip v={css} /><span className="ds-note">{fig}</span><span className="ds-caption">{css}</span><span className="ds-caption" style={{ color: 'var(--color-text-secondary)' }}>→ var({prim})</span><Val name={prim} /></Tile>
    ))}</Grid>
  ),
};

/** Примитивы — сырые значения палитры. В Figma слоя примитивов нет; в коде он нужен, чтобы семантика ссылалась на палитру. */
export const PrimitivePalette: Story = {
  render: () => <Grid min={180}>{paletteTokens.map((p) => <Tile key={p}><Chip v={p} /><span className="ds-caption">{p}</span><Val name={p} /></Tile>)}</Grid>,
};

/** 14 text styles на Onest. Цвет в стиль не входит. */
export const Typography: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', padding: 'var(--spacing-2xl)', background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' }}>
      {textStyles.map(([name, cls, spec]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2xl)' }}>
          <span className="ds-caption" style={{ width: 200, flexShrink: 0, color: 'var(--color-text-secondary)' }}>{name}<br />{spec} · .{cls}</span>
          <span className={cls}>Куда пойдём в субботу? Билет Беру</span>
        </div>
      ))}
    </div>
  ),
};

/** Радиусы (коллекция Radius). */
export const Radius: Story = {
  render: () => <Grid min={140}>{radiusTokens.map((r) => <Tile key={r}><span style={{ width: 72, height: 72, background: 'var(--color-primary-orange)', borderRadius: `var(--radius-${r})` }} /><span className="ds-note">radius/{r}</span><Val name={`--radius-${r}`} /></Tile>)}</Grid>,
};

/** Отступы (коллекция Spacing, скоуп GAP). */
export const Spacing: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {spacingTokens.map((t) => <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2xl)' }}>
        <span className="ds-note" style={{ width: 120 }}>spacing/{t}</span><span style={{ height: 16, width: `var(--spacing-${t})`, background: 'var(--color-accent-violet)' }} /><Val name={`--spacing-${t}`} /></div>)}
    </div>
  ),
};

/** Тени (Effect styles) и прозрачность disabled. */
export const ShadowsAndOpacity: Story = {
  render: () => (
    <Grid>{shadowTokens.map((sname) => { const v = `--shadow-${sname.split('/')[1]}`; return (
      <div key={sname} style={{ height: 120, borderRadius: 'var(--radius-md)', background: 'var(--color-base-white)', boxShadow: `var(${v})`, padding: 'var(--spacing-xl)' }}>
        <span className="ds-note">{sname}</span><br /><Val name={v} /></div>); })}
      <Tile><span style={{ height: 56, borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-orange)', opacity: 'var(--opacity-disabled)' }} /><span className="ds-note">opacity/disabled</span><Val name="--opacity-disabled" /></Tile>
    </Grid>
  ),
};

/** Набор иконок `20px` (49 шт., из Figma). Цвет — currentColor. */
export const Icons: Story = {
  render: () => <Grid min={120}>{iconNames.map((n) => <Tile key={n}><Icon name={n} size={24} /><span className="ds-tiny-regular">{n}</span></Tile>)}</Grid>,
};
