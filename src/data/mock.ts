import { MORE_PLACES, THEATRE_GEO, metersBetween, walkMin } from './places-more';
/** Мок-данные «Билет Беру». Не бэкенд: всё живёт в коде, изменения — в сторе (`store.tsx`). */

export type EventItem = {
  id: string; title: string; kind: string; date: string; dateISO: string; time: string; place: string; address: string;
  priceFrom: number; priceTo?: number; age: string; rating: string; discount?: string; image: string; pushkin?: boolean;
};
export type Place = { id: string; name: string; time: string; category: string; image: string };

/** Главное событие кейса — у него полная карточка, схема зала и план дня. */
export const MAIN_EVENT_ID = 'weekend';

export const EVENTS: EventItem[] = [
  { id: MAIN_EVENT_ID, title: 'Спектакль «Выходные без телефона: Моменты без лайков»', kind: 'Театр', date: '25 апреля', dateISO: '2026-04-25', time: '18:00', place: 'Санкт-Петербургский театр новой комедии', address: 'Большая Морская улица, 14 к.2', priceFrom: 1000, priceTo: 3500, age: '18+', rating: '4.9', image: 'banner-3' },
  { id: 'culture', title: 'Культурная подборка', kind: 'Выставка', date: '20 апреля', dateISO: '2026-04-20', time: '11:00', place: 'Русский музей', address: 'Инженерная ул., 4', priceFrom: 500, age: '12+', rating: '4.7', image: 'banner-1', pushkin: true },
  { id: 'master', title: 'Мастер и Маргарита', kind: 'Театр', date: '29 апреля', dateISO: '2026-04-29', time: '20:00', place: 'Мариинский театр', address: 'Театральная пл., 1', priceFrom: 2000, priceTo: 6000, age: '6+', rating: '4.8', image: 'banner-2', pushkin: true },
  { id: 'breath', title: 'Музыка в дыхание', kind: 'Концерт', date: '30 апреля', dateISO: '2026-04-30', time: '20:00', place: 'Капелла', address: 'наб. реки Мойки, 20', priceFrom: 1200, age: '12+', rating: '4.6', image: 'banner-0' },
  { id: 'museum-kids', title: 'Интерактивная экскурсия по одному из главных музеев страны для детей', kind: 'Экскурсия', date: '24 апреля', dateISO: '2026-04-24', time: '11:00', place: 'Дворцовая площадь', address: 'Дворцовая пл., 2', priceFrom: 100, priceTo: 2000, age: '6+', rating: '4.5', image: 'vcard-0', pushkin: true },
  { id: 'sevcable', title: 'Интерактивная экскурсия по Севкабель Порту', kind: 'Экскурсия', date: '20 апреля', dateISO: '2026-04-20', time: '16:00', place: 'Новая Голландия', address: 'наб. Адмиралтейского канала, 2', priceFrom: 1200, age: '12+', rating: '4.5', image: 'vcard-1' },
  { id: 'new-square', title: 'Экскурсия «Тайны Новой площади»', kind: 'Экскурсия', date: '14 апреля', dateISO: '2026-04-14', time: '11:00', place: 'Арт-пространство «Новая площадь»', address: 'Исаакиевская пл., 11', priceFrom: 100, priceTo: 1000, age: '6+', rating: '4.4', image: 'vcard-2' },
  { id: 'central', title: 'Прогулка-квест по Центральной площади', kind: 'Экскурсия', date: '15 апреля', dateISO: '2026-04-15', time: '11:00', place: 'Квест-клуб «Центральный»', address: 'Казанская ул., 3', priceFrom: 100, priceTo: 1000, age: '12+', rating: '4.3', image: 'vcard-3' },
  { id: 'nevsky', title: 'Лекция «Невский проспект: история фасадов»', kind: 'Лекция', date: '12 апреля', dateISO: '2026-04-12', time: '14:00', place: 'Лекторий «Невский, 33»', address: 'Невский просп., 33', priceFrom: 1000, age: '12+', rating: '4.6', image: 'vcard-4' },
  { id: 'graffiti', title: 'Фестиваль уличного искусства и граффити', kind: 'Шоу', date: '2 мая', dateISO: '2026-05-02', time: '16:00', place: 'Дворцовая площадь', address: 'Дворцовая пл., 2', priceFrom: 800, age: '0+', rating: '4.5', discount: '-20%', image: 'hcard-0' },
  { id: 'chamber', title: 'Концерт камерной музыки в историческом особняке', kind: 'Концерт', date: '12 мая', dateISO: '2026-05-12', time: '19:00', place: 'Особняк Кочневой', address: 'Английская наб., 28', priceFrom: 1500, age: '12+', rating: '4.8', discount: '-10%', image: 'hcard-1', pushkin: true },
  { id: 'sensors', title: 'Планета световых сенсоров: приключение в мире интерактива', kind: 'Выставка', date: '13 мая', dateISO: '2026-05-13', time: '11:00', place: 'Музей «Сенсориум»', address: 'Большая Конюшенная ул., 13', priceFrom: 700, age: '6+', rating: '4.4', discount: '-10%', image: 'hcard-2' },
  { id: 'glass', title: 'Огненное ремесло: тайна стеклодува', kind: 'Семинар', date: '14 мая', dateISO: '2026-05-14', time: '12:00', place: 'Стекольная мастерская «Огонь»', address: 'Гороховая ул., 34', priceFrom: 1000, age: '6+', rating: '4.7', discount: '-20%', image: 'hcard-3' },
  { id: 'ambient', title: 'DJ-сет в стиле эмбиент в лофте', kind: 'Концерт', date: '16 мая', dateISO: '2026-05-16', time: '13:00', place: 'Лофт «Высота»', address: 'наб. реки Мойки, 82', priceFrom: 1000, age: '18+', rating: '4.5', discount: '-10%', image: 'hcard-4' },
  { id: 'ballet', title: 'Двое в танце: вечер балетной миниатюры', kind: 'Театр', date: '13 мая', dateISO: '2026-05-13', time: '13:00', place: 'Театр балета «Миниатюра»', address: 'Почтамтский пер., 4', priceFrom: 1000, age: '12+', rating: '4.9', discount: '-30%', image: 'hcard-5', pushkin: true },
  { id: 'unity', title: 'Всеобщее единение: фестиваль музыки и света', kind: 'Концерт', date: '14 мая', dateISO: '2026-05-14', time: '12:00', place: 'Пространство «Единение»', address: 'Конюшенная пл., 2', priceFrom: 1800, age: '18+', rating: '4.3', discount: '-20%', image: 'hcard-6' },
  { id: 'dark-humor', title: 'Вечер чёрного юмора «Тёмная сторона для двоих»', kind: 'Шоу', date: '13 мая', dateISO: '2026-05-13', time: '11:00', place: 'Клуб «Тёмная сторона»', address: 'Думская ул., 9', priceFrom: 900, age: '18+', rating: '4.2', discount: '-10%', image: 'hcard-7' },
  { id: 'cinema', title: 'Кинопоказ под открытым небом с дискуссией', kind: 'Лекция', date: '28 мая', dateISO: '2026-05-28', time: '20:00', place: 'Манеж', address: 'Исаакиевская пл., 1', priceFrom: 600, age: '18+', rating: '4.6', discount: '-20%', image: 'hcard-8' },
  { id: 'silence', title: 'Под аккомпанемент тишины: вокал и фортепиано', kind: 'Концерт', date: '12 мая', dateISO: '2026-05-12', time: '12:00', place: 'Камерный зал «Тишина»', address: 'ул. Ломоносова, 32', priceFrom: 1200, age: '12+', rating: '4.7', discount: '-10%', image: 'hcard-9', pushkin: true },
  { id: 'sculpture', title: 'Экскурсия по залам скульптуры', kind: 'Музеи', date: '6 мая', dateISO: '2026-05-06', time: '15:00', place: 'Музей скульптуры', address: 'Почтамтская ул., 9', priceFrom: 400, age: '6+', rating: '4.5', discount: '-20%', image: 'hcard-10', pushkin: true },
  { id: 'shards', title: 'Осколки зеркала', kind: 'Театр', date: '9 апреля', dateISO: '2026-04-09', time: '19:00', place: 'Санкт-Петербургский театр новой комедии', address: 'Большая Морская улица, 14 к.2', priceFrom: 1500, age: '12+', rating: '4.5', discount: '-20%', image: 'pcard-0' },
  { id: 'north-train', title: 'Последний поезд на север', kind: 'Театр', date: '5 мая', dateISO: '2026-05-05', time: '19:00', place: 'Санкт-Петербургский театр новой комедии', address: 'Большая Морская улица, 14 к.2', priceFrom: 1000, age: '18+', rating: '4.9', discount: '-20%', image: 'pcard-1' },
  { id: 'after-rain', title: 'Тишина после дождя', kind: 'Театр', date: '12 мая', dateISO: '2026-05-12', time: '19:00', place: 'Санкт-Петербургский театр новой комедии', address: 'Большая Морская улица, 14 к.2', priceFrom: 100, priceTo: 1000, age: '12+', rating: '4.3', discount: '-20%', image: 'pcard-2' },
  { id: 'old-letter', title: 'Тень забытого письма', kind: 'Театр', date: '15 мая', dateISO: '2026-05-15', time: '18:00', place: 'Санкт-Петербургский театр новой комедии', address: 'Большая Морская улица, 14 к.2', priceFrom: 2000, age: '12+', rating: '4.8', discount: '-20%', image: 'pcard-3' },
  { id: 'balcony', title: 'Балкон над пропастью', kind: 'Театр', date: '9 апреля', dateISO: '2026-04-09', time: '19:00', place: 'Санкт-Петербургский театр новой комедии', address: 'Большая Морская улица, 14 к.2', priceFrom: 2500, age: '18+', rating: '4.9', discount: '-10%', image: 'pcard-4' },
  { id: 'hide-seek', title: 'Игра в прятки со временем', kind: 'Театр', date: '5 мая', dateISO: '2026-05-05', time: '19:00', place: 'Санкт-Петербургский театр новой комедии', address: 'Большая Морская улица, 14 к.2', priceFrom: 1500, age: '12+', rating: '4.8', image: 'pcard-5' },
  { id: 'roofs', title: 'Экскурсия по крышам', kind: 'Экскурсия', date: '2 мая', dateISO: '2026-05-02', time: '19:00', place: 'Экскурсионное бюро «Крыши Петербурга»', address: 'Невский просп., 33', priceFrom: 1800, age: '12+', rating: '4.8', image: 'storybg-3' },
  { id: 'dark-date', title: 'Свидание в темноте', kind: 'Шоу', date: '9 мая', dateISO: '2026-05-09', time: '20:00', place: 'Пространство «Темнота»', address: 'Садовая ул., 26', priceFrom: 2200, age: '18+', rating: '4.7', image: 'storybg-4' },
  { id: 'jazz', title: 'Джаз на двоих: вечер импровизации', kind: 'Концерт', date: '8 мая', dateISO: '2026-05-08', time: '10:00', place: 'Джаз-клуб «Грибоедов»', address: 'наб. канала Грибоедова, 30', priceFrom: 1500, age: '12+', rating: '4.8', discount: '-5%', image: 'hcard-11' },
  // 2026-10-06: расширенная афиша — новые типы из полного списка тегов фильтра и площадки из шторки «Все»
  { id: 'manege-gogh', title: 'Цифровой Ван Гог: выставка-погружение', kind: 'Выставка', date: '22 апреля', dateISO: '2026-04-22', time: '11:00', place: 'Манеж', address: 'Исаакиевская пл., 1', priceFrom: 900, age: '6+', rating: '4.6', image: 'hcard-2', pushkin: true },
  { id: 'art-lecture', title: 'Лекция «Как смотреть современное искусство»', kind: 'Лекция', date: '6 апреля', dateISO: '2026-04-06', time: '19:00', place: 'Русский музей', address: 'Инженерная ул., 4', priceFrom: 500, age: '12+', rating: '4.7', image: 'vcard-0', pushkin: true },
  { id: 'faberge', title: 'Сокровища Фаберже: экскурсия по залам', kind: 'Музеи', date: '23 апреля', dateISO: '2026-04-23', time: '10:00', place: 'Музей Фаберже', address: 'наб. реки Фонтанки, 21', priceFrom: 600, age: '6+', rating: '4.8', image: 'vcard-2', pushkin: true },
  { id: 'standup', title: 'Большой стендап: проверка нового материала', kind: 'Стендап', date: '2 апреля', dateISO: '2026-04-02', time: '20:00', place: 'Дом культуры «Невский»', address: 'Невский пр., 39', priceFrom: 1500, age: '18+', rating: '4.5', discount: '-15%', image: 'hcard-7' },
  { id: 'planetarium-techno', title: 'Электроника под куполом планетария', kind: 'Электронная музыка', date: '3 апреля', dateISO: '2026-04-03', time: '22:00', place: 'Купол «Звезда»', address: 'Большая Морская ул., 32', priceFrom: 1600, age: '18+', rating: '4.7', image: 'hcard-6' },
  { id: 'twelfth-night', title: 'Спектакль «Двенадцатая ночь»', kind: 'Театр', date: '24 апреля', dateISO: '2026-04-24', time: '19:00', place: 'Санкт-Петербургский театр новой комедии', address: 'Большая Морская улица, 14 к.2', priceFrom: 1200, age: '16+', rating: '4.6', image: 'pcard-0' },
  { id: 'jazz-water', title: 'Ночь джаза у воды', kind: 'Джаз', date: '3 апреля', dateISO: '2026-04-03', time: '21:00', place: 'Новая Голландия', address: 'наб. Адмиралтейского канала, 2', priceFrom: 1200, age: '16+', rating: '4.8', image: 'hcard-11' },
  { id: 'hermitage-night', title: 'Ночь в Эрмитаже: экскурсия при свечах', kind: 'Экскурсия', date: '25 апреля', dateISO: '2026-04-25', time: '21:00', place: 'Эрмитаж', address: 'Дворцовая пл., 2', priceFrom: 2200, age: '12+', rating: '4.9', image: 'vcard-3' },
  { id: 'spring-fair', title: 'Весенняя ярмарка мастеров', kind: 'Ярмарка', date: '4 апреля', dateISO: '2026-04-04', time: '12:00', place: 'Новая Голландия', address: 'наб. Адмиралтейского канала, 2', priceFrom: 300, age: '0+', rating: '4.4', image: 'hcard-0' },
  { id: 'giselle', title: 'Балет «Жизель»', kind: 'Балет', date: '26 апреля', dateISO: '2026-04-26', time: '19:00', place: 'Мариинский театр', address: 'Театральная пл., 1', priceFrom: 2500, priceTo: 9000, age: '12+', rating: '4.9', image: 'banner-1', pushkin: true },
  { id: 'nutcracker-kids', title: 'Щелкунчик для малышей', kind: 'Детский спектакль', date: '4 апреля', dateISO: '2026-04-04', time: '12:00', place: 'БДТ им. Товстоногова', address: 'наб. реки Фонтанки, 65', priceFrom: 800, age: '0+', rating: '4.8', image: 'gallery-3' },
  { id: 'pottery-duo', title: 'Гончарный круг для двоих', kind: 'Мастер-класс', date: '4 апреля', dateISO: '2026-04-04', time: '15:00', place: 'Новая Голландия', address: 'наб. Адмиралтейского канала, 2', priceFrom: 2500, age: '12+', rating: '4.7', discount: '-10%', image: 'hcard-3' },
  { id: 'rachmaninov', title: 'Рахманинов. Второй фортепианный концерт', kind: 'Классическая музыка', date: '27 апреля', dateISO: '2026-04-27', time: '19:00', place: 'Филармония', address: 'Михайловская ул., 2', priceFrom: 1800, priceTo: 6500, age: '6+', rating: '4.9', image: 'hcard-1', pushkin: true },
  { id: 'spas-quest', title: 'Квест «Тайны Спаса на Крови»', kind: 'Квест', date: '6 апреля', dateISO: '2026-04-06', time: '16:00', place: 'Спас на Крови', address: 'наб. канала Грибоедова, 2Б', priceFrom: 1300, age: '12+', rating: '4.5', image: 'vcard-4' },
  { id: 'organ-candles', title: 'Орган при свечах', kind: 'Классическая музыка', date: '7 апреля', dateISO: '2026-04-07', time: '20:00', place: 'Капелла', address: 'наб. реки Мойки, 20', priceFrom: 1400, age: '6+', rating: '4.8', image: 'banner-0', pushkin: true },
  { id: 'retro-cinema', title: 'Ретро-кино под звёздами', kind: 'Кинопоказ', date: '8 апреля', dateISO: '2026-04-08', time: '21:00', place: 'Манеж', address: 'Исаакиевская пл., 1', priceFrom: 700, age: '16+', rating: '4.4', discount: '-20%', image: 'hcard-8' },
  { id: 'queen-spades', title: 'Иммерсивный спектакль «Пиковая дама»', kind: 'Иммерсивный театр', date: '10 апреля', dateISO: '2026-04-10', time: '20:00', place: 'Александринский театр', address: 'пл. Островского, 6', priceFrom: 3500, age: '18+', rating: '4.9', image: 'storybg-4' },
  { id: 'chicago', title: 'Мюзикл «Чикаго»', kind: 'Мюзикл', date: '1 мая', dateISO: '2026-05-01', time: '19:00', place: 'Дом культуры «Невский»', address: 'Невский пр., 39', priceFrom: 2800, priceTo: 8000, age: '16+', rating: '4.7', image: 'pcard-4' },
  { id: 'light-fest', title: 'Фестиваль света на Новой Голландии', kind: 'Фестиваль', date: '10 апреля', dateISO: '2026-04-10', time: '21:00', place: 'Новая Голландия', address: 'наб. Адмиралтейского канала, 2', priceFrom: 500, age: '0+', rating: '4.6', image: 'hcard-6' },
  { id: 'swan-lake', title: 'Балет «Лебединое озеро»', kind: 'Балет', date: '2 мая', dateISO: '2026-05-02', time: '19:00', place: 'Михайловский театр', address: 'пл. Искусств, 1', priceFrom: 3500, priceTo: 12000, age: '6+', rating: '5.0', image: 'hcard-5', pushkin: true },
  { id: 'ice-show', title: 'Ледовое шоу «Спящая красавица»', kind: 'Спорт', date: '2 мая', dateISO: '2026-05-02', time: '18:00', place: 'Новая Голландия', address: 'наб. Адмиралтейского канала, 2', priceFrom: 2500, age: '0+', rating: '4.6', image: 'storybg-3' },
  { id: 'rock-holland', title: 'Рок у Новой Голландии', kind: 'Рок', date: '10 апреля', dateISO: '2026-04-10', time: '18:00', place: 'Новая Голландия', address: 'наб. Адмиралтейского канала, 2', priceFrom: 2000, age: '16+', rating: '4.5', image: 'storybg-1' },
  { id: 'carmen', title: 'Опера «Кармен»', kind: 'Опера', date: '9 мая', dateISO: '2026-05-09', time: '19:00', place: 'Мариинский театр', address: 'Театральная пл., 1', priceFrom: 3000, priceTo: 11000, age: '12+', rating: '4.8', image: 'pcard-3', pushkin: true },
  { id: 'onegin', title: 'Опера «Евгений Онегин»', kind: 'Опера', date: '16 мая', dateISO: '2026-05-16', time: '19:00', place: 'Михайловский театр', address: 'пл. Искусств, 1', priceFrom: 2500, priceTo: 9500, age: '12+', rating: '4.9', image: 'pcard-5', pushkin: true },
  // 2026-10-06: карточки из «Песочницы» (299:34999) — фото выгружены как ncard-0…10
  { id: 'stars-roof', title: 'Звёздные скопления. Лекция с выходом на крышу', kind: 'Лекция', date: '27 апреля', dateISO: '2026-04-27', time: '21:00', place: 'Купол «Звезда»', address: 'Большая Морская ул., 32', priceFrom: 1000, age: '12+', rating: '4.5', discount: '-20%', image: 'ncard-0' },
  { id: 'crafts-fair', title: 'Ярмарка народных ремёсел с мастер-классами', kind: 'Ярмарка', date: '5 апреля', dateISO: '2026-04-05', time: '11:00', place: 'Арт-кластер «Мойка»', address: 'наб. реки Мойки, 59', priceFrom: 500, age: '6+', rating: '4.5', discount: '-20%', image: 'ncard-1' },
  { id: 'ballet-minis', title: 'Вечер балетных миниатюр: одна история – один танец', kind: 'Балет', date: '28 апреля', dateISO: '2026-04-28', time: '19:00', place: 'Театр «Галерный»', address: 'Галерная ул., 33', priceFrom: 100, priceTo: 1500, age: '12+', rating: '4.5', discount: '-20%', image: 'ncard-2', pushkin: true },
  { id: 'ceramics', title: 'Мастер-класс по созданию керамики', kind: 'Мастер-класс', date: '25 апреля', dateISO: '2026-04-25', time: '13:00', place: 'Гончарная студия «Глина»', address: 'наб. реки Мойки, 102', priceFrom: 800, age: '6+', rating: '4.7', discount: '-10%', image: 'ncard-3' },
  { id: 'pop-quiz', title: 'Квиз «Поп-культура vs Классика»', kind: 'Шоу', date: '8 апреля', dateISO: '2026-04-08', time: '19:30', place: 'Бар-лекторий «Ломоносов»', address: 'ул. Ломоносова, 32', priceFrom: 800, age: '12+', rating: '4.3', discount: '-20%', image: 'ncard-4' },
  { id: 'toy-diy', title: 'Игрушка своими руками: раскрашиваем и забираем домой', kind: 'Мастер-класс', date: '5 апреля', dateISO: '2026-04-05', time: '12:00', place: 'Детская студия «Канал»', address: 'наб. канала Грибоедова, 50', priceFrom: 600, age: '0+', rating: '4.5', discount: '-10%', image: 'ncard-5' },
  { id: 'choir', title: 'Хоровая симфония: от классики до современности', kind: 'Классическая музыка', date: '30 апреля', dateISO: '2026-04-30', time: '20:00', place: 'Пространство «Единение»', address: 'Конюшенная пл., 2', priceFrom: 800, age: '12+', rating: '4.5', discount: '-20%', image: 'ncard-6', pushkin: true },
  { id: 'food-lecture', title: 'Лекция-дегустация о региональной кухне', kind: 'Лекция', date: '2 апреля', dateISO: '2026-04-02', time: '18:00', place: 'Гастрокафе «Гороховая»', address: 'Гороховая ул., 15', priceFrom: 500, age: '12+', rating: '4.5', discount: '-20%', image: 'ncard-7' },
  { id: 'sculpture-2', title: 'Экскурсия по залам скульптуры: античность', kind: 'Экскурсия', date: '5 апреля', dateISO: '2026-04-05', time: '15:00', place: 'Музей скульптуры', address: 'Почтамтская ул., 9', priceFrom: 1500, age: '12+', rating: '4.5', discount: '-20%', image: 'ncard-8', pushkin: true },
  { id: 'romances', title: 'Вечер романсов в старинной гостиной', kind: 'Концерт', date: '7 апреля', dateISO: '2026-04-07', time: '19:00', place: 'Особняк на Галерной', address: 'Галерная ул., 33', priceFrom: 1600, age: '12+', rating: '4.5', discount: '-30%', image: 'ncard-9' },
  { id: 'sand-art', title: 'Арт-терапия и рисование песком', kind: 'Мастер-класс', date: '29 апреля', dateISO: '2026-04-29', time: '10:00', place: 'Театр балета «Миниатюра»', address: 'Почтамтский пер., 4', priceFrom: 600, age: '12+', rating: '4.5', discount: '-30%', image: 'ncard-10' },
];

