<script lang="ts">
  import { settings } from '../lib/settings.svelte';

  interface Props {
    onclose: () => void;
  }

  type StatusKind = 'ok' | 'error' | 'info';
  interface Status {
    kind: StatusKind;
    text: string;
  }

  let { onclose }: Props = $props();

  let importText = $state(settings.serialize());
  let status = $state<Status | null>(null);
  let fileInput: HTMLInputElement | null = $state(null);

  function setStatus(kind: StatusKind, text: string): void {
    status = { kind, text };
  }

  function refreshText(): void {
    importText = settings.serialize();
  }

  function download(): void {
    const blob = new Blob([settings.serialize()], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'betterym-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('ok', 'Файл настроек скачан');
  }

  async function onFile(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    applyImport(text);
    input.value = '';
  }

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(settings.serialize());
      setStatus('ok', 'Скопировано в буфер обмена');
    } catch {
      setStatus('error', 'Не удалось скопировать — скопируйте вручную');
    }
  }

  function applyImport(text: string): void {
    const result = settings.importJSON(text);
    if (result.ok) {
      refreshText();
      setStatus('ok', 'Настройки импортированы');
    } else {
      setStatus('error', result.error ?? 'Ошибка импорта');
    }
  }

  function reset(): void {
    settings.reset();
    refreshText();
    setStatus('info', 'Сброшено к значениям по умолчанию');
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') onclose();
  }

  $effect(() => {
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });

  // Keep the export textarea in sync with the store (toggle changes, reset).
  $effect(() => {
    importText = settings.serialize();
  });
</script>

<div
  class="bym-overlay"
  role="presentation"
  onclick={(event) => {
    if (event.target === event.currentTarget) onclose();
  }}
>
  <div class="bym-dialog" role="dialog" aria-modal="true" aria-label="Настройки Better Yandex Music">
    <header class="bym-dialog__header">
      <h2 class="bym-dialog__title">Better Yandex Music</h2>
      <button
        class="bym-dialog__close"
        type="button"
        aria-label="Закрыть"
        onclick={onclose}
      >
        ×
      </button>
    </header>

    <div class="bym-dialog__body">
      <section class="bym-section">
        <h3 class="bym-section__title">Экспорт / импорт</h3>
        <div class="bym-actions">
          <button class="bym-btn" type="button" onclick={download}>Скачать</button>
          <button
            class="bym-btn"
            type="button"
            onclick={() => fileInput?.click()}
          >
            Загрузить
          </button>
          <button class="bym-btn" type="button" onclick={copy}>
            Скопировать
          </button>
          <button
            class="bym-btn bym-btn--primary"
            type="button"
            onclick={() => applyImport(importText)}
          >
            Применить текст
          </button>
          <button
            class="bym-btn bym-btn--danger"
            type="button"
            onclick={reset}
          >
            Сбросить
          </button>
        </div>

        <textarea
          class="bym-textarea"
          spellcheck="false"
          bind:value={importText}
          aria-label="JSON настроек"
        ></textarea>

        {#if status}
          <p
            class="bym-status bym-status--{status.kind}"
            role="status"
          >
            {status.text}
          </p>
        {/if}
      </section>
    </div>
  </div>
</div>

<input
  class="bym-file-input"
  type="file"
  accept="application/json,.json"
  bind:this={fileInput}
  onchange={onFile}
  hidden
/>
