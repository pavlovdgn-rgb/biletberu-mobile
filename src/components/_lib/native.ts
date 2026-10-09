/** Версия «как приложение» — отдельная ссылка `/app/…`: без корпуса iPhone, без нарисованного статус-бара и полоски Home —
 *  вместо них системные отступы телефона (safe area). Определяется по адресу один раз при загрузке.
 *  Сайт может жить не в корне (GitHub Pages: `/biletberu-mobile/`) — префикс берётся из `BASE_URL` сборки. */
const BASE = import.meta.env.BASE_URL; // '/' локально, '/biletberu-mobile/' на GitHub Pages
export const NATIVE = typeof window !== 'undefined' && new RegExp(`^${BASE}app(/|$)`).test(window.location.pathname);
export const BASENAME = NATIVE ? `${BASE}app` : BASE === '/' ? undefined : BASE.slice(0, -1);
/** Полная ссылка на экран приложения (для «Поделиться»). */
export const appUrl = (path: string) => `${window.location.origin}${BASENAME ?? ''}${path}`;
