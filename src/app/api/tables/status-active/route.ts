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

        const { isActive, tableId } = await req.json()

        if (!tableId) return NextResponse.json({ message: 'table id required', success: false, statusCode: 400 }, { status: 400 });

        if (typeof isActive != "boolean") return NextResponse.json({ message: 'Invalid data type', success: false, statusCode: 400 }, { status: 400 });

        const existTable: any = await prisma.restaurantTable.findUnique({ where: { id: tableId, restaurantId: decodedHeaderToken()?.restaurant?.id } })

        if (!existTable) return NextResponse.json({ message: 'No table found', success: false, statusCode: 400 }, { status: 400 });

        const query: Prisma.RestaurantTableUpdateArgs = {
            where: { id: tableId, restaurantId: decodedHeaderToken()?.restaurant?.id },
            data: { isActive }
        }



        const updated = await prisma.restaurantTable.update(query)
        if (updated.isActive) {
            const tokenPayload = {
                restaurant: {
                    id: updated.restaurantId,
                    tableId: updated.id,
                    type: TOKEN_TYPE.TABLE
                },
            };

            const refreshTokenPayload = {
                restaurant: {
                    id: updated.restaurantId,
                    tableId: updated.id,
                    type: TOKEN_TYPE.TABLE
                },
                isRefreshToken: true,
            };

            const accessToken = JWTHelper.makeAccessToken(tokenPayload);
            const refreshToken = JWTHelper.makeRefreshToken(refreshTokenPayload);
            sendEvent({
                type: SSE_EVENTS.TABLE_ACTIVE,
                payload: {
                    accessToken,
                    refreshToken,
                    tableId: updated?.id,
                    isActive: updated.isActive
                }
            })
        } else {
            sendEvent({
                type: SSE_EVENTS.TABLE_INACTIVE,
                payload: {
                    tableId: updated?.id,
                    isActive: updated.isActive
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