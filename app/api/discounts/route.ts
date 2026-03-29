import type { NextRequest } from 'next/server';
import { enqueueDiscountScrape } from './../../lib/jobs/scrape.producer';

export async function GET( req: NextRequest ) {

    const searchParams = req.nextUrl.searchParams;
    const link = searchParams.get( 'link' );
    const shop = searchParams.get( 'shop' );

    if ( !link || !shop ) {
        return new Response(
            JSON.stringify( { error: 'link and shop are required' } ),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
    }

    try {
        const { taskId } = await enqueueDiscountScrape( {
            link,
            shop,
            minimalCartPrice: searchParams.get( 'minimalCartPrice' ),
            minPrice: searchParams.get( 'minPrice' ),
            maxPrice: searchParams.get( 'maxPrice' ),
            count: searchParams.get( 'count' ),
            commision: searchParams.get( 'commision' ),
            currency: searchParams.get( 'currency' ),
        } );

        return new Response(
            JSON.stringify( { message: 'Scrape queued', taskId } ),
            { status: 202, headers: { 'Content-Type': 'application/json' } },
        );
    } catch ( err ) {
        console.error( '[discounts] enqueue failed', err );
        return new Response(
            JSON.stringify( { error: 'Failed to enqueue scrape (Redis / queue unavailable)' } ),
            { status: 503, headers: { 'Content-Type': 'application/json' } },
        );
    }
}
