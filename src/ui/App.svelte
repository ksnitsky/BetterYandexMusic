<script lang="ts">
  import SettingsModal from './SettingsModal.svelte';

  let open = $state(false);

  export function openSettings(): void {
    open = true;
  }
</script>

{#if open}
  <SettingsModal onclose={() => (open = false)} />
{/if}
