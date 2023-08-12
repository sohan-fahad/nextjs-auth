import { ICreateOrder } from "@/data/entities/create-order.entity";
import { checkBearerTokenForOrder } from "@/helpers/check-bearer-token.helper";
import { NextResponse } from "next/server";
import { ICartSummery } from '../../../../data/entities/cart-summary.entities';
import { asyncForEach } from "@/utils/asyncForEach.utils";
import { prisma } from '@/lib/prisma';
import { OrderHelperService } from "@/services/helper-services/order.helper.service";
import { decodedOrderHeaderToken } from "@/helpers/decoded-header-token.helper";
import { ENUM_ORDER_PAYMENT_METHOD, ENUM_ORDER_PAYMENT_STATUS, ENUM_ORDER_STATUS } from "@/data/constants/order.constant";
import { Prisma } from "@prisma/client";
import { sendEvent } from "@/lib/events";
import { SSE_EVENTS } from "@/data/constants/sse-event.constants";

export async function POST(req: Request) {
    try {
        if (!checkBearerTokenForOrder()) {
            return NextResponse.json({ message: 'Unauthorized request!', success: false, statusCode: 401 }, { status: 401 });
        }

        const { products } = await req.json();
        const decodedToken = decodedOrderHeaderToken();

        if (!products.length) return NextResponse.json({ message: 'Invalid product data!', success: false, statusCode: 400 }, { status: 400 });

        let orderProducts: any = await validateOrderProducts(products);
        const { subTotal, vat, total } = await OrderHelperService.calculateOrderAmount(orderProducts)


        return await prisma.$transaction(async (tx) => {
            const addedOrder = await tx.order.create({
                data: {
                    paymentStatus: ENUM_ORDER_PAYMENT_STATUS.PENDING,
                    orderStatus: ENUM_ORDER_STATUS.PENDING,
                    paymentMethod: ENUM_ORDER_PAYMENT_METHOD.CASH,
                    restaurantId: decodedToken?.restaurant?.id,
                    restaurantTableId: decodedToken?.restaurant?.tableId,
                    subTotal,
                    vat,
                    total,
                    dueAmount: total,
                }
            })

            await asyncForEach(orderProducts, async (_product: ICreateOrder) => {
                let _options: any[] = _product?.variantOptions as any[]
                delete _product?.variantOptions

                const addedOrderProductItems = await tx.orderItem.create({ data: { ..._product, orderId: addedOrder?.id } })


                _options = _options?.map((item: any) => {
                    delete item?.mrp
                    return { orderItemId: addedOrderProductItems?.id, ...item }
                })

                await tx.orderItemVariantOptions.createMany({ data: _options })
            })

            sendEvent({ type: SSE_EVENTS.ORDER_PLACED, payload: addedOrder })
            return NextResponse.json({ payload: addedOrder, message: "Order placed success", success: false, statusCode: 201 }, { status: 201 })



        })

    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false, }, { status: 400 })
    }
}


async function validateOrderProducts(
    products: ICreateOrder[] | ICartSummery[],
) {

    if (!products || !Array.isArray(products) || !products.length) {
        return NextResponse.json({ message: 'Invalid products data', success: false }, { status: 400 })
    }

    let validatedProducts: ICreateOrder[] = []
    let productMrp = 0

    await asyncForEach(products, async (product: ICreateOrder) => {

        const validatedVariantOption: any[] = []
        if (product.variantOptions) {
            await asyncForEach(product?.variantOptions, async (optionId: string) => {
                const option = await prisma.productVariantOption.findUnique({ where: { id: optionId, productId: product.productId }, select: { id: true, mrp: true, product: true } })

                if (!option) {
                    return NextResponse.json({ message: 'Invalid product variant option', success: false }, { status: 400 })
                }

                if (option?.product) {
                    if (option?.product?.stock < product.quantity) {
                        return NextResponse.json({ message: 'Product is out of stock', success: false }, { status: 400 })
                    }
                    productMrp = option.product?.mrp
                }


                validatedVariantOption.push({ productVariantOptionId: option.id, mrp: option?.mrp })
            });
        }

        validatedProducts.push({ ...product, variantOptions: validatedVariantOption, mrp: productMrp })


    });

    return validatedProducts
}