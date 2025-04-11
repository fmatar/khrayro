import { MessageSource } from '$lib/stores/websocket';

export interface WebSocketMessage {
  type: 'CHAT_MESSAGE' | 'USER_JOINED' | 'USER_LEFT';
  from: MessageSource;
  message: string;
  ts: string;
}
