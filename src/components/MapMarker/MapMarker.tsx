import type { CSSProperties } from 'react';
import { Bulb } from '../Bulb';
import { useMapScale } from '../Map/Map';

/** С какого масштаба карты (px на единицу) видны подписи меток — как в настоящих картах: отдалили — только фото, приблизили — с названием. */
export const MARKER_LABEL_MIN_SCALE = 0.6;

export interface MapMarkerProps {
  /** Text: Yes — подпись под меткой. */
  text?: 'No' | 'Yes';
  /** Size: Sm 32 · Lg 36 · Xl 48. */
  size?: 'Sm' | 'Lg' | 'Xl';
  /** Bulb: Yes — номер точки плана. */
  bulb?: 'No' | 'Yes';
  label?: string;
  order?: number;
  image?: string;
  style?: CSSProperties;
  className?: string;
}

/** Map marker — метка места на карте: фото в белой рамке, подпись, номер. Figma: `146:5263`. */
export function MapMarker({ text = 'Yes', size = 'Lg', bulb = 'Yes', label = 'Прогулка на катере', order = 1, image, style, className }: MapMarkerProps) {
  const d = size === 'Sm' ? 32 : size === 'Lg' ? 36 : 48;
  // на карте подпись зависит от зума; вне карты (витрина, Storybook) масштаб = 1 — подпись видна
  const showLabel = text === 'Yes' && useMapScale() >= MARKER_LABEL_MIN_SCALE;
  return (
    <span className={className} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xs)', width: 65, ...style }}>
      <span style={{ position: 'relative', width: d, height: d, borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-static-white)', boxShadow: 'var(--shadow-sm)',
        background: image ? `center/cover url(${image})` : 'var(--color-background-placeholder)' }}>
        {bulb === 'Yes' && <Bulb color="Orange" size="Sm" style={{ position: 'absolute', top: -6, right: -6 }}>{order}</Bulb>}
      </span>
      {text === 'Yes' && <span className="ds-small" aria-hidden={!showLabel} style={{ textAlign: 'center', color: 'var(--map-label-strong)', WebkitTextStroke: '3px var(--map-label-halo)', paintOrder: 'stroke fill',
        opacity: showLabel ? 1 : 0, transform: showLabel ? 'none' : 'translateY(-4px)', transition: 'opacity 200ms ease, transform 200ms ease', pointerEvents: 'none' }}>{label}</span>}
    </span>
  );
}
