import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { Prisma } from "@prisma/client";
import { decodedHeaderToken } from "@/helpers/decoded-header-token.helper";

export async function POST(req: Request) {

    try {

        const { title, restaurantId } = await req.json();

        if (!title) return NextResponse.json({ message: 'table name required', success: false, statusCode: 400 }, { status: 400 });

        if (!restaurantId) return NextResponse.json({ message: 'restaurant name required', success: false, statusCode: 400 }, { status: 400 });

        const existRestaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })

        if (!existRestaurant) return NextResponse.json({ message: 'no restaurant found', success: false, statusCode: 400 }, { status: 400 });

        const existRestaurantTable = await prisma.restaurantTable.findFirst({ where: { title } })

        if (existRestaurantTable) return NextResponse.json({ message: 'Table already exist', success: false, statusCode: 400 }, { status: 400 });

        const addedTable = await prisma.restaurantTable.create({
            data: { title, restaurantId }
        })

        if (!addedTable) return NextResponse.json({ message: 'unable to send request', success: false, statusCode: 400 }, { status: 400 });


        return NextResponse.json({
            message: "restaurant table created successfully",
            success: true,
            payload: addedTable,
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

        const query: Prisma.RestaurantTableFindManyArgs = {
            where: { restaurantId: decodedHeaderToken()?.restaurant?.id },
            take: limit > 0 ? limit : 10,
            skip: skip,

        }

        const [restaurantTables, count] = await prisma.$transaction([
            prisma.restaurantTable.findMany(query),
            prisma.restaurantTable.count()
        ])
        return NextResponse.json({
            message: "successfully",
            success: true,
            payload: restaurantTables,
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

        const { tableId } = await req.json()

        const existTable = await prisma.restaurantTable.findUnique({ where: { id: tableId, restaurantId: decodedHeaderToken()?.restaurant?.id } })

        if (!existTable) return NextResponse.json({ message: 'No table found', success: false, statusCode: 400 }, { status: 400 });

        const query: Prisma.RestaurantTableDeleteArgs = {
            where: { id: tableId, restaurantId: decodedHeaderToken()?.restaurant?.id },
        }

        await prisma.restaurantTable.delete(query)

        return NextResponse.json({
            message: "successfully",
            success: true,
            statusCode: 200
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}