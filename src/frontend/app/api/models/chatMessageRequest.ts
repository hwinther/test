//@ts-nocheck

/**
 * Request body for sending a chat message.
 */
export interface ChatMessageRequest {
  /**
     * Message body.
     * @nullable
     */
  text: string | null;
}
