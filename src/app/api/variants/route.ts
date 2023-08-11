import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { generateSlug } from "@/utils/slug.utils";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request', success: false, statusCode: 401 }, { status: 401 });
        }

        const { title } = await req.json()

        const variantExist = await prisma.variant.findFirst({
            where: { title }
        });
        if (variantExist?.id) return NextResponse.json({ message: "Variant already exist!", success: false }, { status: 400 })

        const requestPayload = {
            title,
            slug: generateSlug(title)
        }

        const addedVariant = await prisma.variant.create({
            data: requestPayload
        })

        return NextResponse.json({
            message: "variant created successfully",
            success: true,
            payload: addedVariant,
            statusCode: 201
        }, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
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


        const [variants, count] = await prisma.$transaction([
            prisma.variant.findMany({
                skip,
                take: limit > 0 ? limit : 10,
                include: {
                    variantOptions: true
                }
            }),
            prisma.variant.count()
        ])
        return NextResponse.json({
            message: "successfully",
            success: true,
            payload: variants,
            statusCode: 200,
            count
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}