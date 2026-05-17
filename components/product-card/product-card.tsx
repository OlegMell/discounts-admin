"use client";

import styles from "./product-card.module.css";

export default function ProductCard( { product, idx, removeItem }:
    { removeItem: ( idx: number ) => void; idx: number; product: any; } ) {
    return (
        <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
        >
            <div className={styles.imageWrapper}>
                <img className={styles.image} src={product.image} alt={product.name} />
            </div>

            <div className={styles.info}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                    <div className={styles.name}>{product.name}</div>
                </div>

                <div className={styles.prices}>
                    <div className='flex flex-col'>
                        <div className={styles.price}>{product.price}</div>
                        <div className={styles.price}>₴{product.exchangedPrice}</div>
                    </div>

                    {product.old_price && (
                        <span className={styles.oldPrice}>{product.old_price}</span>
                    )}
                </div>

                <button onClick={( e ) => { e.preventDefault(); removeItem( idx ); }} type='button' className={styles.cartButton}>Видалити</button>
            </div>
        </a>
    );
}