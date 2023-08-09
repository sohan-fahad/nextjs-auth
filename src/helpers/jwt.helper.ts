import { ENV } from "@/ENV";
import { NextResponse } from "next/server";

const { sign, verify } = require('jsonwebtoken');


export const JWTHelper = {
    sign: (payload: any, options: any) => {
        return sign(payload, ENV.jwt.secret, options);
    },
    verify: (token: string) => {
        return verify(token, ENV.jwt.secret);
    },

    verifyRefreshToken: (token: string) => {
        try {
            const decoded: any = verify(token, ENV.jwt.secret);
            if (decoded.isRefreshToken) {
                return decoded;
            } else {
                return NextResponse.json({ error: "Unauthorized Access Detected" }, { status: 400 });
            }
        } catch (error) {
            return NextResponse.json({ error: "Unauthorized Access Detected" }, { status: 400 });
        }
    },

    extractToken: (bearerToken: string) => {
        let token = bearerToken
        token = token.replace(/Bearer\s+/gm, '');
        return token;
    },

    makeAccessToken: (data: any) => {
        const configAccess = {
            payload: {
                ...data,
            },
            options: {
                algorithm: 'HS512',
                expiresIn: ENV.jwt.tokenExpireIn,
            },
        };
        return JWTHelper.sign(configAccess.payload, configAccess.options);
    },

    makeRefreshToken: (data: any) => {
        const configAccess = {
            payload: {
                ...data,
            },
            options: {
                algorithm: 'HS512',
                expiresIn: ENV.jwt.refreshTokenExpireIn,
            },
        };
        return JWTHelper.sign(configAccess.payload, configAccess.options);
    },

    isJwtExpired: (exp: number): boolean => {
        const date: Date = new Date(exp * 1000);
        const parsedDate = Date.parse(date.toString());
        if (parsedDate - Date.now() > 0) {
            return false;
        } else {
            return true;
        }
    }
}