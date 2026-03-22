import dbConnect from '../../../db';
import Order from './../../models/order';

export async function GET( request: Request ) {
    try {
        await dbConnect();

        const { searchParams } = new URL( request.url );
        const date = searchParams.get( 'date' );
        const shop = searchParams.get( 'shop' );

        const query: any = {};
        if ( date ) {
            const startOfDay = new Date( date );
            startOfDay.setHours( 0, 0, 0, 0 );
            const endOfDay = new Date( date );
            endOfDay.setHours( 23, 59, 59, 999 );

            query.createdAt = {
                $gte: startOfDay,
                $lt: endOfDay,
            };
        }

        const orders = await Order.find( query )
            // .populate( { path: 'items.productId', model: Discount } )
            // .populate( {
            //     path: 'sale',
            //     model: Sale,
            //     populate: { path: 'shop', model: Shop }
            // } )
            .sort( { createdAt: -1 } );

        return Response.json( orders );
    } catch ( error ) {
        console.error( 'Error fetching orders:', error );
        return Response.json( { error: 'Failed to fetch orders' }, { status: 500 } );
    }
}