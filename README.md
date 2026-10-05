# Better Yandex Music
Юзерскрипт улучшающий опыт пользования Яндекс Музыкой.

<img width="216" height="106" alt="image" src="https://github.com/user-attachments/assets/7dd6a571-cb45-4ec8-8c97-418f94bf7be1" />

## Возможности
- **Горизонтальный слайдер громкости** — разворачивает слайдер рядом с кнопкой.
- **Порядок кнопок лайк/дизлайк** — убирает класс `_withReversedControls`.
- **Подтверждение дизлайка** — спрашивает подтверждение при клике и по хоткею `d`.
- **Настройки** — блок с тумблерами прямо на странице `music.yandex.ru/settings`,
  плюс модалка с экспортом/импортом в JSON. Адаптируется под светлую/тёмную тему YM.

Каждый твик можно включать и выключать на лету — изменения применяются сразу,
без перезагрузки страницы.

## Установка
1. Установите расширение для юзерскриптов (например [Tampermonkey](https://www.tampermonkey.net/index.php)).
2. [Установите скрипт](https://raw.githubusercontent.com/ksnitsky/BetterYandexMusic/refs/heads/main/betterym.user.js).

## Разработка
Скрипт собирается из исходников в `src/` в единый `betterym.user.js`.

```bash
npm install
npm run dev     # Vite dev-сервер с HMR для Tampermonkey
npm run build   # сборка → dist/ → копия в betterym.user.js
npm run check   # svelte-check (типы)
```

Стек: Svelte 5 (runes) + TypeScript + Vite, сборка через [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey).
UI монтируется в Shadow DOM, чтобы не конфликтовать со стилями Яндекс Музыки.
Настройки хранятся в `localStorage` (`betterym.settings.v2`).
