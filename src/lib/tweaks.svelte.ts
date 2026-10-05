import { settings, type TweakId } from './settings.svelte';

export interface Tweak {
  id: TweakId;
  label: string;
  description: string;
  /** Idempotent: safe to call repeatedly while enabled. */
  apply(): void;
  /** Restore the page to its original state. */
  revert(): void;
}

const registry: Tweak[] = [];
const active = new Map<TweakId, boolean>();

export function registerTweak(tweak: Tweak): void {
  registry.push(tweak);
}

export function getTweaks(): Tweak[] {
  return registry;
}

/**
 * Reconcile the DOM with the current settings.
 * Enabled tweaks are (re)applied idempotently; disabled tweaks are reverted
 * only on a true -> false transition, so we never fight React while disabled.
 */
export function syncTweaks(): void {
  for (const tweak of registry) {
    const enabled = settings.tweaks[tweak.id];
    const was = active.get(tweak.id) ?? false;

    if (enabled) {
      try {
        tweak.apply();
        active.set(tweak.id, true);
      } catch (error) {
        console.warn(`[BETTERYM] Твик "${tweak.id}" упал:`, error);
      }
    } else if (was) {
      try {
        tweak.revert();
      } catch (error) {
        console.warn(`[BETTERYM] Не удалось откатить "${tweak.id}":`, error);
      }
      active.set(tweak.id, false);
    }
  }
}

/** Reactively re-apply tweaks whenever a toggle changes. */
function watchSettings(): void {
  $effect.root(() => {
    $effect(() => {
      // Touch every toggle so the effect tracks all of them.
      void settings.tweaks.volumeSlider;
      void settings.tweaks.controlsOrder;
      void settings.tweaks.dislikeConfirm;
      syncTweaks();
    });
  });
}

/**
 * Yandex Music is a React SPA: changing a track can re-render the player bar
 * and wipe our DOM changes. Keep a debounced observer that re-applies only the
 * enabled tweaks instead of disconnecting after the first success.
 */
function watchDom(): void {
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncTweaks();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
}

export function startTweaks(): void {
  syncTweaks();
  watchSettings();
  watchDom();
  console.log('[BETTERYM] Твики запущены:', registry.map((t) => t.id).join(', '));
}
