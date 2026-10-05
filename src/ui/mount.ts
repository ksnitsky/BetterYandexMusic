import { mount } from 'svelte';
import App from './App.svelte';
import appCss from './app.css?inline';

export interface BetterYmApp {
  /** Open the settings modal from an external trigger. */
  openSettings: () => void;
}

/**
 * Mount the UI inside a shadow root so Yandex Music styles cannot leak in
 * (and ours cannot leak out). Component styles are injected manually because
 * Svelte's scoped styles target the document, not the shadow root.
 */
export function mountApp(): BetterYmApp {
  const host = document.createElement('div');
  host.id = 'betterym-root';
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = appCss;
  shadow.appendChild(style);

  const target = document.createElement('div');
  target.className = 'bym-root';
  shadow.appendChild(target);

  document.body.appendChild(host);

  return mount(App, { target }) as unknown as BetterYmApp;
}
