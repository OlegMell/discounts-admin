import path from 'path';
import dotenv from 'dotenv';

const adminRoot = path.resolve( __dirname, '..', '..', '..' );

dotenv.config( { path: path.join( adminRoot, '.env.local' ) } );
dotenv.config( { path: path.join( adminRoot, '.env' ) } );
