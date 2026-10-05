import { registerTweak } from '../lib/tweaks.svelte';

const PLAYER_BAR_SELECTOR =
  '[class*="PlayerBarDesktopWithBackgroundProgressBar_sonata"]';
const REVERSED_MARKER = '_withReversedControls';

let savedClasses: string[] = [];

function findPlayerBar(): Element | null {
  return document.querySelector(PLAYER_BAR_SELECTOR);
}

/** Yandex adds a `_withReversedControls` class that swaps like/dislike order. */
function apply(): void {
  const playerBar = findPlayerBar();
  if (!playerBar) return;

  const reversed = Array.from(playerBar.classList).filter((name) =>
    name.includes(REVERSED_MARKER),
  );
  if (reversed.length === 0) return;

  for (const name of reversed) {
    playerBar.classList.remove(name);
    if (!savedClasses.includes(name)) savedClasses.push(name);
  }
}

function revert(): void {
  const playerBar = findPlayerBar();
  if (playerBar) {
    for (const name of savedClasses) playerBar.classList.add(name);
  }
  savedClasses = [];
}

registerTweak({
  id: 'controlsOrder',
  label: 'Порядок кнопок лайк/дизлайк',
  description: 'Возвращает лайк перед дизлайком, убирая класс _withReversedControls.',
  apply,
  revert,
});
