import { writable } from 'svelte/store';
import type { WebSocketMessage } from '$lib/types/ws_message';
import { MessageSource } from '$lib/types/messageSource';
import type { Message } from '$lib/types/message';
import { authStore } from '$lib/stores/authStore';

// WebSocket URL (configure for production)
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/chat';

export function createWebSocketStore(username: string) {
  const { subscribe, update, set } = writable<Message[]>([]);
  let ws: WebSocket | null = null;
  let token: string | null = null;

  // Subscribe to authStore to get the latest token
  authStore.subscribe((store) => {
    token = store.token;
  });

  function connect() {


    // Append the token as a query parameter to the WebSocket URL
    const wsUrl = `${WS_URL}/${username}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to WebSocket as ${username}`);
    };

    ws.onmessage = (event) => {
      const data: WebSocketMessage | WebSocketMessage[] = JSON.parse(event.data);
      if (Array.isArray(data)) {
        // Handle message history from @OnOpen
        set(data.map((msg) => ({
          id: msg.id,
          source: msg.from,
          text: msg.message,
          timestamp: new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } else {
        if (data.type === 'CLEAR_CHAT') {
          set([]); // Clear all messages
        } else if (data.type === 'DELETE_MESSAGE') {
          update((messages) => messages.filter((msg) => msg.id !== data.message));
        } else if (data.type === 'TYPING') {
          // Handled in +page.svelte via typing state
        } else {
          const newMessage: Message = {
            id: data.id,
            source: data.from,
            text: data.message,
            timestamp: new Date(data.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          update((messages) => [...messages, newMessage]);
        }
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  function send(message: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const messageId = crypto.randomUUID(); // Generate unique ID
      const userMessage: Message = {
        id: messageId,
        source: MessageSource.USER,
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      // Add user message locally
      update((messages) => [...messages, userMessage]);
      // Send to server
      ws.send(
        JSON.stringify({
          id: messageId,
          type: 'CHAT_MESSAGE',
          from: MessageSource.USER,
          message,
          ts: new Date().toISOString()
        })
      );
    }
  }

  function sendClearChat() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          id: crypto.randomUUID(),
          type: 'CLEAR_CHAT',
          from: MessageSource.USER,
          message: '',
          ts: new Date().toISOString()
        })
      );
    }
  }

  function sendDeleteMessage(messageId: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          id: crypto.randomUUID(),
          type: 'DELETE_MESSAGE',
          from: MessageSource.USER,
          message: messageId,
          ts: new Date().toISOString()
        })
      );
    }
  }

  function close() {
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  return {
    subscribe,
    connect,
    send,
    sendClearChat,
    sendDeleteMessage,
    close
  };
}
