export interface Product {
    _id: string;
    name: string;
    price: string;
    exchangedPrice: number;
    old_price?: string;
    link: string;
    image: string;
    createdAt?: string;
};