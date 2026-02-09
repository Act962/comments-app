export const runtime = "nodejs";

import crypto from "node:crypto";
import { ensureEventNotProcessed } from "@/actions/automations";
import { parseWebhook } from "@/features/webhook/parser";
import { routeEvent } from "@/features/webhook/router";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // opcional, mas recomendado
  if (mode === "subscribe" && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const events = parseWebhook(payload);

    await Promise.all(
      events.map(async (event) => {
        const eventId =
          event.type === "MESSAGE" ? event.messageId : event.commentId;

        const shouldProcess = await ensureEventNotProcessed(
          eventId,
          event.type,
          event.accountId,
        );

        if (!shouldProcess) return;

        return routeEvent(event);
      }),
    );

    return NextResponse.json(
      {
        message: "Success",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error",
      },
      {
        status: 500,
      },
    );
  }
}
