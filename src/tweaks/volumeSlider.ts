import { registerTweak } from '../lib/tweaks.svelte';

const SLIDER_SELECTOR = "input[aria-label='Manage volume']";

interface VolumeNodes {
  /** Element that holds both the (now inline) slider and the volume button. */
  container: HTMLElement;
  /** Hover popup that used to wrap the slider; hidden once the slider moves out. */
  popup: HTMLElement;
}

interface SavedState extends VolumeNodes {
  originalParent: HTMLElement;
  popupDisplay: string;
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
 * Walk up from the slider to the nearest ancestor that also has a <button>
 * child (the volume button). That ancestor is the container; the child on the
 * slider's path is the hover popup.
 *
 * Returns null when the slider already sits directly next to the button, so the
 * operation stays idempotent without a DOM marker.
 */
function findNodes(slider: HTMLElement): VolumeNodes | null {
  let child: HTMLElement = slider;
  let parent = slider.parentElement;

  while (parent) {
    const hasButton = Array.from(parent.children).some(
      (el) => el !== child && el.tagName === 'BUTTON',
    );
    if (hasButton) {
      // Already placed: the slider is a direct sibling of the volume button.
      if (child === slider) return null;
      return { container: parent, popup: child };
    }
    child = parent;
    parent = parent.parentElement;
  }

  return null;
}

function place(slider: HTMLInputElement, state: VolumeNodes): void {
  if (slider.parentElement !== state.container) {
    state.container.appendChild(slider);
  }
  // !important so React hover styles / animations can't resurrect the popup.
  state.popup.style.setProperty('display', 'none', 'important');
  state.container.style.maxWidth = 'unset';
  slider.style.transform = 'unset';
  slider.style.minWidth = 'unset';
  slider.style.maxWidth = '7rem';
}

/**
 * Original DOM kept the slider inside a hover popup next to the volume button.
 * We reparent the slider into the button container and hide the popup, so the
 * slider is always visible to the right of the button and hover does nothing —
 * matching the pre-rewrite behavior. Fully reversible.
 */
function apply(): void {
  const slider = findSlider();
  if (!slider) return;

  // Our previous DOM is still alive: just make sure it stays in the wanted state.
  if (saved?.popup.isConnected && saved.container.isConnected) {
    place(slider, saved);
    return;
  }

  const nodes = findNodes(slider);
  if (!nodes) return;

  saved = {
    container: nodes.container,
    popup: nodes.popup,
    originalParent: slider.parentElement ?? nodes.popup,
    popupDisplay: nodes.popup.style.display,
    containerMaxWidth: nodes.container.style.maxWidth,
    sliderTransform: slider.style.transform,
    sliderMinWidth: slider.style.minWidth,
    sliderMaxWidth: slider.style.maxWidth,
  };

  place(slider, saved);
}

function revert(): void {
  const slider = findSlider();

  if (slider && saved) {
    if (saved.originalParent.isConnected && slider.parentElement !== saved.originalParent) {
      saved.originalParent.appendChild(slider);
    }
    slider.style.transform = saved.sliderTransform;
    slider.style.minWidth = saved.sliderMinWidth;
    slider.style.maxWidth = saved.sliderMaxWidth;
  }

  if (saved?.popup.isConnected) {
    if (saved.popupDisplay) {
      saved.popup.style.setProperty('display', saved.popupDisplay);
    } else {
      saved.popup.style.removeProperty('display');
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
  description: 'Выносит слайдер громкости справа от кнопки и убирает всплывающую панель.',
  apply,
  revert,
});
