# DESIGN.md — визуал Better Yandex Music

Как устроено оформление UI (модалка + блок на странице настроек) и как держать
его «как родное» для Яндекс.Музыки (далее — YM).

## Принципы

1. **Никаких хардкод-цветов.** Палитра берётся из CSS-переменных YM (`--ym-*`),
   которые наследуются в shadow root и **сами** обновляются при смене темы.
2. **Стили только в `src/ui/app.css`** (плейн-CSS, классы `bym-*`). В Svelte-компонентах
   `<style>` не используется — он бы попал в document, а не в shadow root.
3. **Метрики — с нативных элементов.** Размеры шрифтов, отступы строк, геометрия
   свитча и иконки не угадываются, а сэмплятся из настоящих настроек YM при
   монтировании блока (`sampleMetrics()` в `settingsPage.ts`).
4. **Минимум вмешательства.** Мы меняем только то, что просит фича, всё остальное —
   родные стили YM.

## Тема (светлая/тёмная) — без наблюдателей

YM вешает класс на `<body>`: `ym-font-music ym-dark-theme` / `... ym-light-theme`
(плюс бывает `ym-font-music`). Цветовые `--ym-*` переменные объявлены на `html`/`body`
и меняют значения вместе с классом. Так как они **наследуются** через границу shadow DOM,
нам достаточно ссылаться на них в `app.css` — цвета обновятся на лету, без observer и
без сэмплинга. `@media (prefers-color-scheme)` не используем: тема YM от него не зависит.

## Токены (`app.css`, `.bym-root`)

| Наш токен | Источник (YM) |
|---|---|
| `--bym-bg` | `--ym-background-color-primary-enabled-content` |
| `--bym-bg-soft` | `--ym-controls-color-secondary-default-enabled` |
| `--bym-fg` | `--ym-controls-color-primary-text-enabled_variant` |
| `--bym-fg-dim` | `--ym-controls-color-primary-text-enabled` |
| `--bym-border` | `--ym-controls-color-secondary-outline-enabled_stroke` |
| `--bym-accent` | `--ym-controls-color-primary-default-enabled` (жёлтый) |
| `--bym-accent-fg` | `--ym-controls-color-primary-on_default-enabled` |
| `--bym-danger` | `--ym-message-color-error-text-enabled` |
| `--bym-font` | `--ym-font-text` (`"YS Text"`) |
| `--bym-radius` | `--ym-radius-size-xl` |

Все — с фолбэками (на случай отсутствия переменных). Для тени/оверлея/заголовка
модалки используются `--ym-shadow-modal-xl`/`-s`, `--ym-background-color-primary-enabled-overlay`,
`--ym-font-heading` (`"YSMusic Headline"`).

## Метрики (переопределяются inline на блоке настроек)

Дефолты — компактные (для модалки), а `sampleMetrics()` ставит реальные значения
из нативных строк настроек на target блока:

| Переменная | Значение (из YM, ru/en-независимо) |
|---|---|
| `--bym-label-size/weight/lh` | заголовок строки: `19.64px / 700 / 29.47` |
| `--bym-desc-size/weight/lh` | описание: `14.73px / 500 / 22.10` |
| `--bym-row-pad-top` | `padding-top` нативного `SettingsListToggleItem_root` |
| `--bym-row-pad-bottom` | `padding-bottom` нативного `li.Settings_item` |
| `--bym-switch-w/h/knob/pad/travel` | геометрия нативного `button[role=switch]` |
| `--bym-arrow-size` | размер иконки нативной строки-кнопки (`SettingsListButtonItem_icon`) |

## Тумблер (`Toggle.svelte` + `.bym-switch`)

- Размеры — из `--bym-switch-*` (нативно ≈ **39×25**, кружок ≈ **20**).
- Клик переключает **только по свитчу**: `label.bym-toggle__control` оборачивает
  input + свитч, текст строки не кликабелен (как в родных настройках).
- Выключен: трек `--ym-controls-color-secondary-default-enabled`,
  кружок `--ym-controls-color-secondary-on_default-enabled_variant`.
- Hover выключенного **светлеет и трек, и кружок**:
  `...secondary-default-hovered` / `...secondary-on_default-hovered`.
- Включён: трек `--bym-accent`, кружок `--bym-accent-fg`.

## Блок на странице настроек

- Вставляется внутрь `ul[class*="Settings_root"]` → наследует ширину списка и ритм.
- **Без горизонтальных разделителей** между строками.
- Заголовок блока — мелкий капс с цветом `--bym-fg-dim`.
- Строка «Экспорт / импорт настроек» — как нативная строка-кнопка:
  - иконка-спрайт `/icons/sprite.svg#arrowRight_xs`, `fill: --bym-fg-dim`;
  - на hover стрелка уезжает вправо (`translateX(7px)`, transition `0.3s`);
  - **текст цвет не меняет** и не тускнеет (убрать любой `opacity`/color-hover).

## Модалка

Повторяет нативный dialog YM:

- фон `--ym-background-color-primary-enabled-popover`;
- радиус `--ym-radius-size-xl`;
- двойная тень `--ym-shadow-modal-xl` + `--ym-shadow-modal-s`;
- бордер `--ym-outline-color-primary-disabled`;
- заголовок: `font-family: --ym-font-heading`, размер `--ym-font-size-headline-s`
  (≈27px), вес `--ym-font-weight-bold`;
- кнопка закрытия: спрайт `#close_xxs`, **20×20**, без фона;
- кнопки действий: `border-radius: --ym-radius-size-xxxl` (`6.25rem`, пилюля),
  «основная» = жёлтая (`--bym-accent`), «сброс» = красный текст.

## Проверка визуала

Сверяться с живым сайтом (см. AGENTS.md → «Как проверять»). Полезно:
- `getComputedStyle` нативных элементов для метрик и цветов;
- CDP `CSS.forcePseudoState(['hover'])` для замеров hover;
- скриншоты в светлой и тёмной темах (переключить класс на `<body>` или тему в
  настройках), класть в `.playwright-mcp/`.

## Чего не делать

- Не селектить по локализованным `aria-label`.
- Не хардкодить цвета темы — только `--ym-*`.
- Не добавлять `<style>` в компоненты.
- Не «улучшать» нативный вид своими тенями/радиусами — брать значения YM.
