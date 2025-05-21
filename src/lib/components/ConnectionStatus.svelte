<script lang="ts">
  import { ConnectionState } from '$lib/stores/websocket';

  export let connState: ConnectionState;
</script>

<div class="flex items-center justify-center py-2">
  {#if connState === ConnectionState.CONNECTING}
    <span class="inline-flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
      <span class="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
      Connecting...
    </span>
  {:else if connState === ConnectionState.CONNECTED}
    <span class="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
      <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
      Connected
    </span>
  {:else if connState === ConnectionState.DISCONNECTED}
    <span class="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
      <span class="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
      Disconnected
    </span>
  {:else}
    <span class="inline-flex items-center gap-2 text-sm text-surface-400">
      <span class="h-2 w-2 rounded-full bg-gray-400"></span>
      Unknown state
    </span>
  {/if}
</div>
