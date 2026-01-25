import {
  getKeywordAutomation,
  getKeywordPost,
  matchKeyword,
  trackResponse,
} from "@/actions/webhook";
import { sendDM } from "@/lib/fetch";
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
  const webhook_payload = await req.json();
  let matcher;
  try {
    if (webhook_payload.entry[0].messaging) {
      matcher = await matchKeyword(
        webhook_payload.entry[0].messaging[0].message.text,
      );
    }

    if (webhook_payload.entry[0].changes) {
      matcher = await matchKeyword(
        webhook_payload.entry[0].changes[0].value.text,
      );
    }

    if (matcher && matcher.automationId) {
      // We have a keyword matcher
      if (webhook_payload.entry[0].messaging) {
        const automation = await getKeywordAutomation(
          matcher.automationId,
          true,
        );

        if (automation && automation.triggers) {
          if (
            automation.listeners &&
            automation.listeners.listener === "MESSAGE"
          ) {
            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              automation.listeners.prompt,
              automation.user.integrations[0].token,
            );

            if (direct_message.status === 200) {
              const tracked = await trackResponse(automation.id, "DM");
              if (tracked) {
                return NextResponse.json(
                  {
                    message: "Message sent",
                  },
                  {
                    status: 200,
                  },
                );
              }
            }
          }

          // Verificar se o usuário tem algum plano
          if (
            automation.listeners &&
            automation.listeners.listener === "SMARTAI"
          ) {
            // Implementar a inteligência artificial - automation.listeners.prompt
          }
        }
      }

      if (
        webhook_payload.entry[0].changes &&
        webhook_payload.entry[0].changes[0].field === "comment"
      ) {
        const automation = await getKeywordAutomation(
          matcher.automationId,
          false,
        );

        const automations_post = await getKeywordPost(
          webhook_payload.entry[0].changes[0].value.media.id,
          matcher.automationId,
        );

        if (automation && automations_post && automation.triggers) {
          if (automation.listeners) {
            if (automation.listeners.listener === "MESSAGE") {
              const direct_message = await sendDM(
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].changes[0].value.from.id,
                automation.listeners.prompt,
                automation.user.integrations[0].token,
              );
              if (direct_message.status === 200) {
                const tracked = await trackResponse(automation.id, "COMMENT");

                if (tracked) {
                  return NextResponse.json(
                    {
                      message: "Message sent",
                    },
                    {
                      status: 200,
                    },
                  );
                }
              }
            }

            // Adicionar plano
            if (automation.listeners.listener === "SMARTAI") {
              ///
            }
          }
        }
      }
    }

    if (!matcher) {
      // Verificar se o usuário tem algum plano
    }

    return NextResponse.json(
      {
        message: "No automation set",
      },
      {
        status: 404,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "No automation set",
      },
      {
        status: 500,
      },
    );
  }
}
