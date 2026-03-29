import './worker-env';
import mongoose from 'mongoose';
import { Worker } from 'bullmq';
import { SCRAPE_QUEUE_NAME } from './app/lib/jobs/scrape.constants';
import { getBullmqConnectionOptions } from './app/lib/jobs/redis.config';
import { handleScrapeJob, handleScrapeJobRedis } from './app/lib/jobs/scrape.processor';
import type { ScrapeJobPayload } from './app/lib/jobs/scrape.types';

const concurrency = Math.max( 1, Number( process.env.SCRAPE_WORKER_CONCURRENCY || '1' ) );

async function main() {
    getBullmqConnectionOptions();

    const worker = new Worker<ScrapeJobPayload>(
        SCRAPE_QUEUE_NAME,
        handleScrapeJobRedis,
        {
            connection: getBullmqConnectionOptions(),
            concurrency,
            // Firecrawl runs longer than default lock (30s); avoid false "stalled" pickups.
            lockDuration: 600_000,
            stalledInterval: 120_000,
            maxStalledCount: 1,
        },
    );

    worker.on( 'completed', job => {
        console.info( '[scrape-worker] completed', job.id, job.name );
    } );

    worker.on( 'failed', ( job, err ) => {
        console.error( '[scrape-worker] failed', job?.id, job?.name, err );
    } );

    const shutdown = async ( signal: string ) => {
        console.info( `[scrape-worker] ${ signal }, closing…` );
        await worker.close();
        if ( mongoose.connection.readyState !== 0 ) {
            await mongoose.disconnect();
        }
        process.exit( 0 );
    };

    process.once( 'SIGTERM', () => void shutdown( 'SIGTERM' ) );
    process.once( 'SIGINT', () => void shutdown( 'SIGINT' ) );
}

main().catch( err => {
    console.error( '[scrape-worker] fatal', err );
    process.exit( 1 );
} );
