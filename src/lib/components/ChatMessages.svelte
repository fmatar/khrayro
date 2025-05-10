<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import { MessageSource } from '$lib/types/messageSource';
  import type { WebSocketMessage } from '$lib/types/ws_message';

	/**
	 * Props:
	 * messages - array of Message objects to display
	 * typing   - boolean indicating if the bot is typing
	 * onDelete - function to call when user clicks delete (receives a string id)
	 * chatContainer - optional so parent can bind:this to scroll, if needed
	 */

	export let messages: WebSocketMessage[] = [];
	export let typing = false;
	export let onDelete: (id: string) => void = () => {};
	export let chatContainer: HTMLElement;

	/**
	 * Return date label for message timestamp (e.g. "Today", "Yesterday", or a date string).
	 */
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

	/**
	 * Decide if a date separator is required before the given message.
	 */
	function shouldShowSeparator(index: number): string | null {
		if (index === 0) return getMessageDate(messages[index].ts);
		const currentDate = getMessageDate(messages[index].ts);
		const previousDate = getMessageDate(messages[index - 1].ts);
		return currentDate !== previousDate ? currentDate : null;
	}

	/**
	 * Format a timestamp for display.
	 */
	function formatTimestamp(timestamp: string): string {
		// Example: return new Date(timestamp).toLocaleTimeString();
		return timestamp;
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
	<!-- If no messages and not typing -->
	{#if messages.length === 0 && !typing}
		<div class="text-surface-400 flex h-full items-center justify-center">
			<p>No messages yet. Start chatting!</p>
		</div>
	{:else}
		<!-- Loop over messages -->
		{#each messages as message, index (message.id)}
			<!-- Date Separator -->
			{#if shouldShowSeparator(index)}
				<div class="my-4 flex items-center">
					<div class="bg-surface-200-800 h-px flex-1"></div>
					<span class="text-surface-400 px-4 text-xs">{shouldShowSeparator(index)}</span>
					<div class="bg-surface-200-800 h-px flex-1"></div>
				</div>
			{/if}

			<!-- Message Bubble -->
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
						class="card rounded-container flex items-center gap-2 p-4 text-xs
							{message.from === MessageSource.USER
								? 'preset-filled-primary-500 text-surface-100'
								: 'bg-surface-100-900 text-surface-900 dark:text-surface-100'}"
						role="article"
						aria-label="{message.from === MessageSource.USER ? 'You' : 'Bot'} said at {formatTimestamp(message.ts)}"
					>
						<p>{message.message}</p>
						<small
							class="mt-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-60"
						>
							{formatTimestamp(message.ts)}
						</small>
						{#if message.from === MessageSource.USER}
							<button
								onclick={() => handleDeleteClick(message.id)}
								class="hover:bg-surface-200-800 text-surface-500 rounded-full p-1 transition-colors duration-200 hover:text-red-500"
								aria-label="Delete this message"
							>
								<IconTrash size={16} class="shrink-0" />
							</button>
						{/if}
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
