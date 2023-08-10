import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma';
import { DBHelpers } from "@/helpers/db.helper";

export async function GET(req: Request, { params }: any) {
    try {
        const userId = parseInt(params.userId);
        const existUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!userId) return NextResponse.json({ message: "no user found!", success: false }, { status: 400 })

        const categories = await prisma.category.findMany({
            where: { userId },
        })
        return NextResponse.json({
            message: "successfully",
            success: true,
            payload: categories
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
    }
}