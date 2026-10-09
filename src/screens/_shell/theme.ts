import { useEffect, useState } from 'react';
import { useStore, type ThemeChoice } from '../../data/store';

/** Тема оформления (`ds/foundation.md`, «Тёмная тема»): выбор в профиле → `data-theme` на корне приложения.
 *  «Как в системе» следит за настройкой телефона (`prefers-color-scheme`) и меняется вместе с ней. */
const query = '(prefers-color-scheme: dark)';
const systemDark = () => typeof window !== 'undefined' && window.matchMedia?.(query).matches;

export function useTheme(): { choice: ThemeChoice; theme: 'light' | 'dark' } {
  const choice = useStore().state.profile.theme ?? 'system';
  const [dark, setDark] = useState(systemDark);
  useEffect(() => {
    const m = window.matchMedia?.(query);
    if (!m) return;
    const on = () => setDark(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return { choice, theme: choice === 'system' ? (dark ? 'dark' : 'light') : choice };
}
