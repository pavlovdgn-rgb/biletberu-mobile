import type { ComponentType } from 'react';
import { Main } from './main/Main';
import { OrderForm, OrderFormFilled } from './order-form/OrderForm';
import { Seats, SeatsConfirm, SeatsSelected } from './seats/Seats';
import { Plan, PlanAdd } from './plan/Plan';
import { Event } from './event/Event';
import { Filter } from './filter/Filter';
import { Payment } from './payment/Payment';
import { Done } from './done/Done';
import { Ticket } from './ticket/Ticket';
import { Tickets } from './tickets/Tickets';
import { Orders, Refund, RefundDone } from './refund/Refund';
import { Sessions } from './sessions/Sessions';
import { EventsList } from './events/EventsList';
import { Profile, ProfileData } from './profile/Profile';
import { NoTicket } from './no-ticket/NoTicket';
import { Favourites } from './favourites/Favourites';
import { FullMap, FullMapRoute } from './map/FullMap';
import { Activity, Person, Venue } from './detail/Detail';
import { Story } from './story/Story';
import { AllReviews, Gallery } from './reviews/Reviews';
import { ReviewForm } from './review/ReviewForm';

export type ScreenState = { id: string; name: string; route: string; component: ComponentType };
export type ScreenEntry = { id: string; name: string; description: string; route: string; /** Ссылка плитки индекса, если отличается от маршрута (демо-данные). */ link?: string; figma: string; component: ComponentType; states?: ScreenState[] };

