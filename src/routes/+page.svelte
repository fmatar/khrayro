<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import { createWebSocketStore } from '$lib/stores/websocket';
  import { MessageSource } from '$lib/types/messageSource';
  import type { Message } from '$lib/types/message';

  const wsStore = createWebSocketStore('user');
  let messages = $state<Message[]>([]);
  let inputText = $state('');
  let chatContainer: HTMLElement;
  let username = $state('user');
  let showModal = $state(false);
  let messageToDelete = $state<string | null>(null);
  let typing = $state(false);

  const MAX_CHARACTERS = 4000;

  $effect(() => {
    wsStore.connect();
    wsStore.subscribe((msgs) => {
      messages = msgs;
      scrollToBottom();
    });
    return () => {
      wsStore.close();
    };
  });

  function sendMessage() {
    if (inputText.trim() === '' || inputText.length > MAX_CHARACTERS) return;
    wsStore.send(inputText.trim());
    inputText = '';
    scrollToBottom();
  }

  function scrollToBottom() {
    if (!chatContainer) return;
    const isNearBottom =
      chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;
    if (isNearBottom) {
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 0);
    }
  }

  function openDeleteModal(id: string) {
    messageToDelete = id;
    showModal = true;
  }

  function confirmDelete(event: Event) {
    if (messageToDelete !== null) {
      wsStore.sendDeleteMessage(messageToDelete);
      messages = messages.filter((msg) => msg.id !== messageToDelete);
      messageToDelete = null;
    }
    showModal = false;
  }

  function cancelDelete(event: Event) {
    messageToDelete = null;
    showModal = false;
  }

  function clearChat() {
    wsStore.sendClearChat();
    messages = [];
    typing = false;
  }

  function handleVoice() {
    console.log('Voice button clicked');
  }

  function handleAttach() {
    console.log('Attach button clicked');
  }

  function getMessageDate(timestamp: string): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  function shouldShowSeparator(index: number): string | null {
    if (index === 0) return getMessageDate(messages[index].timestamp);
    const currentDate = getMessageDate(messages[index].timestamp);
    const previousDate = getMessageDate(messages[index - 1].timestamp);
    return currentDate !== previousDate ? currentDate : null;
  }

  function formatTimestamp(timestamp: string): string {
    return timestamp;
  }
</script>

<div class="bg-surface-50-950 flex h-full flex-col">
  <!-- Chat Feed -->
  <div class="rounded-container flex-1 overflow-hidden">
    <section
      bind:this={chatContainer}
      class="chat-feed-scrollbar h-full flex-1 space-y-4 overflow-y-auto p-4"
      role="log"
      aria-label="Chat conversation"
    >
      {#if messages.length === 0 && !typing}
        <div class="text-surface-400 flex h-full items-center justify-center">
          <p>No messages yet. Start chatting!</p>
        </div>
      {:else}
        {#each messages as message, index (message.id)}
          <!-- Date Separator -->
          {#if shouldShowSeparator(index)}
            <div class="my-4 flex items-center">
              <div class="bg-surface-200-800 h-px flex-1"></div>
              <span class="text-surface-400 px-4 text-xs">{shouldShowSeparator(index)}</span>
              <div class="bg-surface-200-800 h-px flex-1"></div>
            </div>
          {/if}
          <div
            class="flex {message.source === MessageSource.USER ? 'justify-end' : 'justify-start'}"
          >
            <div class="group flex max-w-[70%] items-start gap-2">
              {#if message.source === MessageSource.AGENT}
                <Avatar
                  src="https://i.pravatar.cc/150?img=3"
                  name="Bot"
                  size="size-8"
                  rounded="rounded-full"
                  background="bg-surface-200-800"
                />
              {/if}
              <div
                class="card rounded-container flex items-center gap-2 p-4 text-xs {message.source === MessageSource.USER
                  ? 'preset-filled-primary-500 text-surface-100'
                  : 'bg-surface-100-900 text-surface-900 dark:text-surface-100'}"
                role="article"
                aria-label="{message.source === MessageSource.USER
                  ? 'You'
                  : 'Bot'} said at {formatTimestamp(message.timestamp)}"
              >
                <MarkdownRenderer content={message.text} />
                <small
                  class="mt-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-60 text-surface-400"
                >
                  {formatTimestamp(message.timestamp)}
                </small>
                {#if message.source === MessageSource.USER}
                  <button
                    on:click={() => openDeleteModal(message.id.toString())}
                    class="hover:bg-surface-200-800 text-surface-500 rounded-full p-1 transition-colors duration-200 hover:text-error-500"
                    aria-label="Delete this message"
                  >
                    <IconTrash size={16} class="shrink-0" />
                  </button>
                {/if}
              </div>
              {#if message.source === MessageSource.USER}
                <Avatar
                  src="https://i.pravatar.cc/150?img=48"
                  name={username}
                  size="size-8"
                  rounded="rounded-full"
                  background="bg-surface-200-800"
                />
              {/if}
            </div>
          </div>
        {/each}
        <!-- Typing Indicator -->
        {#if typing}
          <div class="flex justify-start">
            <div class="flex max-w-[70%] items-start gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=3"
                name="Bot"
                size="size-8"
                rounded="rounded-full"
                background="bg-surface-200-800"
              />
              <div
                class="card rounded-container bg-surface-100-900 text-surface-900 dark:text-surface-100 p-4 text-xs"
                role="status"
                aria-label="Bot is typing"
              >
                <p class="italic">Bot is typing...</p>
                <div class="flex gap-1">
                  <span class="bg-primary-500 inline-block h-2 w-2 rounded-full"></span>
                  <span class="bg-primary-500 inline-block h-2 w-2 rounded-full"></span>
                  <span class="bg-primary-500 inline-block h-2 w-2 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </section>
  </div>

  <ChatInput
    bind:inputText
    maxCharacters={MAX_CHARACTERS}
    messagesCount={messages.length}
    onSend={sendMessage}
    onClear={clearChat}
    onVoice={handleVoice}
    onAttach={handleAttach}
  />

  <ConfirmationModal
    open={showModal}
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
    title="Confirm Deletion"
    message="Are you sure you want to delete this message?"
  />
</div>