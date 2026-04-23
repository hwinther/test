//@ts-nocheck
import type { ConnectionStatus } from './connectionStatus';

/**
 * Represents the status of all service connections.
 */
export interface ServiceStatus {
  postgres: ConnectionStatus;
  rabbitMq: ConnectionStatus;
  redis: ConnectionStatus;
}
