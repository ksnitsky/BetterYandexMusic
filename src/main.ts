import './tweaks/volumeSlider';
import './tweaks/controlsOrder';
import './tweaks/dislikeConfirm';

import { settings } from './lib/settings.svelte';
import { startTweaks } from './lib/tweaks.svelte';
import { mountApp } from './ui/mount';
import { startSettingsPage } from './ui/settingsPage';

function boot(): void {
  settings.load();
  startTweaks();

  const app = mountApp();
  startSettingsPage(app.openSettings);

  (window as unknown as { betterym?: unknown }).betterym = app;

  console.log('[BETTERYM] Готово');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
