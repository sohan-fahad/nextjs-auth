import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { decodedHeaderToken } from "@/helpers/decoded-header-token.helper";
import { prisma } from '@/lib/prisma';
import { ProductHelperService } from "@/services/helper-services/product.helper.service";
import { asyncForEach } from "@/utils/asyncForEach.utils";
import { generateSlug } from "@/utils/slug.utils";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized', success: false, statusCode: 401 }, { status: 401 });
        }

        const { title, description, mrp, stock, categoryId, variantOptions, imageId } = await req.json();
        if (!title) {
            return NextResponse.json({ message: 'invalid title', success: false, statusCode: 400 }, { status: 400 });
        }

        if (!mrp) {
            return NextResponse.json({ message: 'invalid mrp', success: false, statusCode: 400 }, { status: 400 });
        }

        if (!stock) {
            return NextResponse.json({ message: 'invalid stock', success: false, statusCode: 400 }, { status: 400 });
        }

        if (!categoryId) {
            return NextResponse.json({ message: 'invalid category', success: false, statusCode: 400 }, { status: 400 });
        }

        const existCategory = await prisma.category.findUnique({
            where: { id: categoryId }
        })
        if (!existCategory) {
            return NextResponse.json({ message: 'category not found!', success: false, statusCode: 400 }, { status: 400 });
        }


        if (variantOptions?.lenght < 1) return NextResponse.json({ message: 'invalid variants!', success: false, statusCode: 400 }, { status: 400 });

        let productVariantOptions = await ProductHelperService.validateVariantOptions(variantOptions)

        const transactionResult = await prisma.$transaction(async (tx) => {
            const decodedToken = await decodedHeaderToken()
            const addedProduct = await tx.product.create({
                data: {
                    title,
                    slug: generateSlug(title),
                    categoryId,
                    description,
                    imageId,
                    mrp,
                    stock,
                    remainingStock: stock,
                    restaurantId: decodedToken?.restaurant?.id
                }
            })

            productVariantOptions = productVariantOptions.map(item => ({
                ...item,
                productId: addedProduct?.id
            }));

            await tx.productVariantOption.createMany({
                data: productVariantOptions
            })

            const addedProductPayload = await tx.product.findUnique({
                where: { id: addedProduct?.id }, include: { variants: true }
            })

            return addedProductPayload;
        })


        return NextResponse.json({
            message: "category created successfully",
            success: true,
            payload: transactionResult,
            statusCode: 201
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

}

export async function GET(req: Request) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request', success: false, statusCode: 401 }, { status: 401 });
        }
        const { searchParams } = new URL(req.url)
        let page: any = searchParams.get("page")
        let limit: any = searchParams.get("limit")
        let skip = 0
        if (page) {
            page = parseInt(page)
        }

        if (limit) {
            limit = parseInt(limit)
            skip = (page - 1) * limit
        }

        const query: Prisma.ProductFindManyArgs = {
            where: { restaurantId: decodedHeaderToken()?.restaurant?.id },
            take: limit > 0 ? limit : 10,
            skip: skip,
            include: {
                variants: {
                    select: { variantId: true, variantOptionId: false, variant: true, variantOptions: true, mrp: true, remainingStock: true },
                }
            },

        }

        const [products, count] = await prisma.$transaction([
            prisma.product.findMany(query),
            prisma.product.count()
        ])
        return NextResponse.json({
            message: "successfully",
            success: true,
            payload: products,
            statusCode: 200,
            count
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export async function DELETE(req: Request) {
    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request', success: false, statusCode: 401 }, { status: 401 });
        }

        const { productId } = await req.json();

        if (!productId) return NextResponse.json({ message: 'Product id is required', success: false, statusCode: 400 }, { status: 400 });

        await prisma.$transaction(async (tx) => {
            await tx.productVariantOption.deleteMany({ where: { productId } })
            await tx.product.delete({ where: { id: productId } })
        })
        return NextResponse.json({
            message: "Deleted successfull",
            success: true,
            statusCode: 200,
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.meassage, success: false, statusCode: 400 }, { status: 400 });
    }
}
