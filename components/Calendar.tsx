'use client';

import { useState } from 'react';

interface CalendarProps {
    selectedDate: string;
    onDateSelect: ( date: string ) => void;
}

export default function Calendar( { selectedDate, onDateSelect }: CalendarProps ) {
    const [ currentMonth, setCurrentMonth ] = useState( new Date() );

    const today = new Date();
    const selected = selectedDate ? new Date( selectedDate ) : null;

    // Get days in month
    const getDaysInMonth = ( date: Date ) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date( year, month, 1 );
        const lastDay = new Date( year, month + 1, 0 );
        const daysInMonth = lastDay.getDate();

        // Get starting day of the week (0 = Sunday, 1 = Monday, etc.)
        const startDay = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for ( let i = 0; i < startDay; i++ ) {
            days.push( null );
        }

        // Add days of the month
        for ( let day = 1; day <= daysInMonth; day++ ) {
            days.push( new Date( year, month, day ) );
        }

        return days;
    };

    const days = getDaysInMonth( currentMonth );
    const monthNames = [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];

    const goToPreviousMonth = () => {
        setCurrentMonth( new Date( currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1 ) );
    };

    const goToNextMonth = () => {
        setCurrentMonth( new Date( currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1 ) );
    };

    const goToToday = () => {
        setCurrentMonth( new Date() );
    };

    const handleDateClick = ( date: Date ) => {
        const year = date.getFullYear();
        const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
        const day = String( date.getDate() ).padStart( 2, '0' );
        const dateString = `${ year }-${ month }-${ day }`;
        onDateSelect( dateString );
    };

    const isToday = ( date: Date | null ) => {
        return date !== null && date.toDateString() === today.toDateString();
    };

    const isSelected = ( date: Date | null ) => {
        return date !== null && selected !== null && selected.toDateString() === date.toDateString();
    };

    const isCurrentMonth = ( date: Date | null ) => {
        return date !== null && date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
    };

    return (
        <div className="calendar-container" style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'black',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: '300px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <button
                    onClick={goToPreviousMonth}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px'
                    }}
                    onMouseOver={( e ) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={( e ) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    ‹
                </button>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {monthNames[ currentMonth.getMonth() ]} {currentMonth.getFullYear()}
                    </div>
                    <button
                        onClick={goToToday}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textDecoration: 'underline',
                            marginTop: '4px'
                        }}
                    >
                        Сьогодні
                    </button>
                </div>
                <button
                    onClick={goToNextMonth}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px'
                    }}
                    onMouseOver={( e ) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={( e ) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    ›
                </button>
            </div>

            {/* Days of week header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '2px',
                marginBottom: '8px'
            }}>
                {[ 'Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб' ].map( day => (
                    <div key={day} style={{
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#666',
                        padding: '8px 0'
                    }}>
                        {day}
                    </div>
                ) )}
            </div>

            {/* Calendar grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '2px'
            }}>
                {days.map( ( date, index ) => (
                    <div key={index} style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: date ? 'pointer' : 'default',
                        borderRadius: '4px',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        backgroundColor: date ? (
                            isSelected( date ) ? '#007bff' :
                                isToday( date ) ? '#e3f2fd' : 'transparent'
                        ) : 'transparent',
                        color: date ? (
                            isSelected( date ) ? 'white' :
                                isToday( date ) ? '#1976d2' :
                                    isCurrentMonth( date ) ? '#fff' : '#ccc'
                        ) : 'transparent',
                        fontWeight: isSelected( date ) || isToday( date ) ? 'bold' : 'normal'
                    }}
                        onClick={() => date && handleDateClick( date )}
                        onMouseOver={( e ) => {
                            if ( date && !isSelected( date ) ) {
                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }
                        }}
                        onMouseOut={( e ) => {
                            if ( date && !isSelected( date ) ) {
                                e.currentTarget.style.backgroundColor = isToday( date ) ? '#e3f2fd' : 'transparent';
                            }
                        }}
                    >
                        {date ? date.getDate() : ''}
                    </div>
                ) )}
            </div>
        </div>
    );
}