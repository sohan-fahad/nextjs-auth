import { ICreateOrder } from "@/data/entities/create-order.entity";

export const OrderHelperService = {
    calculateOrderAmount: async (order: ICreateOrder[]) => {

        const subTotal = order.reduce((acc, item) => {
            const variantOptionSubtotal: number = item?.variantOptions?.reduce((pre, current) => pre?.mrp + current?.mrp)
            return acc + (item?.mrp + variantOptionSubtotal) * item.quantity;
        }, 0);
        const vat = subTotal / 100 * 20;
        const total = subTotal + vat

        return {
            subTotal, vat, total
        }
    }
}