<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import IconSend from '@lucide/svelte/icons/send';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import IconMic from '@lucide/svelte/icons/mic';
  import IconPaperclip from '@lucide/svelte/icons/paperclip';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import type { Message } from '$lib/stores/websocket';
  import { createWebSocketStore } from '$lib/stores/websocket';
  import { MessageSource } from '$lib/types/messageSource';

  // Initialize WebSocket store
  const wsStore = createWebSocketStore('user');
  let messages = $state<Message[]>([]);
  let inputText = $state('');
  let chatContainer: HTMLElement;
  let textareaRef: HTMLTextAreaElement;
  let username = $state('user');
  let showModal = $state(false);
  let messageToDelete = $state<number | null>(null);
  let typing = $state(false); // Track if the bot is typing

  // Character limit for textarea
  const MAX_CHARACTERS = 500;

  // Subscribe to WebSocket store and connect
  $effect(() => {
    wsStore.connect();
    wsStore.subscribe((msgs) => {
      messages = msgs;
      typing = false; // Bot has responded, stop typing
      scrollToBottom();
    });
    // Cleanup on unmount
    return () => {
      wsStore.close();
    };
  });

  function sendMessage() {
    if (inputText.trim() === '' || inputText.length > MAX_CHARACTERS) return;
    wsStore.send(inputText.trim());
    typing = true; // Bot starts typing when user sends a message
    inputText = '';
    textareaRef?.focus();
    scrollToBottom();
  }

  function scrollToBottom() {
    if (!chatContainer) return;

    // Only auto-scroll if the user is near the bottom (within 100px)
    const isNearBottom =
      chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;
    if (isNearBottom) {
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 0);
    }
  }

  function openDeleteModal(id: number) {
    messageToDelete = id;
    showModal = true;
  }

  function confirmDelete(event: Event) {
    if (messageToDelete !== null) {
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
    messages = [];
    typing = false; // Reset typing state
    textareaRef?.focus();
  }

  function handleVoice() {
    console.log('Voice button clicked');
  }

  function handleAttach() {
    console.log('Attach button clicked');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function adjustTextareaHeight() {
    if (textareaRef) {
      textareaRef.style.height = 'auto';
      const scrollHeight = textareaRef.scrollHeight;
      const lineHeight = parseFloat(getComputedStyle(textareaRef).lineHeight);
      const maxHeight = lineHeight * 5;
      textareaRef.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }

  // Group messages by date for separators
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

  // Determine if a separator should be shown before a message
  function shouldShowSeparator(index: number): string | null {
    if (index === 0) return getMessageDate(messages[index].timestamp);
    const currentDate = getMessageDate(messages[index].timestamp);
    const previousDate = getMessageDate(messages[index - 1].timestamp);
    return currentDate !== previousDate ? currentDate : null;
  }
</script>

<div class="flex flex-col h-full bg-surface-50-950">
  <!-- Chat Feed -->
  <div class="flex-1 rounded-container overflow-hidden">
    <section
      bind:this={chatContainer}
      class="flex-1 overflow-y-auto p-4 space-y-4 chat-feed-scrollbar h-full"
      role="log"
      aria-label="Chat conversation"
    >
      {#if messages.length === 0 && !typing}
        <div class="flex items-center justify-center h-full text-surface-400">
          <p>No messages yet. Start chatting!</p>
        </div>
      {:else}
        {#each messages as message, index (message.id)}
          <!-- Date Separator -->
          {#if shouldShowSeparator(index)}
            <div class="flex items-center my-4">
              <div class="flex-1 h-px bg-surface-200-800"></div>
              <span class="px-4 text-xs text-surface-400">{shouldShowSeparator(index)}</span>
              <div class="flex-1 h-px bg-surface-200-800"></div>
            </div>
          {/if}
          <div
            class="flex {message.source === MessageSource.USER ? 'justify-end' : 'justify-start'}"
          >
            <div class="flex items-start gap-2 max-w-[70%] group">
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
                class="card p-4 text-xs rounded-container flex items-center gap-2 {message.source === MessageSource.USER
                  ? 'preset-filled-primary-500 text-surface-100'
                  : 'bg-surface-100-900 text-surface-900 dark:text-surface-100'}"
                role="article"
                aria-label="{message.source === MessageSource.USER ? 'You' : 'Bot'} said at {message.timestamp}"
              >
                <p>{message.text}</p>
                <small class="opacity-0 group-hover:opacity-60 text-xs mt-1 transition-opacity duration-200">
                  {message.timestamp}
                </small>
                {#if message.source === MessageSource.USER}
                  <button
                    onclick={() => openDeleteModal(message.id)}
                    class="p-1 rounded-full hover:bg-surface-200-800 text-surface-500 hover:text-red-500 transition-colors duration-200"
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
            <div class="flex items-start gap-2 max-w-[70%]">
              <Avatar
                src="https://i.pravatar.cc/150?img=3"
                name="Bot"
                size="size-8"
                rounded="rounded-full"
                background="bg-surface-200-800"
              />
              <div
                class="card p-4 text-xs rounded-container bg-surface-100-900 text-surface-900 dark:text-surface-100"
                role="status"
                aria-label="Bot is typing"
              >
                <p class="italic">Bot is typing...</p>
                <div class="flex gap-1">
                  <span class="inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span class="inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span class="inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </section>
  </div>

  <!-- Control Panel -->
  <footer class="p-4">
    <div class="max-w-3xl mx-auto space-y-3">
      <div class="border border-surface-200-800 focus-within:border-primary-500 rounded transition-all duration-200 overflow-hidden">
        <textarea
          bind:value={inputText}
          bind:this={textareaRef}
          onkeydown={handleKeydown}
          oninput={adjustTextareaHeight}
          placeholder="Compose message..."
          rows="3"
          class="input resize-none w-full bg-surface-100-900 text-surface-900 dark:text-surface-100 text-xs
                 border-none focus:ring-0
                 transition-all duration-200 placeholder:text-surface-400
                 pr-6 textarea-scrollbar"
          style="min-height: 1.5em; max-height: 7.5em; overflow-y: auto; box-sizing: border-box;"
          aria-label="Message input">
        </textarea>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-xs text-surface-400" aria-live="polite">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </span>
          <span class="text-xs text-surface-400" aria-live="polite">
            {inputText.length}/{MAX_CHARACTERS}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            onclick={clearChat}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            aria-label="Clear chat"
          >
            <IconTrash size={16} class="shrink-0" />
          </button>
          <button
            onclick={handleVoice}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            aria-label="Record voice message"
          >
            <IconMic size={16} class="shrink-0" />
          </button>
          <button
            onclick={handleAttach}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            aria-label="Attach file"
          >
            <IconPaperclip size={16} class="shrink-0" />
          </button>
          <button
            onclick={sendMessage}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm
                   disabled:opacity-50 disabled:pointer-events-none"
            disabled={inputText.trim() === '' || inputText.length > MAX_CHARACTERS}
            aria-label="Send message"
          >
            <IconSend size={16} class="shrink-0" />
          </button>
        </div>
      </div>
    </div>
  </footer>

  <!-- Confirmation Modal -->
  <ConfirmationModal
    open={showModal}
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
    title="Confirm Deletion"
    message="Are you sure you want to delete this message?"
  />
</div>

<style>
  /* Ensure box-sizing is applied */
  .input {
    box-sizing: border-box;
  }
</style>
