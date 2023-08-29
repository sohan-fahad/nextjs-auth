import { SSE_EVENTS } from "@/data/constants/sse-event.constants";
import { ISseEventPayload, responseStream, sendEvent } from "@/lib/events";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // sendEvent({ type: SSE_EVENTS.CONNECTION_STABLISHED, payload: {} })

    // return new Response(responseStream.readable, {
    //     headers: {
    //         'Content-Type': 'text/event-stream',
    //         Connection: 'keep-alive',
    //         'Cache-Control': 'no-cache, no-transform',
    //     },
    // });

    return NextResponse.json({ message: "error.meassage", success: false, statusCode: 400 }, { status: 400 });
}