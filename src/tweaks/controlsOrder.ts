import { registerTweak } from '../lib/tweaks.svelte';
import { findIconButton, iconHref, isInPlayerBar } from '../lib/dom';

const PLAYER_BAR_SELECTOR =
  '[class*="PlayerBarDesktopWithBackgroundProgressBar_sonata"]';
const REVERSED_MARKER = '_withReversedControls';

let savedClasses: string[] = [];
/** Inline flex `order` we applied, with the previous value for a clean revert. */
const savedOrder = new Map<HTMLElement, string>();

function removeReversedClasses(): void {
  const playerBar = document.querySelector(PLAYER_BAR_SELECTOR);
  if (!playerBar) return;

  const reversed = Array.from(playerBar.classList).filter((name) =>
    name.includes(REVERSED_MARKER),
  );
  for (const name of reversed) {
    playerBar.classList.remove(name);
    if (!savedClasses.includes(name)) savedClasses.push(name);
  }
}

/**
 * The bottom player bar swaps like/dislike via a `_withReversedControls` class,
 * but the Vibe player has no such class and renders dislike before like. Swap
 * them with flex `order` so the tweak works on both.
 */
function swapLikeDislike(): void {
  const seenParents = new Set<Element>();

  for (const button of Array.from(document.querySelectorAll('button'))) {
    if (!iconHref(button).endsWith('#like_xs')) continue;
    if (!isInPlayerBar(button)) continue;

    const parent = button.parentElement;
    if (!parent || seenParents.has(parent)) continue;
    seenParents.add(parent);

    const dislike = findIconButton(parent, '#dislike_xs');
    if (!dislike) continue;

    const children = Array.from(parent.children) as HTMLElement[];
    const likeIndex = children.indexOf(button as HTMLElement);
    const dislikeIndex = children.indexOf(dislike);
    if (likeIndex === -1 || dislikeIndex === -1 || dislikeIndex > likeIndex) continue;

    for (let i = 0; i < children.length; i += 1) {
      setOrder(children[i], String(i));
    }
    setOrder(button as HTMLElement, String(dislikeIndex));
    setOrder(dislike, String(likeIndex));
  }
}

function setOrder(el: HTMLElement, value: string): void {
  if (!savedOrder.has(el)) savedOrder.set(el, el.style.order);
  el.style.order = value;
}

function restoreOrder(): void {
  for (const [el, previous] of savedOrder) {
    if (previous) el.style.order = previous;
    else el.style.removeProperty('order');
  }
  savedOrder.clear();
}

function apply(): void {
  removeReversedClasses();
  swapLikeDislike();
}

function revert(): void {
  const playerBar = document.querySelector(PLAYER_BAR_SELECTOR);
  if (playerBar) {
    for (const name of savedClasses) playerBar.classList.add(name);
  }
  savedClasses = [];
  restoreOrder();
}

registerTweak({
  id: 'controlsOrder',
  label: 'Порядок кнопок лайк/дизлайк',
  description: 'Возвращает лайк перед дизлайком, убирая класс _withReversedControls.',
  apply,
  revert,
});
