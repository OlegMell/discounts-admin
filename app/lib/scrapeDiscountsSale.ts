import Firecrawl from '@mendable/firecrawl-js';
import mongoose from 'mongoose';
import dbConnect from '../../db';
import Discount from '../models/product';
import Sale from '../models/sale';
import type { ScrapeJobPayload } from './jobs/scrape.types';

const schema = {
    type: 'object',
    properties: {
        products: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    price: { type: 'string' },
                    old_price: { type: 'string' },
                    link: { type: 'string' },
                    image: { type: 'string' },
                },
            },
        },
    },
};

export async function scrapeDiscountsSale(
    data: ScrapeJobPayload,
    onProgress?: ( progress: number ) => Promise<void>,
) {
    const {
        link,
        shop,
        minimalCartPrice,
        minPrice,
        maxPrice,
        count,
        commision,
        currency,
    } = data;

    await dbConnect();

    if ( onProgress ) {
        await onProgress( 10 );
    }

    const app = new Firecrawl( { apiKey: process.env.Firecrawl_API_KEY } );
    const scrapeResponse: any = await app.agent( {
        urls: [ link ],
        prompt: `Your task is to extract ${ count || 10 } products that currently have discounts from the website. If possible, also include only products with a price after discount between ${ minPrice } and ${ maxPrice }.`,
        schema,
    } );

    if ( !scrapeResponse.success ) {
        throw new Error( 'Scraping failed' );
    }

    if ( onProgress ) {
        await onProgress( 60 );
    }

    const products = scrapeResponse.data.products.map( ( p: any ) => ( {
        ...p,
        commision: parseFloat( commision || '1.1' ),
        shop: shop ? new mongoose.Types.ObjectId( `${ shop }` ) : undefined,
    } ) );

    const discountDocs = await Discount.insertMany( products );

    const sale = await Sale.create( {
        shop: new mongoose.Types.ObjectId( `${ shop }` ),
        products: discountDocs.map( p => p._id ),
        minCartCost: minimalCartPrice ? parseFloat( minimalCartPrice ) : 0,
        commission: parseFloat( commision || '1.1' ),
        currency: currency || 'USD',
        totalPrice: 100,
    } );

    if ( onProgress ) {
        await onProgress( 100 );
    }

    return { message: 'Sale created', count: products.length, sale };
}
