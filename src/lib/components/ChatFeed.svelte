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

    if (lastMessageId !== last.id && chatContainer) {
      lastMessageId = last.id;
      const nearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 120;
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: nearBottom ? 'smooth' : 'auto' });
    }
  });

  $effect(() => {
    if (props.typing && chatContainer) {
      scrollToBottom();
    }
  });
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
        <Avatar name="bot" classes="mt-1 self-start animate-pulse" />
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
    <div in:fade class="flex gap-2 items-center px-1 py-2 animate-typing-entry">
      <Avatar name="bot" classes="mt-1 self-start animate-pulse" />
      <div class="typing-bubble relative">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <div class="typing-label">{props.username} is typing...</div>
      </div>
    </div>
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

<style>
  .typing-bubble {
    background-color: var(--color-surface-200);
    color: var(--color-surface-900);
    padding: 0.5rem 0.75rem;
    border-radius: 1rem;
    max-width: fit-content;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    font-size: 1.25rem;
    line-height: 1;
  }

  .dark .typing-bubble {
    background-color: var(--color-surface-700);
    color: var(--color-surface-100);
  }

  .typing-bubble .dot {
    width: 6px;
    height: 6px;
    background-color: currentColor;
    border-radius: 50%;
    animation: blink 1.2s infinite ease-in-out;
  }

  .typing-bubble .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  .typing-bubble .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  .typing-bubble .typing-label {
    font-size: 0.65rem;
    margin-left: 0.5rem;
    opacity: 0.75;
  }

  .typing-bubble::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 10px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 8px solid var(--color-surface-200);
  }

  .dark .typing-bubble::before {
    border-right-color: var(--color-surface-700);
  }

  @keyframes blink {
    0%, 80%, 100% { opacity: 0; }
    40% { opacity: 1; }
  }

  @keyframes typing-entry {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-typing-entry {
    animation: typing-entry 0.3s ease-out;
  }
</style>
