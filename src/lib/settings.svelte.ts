export type TweakId = 'volumeSlider' | 'controlsOrder' | 'dislikeConfirm';

export type TweakToggles = Record<TweakId, boolean>;

export interface SettingsData {
  version: number;
  tweaks: TweakToggles;
}

/** v2: prefix bumped after the UI rewrite. */
export const STORAGE_KEY = 'betterym.settings.v2';
export const SETTINGS_VERSION = 2;

export const DEFAULT_TWEAKS: TweakToggles = {
  volumeSlider: true,
  controlsOrder: true,
  dislikeConfirm: true,
};

const TWEAK_IDS = Object.keys(DEFAULT_TWEAKS) as TweakId[];

function log(...args: unknown[]): void {
  console.log('[BETTERYM]', ...args);
}

/** Keep only known boolean tweak ids; everything else falls back to defaults. */
function sanitize(input: unknown): TweakToggles {
  const result: TweakToggles = { ...DEFAULT_TWEAKS };
  if (!input || typeof input !== 'object') return result;

  const tweaks = (input as { tweaks?: unknown }).tweaks;
  if (!tweaks || typeof tweaks !== 'object') return result;

  for (const id of TWEAK_IDS) {
    const value = (tweaks as Record<string, unknown>)[id];
    if (typeof value === 'boolean') result[id] = value;
  }
  return result;
}

class SettingsStore {
  tweaks = $state<TweakToggles>({ ...DEFAULT_TWEAKS });

  load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      this.tweaks = sanitize(JSON.parse(raw));
      log('Настройки загружены:', this.tweaks);
    } catch (error) {
      console.warn('[BETTERYM] Не удалось загрузить настройки:', error);
    }
  }

  set(id: TweakId, enabled: boolean): void {
    this.tweaks[id] = enabled;
    this.persist();
  }

  toggle(id: TweakId): void {
    this.set(id, !this.tweaks[id]);
  }

  reset(): void {
    this.tweaks = { ...DEFAULT_TWEAKS };
    this.persist();
  }

  persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
    } catch (error) {
      console.warn('[BETTERYM] Не удалось сохранить настройки:', error);
    }
  }

  toJSON(): SettingsData {
    return { version: SETTINGS_VERSION, tweaks: { ...this.tweaks } };
  }

  serialize(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  /** Parse and apply an exported JSON blob. Never throws. */
  importJSON(text: string): { ok: boolean; error?: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: 'Некорректный JSON' };
    }

    const tweaks = sanitize(parsed);
    this.tweaks = tweaks;
    this.persist();
    log('Настройки импортированы:', tweaks);
    return { ok: true };
  }
}

export const settings = new SettingsStore();
