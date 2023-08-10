import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { decodedHeaderToken } from "@/helpers/decoded-header-token.helper";
import { prisma } from '@/lib/prisma';
import { generateSlug } from "@/utils/slug.utils";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized', success: false, statusCode: 401 }, { status: 401 });
        }

        const { title } = await req.json();
        if (!title) {
            return NextResponse.json({ message: 'invalid title', success: false, statusCode: 400 }, { status: 400 });
        }
        const decodedToken = await decodedHeaderToken()
        const requestPayload = {
            title,
            userId: decodedToken?.user?.id,
            slug: generateSlug(title)
        }



        const addedCategory = await prisma.category.create({
            data: requestPayload
        })

        return NextResponse.json({
            message: "category created successfully",
            success: true,
            payload: addedCategory,
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

        const query: Prisma.CategoryFindManyArgs = {
            take: limit > 0 ? limit : 10,
            skip: skip
        }

        const [categories, count] = await prisma.$transaction([
            prisma.category.findMany(query),
            prisma.category.count()
        ])
        return NextResponse.json({
            message: "successfully",
            success: true,
            payload: categories,
            statusCode: 200,
            count
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}