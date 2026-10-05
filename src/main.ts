import './tweaks/volumeSlider';
import './tweaks/controlsOrder';
import './tweaks/dislikeConfirm';

import { settings } from './lib/settings.svelte';
import { startTweaks } from './lib/tweaks.svelte';
import { mountApp } from './ui/mount';

function boot(): void {
  settings.load();
  startTweaks();

  const app = mountApp();

  // Temporary handle: lets an external trigger (e.g. the user menu icon) open
  // the modal until we wire it to the real element.
  (window as unknown as { betterym?: unknown }).betterym = app;

  console.log('[BETTERYM] Готово');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
