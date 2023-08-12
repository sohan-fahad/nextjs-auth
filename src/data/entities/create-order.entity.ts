export interface ICreateOrder {
    product: string;
    variantOptions?: string[];
    quantity: number;
}