import {
  getIntegration,
  getKeywordAutomation,
  getKeywordPost,
  matchKeyword,
} from "@/actions/webhook";
import { upsertCommentFromWebhook } from "@/features/sorteio/server/comments-collector";
import { sendCommentReply, sendDM, sendPrivateMessage } from "@/lib/fetch";
import { handleTokenError } from "@/lib/instagram-api";
import { openaiClient } from "@/lib/openai";
import { splitTextByBytes } from "@/lib/utils";
import type { NormalizedEvent } from "../parser";

// Meta caps /me/messages text at 1000 UTF-8 bytes. Keep a safety margin
// so accents and emojis never push a chunk over the cliff.
const MAX_MESSAGE_BYTES = 950;

export async function handleComment(event: NormalizedEvent) {
  if (event.type !== "COMMENT") return;

  if (event.accountId === event.fromId) return;

  await upsertCommentFromWebhook({
    accountId: event.accountId,
    mediaId: event.mediaId,
    commentId: event.commentId,
    fromId: event.fromId,
    fromUsername: event.fromUsername,
    text: event.text,
  }).catch((err) => {
    console.error("[sorteio] Falha ao persistir comentário", err);
  });

  const integration = await getIntegration(event.accountId);

  if (!integration?.organizationId) return;

  const matcher = await matchKeyword(event.text, integration.organizationId);

  if (!matcher?.automationId) return;

  const automation = await getKeywordAutomation(matcher.automationId, false);

  if (!automation?.active || !automation.listeners) return;

  const post = await getKeywordPost(event.mediaId, matcher.automationId);

  if (!post) return;

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

        await sendPrivateMessage(
          event.accountId,
          event.commentId,
          chunks[0],
          token,
        );

        if (chunks.length > 1) {
          for (let i = 1; i < chunks.length; i++) {
            await sendDM(event.accountId, event.fromId, chunks[i], token);
          }
        }
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

    const chunks = splitTextByBytes(
      automation.listeners.prompt,
      MAX_MESSAGE_BYTES,
    );
    const buttons = automation.listeners.buttons?.map((b) => ({
      title: b.title,
      url: b.url,
    }));
    const lastIndex = chunks.length - 1;

    await sendPrivateMessage(
      event.accountId,
      event.commentId,
      chunks[0],
      token,
      lastIndex === 0 ? buttons : undefined,
    );

    for (let i = 1; i < chunks.length; i++) {
      await sendPrivateMessage(
        event.accountId,
        event.commentId,
        chunks[i],
        token,
        i === lastIndex ? buttons : undefined,
      );
    }

    if (automation.listeners.commentReply) {
      await sendCommentReply(
        event.commentId,
        automation.listeners.commentReply,
        token,
      );
    }
  } catch (err) {
    const handled = await handleTokenError(err, integrationId);
    if (!handled) {
      console.error("[webhook/comment] erro ao processar evento", err);
    }
  }
}
