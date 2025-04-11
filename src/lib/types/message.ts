import { MessageSource } from '$lib/stores/websocket';

export interface Message {
  id: number;
  source: MessageSource;
  text: string;
  timestamp: string;
}
