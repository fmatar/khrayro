// src/lib/stores/websocket.ts
import { writable } from 'svelte/store';
export type {  Message } from '$lib/types/message';
import type { WebSocketMessage } from '$lib/types/ws_message';
import { MessageSource } from '$lib/types/messageSource';
import type { Message } from '$lib/types/message';

export function createWebSocketStore(username: string) {
	const { subscribe, update } = writable<Message[]>([]);
	let ws: WebSocket | null = null;

	function connect() {
		ws = new WebSocket(`ws://localhost:8080/chat/${username}`);

		ws.onopen = () => {
			console.log(`Connected to WebSocket as ${username}`);
		};

		ws.onmessage = (event) => {
			const data: WebSocketMessage = JSON.parse(event.data);
			const newMessage: Message = {
				id: Date.now(), // Use timestamp for unique ID to avoid conflicts
				source: data.from,
				text: data.message,
				timestamp: new Date(data.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			};

			// Only add AGENT messages or non-CHAT_MESSAGE types (e.g., USER_JOINED)
			if (data.from === MessageSource.AGENT || data.type !== 'CHAT_MESSAGE') {
				update((messages) => [...messages, newMessage]);
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
			const userMessage: Message = {
				id: Date.now(),
				source: MessageSource.USER,
				text: message,
				timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			};
			// Add user message locally
			update((messages) => [...messages, userMessage]);
			// Send to server
			ws.send(
				JSON.stringify({
					type: 'CHAT_MESSAGE',
					from: MessageSource.USER,
					message,
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
		close
	};
}
