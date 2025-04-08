<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import IconSend from '@lucide/svelte/icons/send';
  import IconTrash from '@lucide/svelte/icons/trash-2';
  import IconMic from '@lucide/svelte/icons/mic'; // For voice
  import IconPaperclip from '@lucide/svelte/icons/paperclip'; // For attach

  interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    timestamp: string;
  }

  let messages = $state<Message[]>([]);
  let inputText = $state('');
  let chatContainer: HTMLElement;
  let textareaRef: HTMLTextAreaElement;

  function getTimestamp(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getBotResponse(userText: string): string {
    return `Echo: ${userText}`;
  }

  function sendMessage() {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: messages.length,
      sender: 'user',
      text: inputText.trim(),
      timestamp: getTimestamp()
    };

    messages = [...messages, userMessage];

    const botMessage: Message = {
      id: messages.length,
      sender: 'bot',
      text: getBotResponse(inputText),
      timestamp: getTimestamp()
    };
    messages = [...messages, botMessage];

    inputText = '';

    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }

  function clearChat() {
    messages = [];
  }

  function handleVoice() {
    // Placeholder for voice functionality
    console.log('Voice button clicked');
  }

  function handleAttach() {
    // Placeholder for attach functionality
    console.log('Attach button clicked');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function adjustTextareaHeight() {
    if (textareaRef) {
      textareaRef.style.height = 'auto';
      const scrollHeight = textareaRef.scrollHeight;
      const lineHeight = parseFloat(getComputedStyle(textareaRef).lineHeight);
      const maxHeight = lineHeight * 5;
      textareaRef.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }

  function bindTextarea(node: HTMLTextAreaElement) {
    textareaRef = node;
    adjustTextareaHeight();
    return {
      destroy() {
        textareaRef = null;
      }
    };
  }
</script>

<div class="flex flex-col h-full bg-surface-50-950">
  <!-- Chat Feed -->
  <section bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
    {#if messages.length === 0}
      <div class="flex items-center justify-center h-full text-surface-400">
        <p>No messages yet. Start chatting!</p>
      </div>
    {:else}
      {#each messages as message (message.id)}
        <div class="flex {message.sender === 'user' ? 'justify-end' : 'justify-start'}">
          <div class="flex items-start gap-2 max-w-[70%]">
            {#if message.sender === 'bot'}
              <Avatar
                src="https://i.pravatar.cc/150?img=3"
                name="Bot"
                size="size-8"
                rounded="rounded-full"
                background="bg-surface-200-800"
              />
            {/if}
            <div
              class="card p-3 rounded-container {message.sender === 'user'
                ? 'preset-filled-primary-500 text-surface-100'
                : 'bg-surface-100-900 text-surface-900 dark:text-surface-100'}"
            >
              <p>{message.text}</p>
              <small class="opacity-60 text-xs mt-1">{message.timestamp}</small>
            </div>
            {#if message.sender === 'user'}
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
    {/if}
  </section>

  <!-- Control Panel -->
  <footer class="p-4 bg-surface-50-950 border-t border-surface-200-800/50">
    <div class="max-w-3xl mx-auto space-y-3">
      <textarea
        bind:value={inputText}
        bind:this={bindTextarea}
        on:keydown={handleKeydown}
        on:input={adjustTextareaHeight}
        placeholder="Compose message..."
        rows="3"
        class="input resize-none w-full bg-surface-100-900 text-surface-900 dark:text-surface-100
               border-surface-200-800 focus:ring-2 focus:ring-primary-500
               transition-all duration-200 placeholder:text-surface-400"
        style="min-height: 1.5em; max-height: 7.5em; overflow-y: auto;"
      />
      <div class="flex justify-between items-center">

        <div class="flex items-center gap-4">
          <span class="text-xs text-surface-400">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            on:click={clearChat}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            title="Clear"
          >
            <IconTrash size={20} class="shrink-0" />
          </button>
          <button
            on:click={handleVoice}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            title="Voice message"
          >
            <IconMic size={20} class="shrink-0" />
          </button>
          <button
            on:click={handleAttach}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm"
            title="Attach file"
          >
            <IconPaperclip size={20} class="shrink-0" />
          </button>
          <button
            on:click={sendMessage}
            class="p-2 rounded-full bg-primary-500 hover:bg-primary-600
                   text-surface-100 transition-colors duration-200 shadow-sm
                   disabled:opacity-50 disabled:pointer-events-none"
            disabled={inputText.trim() === ''}
            title="Send message"
          >
            <IconSend size={20} class="shrink-0" />
          </button>
        </div>
      </div>
    </div>
  </footer>
</div>
