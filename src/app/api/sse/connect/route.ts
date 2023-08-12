import { emitter } from '@/lib/events';
import { NextResponse } from 'next/server';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators'

export async function GET() {
    try {
        const sseObservable = fromEvent(emitter, 'sse-event').pipe(
            map(eventData => JSON.stringify(eventData))
        );

        sseObservable.subscribe(data => {
            return new Response(data);
        }, error => {
            console.log(error);

        })
        return sseObservable
    } catch (error) {
        console.log(error);

        NextResponse.json({ message: JSON.stringify(error) }, { status: 400 })
    }

}