<script lang="ts">
  import { ConnectionState } from '$lib/stores/websocket';

  export let connState: ConnectionState;
</script>

{#if connState === 'CONNECTING'}
  <div class="text-yellow-600 dark:text-yellow-300 text-sm">Connecting...</div>
{:else if connState === 'CONNECTED'}
  <div class="text-green-600 dark:text-green-300 text-sm">Connected</div>
{:else if connState === 'DISCONNECTED'}
  <div class="text-red-600 dark:text-red-300 text-sm">Disconnected. Reconnecting...</div>
{:else if connState === 'ERROR'}
  <div class="text-red-600 dark:text-red-300 text-sm">Connection error</div>
{/if}
