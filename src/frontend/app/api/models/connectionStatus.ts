//@ts-nocheck

/**
 * Represents the status of a single service connection.
 */
export interface ConnectionStatus {
  /** Whether the connection is available. */
  connected: boolean;
  /**
     * Error message if the connection failed, otherwise null.
     * @nullable
     */
  error?: string | null;
}
