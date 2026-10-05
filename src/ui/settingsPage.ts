import { mount, unmount } from 'svelte';
import SettingsSection from './SettingsSection.svelte';
import { createShadowHost } from './mount';
import { detectLang } from '../lib/i18n';

const CONTENT_SELECTOR = '[class*="SettingsPage_content"]';
const LIST_SELECTOR = 'ul[class*="Settings_root"]';
const TITLE_SELECTOR =
  '[class*="SettingsListToggleItem_title"], [class*="SettingsListButtonItem_title"]';
const DESC_SELECTOR =
  '[class*="SettingsListToggleItem_description"], [class*="SettingsListButtonItem_description"]';

let host: HTMLDivElement | null = null;
let instance: Record<string, unknown> | null = null;

function darkByLuminance(color: string): boolean {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return false;
  const [r, g, b, a = 1] = match[1].split(',').map((part) => parseFloat(part));
  if (a === 0) return false;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

function backgroundColorOf(node: Element | null): string {
  let el = node;
  while (el) {
    const color = getComputedStyle(el).backgroundColor;
    if (color && color !== 'transparent' && !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(color)) {
      return color;
    }
    el = el.parentElement;
  }
  return 'rgb(255, 255, 255)';
}

/** Sample the surrounding settings UI so the block matches YM's current theme. */
function themeVars(): Record<string, string> {
  const title = document.querySelector(TITLE_SELECTOR);
  const desc = document.querySelector(DESC_SELECTOR);
  const dark = darkByLuminance(backgroundColorOf(document.querySelector(CONTENT_SELECTOR)));

  const vars: Record<string, string> = {
    '--bym-border': dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)',
    '--bym-bg-soft': dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
  };

  if (title) {
    const style = getComputedStyle(title);
    vars['--bym-fg'] = style.color;
    vars['--bym-font'] = style.fontFamily;
  }
  if (desc) vars['--bym-fg-dim'] = getComputedStyle(desc).color;

  return vars;
}

function destroy(): void {
  if (instance) {
    unmount(instance);
    instance = null;
  }
  host?.remove();
  host = null;
}

function mountSection(anchor: Element, onopen: () => void): void {
  const created = createShadowHost('betterym-settings');
  // Let the shadow content participate in the page layout as if it were a
  // direct child of the settings content container.
  created.host.style.display = 'contents';

  for (const [name, value] of Object.entries(themeVars())) {
    created.target.style.setProperty(name, value);
  }

  anchor.after(created.host);
  host = created.host;
  instance = mount(SettingsSection, {
    target: created.target,
    props: { onopen, lang: detectLang() },
  }) as Record<string, unknown>;
}

/**
 * Inject the Better Yandex Music block into the settings page. YM is an SPA and
 * re-renders the page, so we re-add the block whenever it disappears.
 */
export function startSettingsPage(openSettings: () => void): void {
  let scheduled = false;

  const sync = (): void => {
    scheduled = false;

    const onSettings = location.pathname.startsWith('/settings');
    const list = document.querySelector(LIST_SELECTOR);

    if (!onSettings || !list) {
      if (host) destroy();
      return;
    }

    if (host?.isConnected) return;
    if (host) destroy();
    mountSection(list, openSettings);
  };

  const schedule = (): void => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  };

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  schedule();
}
