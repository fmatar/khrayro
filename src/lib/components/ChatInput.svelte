<script lang="ts">
  import IconSend from '@lucide/svelte/icons/send';
  import IconTrash from '@lucide/svelte/icons/trash';
  import IconMic from '@lucide/svelte/icons/mic';
  import IconPaperclip from '@lucide/svelte/icons/paperclip';


  export let inputText = '';
  export let maxCharacters = 1000;
  export let messagesCount = 0;

  export let onSend = () => {
  };
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

<footer class="p-4">
  <div class="mx-auto max-w-3xl space-y-3">
    <div class="rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-900 shadow-sm focus-within:ring-2 focus-within:ring-primary-500 transition">
      <textarea
        bind:value={inputText}
        bind:this={textareaRef}
        on:keydown={handleKeydown}
        on:input={adjustTextareaHeight}
        placeholder="Type your message here..."
        rows="6"
        class="input textarea-scrollbar w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-0"
        aria-label="Message input"
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
          class="icon-button"
          aria-label="Clear chat"
        >
          <IconTrash size={16} />
        </button>
        <button
          on:click={onVoice}
          class="icon-button"
          aria-label="Record voice"
        >
          <IconMic size={16} />
        </button>
        <button
          on:click={onAttach}
          class="icon-button"
          aria-label="Attach file"
        >
          <IconPaperclip size={16} />
        </button>
        <button
          on:click={onSend}
          class="icon-button bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:pointer-events-none"
          disabled={inputText.trim() === '' || inputText.length > maxCharacters}
          aria-label="Send message"
        >
          <IconSend size={16} />
        </button>
      </div>
    </div>
  </div>
</footer>

<style>
  .input {
    box-sizing: border-box;
    max-height: 7.5em;
    overflow-y: auto;
    line-height: 1.4;
  }

  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    width: 36px;
  }
</style>
