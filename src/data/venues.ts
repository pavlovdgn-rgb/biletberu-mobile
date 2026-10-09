import type { IconName } from '../components';
import { EVENTS, MAIN_EVENT_ID, type EventItem } from './mock';
import { VENUES, type Venue } from './people';

/** Площадки всех мероприятий: Театр новой комедии — из макетов, остальные собраны из данных мероприятий (название, адрес, афиша)
 *  и типа площадки (фото, часы, описание, удобства). Добавляются в общий `VENUES`, поэтому `venueById` находит любую. */

type Kind = 'theatre' | 'museum' | 'concert' | 'club' | 'loft' | 'studio' | 'open' | 'planetarium' | 'arena' | 'dk';
const kindOf = (name: string): Kind => {
  const n = name.toLowerCase();
  if (/планетари|купол/.test(n)) return 'planetarium';
  if (/ледов/.test(n)) return 'arena';
  if (/дк |дом культуры/.test(n + ' ')) return 'dk';
  if (/музе|эрмитаж|манеж|фаберже|спас на крови|арсенал|сенсориум/.test(n)) return 'museum';
  if (/филармони|капелл|камерный зал|особняк/.test(n)) return 'concert';
  if (/клуб|бар|лекторий|гастрокафе|джаз/.test(n)) return 'club';
  if (/студи|мастерск|гончар|стекол/.test(n)) return 'studio';
  if (/площад|голланди|севкабель|бюро|квест/.test(n)) return 'open';
  if (/лофт|арт-|пространств/.test(n)) return 'loft';
  return 'theatre';
};

const KIND: Record<Kind, { photo: string; hours: string; title: string; features: Array<[IconName, string]>; about: (n: string) => string; tips: string }> = {
  theatre: { photo: 'venue-theatre', hours: 'пн-вс 11:00-22:00, касса', title: 'Что есть в театре:', features: [['wheelchair', 'Доступная среда'], ['hanger', 'Гардероб'], ['dining', 'Буфет'], ['taxi', 'Парковка']],
    about: (n) => `${n} — одна из заметных сцен Петербурга: классика и современная драматургия, камерный зал, где хорошо видно с любого места.\nВ фойе работает буфет, перед спектаклем можно выпить кофе и рассмотреть фотографии из истории театра.`, tips: 'Приходите за 15 минут до начала\nПоказывайте QR-код с экрана телефона\nБилет офлайн: сделайте скрин заранее\nВозврат: за 24 часа' },
  museum: { photo: 'venue-museum', hours: 'вт-вс 10:30-18:00, ср до 21:00', title: 'Что есть в музее:', features: [['wheelchair', 'Доступная среда'], ['hanger', 'Гардероб'], ['dining', 'Кафе'], ['info-circle', 'Аудиогид']],
    about: (n) => `${n} — постоянная экспозиция и сменные выставки в исторических залах.\nНа экскурсии и выставки удобнее приходить в будни утром — меньше людей.`, tips: 'Вход по билету с QR-кодом\nКрупные сумки — в гардероб\nФотографировать можно без вспышки\nВозврат: за 24 часа' },
  concert: { photo: 'venue-concert', hours: 'касса пн-вс 11:00-20:00', title: 'Что есть в зале:', features: [['wheelchair', 'Доступная среда'], ['hanger', 'Гардероб'], ['dining', 'Буфет'], ['taxi', 'Парковка рядом']],
    about: (n) => `${n} — зал с отличной акустикой для камерной и симфонической музыки.\nДвери открываются за час до начала, в антракте работает буфет.`, tips: 'Приходите за 20 минут до начала\nОпоздавших пускают в антракте\nПоказывайте QR-код с экрана телефона\nВозврат: за 24 часа' },
  club: { photo: 'venue-club', hours: 'пн-вс 18:00-02:00', title: 'Что есть на площадке:', features: [['dining', 'Бар и кухня'], ['hanger', 'Гардероб'], ['ticket', 'Столики по билетам']],
    about: (n) => `${n} — камерная площадка с баром: концерты, стендап и лекции в неформальной атмосфере.\nСтолики рассаживают по порядку прихода — приходите заранее.`, tips: 'Вход 18+ по документу\nПриходите за 30 минут — займите столик\nПоказывайте QR-код на входе\nВозврат: за 48 часов' },
  loft: { photo: 'venue-loft', hours: 'пн-вс 12:00-23:00', title: 'Что есть на площадке:', features: [['dining', 'Кафе'], ['wheelchair', 'Доступная среда'], ['taxi', 'Парковка']],
    about: (n) => `${n} — арт-пространство в бывшем промышленном здании: выставки, маркеты и спектакли в необычном формате.\nВнутри кафе и зона отдыха, по выходным — маркет локальных брендов.`, tips: 'Вход по QR-коду\nОдежду можно оставить в гардеробе\nВозврат: за 24 часа' },
  studio: { photo: 'venue-studio', hours: 'пн-вс 11:00-21:00, по записи', title: 'Что есть в студии:', features: [['hanger', 'Фартуки и гардероб'], ['dining', 'Чай и кофе'], ['info-circle', 'Все материалы включены']],
    about: (n) => `${n} — творческая мастерская для занятий в небольших группах.\nМастер работает с каждым, опыт не нужен; работы можно забрать с собой.`, tips: 'Приходите в удобной одежде\nНачало минута в минуту — не опаздывайте\nПеренос: за 24 часа' },
  open: { photo: 'venue-open', hours: 'открыто ежедневно', title: 'Что есть на площадке:', features: [['dining', 'Фудкорт'], ['wheelchair', 'Доступная среда'], ['taxi', 'Парковка рядом']],
    about: (n) => `${n} — открытое городское пространство: летом здесь фестивали, ярмарки и прогулки у воды.\nОдевайтесь по погоде — часть программы проходит на улице.`, tips: 'Сбор у входа за 10 минут до начала\nОдевайтесь по погоде\nПоказывайте QR-код организатору\nВозврат: за 24 часа' },
  planetarium: { photo: 'venue-planetarium', hours: 'пн-вс 10:00-22:00', title: 'Что есть в планетарии:', features: [['wheelchair', 'Доступная среда'], ['hanger', 'Гардероб'], ['dining', 'Кафе']],
    about: (n) => `${n} — купольный зал с полноформатной проекцией звёздного неба: научные шоу и концерты под звёздами.\nКресла откидываются — смотреть удобно всем.`, tips: 'Вход в зал закрывается со стартом сеанса\nДетям до 6 лет — с родителями\nВозврат: за 24 часа' },
  arena: { photo: 'venue-arena', hours: 'касса пн-вс 10:00-20:00', title: 'Что есть на арене:', features: [['wheelchair', 'Доступная среда'], ['hanger', 'Гардероб'], ['dining', 'Фудкорт'], ['taxi', 'Парковка']],
    about: (n) => `${n} — большая арена для ледовых шоу и концертов.\nВходов несколько — смотрите сектор в билете, чтобы не обходить здание.`, tips: 'Приходите за 40 минут — досмотр на входе\nСектор и ряд — в билете\nВозврат: за 72 часа' },
  dk: { photo: 'venue-concert', hours: 'касса пн-вс 12:00-20:00', title: 'Что есть в ДК:', features: [['wheelchair', 'Доступная среда'], ['hanger', 'Гардероб'], ['dining', 'Буфет'], ['taxi', 'Парковка']],
    about: (n) => `${n} — исторический дворец культуры с большим зрительным залом: стендап, спектакли и концерты.\nЗал вместительный, но хорошо видно с любого места.`, tips: 'Приходите за 15 минут до начала\nПоказывайте QR-код с экрана телефона\nВозврат: за 24 часа' },
};

