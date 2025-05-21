<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import type { Message } from '$lib/types/message';
  import { MessageSource } from '$lib/types/messageSource';
  import IconTrash from '@lucide/svelte/icons/circle-minus';
  import { autoscroll } from '$lib/actions/autoscroll';
  import { fade } from 'svelte/transition';

  const props = $props<{
    messages: Message[];
    typing: boolean;
    username: string;
    openDeleteModal: (id: string) => void;
  }>();

  let chatContainer: HTMLElement | null = null;
  let lastMessageId: string | null = null;
  let userNearBottom = true;
  let showJumpToBottom = $state(false);

  const sortedMessages = $derived(
    props.messages.slice().sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return aTime - bTime;
    })
  );

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

  export function scrollToBottom(force = false) {
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: force ? 'auto' : 'smooth'
      });
    }
  }

  function handleScroll() {
    if (!chatContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 120;
    userNearBottom = nearBottom;
    showJumpToBottom = !nearBottom;
  }

  $effect(() => {
    const last = sortedMessages.at(-1);
    if (!last) return;

    // If it's a new message, scroll regardless of sender
    if (lastMessageId !== last.id && chatContainer) {
      lastMessageId = last.id;

      // Use smooth scroll only if user is near bottom
      const nearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 120;
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: nearBottom ? 'smooth' : 'auto' });
    }
  });

  // $effect(() => {
  //   const last = sortedMessages.at(-1);
  //   if (!last) return;
  //
  //   if (lastMessageId !== last.id) {
  //     lastMessageId = last.id;
  //     if (last.source === MessageSource.AGENT && userNearBottom) {
  //       scrollToBottom();
  //     }
  //   }
  // });
</script>

<div bind:this={chatContainer} use:autoscroll class="overflow-y-auto h-full px-4 py-2" onscroll={handleScroll}>
  {#each sortedMessages as message, i (message.id)}
    {#if needSeparator(sortedMessages, i)}
      <div class="text-xs text-center text-surface-500 dark:text-surface-400 pt-4">{getDateLabel(message.timestamp)}</div>
    {/if}
    <div in:fade
         class="group flex gap-2 items-start px-1 py-1"
         class:justify-end={message.source === MessageSource.USER}
         class:justify-start={message.source === MessageSource.AGENT}>

      {#if message.source === MessageSource.AGENT}
        <Avatar name="bot" classes="mt-1 self-start" />
        <div class="relative rounded-2xl px-4 py-2 max-w-prose text-sm whitespace-pre-wrap bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-white shadow-md">
          <MarkdownRenderer content={message.text} />
          <button
            class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-error-600 dark:hover:text-error-400"
            aria-label="Delete message"
            onclick={() => props.openDeleteModal(message.id)}>
            <IconTrash size={16} />
          </button>
        </div>
      {:else if message.source === MessageSource.USER}
        <div class="flex items-start justify-end gap-2 w-full group">
          <div class="relative rounded-2xl px-4 py-2 max-w-prose text-sm whitespace-pre-wrap bg-primary-500 text-white shadow-md">
            <MarkdownRenderer content={message.text} />
            <button
              class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-error-300"
              aria-label="Delete message"
              onclick={() => props.openDeleteModal(message.id)}>
              <IconTrash size={16} />
            </button>
          </div>
          <Avatar name="u" classes="mt-1 self-start" />
        </div>
      {/if}

    </div>
  {/each}

  {#if props.typing}
    <div class="text-sm text-surface-500 dark:text-surface-400 italic px-4 py-1">{props.username} is typing...</div>
  {/if}
</div>

{#if showJumpToBottom}
  <button
    onclick={() => scrollToBottom()}
    class="fixed bottom-20 right-6 z-10 bg-primary-500 text-white px-3 py-1 text-xs rounded-full shadow-md hover:bg-primary-600 transition"
    aria-label="Jump to latest message"
  >
    Jump to latest
  </button>
{/if}
