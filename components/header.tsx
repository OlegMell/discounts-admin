import Link from 'next/link';

export default function Header() {
    return (
        <header className='header'>
            <h1 className='header-title'><Link href="/">Discounts Admin</Link></h1>
            <nav>
                <Link className='nav-link' href="/shops">Магазини</Link>
                <Link className='nav-link' href="/orders">Замовлення</Link>
            </nav>
        </header>
    );
}