import mongoose, { type Mongoose } from 'mongoose';
// Register all models on the same mongoose instance used by dbConnect (avoids MissingSchemaError
// when Next bundles multiple mongoose copies unless serverExternalPackages includes mongoose).
import './app/models/index';

const MONGODB_URI = process.env.MONGODB_URI;

if ( !MONGODB_URI ) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local',
    )
}

type MongooseCache = {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
};

let cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };
if ( !global.mongoose ) {
    global.mongoose = cached;
}

async function dbConnect() {
    if ( cached.conn ) {
        return cached.conn
    }
    if ( !cached.promise ) {
        const opts = {
            bufferCommands: false,
        }
        cached.promise = mongoose.connect( MONGODB_URI!, opts ).then( mongoose => {
            console.log( 'Db connected' )

            return mongoose
        } )
    }
    try {
        cached.conn = await cached.promise
    } catch ( e ) {
        cached.promise = null
        throw e
    }

    return cached.conn
}

export default dbConnect;