import type { Job } from 'bullmq';
import dbConnect from '../../../db';
import Task from '../../models/task';
import { scrapeDiscountsSale } from '../scrapeDiscountsSale';
import type { ScrapeJobPayload } from './scrape.types';
import { getUpstashRest } from './../redis';

export async function handleScrapeJob( job: Job<ScrapeJobPayload> ): Promise<void> {
    const { taskId } = job.data;
    await dbConnect();

    await Task.findByIdAndUpdate( taskId, { status: 'processing' } );

    try {
        const result = await scrapeDiscountsSale( job.data, async progress => {
            await Task.findByIdAndUpdate( taskId, { progress } );
            await job.updateProgress( progress );
        } );

        await Task.findByIdAndUpdate( taskId, {
            status: 'done',
            progress: 100,
            result,
        } );
    } catch ( e ) {
        const message = e instanceof Error ? e.message : 'Scraping failed';
        await Task.findByIdAndUpdate( taskId, {
            status: 'error',
            error: message,
        } );
        throw e;
    }
}

export async function handleScrapeJobRedis(
    job: Job<ScrapeJobPayload>
): Promise<void> {
    const { taskId } = job.data;
    const key = `scrape-${ taskId }`;
    const redis = await getUpstashRest();

    if ( !redis ) {
        throw new Error( 'no redis instance is found' );
    }

    // 🚀 ставим processing
    await redis.set( key, {
        status: "processing",
        progress: 0,
        data: null,
    } );

    try {
        const result = await scrapeDiscountsSale(
            job.data,
            async ( progress ) => {
                // 🔄 обновляем прогресс
                await redis.set(
                    key,
                    {
                        status: "processing",
                        progress,
                    },
                    { keepTtl: true } // важно!
                );

                await job.updateProgress( progress );
            }
        );

        // ✅ успех
        await redis.set(
            key,
            {
                status: "done",
                progress: 100,
                data: result,
            },
            { ex: 60 * 10 } // TTL 10 мин
        );
    } catch ( e ) {
        const message =
            e instanceof Error ? e.message : "Scraping failed";

        // ❌ ошибка
        await redis.set(
            key,
            {
                status: "error",
                error: message,
            },
            { ex: 60 * 10 }
        );

        throw e;
    }
}