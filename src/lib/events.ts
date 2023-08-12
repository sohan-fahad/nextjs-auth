import { EventEmitter } from 'events';
import { NextRequest } from 'next/server';

export interface ISseEventPayload {
    type: string;
    payload: any;
}


export const responseStream = new TransformStream();
const encoder = new TextEncoder();
const writer = responseStream.writable.getWriter()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendEvent(data: ISseEventPayload) {
    try {
        const sss = await writer.write(encoder.encode(`data: ${JSON.stringify(data)} \n\n`));
        console.log(sss, data);

    } catch (error) {
        console.error('Could not JSON stringify stream message', onmessage, error);
    }
}
