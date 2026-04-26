import Firecrawl from '@mendable/firecrawl-js';
import mongoose from 'mongoose';
import Discount from './../../models/product';
import Shop from './../../models/shop';
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

    const _shop: { prompt: string } | null = await Shop.findOne( { _id: new mongoose.Types.ObjectId( `${ shop }` ) } );

    console.log( { _shop } );

    if ( !_shop ) {
        return new Response( 'Scraping failed. Shop was not found!', { status: 404 } );
    }

    const prompt = _shop.prompt.replace( '<count>', count ).replace( '<minPrice>', minPrice ).replace( '<maxPrice>', maxPrice );

    const app = new Firecrawl( { apiKey: process.env.Firecrawl_API_KEY } );
    // Scrape a website
    const scrapeResponse: any = await app.agent( {
        urls: [ link ],
        prompt,
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