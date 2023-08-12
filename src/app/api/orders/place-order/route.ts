import { ICreateOrder } from "@/data/entities/create-order.entity";
import { checkBearerTokenForOrder } from "@/helpers/check-bearer-token.helper";
import { NextResponse } from "next/server";
import { ICartSummery } from '../../../../data/entities/cart-summary.entities';

export async function POST(req: Request) {
    try {
        if (!checkBearerTokenForOrder()) {
            return NextResponse.json({ message: 'Unauthorized request!', success: false, statusCode: 401 }, { status: 401 });
        }

        const { products, tableId } = await req.json()

        if (!products.length) return NextResponse.json({ message: 'Invalid product data!', success: false, statusCode: 400 }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
    }
}


async function validateOrderProducts(
    products: ICreateOrder[] | ICartSummery[],
) {

    if (!products || !Array.isArray(products) || !products.length) {
        return NextResponse.json({ message: 'Invalid products data', success: false }, { status: 400 })
    }

    const orderItems: OrderItem[] = [];

    await asyncForEach(cartProducts, async (cart: CartDTO) => {
        const orderItemVariants: OrderItemVariant[] = [];

        await asyncForEach(cart.variantOptions, async (vOptId: string) => {
            const vOpt = await this.productVariantOptionService.findOneBase(
                {
                    product: cart.product as any,
                    id: vOptId as any,
                },
                {
                    relations: ['product', 'variant', 'variantOption'],
                }
            );

            if (!vOpt) {
                throw new BadRequestException('Invalid product variant option');
            }

            if (vOpt.stock < cart.quantity) {
                throw new BadRequestException(`Product is out of stock`);
            }

            orderItemVariants.push({
                variant: vOpt.variant,
                variantOption: vOpt.variantOption,
            } as OrderItemVariant);
        });

        const productDetails = await this.productService.findByIdBase(
            cart.product
        );
        orderItems.push({
            quantity: cart.quantity,
            product: productDetails,
            mrp: productDetails.newPrice,
            mrpVat: productDetails.mrpVat,
            discount: productDetails.oldPrice - productDetails.newPrice,
            couponDiscount: 0,
            orderItemVariants,
        } as OrderItem);
    });

    const order: Order = {
        orderItems,
    };

    return order;
}