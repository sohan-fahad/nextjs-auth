import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma';
import { DBHelpers } from "@/helpers/db.helper";
import { checkBearerToken } from "@/helpers/check-bearer-token.helper";

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
        if (!existUser) return NextResponse.json({ message: "no user found!", success: false }, { status: 400 })

        const categories = await prisma.category.findMany({
            where: { restaurantId },
        })
        return NextResponse.json({
            message: "successfull",
            success: true,
            payload: categories
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
    }
}