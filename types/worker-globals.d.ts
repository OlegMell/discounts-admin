import type { Mongoose } from 'mongoose';

declare global {
    // Same cache shape as db.ts (serverless mongoose singleton).
    var mongoose:
        | {
              conn: Mongoose | null;
              promise: Promise<Mongoose> | null;
          }
        | undefined;
}

export {};
