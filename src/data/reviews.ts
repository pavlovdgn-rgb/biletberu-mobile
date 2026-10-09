import { BANNER_IDS, EVENTS, INTEREST_IDS, MAIN_EVENT_ID, type EventItem } from './mock';
import { REVIEWS, type Review } from './people';
import { useStore, type MyReview, type Profile } from './store';

/** Отзывы по мероприятиям. Главный спектакль — отзывы из макетов (`REVIEWS`), остальные — собраны детерминированно по id:
 *  у каждого своё число отзывов (у части — ни одного), оценки, тексты под жанр, фото — у некоторых. Рейтинг мероприятия = средняя оценка. */

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed: string) => { let x = hash(seed) || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; }; };

const NAMES = ['Анна К.', 'Дмитрий', 'Ольга Сергеевна', 'Максим', 'Елена В.', 'Игорь Петрович', 'Светлана', 'Артём', 'Юлия Р.', 'Павел', 'Мария', 'Кирилл Н.', 'Татьяна', 'Роман', 'Ксения', 'Андрей Л.', 'Вера', 'Степан', 'Дарья М.', 'Глеб'];
// аватары по полу: чётные — женские, нечётные — мужские (ravatar-0…9)
const FEMALE = new Set(['Анна К.', 'Ольга Сергеевна', 'Елена В.', 'Светлана', 'Юлия Р.', 'Мария', 'Татьяна', 'Ксения', 'Вера', 'Дарья М.']);
const avatarFor = (name: string, r: number) => `ravatar-${(Math.floor(r * 5) * 2) + (FEMALE.has(name) ? 0 : 1)}`;
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

type Group = 'theatre' | 'music' | 'show' | 'exhibit' | 'tour' | 'kids' | 'workshop' | 'talk' | 'fest';
const groupOf = (e: EventItem): Group => {
  const k = `${e.kind} ${e.title}`.toLowerCase();
  if (/дет|малыш|щелкунчик для|игрушк/.test(k)) return 'kids';
  if (/мастер-класс|гончар|керамик|стекл|арт-терап|своими руками/.test(k)) return 'workshop';
  if (/лекци|квиз|дегустац/.test(k)) return 'talk';
  if (/экскурс|квест|прогулк|крыш/.test(k)) return 'tour';
  if (/выстав|музе|ван гог|фаберже|скульпт/.test(k)) return 'exhibit';
  if (/стендап|юмор|шоу|кино/.test(k)) return 'show';
  if (/ярмарк|фестив/.test(k)) return 'fest';
  if (/концерт|джаз|орган|рок|хор|романс|музык|симфон|электрон|рахманинов|dj|вокал/.test(k)) return 'music';
  return 'theatre';
};

const GOOD: Record<Group, string[]> = {
  theatre: ['Актёры играют так, что забываешь, что сидишь в зале. Второй акт особенно сильный — в зале стояла тишина.', 'Ходили вдвоём, остались под большим впечатлением. Декорации простые, но очень точные, а свет — отдельный персонаж.', 'Смеялись и плакали одновременно. Спасибо труппе — после спектакля ещё полчаса обсуждали его на набережной.'],
  music: ['Звук отличный, даже с последних рядов слышно каждую ноту. Программа составлена так, что два часа пролетели незаметно.', 'Мурашки с первой минуты. Музыканты явно получают удовольствие от игры — это передаётся залу.', 'Атмосфера тёплая, публика благодарная. Обязательно приду ещё раз с друзьями.'],
  show: ['Смеялись весь вечер! Шутки свежие, без пошлости, ведущий отлично работает с залом.', 'Отличный формат на вечер пятницы: легко, весело и не затянуто.', 'Пришли компанией — все довольны. Пара шуток про Петербург до сих пор цитируем.'],
  exhibit: ['Экспозиция продуманная, подписи понятные даже без аудиогида. Провели там два часа и не заметили.', 'Очень красиво и спокойно. Советую приходить в будни утром — людей почти нет.', 'Ходили с подругой, сделали кучу фотографий. Отдельный зал с инсталляцией — лучший.'],
  tour: ['Гид рассказывает живо и с юмором, узнали о городе то, чего нет в путеводителях.', 'Маршрут удобный, темп комфортный. Отличный способ увидеть знакомые места по-новому.', 'Взяли билеты спонтанно и не пожалели — лучшее, что было за выходные.'],
  kids: ['Ребёнку 6 лет — сидел не шелохнувшись, а потом пересказывал дома весь вечер. Спасибо!', 'Всё по возрасту, не затянуто, а в конце дети могли подойти к артистам. Очень тёплая атмосфера.', 'Брали с бабушкой и внуком — понравилось всем троим. Удобно, что начало в выходной днём.'],
  workshop: ['Мастер терпеливо объясняет каждому, даже у меня — человека с двумя левыми руками — всё получилось.', 'Уютно, всё подготовлено, материалы хорошие. Унесли домой свою работу и отличное настроение.', 'Пришли на свидание — идеальный формат: и пообщаться, и сделать что-то руками.'],
  talk: ['Лектор говорит просто о сложном, слушать одно удовольствие. Записала несколько книг на будущее.', 'Формат камерный, можно задать вопрос. Полтора часа пролетели незаметно.', 'Интересно, весело и с пользой. Буду следить за следующими встречами.'],
  fest: ['Много интересных мастеров, купили подарки близким. Удобно, что рядом есть где перекусить.', 'Атмосфера праздника, музыка, люди — прекрасно провели полдня.', 'Отличное место для прогулки на выходных, взяли детей — им тоже понравилось.'],
};
const MEH = ['В целом неплохо, но ожидал большего: местами затянуто, а в зале было душно.', 'Хорошая идея, но исполнение неровное. Первая часть понравилась больше второй.', 'Неплохо, но цена завышена. Сходить один раз можно.'];
const BAD = ['Не впечатлило: начали на 20 минут позже, а звук был так себе. Надеюсь, это разовая неудача.'];

