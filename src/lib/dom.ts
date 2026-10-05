/** Helpers for locating Yandex Music controls without relying on localized labels. */

/** The `<use>` href of a button's icon, e.g. `/icons/sprite.svg#dislike_xs`. */
export function iconHref(el: Element): string {
  const use = el.querySelector('use');
  if (!use) return '';
  return use.getAttribute('href') || use.getAttribute('xlink:href') || '';
}

export function findIconButton(scope: ParentNode, suffix: string): HTMLElement | null {
  for (const button of Array.from(scope.querySelectorAll('button'))) {
    if (iconHref(button).endsWith(suffix)) return button;
  }
  return null;
}

/** Both the bottom player bar and the Vibe player bar live under a *PlayerBar* class. */
export function isInPlayerBar(el: Element): boolean {
  return el.closest('[class*="PlayerBar"]') !== null;
}
