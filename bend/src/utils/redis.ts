import { randomUUID, UUID } from "crypto";
import Redis from "ioredis";
import { JwtPayloadX } from "./jwt";

/**
 * HitLimitedCache class - Implements a Redis-based cache that automatically deletes items after a specified number of hits
 * Generic methods allow for storing and retrieving data of various types
 */
export class HitLimitedCache {
  private client: Redis;

  /**
   * @param redisUrl Redis connection URL
   */
  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl);
    this.client.on("error", (err) => console.error(err));
  }

  /**
   * Disconnect the Redis client
   */
  disconnect() {
    this.client.disconnect();
  }

  /**
   * Store a value in the cache
   * @param key Cache key
   * @param value Value to store
   * @param ttl Time-to-live in seconds, default is 3600 seconds (1 hour)
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = 3600,
    hitLimit = 0
  ): Promise<void> {
    try {
      // Convert object to JSON string for storage
      const valueString = JSON.stringify(value);

      // Store the value
      await this.client.set(key, valueString, "EX", ttl);

      if (hitLimit > 0) {
        // Initialize hit counter for this key
        const hitCounterKey = `${key}:hits`;
        await this.client.set(hitCounterKey, `${hitLimit}`, "EX", ttl);
      }
    } catch (error) {
      console.error(error);
      throw new Error("failed_to_set_cache");
    }
  }

  /**
   * Retrieve a value from the cache (increments hit count and deletes if limit is reached)
   * @param key Cache key
   * @returns Cached value or null (if not found or hit limit reached)
   */
  async get<T>(key: string, checkHit = false): Promise<T | null> {
    try {
      // Get the value
      const valueString = await this.client.get(key);
      if (valueString === null) {
        return null;
      }

      if (checkHit) {
        // Increment hit counter
        const hitCounterKey = `${key}:hits`;
        const hits = await this.client.decr(hitCounterKey);

        // Delete the cache item if hit limit is reached
        if (hits <= 0) {
          await this.delete(key);
        }
      }

      return JSON.parse(valueString) as T;
    } catch (error) {
      console.error(error);
      throw new Error("failed_to_get_cache");
    }
  }

  /**
   * Delete a cache item
   * @param key Cache key to delete
   */
  async delete(key: string): Promise<void> {
    try {
      // Delete both the value and hit counter
      await this.client.del(key);
      await this.client.del(`${key}:hits`);
    } catch (error) {
      console.error(error);
      throw new Error("failed_to_delete_cache");
    }
  }

  /**
   * Check remaining hits for a cache item
   * @param key Cache key
   * @returns Remaining hits or -1 if key doesn't exist
   */
  async getRemainingHits(key: string): Promise<number> {
    try {
      const hitCounterKey = `${key}:hits`;
      const hits = await this.client.get(hitCounterKey);
      if (hits === null) {
        return -1;
      }
      return parseInt(hits, 10);
    } catch (error) {
      console.error(error);
      throw new Error("failed_to_get_cache_hit");
    }
  }
}

// Create an instance of HitLimitedCache for refresh tokens
// Set higher hit limit (e.g., 100) to allow multiple checks while still providing protection
export const hitLimitedCache = new HitLimitedCache(
  process.env.REDIS_URL || "redis://redis:6379"
);

/**
 * Store a refresh token using the HitLimitedCache
 * @param sub Subject (user identifier)
 * @param refreshToken The refresh token to store
 * @param expiresIn Expiration time in seconds
 */
export async function storeRefreshToken(
  sub: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> {
  try {
    // Use the HitLimitedCache to store the token
    await hitLimitedCache.set<string>(
      `refresh_token:${sub}`,
      refreshToken,
      expiresIn
    );
  } catch (error) {
    console.error(error);
    throw new Error("fail_to_store_refresh_token");
  }
}

/**
 * Get a refresh token using the HitLimitedCache
 * @param sub Subject (user identifier)
 * @returns The refresh token or null if not found
 */
export async function getRefreshToken(sub: string): Promise<string | null> {
  try {
    // Use the HitLimitedCache to retrieve the token
    const refreshToken = await hitLimitedCache.get<string>(
      `refresh_token:${sub}`
    );
    return refreshToken;
  } catch (error) {
    console.error(error);
    throw new Error("refresh_token_not_found");
  }
}

/**
 * Delete a refresh token using the HitLimitedCache
 * @param sub Subject (user identifier)
 */
export async function deleteRefreshToken(sub: string): Promise<void> {
  try {
    // Use the HitLimitedCache to delete the token
    await hitLimitedCache.delete(`refresh_token:${sub}`);
  } catch (error) {
    console.error(error);
    throw new Error("fail_to_delete_refresh_token");
  }
}

/**
 * Store a refresh token using the HitLimitedCache
 * @param sub Subject (user identifier)
 * @param refreshToken The refresh token to store
 * @param expiresIn Expiration time in seconds
 */
export async function storeUserState(user: Partial<JwtPayloadX>) {
  try {
    const randomKey = randomUUID();

    // Use the HitLimitedCache to store the token
    await hitLimitedCache.set<Partial<JwtPayloadX>>(
      `user_state:${randomKey}`,
      user,
      60
    );
    return randomKey;
  } catch (error) {
    console.error(error);
    throw new Error("fail_to_store_user_state");
  }
}

/**
 * Get a refresh token using the HitLimitedCache
 * @param sub Subject (user identifier)
 * @returns The refresh token or null if not found
 */
export async function getUserState(randomKey: string) {
  try {
    // Use the HitLimitedCache to retrieve the token
    const user = await hitLimitedCache.get<Partial<JwtPayloadX>>(
      `user_state:${randomKey}`
    );
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("user_state_not_found");
  }
}
