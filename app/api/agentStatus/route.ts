import Firecrawl, { AgentStatusResponse } from '@mendable/firecrawl-js';

export async function GET( req: any ) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get( 'id' );

    const app = new Firecrawl( { apiKey: process.env.Firecrawl_API_KEY } );
    const job: AgentStatusResponse = await app.getAgentStatus( id );

    return new Response( JSON.stringify( job ), { status: 200 } );
}