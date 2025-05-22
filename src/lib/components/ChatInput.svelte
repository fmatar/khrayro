<script lang="ts">
  import IconSend from '@lucide/svelte/icons/send';
  import IconTrash from '@lucide/svelte/icons/trash';
  import IconMic from '@lucide/svelte/icons/mic';
  import IconPaperclip from '@lucide/svelte/icons/paperclip';

  export let inputText = '';
  export let maxCharacters = 1000;
  export let messagesCount = 0;

  export let onSend = () => {};
  export let onClear = () => {};
  export let onVoice = () => {};
  export let onAttach = () => {};

  let textareaRef: HTMLTextAreaElement;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  function adjustTextareaHeight() {
    if (!textareaRef) return;
    textareaRef.style.height = 'auto';
    const scrollHeight = textareaRef.scrollHeight;
    const lineHeight = parseFloat(getComputedStyle(textareaRef).lineHeight);
    const maxHeight = lineHeight * 5;
    textareaRef.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }
</script>

<section class="p-4  border-t border-surface-200 dark:border-surface-700">
  <div class="mx-auto max-w-3xl space-y-3">
    <div class="rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-900 shadow-sm focus-within:ring-2 focus-within:ring-primary-500 transition">
      <textarea
        bind:value={inputText}
        bind:this={textareaRef}
        on:keydown={handleKeydown}
        on:input={adjustTextareaHeight}
        placeholder="Type your message here..."
        rows="1"
        class="w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-0"
        aria-label="Message input"
        style="box-sizing: border-box; max-height: 7.5em; overflow-y: auto; line-height: 1.4; transition: height 0.2s ease;"
      ></textarea>
    </div>

    <div class="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
      <div class="flex gap-3">
        <span>{messagesCount} {messagesCount === 1 ? 'message' : 'messages'}</span>
        <span>{inputText.length}/{maxCharacters}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          on:click={onClear}
          class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 transition"
          aria-label="Clear chat"
        >
          <IconTrash size={16} />
        </button>
        <button
          on:click={onVoice}
          class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 transition"
          aria-label="Record voice"
        >
          <IconMic size={16} />
        </button>
        <button
          on:click={onAttach}
          class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 transition"
          aria-label="Attach file"
        >
          <IconPaperclip size={16} />
        </button>
        <button
          on:click={onSend}
          class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:pointer-events-none transition"
          disabled={inputText.trim() === '' || inputText.length > maxCharacters}
          aria-label="Send message"
        >
          <IconSend size={16} />
        </button>
      </div>
    </div>
  </div>
</section>
