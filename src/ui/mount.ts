import { mount } from 'svelte';
import App from './App.svelte';
import appCss from './app.css?inline';

export interface BetterYmApp {
  /** Open the settings modal from any trigger. */
  openSettings: () => void;
}

/**
 * Create a host element with a shadow root and our styles injected inside, so
 * Yandex Music's CSS cannot leak in (and ours cannot leak out).
 */
export function createShadowHost(
  id: string,
  css: string = appCss,
): { host: HTMLDivElement; target: HTMLDivElement } {
  const host = document.createElement('div');
  host.id = id;

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = css;
  shadow.appendChild(style);

  const target = document.createElement('div');
  target.className = 'bym-root';
  shadow.appendChild(target);

  return { host, target };
}

/** Mount the modal app (overlay) and expose a programmatic open function. */
export function mountApp(): BetterYmApp {
  const { host, target } = createShadowHost('betterym-root');
  document.body.appendChild(host);
  return mount(App, { target }) as unknown as BetterYmApp;
}
