import {
  getIntegration,
  getKeywordAutomation,
  matchKeyword,
} from "@/actions/webhook";
import { sendDM } from "@/lib/fetch";
import { handleTokenError } from "@/lib/instagram-api";
import { openaiClient } from "@/lib/openai";
import { splitTextByBytes } from "@/lib/utils";
import type { NormalizedEvent } from "../parser";

// Meta caps /me/messages text at 1000 UTF-8 bytes. Keep a small safety
// margin so accents and emojis never push a chunk over the cliff.
const MAX_MESSAGE_BYTES = 950;

export async function handleMessageEvent(event: NormalizedEvent) {
  if (event.type !== "MESSAGE") return;

  const integration = await getIntegration(event.accountId);

  if (!integration?.organizationId) return;

  const matcher = await matchKeyword(event.text, integration.organizationId);

  if (!matcher?.automationId) return;

  const automation = await getKeywordAutomation(matcher.automationId, true);

  if (!automation?.active || !automation?.listeners) return;

  const instagramIntegration = automation.organization?.integrations.find(
    (integration) => integration.name === "INSTAGRAM",
  );

  if (!instagramIntegration || instagramIntegration.status !== "ACTIVE") return;
  const token = instagramIntegration.token;
  const integrationId = instagramIntegration.id;

  try {
    if (automation.listeners.listener === "SMARTAI") {
      const response = await openaiClient.responses.create({
        model: "gpt-4o-mini",
        input: `
        Instruções: ${automation.listeners.prompt}
        Mensagem do usuário: "${event.text}"
        Responda em até 2 frases.
        `,
      });

      if (response.output_text) {
        const chunks = splitTextByBytes(
          response.output_text,
          MAX_MESSAGE_BYTES,
        );
        for (const chunk of chunks) {
          await sendDM(event.accountId, event.fromId, chunk, token);
        }
      }

      return;
    }

    if (automation.listeners.listener === "MESSAGE") {
      const buttons = automation.listeners.buttons?.map((b) => ({
        title: b.title,
        url: b.url,
      }));
      const chunks = splitTextByBytes(
        automation.listeners.prompt,
        MAX_MESSAGE_BYTES,
      );
      const lastIndex = chunks.length - 1;
      for (let i = 0; i < chunks.length; i++) {
        await sendDM(
          event.accountId,
          event.fromId,
          chunks[i],
          token,
          i === lastIndex ? buttons : undefined,
        );
      }
    }
  } catch (err) {
    const handled = await handleTokenError(err, integrationId);
    if (!handled) {
      console.error("[webhook/message] erro ao processar evento", err);
    }
  }
}
