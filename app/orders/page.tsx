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

function formatCalendarDayLabel( isoYmd: string ) {
    const [ y, m, d ] = isoYmd.split( '-' ).map( Number );
    return new Date( y, m - 1, d ).toLocaleDateString( 'uk-UA' );
}

export default function OrdersPage() {
    const [ orders, setOrders ] = useState<Order[]>( [] );
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
        fetchOrders(
            selectedDate || undefined,
            selectedShop === '' ? undefined : selectedShop
        );
    }, [ selectedDate, selectedShop ] );

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

    // ✅ GROUP BY SHOP
    const groupedByShops = orders.reduce( ( acc, order ) => {
        const shopId = order.sale.shop._id;

        if ( !acc[ shopId ] ) {
            acc[ shopId ] = {
                shop: order.sale.shop,
                orders: [],
            };
        }

        acc[ shopId ].orders.push( order );

        return acc;
    }, {} as Record<string, { shop: Order[ 'sale' ][ 'shop' ]; orders: Order[] }> );

    console.log( groupedByShops );

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
                                textAlign: 'left',
                            }}
                        >
                            {selectedDate === null
                                ? '…'
                                : selectedDate
                                    ? formatCalendarDayLabel( selectedDate )
                                    : 'Виберіть дату'}
                        </button>

                        {showCalendar && (
                            <div
                                className="calendar-container"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    zIndex: 1000,
                                    marginTop: '4px',
                                }}
                            >
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
                            marginLeft: '10px',
                            padding: '8px 16px',
                            backgroundColor: 'orangered',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Показати всі
                    </button>
                </div>

                {loading ? (
                    <p>Завантаження...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        {Object.values( groupedByShops ).map( ( group ) => {
                            const shopTotal = group.orders.reduce(
                                ( sum, o ) => sum + o.totalCost,
                                0
                            );

                            return (
                                <div key={group.shop._id} style={{ marginBottom: '40px' }}>
                                    <h2><b>{group.shop.title}</b></h2>
                                    <p><b>Сума по магазину: ₴{shopTotal.toFixed( 2 )}</b></p>

                                    <table
                                        style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            border: '1px solid #ddd',
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>Дата</th>
                                                <th>ПІБ</th>
                                                <th>Адреса</th>
                                                <th>Доставка</th>
                                                <th>Телефон</th>
                                                <th>Коментар</th>
                                                <th>Товари</th>
                                                <th>Всього</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {group.orders.map( ( order: any ) => (
                                                <tr key={order._id}>
                                                    <td>{formatDate( order.createdAt )}</td>
                                                    <td>{order.customerInfo.fullName}</td>
                                                    <td>{order.customerInfo.address}</td>
                                                    <td>{order.customerInfo.delivery}</td>
                                                    <td>{order.customerInfo.phone}</td>
                                                    <td>{order.customerInfo.comment}</td>
                                                    <td>
                                                        <ul style={{ margin: 0, padding: 0 }}>
                                                            {order.items.map( ( item, i ) => (
                                                                <li key={i}>
                                                                    <a
                                                                        href={item.productId.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {item.productId.name}
                                                                    </a>{' '}
                                                                    (x{item.quantity}) — ₴
                                                                    {( item.price * item.quantity ).toFixed( 2 )}
                                                                </li>
                                                            ) )}
                                                        </ul>
                                                    </td>
                                                    <td>
                                                        <b>₴{order.totalCost.toFixed( 2 )}</b>
                                                    </td>
                                                </tr>
                                            ) )}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        } )}

                        {orders.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '20px' }}>
                                Немає замовлень
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}