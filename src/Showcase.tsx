import type { ReactNode } from 'react';
import * as C from './components';
import { iconNames } from './components/Icon';
import { colorTokens, radiusTokens, spacingTokens, textStyles } from './tokens/tokens';
import s from './Showcase.module.css';

const Section = ({ title, note, children }: { title: string; note?: string; children: ReactNode }) => (
  <section className={s.section}>
    <h2 className={`ds-heading-h1 ${s.h}`}>{title}</h2>
    {note && <p className={`ds-body ${s.muted} ${s.h}`}>{note}</p>}
    {children}
  </section>
);
const Item = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className={s.panel}><span className={`ds-caption ${s.label}`}>{name}</span><div className={s.row}>{children}</div></div>
);

/** Тестовая страница: палитра, шкала текста и все компоненты базы. */
export function Showcase() {
  return (
    <main className={s.page}>
      <header className={s.section}>
        <span className="ds-display">Билет Беру — дизайн-система в React</span>
        <span className={`ds-lead ${s.muted}`}>Зеркало Figma: Foundations `132:16861`. Токены — src/tokens, компоненты — src/components.</span>
      </header>

      <Section title="Цвета (semantic → primitive)">
        <div className={s.grid}>
          {colorTokens.map(([fig, css, prim]) => (
            <div key={css} className={s.swatch}>
              <div className={s.chip}><span style={{ background: `var(${css})` }} /></div>
              <span className="ds-note">{fig}</span>
              <span className={`ds-caption ${s.muted}`}>{css} → {prim}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Типографика (14 стилей, Onest)">
        <div className={s.panel}>
          {textStyles.map(([name, cls, spec]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2xl)' }}>
              <span className={`ds-caption ${s.muted}`} style={{ width: 160, flexShrink: 0 }}>{name} · {spec}</span>
              <span className={cls}>Куда пойдём в субботу?</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Радиусы, отступы, тени">
        <div className={s.row}>
          {radiusTokens.map((r) => <div key={r} className={s.swatch} style={{ alignItems: 'center' }}><span style={{ width: 64, height: 64, background: 'var(--color-primary-orange)', borderRadius: `var(--radius-${r})` }} /><span className="ds-caption">radius/{r}</span></div>)}
        </div>
        <div className={s.row}>
          {spacingTokens.map((t) => <div key={t} className={s.swatch} style={{ alignItems: 'center' }}><span style={{ width: `var(--spacing-${t})`, height: 24, background: 'var(--color-accent-violet)' }} /><span className="ds-caption">spacing/{t}</span></div>)}
        </div>
        <div className={s.row}>
          {['sm', 'md'].map((x) => <div key={x} className={s.swatch} style={{ width: 160, height: 80, boxShadow: `var(--shadow-${x})` }}><span className="ds-caption">Shadow/{x}</span></div>)}
        </div>
      </Section>

      <Section title={`Иконки 20px (${iconNames.length})`}>
        <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
          {iconNames.map((n) => <div key={n} className={s.swatch} style={{ alignItems: 'center' }}><C.Icon name={n} size={24} /><span className="ds-tiny-regular">{n}</span></div>)}
        </div>
      </Section>

      <Section title="Действия">
        <Item name="Button · Type × State (Lg)">
          {(['Primary', 'Secondary', 'Tertiary'] as const).map((t) => <div key={t} style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <C.Button type={t}>Купить билет</C.Button><C.Button type={t} content="Icon">Далее</C.Button><C.Button type={t} content="Loader">Оплата</C.Button><C.Button type={t} state="Disabled">Недоступно</C.Button>
          </div>)}
        </Item>
        <Item name="Button · Sm">{(['Primary', 'Secondary', 'Tertiary'] as const).map((t) => <div key={t} style={{ width: 180 }}><C.Button size="Sm" type={t}>Выбрать</C.Button></div>)}</Item>
        <Item name="Text-buttons">
          <C.TextButtons /><C.TextButtons color="White" iconLeft="Yes" /><C.TextButtons size="M" color="White" iconLeft="Yes">Открыть карту</C.TextButtons>
          <C.TextButtons fill="No">Все</C.TextButtons><C.TextButtons fill="No" iconLeft="Yes">Удалить</C.TextButtons><C.TextButtons fill="No" iconRight="Yes">Все</C.TextButtons>
        </Item>
        <Item name="Button icon"><C.ButtonIcon /><C.ButtonIcon state="Disabled" /><C.ButtonIcon state="Active" /><C.ButtonIcon size="M" /><C.ButtonIcon fill="transparent" /><C.ButtonIcon icon="plus" accent /></Item>
        <Item name="Button-Tag"><C.ButtonTag /><C.ButtonTag status="Active">Театры</C.ButtonTag><C.ButtonTag legend="Yes">Партер</C.ButtonTag></Item>
        <Item name="ticket-button"><C.TicketButton /><C.TicketButton selected title="Взрослый" /></Item>
      </Section>

      <Section title="Ввод и выбор">
        <Item name="Search"><div style={{ width: 361, display: 'grid', gap: 8 }}><C.Search /><C.Search state="Active" defaultValue="Мастер и Маргарита" /><C.Search state="Disabled" /></div></Item>
        <Item name="Inputs"><div style={{ width: 361, display: 'grid', gap: 8 }}>{(['Default', 'DefaultFilled', 'PressedFilled', 'Error', 'Disabled'] as const).map((st) => <C.Inputs key={st} state={st} />)}</div></Item>
        <Item name="Select"><div style={{ width: 361, display: 'grid', gap: 8 }}>{(['Default', 'PressedFilled', 'Error', 'Disabled'] as const).map((st) => <C.Select key={st} state={st} icon={st === 'Error' ? 'Yes' : 'No'} />)}</div></Item>
        <Item name="Range slider"><div style={{ width: 361 }}><C.RangeSlider /></div></Item>
        <Item name="numb"><C.Numb /><C.Numb state="Active" /><C.Numb weekend="Yes" day={6} weekday="сб" /><C.Numb ticket="Yes" day={11} weekday="пт" /><C.Numb state="Active" ticket="Yes" /><C.Pin /></Item>
        <Item name="Datepicker"><div style={{ width: 393 }}><C.Datepicker state="2" /></div></Item>
        <Item name="Toggle · Checkbox · Radio"><C.Toggle /><C.Toggle state="Disabled" /><C.Checkbox /><C.Checkbox active="No" /><C.Radio /><C.Radio state="Default" /></Item>
      </Section>

      <Section title="Карточки, бейджи, медиа">
        <Item name="Card"><C.Card shadow /><div style={{ width: 361 }}><C.Card style="Horizontal" shadow /></div></Item>
        <Item name="Banner_image · Story"><C.BannerImage /><C.Story /><C.Story state="Active" title="Аншлаг" /></Item>
        <Item name="Location_card"><div style={{ width: 361, display: 'grid', gap: 8 }}>
          <C.LocationCard /><C.LocationCard button="Yes" name="Бар Mozz" /><C.LocationCard button="Yes" drag="Yes" name="Кофейня Чёрный квадрат" /><C.LocationCard photo="No" name="Прогулка на катере" />
        </div></Item>
        <Item name="review-card"><C.ReviewCard /><C.ReviewCard photo="Yes" /><div className={s.dark}><C.ReviewCard size="Sm" /></div></Item>
        <Item name="Price tag · Rate · Age badge · bulb · Featured Indicators · Avatar · Image_*">
          <C.PriceTag /><C.PriceTag tone="neutral">500 ₽</C.PriceTag><C.Rate /><C.Rate size="Sm" onDark /><C.AgeBadge /><C.AgeBadge size="lg">18+</C.AgeBadge>
          <C.Bulb /><C.Bulb color="Orange" /><C.Bulb size="M" /><C.Bulb size="Sm" color="Orange" /><C.FeaturedIndicators /><C.FeaturedIndicators size="Small" active={2} />
          <C.Avatar size="xs" /><C.Avatar />{(['xxxs', 'xxs', 'xs', 'sm'] as const).map((z) => <C.Image key={z} size={z} />)}
        </Item>
      </Section>

      <Section title="Навигация и системные">
        <div className={s.row} style={{ alignItems: 'flex-start' }}>
          <div className={s.phone}>
            <C.StatusBar /><C.LocationAndProfile /><div style={{ padding: '0 16px 12px', background: 'var(--color-base-white)' }}><C.Search /></div>
            <C.TitlePage /><C.TitlePage iconRight="Yes" title="Результаты" /><C.TitlePage subtitle="Yes" title="Выходные без телефона" /><C.TitlePage textButton="Yes" iconRight="No" /><C.TitlePage version="Secondary" title="Подборки событий" />
            <div style={{ padding: 16 }}><C.Tabs /></div><C.Bar /><C.HomeIndicator />
          </div>
          <div className={s.phone}><C.StatusBar /><div style={{ padding: 16 }}><C.Inputs state="PressedFilled" label="Телефон" defaultValue="+7 900 000-00-00" /></div><C.Keyboard /></div>
          <div className={s.phone} style={{ background: 'var(--color-text-secondary)' }}><C.StatusBar theme="Dark" breadCrumbs="Yes" /><C.ProgressBar current={1} progress={0.5} /><div style={{ padding: '12px 0' }}><C.ActionMenu text="Yes" /></div><C.ActionMenu /></div>
        </div>
        <Item name="Item_menu · Scroller · Spinner"><C.ItemMenu /><C.ItemMenu active="No" label="Избранное" icon="heart-rounded" /><C.Scroller height={80} thumb={0.4} /><C.Spinner size={16} /><C.Spinner /><C.Spinner size={108} /><span className={s.dark}><C.Spinner color="Light" /></span></Item>
      </Section>

      <Section title="Оверлеи и оплата">
        <div className={s.row} style={{ alignItems: 'flex-start' }}>
          <C.ModalConfirmation />
          <div style={{ width: 393 }}><C.ModalSettings><div style={{ padding: '0 16px', display: 'grid', gap: 12 }}><C.TitlePage version="Secondary" title="Бюджет" /><C.RangeSlider /><C.PaymentMethod type="Bonus" /></div></C.ModalSettings></div>
          <div style={{ width: 361, display: 'grid', gap: 8 }}><C.PaymentMethod /><C.PaymentMethod type="Bonus" /></div>
        </div>
      </Section>

      <Section title="Карты и метки" note="Подложки карты и схемы зала в Figma — иллюстрации; в коде — стилизованная схема и интерактивная сетка мест.">
        <div className={s.row} style={{ alignItems: 'flex-start' }}>
          <div className={s.phone}><C.Map><C.MapHomePoint style={{ position: 'absolute', left: 100, top: 60 }} /><C.MapMarker style={{ position: 'absolute', left: 260, top: 40 }} /><C.MapMarker order={2} label="Бар Mozz" style={{ position: 'absolute', left: 40, top: 210 }} /></C.Map></div>
          <div className={s.phone}><C.HallPlan /></div>
          <div className={s.panel}><C.MapMarker text="No" bulb="No" size="Sm" /><C.MapMarker size="Xl" /><C.MapHomePoint radius="No" /><C.MetroStation /><C.MapMark /></div>
        </div>
      </Section>
    </main>
  );
}
