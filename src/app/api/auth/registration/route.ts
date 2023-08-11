import { TOKEN_TYPE } from '@/data/constants/role.constant';
import { BcryptHelper } from '@/helpers/bcrypt.helper';
import { DBHelpers } from '@/helpers/db.helper';
import { JWTHelper } from '@/helpers/jwt.helper';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, password, name } = await req.json();

    const exists = await prisma.restaurant.findUnique({
        where: {
            email,
        },
    });


    if (exists) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
    } else {

        const hashedPassword = await BcryptHelper.hash(password)
        const user = await prisma.restaurant.create({
            data: {
                email,
                password: hashedPassword,
                name
            },
        });


        const tokenPayload = {
            user: {
                id: user.id,
                type: TOKEN_TYPE.OWNER
            },
        };

        const refreshTokenPayload = {
            user: {
                id: user.id,
                type: TOKEN_TYPE.OWNER
            },
            isRefreshToken: true,
        };

        const accessToken = JWTHelper.makeAccessToken(tokenPayload);
        const refreshToken = JWTHelper.makeRefreshToken(refreshTokenPayload);
        const userWithoutPassword = DBHelpers.exclude(user, ['password'])
        const payload = { user: userWithoutPassword, tokens: { accessToken, refreshToken } }
        return NextResponse.json({
            message: "account created successfully",
            success: true,
            payload
        }, { status: 201 })
    }
}