/** Сколько отзывов у мероприятия: примерно у четверти — ни одного, у остальных 1–14. */
// популярные (баннеры, сторис, «По вашим интересам») — всегда с отзывами
const FEATURED = new Set([...BANNER_IDS, ...INTEREST_IDS, 'breath', 'roofs', 'dark-date', 'master']);
const countFor = (id: string) => { const r = rng(id + '#n')(); if (FEATURED.has(id)) return 4 + Math.floor(r * 10); return r < 0.25 ? 0 : r < 0.5 ? 1 + Math.floor(r * 8) % 3 : r < 0.8 ? 3 + Math.floor(r * 100) % 5 : 8 + Math.floor(r * 1000) % 7; };

const cache = new Map<string, Review[]>();
export function reviewsFor(eventId: string | undefined): Review[] {
  if (!eventId) return [];
  if (eventId === MAIN_EVENT_ID) return REVIEWS;
  const hit = cache.get(eventId); if (hit) return hit;
  const e = EVENTS.find((x) => x.id === eventId); if (!e) return [];
  const R = rng(eventId), g = groupOf(e), n = countFor(eventId);
  // фото — обложка мероприятия и обложки похожих мероприятий того же жанра
  const same = EVENTS.filter((x) => x.id !== e.id && groupOf(x) === g).map((x) => x.image);
  const pool = [...new Set([e.image, ...same])].slice(0, 4);
  const out: Review[] = [];
  for (let i = 0; i < n; i++) {
    const roll = R();
    const rating = roll < 0.06 ? 2 : roll < 0.22 ? 3 : roll < 0.5 ? 4 : 5;
    const text = rating >= 4 ? GOOD[g][Math.floor(R() * GOOD[g].length)] : rating === 3 ? MEH[Math.floor(R() * MEH.length)] : BAD[0];
    // даты отзывов — прошлые показы, от свежих к старым
    const d = new Date('2026-03-28T12:00:00'); d.setDate(d.getDate() - Math.floor(i * 9 + R() * 8));
    const iso = d.toISOString().slice(0, 10);
    const withPhoto = R() < 0.3;
    const name = NAMES[Math.floor(R() * NAMES.length)], start = Math.floor(R() * pool.length);
    out.push({ id: `${eventId}-r${i + 1}`, name, date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, dateISO: iso,
      rating, avatar: R() < 0.3 ? '' : avatarFor(name, R()), /* у части — без фото (буква имени) */ photos: withPhoto ? [pool[start], pool[(start + 1) % pool.length]].slice(0, 1 + Math.floor(R() * 2)).filter((x, k, a) => a.indexOf(x) === k) : [], text });
  }
  cache.set(eventId, out);
  return out;
}

/** Средняя оценка «4.6» или '' — если отзывов нет. */
export const ratingOf = (list: Review[]) => (list.length ? (Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10).toFixed(1) : '');
const plural = (n: number, one: string, few: string, many: string) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many; };
export const reviewsWord = (n: number) => `${n} ${plural(n, 'отзыв', 'отзыва', 'отзывов')}`;
/** Фото отзывов мероприятия подряд — для галереи. */
export const reviewPhotosFor = (eventId: string | undefined) => reviewsFor(eventId).flatMap((r) => r.photos.map((src) => ({ src, review: r })));
/** Для полоски на странице мероприятия — без повторов одной картинки. */
export const reviewPhotosUnique = (eventId: string | undefined) => reviewPhotosFor(eventId).filter((p, k, a) => a.findIndex((x) => x.src === p.src) === k);

// рейтинг в карточках везде = средняя по отзывам; без отзывов — без рейтинга
for (const e of EVENTS) e.rating = ratingOf(reviewsFor(e.id));

/** Свой отзыв в формате ленты: имя из профиля, аватар профиля. */
export const myReviewCard = (m: MyReview, user: Profile['user']): Review => {
  const d = new Date(`${m.dateISO}T12:00:00`);
  return { id: `mine-${m.eventId}`, name: `${user.name} ${user.surname.slice(0, 1)}.`.trim(), date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, dateISO: m.dateISO, rating: m.rating, avatar: 'avatar', text: m.text, photos: m.photos };
};
/** Отзывы мероприятия вместе со своим (первым): лента, средняя оценка, фото — для страницы события, всех отзывов и галереи. */
export function useReviews(eventId: string | undefined) {
  const { state } = useStore();
  const mine = eventId ? state.myReviews[eventId] : undefined;
  const list = mine ? [myReviewCard(mine, state.profile.user), ...reviewsFor(eventId)] : reviewsFor(eventId);
  const photos = list.flatMap((r) => r.photos.map((src) => ({ src, review: r })));
  return { list, mine, avg: ratingOf(list), photos, uniquePhotos: photos.filter((p, k, a) => a.findIndex((x) => x.src === p.src) === k) };
}
