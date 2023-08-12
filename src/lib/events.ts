import { EventEmitter } from 'events';
import { NextRequest } from 'next/server';

export interface ISseEventPayload {
    type: string;
    payload: any;
}


export const emitter = new EventEmitter();

export async function sendEvent(data: ISseEventPayload) {
    emitter.emit('sse-event', { ...data });
}

export let responseStream = new TransformStream();
export const writer = responseStream.writable.getWriter();
