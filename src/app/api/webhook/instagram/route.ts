import {
  getKeywordAutomation,
  getKeywordPost,
  matchKeyword,
  trackResponse,
} from "@/actions/webhook";
import { parseWebhook } from "@/features/webhook/parser";
import { routeEvent } from "@/features/webhook/router";
import { sendCommentReply, sendDM, sendPrivateMessage } from "@/lib/fetch";
import { openaiClient } from "@/lib/openai";
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

    console.log("Payload");

    console.dir(payload, { depth: null });

    const events = parseWebhook(payload);

    console.log("Event");

    console.dir(events, { depth: null });

    for (const event of events) {
      await routeEvent(event);
    }

    return NextResponse.json(
      {
        message: "Success",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
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
