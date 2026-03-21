import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../db';
import Shop from './../../models/shop';

export async function GET() {
    try {
        await dbConnect();
        const shops = await Shop.find( {} );
        return NextResponse.json( shops );
    } catch ( error ) {
        return NextResponse.json( { error: 'Failed to fetch shops' }, { status: 500 } );
    }
}

export async function POST( request: NextRequest ) {
    try {
        await dbConnect();
        const { title, link } = await request.json();
        const newShop = new Shop( { title, link } );
        await newShop.save();
        return NextResponse.json( newShop, { status: 201 } );
    } catch ( error ) {
        return NextResponse.json( { error: 'Failed to add shop' }, { status: 500 } );
    }
}