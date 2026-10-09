import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar, BannerImage, ButtonTag, Card, Datepicker, HomeIndicator, Icon, LocationAndProfile, Search, StatusBar, Story as StoryCard, TitlePage } from '../components';
import { BannerCarousel } from '../screens/_shell/BannerCarousel';
import { photos } from '../assets/photos';
import { Phone, Rail } from './Phone';

/** Экран «Главная» — копия макета Main 1 (Figma `178:16210`): шапка с поиском, сторис, баннеры, категории, лента дат, «По вашим интересам», «Подборки событий». */
const meta = { title: 'Sandboxes/Главная', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

const STORIES = ['ТОП- концерты', 'Анонс выставок', 'ТОП- выходные', 'Для двоих', 'Премьеры'];
const BANNERS: Array<[string, string, string | undefined, string]> = [['Культурная подборка', 'с 20-26 апреля', undefined, 'banner-1'], ['Мастер и Маргарита', '29 апреля 20-00', '6+', 'banner-2'], ['Выходные  без телефона', '25 апреля 18-00', '12+', 'banner-3'], ['Музыка в дыхание', '30 апреля 20-00', '12+', 'banner-0']];
const TAGS = ['Экскурсии', 'Театры', 'Концерты', 'Детям', 'Выставки', 'Пушкинская карта'];
const INTERESTS: Array<[string, string, string, string]> = [['24 аперля, 11-00', 'Дворцовая площадь', 'от 100 - 2 000 ₽', '6+'], ['20 апреля, 16-00', 'Севкабель Порт', 'от 1 200 ₽', '12+'], ['14 апреля, 11-00', 'Новая площадь, дом 3/4', 'от 100 - 1 000 ₽', '6+'], ['15 апреля, 11-00', 'Центральная площадь, дом 3/4', 'от 100 - 1 000 ₽', '12+'], ['12 апреля, 14-00', 'Невский просп., 33', 'от 1 000 ₽', '12+']];
const COLLECTION: Array<[string, string, string, string, string]> = [
  ['0+', 'Фестиваль уличного искусства и граффити', '2 мая, 16-00', 'Дворцовая площадь', '-20%'], ['12+', 'Концерт камерной музыки в историческом особняке', '12 мая, 19-00', 'ул. Кораблестроителей, 38к1', '-10%'],
  ['6+', 'Планета световых сенсоров: приключение в мире интерактива', '13 мая, 11-00', 'Малый пр. В.О., 65литВ', '-10%'], ['6+', 'Огненное ремесло: тайна стеклодува', '14 мая, 12-00', 'ул. Чайковского, 71к2', '-20%'],
  ['18+', 'DJ-сет в стиле эмбиент в лофте', '16 мая, 13-00', 'Малый пр. В.О., 65литВ', '-10%'], ['12+', 'Двое в танце: вечер балетной миниатюры', '13 мая, 13-00', 'ул. Есенина, 25к4', '-30%'],
  ['18+', 'Всеобщее единение: фестиваль музыки и света', '14 мая, 12-00', 'ул. Чайковского, 71к2', '-20%'], ['18+', 'Вечер чёрного юмора «Тёмная сторона для двоих', '13 мая, 11-00', 'Малый пр. В.О., 65литВ', '-10%'],
  ['18+', 'Кинопоказ под открытым небом с дискуссией', '28 мая, 20-00', 'Петровский арсенал', '-20%'], ['12+', 'Под аккомпанемент тишины: вокал и фортепиано', '12 мая, 12-00', 'ул. Ломоносова, 32', '-10%'],
  ['6+', 'Экскурсия по залам скульптуры ', '6 мая, 15-00', 'ул. Кораблестроителей, 38к1', '-20%'], ['12+', 'Джаз на двоих: вечер импровизации', '8 мая, 10-00', 'наб. реки Фонтанки, 175', '-5%'],
];
const section = { background: 'var(--color-base-white)', borderRadius: 'var(--radius-2xl)' } as const;

export const Main1: Story = {
  name: 'Main 1',
  render: () => {
    const [tag, setTag] = useState(-1);
    const [collapsed, setCollapsed] = useState(false);
    return (
      <Phone onScroll={(t) => setCollapsed(t > 24)}
        header={<div>
          <StatusBar />
          <div style={{ background: 'var(--color-base-white)', borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)', paddingBottom: 'var(--spacing-3xl)', paddingTop: collapsed ? 'var(--spacing-md)' : 0, transition: 'padding-top 220ms var(--motion-ease)' }}>
            <div style={{ display: 'grid', gridTemplateRows: collapsed ? '0fr' : '1fr', opacity: collapsed ? 0 : 1, transition: 'grid-template-rows 220ms var(--motion-ease), opacity 160ms var(--motion-ease)' }}>
            <div style={{ overflow: 'hidden' }}><LocationAndProfile avatar={photos.avatar} /></div>
          </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', padding: '0 var(--spacing-2xl)' }}>
              <Search />
              <button type="button" aria-label="Фильтры" style={{ width: 40, height: 40, flexShrink: 0, border: 0, borderRadius: 'var(--radius-lg)', background: 'var(--color-background-base)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="settings" /></button>
            </div>
          </div>
        </div>}
        footer={<div><Bar /><HomeIndicator /></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)' }}>
          <section style={{ ...section, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)', padding: 'var(--spacing-4xl) 0 var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)' }}>
              <Rail>{STORIES.map((t, i) => <StoryCard key={t} title={t} src={photos[`story-${i}`]} />)}</Rail>
              <BannerCarousel>{BANNERS.map(([t, d, a, img]) => <BannerImage key={t} title={t} date={d} age={a} image={photos[img]} />)}</BannerCarousel>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md) var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-2xl)' }}>
              {TAGS.map((t, i) => <ButtonTag key={t} status={i === tag ? 'Active' : 'No active'} onClick={() => setTag(i === tag ? -1 : i)}>{t}</ButtonTag>)}
            </div>
          </section>
          <section style={{ ...section, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-5xl) 0 var(--spacing-3xl)' }}>
            <div style={{ padding: '0 0 var(--spacing-xl) var(--spacing-2xl)' }}><Datepicker /></div>
            <TitlePage version="Secondary" title="По вашим интересам" />
            <Rail gap="var(--spacing-2xl)">{INTERESTS.map(([d, p, pr, a], i) => (
              <Card key={i} title="Интерактивная экскурсия по одному из главных музеев страны для детей" date={d} place={p} price={pr} age={a} image={photos[`vcard-${i}`]} />))}</Rail>
          </section>
          <section style={{ ...section, display: 'flex', flexDirection: 'column', padding: 'var(--spacing-2xl) 0 var(--spacing-3xl)' }}>
            <TitlePage version="Secondary" title="Подборки событий" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xs) var(--spacing-2xl) 0' }}>
              {COLLECTION.map(([a, t, d, p, disc], i) => <Card key={t} style="Horizontal" age={a} title={t} date={d} place={p} price="от 1 000₽" discount={disc} image={photos[`hcard-${i}`]} />)}
            </div>
          </section>
        </div>
      </Phone>
    );
  },
};
