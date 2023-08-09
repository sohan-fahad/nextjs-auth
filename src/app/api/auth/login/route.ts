import { BcryptHelper } from '@/helpers/bcrypt.helper';
import { DBHelpers } from '@/helpers/db.helper';
import { JWTHelper } from '@/helpers/jwt.helper';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {

    try {
        const { email, password } = await req.json();

        const existUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!existUser) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        } else {
            const isPasswordMatched = BcryptHelper.compare(password, existUser.password)

            if (!isPasswordMatched) {
                return NextResponse.json({ error: "Invalid password" }, { status: 400 });
            } else {
                const tokenPayload = {
                    user: {
                        id: existUser.id,
                    },
                };

                const refreshTokenPayload = {
                    user: {
                        id: existUser.id,
                    },
                    isRefreshToken: true,
                };

                const accessToken = JWTHelper.makeAccessToken(tokenPayload);
                const refreshToken = JWTHelper.makeRefreshToken(refreshTokenPayload);
                const userWithoutPassword = DBHelpers.exclude(existUser, ['password'])
                const payload = { user: userWithoutPassword, tokens: { accessToken, refreshToken } }
                return NextResponse.json({
                    message: "User created successfully",
                    success: true,
                    payload
                }, { status: 200 })
            }
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

}