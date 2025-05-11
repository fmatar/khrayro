<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import IconSend from '@lucide/svelte/icons/send';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import IconMic from '@lucide/svelte/icons/mic';
  import IconPaperclip from '@lucide/svelte/icons/paperclip';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import { createWebSocketStore } from '$lib/stores/websocket';
  import { MessageSource } from '$lib/types/messageSource';
  import type { Message } from '$lib/types/message';

  const wsStore = createWebSocketStore('user');
  let messages = $state<Message[]>([]);
  let inputText = $state('');
  let chatContainer: HTMLElement;
  let textareaRef: HTMLTextAreaElement;
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
    textareaRef?.focus();
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
    return timestamp; // Customize as needed
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
                    onclick={() => openDeleteModal(message.id.toString())}
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

  <!-- Control Panel -->
  <footer class="p-4">
    <div class="mx-auto max-w-3xl space-y-3">
      <div
        class="border-surface-200-800 focus-within:border-primary-500 overflow-hidden rounded border transition-all duration-200"
      >
        <textarea
          bind:value={inputText}
          bind:this={textareaRef}
          onkeydown={handleKeydown}
          oninput={adjustTextareaHeight}
          placeholder="Compose message..."
          rows="3"
          class="input textarea-scrollbar w-full resize-none border-none bg-surface-100-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 text-xs transition-all duration-200 focus:ring-0 pr-6"
          aria-label="Message input"
        >
        </textarea>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-surface-400 text-xs" aria-live="polite">
            {messages.length}
            {messages.length === 1 ? 'message' : 'messages'}
          </span>
          <span class="text-surface-400 text-xs" aria-live="polite">
            {inputText.length}/{MAX_CHARACTERS}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            onclick={clearChat}
            class="bg-primary-500 hover:bg-primary-600 text-surface-100 rounded-full p-2 shadow-sm transition-colors duration-200"
            aria-label="Clear chat"
          >
            <IconTrash size={16} class="shrink-0" />
          </button>
          <button
            onclick={handleVoice}
            class="bg-primary-500 hover:bg-primary-600 text-surface-100 rounded-full p-2 shadow-sm transition-colors duration-200"
            aria-label="Record voice message"
          >
            <IconMic size={16} class="shrink-0" />
          </button>
          <button
            onclick={handleAttach}
            class="bg-primary-500 hover:bg-primary-600 text-surface-100 rounded-full p-2 shadow-sm transition-colors duration-200"
            aria-label="Attach file"
          >
            <IconPaperclip size={16} class="shrink-0" />
          </button>
          <button
            onclick={sendMessage}
            class="bg-primary-500 hover:bg-primary-600 text-surface-100 rounded-full p-2 shadow-sm transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50"
            disabled={inputText.trim() === '' || inputText.length > MAX_CHARACTERS}
            aria-label="Send message"
          >
            <IconSend size={16} class="shrink-0" />
          </button>
        </div>
      </div>
    </div>
  </footer>

  <ConfirmationModal
    open={showModal}
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
    title="Confirm Deletion"
    message="Are you sure you want to delete this message?"
  />
</div>

<style>
  .input {
    box-sizing: border-box;
    min-height: 1.5em;
    max-height: 7.5em;
    overflow-y: auto;
  }
</style>
