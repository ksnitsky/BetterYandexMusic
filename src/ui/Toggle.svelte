<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    description?: string;
    onchange: (checked: boolean) => void;
  }

  let { checked, label, description, onchange }: Props = $props();
</script>

<label class="bym-toggle">
  <span class="bym-toggle__text">
    <span class="bym-toggle__label">{label}</span>
    {#if description}
      <span class="bym-toggle__desc">{description}</span>
    {/if}
  </span>
  <input
    type="checkbox"
    {checked}
    onchange={(event) => onchange(event.currentTarget.checked)}
  />
  <span class="bym-switch" aria-hidden="true"></span>
</label>