export const BANNER_IDS = ['culture', 'master', MAIN_EVENT_ID, 'breath'];
export const INTEREST_IDS = ['museum-kids', 'sevcable', 'new-square', 'central', 'nevsky'];
export const COLLECTION_IDS = ['stars-roof', 'crafts-fair', 'ballet-minis', 'ceramics', 'pop-quiz', 'toy-diy', 'choir', 'food-lecture', 'romances', 'sand-art', 'sculpture-2',
  'giselle', 'standup', 'jazz-water', 'rachmaninov', 'chicago', 'spas-quest', 'retro-cinema', 'swan-lake', 'carmen', 'graffiti', 'chamber', 'sensors', 'glass', 'ambient', 'ballet', 'unity', 'dark-humor', 'cinema', 'silence', 'sculpture', 'jazz'];
export const STORIES = ['ТОП- концерты', 'Анонс выставок', 'ТОП- выходные', 'Для двоих', 'Премьеры'];
export const CATEGORIES = ['Экскурсии', 'Театры', 'Концерты', 'Детям', 'Выставки', 'Пушкинская карта'];
/** Тег главной → фильтр по событиям. */
export const CATEGORY_MATCH: Record<string, (e: EventItem) => boolean> = {
  'Экскурсии': (e) => ['Экскурсия', 'Квест'].includes(e.kind),
  'Театры': (e) => ['Театр', 'Балет', 'Опера', 'Мюзикл', 'Иммерсивный театр', 'Детский спектакль'].includes(e.kind),
  'Концерты': (e) => ['Концерт', 'Джаз', 'Классическая музыка', 'Рок', 'Электронная музыка'].includes(e.kind),
  'Детям': (e) => e.age === '0+' || e.age === '6+' || e.kind === 'Детский спектакль', 'Выставки': (e) => ['Выставка', 'Музеи'].includes(e.kind), 'Пушкинская карта': (e) => !!e.pushkin,
};

