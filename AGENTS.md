# AGENTS.md — Better Yandex Music

Юзерскрипт для `music.yandex.ru`: возвращает горизонтальный слайдер громкости и
порядок лайк/дизлайк, добавляет подтверждение дизлайка и блок настроек с
тумблерами. Собирается из `src/` в один `betterym.user.js`.

## Стек и сборка

- **Svelte 5 (runes) + TypeScript + Vite**, сборка через `vite-plugin-monkey`.
- `npm run build` → `dist/betterym.user.js` → копия в корень `betterym.user.js`
  (этот артефакт коммитится; `@downloadURL`/`@updateURL` смотрят на raw в `main`).
- `npm run dev` → Vite + HMR, печатает install-URL для Tampermonkey.
- `npm run check` → `svelte-check`. Держать 0 ошибок.
- `@grant none`, скрипт в page-context. Настройки — в `localStorage`.

## Структура

```
src/
  main.ts                    boot: settings.load → startTweaks → mountApp → startSettingsPage
  lib/
    settings.svelte.ts       $state-стор, localStorage, export/import
    tweaks.svelte.ts         реестр твиков, syncTweaks, watchdog, реакция на настройки
    i18n.ts                  строки ru/en, detectLang()
    dom.ts                   iconHref / findIconButton / isInPlayerBar
  tweaks/
    volumeSlider.ts          громкость нижнего плеера
    controlsOrder.ts         порядок лайк/дизлайк (нижний плеер + Vibe)
    dislikeConfirm.ts        подтверждение дизлайка
  ui/
    App.svelte               только модалка, экспорт openSettings()
    SettingsModal.svelte     модалка: backup / import / reset
    SettingsSection.svelte   блок на странице настроек (тумблеры + кнопка модалки)
    Toggle.svelte            свитч
    mount.ts                 createShadowHost(id, tag, css), mountApp()
    settingsPage.ts          инъекция блока на /settings + сэмплинг метрик
    app.css                  ВСЕ стили (см. DESIGN.md)
```

## Твики

API (`lib/tweaks.svelte.ts`): `{ id, label, description, apply(), revert() }`.
- `apply()` — **идемпотентный**, вызывается многократно watchdog-ом.
- `revert()` — вызывается только при переключении `true → false`.
- Реестр наполняется сайд-эффектом импорта в `main.ts`.
- Реакция на настройки: `$effect.root` + `$effect`, читающий все ключи `settings.tweaks`.
- **Watchdog**: `MutationObserver` на `document.body` (`childList`, `subtree`) с
  debounce через `requestAnimationFrame`. Яндекс — React SPA и перерисовывает DOM,
  поэтому твики переприменяются, а не отключают observer после первого успеха.

## Правила работы с DOM Яндекс.Музыки

- **Никогда не селектить по `aria-label`** — они локализуются (en/ru/uz/kk).
  Ориентируйся на иконки (`use[href$="#dislike_xs"]` и т.п., см. `lib/dom.ts`)
  и классы по подстроке `[class*="Prefix_name"]` (хеши классов меняются, префикс — нет).
- **Скоп твиков.** Громкость есть и в нижнем плеере, и в шапке Vibe — трогать
  только нижний: `section[aria-labelledby='player-region']`.
- Изменения делать **обратимыми**: сохранять исходные inline-стили/классы/позиции
  и восстанавливать в `revert()`. Скрывать чужие узлы лучше через
  `style.setProperty('display','none','important')`, чтобы hover/анимации React не вернули их.
- **Добавлять** узлы в React-контейнер ок; не двигать/удалять React-узлы без нужды.
- Помни про `MutationObserver`: своё же изменение не должно приводить к петле —
  `apply()` обязан рано выходить, если уже применён.

## UI и Shadow DOM (см. DESIGN.md подробнее)

- **Все стили — в `src/ui/app.css`.** В Svelte-компонентах `<style>` не пишем:
  их CSS не долетает до shadow root.
- `createShadowHost()` заворачивает приложение в shadow root и инжектит `app.css`.
- Хосты: `#betterym-root` (модалка) и `#betterym-settings` (блок настроек).
- Блок настроек вставляется **внутрь `ul[class*="Settings_root"]`** как
  `li[display:contents]` → `div[display:contents]`(shadow). Так наследуются
  ширина списка (≈592px), отступы и контекст шрифта. `<li>` не может держать
  shadow root — поэтому обёртка + `div`.
- Если React выкинул блок — `MutationObserver` в `settingsPage.ts` вернёт его.

## Локализация

- Язык: `detectLang()` → `en*` = английский, иначе русский. Строки — в `lib/i18n.ts`.
- Подписи твиков для страницы настроек берутся из `MESSAGES`, не из `tweak.label`.

## Git

- Conventional Commits, тело — по-английски, императив. Билд-артефакт коммитим вместе с исходниками.
- Ветки фич: `feat/...`.

## Как проверять на живом сайте

Расширения в тестовом Chromium нет, скрипт устанавливать нечем — но можно
инжектнуть собранный код напрямую (Playwright MCP, **не** headless):

1. Поднять локальный сервер с билдом: `cp betterym.user.js /tmp/opencode/`,
   `python3 -m http.server 8128` (в `/tmp/opencode`).
2. CSP Яндекса блокирует внешний `<script>` — вместо тега выполнить код через
   `page.evaluate((c) => (0, eval)(c), code)`, где `code` прочитан в раннере через `fetch`.
3. Скриншоты класть только в workspace (`.playwright-mcp/`), иначе доступ запрещён.
4. Для замера `:hover` — CDP `CSS.forcePseudoState` (обычный hover не всегда даёт
   снятие стилей), правила — `CSS.getMatchedStylesForNode`.
5. Сессия браузера живёт между вызовами, но может разлогинить — тогда пользователь
   логинится заново.
6. **Тесты пишут в `localStorage` домена** (тот же ключ `betterym.settings.v2`) —
   после проверок вернуть дефолты и перезагрузить страницу, чтобы снять инъекцию.

Мок-страницы для быстрых правок лежат в `/tmp/opencode/` (`bym-test.html`,
`settings.html`) — не в репозитории.

## Известные ограничения

- Порядок кнопок на Vibe меняется через inline `flex order` (у Vibe-плеера нет
  класса `_withReversedControls`); при перерисовке watchdog переприменяет.
- Метрики шрифта/свитча блока настроек сэмплятся один раз при монтировании
  (от темы не зависят). Цвета — живые, из `--ym-*`.
- Язык подписей берётся при открытии; смена языка Яндекса без перезагрузки не
  перерисовывает уже смонтированный UI.
