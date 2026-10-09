import { useEffect, useState, type ReactNode } from 'react';
import s from './Device.module.css';
import { NATIVE } from '../../components/_lib/native';

const W = 433, H = 892, GAP = 48;
const isPhone = () => typeof window !== 'undefined' && (NATIVE || window.matchMedia('(max-width: 500px)').matches || new URLSearchParams(window.location.search).get('frame') === '0');

/** Корпус iPhone 15 Pro на тёмной сцене вокруг приложения — для погружения при просмотре на компьютере.
 *  На телефоне (ширина ≤ 500px) или с `?frame=0` — приложение во весь экран без рамки. Корпус масштабируется под высоту окна. */
export function Device({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState(isPhone);
  const [k, setK] = useState(1);
  useEffect(() => {
    const fit = () => { setPhone(isPhone()); setK(Math.min(1, (window.innerHeight - GAP) / H, (window.innerWidth - GAP) / W)); };
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  if (phone) return <>{children}</>;
  return (
    <div className={s.stage}>
      <div className={s.scaler} style={{ transform: `scale(${k})`, width: W, height: H, margin: `${(H * (k - 1)) / 2}px ${(W * (k - 1)) / 2}px` }}>
        <div className={s.body}>
          <span className={`${s.btn} ${s.action}`} /><span className={`${s.btn} ${s.volUp}`} /><span className={`${s.btn} ${s.volDown}`} /><span className={`${s.btn} ${s.power}`} />
          <div className={s.bezel}>
            <div className={s.screen}>{children}<span className={s.island} aria-hidden /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
