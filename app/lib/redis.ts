import { Redis } from '@upstash/redis';

/** REST client (DISCOUNTS_REDIS_KV_REST_API_URL + UPSTASH_REDIS_REST_TOKEN). BullMQ jobs use TCP — see lib/jobs/redis.config.ts. */
export function getUpstashRest(): Redis | null {
    if ( !process.env.DISCOUNTS_REDIS_KV_REST_API_URL || !process.env.UPSTASH_REDIS_REST_TOKEN ) {
        return null;
    }
    return Redis.fromEnv();
}
