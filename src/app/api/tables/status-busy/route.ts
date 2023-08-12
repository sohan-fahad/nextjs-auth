import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { Prisma } from "@prisma/client";
import { decodedHeaderToken } from "@/helpers/decoded-header-token.helper";
import { sendEvent } from "@/lib/events";
import { SSE_EVENTS } from "@/data/constants/sse-event.constants";
import { TOKEN_TYPE } from "@/data/constants/role.constant";
import { JWTHelper } from "@/helpers/jwt.helper";

// update table active status
export async function PUT(req: Request) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request', success: false, statusCode: 401 }, { status: 401 });
        }

        const { isBusy, tableId } = await req.json()

        if (!tableId) return NextResponse.json({ message: 'table id required', success: false, statusCode: 400 }, { status: 400 });

        if (typeof isBusy != "boolean") return NextResponse.json({ message: 'Invalid data type', success: false, statusCode: 400 }, { status: 400 });

        const existTable: any = await prisma.restaurantTable.findUnique({ where: { id: tableId, restaurantId: decodedHeaderToken()?.restaurant?.id } })

        if (!existTable) return NextResponse.json({ message: 'No table found', success: false, statusCode: 400 }, { status: 400 });

        const query: Prisma.RestaurantTableUpdateArgs = {
            where: { id: tableId, restaurantId: decodedHeaderToken()?.restaurant?.id },
            data: { isBusy }
        }



        const updated = await prisma.restaurantTable.update(query)
        if (updated.isBusy) {
            sendEvent({
                type: SSE_EVENTS.TABLE_BUSY,
                payload: {
                    tableId: updated?.id,
                    isBusy: updated.isBusy
                }
            })
        } else {
            sendEvent({
                type: SSE_EVENTS.TABLE_FREE,
                payload: {
                    tableId: updated?.id,
                    isActive: updated.isBusy
                }
            })
        }

        return NextResponse.json({
            message: "successfully",
            success: true,
            payload: updated,
            statusCode: 200
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}