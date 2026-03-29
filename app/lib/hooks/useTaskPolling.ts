'use client';

import { useEffect, useState } from "react";

type TaskStatus = "idle" | "pending" | "done" | "error";

export function useTaskPolling( taskId: string | null ) {
    const [ status, setStatus ] = useState<TaskStatus>( "idle" );
    const [ data, setData ] = useState<any>( null );

    useEffect( () => {
        if ( !taskId ) return;

        let interval: any;

        const fetchStatus = async () => {
            try {
                const res = await fetch( `/api/task-status?taskId=${ taskId }` );
                const json = await res.json();

                setStatus( json.status );

                if ( json.status === "done" ) {
                    setData( json.data );
                    clearInterval( interval );
                }

                if ( json.status === "error" ) {
                    clearInterval( interval );
                }
            } catch ( e ) {
                console.error( e );
                clearInterval( interval );
                setStatus( "error" );
            }
        };

        setStatus( "pending" );
        fetchStatus(); // первый запрос сразу

        interval = setInterval( fetchStatus, 2000 ); // каждые 2 сек

        return () => clearInterval( interval );
    }, [ taskId ] );

    return { status, data };
}