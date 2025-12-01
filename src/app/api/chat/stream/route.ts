import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get("streamId");

  if (!streamId) {
    return NextResponse.json({ error: "Missing streamId" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Send History from Redis Stream
      try {
        // Use XRANGE to get all messages from beginning
        // We use '-' to '+' to get everything
        const history = await redis.xrange(`chat:${streamId}:stream`, '-', '+');
        
        for (const [id, fields] of history) {
          // fields is array like ['data', '{"type":"..."}']
          // we just want the value of 'data'
          const dataIdx = fields.indexOf('data');
          if (dataIdx !== -1 && dataIdx + 1 < fields.length) {
             const data = fields[dataIdx + 1];
             controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }
      } catch (e) {
        console.error("Error fetching history:", e);
      }

      // 2. Subscribe to Real-time updates
      // We need a dedicated subscriber client for Pub/Sub
      // Duplicate the existing connection options
      const subscriber = redis.duplicate();

      // Handle subscriber errors to prevent crash and inform client
      subscriber.on("error", (err: Error) => {
        console.error("Redis subscriber connection error:", err);
        const errorData = JSON.stringify({ type: "error", text: "Chat service unavailable: Database connection failed." });
        try {
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } catch (e) {
            // Controller might be closed
        }
        cleanup();
      });
      
      // Handle connection close - define this early so we can clean up even if errors occur
      const cleanup = () => {
        subscriber.quit().catch((e: Error) => console.error("Error closing subscriber:", e));
        try { controller.close(); } catch (e) {}
      };

      req.signal.addEventListener("abort", cleanup);

      try {
        // 1. Send History from Redis Stream
        try {
          const history = await redis.xrange(`chat:${streamId}:stream`, '-', '+');
          for (const [id, fields] of history) {
            const dataIdx = fields.indexOf('data');
            if (dataIdx !== -1 && dataIdx + 1 < fields.length) {
               const data = fields[dataIdx + 1];
               controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
        } catch (e) {
          console.error("Error fetching history:", e);
          // Continue to subscription even if history fails, or maybe send an error event?
        }

        // 2. Subscribe to Real-time updates
        await subscriber.subscribe(`chat:${streamId}:pubsub`);
        
        subscriber.on("message", (channel: string, message: string) => {
           if (channel === `chat:${streamId}:pubsub`) {
               controller.enqueue(encoder.encode(`data: ${message}\n\n`));
           }
        });
      } catch (err) {
        console.error("Stream error:", err);
        const errorData = JSON.stringify({ type: "error", text: "Stream internal error" });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        cleanup();
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
