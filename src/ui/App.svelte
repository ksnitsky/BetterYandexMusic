<script lang="ts">
  import SettingsModal from './SettingsModal.svelte';

  let open = $state(false);

  export function openSettings(): void {
    open = true;
  }
</script>

<button
  class="bym-fab"
  type="button"
  title="Better Yandex Music — настройки"
  aria-label="Настройки Better Yandex Music"
  onclick={() => (open = true)}
>
  ⚙
</button>

{#if open}
  <SettingsModal onclose={() => (open = false)} />
{/if}
