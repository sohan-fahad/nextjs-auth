import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma';
import { DBHelpers } from "@/helpers/db.helper";
import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { Prisma } from "@prisma/client";
import { decodedHeaderToken } from "@/helpers/decoded-header-token.helper";

export async function GET(req: Request, { params }: any) {
    try {

        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request', success: false, statusCode: 401 }, { status: 401 });
        }

        const categoriId = params?.categoriId;
        const decodedToken = await decodedHeaderToken()

        const existCategory = await prisma.category.findUnique({ where: { id: categoriId, restaurantId: decodedToken?.restaurant?.id } })

        if (!existCategory) return NextResponse.json({ message: "no category found!", success: false }, { status: 400 })


        const query: Prisma.ProductFindManyArgs = {
            where: { categoryId: categoriId },
            include: {
                variants: {
                    select: { variantId: true, variantOptionId: false, variant: true, variantOptions: true, mrp: true, remainingStock: true },
                }
            },

        }

        const products = await prisma.product.findMany(query)

        if (!products.length) return NextResponse.json({ message: "No product found!", success: false }, { status: 400 })


        return NextResponse.json({
            message: "successfull",
            success: true,
            payload: products
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
    }
}