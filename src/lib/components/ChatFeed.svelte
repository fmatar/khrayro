<script lang="ts">
  import { onMount } from 'svelte';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import type { Message } from '$lib/types/message';
  import { MessageSource } from '$lib/types/messageSource';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import { autoscroll } from '$lib/actions/autoscroll';
  import { fly } from 'svelte/transition';
  import ChatBubble from "$lib/components/ChatBubble.svelte";

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
  {#each sortedMessages as message (message.id)}
    <ChatBubble
      source={message.source}
      text={message.text}
      timestamp={message.timestamp}
      onDelete={() => props.openDeleteModal(message.id)}
    />
  {/each}

  {#if props.typing}
    <ChatBubble
      source={MessageSource.AGENT}
      isTyping={true}
    />
  {/if}
</div>
