<script lang="ts">
  export let connError: string | null;
</script>

{#if connError}
  <p class="text-error-500 mb-2">{connError}</p>
{/if}
