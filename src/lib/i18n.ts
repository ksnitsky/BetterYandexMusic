import type { TweakId } from './settings.svelte';

export type Lang = 'ru' | 'en';

export interface TweakText {
  label: string;
  description: string;
}

export interface Messages {
  heading: string;
  exportImport: string;
  tweaks: Record<TweakId, TweakText>;
}

export const MESSAGES: Record<Lang, Messages> = {
  ru: {
    heading: 'Настройки Better Yandex Music',
    exportImport: 'Экспорт / импорт',
    tweaks: {
      volumeSlider: {
        label: 'Горизонтальный слайдер громкости',
        description: 'Выносит слайдер справа от кнопки и убирает всплывающую панель.',
      },
      controlsOrder: {
        label: 'Порядок кнопок лайк/дизлайк',
        description: 'Возвращает лайк перед дизлайком.',
      },
      dislikeConfirm: {
        label: 'Подтверждение дизлайка',
        description: 'Спрашивает подтверждение при дизлайке, в т.ч. по хоткею «d».',
      },
    },
  },
  en: {
    heading: 'Better Yandex Music settings',
    exportImport: 'Export / import',
    tweaks: {
      volumeSlider: {
        label: 'Horizontal volume slider',
        description: 'Moves the slider next to the button and hides the hover popup.',
      },
      controlsOrder: {
        label: 'Like / dislike button order',
        description: 'Puts like before dislike.',
      },
      dislikeConfirm: {
        label: 'Dislike confirmation',
        description: 'Asks for confirmation on dislike, including the "d" hotkey.',
      },
    },
  },
};

/** Yandex marks English as e.g. `en-RU`; everything else falls back to Russian. */
export function detectLang(): Lang {
  const lang = (document.documentElement.lang || navigator.language || 'ru').toLowerCase();
  return lang.startsWith('en') ? 'en' : 'ru';
}
