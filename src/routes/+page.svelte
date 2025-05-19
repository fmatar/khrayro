<script lang="ts">
  import { onMount } from 'svelte';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import ChatFeed from '$lib/components/ChatFeed.svelte';
  import ConnectionStatus from '$lib/components/ConnectionStatus.svelte';
  import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
  import { createWebSocketStore } from '$lib/stores/websocket';

  export let username = 'user';
  const MAX_CHARACTERS = 4000;

  const ws = createWebSocketStore(username);
  const { state: connState, error: connError } = ws;
  const messages = { subscribe: ws.subscribe };

  let inputText = '';
  let showModal = false;
  let messageToDelete: string | null = null;
  let typing = false; // TODO: wire when backend sends TYPING frames

  onMount(() => {
    ws.connect();
    return () => ws.close();
  });

  function sendMessage() {
    if (!inputText.trim() || inputText.length > MAX_CHARACTERS) return;
    ws.send(inputText.trim());
    inputText = '';
  }

  function openDeleteModal(id: string) {
    messageToDelete = id;
    showModal = true;
  }

  function confirmDelete() {
    if (messageToDelete) ws.sendDeleteMessage(messageToDelete);
    showModal = false;
    messageToDelete = null;
  }

  function cancelDelete() {
    showModal = false;
    messageToDelete = null;
  }

  function clearChat() {
    ws.sendClearChat();
    typing = false;
  }
</script>

<div class="bg-surface-50-950 flex h-full flex-col">
  <ConnectionStatus connState={$connState} />
  <ErrorDisplay connError={$connError} />
  <div class="rounded-container flex-1 overflow-hidden">
    <ChatFeed messages={$messages} typing={typing} username={username} openDeleteModal={openDeleteModal} />
  </div>
  <ChatInput
    bind:inputText
    maxCharacters={MAX_CHARACTERS}
    messagesCount={$messages.length}
    onSend={sendMessage}
    onClear={clearChat}
    onVoice={() => console.log('Voice')}
    onAttach={() => console.log('Attach')}
  />
  <ConfirmationModal
    open={showModal}
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
    title="Confirm Deletion"
    message="Are you sure you want to delete this message?"
  />
</div>
