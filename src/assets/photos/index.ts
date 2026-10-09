/** Фото из макетов Figma (экран Main 1), выгружены в 2× для каталога и песочниц. */
const files = import.meta.glob('./*.jpg', { eager: true, import: 'default' }) as Record<string, string>;
export const photos: Record<string, string> = Object.fromEntries(Object.entries(files).map(([k, v]) => [k.replace('./', '').replace('.jpg', ''), v]));

/** Картинка по ключу набора или готовый URL (data-URL фото из отзыва пользователя). */
export const photoSrc = (k: string) => photos[k] ?? k;
