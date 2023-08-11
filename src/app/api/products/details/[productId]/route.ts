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

        const productId = params?.productId;
        const decodedToken = await decodedHeaderToken()
        const existUser = await prisma.restaurant.findUnique({
            where: {
                id: decodedToken?.restaurant?.id,
            },
        });
        if (!existUser) return NextResponse.json({ message: "permission denied!", success: false }, { status: 400 })


        const query: Prisma.ProductFindUniqueArgs = {
            where: { id: productId },
            include: {
                variants: {
                    select: { variantId: true, variantOptionId: false, variant: true, variantOptions: true, mrp: true, remainingStock: true },
                }
            },

        }

        const productInfo = await prisma.product.findUnique(query)

        if (!productInfo) return NextResponse.json({ message: "No product found!", success: false }, { status: 400 })


        return NextResponse.json({
            message: "successfull",
            success: true,
            payload: productInfo
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
    }
}