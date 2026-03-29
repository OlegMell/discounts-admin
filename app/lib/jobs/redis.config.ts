import type { ConnectionOptions } from 'bullmq';

/**
 * Options compatible with ioredis / BullMQ.
 * Use Upstash **TCP** credentials from the dashboard (Redis Connect / rediss://).
 * REST-only env (UPSTASH_REDIS_REST_*) is for @upstash/redis, not BullMQ.
 */
function optionsFromUrl( url: string ): ConnectionOptions {
    const u = new URL( url );
    return {
        host: u.hostname,
        port: u.port ? Number( u.port ) : 6379,
        username: u.username || undefined,
        password: u.password || undefined,
        tls: u.protocol === 'rediss:' ? {} : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        connectTimeout: 10_000,
    };
}

export function getBullmqConnectionOptions(): ConnectionOptions {
    // const url = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
    // if ( url ) {
    //     console.log( { url } );
    //     return optionsFromUrl( url );
    // }

    const host = process.env.DISCOUNTS_REDIS_KV_REST_API_URL;
    console.log( { host } );
    const password = process.env.UPSTASH_REDIS_PASSWORD;
    if ( !host || !password ) {
        throw new Error(
            'Redis (BullMQ): set UPSTASH_REDIS_URL or REDIS_URL, or UPSTASH_REDIS_HOST + UPSTASH_REDIS_PASSWORD. Use TCP URL from Upstash, not REST-only vars.',
        );
    }

    return {
        host,
        port: Number( process.env.UPSTASH_REDIS_PORT || '6379' ),
        password,
        tls: {},
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        connectTimeout: 10_000,
    };
}
