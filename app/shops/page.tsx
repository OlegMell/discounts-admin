'use client';

import Header from '../../components/header';
import { useState, useEffect } from 'react';

export default function Shops() {
    const [ shops, setShops ] = useState( [] );
    const [ title, setTitle ] = useState( '' );
    const [ link, setLink ] = useState( '' );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ showDialog, setShowDialog ] = useState( false );

    const fetchShops = async () => {
        try {
            const res = await fetch( '/api/shops' );
            if ( res.ok ) {
                const data = await res.json();
                setShops( data );
            }
        } catch ( error ) {
            console.error( 'Failed to fetch shops:', error );
        }
    };

    useEffect( () => {
        fetchShops();
    }, [] );

    const submitForm = async ( e ) => {
        e.preventDefault();
        if ( !title.trim() ) return;
        setIsLoading( true );
        try {
            const res = await fetch( '/api/shops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { title: title.trim(), link: link.trim() || undefined } ),
            } );
            if ( res.ok ) {
                setTitle( '' );
                setLink( '' );
                await fetchShops();
                setShowDialog( false );
            } else {
                console.error( 'Failed to add shop' );
            }
        } catch ( error ) {
            console.error( 'Error adding shop:', error );
        } finally {
            setIsLoading( false );
        }
    };

    return (
        <div className='container-c'>
            <Header />
            <main className='main cols'>
                <div>
                    <h2>Магазини</h2>
                    {shops.length > 0 ? (
                        <ul>
                            {shops.map( ( shop ) => (
                                <li key={shop._id}>
                                    <strong>{shop.title}</strong>
                                    {shop.link && <a href={shop.link} target="_blank" rel="noopener noreferrer"> (Link)</a>}
                                </li>
                            ) )}
                        </ul>
                    ) : (
                        <p>Магазини не додано ще.</p>
                    )}
                    <button className='site-button mt-4' onClick={() => setShowDialog( true )}>Додати магазин</button>
                </div>
            </main>
            {showDialog && (
                <div className="fixed inset-0 bg-black flex items-center justify-center z-50" onClick={() => setShowDialog( false )}>
                    <div className="p-6 rounded shadow-lg max-w-md w-full mx-4" onClick={( e ) => e.stopPropagation()}>
                        <h2>Додати магазин</h2>
                        <form onSubmit={submitForm}>
                            <input
                                type="text"
                                placeholder="Назва магазину"
                                value={title}
                                className='input mb-4'
                                onChange={( e ) => setTitle( e.target.value )}
                                required
                            />
                            <input
                                type="url"
                                placeholder="Посилання на магазин (необов'язково)"
                                value={link}
                                className='input mb-4'
                                onChange={( e ) => setLink( e.target.value )}
                            />
                            <div className="flex gap-2">
                                <button className='site-button' type="submit" disabled={isLoading}>
                                    {isLoading ? 'Збереження...' : 'Додати магазин'}
                                </button>
                                <button type="button" onClick={() => setShowDialog( false )}>Скасувати</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}