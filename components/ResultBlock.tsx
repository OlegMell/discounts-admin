'use client';

import { useTaskPolling } from "./../app/lib/hooks/useTaskPolling";
import { Loader } from './Loader'

export default function ResultBlock( { taskId }: { taskId: string } ) {
    const { status, data } = useTaskPolling( taskId );

    if ( status === "pending" ) {
        return <Loader />;
    }

    if ( status === "error" ) {
        return <p>Ошибка при обработке 😢</p>;
    }

    if ( status === "done" ) {
        return (
            <div>
                <h2>Результат:</h2>
                <pre>{JSON.stringify( data, null, 2 )}</pre>
            </div>
        );
    }

    return null;
}