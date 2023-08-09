import { toNumber } from "./utils/convert.utils";

export const ENV = {
    jwt: {
        secret: process.env.JWT_SECRET,
        saltRound: process.env.JWT_SALT_ROUNDS,
        tokenExpireIn: process.env.JWT_EXPIRES_IN,
        refreshTokenExpireIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    },
}