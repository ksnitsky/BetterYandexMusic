import { registerTweak } from '../lib/tweaks.svelte';

const DISLIKE_SELECTOR = 'button[aria-label="I don\'t like it"]';
const CONFIRM_TEXT = 'Вы уверены, что хотите добавить трек в дизлайки?';

let active = false;
let skipNextClick = false;

function findDislikeButton(): HTMLElement | null {
  return document.querySelector<HTMLElement>(DISLIKE_SELECTOR);
}

/** Don't hijack the hotkey while the user is typing in a field. */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"]',
    ),
  );
}

function onClick(event: MouseEvent): void {
  const button = (event.target as Element | null)?.closest?.(DISLIKE_SELECTOR);
  if (!button) return;

  // Click triggered programmatically by the hotkey: already confirmed.
  if (skipNextClick) {
    skipNextClick = false;
    return;
  }

  if (!confirm(CONFIRM_TEXT)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.defaultPrevented) return;

  const key = event.key.toLowerCase();
  if (key !== 'd' && key !== 'в') return;
  if (isEditable(event.target)) return;

  const button = findDislikeButton();
  if (!button) return;

  if (!confirm(CONFIRM_TEXT)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  skipNextClick = true;
  button.click();
}

function apply(): void {
  if (active) return;
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeydown);
  active = true;
}

function revert(): void {
  if (!active) return;
  document.removeEventListener('click', onClick, true);
  document.removeEventListener('keydown', onKeydown);
  active = false;
}

registerTweak({
  id: 'dislikeConfirm',
  label: 'Подтверждение дизлайка',
  description: 'Спрашивает подтверждение при дизлайке, в т.ч. по хоткею «d».',
  apply,
  revert,
});
