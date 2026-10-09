import type { ReactNode } from 'react';
import { cx } from '../_lib/cx';
import { Icon, type IconName } from '../Icon';
import s from './TitlePage.module.css';

type YN = 'Yes' | 'No';
export interface TitlePageProps {
  /** Version: Main — шапка экрана по центру, Secondary — заголовок секции слева + «Все». */
  version?: 'Main' | 'Secondary';
  iconLeft?: YN;
  iconRight?: YN;
  textButton?: YN;
  subtitle?: YN;
  title?: ReactNode;
  subtitleText?: string;
  textButtonLabel?: string;
  iconLeftName?: IconName;
  iconRightName?: IconName;
  /** Скругление снизу `radius/2xl` (шапка экрана над серым фоном). */
  rounded?: boolean;
  onLeft?: () => void;
  onRight?: () => void;
  className?: string;
}

/** Title_page — шапка экрана или секции. Figma: `132:18078` (Title container — slot → проп title). */
export function TitlePage({ version = 'Main', iconLeft = 'Yes', iconRight = 'No', textButton = 'No', subtitle = 'No', title = 'Фильтры',
  subtitleText = '25 апреля 18-00', textButtonLabel, iconLeftName, iconRightName = 'settings', rounded, onLeft, onRight, className }: TitlePageProps) {
  if (version === 'Secondary') {
    return (
      <div className={cx(s.root, s.secondary, rounded && s.rounded, className)}>
        <span className="ds-heading-h2">{title}</span>
        {(textButtonLabel ?? 'Все') !== '' && <button type="button" className={cx('ds-note', s.link)} onClick={onRight}>{textButtonLabel ?? 'Все'}</button>}
      </div>
    );
  }
  const left = iconLeftName ?? (subtitle === 'Yes' ? '24px-close' : '24px chevron-left');
  return (
    <div className={cx(s.root, s.main, rounded && s.rounded, className)}>
      <span className={s.side}>{iconLeft === 'Yes' && <button type="button" aria-label="Назад" className={s.iconBtn} onClick={onLeft}><Icon name={left} size={24} /></button>}</span>
      <span className={s.center}>
        <span className="ds-heading-h2">{title}</span>
        {subtitle === 'Yes' && <span className={cx('ds-body', s.sub)}>{subtitleText}</span>}
      </span>
      <span className={cx(s.side, s.right)}>
        {iconRight === 'Yes' && <button type="button" aria-label="Действие" className={s.iconBtn} onClick={onRight}><Icon name={iconRightName} size={24} /></button>}
        {textButton === 'Yes' && <button type="button" className={cx('ds-note', s.link)} onClick={onRight}>{textButtonLabel ?? 'Сбросить'}</button>}
      </span>
    </div>
  );
}