/** Ценовые категории схемы зала (1–5). */
export const SEAT_PRICES = [1000, 1500, 2000, 2500, 3500];
export const SEAT_ZONES = ['Балкон', 'Ложа', 'Бельэтаж', 'Амфитеатр', 'Партер'];
export const SERVICE_FEE = 50;
export const MAX_SEATS = 6;
export const BONUS_POINTS = 100;
export const PROMO_CODES: Record<string, number> = { BILET10: 0.1, KUDA20: 0.2 };

/** Места «Куда пойдём?» рядом с главным событием. */
export const PLACES: Place[] = [
  { id: 'nook', name: 'Кофейня Nook & Bean', time: '6 мин. до театра', category: 'Кафе', image: 'place-6' },
  { id: 'theatre', name: 'Выходные без телефона: Моменты без лайков', time: '3 мин. до метро', category: 'Театр', image: 'marker-1' },
  { id: 'peacock', name: 'Ресторан Алый павлин и золотой мандарин', time: '15 мин. до театра', category: 'Ресторан', image: 'place-7' },
  { id: 'mozz', name: 'Бар Mozz', time: '20 мин. до театра', category: 'Бары', image: 'place-0' },
  { id: 'platform', name: 'ТЦ «Платформа»', time: '15 мин. до театра', category: 'ТЦ', image: 'place-1' },
  { id: 'willow', name: 'Ресторан «Плакучая ива»', time: '15 мин. до театра', category: 'Ресторан', image: 'place-2' },
  { id: 'square', name: 'Кофейня Чёрный квадрат', time: '10 мин. до театра', category: 'Кафе', image: 'place-3' },
  { id: 'boat', name: 'Прогулка на катере', time: '3 мин. до театра', category: 'Парки', image: 'place-4' },
  { id: 'garden', name: 'Старый сад', time: '15 мин. до театра', category: 'Парки', image: 'place-5' },
  { id: 'russian', name: 'Ресторан русской кухни', time: '7 мин. до театра', category: 'Ресторан', image: 'place-8' },
  ...MORE_PLACES.map((p) => ({ id: p.id, name: p.name, time: `${walkMin(metersBetween(THEATRE_GEO, p.geo))} мин. до театра`, category: p.category, image: `act-${p.id}` })),
];
export const PLACE_FILTERS: Record<string, (p: Place) => boolean> = {
  'Все': () => true, 'Кафе': (p) => p.category === 'Кафе', 'Рестораны': (p) => p.category === 'Ресторан', 'Бары': (p) => p.category === 'Бары',
  'Дегустации': (p) => p.category === 'Дегустации', 'Парки': (p) => p.category === 'Парки', 'Досуг': (p) => p.category === 'Досуг', 'ТЦ и маркеты': (p) => p.category === 'ТЦ',
};

