//@ts-nocheck

/**
 * A simple counter value stored in Redis.
 */
export interface RedisCounter {
  /** The current counter value. */
  value: number;
}
