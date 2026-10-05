<script lang="ts">
  import { settings } from '../lib/settings.svelte';
  import { MESSAGES, detectLang } from '../lib/i18n';

  interface Props {
    onclose: () => void;
  }

  type StatusKind = 'ok' | 'error' | 'info';
  interface Status {
    kind: StatusKind;
    text: string;
  }

  let { onclose }: Props = $props();

  const messages = MESSAGES[detectLang()];

  let status = $state<Status | null>(null);
  let fileInput: HTMLInputElement | null = $state(null);

  function setStatus(kind: StatusKind, text: string): void {
    status = { kind, text };
  }

  function backup(): void {
    const blob = new Blob([settings.serialize()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'betterym-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('ok', messages.statusBackup);
  }

  async function onFile(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const result = settings.importJSON(await file.text());
    if (result.ok) {
      setStatus('ok', messages.statusImported);
    } else {
      setStatus('error', messages.statusImportError);
    }
    input.value = '';
  }

  function reset(): void {
    settings.reset();
    setStatus('info', messages.statusReset);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') onclose();
  }

  $effect(() => {
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<div
  class="bym-overlay"
  role="presentation"
  onclick={(event) => {
    if (event.target === event.currentTarget) onclose();
  }}
>
  <div class="bym-dialog" role="dialog" aria-modal="true" aria-label="Better Yandex Music">
    <header class="bym-dialog__header">
      <h2 class="bym-dialog__title">{messages.exportImport}</h2>
      <button
        class="bym-dialog__close"
        type="button"
        aria-label="×"
        onclick={onclose}
      >
        ×
      </button>
    </header>

    <div class="bym-dialog__body">
      <div class="bym-actions">
        <button class="bym-btn bym-btn--primary" type="button" onclick={backup}>
          {messages.backup}
        </button>
        <button class="bym-btn" type="button" onclick={() => fileInput?.click()}>
          {messages.importSettings}
        </button>
        <button class="bym-btn bym-btn--danger" type="button" onclick={reset}>
          {messages.resetDefaults}
        </button>
      </div>

      {#if status}
        <p class="bym-status bym-status--{status.kind}" role="status">
          {status.text}
        </p>
      {/if}
    </div>
  </div>
</div>

<input
  type="file"
  accept="application/json,.json"
  bind:this={fileInput}
  onchange={onFile}
  hidden
/>
