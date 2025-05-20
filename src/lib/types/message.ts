import { MessageSource } from '$lib/types/messageSource';
import type { MessageType } from '$lib/types/messageType';

export interface Message {
	id: string;
	type: MessageType;
	source: MessageSource;
	text: string;
	timestamp: string; // already formatted for display
	renderedHtml?: string | null;
}

export interface WebSocketMessage {
	/** unique identifier supplied by the sender (uuid v4) */
	id?: string;
	/** discriminant – ALWAYS use MessageType here */
	type: MessageType;
	/** origin of the message – user or agent */
	from: MessageSource;
	/** body of the message; if type=DELETE_MESSAGE this contains the id being deleted */
	message: string;
	/** ISO timestamp */
	ts: string;
	/** hydrated markdown cache (optional) */
	renderedHtml?: string | null;
}


