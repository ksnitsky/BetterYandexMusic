import { mount, unmount } from 'svelte';
import SettingsSection from './SettingsSection.svelte';
import { createShadowHost } from './mount';
import { detectLang } from '../lib/i18n';

const LIST_SELECTOR = 'ul[class*="Settings_root"]';
const SWITCH_SELECTOR = 'button[role="switch"]';
const TITLE_SELECTOR = '[class*="SettingsListToggleItem_title"]';
const DESC_SELECTOR = '[class*="SettingsListToggleItem_description"]';
const ROW_SELECTOR = '[class*="SettingsListToggleItem_root"]';
const ITEM_SELECTOR = 'li[class*="Settings_item"]';

let host: HTMLElement | null = null;
let instance: Record<string, unknown> | null = null;

/**
 * Copy the real settings rows' font metrics and the native switch geometry so
 * the block blends in. Colors come from YM CSS vars (app.css), which stay in
 * sync with the theme automatically; font geometry does not change with theme.
 */
function sampleMetrics(): Record<string, string> {
  const vars: Record<string, string> = {};
  const q = (selector: string) => document.querySelector<HTMLElement>(selector);

  const title = q(TITLE_SELECTOR);
  if (title) {
    const s = getComputedStyle(title);
    vars['--bym-label-size'] = s.fontSize;
    vars['--bym-label-weight'] = s.fontWeight;
    vars['--bym-label-lh'] = s.lineHeight;
  }

  const desc = q(DESC_SELECTOR);
  if (desc) {
    const s = getComputedStyle(desc);
    vars['--bym-desc-size'] = s.fontSize;
    vars['--bym-desc-weight'] = s.fontWeight;
    vars['--bym-desc-lh'] = s.lineHeight;
  }

  const row = q(ROW_SELECTOR);
  if (row) {
    const s = getComputedStyle(row);
    vars['--bym-row-pad-top'] = s.paddingTop;
    vars['--bym-row-pad-x'] = '0px';
    vars['--bym-row-pad-bottom'] = '0px';
  }

  const item = q(ITEM_SELECTOR);
  if (item) {
    vars['--bym-row-pad-bottom'] = getComputedStyle(item).paddingBottom;
  }

  const sw = q(SWITCH_SELECTOR);
  if (sw) {
    const box = sw.getBoundingClientRect();
    const knob = sw.querySelector<HTMLElement>('span > div, div');
    const knobBox = knob?.getBoundingClientRect();
    vars['--bym-switch-w'] = `${box.width}px`;
    vars['--bym-switch-h'] = `${box.height}px`;
    if (knobBox) {
      const pad = (box.height - knobBox.height) / 2;
      vars['--bym-switch-knob'] = `${knobBox.height}px`;
      vars['--bym-switch-pad'] = `${pad}px`;
      vars['--bym-switch-travel'] = `${box.width - knobBox.height - 2 * pad}px`;
    }
  }

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

function mountSection(list: Element, onopen: () => void): void {
  // <li> can't host a shadow root, so wrap a div host in a display:contents
  // <li>. Everything collapses, and the section stays inside the settings list
  // (inheriting its width, spacing and font context).
  const wrapper = document.createElement('li');
  wrapper.style.display = 'contents';

  const created = createShadowHost('betterym-settings', 'div');
  created.host.style.display = 'contents';
  wrapper.appendChild(created.host);

  for (const [name, value] of Object.entries(sampleMetrics())) {
    created.target.style.setProperty(name, value);
  }

  list.appendChild(wrapper);
  host = wrapper;
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

    if (host?.isConnected && host.parentElement === list) return;
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
