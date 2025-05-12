<script lang="ts">
  import IconSend from '@lucide/svelte/icons/send';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import IconMic from '@lucide/svelte/icons/mic';
  import IconPaperclip from '@lucide/svelte/icons/paperclip';

  export let inputText: string = '';
  export let maxCharacters: number = 4000;
  export let messagesCount: number = 0;
  export let onInputTextChange: (value: string) => void = () => {};
  export let onSend: () => void = () => {};
  export let onClear: () => void = () => {};
  export let onVoice: () => void = () => {};
  export let onAttach: () => void = () => {};

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
    const maxHeight = lineHeight * 5; // limit to ~5 lines
    textareaRef.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }
</script>

<footer class="p-4">
  <div class="mx-auto max-w-3xl space-y-3">
    <div
      class="border-surface-200-800 focus-within:border-primary-500 overflow-hidden rounded border transition-all duration-200"
    >
      <textarea
        bind:value={inputText}
        bind:this={textareaRef}
        on:keydown={handleKeydown}
        on:input={adjustTextareaHeight}
        placeholder="Compose message..."
        rows="3"
        class="input textarea-scrollbar w-full resize-none border-none bg-surface-100-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 text-xs transition-all duration-200 focus:ring-0 pr-6"
        aria-label="Message input"
      />
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-surface-400 text-xs" aria-live="polite">
          {messagesCount} {messagesCount === 1 ? 'message' : 'messages'}
        </span>
        <span class="text-surface-400 text-xs" aria-live="polite">
          {inputText.length}/{maxCharacters}
        </span>
      </div>
      <div class="flex gap-2">
        <button
          on:click={onClear}
          class="bg-primary-500 hover:bg-primary-600 text-surface-100 rounded-full p-2 shadow-sm transition-colors duration-200"
          aria-label="Clear chat"
        >
          <IconTrash size={16} class="shrink-0" />
        </button>
        <button
          on:click={onVoice}
          class="bg-primary-500 hover:bg-primary-600 text-surface-100 rounded-full p-2 shadow-sm transition-colors duration-200"
          aria-label="Record voice message"
        >
          <IconMic size={16} class="shrink-0" />
        </button>
        <button
          on:click={onAttach}
          class="bg-primary-500 hover:bg-primary-600 text-surface-100 rounded-full p-2 shadow-sm transition-colors duration-200"
          aria-label="Attach file"
        >
          <IconPaperclip size={16} class="shrink-0" />
        </button>
        <button
          on:click={onSend}
          class="bg-primary-500 hover:bg-primary-600 text-surface-100 rounded-full p-2 shadow-sm transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50"
          disabled={inputText.trim() === '' || inputText.length > maxCharacters}
          aria-label="Send message"
        >
          <IconSend size={16} class="shrink-0" />
        </button>
      </div>
    </div>
  </div>
</footer>

<style>
  .input {
    box-sizing: border-box;
    min-height: 1.5em;
    max-height: 7.5em;
    overflow-y: auto;
  }
</style>