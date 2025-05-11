<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import { MessageSource } from '$lib/types/messageSource';
  import type { WebSocketMessage } from '$lib/types/ws_message';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';

  let {
    messages = [] as WebSocketMessage[],
    typing = false,
    onDelete = () => {},
    chatContainer = null as HTMLElement | null,
  } = $props();

  // Use $derived for filtered chat messages, with fallback for undefined
  let chatMessages = $derived((messages || []).filter((msg) => msg.type === 'CHAT_MESSAGE'));

  // Debug logging with $effect
  $effect(() => {
    console.log('ChatMessages: messages=', messages);
    console.log('ChatMessages: chatMessages=', chatMessages);
  });

  function getMessageDate(timestamp: string): string {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Unknown Date'; // Fallback for invalid dates
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
    if (index === 0) return getMessageDate(chatMessages[index].ts);
    const currentDate = getMessageDate(chatMessages[index].ts);
    const previousDate = getMessageDate(chatMessages[index - 1].ts);
    return currentDate !== previousDate ? currentDate : null;
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function handleDeleteClick(id: string) {
    onDelete(id);
  }
</script>

<section
  bind:this={chatContainer}
  class="chat-feed-scrollbar h-full flex-1 space-y-4 overflow-y-auto p-4"
  role="log"
  aria-label="Chat conversation"
>
  {#if chatMessages.length === 0 && !typing}
    <div class="text-surface-400 flex h-full items-center justify-center">
      <p>No messages yet. Start chatting!</p>
    </div>
  {:else}
    {#each chatMessages as message, index (message.id)}
      {#if shouldShowSeparator(index)}
        <div class="my-4 flex items-center">
          <div class="bg-surface-200-800 h-px flex-1"></div>
          <span class="text-surface-400 px-4 text-xs">{shouldShowSeparator(index)}</span>
          <div class="bg-surface-200-800 h-px flex-1"></div>
        </div>
      {/if}

      <div class="flex {message.from === MessageSource.USER ? 'justify-end' : 'justify-start'}">
        <div class="group flex max-w-[70%] items-start gap-2">
          {#if message.from === MessageSource.AGENT}
            <Avatar
              src="https://i.pravatar.cc/150?img=3"
              name="Bot"
              size="size-8"
              rounded="rounded-full"
              background="bg-surface-200-800"
            />
          {/if}

          <div
            class="card rounded-container flex flex-col p-4 text-xs preset-filled-secondary-500 text-surface-900"
            role="article"
            aria-label="{message.from === MessageSource.USER ? 'You' : 'Bot'} said at {formatTimestamp(message.ts)}"
          >
            <div class="flex-1">
              <MarkdownRenderer content={message.message || ''} />
            </div>
            <div class="flex items-center justify-between mt-1">
              <small
                class="text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-60 text-surface-400"
              >
                {formatTimestamp(message.ts)}
              </small>
              {#if message.from === MessageSource.USER}
                <button
                  on:click={() => handleDeleteClick(message.id)}
                  class="hover:bg-surface-200-800 text-surface-500 rounded-full p-1 transition-colors duration-200 hover:text-error-500"
                  aria-label="Delete this message"
                >
                  <IconTrash size={16} class="shrink-0" />
                </button>
              {/if}
            </div>
          </div>

          {#if message.from === MessageSource.USER}
            <Avatar
              src="https://i.pravatar.cc/150?img=48"
              name="User"
              size="size-8"
              rounded="rounded-full"
              background="bg-surface-200-800"
            />
          {/if}
        </div>
      </div>
    {/each}

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
            class="card rounded-container preset-filled-secondary-500 text-surface-900 p-4 text-xs"
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
