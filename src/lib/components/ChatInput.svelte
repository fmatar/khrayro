<script lang="ts">
  import IconSend from '@lucide/svelte/icons/send';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import IconMic from '@lucide/svelte/icons/mic';
  import IconPaperclip from '@lucide/svelte/icons/paperclip';

  /**
   * Props:
   * inputText       - The current text in the input
   * maxCharacters   - The maximum allowed character count
   * messagesCount   - The total number of messages, for display
   * onInputTextChange - Callback when input text changes
   * onSend          - Callback when user clicks "Send"
   * onClear         - Callback when user clicks "Clear"
   * onVoice         - Callback when user clicks "Voice"
   * onAttach        - Callback when user clicks "Attach"
   */

  export let inputText: string = '';
  export let maxCharacters: number = 500;
  export let messagesCount: number = 0;
  export let onInputTextChange: (value: string) => void = () => {
  };
  export let onSend: () => void = () => {
  };
  export let onClear: () => void = () => {
  };
  export let onVoice: () => void = () => {
  };
  export let onAttach: () => void = () => {
  };

  let textareaRef: HTMLTextAreaElement | undefined;

  function handleChange(event: Event) {
    const target = event.currentTarget as HTMLTextAreaElement;
    onInputTextChange(target.value);
    adjustTextareaHeight();
  }

  function handleKeydown(event: KeyboardEvent) {
    // Send on Enter key if SHIFT not pressed
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  // Dynamically resize textarea based on content
  function adjustTextareaHeight() {
    if (!textareaRef) return;
    textareaRef.style.height = 'auto';
    const scrollHeight = textareaRef.scrollHeight;
    const lineHeight = parseFloat(getComputedStyle(textareaRef).lineHeight);
    const maxHeight = lineHeight * 5; // e.g., limit to ~5 lines
    textareaRef.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }
</script>

<footer class="p-4">
  <div class="mx-auto max-w-3xl space-y-3">
    <div
      class="border-surface-200-800 focus-within:border-primary-500 rounded border overflow-hidden transition-all duration-200"
    >
      <textarea
        bind:this={textareaRef}
        on:input={handleChange}
        on:keydown={handleKeydown}
        rows="3"
        placeholder="Compose message..."
        class="input textarea-scrollbar w-full resize-none border-none bg-surface-100-900 text-surface-100 placeholder:text-surface-400 text-sm pr-6 transition-all duration-200 focus:ring-0"
        aria-label="Message input"
      >{inputText}</textarea>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-surface-400 text-sm" aria-live="polite">
          {messagesCount} {messagesCount === 1 ? 'message' : 'messages'}
        </span>
        <span class="text-surface-400 text-sm" aria-live="polite">
          {inputText.length}/{maxCharacters}
        </span>
      </div>
      <div class="flex gap-2">
        <button
          on:click={onClear}
          class="btn-secondary"
          aria-label="Clear chat"
        >
          <IconTrash size={16} class="shrink-0" />
        </button>
        <button
          on:click={onVoice}
          class="btn-secondary"
          aria-label="Record voice message"
        >
          <IconMic size={16} class="shrink-0" />
        </button>
        <button
          on:click={onAttach}
          class="btn-secondary"
          aria-label="Attach file"
        >
          <IconPaperclip size={16} class="shrink-0" />
        </button>
        <button
          on:click={onSend}
          class="btn-secondary disabled:pointer-events-none disabled:opacity-50"
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

  .btn-secondary {
    @apply preset-filled-secondary-500 text-surface-900 rounded-full p-2 shadow-sm transition-colors duration-200;
  }
</style>
