<script lang="ts">
  import { settings } from '../lib/settings.svelte';
  import { getTweaks } from '../lib/tweaks.svelte';
  import { MESSAGES, type Lang } from '../lib/i18n';
  import Toggle from './Toggle.svelte';

  interface Props {
    onopen: () => void;
    lang: Lang;
  }

  let { onopen, lang }: Props = $props();

  const tweaks = getTweaks();
  const messages = $derived(MESSAGES[lang]);
</script>

<section class="bym-settings">
  <h3 class="bym-settings__heading">{messages.heading}</h3>

  <div class="bym-settings__list">
    {#each tweaks as tweak (tweak.id)}
      <Toggle
        checked={settings.tweaks[tweak.id]}
        label={messages.tweaks[tweak.id].label}
        description={messages.tweaks[tweak.id].description}
        onchange={(checked) => settings.set(tweak.id, checked)}
      />
    {/each}

    <button class="bym-settings__action" type="button" onclick={onopen}>
      <span>{messages.exportImport}</span>
      <svg class="bym-settings__arrow" focusable="false" aria-hidden="true">
        <use href="/icons/sprite.svg#arrowRight_xs"></use>
      </svg>
    </button>
  </div>
</section>
