<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import type { Message } from '$lib/types/message';
  import { MessageSource } from '$lib/types/messageSource';
  import IconTrash from '@lucide/svelte/icons/trash-2';

  export let messages: Message[];
  export let typing: boolean;
  export let username: string;
  export let openDeleteModal: (id: string) => void;

  let chatContainer: HTMLElement | null = null;

  function getDateLabel(ts: string) {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  }

  function needSeparator(list: Message[], i: number) {
    if (i === 0) return true;
    return getDateLabel(list[i].timestamp) !== getDateLabel(list[i - 1].timestamp);
  }

  $: {
    if (chatContainer && messages.length) {
      const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;
      if (isNearBottom) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }
</script>

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
    {#each messages as msg, i (msg.id)}
      {#if needSeparator(messages, i)}
        <div class="my-4 flex items-center">
          <div class="bg-surface-200-800 h-px flex-1"></div>
          <span class="text-surface-400 px-4 text-xs">{msg.timestamp}</span>
          <div class="bg-surface-200-800 h-px flex-1"></div>
        </div>
      {/if}

      <div class="flex {msg.source === MessageSource.USER ? 'justify-end' : 'justify-start'}">
        <div class="group flex max-w-[70%] items-start gap-2">
          {#if msg.source === MessageSource.AGENT}
            <Avatar src="https://i.pravatar.cc/150?img=3" name="Bot" size="size-8" rounded="rounded-full"
                    background="bg-surface-200-800" />
          {/if}
          <div
            class="card rounded-container flex items-center gap-2 p-4 text-xs {msg.source === MessageSource.USER ? 'preset-filled-primary-500 text-surface-100' : 'bg-surface-100-900 text-surface-900 dark:text-surface-100'}"
            role="article"
            aria-label="{msg.source === MessageSource.USER ? 'You' : 'Bot'} said at {msg.timestamp}"
          >
            <MarkdownRenderer content={msg.text} />
            <small
              class="mt-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-60 text-surface-400">
              {msg.timestamp}
            </small>

            {#if msg.source === MessageSource.USER}
              <button
                class="hover:bg-surface-200-800 text-surface-500 rounded-full p-1 transition-colors duration-200 hover:text-error-500"
                aria-label="Delete this message"
                onclick={() => openDeleteModal(msg.id)}
              >
                <IconTrash size={16} class="shrink-0" />
              </button>
            {/if}
          </div>
          {#if msg.source === MessageSource.USER}
            <Avatar src="https://i.pravatar.cc/150?img=48" name={username} size="size-8" rounded="rounded-full"
                    background="bg-surface-200-800" />
          {/if}
        </div>
      </div>
    {/each}

    {#if typing}
      <div class="flex justify-start">
        <div class="flex max-w-[70%] items-start gap-2">
          <Avatar src="https://i.pravatar.cc/150?img=3" name="Bot" size="size-8" rounded="rounded-full"
                  background="bg-surface-200-800" />
          <div class="card rounded-container bg-surface-100-900 text-surface-900 dark:text-surface-100 p-4 text-xs"
               role="status" aria-label="Bot is typing">
            <p class="italic">Bot is typing...</p>
            <div class="flex gap-1">
              <span class="bg-primary-500 inline-block h-2 w-2 rounded-full" ></span>
              <span class="bg-primary-500 inline-block h-2 w-2 rounded-full" ></span>
              <span class="bg-primary-500 inline-block h-2 w-2 rounded-full" ></span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</section>
