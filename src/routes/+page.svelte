<!-- src/routes/+page.svelte (or your component file) -->
<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { fade } from 'svelte/transition';
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

  // Subscribe to WebSocket store and connect
  $effect(() => {
    wsStore.connect();
    wsStore.subscribe((msgs) => {
      messages = msgs;
      scrollToBottom();
    });
    // Cleanup on unmount
    return () => {
      wsStore.close();
    };
  });

  function sendMessage() {
    if (inputText.trim() === '') return;
    wsStore.send(inputText.trim());
    inputText = '';
    textareaRef?.focus();
    scrollToBottom();
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
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
</script>

<div class="flex flex-col h-full bg-surface-50-950">
  <!-- Chat Feed -->
  <section
    bind:this={chatContainer}
    class="flex-1 overflow-y-auto p-4 space-y-4"
    role="log"
    aria-label="Chat conversation"
  >
    {#if messages.length === 0}
      <div class="flex items-center justify-center h-full text-surface-400">
        <p>No messages yet. Start chatting!</p>
      </div>
    {:else}
      {#each messages as message (message.id)}
        <div
          class="flex {message.source === MessageSource.USER ? 'justify-end' : 'justify-start'}"
          transition:fade={{ duration: 200 }}
        >
          <div class="flex items-start gap-2 max-w-[70%]">
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
              class="card p-3 rounded-container flex items-center gap-2 {message.source === MessageSource.USER
                ? 'preset-filled-primary-500 text-surface-100'
                : 'bg-surface-100-900 text-surface-900 dark:text-surface-100'}"
              role="article"
              aria-label="{message.source === MessageSource.USER ? 'You' : 'Bot'} said at {message.timestamp}"
            >
              <p>{message.text}</p>
              <small class="opacity-60 text-xs mt-1">{message.timestamp}</small>
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
    {/if}
  </section>

  <!-- Control Panel -->
  <footer class="p-4 bg-surface-50-950 border-t border-surface-200-800/50">
    <div class="max-w-3xl mx-auto space-y-3">
      <textarea
        bind:value={inputText}
        bind:this={textareaRef}
        onkeydown="{handleKeydown}"
        oninput={adjustTextareaHeight}
        placeholder="Compose message..."
        rows="3"
        class="input resize-none w-full bg-surface-100-900 text-surface-900 dark:text-surface-100
               border-surface-200-800 focus:ring-2 focus:ring-primary-500
               transition-all duration-200 placeholder:text-surface-400"
        style="min-height: 1.5em; max-height: 7.5em; overflow-y: auto;"
        aria-label="Message input">
      </textarea>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <span class="text-xs text-surface-400" aria-live="polite">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            onclick={clearChat}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            aria-label="Clear chat"
          >
            <IconTrash size={20} class="shrink-0" />
          </button>
          <button
            onclick={handleVoice}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            aria-label="Record voice message"
          >
            <IconMic size={20} class="shrink-0" />
          </button>
          <button
            onclick={handleAttach}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            aria-label="Attach file"
          >
            <IconPaperclip size={20} class="shrink-0" />
          </button>
          <button
            onclick={sendMessage}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm
                   disabled:opacity-50 disabled:pointer-events-none"
            disabled={inputText.trim() === ''}
            aria-label="Send message"
          >
            <IconSend size={20} class="shrink-0" />
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
