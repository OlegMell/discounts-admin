import { Queue } from 'bullmq';
import dbConnect from '../../../db';
import { SCRAPE_JOB_NAME, SCRAPE_QUEUE_NAME } from './scrape.constants';
import type { ScrapeEnqueueInput, ScrapeJobPayload } from './scrape.types';
import { getBullmqConnectionOptions } from './redis.config';

let scrapeQueue: Queue<ScrapeJobPayload> | null = null;

export function getScrapeQueue(): Queue<ScrapeJobPayload> {
    if ( !scrapeQueue ) {
        scrapeQueue = new Queue<ScrapeJobPayload>( SCRAPE_QUEUE_NAME, {
            connection: getBullmqConnectionOptions(),
            /** HTTP handlers: don’t block the lambda on Redis “ready” longer than needed. */
            skipWaitingForReady: true,
            defaultJobOptions: {
                attempts: 1,
                removeOnComplete: { age: 86_400, count: 500 },
                removeOnFail: { age: 604_800 },
            },
        } );
    }
    return scrapeQueue;
}

export async function closeScrapeProducer(): Promise<void> {
    if ( scrapeQueue ) {
        await scrapeQueue.close();
        scrapeQueue = null;
    }
}

export async function enqueueDiscountScrape( input: ScrapeEnqueueInput ) {
    await dbConnect();
    // const task = await Task.create( {
    //     status: 'pending',
    //     progress: 0,
    // } );

    const taskId = Date.now();

    const payload: ScrapeJobPayload = {
        taskId: String( taskId ),
        ...input,
    };

    getScrapeQueue().add( SCRAPE_JOB_NAME, payload, {
        jobId: `scrape-${ payload.taskId }`,
    } );

    return { taskId };
}
