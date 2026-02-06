import {
  getIntegration,
  getKeywordAutomation,
  matchKeyword,
} from "@/actions/webhook";
import { NormalizedEvent } from "../parser";
import { openaiClient } from "@/lib/openai";
import { sendDM } from "@/lib/fetch";

export async function handleMessageEvent(event: NormalizedEvent) {
  if (event.type !== "MESSAGE") return;

  const integration = await getIntegration(event.accountId);

  if (!integration || !integration.userId) return;

  console.log("Integration", integration);

  const matcher = await matchKeyword(event.text, integration.userId);

  if (!matcher?.automationId) return;

  console.log("Matcher", matcher);

  const automation = await getKeywordAutomation(matcher.automationId, true);

  console.log("Automation", automation);

  if (!automation?.active || !automation?.listeners) return;

  const token = automation.user.integrations.find(
    (integration) => integration.name === "INSTAGRAM",
  )?.token;

  if (!token) return;

  console.log("Token", token);

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
      await sendDM(event.accountId, event.fromId, response.output_text, token);
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
}
