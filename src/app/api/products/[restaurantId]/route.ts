import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma';
import { DBHelpers } from "@/helpers/db.helper";
import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { Prisma } from "@prisma/client";

export async function GET(req: Request, { params }: any) {
    try {

        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request', success: false, statusCode: 401 }, { status: 401 });
        }

        const restaurantId = parseInt(params.restaurantId);
        const existUser = await prisma.restaurant.findUnique({
            where: {
                id: restaurantId,
            },
        });
        if (!existUser) return NextResponse.json({ message: "no restaurant found!", success: false }, { status: 400 })

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
            where: { restaurantId },
            take: limit > 0 ? limit : 10,
            skip: skip,
            include: {
                variants: {
                    select: { variantId: true, variantOptionId: false, variant: true, variantOptions: true, mrp: true, remainingStock: true },
                }
            },

        }

        const categories = await prisma.product.findMany(query)
        return NextResponse.json({
            message: "successfull",
            success: true,
            payload: categories
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
    }
}