// app/api/task-status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getUpstashRest } from './../../lib/redis'

export async function GET( req: NextRequest ) {
    const taskId = req.nextUrl.searchParams.get( "taskId" );

    // достаешь из Redis / DB
    const task = await getUpstashRest()?.get( `scrape-${ taskId }` );

    return NextResponse.json( {
        status: ( task as any ).status, // 'pending' | 'done' | 'error'
        data: ( task as any ).data?.message || null,
    } );
}