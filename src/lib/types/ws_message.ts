import type { MessageSource } from './messageSource';
import type { MessageType } from '$lib/types/messageType';

export interface WebSocketMessage {
	/** unique identifier supplied by the sender (uuid v4) */
	id: string;
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
