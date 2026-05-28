import {
  getIntegration,
  getKeywordAutomation,
  matchKeyword,
} from "@/actions/webhook";
import { sendDM } from "@/lib/fetch";
import { handleTokenError } from "@/lib/instagram-api";
import { openaiClient } from "@/lib/openai";
import type { NormalizedEvent } from "../parser";

export async function handleMessageEvent(event: NormalizedEvent) {
  if (event.type !== "MESSAGE") return;

  const integration = await getIntegration(event.accountId);

  if (!integration || !integration.userId) return;

  const matcher = await matchKeyword(event.text, integration.userId);

  if (!matcher?.automationId) return;

  const automation = await getKeywordAutomation(matcher.automationId, true);

  if (!automation?.active || !automation?.listeners) return;

  const instagramIntegration = automation.user.integrations.find(
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
        await sendDM(
          event.accountId,
          event.fromId,
          response.output_text,
          token,
        );
      }

      return;
    }

    if (automation.listeners.listener === "MESSAGE") {
      await sendDM(
        event.accountId,
        event.fromId,
        automation.listeners.prompt,
        token,
      );
    }
  } catch (err) {
    const handled = await handleTokenError(err, integrationId);
    if (!handled) {
      console.error("[webhook/message] erro ao processar evento", err);
    }
  }
}
