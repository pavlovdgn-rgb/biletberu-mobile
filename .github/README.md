# Билет Беру — мобильное приложение (прототип)

Кликабельный прототип iOS-приложения «Билет Беру»: поиск и покупка билетов на культурные мероприятия и «Куда пойдём?» — план дня вокруг события (места рядом, маршрут, избранное). Данные — демо, хранятся в браузере.

**Открыть на телефоне:** https://pavlovdgn-rgb.github.io/biletberu-mobile/app/
В Safari → «Поделиться» → «На экран Домой» — откроется на весь экран, как приложение. Светлая и тёмная тема — Профиль → «Оформление».

Все экраны в корпусе iPhone (для компьютера): https://pavlovdgn-rgb.github.io/biletberu-mobile/

## Стек

Vite + React 19 + TypeScript, CSS Modules, токены дизайн-системы — CSS-переменные (`src/tokens`, имена 1:1 с Variables в Figma), компоненты — `src/components`, экраны — `src/screens`, демо-данные — `src/data`.

```bash
npm install
npm run dev        # приложение
npm run storybook  # компоненты и песочницы
```

Публикация: `npm run deploy` — сборка под `/biletberu-mobile/` и push в ветку `gh-pages` (`deploy.sh`).
