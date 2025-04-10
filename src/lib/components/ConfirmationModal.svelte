<script lang="ts">
  // Define props for the modal
  export let open = false;
  export let title = 'Confirm Deletion';
  export let message = 'Are you sure you want to delete this message?';

  // Event handlers passed as props from the parent
  export let onConfirm: ((event: Event) => void) | undefined = undefined;
  export let onCancel: ((event: Event) => void) | undefined = undefined;

  function confirm(event: Event) {
    if (onConfirm) onConfirm(event); // Call the parent's confirm handler if provided
    open = false;
  }

  function cancel(event: Event) {
    if (onCancel) onCancel(event); // Call the parent's cancel handler if provided
    open = false;
  }
</script>

{#if open}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 class="font-bold mb-4">{title}</h2>
      <p class="mb-6 text-sm">{message}</p>
      <div class="flex justify-end gap-4">
        <button on:click={cancel} class="btn btn-secondary text-sm">Cancel</button>
        <button on:click={confirm} class="btn btn-primary bg-error-500 text-sm">Confirm</button>
      </div>
    </div>
  </div>
{/if}

<style>
</style>
