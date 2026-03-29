import { NextResponse } from 'next/server';
import { enqueueDiscountScrape } from './../../lib/jobs/scrape.producer';

type Body = {
    link?: string;
    shop?: string;
    minimalCartPrice?: string | null;
    minPrice?: string | null;
    maxPrice?: string | null;
    count?: string | null;
    commision?: string | null;
    currency?: string | null;
};

export async function POST( req: Request ) {
    let body: Body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json( { error: 'Invalid JSON body' }, { status: 400 } );
    }

    const { link, shop } = body;
    if ( !link || !shop ) {
        return NextResponse.json( { error: 'link and shop are required' }, { status: 400 } );
    }

    try {
        const { taskId } = await enqueueDiscountScrape( {
            link,
            shop,
            minimalCartPrice: body.minimalCartPrice ?? null,
            minPrice: body.minPrice ?? null,
            maxPrice: body.maxPrice ?? null,
            count: body.count ?? null,
            commision: body.commision ?? null,
            currency: body.currency ?? null,
        } );

        return NextResponse.json( { taskId } );
    } catch ( err ) {
        console.error( '[scrape/start] enqueue failed', err );
        return NextResponse.json(
            { error: 'Failed to enqueue scrape (Redis / queue unavailable)' },
            { status: 503 },
        );
    }
}
