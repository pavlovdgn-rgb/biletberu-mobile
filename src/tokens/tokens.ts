/** Реестр токенов для витрины и Storybook. Источник значений — CSS-переменные (src/tokens/*.css), здесь только имена. */
export const colorTokens = [
  ['color/primary/orange', '--color-primary-orange', '--palette-orange-500'],
  ['color/primary/orange-90', '--color-primary-orange-90', '--palette-orange-500-a90'],
  ['color/primary/orange-10', '--color-primary-orange-10', '--palette-orange-500-a10'],
  ['color/text/primary', '--color-text-primary', '--palette-gray-950'],
  ['color/text/secondary', '--color-text-secondary', '--palette-gray-600'],
  ['color/text/disabled', '--color-text-disabled', '--palette-gray-400'],
  ['color/background/base', '--color-background-base', '--palette-gray-50'],
  ['color/background/secondary', '--color-background-secondary', '--palette-gray-100'],
  ['color/background/disabled', '--color-background-disabled', '--palette-gray-150'],
  ['color/background/overlay', '--color-background-overlay', '--palette-gray-75-a80'],
  ['color/background/placeholder', '--color-background-placeholder', '--palette-gray-200'],
  ['color/base/white', '--color-base-white', '--palette-white'],
  ['color/system/error', '--color-system-error', '--palette-red-600'],
  ['color/system/error-95', '--color-system-error-95', '--palette-red-600-a95'],
  ['color/system/error-bg', '--color-system-error-bg', '--palette-red-500-a10'],
  ['color/system/warning', '--color-system-warning', '--palette-yellow-400'],
  ['color/system/success', '--color-system-success', '--palette-green-500'],
  ['color/accent/violet', '--color-accent-violet', '--palette-violet-600'],
] as const;

export const paletteTokens = [
  '--palette-orange-500', '--palette-orange-500-a90', '--palette-orange-500-a10',
  '--palette-gray-950', '--palette-gray-600', '--palette-gray-400', '--palette-gray-200', '--palette-gray-150',
  '--palette-gray-100', '--palette-gray-75-a80', '--palette-gray-50', '--palette-white',
  '--palette-red-600', '--palette-red-600-a95', '--palette-red-500-a10', '--palette-yellow-400',
  '--palette-green-500', '--palette-violet-600', '--palette-black-a10', '--palette-black-a16',
] as const;

export const radiusTokens = ['xs', 'sm', 'lg', 'md', 'xl', '2xl', 'pill'] as const;
export const spacingTokens = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;
export const shadowTokens = ['Shadow/sm', 'Shadow/md'] as const;

export const textStyles = [
  ['Display L', 'ds-display-l', 'SemiBold 40/44'],
  ['Display', 'ds-display', 'SemiBold 32/38'],
  ['Lead', 'ds-lead', 'Regular 20/24'],
  ['Heading/H1', 'ds-heading-h1', 'SemiBold 22/26'],
  ['Heading/H2', 'ds-heading-h2', 'SemiBold 18/20'],
  ['Heading/H3', 'ds-heading-h3', 'SemiBold 16/20'],
  ['Subtitle', 'ds-subtitle', 'Medium 16/18'],
  ['Price', 'ds-price', 'SemiBold 14/16'],
  ['Body', 'ds-body', 'Regular 14/20'],
  ['Note', 'ds-note', 'Medium 14/16'],
  ['Small', 'ds-small', 'Medium 12/16'],
  ['Caption', 'ds-caption', 'Regular 12/16'],
  ['Tiny', 'ds-tiny', 'Medium 10/16'],
  ['Tiny Regular', 'ds-tiny-regular', 'Regular 10/16'],
] as const;
