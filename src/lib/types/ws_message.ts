import type { MessageSource } from "./messageSource";

export interface WebSocketMessage {
  id: string;
  type: 'CHAT_MESSAGE' | 'USER_JOINED' | 'USER_LEFT';
  from: MessageSource;
  message: string;
  ts: string;
}