const TR: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya' };
const slug = (s: string) => s.toLowerCase().split('').map((c) => TR[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export type VenueInfo = Venue & { kind: Kind; features: Array<[IconName, string]>; featuresTitle: string; tips: string };
const MAIN_PLACE = 'Санкт-Петербургский театр новой комедии';
const byPlace = new Map<string, VenueInfo>();
// театр новой комедии — карточка из макетов
const comedy = VENUES.find((v) => v.id === 'new-comedy')!;
byPlace.set(MAIN_PLACE, { ...comedy, events: [...new Set([...comedy.events, ...EVENTS.filter((e) => e.place === MAIN_PLACE).map((e) => e.id)])], kind: 'theatre', features: KIND.theatre.features, featuresTitle: KIND.theatre.title, tips: KIND.theatre.tips });
for (const e of EVENTS) {
  if (byPlace.has(e.place)) { const v = byPlace.get(e.place)!; if (!v.events.includes(e.id)) v.events.push(e.id); continue; }
  const k = kindOf(e.place), K = KIND[k];
  const v: VenueInfo = { id: slug(e.place), name: e.place, fullName: e.place, address: e.address, hours: K.hours, image: K.photo, thumb: K.photo, about: K.about(e.place), events: [e.id],
    kind: k, features: K.features, featuresTitle: K.title, tips: K.tips };
  byPlace.set(e.place, v);
  VENUES.push(v);
}
const comedyIdx = VENUES.findIndex((v) => v.id === 'new-comedy'); VENUES[comedyIdx] = byPlace.get(MAIN_PLACE)!;

/** Площадка мероприятия. */
export const venueOf = (e: EventItem): VenueInfo => byPlace.get(e.place) ?? byPlace.get(MAIN_PLACE)!;
export const isMainVenue = (e: EventItem) => e.id === MAIN_EVENT_ID || e.place === MAIN_PLACE;
