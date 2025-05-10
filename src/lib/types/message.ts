import { MessageSource } from '$lib/types/messageSource';

export interface Message {
	id: number;
	type: 'CHAT_MESSAGE' | 'USER_JOINED' | 'USER_LEFT';
	source: MessageSource;
	text: string;
	timestamp: string;
	renderedHtml?: string | null; // Memoized HTML for performance
}