/** Реестр экранов — единый источник для роутера и индекс-страницы. */
export const screens: ScreenEntry[] = [
  { id: 'main', name: 'Главная', description: 'Поиск, сторис, баннеры, категории, лента дат, «По вашим интересам», подборки событий', route: '/main', figma: '178:16210', component: Main },
  { id: 'events', name: 'Афиша площадки / персоны', description: '«Все» на странице площадки или персоны: все мероприятия списком, ближайшие первыми', route: '/events', link: '/events?venue=new-comedy', figma: '185:17924', component: EventsList },
  { id: 'filter', name: 'Фильтры', description: 'Дата, стоимость со шкалой, Пушкинская карта и скидки, категории, площадки', route: '/filter', figma: '178:17767', component: Filter },
  { id: 'event', name: 'Карточка события', description: 'Обложка, описание, отзывы, места рядом на карте, площадка, персоны, «Купить билет»', route: '/event', figma: '178:18849', component: Event },
  { id: 'sessions', name: 'Выбор даты', description: 'Карточка события и «Выберите дату»: сеансы с ценой → схема зала на выбранный сеанс', route: '/sessions', figma: '179:16210', component: Sessions },
  { id: 'seats', name: 'Выбор мест', description: 'Шапка спектакля, легенда цен, схема зала, масштаб, нижняя панель заказа', route: '/seats', figma: '179:16622', component: Seats,
    states: [{ id: 'confirm', name: 'выбор тарифа', route: '/seats/confirm', component: SeatsConfirm }, { id: 'selected', name: 'места выбраны', route: '/seats/selected', component: SeatsSelected }] },
  { id: 'order-form', name: 'Оформление заказа', description: 'Карточка события, данные покупателя (4 поля), итог и «Далее»', route: '/order-form', figma: '179:17059', component: OrderForm,
    states: [{ id: 'filled', name: 'заполнено', route: '/order-form/filled', component: OrderFormFilled }] },
  { id: 'payment', name: 'Оплата', description: 'Способ оплаты (СБП, карта), промокод, сертификат, баллы, сводка билетов', route: '/payment', link: '/payment?demo=1', figma: '179:17646', component: Payment },
  { id: 'done', name: 'Оплата прошла', description: 'Успешная оплата: итог заказа, подсказка о билетах, «Посмотреть билеты»', route: '/done', figma: '180:16409', component: Done },
  { id: 'profile', name: 'Профиль', description: 'Вариант «Персональный»: статистика, интересы, бюджет и расстояние для плана дня, покупки, уведомления, выход; без входа — гостевой профиль', route: '/profile', figma: '277:16501', component: Profile,
    states: [{ id: 'data', name: 'личные данные', route: '/profile/data', component: ProfileData }] },
  { id: 'tickets', name: 'Мои билеты', description: 'Список купленных: «Предстоящие / Прошедшие», сортировка шторкой, группы по датам, ближайшее событие крупно; тап — билеты на весь экран', route: '/tickets', figma: '326:16046', component: Tickets },
  { id: 'refund', name: 'Возврат билетов', description: 'Какие билеты вернуть, сумма по правилам возврата (удержание, сбор), куда и когда придут деньги, удалить план дня; подтверждение и «Заявка принята». Меньше 3 дней — шторка с правилами', route: '/refund', link: '/tickets', figma: '387:17904', component: Refund,
    states: [{ id: 'done', name: 'заявка принята', route: '/refund/done', component: RefundDone }] },
  { id: 'orders', name: 'История заказов', description: 'Профиль → «История заказов и возврат»: заказы со статусами (оплачен, возврат, прошло), «Вернуть билеты» у предстоящих', route: '/orders', figma: '387:18426', component: Orders },
  { id: 'ticket', name: 'Билет', description: 'Билеты события на весь экран (из «Моих билетов»): штрихкод, владелец, дата, тип/ряд/место, календарь и «Поделиться»', route: '/ticket', figma: '180:16493', component: Ticket },
  { id: 'no-ticket', name: 'Куда пойдём — нет билетов', description: 'Лента дат, пустое состояние «Нет купленных билетов»', route: '/no-ticket', figma: '180:16711', component: NoTicket },
  { id: 'plan', name: 'План дня', description: 'Лента дат, плашка дня, рекомендации, точки плана, маршрут на карте', route: '/plan', figma: '180:18117', component: Plan,
    states: [{ id: 'add', name: 'добавить места', route: '/plan/add', component: PlanAdd }] },
  { id: 'map', name: 'Карта', description: 'Карта на весь экран: места рядом с событием с фильтром категорий; маршрут плана дня', route: '/map', figma: '185:17253', component: FullMap,
    states: [{ id: 'route', name: 'маршрут дня', route: '/map/route', component: FullMapRoute }] },
  { id: 'story', name: 'Сторис', description: 'Пять слайдов на весь экран: прогресс, тап вперёд/назад, пауза удержанием, «Купить билет»', route: '/story', link: '/story?i=2', figma: '184:16181', component: Story },
  { id: 'gallery', name: 'Фото отзывов', description: 'Галерея фото из отзывов: счётчик, отзыв поверх фото, превью, свайп', route: '/gallery', link: '/gallery?i=0', figma: '184:16645', component: Gallery },
  { id: 'reviews', name: 'Все отзывы', description: 'Рейтинг, лента отзывов с фото и «Читать полностью», сортировка', route: '/reviews', figma: '184:16779', component: AllReviews },
  { id: 'review', name: 'Написать отзыв', description: 'Оценка звёздами, текст от 20 символов, до 5 фото; свой отзыв первым в ленте события, можно изменить или удалить. Входы: «Написать отзыв» на странице события, звёзды на билете прошедшего события', route: '/review', link: '/review?event=weekend', figma: '391:18403', component: ReviewForm },
  { id: 'activity', name: 'Активность', description: 'Шторка места рядом: фото, теги, часы работы, описание, «Добавить в план дня»', route: '/activity', link: '/activity?id=nook', figma: '183:19381', component: Activity },
  { id: 'person', name: 'Персона', description: 'Фото, биография с «Читать далее», события с персоной', route: '/person', link: '/person?id=bertsler', figma: '185:16181', component: Person },
  { id: 'venue', name: 'Площадка', description: 'Фото театра, адрес, часы работы, описание, афиша', route: '/venue', link: '/venue?id=new-comedy', figma: '185:17558', component: Venue },
  { id: 'favourites', name: 'Избранное', description: 'Вкладки События/Площадки/Персоны/Места и карточки событий в избранном', route: '/favourites', figma: '186:16181', component: Favourites },
];
