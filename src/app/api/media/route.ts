import { checkBearerToken } from "@/helpers/check-bearer-token.helper";
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from "next/server";
import axios from "axios"
import { DBHelpers } from "@/helpers/db.helper";
import { decodedHeaderToken } from "@/helpers/decoded-header-token.helper";
import { Prisma } from "@prisma/client";


export async function POST(req: NextRequest, res: any) {

    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request!', success: false, statusCode: 401 }, { status: 401 });
        }

        const decodedToken = decodedHeaderToken();

        const formData = await req.formData();
        const img: any = formData.get("image")

        if (!img) return NextResponse.json({ message: "Image is required! ", success: false }, { status: 400 })


        const response = await axios.post('https://api.imgbb.com/1/upload?key=17288d90a175abdcc7328b8e430097d0', formData)


        const addedImage = await prisma.image.create({
            data: {
                url: response?.data?.data?.url,
                deleteUrl: response?.data?.data?.delete_url,
                restaurantId: decodedToken?.restaurant?.id
            },
        })

        const imgPayloadWithoutPublicId = DBHelpers.exclude(addedImage, ['publicId'])



        return NextResponse.json({
            message: "category created successfully",
            success: true,
            payload: imgPayloadWithoutPublicId,
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

        const query: Prisma.ImageFindManyArgs = {
            take: limit > 0 ? limit : 10,
            skip: skip
        }

        const [images, count] = await prisma.$transaction([
            prisma.image.findMany(query),
            prisma.image.count()
        ])
        return NextResponse.json({
            message: "successfully",
            success: true,
            payload: images,
            statusCode: 200,
            count
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message, success: false }, { status: 400 })
    }
}



export async function DELETE(req: Request) {
    try {
        if (!checkBearerToken()) {
            return NextResponse.json({ message: 'Unauthorized request!', success: false, statusCode: 401 }, { status: 401 });
        }

        const { imageId } = await req.json()
        if (!imageId) return NextResponse.json({ message: "Image id is required! ", success: false }, { status: 400 })

        const existImage = await prisma.image.findUnique({
            where: { id: imageId }
        })

        if (!existImage) return NextResponse.json({ message: "No image found!", success: false }, { status: 400 })

        const deletedImg = await prisma.image.delete({ where: { id: imageId } })

        return NextResponse.json({
            message: "image deleted successfully",
            success: true,
            payload: "image deleted successfully",
            statusCode: 200
        }, { status: 200 })


    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}