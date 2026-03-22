import dbConnect from './db';
import '@/models/index';

export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;
    await dbConnect();
}