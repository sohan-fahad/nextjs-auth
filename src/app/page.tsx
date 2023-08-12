"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {
  useEffect(() => {
    const eventSource = new EventSource("/api/sse/connect"); // Adjust the URL according to your API route

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      console.log("Received SSE event:", eventData);
      // Handle the event data as needed
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    return () => {
      eventSource.close(); // Close the SSE connection when the component unmounts
    };
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input type="file" onChange={(e) => console.log(e.target.value)} />
    </main>
  );
}
