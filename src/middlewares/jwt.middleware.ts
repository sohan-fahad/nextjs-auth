import { NextRequest, NextResponse } from "next/server";

const jwtMiddleware = (handle: any) => {
    console.log("sssssssssssssssssssssssssssss");
    return (req: NextRequest, res: NextResponse) => {
        return handle(req, res)
    }

}

export default jwtMiddleware