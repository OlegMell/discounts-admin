import { NextRequest, NextResponse } from 'next/server';
import Shop from './../../models/shop';

export async function GET() {
    try {
        const shops = await Shop.find( {} );
        return NextResponse.json( shops );
    } catch ( error ) {
        return NextResponse.json( { error: 'Failed to fetch shops' }, { status: 500 } );
    }
}

const DEFAULT_PROMPT = 'Your task is to extract <count> products that currently have discounts from the website. If possible, also include only products with a price after discount between <minPrice> and <maxPrice>. Also check the link to product image. It should be a direct link to the image and should be working link. If the link is not working, try to find another on the page.';

export async function POST( request: NextRequest ) {
    try {
        const { title, link, prompt } = await request.json();
        const newShop = new Shop( { title, link, prompt: prompt || DEFAULT_PROMPT } );
        await newShop.save();
        return NextResponse.json( newShop, { status: 201 } );
    } catch ( error ) {
        return NextResponse.json( { error: 'Failed to add shop' }, { status: 500 } );
    }
}