import mongoose from 'mongoose';
import Discount from './../../models/product';
import Sale from './../../models/sale';

export async function POST( req: any ) {
    try {
        const body = await req.json();

        const {
            previewItems,
            shop,
            minimalCartPrice,
            commission,
            currency
        } = body;

        if ( !previewItems || !Array.isArray( previewItems ) || previewItems.length === 0 ) {
            return new Response( JSON.stringify( { error: 'Preview items are required' } ), { status: 400 } );
        }

        if ( !shop ) {
            return new Response( JSON.stringify( { error: 'Shop ID is required' } ), { status: 400 } );
        }

        // Add shop ID and commission to each item
        const productsWithShop = previewItems.map( ( item: any ) => ( {
            ...item,
            shop: new mongoose.Types.ObjectId( shop ),
            commission: parseFloat( commission ) || 1.1
        } ) );

        // Insert all products
        const insertedProducts = await Discount.insertMany( productsWithShop );

        // Create sale with product IDs
        const sale = await Sale.create( {
            shop: new mongoose.Types.ObjectId( shop ),
            products: insertedProducts.map( p => p._id ),
            minCartCost: parseFloat( minimalCartPrice ) || 0,
            commission: parseFloat( commission ) || 1.1,
            currency: currency || 'USD'
        } );

        return new Response(
            JSON.stringify( {
                success: true,
                message: 'Sale created successfully',
                count: insertedProducts.length,
                sale: sale
            } ),
            { status: 200 }
        );
    } catch ( error: any ) {
        console.error( 'Error saving sale:', error );
        return new Response(
            JSON.stringify( { error: error.message || 'Failed to save sale' } ),
            { status: 500 }
        );
    }
}