export const USER = { name: 'Александр', city: 'Санкт-Петербург' };

export const eventById = (id: string | null | undefined) => EVENTS.find((e) => e.id === id);
export const placeById = (id: string) => PLACES.find((p) => p.id === id);

/** 1500 → «1 500 ₽». */
export const rub = (n: number) => `${n.toLocaleString('ru-RU').replace(/ /g, ' ')} ₽`;
export const priceLabel = (e: EventItem) => (e.priceTo ? `от ${rub(e.priceFrom).replace(' ₽', '')} - ${rub(e.priceTo)}` : `от ${rub(e.priceFrom)}`);
/** «25 апреля, 18-00» как в карточках. */
export const whenLabel = (e: EventItem) => `${e.date}, ${e.time.replace(':', '-')}`;
const plural = (n: number, one: string, few: string, many: string) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many; };
export const ticketsWord = (n: number) => `${n} ${plural(n, 'билет', 'билета', 'билетов')}`;
export const eventsWord = (n: number) => `${n} ${plural(n, 'событие', 'события', 'событий')}`;
export const placesWord = (n: number) => `${n} ${plural(n, 'активность', 'активности', 'активностей')}`;
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
/** «2026-04-25» → { wd: 'сб', weekend: true }. */
export const weekday = (iso: string) => { const d = new Date(`${iso}T12:00:00`).getDay(); return { wd: WD[d], weekend: d === 0 || d === 6 }; };
export const CERTIFICATES: Record<string, number> = { 'GIFT-1000': 1000 };
export const spotsWord = (n: number) => `${n} ${plural(n, 'место', 'места', 'мест')}`;

