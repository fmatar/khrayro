<!-- ChatBubble.svelte -->
<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import { MessageSource } from '$lib/types/messageSource';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';

  export let source: MessageSource;
  export let text: string = '';
  export let timestamp: string = '';
  export let onDelete: (() => void) | null = null;
  export let isTyping: boolean = false;

  function formatRelativeTime(ts: string): string {
    const now = new Date();
    const then = new Date(ts);
    const diff = Math.round((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return then.toLocaleDateString();
  }

  const isAgent = source === MessageSource.AGENT;
</script>

<div
  class="group flex gap-2 items-start py-1"
  class:justify-start={isAgent}
  class:justify-end={!isAgent}
>
  {#if isAgent}
    <Avatar name="bot" classes="mt-1 self-start {isTyping ? 'animate-pulse' : ''}" />
  {/if}

  <div>
    <div
      class={`relative rounded-xl px-3 py-2 max-w-prose text-sm whitespace-pre-wrap shadow-sm ring-1 ring-white/10
        ${isTyping
          ? 'bg-surface-300 dark:bg-surface-600 text-surface-900 dark:text-white'
          : isAgent
          ? 'bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-white'
          : 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white'}
      `}
      aria-live={isTyping ? 'polite' : undefined}
    >
      {#if isTyping}
        <div class="flex gap-2 items-center">
          <span class="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-ping"></span>
          <span class="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-ping delay-[150ms]"></span>
          <span class="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-ping delay-[300ms]"></span>
        </div>
        <div class="mt-1 text-xs opacity-70">Thinking...</div>
      {:else}
        <MarkdownRenderer content={text} />
      {/if}
    </div>

    {#if !isTyping && timestamp}
      <div
        class={`flex items-center justify-between text-xs mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200
        ${isAgent ? 'text-surface-500 dark:text-surface-400' : 'text-white/80'}
        `}
      >
        <span>{formatRelativeTime(timestamp)}</span>
        {#if onDelete}
          <button
            class={isAgent
              ? 'hover:text-error-600 dark:hover:text-error-400'
              : 'hover:text-error-300'
            }
            aria-label="Delete message"
            on:click={onDelete}
          >
            <IconTrash size={14} />
          </button>
        {/if}
      </div>
    {/if}
  </div>

  {#if !isAgent}
    <Avatar name="u" classes="mt-1 self-start" />
  {/if}
</div>
