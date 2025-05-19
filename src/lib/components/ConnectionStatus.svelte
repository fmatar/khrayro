<script lang="ts">
  import { ConnectionState } from '$lib/stores/websocket';

  export let connState: ConnectionState;
</script>

{#if connState === ConnectionState.CONNECTING}
  <p>Connecting...</p>
{:else if connState === ConnectionState.CONNECTED}
  <p>Connected</p>
{:else if connState === ConnectionState.DISCONNECTED}
  <p>Disconnected</p>
{:else}
  <p>Unknown state</p>
{/if}
