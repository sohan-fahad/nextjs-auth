import { headers } from "next/headers"
import { JWTHelper } from "./jwt.helper";

export const decodedHeaderToken = () => {
    const headersInstance = headers()
    const authorization: any = headersInstance.get('authorization');
    const token = JWTHelper.extractToken(authorization);
    return JWTHelper.verify(token)
}