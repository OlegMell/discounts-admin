export async function POST( req: any ) {
    try {
        const formData = await req.formData();
        const file = formData.get( 'file' ) as File;

        if ( !file ) {
            return new Response( JSON.stringify( { error: 'No file provided' } ), { status: 400 } );
        }

        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from( bytes ).toString( 'base64' );
        const mimeType = file.type || `image/${ file.name.split( '.' ).pop() || 'png' }`;
        const imageUrl = `data:${ mimeType };base64,${ base64 }`;

        return new Response( JSON.stringify( { success: true, url: imageUrl } ), { status: 200 } );
    } catch ( error: any ) {
        console.error( 'Upload error:', error );
        return new Response( JSON.stringify( { error: error.message || 'Upload failed' } ), { status: 500 } );
    }
}
