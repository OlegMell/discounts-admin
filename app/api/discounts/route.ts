import Firecrawl from '@mendable/firecrawl-js';
import mongoose from 'mongoose';
import Discount from './../../models/product';
import Sale from './../../models/sale';

const schema = {
    type: "object",
    properties: {
        products: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    price: { type: "string" },
                    old_price: { type: "string" },
                    link: { type: "string" },
                    image: { type: "string" }
                }
            }
        }
    }
};

export async function GET( req: any ) {

    const searchParams = req.nextUrl.searchParams;
    const link = searchParams.get( 'link' );
    const shop = searchParams.get( 'shop' );
    const minimalCartPrice = searchParams.get( 'minimalCartPrice' );
    const minPrice = searchParams.get( 'minPrice' );
    const maxPrice = searchParams.get( 'maxPrice' );
    const count = searchParams.get( 'count' );
    const commision = searchParams.get( 'commision' );
    const currency = searchParams.get( 'currency' );

    const app = new Firecrawl( { apiKey: process.env.Firecrawl_API_KEY } );
    // Scrape a website
    const scrapeResponse: any = await app.agent( {
        urls: [ link ],
        prompt: `Your task is to extract ${ count || 10 } products that currently have discounts from the website. If possible, also include only products with a price after discount between ${ minPrice } and ${ maxPrice }.`,
        schema: schema
    } );

    if ( scrapeResponse.success ) {

        const products = scrapeResponse.data.products.map( ( p: any ) => ( { ...p, commision: parseFloat( commision || '1.1' ), shop: shop ? new mongoose.Types.ObjectId( `${ shop }` ) : undefined } ) );
        console.log( { products } );

        const discountDocs = await Discount.insertMany( products );

        const sale = await Sale.create( {
            shop: new mongoose.Types.ObjectId( `${ shop }` ),
            products: discountDocs.map( p => p._id ),
            minCartCost: minimalCartPrice ? parseFloat( minimalCartPrice ) : 0,
            commission: parseFloat( commision || '1.1' ),
            currency: currency || 'USD',
            totalPrice: 100
        } );

        return new Response( JSON.stringify( { message: 'Sale created', count: products.length, sale } ), { status: 200 } );
    } else {
        return new Response( 'Scraping failed', { status: 500 } );
    }
}