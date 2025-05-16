import { writable } from 'svelte/store';
import { MessageSource } from '$lib/types/messageSource';
import { authStore } from '$lib/stores/authStore';
import type { Message, WebSocketMessage } from '$lib/types/message';
import { MessageType } from '$lib/types/messageType';

// WebSocket URL (configure for production)
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/chat';

export function createWebSocketStore(username: string) {
	const { subscribe, update, set } = writable<Message[]>([]);
	let ws: WebSocket | null = null;
	let token: string | null = null;

	// Subscribe to authStore to get the latest token
	authStore.subscribe((store) => {
		token = store?.token;
	});

	function connect() {
		if (ws !== null) {
			// Already connected
			return;
		}

		// Append username and (soon) token as query params
		const url = `${WS_URL}/${encodeURIComponent(username)}`;
		ws = new WebSocket(url);

		ws.onopen = () => {
			console.log('Connected to WebSocket');
		};

		ws.onmessage = (event) => {
			const data: WebSocketMessage | WebSocketMessage[] = JSON.parse(event.data);
			if (Array.isArray(data)) {
				// Handle message history from @OnOpen
				const history: Message[] = data.map((m) => ({
					id: m.id,
					source: m.from,
					text: m.message,
					type: m.type,
					timestamp: new Date(m.ts).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit'
					})
				}));
				set(history);
			} else {
				if (data.type === MessageType.CLEAR_CHAT) {
					set([]); // Clear all messages
				} else if (data.type === MessageType.DELETE_MESSAGE) {
					update((messages) => messages.filter((msg) => msg.id !== data.message));
				} else if (data.type === MessageType.TYPING) {
					// Handled in +page.svelte via typing state
				} else {
					const newMessage: Message = {
						id: data.id,
						source: data.from,
						text: data.message,
						type: data.type,
						timestamp: new Date(data.ts).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit'
						})
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
				type: MessageType.CHAT_MESSAGE,
				timestamp: new Date().toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit'
				})
			};

			// Optimistically update UI
			update((messages) => [...messages, userMessage]);

			ws.send(
				JSON.stringify({
					id: messageId,
					type: MessageType.CHAT_MESSAGE,
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
					type: MessageType.CLEAR_CHAT,
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
					type: MessageType.DELETE_MESSAGE,
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
