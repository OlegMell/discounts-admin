'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Calendar from '../../components/Calendar';
import { Sale } from '../interfaces/sale.interface';

type Order = {
    _id: string;
    fullName: string;
    address: string;
    delivery: string;
    phone: string;
    comment: string;
    sale: Sale;
    items: {
        name: string;
        price: number;
        originalPrice: string;
        image: string;
        link: string;
        quantity: number;
        shop: { _id: string; title: string; link?: string };
    }[];
    totalCost: number;
    usdRate: number;
    createdAt: string;
};

/** Calendar YYYY-MM-DD → uk-UA; use local Y/M/D (not Date.parse) so server/client match. */
function formatCalendarDayLabel( isoYmd: string ) {
    const [ y, m, d ] = isoYmd.split( '-' ).map( Number );
    return new Date( y, m - 1, d ).toLocaleDateString( 'uk-UA' );
}

export default function OrdersPage() {
    const [ orders, setOrders ] = useState<Order[]>( [] );
    /** null until client mount — avoids SSR/client mismatch from Date/timezone */
    const [ selectedDate, setSelectedDate ] = useState<string | null>( null );
    const [ selectedShop, setSelectedShop ] = useState( '' );
    const [ loading, setLoading ] = useState( false );
    const [ showCalendar, setShowCalendar ] = useState( false );

    const fetchOrders = async ( date?: string, shop?: string ) => {
        setLoading( true );
        try {
            const params = new URLSearchParams();
            if ( date ) params.append( 'date', date );
            if ( shop ) params.append( 'shop', shop );
            const url = `/api/orders${ params.toString() ? '?' + params.toString() : '' }`;
            const response = await fetch( url );
            if ( response.ok ) {
                const data = await response.json();
                console.log( { data } )
                setOrders( data );
            } else {
                console.error( 'Failed to fetch orders' );
            }
        } catch ( error ) {
            console.error( 'Error fetching orders:', error );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        setSelectedDate( new Date().toISOString().split( 'T' )[ 0 ] );
    }, [] );

    useEffect( () => {
        if ( selectedDate === null ) return;
        fetchOrders( selectedDate || undefined, selectedShop === '' ? undefined : selectedShop );
    }, [ selectedDate, selectedShop ] );

    // Close calendar when clicking outside
    useEffect( () => {
        const handleClickOutside = ( event: MouseEvent ) => {
            const target = event.target as Element;
            if ( showCalendar && !target.closest( '.calendar-container' ) ) {
                setShowCalendar( false );
            }
        };

        document.addEventListener( 'mousedown', handleClickOutside );
        return () => document.removeEventListener( 'mousedown', handleClickOutside );
    }, [ showCalendar ] );

    const handleDateChange = ( date: string ) => {
        setSelectedDate( date );
        setShowCalendar( false );
    };

    const handleShopChange = ( e: React.ChangeEvent<HTMLSelectElement> ) => {
        console.log( e.target.value )
        setSelectedShop( e.target.value );
    };

    const toggleCalendar = () => {
        setShowCalendar( !showCalendar );
    };

    const formatDate = ( dateString: string ) => {
        return new Intl.DateTimeFormat( 'uk-UA', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'Europe/Kyiv',
        } ).format( new Date( dateString ) );
    };

    // Get unique shops from all orders
    const shops = Array.from( new Set(
        orders.flatMap( order => order.sale.shop )
    ) ).sort();

    return (
        <div>
            <Header />
            <div style={{ padding: '20px' }}>
                <h1>Замовлення</h1>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px' }}>
                        Виберіть дату:
                    </label>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            className="calendar-container"
                            onClick={toggleCalendar}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                minWidth: '120px',
                                textAlign: 'left'
                            }}
                        >
                            {selectedDate === null
                                ? '…'
                                : selectedDate
                                    ? formatCalendarDayLabel( selectedDate )
                                    : 'Виберіть дату'}
                        </button>
                        {showCalendar && (
                            <div className="calendar-container" style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                zIndex: 1000,
                                marginTop: '4px'
                            }}>
                                <Calendar
                                    selectedDate={selectedDate ?? ''}
                                    onDateSelect={handleDateChange}
                                />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setSelectedDate( '' );
                            setSelectedShop( '' );
                            fetchOrders();
                        }}
                        style={{
                            marginLeft: '10px', padding: '8px 16px', 'backgroundColor': 'orangered',
                            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                        }}
                    >
                        Показати всі
                    </button>
                    {/* <label htmlFor="shopSelect" style={{ marginLeft: '20px', marginRight: '10px' }}>
                        Магазин:
                    </label> */}
                    {/* <select
                        id="shopSelect"
                        value={selectedShop}
                        onChange={handleShopChange}
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                        <option value="">Всі магазини</option>
                        {shops.map( shop => (
                            <option key={shop._id} value={shop._id}>{shop.title}</option>
                        ) )}
                    </select> */}
                </div>

                {loading ? (
                    <p>Завантаження...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        {orders.map( order => (
                            <div key={order._id} style={{ marginBottom: '40px' }}>
                                <h3>Замовлення #{order._id}</h3>
                                <h4><b>{order.sale.shop.title}</b></h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '4px', border: '1px solid #ddd' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '--background-color' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Дата</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>ПІБ</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Адреса</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Доставка</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Телефон</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Коментар</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Товари</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Всього</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map( ( order ) => (
                                            <tr key={order._id} style={{ border: '1px solid #ddd' }}>
                                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                                    {formatDate( order.createdAt )}
                                                </td>
                                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                                    {order.customerInfo?.fullName}
                                                </td>
                                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                                    {order.customerInfo?.address}
                                                </td>
                                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                                    {order.customerInfo?.delivery}
                                                </td>
                                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                                    {order.customerInfo?.phone}
                                                </td>
                                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                                    {order.customerInfo?.comment}
                                                </td>
                                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                                        {order.items.map( ( item, index ) => (
                                                            <li key={index} style={{ marginBottom: '4px' }}>
                                                                <a href={item.productId.link} target="_blank" rel="noopener noreferrer">{item.productId.name}</a> (x{item.quantity}) - ₴{( item.price * item.quantity ).toFixed( 2 )}
                                                            </li>
                                                        ) )}
                                                    </ul>
                                                </td>
                                                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                                    ₴{( order.totalCost ).toFixed( 2 )}
                                                </td>
                                            </tr>
                                        ) )}
                                    </tbody>
                                </table>

                            </div>
                        ) )}
                        {orders.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Немає замовлень для вибраної дати </p>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}