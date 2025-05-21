<script lang="ts">
  import { onMount } from 'svelte';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import type { Message } from '$lib/types/message';
  import { MessageSource } from '$lib/types/messageSource';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import { autoscroll } from '$lib/actions/autoscroll';
  import { fly } from 'svelte/transition';

  const props = $props<{
    messages: Message[];
    typing: boolean;
    username: string;
    openDeleteModal: (id: string) => void;
  }>();

  let chatContainer: HTMLElement | null = null;
  let lastMessageId: string | null = null;
  let userIsScrolling = false;
  let lastScrollTime = 0;

  const sortedMessages = $derived(
    props.messages.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  );

  export function scrollToBottom(force = false) {
    if (chatContainer) {
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: force ? 'auto' : 'smooth' });
    }
  }

  function handleScroll() {
    if (!chatContainer) return;
    userIsScrolling = true;
    lastScrollTime = Date.now();
  }

  $effect(() => {
    const last = sortedMessages.at(-1);
    if (!last || !chatContainer) return;
    if (lastMessageId !== last.id) {
      lastMessageId = last.id;
      const nearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 120;
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: nearBottom ? 'smooth' : 'auto' });
    }
  });

  $effect(() => {
    if (props.typing && chatContainer) {
      const now = Date.now();
      const recentlyScrolled = now - lastScrollTime < 2000;
      if (!userIsScrolling || !recentlyScrolled) {
        setTimeout(() => scrollToBottom(), 200);
      }
    }
  });

  onMount(() => {
    const saved = sessionStorage.getItem('chatScrollTop');
    if (chatContainer && saved) {
      chatContainer.scrollTop = parseInt(saved);
    }
  });

  $effect(() => {
    if (chatContainer) {
      sessionStorage.setItem('chatScrollTop', chatContainer.scrollTop.toString());
    }
  });

  function formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.round((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return then.toLocaleDateString();
  }
</script>

<div bind:this={chatContainer} use:autoscroll class="px-4 py-2 overflow-y-auto" onscroll={handleScroll}>
  {#each sortedMessages as message, i (message.id)}
    <div in:fly={{ y: 6, duration: 150 }} class="group flex gap-2 items-start py-1"
         class:justify-end={message.source === MessageSource.USER}
         class:justify-start={message.source === MessageSource.AGENT}>

      {#if message.source === MessageSource.AGENT}
        <Avatar name="bot" classes="mt-1 self-start animate-pulse" />
        <div>
          <div class="relative rounded-xl px-3 py-2 max-w-prose text-sm whitespace-pre-wrap bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm ring-1 ring-white/10">
            <MarkdownRenderer content={message.text} />
          </div>
          <div class="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span>{formatRelativeTime(message.timestamp)}</span>
            <button
              class="hover:text-error-600 dark:hover:text-error-400 transition-colors"
              aria-label="Delete message"
              onclick={() => props.openDeleteModal(message.id)}>
              <IconTrash size={14} />
            </button>
          </div>
        </div>
      {:else if message.source === MessageSource.USER}
        <div class="flex items-start justify-end gap-2 w-full group">
          <div>
            <div class="relative rounded-xl px-3 py-2 max-w-prose text-sm whitespace-pre-wrap bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-sm ring-1 ring-white/10">
              <MarkdownRenderer content={message.text} />
            </div>
            <div class="flex items-center justify-between text-xs text-white/80 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span>{formatRelativeTime(message.timestamp)}</span>
              <button class="hover:text-error-300 transition-colors"
                      aria-label="Delete message"
                      onclick={() => props.openDeleteModal(message.id)}>
                <IconTrash size={14} />
              </button>
            </div>
          </div>
          <Avatar name="u" classes="mt-1 self-start" />
        </div>
      {/if}
    </div>
  {/each}

  {#if props.typing}
    <div in:fly={{ y: 6, duration: 150 }} class="flex gap-2 items-start px-1 py-2 animate-typing-entry">
      <Avatar name="u" classes="mt-1 self-start animate-pulse" />
      <div class="relative max-w-prose rounded-xl bg-primary-500 text-white px-3 py-2 text-sm shadow-sm">
        <div class="flex gap-3 items-center">
          <span class="h-1.5 w-1.5 rounded-full bg-white opacity-60 animate-ping"></span>
          <span class="h-1.5 w-1.5 rounded-full bg-white opacity-60 animate-ping delay-[150ms]"></span>
          <span class="h-1.5 w-1.5 rounded-full bg-white opacity-60 animate-ping delay-[300ms]"></span>
        </div>
        <div class="mt-1 text-xs opacity-75">Khrayro is thinking...</div>
      </div>
    </div>
  {/if}
</div>