/** Координаты мест рядом с театром (Большая Морская, 14) — для карты OSM. */
export const PLACE_GEO: Record<string, [number, number]> = {
  theatre: [59.93632, 30.31478],
  nook: [59.93515, 30.31705], square: [59.93745, 30.31865], peacock: [59.93395, 30.30985], willow: [59.93485, 30.30755],
  boat: [59.93555, 30.32035], garden: [59.93795, 30.30905], mozz: [59.93305, 30.32255], platform: [59.93655, 30.32275], russian: [59.93255, 30.31495],
  ...Object.fromEntries(MORE_PLACES.map((p) => [p.id, p.geo])),
};

/** Координаты площадок мероприятий в области карты (OSM, центр Петербурга). Площадки за её пределами — у театра: места рядом подобраны вокруг него. */
export const VENUE_GEO: Record<string, [number, number]> = {
  'Санкт-Петербургский театр новой комедии': PLACE_GEO.theatre,
  'Александринский театр': [59.9326, 30.3362], 'БДТ им. Товстоногова': [59.9295, 30.3398], 'Дворцовая площадь': [59.9390, 30.3158], 'Капелла': [59.9399, 30.3216],
  'Манеж': [59.9343, 30.3058], 'Мариинский театр': [59.9257, 30.2961], 'Михайловский театр': [59.9381, 30.3291], 'Новая Голландия': [59.9297, 30.2925],
  'Русский музей': [59.9386, 30.3323], 'Спас на Крови': [59.9400, 30.3289], 'Филармония': [59.9358, 30.3307], 'Эрмитаж': [59.9398, 30.3146],
  'Лекторий «Невский, 33»': [59.9349, 30.3290], 'Экскурсионное бюро «Крыши Петербурга»': [59.9349, 30.3290],
  // площадки прототипа — все в пределах карты центра
  'Дом культуры «Невский»': [59.9328, 30.3355],
  'Купол «Звезда»': [59.933, 30.3105],
  'Театр балета «Миниатюра»': [59.931, 30.306],
  'Пространство «Единение»': [59.9405, 30.3235],
  'Музей скульптуры': [59.9317, 30.3036],
  'Арт-пространство «Новая площадь»': [59.9325, 30.308],
  'Квест-клуб «Центральный»': [59.933, 30.32],
  'Особняк Кочневой': [59.933, 30.293],
  'Музей «Сенсориум»': [59.938, 30.324],
  'Стекольная мастерская «Огонь»': [59.9295, 30.3175],
  'Лофт «Высота»': [59.9318, 30.308],
  'Клуб «Тёмная сторона»': [59.933, 30.3285],
  'Пространство «Темнота»': [59.929, 30.3235],
  'Джаз-клуб «Грибоедов»': [59.9335, 30.3265],
  'Детская студия «Канал»': [59.93, 30.315],
  'Арт-кластер «Мойка»': [59.935, 30.317],
  'Театр «Галерный»': [59.933, 30.297],
  'Особняк на Галерной': [59.933, 30.297],
  'Гастрокафе «Гороховая»': [59.933, 30.314],
  'Музей Фаберже': [59.9339, 30.3392],
  'Камерный зал «Тишина»': [59.9300, 30.3350], 'Бар-лекторий «Ломоносов»': [59.9300, 30.3350], 'Гончарная студия «Глина»': [59.9295, 30.2955],
};
/** Где на карте площадка мероприятия; null — площадка за пределами карты (мест рядом с ней в приложении пока нет). */
export const eventGeo = (id: string | undefined): [number, number] | null => { const e = eventById(id); return (e && VENUE_GEO[e.place]) ?? null; };
const distM = ([a1, o1]: [number, number], [a2, o2]: [number, number]) => { const k = Math.PI / 180, x = (o2 - o1) * k * Math.cos(((a1 + a2) / 2) * k), y = (a2 - a1) * k; return Math.round(Math.hypot(x, y) * 6371000); };
export type NearPlace = Place & { meters: number };
/** Места рядом с точкой (площадкой мероприятия): по расстоянию, время пешком — до этой площадки. */
export function placesNear(geo: [number, number], isTheatre = false): NearPlace[] {
  return PLACES.filter((p) => p.id !== 'theatre' && PLACE_GEO[p.id]).map((p) => {
    const m = distM(geo, PLACE_GEO[p.id]);
    return { ...p, meters: m, time: `${Math.max(2, Math.round((m * 1.25) / 75))} мин. до ${isTheatre ? 'театра' : 'площадки'}` };
  }).sort((a, b) => a.meters - b.meters);
}

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const addDaysISO = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
/** «2026-05-08» → «8 мая». */
export const ruDate = (iso: string) => `${+iso.slice(8)} ${MONTHS_GEN[+iso.slice(5, 7) - 1]}`;
export type Session = { dateISO: string; time: string };
/** Сеансы мероприятия (Figma `179:16210` «Выберите дату»): основная дата и ещё три показа в ближайшие недели. */
export const sessionsOf = (e: EventItem): Session[] => [[0, e.time], [13, '19:00'], [19, e.time], [24, '19:00']]
  .map(([d, t]) => ({ dateISO: addDaysISO(e.dateISO, d as number), time: t as string }));
/** Мероприятие на конкретном сеансе — та же карточка с другой датой и временем. */
export const sessionEvent = (e: EventItem, s?: Partial<Session> | null): EventItem => (s?.dateISO ? { ...e, dateISO: s.dateISO, date: ruDate(s.dateISO), time: s.time ?? e.time } : e);
