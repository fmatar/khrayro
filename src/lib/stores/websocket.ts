import { writable, type Writable } from 'svelte/store';
import { MessageSource } from '$lib/types/messageSource';
import { authStore } from '$lib/stores/authStore';
import type { Message, WebSocketMessage } from '$lib/types/message';
import { MessageType } from '$lib/types/messageType';

// ----------------------------- connection lifecycle ----------------------------
export enum ConnectionState {
	CONNECTING = 'CONNECTING',
	CONNECTED = 'CONNECTED',
	DISCONNECTED = 'DISCONNECTED',
	ERROR = 'ERROR'
}

// WebSocket URL (configure for production)
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/chat';

export function createWebSocketStore(username: string) {
	const typing = writable(false);

	// ------------------ primary message store ----------------------------------
	const messages = writable<Message[]>([]);
	const { subscribe: messageSubscribe, update, set } = messages;

	// ------------------ connection state + error stores -------------------------
	const state: Writable<ConnectionState> = writable(ConnectionState.DISCONNECTED);
	const error: Writable<string | null> = writable(null);

	let ws: WebSocket | null = null;
	let token: string | null = null;

	// keep latest token
	const unsubscribeAuth = authStore.subscribe((store) => (token = store?.token));

	// ---------------------------------------------------------------------------
	// Connect – sets state transitions and guards duplicate opens
	// ---------------------------------------------------------------------------
	function connect() {
		if (ws !== null) return; // already connected or in‑flight

		state.set(ConnectionState.CONNECTING);

		const url = `${WS_URL}/${encodeURIComponent(username)}?token=${token}`; // TODO add token query if backend supports

		console.log('Connecting to WebSocket', url);
		try {
			ws = new WebSocket(url);
		} catch (e) {
			console.error('WebSocket construction failed', e);
			error.set('Failed to create WebSocket.');
			state.set(ConnectionState.ERROR);
			ws = null;
			return;
		}

		ws.onopen = () => {
			console.info('WebSocket connected');
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
					timestamp: new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
				}));
				set(history);
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
					// automatically clear the flag after 3 s so the UI hides itself
					setTimeout(() => typing.set(false), 3000);
					break;
				default:
					update((msgs) => [
						...msgs,
						{
							id: data.id,
							source: data.from,
							text: data.message,
							type: data.type,
							timestamp: new Date(data.ts).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							})
						}
					]);
			}
		};

		ws.onclose = (ev) => {
			console.warn('WebSocket closed', ev);
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

	// ---------------------------------------------------------------------------
	// Outbound helpers – respect connection state
	// ---------------------------------------------------------------------------
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

		update((msgs) => [
			...msgs,
			{
				id: messageId,
				source: MessageSource.USER,
				text: message,
				type: MessageType.CHAT_MESSAGE,
				timestamp: new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			}
		]);

		ws!.send(
			JSON.stringify({
				// id: messageId,
				type: MessageType.CHAT_MESSAGE,
				from: 'USER',
				message,
				ts: iso
			})
		);
	}

	function sendClearChat() {
		if (!ensureOpen()) return;
		ws!.send(
			JSON.stringify({
				// id: crypto.randomUUID(),
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
				// id: crypto.randomUUID(),
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

	// ---------------------------------------------------------------------------
	// Wrapped subscribe cleans up when last listener unsubscribes.
	// ---------------------------------------------------------------------------
	function subscribe(run: (value: Message[]) => void, invalidate?: () => void) {
		const unsubMessages = messageSubscribe(run, invalidate);
		return () => {
			unsubMessages();
			unsubscribeAuth();
			close();
		};
	}

	return {
		// message list behaves like a store itself
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
