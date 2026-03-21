import { Product } from './product.interface';
import { Shop } from './shop.interface';

export interface Sale {
    _id: string;
    shop: Shop;
    products: Product[];
    minCartCost: number;
    commission: number;
    createdAt: string;
    currency: string;
}