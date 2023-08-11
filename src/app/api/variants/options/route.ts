import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { prisma } from '@/lib/prisma';
import { generateSlug } from "@/utils/slug.utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request', success: false, statusCode: 401 }, { status: 401 });
        }

        const { title, variantId } = await req.json()

        const variantExist = await prisma.variant.findUnique({
            where: { id: variantId }
        });

        if (!variantExist) return NextResponse.json({ message: "Variant does not exist!", success: false }, { status: 400 })

        const variantOptionExist = await prisma.variantOption.findFirst({
            where: { title, variantId: variantId }
        });

        if (variantOptionExist?.id) return NextResponse.json({ message: "Variant option already exist!", success: false }, { status: 400 })

        const requestPayload = {
            title,
            variantId
        }

        const addedVariant = await prisma.variantOption.create({
            data: requestPayload
        })

        return NextResponse.json({
            message: "variant option created successfully",
            success: true,
            payload: addedVariant,
            statusCode: 201
        }, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
    }
}
