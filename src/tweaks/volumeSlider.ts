import { registerTweak } from '../lib/tweaks.svelte';

const SLIDER_SELECTOR = "input[aria-label='Manage volume']";
const APPLIED_FLAG = 'bymVolume';

interface SavedState {
  wrapper: HTMLElement;
  container: HTMLElement;
  wrapperDisplay: string;
  containerMaxWidth: string;
  sliderTransform: string;
  sliderMinWidth: string;
  sliderMaxWidth: string;
}

let saved: SavedState | null = null;

function findSlider(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(SLIDER_SELECTOR);
}

/**
 * Original DOM kept the slider inside a collapsible wrapper next to the volume
 * button. We reparent the slider into the button container and hide the
 * wrapper instead of removing it, which makes the change fully reversible.
 *
 * The `dataset` flag makes the operation idempotent: the observer re-runs this
 * on every DOM change, and without the flag the slider would keep climbing up
 * the tree on each pass.
 */
function apply(): void {
  const slider = findSlider();
  if (!slider) return;
  if (slider.dataset[APPLIED_FLAG] === '1') return;

  const wrapper = slider.parentElement;
  const container = wrapper?.parentElement;
  if (!wrapper || !container) return;

  saved = {
    wrapper,
    container,
    wrapperDisplay: wrapper.style.display,
    containerMaxWidth: container.style.maxWidth,
    sliderTransform: slider.style.transform,
    sliderMinWidth: slider.style.minWidth,
    sliderMaxWidth: slider.style.maxWidth,
  };

  container.appendChild(slider);
  wrapper.style.display = 'none';
  container.style.maxWidth = 'unset';
  slider.style.transform = 'unset';
  slider.style.minWidth = 'unset';
  slider.style.maxWidth = '7rem';
  slider.dataset[APPLIED_FLAG] = '1';
}

function revert(): void {
  const slider = findSlider();

  if (slider?.dataset[APPLIED_FLAG] === '1') {
    delete slider.dataset[APPLIED_FLAG];
    slider.style.transform = saved?.sliderTransform ?? '';
    slider.style.minWidth = saved?.sliderMinWidth ?? '';
    slider.style.maxWidth = saved?.sliderMaxWidth ?? '';

    if (saved?.wrapper.isConnected) {
      saved.wrapper.style.display = saved.wrapperDisplay;
      saved.wrapper.appendChild(slider);
    }
  }

  if (saved?.container.isConnected) {
    saved.container.style.maxWidth = saved.containerMaxWidth;
  }

  saved = null;
}

registerTweak({
  id: 'volumeSlider',
  label: 'Горизонтальный слайдер громкости',
  description: 'Разворачивает слайдер громкости рядом с кнопкой и делает его шире.',
  apply,
  revert,
});
