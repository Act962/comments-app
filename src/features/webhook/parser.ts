export type NormalizedEvent =
  | {
      type: "MESSAGE";
      accountId: string;
      fromId: string;
      text: string;
      messageId: string;
    }
  | {
      type: "COMMENT";
      accountId: string;
      fromId: string;
      text: string;
      commentId: string;
      mediaId: string;
    };

export function parseWebhook(payload: any): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];

  for (const entry of payload.entry ?? []) {
    // MESSAGES
    if (entry.messaging) {
      for (const msg of entry.messaging) {
        if (!msg.message?.text) continue;
        if (msg.message.is_echo) continue;

        events.push({
          type: "MESSAGE",
          accountId: entry.id,
          fromId: msg.sender.id,
          text: msg.message.text,
          messageId: msg.message.mid,
        });
      }
    }

    // COMMENTS
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field !== "comments") continue;

        events.push({
          type: "COMMENT",
          accountId: entry.id,
          fromId: change.value.from.id,
          text: change.value.text,
          commentId: change.value.id,
          mediaId: change.value.media.id,
        });
      }
    }
  }

  return events;
}
