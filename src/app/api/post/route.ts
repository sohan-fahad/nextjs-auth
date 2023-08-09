import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { decodedHeaderToken } from "@/helpers/decoded-header-token.helper";
import { prisma } from '@/lib/prisma';
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized', success: false, statusCode: 401 }, { status: 401 });
        }

        const { title, content } = await req.json();
        const decodedToken = await decodedHeaderToken()
        const requestPayload = {
            title,
            content,
            authorId: decodedToken?.user?.id
        }

        const post = await prisma.post.create({
            data: requestPayload
        })


        return NextResponse.json({
            message: "post created successfully",
            success: true,
            payload: post,
            statusCode: 201
        }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

}

// jwtMiddleware(POST);