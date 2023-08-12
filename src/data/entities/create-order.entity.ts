export interface ICreateOrder {
    productId: string;
    variantOptions?: any[];
    quantity: number;
    mrp: number
}