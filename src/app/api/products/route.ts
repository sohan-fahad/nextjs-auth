import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { decodedHeaderToken } from "@/helpers/decoded-header-token.helper";
import { prisma } from '@/lib/prisma';
import { ProductHelperService } from "@/services/helper-services/product.helper.service";
import { asyncForEach } from "@/utils/asyncForEach.utils";
import { generateSlug } from "@/utils/slug.utils";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";


// add product with variant and it's options

export async function POST(req: Request) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized', success: false, statusCode: 401 }, { status: 401 });
        }

        const decodedToken = await decodedHeaderToken()

        const { title, description, mrp, stock, categoryId, variants, imageId } = await req.json();
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

        if (variants?.lenght < 1) return NextResponse.json({ message: 'invalid variants!', success: false, statusCode: 400 }, { status: 400 });

        const existCategory = await prisma.category.findUnique({
            where: { id: categoryId }
        })

        if (!existCategory) {
            return NextResponse.json({ message: 'category not found!', success: false, statusCode: 400 }, { status: 400 });
        }

        const existProduct = await prisma.product.findFirst({ where: { title, restaurantId: decodedToken?.restaurant?.id } })

        if (existProduct) {
            return NextResponse.json({ message: 'product already exist with same name!', success: false, statusCode: 400 }, { status: 400 });
        }




        let validateProductVariants: any[] = [];
        let validateProductVariantsOptions: any[] = []



        await asyncForEach(variants, async (item: any) => {
            const isValidVariant = await prisma.variant.findUnique({ where: { id: item?.variantId } })
            if (!isValidVariant) {
                return NextResponse.json({ message: 'varian is not found!', success: false, statusCode: 400 }, { status: 400 });
            }
            validateProductVariants.push({ variantId: isValidVariant?.id })

            await asyncForEach(item?.variantOption, async (option: any) => {
                const isValidOption = await prisma.variantOption.findUnique({ where: { id: option?.variantOptionId } })
                if (!isValidOption) {
                    return NextResponse.json({ message: 'varian option is not found!', success: false, statusCode: 400 }, { status: 400 });
                }

                validateProductVariantsOptions.push({ ...option, variantId: item?.variantId, remainingStock: option?.stock })
            })
        })


        const transactionResult = await prisma.$transaction(async (tx) => {
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

            validateProductVariants = validateProductVariants.map(item => ({
                ...item,
                productId: addedProduct?.id
            }));

            await tx.productVariant.createMany({
                data: validateProductVariants,
            })

            const productVariants = await tx.productVariant.findMany({ where: { productId: addedProduct?.id }, select: { id: true, variantId: true } })

            const productOptionData: any = []

            await validateProductVariantsOptions.forEach(item => {
                productVariants.forEach(productVariant => {
                    if (item?.variantId === productVariant?.variantId) {
                        delete item?.variantId
                        productOptionData.push({ ...item, productVariantId: productVariant?.id, productId: addedProduct?.id })
                    }
                })
            })


            await tx.productVariantOption.createMany({ data: productOptionData })

            const resultQuery: Prisma.ProductFindUniqueArgs = {
                where: { id: addedProduct?.id },
                include: {
                    variants: {

                        select: {
                            variantId: true,
                            variant: true,
                            productVariantOption: {
                                select: { id: true, mrp: true, variantOption: true, variantOptionId: true, remainingStock: true, stock: true }
                            }
                        }
                    }
                }
            }

            const addedProductPayload = await tx.product.findUnique(resultQuery)

            return addedProductPayload;
        })


        return NextResponse.json({
            message: "product created successfully",
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

        const resultQuery: Prisma.ProductFindManyArgs = {
            where: { restaurantId: decodedHeaderToken()?.restaurant?.id },
            include: {
                variants: {

                    select: {
                        variantId: true,
                        variant: true,
                        productVariantOption: {
                            select: { id: true, mrp: true, variantOption: true, variantOptionId: true, remainingStock: true, stock: true }
                        }
                    }
                }
            }
        }

        const [products, count] = await prisma.$transaction([
            prisma.product.findMany(resultQuery),
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
            await tx.productVariant.deleteMany({ where: { productId } })
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
