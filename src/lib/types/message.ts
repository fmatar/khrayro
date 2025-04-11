import { MessageSource } from '$lib/types/messageSource';

export interface Message {
	id: number;
	source: MessageSource;
	text: string;
	timestamp: string;
}
