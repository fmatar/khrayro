import { writable, type Writable } from 'svelte/store';
import { MessageSource } from '$lib/types/messageSource';
import { authStore } from '$lib/stores/authStore';
import type { Message, WebSocketMessage } from '$lib/types/message';
import { MessageType } from '$lib/types/messageType';

export enum ConnectionState {
	CONNECTING = 'CONNECTING',
	CONNECTED = 'CONNECTED',
	DISCONNECTED = 'DISCONNECTED',
	ERROR = 'ERROR'
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/chat';

export function createWebSocketStore(username: string) {
	const typing = writable(false);
	const messages = writable<Message[]>([]);
	const { subscribe: messageSubscribe, update, set } = messages;

	const state: Writable<ConnectionState> = writable(ConnectionState.DISCONNECTED);
	const error: Writable<string | null> = writable(null);

	let ws: WebSocket | null = null;
	let token: string | null = null;
	let messageBuffer: Message[] = [];

	const unsubscribeAuth = authStore.subscribe((store) => (token = store?.token));

	function sortMessagesSafe(msgs: Message[]) {
		return msgs
			.filter((m) => !isNaN(new Date(m.timestamp).getTime()))
			.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
	}

	function connect() {
		if (ws !== null) return;

		state.set(ConnectionState.CONNECTING);

		const url = `${WS_URL}/${encodeURIComponent(username)}?token=${token}`;

		try {
			ws = new WebSocket(url);
		} catch (e) {
			console.error('WebSocket error:', e);
			error.set('Failed to create WebSocket.');
			state.set(ConnectionState.ERROR);
			ws = null;
			return;
		}

		ws.onopen = () => {
			state.set(ConnectionState.CONNECTED);
			error.set(null);
		};

		ws.onmessage = (event) => {
			const data: WebSocketMessage | WebSocketMessage[] = JSON.parse(event.data);
			if (Array.isArray(data)) {
				const history: Message[] = data.map((m) => ({
					id: m.id,
					source: m.from,
					text: m.message,
					type: m.type,
					timestamp: m.ts
				}));
				set(sortMessagesSafe(history));
				return;
			}

			switch (data.type) {
				case MessageType.CLEAR_CHAT:
					set([]);
					break;
				case MessageType.DELETE_MESSAGE:
					update((msgs) => msgs.filter((msg) => msg.id !== data.message));
					break;
				case MessageType.TYPING:
					typing.set(true);
					// setTimeout(() => typing.set(false), 3000);
					requestAnimationFrame(() => {
						const chatFeed = document.querySelector('[data-chat-feed]');
						if (chatFeed) {
							chatFeed.scrollTo({ top: chatFeed.scrollHeight, behavior: 'smooth' });
						}
					});
					break;
				default:
					const newMessage: Message = {
						id: data.id || crypto.randomUUID(),
						source: data.from,
						text: data.message,
						type: data.type,
						timestamp: data.ts
					};

					if (data.from === MessageSource.AGENT) {
						messageBuffer.push(newMessage);
						setTimeout(() => {
							typing.set(false);
							update((msgs) => sortMessagesSafe([...msgs, ...messageBuffer]));
							messageBuffer = [];
						}, 500); // Delay to give typing indicator time to show
					} else {
						typing.set(false);
						update((msgs) => sortMessagesSafe([...msgs, newMessage]));
					}
			}
		};

		ws.onclose = (ev) => {
			state.set(ConnectionState.DISCONNECTED);
			if (ev.code !== 1000) {
				error.set(`Connection closed unexpectedly (code ${ev.code})`);
			}
			ws = null;
		};

		ws.onerror = (ev) => {
			console.error('WebSocket error', ev);
			error.set('WebSocket encountered an error.');
			state.set(ConnectionState.ERROR);
		};
	}

	function ensureOpen(): boolean {
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			error.set('Socket not connected.');
			return false;
		}
		return true;
	}

	function send(message: string) {
		if (!ensureOpen()) return;
		const messageId = crypto.randomUUID();
		const iso = new Date().toISOString();

		update((msgs) => {
			const newMessage: Message = {
				id: messageId,
				source: MessageSource.USER,
				text: message,
				type: MessageType.CHAT_MESSAGE,
				timestamp: iso
			};
			return sortMessagesSafe([...msgs, newMessage]);
		});

		ws!.send(
			JSON.stringify({
				type: MessageType.CHAT_MESSAGE,
				from: MessageSource.USER,
				message,
				ts: iso
			})
		);
	}

	function sendClearChat() {
		if (!ensureOpen()) return;
		ws!.send(
			JSON.stringify({
				type: MessageType.CLEAR_CHAT,
				from: MessageSource.USER,
				message: '',
				ts: new Date().toISOString()
			})
		);
	}

	function sendDeleteMessage(messageId: string) {
		if (!ensureOpen()) return;
		ws!.send(
			JSON.stringify({
				type: MessageType.DELETE_MESSAGE,
				from: MessageSource.USER,
				message: messageId,
				ts: new Date().toISOString()
			})
		);
	}

	function close() {
		if (ws) {
			ws.close();
			ws = null;
			state.set(ConnectionState.DISCONNECTED);
		}
	}

	function subscribe(run: (value: Message[]) => void, invalidate?: () => void) {
		const unsubMessages = messageSubscribe(run, invalidate);
		return () => {
			unsubMessages();
			unsubscribeAuth();
			close();
		};
	}

	return {
		subscribe,
		state,
		error,
		typing,
		connect,
		send,
		sendClearChat,
		sendDeleteMessage,
		close
	};
}
