import {
  getIntegration,
  getKeywordAutomation,
  getKeywordPost,
  matchKeyword,
} from "@/actions/webhook";
import { NormalizedEvent } from "../parser";
import { sendCommentReply, sendPrivateMessage } from "@/lib/fetch";
import { openaiClient } from "@/lib/openai";

export async function handleComment(event: NormalizedEvent) {
  if (event.type !== "COMMENT") return;

  if (event.accountId === event.fromId) return;

  const integration = await getIntegration(event.accountId);

  if (!integration || !integration.userId) return;

  const matcher = await matchKeyword(event.text, integration.userId);

  if (!matcher?.automationId) return;

  const automation = await getKeywordAutomation(matcher.automationId, false);

  if (!automation?.active || !automation.listeners) return;

  const post = await getKeywordPost(event.mediaId, matcher.automationId);

  if (!post) return;

  const token = automation.user.integrations.find(
    (integration) => integration.name === "INSTAGRAM",
  )?.token;

  if (!token) return;

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
      await sendPrivateMessage(
        event.accountId,
        event.commentId,
        response.output_text,
        token,
      );
    }

    if (automation.listeners.commentReply) {
      await sendCommentReply(
        event.commentId,
        automation.listeners.commentReply,
        token,
      );
    }

    return;
  }
  console.log("Send private message");
  await sendPrivateMessage(
    event.accountId,
    event.commentId,
    automation.listeners.prompt,
    token,
  );

  if (automation.listeners.commentReply) {
    console.log("Send comment reply");
    await sendCommentReply(
      event.commentId,
      automation.listeners.commentReply,
      token,
    );
  }
}
