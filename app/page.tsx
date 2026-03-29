'use client';

import { useState, useEffect } from 'react';
import Header from '../components/header';
import ResultBlock from '../components/ResultBlock';

export default function Home() {
  const [ taskId, setTaskId ] = useState( '' );
  const [ siteLink, setSiteLink ] = useState( '' );
  const [ shop, setShop ] = useState( '' );
  const [ minimalCartPrice, setMinimalCartPrice ] = useState( '' );
  const [ minPrice, setMinPrice ] = useState( '' );
  const [ maxPrice, setMaxPrice ] = useState( '' );
  const [ count, setCount ] = useState( '' );
  const [ commision, setCommision ] = useState( 1.1 );
  const [ currency, setCurrency ] = useState( 'USD' );

  const [ shops, setShops ] = useState( [] );
  const [ selectedShop, setSelectedShop ] = useState( '' );

  const [ isLoading, setIsLoading ] = useState( false );

  useEffect( () => {
    fetch( '/api/shops' )
      .then( res => res.ok ? res.json() : [] )
      .then( setShops )
      .catch( console.error );
  }, [] );

  const submitForm = async ( e ) => {
    e.preventDefault();

    if ( !siteLink || !selectedShop || !minimalCartPrice ) {
      alert( 'Please fill in all required fields' );
      return;
    }

    setIsLoading( true );
    try {
      const response = await fetch( `/api/discounts?link=${ encodeURIComponent( siteLink ) }&shop=${ encodeURIComponent( selectedShop ) }&minimalCartPrice=${ encodeURIComponent( minimalCartPrice ) }&minPrice=${ encodeURIComponent( minPrice ) }&maxPrice=${ encodeURIComponent( maxPrice ) }&count=${ encodeURIComponent( count ) }&commision=${ encodeURIComponent( commision.toString() ) }&currency=${ encodeURIComponent( currency ) }` );

      if ( response.ok ) {
        const data = await response.json();
        console.log( 'API Response:', data );
        setTaskId( data.taskId );
      } else {
        console.error( 'API Error:', response.statusText );
      }
    } catch ( error ) {
      console.error( 'Fetch Error:', error );
    } finally {
      setIsLoading( false );
    }
  }

  return (
    <div className='container-c'>
      <Header />
      <main className=''>
        {
          !taskId ? (
            <form className='main'>
              <label>Виберіть магазин</label>
              <select className='input' value={selectedShop} onChange={( e ) => setSelectedShop( e.target.value )} disabled={isLoading} required>
                <option value=''>Не обрано</option>
                {shops.map( ( s ) => (
                  <option key={s._id} value={s._id}>{s.title}</option>
                ) )}
              </select>
              <label>Введіть посилання на сторінку зі знижками</label>
              <input className='site-input input' type="text" disabled={isLoading} name="site" placeholder='https://...' value={siteLink} onChange={( e ) => setSiteLink( e.target.value )} />
              <label>Введіть валюту cайту</label>
              <input className='currency-input input' type="text" disabled={isLoading} name="currency" placeholder='USD, EUR, GBP...' value={currency} onChange={( e ) => setCurrency( e.target.value.toUpperCase() )} />
              <label>Введіть комісію</label>
              <input className='commision-input input' type="text" disabled={isLoading} name="commision" placeholder='Комісія' value={commision} onChange={( e ) => setCommision( parseFloat( e.target.value ) )} />
              <label>Введіть мінімальну суму кошика</label>
              <input className='minimal-cart-price-input input' type="text" disabled={isLoading} name="minimalCartPrice" placeholder='Мінімальна сума кошика' value={minimalCartPrice} onChange={( e ) => setMinimalCartPrice( e.target.value )} />
              <label>Введіть мінімальну ціну</label>
              <input className='min-price-input input' type="text" name="minPrice" disabled={isLoading} placeholder='Мінімальна ціна' value={minPrice} onChange={( e ) => setMinPrice( e.target.value )} />
              <label>Введіть максимальну ціну</label>
              <input className='max-price-input input' type="text" name="maxPrice" disabled={isLoading} placeholder='Максимальна ціна' value={maxPrice} onChange={( e ) => setMaxPrice( e.target.value )} />
              <label>Введіть кількість товарів</label>
              <input className='count-input input' type="text" name="count" disabled={isLoading} placeholder='Кількість товарів' value={count} onChange={( e ) => setCount( e.target.value )} />

              <button className='site-button' type="submit" onClick={submitForm} disabled={isLoading}>{isLoading ? 'Завантаження...' : 'Завантажити знижки'}</button>
            </form>
          ) :
            (
              <>
                <ResultBlock taskId={taskId} />
                <button className='site-button' type='button' onClick={() => setTaskId( '' )}>RESET</button>
              </>
            )
        }
      </main>
    </div>
  );
}
