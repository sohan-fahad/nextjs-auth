
import { headers } from 'next/headers'
import { JWTHelper } from './jwt.helper';

export function checkBearerToken() {

    const headersInstance = headers()
    const authorization = headersInstance.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return false;
    }

    if (authorization) {
        const token = JWTHelper.extractToken(authorization);
        const verifyUser = JWTHelper.verify(token)
        const isJwtExpired = JWTHelper.isJwtExpired(verifyUser?.exp)
        if (!verifyUser || isJwtExpired) return false
    }

    return true;
}